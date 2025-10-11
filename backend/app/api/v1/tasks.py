from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.responses import JSONResponse
import redis
import redis.asyncio as aioredis
from typing import List
from sqlalchemy.orm import Session
from app.schemas.task import TaskCreate, TaskOut
from app.models.user import User
from app.models.task import Task, TaskStatus
from app.db.session import SessionLocal
from app.db.dependency import get_db
from app.core.config import MAX_CONCURRENT_TASKS_PER_USER, MAX_COMPLEXITY, MAX_ESTIMATED_SECONDS, REDIS_URL, CELERY_BROKER, CELERY_BACKEND, SECRET_KEY, ALGORITHM
from celery import Celery
from app.api.v1.auth import get_current_user
from app.utils.utility import compute_complexity
import uuid
import json
from jose import jwt
import time
from datetime import datetime, timezone
import random
router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

# Redis clients
redis_sync = redis.from_url(REDIS_URL)
redis_async = aioredis.from_url(REDIS_URL)

# Celery app
celery_app = Celery("tasks", broker=CELERY_BROKER, backend=CELERY_BACKEND)

@router.post("", status_code=201)
def create_task(payload: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    active = db.query(Task).filter(Task.user_id == current_user.id, Task.status.in_([TaskStatus.PENDING, TaskStatus.RUNNING])).count()
    if active >= MAX_CONCURRENT_TASKS_PER_USER:
        raise HTTPException(status_code=429, detail="too_many_concurrent_tasks")

    if "n" not in payload.params and "values" not in payload.params:
        n = 100
        payload.params["n"] = n
        payload.params["values"] = [[random.randint(0, 10) for _ in range(n)] for _ in range(n)]

    complexity, est = compute_complexity(payload.params)
    if complexity > MAX_COMPLEXITY or est > MAX_ESTIMATED_SECONDS:
        raise HTTPException(status_code=400, detail="task_too_complex")

    task_id = str(uuid.uuid4())
    task = Task(id=task_id, user_id=current_user.id, params=payload.params, status=TaskStatus.PENDING, complexity_metric=complexity, estimated_seconds=est)
    db.add(task)
    db.commit()
    db.refresh(task)

    celery_app.send_task("fastapi_long_tasks_example.run_task", args=[task_id])
    
    return {"task_id": task_id}


@router.get("", response_model=List[TaskOut])
def list_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Task).filter(Task.user_id == current_user.id).order_by(Task.created_at.desc()).all()
    return [TaskOut(**{"id": r.id, 
                       "status": r.status, 
                       "progress": r.progress, 
                       "complexity_metric": r.complexity_metric, 
                       "estimated_seconds": r.estimated_seconds, 
                       "created_at": r.created_at, 
                       "started_at": r.started_at, 
                       "finished_at": r.finished_at}) for r in rows]


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="task_not_found")
    return TaskOut(**{"id": task.id,
                      "status": task.status, 
                      "progress": task.progress, 
                      "complexity_metric": task.complexity_metric, 
                      "estimated_seconds": task.estimated_seconds, 
                      "created_at": task.created_at, 
                      "started_at": task.started_at, 
                      "finished_at": task.finished_at})


@router.delete("/{task_id}")
def cancel_task(task_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="task_not_found")
    if task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
        return {"status": "not_cancelable"}
    task.status = TaskStatus.CANCELLED
    task.cancelled_at = datetime.now(timezone.utc)
    db.commit()

    redis_sync.publish(f"task:{task_id}", json.dumps({"status": "cancelled", "progress": task.progress}))
    return {"status": "cancelled"}


@router.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str, token: str = None):
    # token can be passed as query param: ?token=...
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload.get("sub")
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    finally:
        db.close()
 
    await websocket.accept()
    channel = f"task:{task_id}"
    try:
        pubsub = redis_async.pubsub()
        await pubsub.subscribe(channel)
    # send last-known state from DB
        db = SessionLocal()
        try:
            task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
            if not task:
                await websocket.send_text(json.dumps({"error": "task_not_found"}))
                await websocket.close()
                return
            print(f"Sending status: {task.status} and progress: {task.progress}")
            await websocket.send_text(json.dumps({"status": task.status, "progress": task.progress}))
        finally:
            db.close()


        async for message in pubsub.listen():
    # message: {'type': 'message', 'channel': b'task:...','data': b'...'}
            if message is None:
                continue
            if message.get("type") != "message":
                continue
            data = message.get("data")
            if isinstance(data, bytes):
                text = data.decode('utf-8')
            else:
                text = str(data)
            await websocket.send_text(text)
    except WebSocketDisconnect:
        try:
            await pubsub.unsubscribe(channel)
            await pubsub.close()
        except Exception:
            pass
    except Exception:
        try:
            await pubsub.unsubscribe(channel)
            await pubsub.close()
        except Exception:
            pass
        await websocket.close()



@celery_app.task(name="fastapi_long_tasks_example.run_task")
def run_task(task_id: str):
    # This runs in worker process
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return
        print(f"Starting task: {task_id}")

    # re-check complexity
        if task.complexity_metric > MAX_COMPLEXITY:
            task.status = TaskStatus.REJECTED
            db.commit()
            redis_sync.publish(f"task:{task_id}", json.dumps({"status": TaskStatus.REJECTED}))
            return
        
        print(f"Task {task_id} complexity ok")
        task.status = TaskStatus.RUNNING
        task.started_at = datetime.now(timezone.utc)
        db.commit()


        # Simulate work split into steps; check for cancellation
        steps = max(5, min(100, int(task.complexity_metric // 100 + 1)))
        for i in range(steps):
        # check cancellation flag in DB
            db.expire(task)
            task = db.query(Task).filter(Task.id == task_id).first()
            if task.status == TaskStatus.CANCELLED:
                redis_sync.publish(f"task:{task_id}", json.dumps({"status": TaskStatus.CANCELLED, "progress": task.progress}))
                return
            # perform a chunk of work (replace with actual computation)
            time.sleep(max(0.01, task.estimated_seconds / steps))
            progress = int((i + 1) / steps * 100)
            task.progress = progress
            db.commit()
            redis_sync.publish(f"task:{task_id}", json.dumps({"progress": progress}))


    # finished
        task.status = TaskStatus.COMPLETED
        task.progress = 100
        task.finished_at = datetime.now(timezone.utc)
        task.result_location = f"/results/{task_id}.json" # placeholder
        db.commit()
        redis_sync.publish(f"task:{task_id}", json.dumps({"status": TaskStatus.COMPLETED, "progress": 100, "result": task.result_location}))
    except Exception as e:
        try:
            task.status = TaskStatus.FAILED
            task.error_message = str(e)
            db.commit()
            redis_sync.publish(f"task:{task_id}", json.dumps({"status": TaskStatus.FAILED, "error": str(e)}))
        except Exception:
            pass
    finally:
        db.close()