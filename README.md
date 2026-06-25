# Solve Complex Task

A service for running heavy computational tasks in the background with real-time monitoring.

---

## About

**Solve Complex Task** is a web platform built to solve the problem of UI blocking during heavy mathematical operations.

It lets users create resource-intensive tasks (for example, solving large systems of linear equations) that are delegated to background processes for execution.

**Key features:**
* **Asynchronous:** Heavy computations don't affect the responsiveness of the web interface.
* **Real-time progress:** Users see the completion percentage and the estimated time to finish thanks to a WebSocket connection.
* **Security:** Registration and authorization via JWT tokens.
* **History:** All tasks, their parameters, and their results are persisted.

---

## Tech Stack

The project is built on a modern Python stack using microservice patterns.

* **Language:** Python 3.11+
* **API Framework:** FastAPI (Async)
* **Background Tasks:** Celery
* **Broker & Cache:** Redis
* **Database:** PostgreSQL
* **Containerization:** Docker, Docker Compose
* **Web Server:** Nginx

**Key implementation details:**
* Load balancing across API instances.
* Dedicated workers (separate containers for computation).
* Database migrations (Alembic).
* SSL encryption (HTTPS).

---

## Architecture

The system is designed for scalability and fault tolerance:

* **FastAPI1 and FastAPI2:** Two identical containers running the main application. This implements horizontal scaling to handle a larger number of HTTP requests.
* **Nginx:** Acts as a reverse proxy and load balancer. It accepts incoming traffic, handles SSL termination, and distributes requests between `FastAPI1` and `FastAPI2`.
* **Redis:**
    * Message broker for Celery (the task queue).
    * Pub/Sub mechanism for delivering task execution statuses to WebSocket channels in real time.
* **PostgreSQL:** Relational database for storing users and task metadata.
* **Worker:** A separate Celery container dedicated solely to "chewing through" heavy mathematical tasks, so it doesn't load the main API services.
* **PgAdmin:** Web interface for database administration.
* **Docker Compose:** Orchestrator that brings up and connects all services into a single network.

<img width="495" height="692" alt="image" src="https://github.com/user-attachments/assets/1caf7fdf-6351-45cf-a5ab-acc9832efd21" />

---

## Design Decisions

Why the infrastructure is set up the way it is:

1.  **Why two FastAPI containers?**
    For fault tolerance and load distribution. If one container goes down or gets overloaded, Nginx redirects the request to the other.

2.  **Why is `RUN_MIGRATIONS` set to "true" on only one instance?**
    The `RUN_MIGRATIONS` environment variable controls whether database migrations (Alembic) run on startup. It is enabled only on `fastapi1` to avoid a race condition where two services try to modify the database schema simultaneously, which could cause errors.

3.  **Why `prefetch-multiplier=1` for the worker?**
    This Celery setting forces a worker to take exactly one task from the queue at a time. Since tasks are heavy and long-running (CPU-bound), we don't want a single worker to "reserve" several tasks in advance and block other workers from executing them.

4.  **Why `pool=solo`?**
    The `solo` execution pool is used so a task runs in the same process without forking child processes. This reduces resource overhead and simplifies monitoring for single heavy computations.

5.  **How does SSL work?**
    Self-signed certificates generated locally are used. Nginx is configured to listen on port 443, encrypt the traffic, and proxy it to the applications' internal HTTP ports.

---

## Running the Project

### Prerequisites

* [Docker](https://docs.docker.com/get-docker/) and Docker Compose.
* Ports `80`, `443`, and `5050` free on the local machine.

### Steps

1.  **Clone the repository**
    ```bash
    git clone <repo_url>
    cd web-SLAE-solve
    ```

2.  **Configure environment variables**
    The infrastructure lives in the `backend/` directory. Move into it and create a `.env` file based on `.env.example`:
    ```bash
    cd backend
    cp .env.example .env
    ```

3.  **Start the containers**
    Run the build-and-start command from the `backend/` directory. Replace `N` with the desired number of workers, e.g. `--scale worker=3`:
    ```bash
    docker-compose up --scale worker=N -d --build
    ```

    > **Note:** on newer Docker versions the command is written with a space — `docker compose ...`.

### Available Ports

| Service | Address |
| --- | --- |
| Web UI / API (HTTPS) | `https://localhost` (port 443) |
| Web UI / API (HTTP) | `http://localhost` (port 80) |
| PgAdmin | `http://localhost:5050` |

> **SSL:** Self-signed certificates are used, so the first time you open `https://localhost` the browser will show a security warning. This is expected — accept the certificate and continue.

### Useful Commands

```bash
docker-compose ps              # list running containers
docker-compose logs -f         # follow logs from all services
docker-compose logs -f worker  # follow worker logs only
docker-compose down            # stop and remove containers
docker-compose down -v         # also remove volumes (wipes the database)
```

---

## Directory Structure

A brief overview of how the code is organized:

* **`app/`**: Main directory with the Python source code.
    * Contains the API logic (routes), security setup (auth), data models (models/schemas), and the computation business logic.
* **`nginx.conf`**: Nginx configuration file (proxy, SSL, and upstream settings).
* **`docker-compose.yml`**: Description of the infrastructure — services, networks, and volumes.

---

## Frontend / UI

An overview of the user interface:

1.  **Sign Up / Login**
    Authorization page. The user enters an email and password to obtain a JWT access token.

2.  **Create Task**
    New task creation page. The user specifies the matrix size (`n`) and fills in the data (matrix A and vector b) for the calculation.

3.  **Task Details**
    Active task page. Shows execution progress as a percentage, the estimated time to completion, the algorithm complexity metric (`O(n^3)`), and a cancel button. The status updates in real time.

4.  **Task History**
    A list of all of the user's tasks. Lets you review the status of each task (Completed/Running) and the detailed computation results for finished tasks.
