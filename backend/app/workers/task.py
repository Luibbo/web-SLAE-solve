from ..api.v1.tasks import celery_app

if __name__ == "__main__":
    celery_app.worker_main()