# Solve Complex Task 

**A robust service for performing complex computational tasks in the background with real-time monitoring.**

-----

##  About the Service

**Solve Complex Task** is a web platform designed to solve the problem of interface blocking during heavy mathematical operations.

The service allows users to create resource-intensive tasks (e.g., solving large systems of linear equations) which are delegated to background processes for execution.

**Key Capabilities:**

  * **Asynchronous Processing:** Heavy calculations do not affect the responsiveness of the web interface.
  * **Real-time Progress:** Users see the completion percentage and estimated time remaining via WebSocket connections.
  * **Security:** Registration and authentication via JWT tokens.
  * **History:** Persistent storage of all tasks, their parameters, and calculation results.

-----

##  Technology Stack

The project is built on a modern Python stack utilizing microservice patterns.

**Backend**

  * **Language:** Python 3.11+
  * **API Framework:** FastAPI (Async)
  * **Background Tasks:** Celery
  * **Broker & Cache:** Redis
  * **Database:** PostgreSQL
  * **Containerization:** Docker, Docker Compose
  * **Web Server:** Nginx

**Frontend**

  * **Language:** JavaScript
  * **Framework:** React

**Key Implementation Features:**

  * **Load Balancing:** Distributes traffic between API instances.
  * **Dedicated Workers:** Isolated containers for computations.
  * **Database Migrations:** Managed by Alembic.
  * **SSL Encryption:** HTTPS support via Nginx.

-----

##  Architecture

The system is designed for scalability and fault tolerance:

<img width="476" height="718" alt="image" src="https://github.com/user-attachments/assets/eaa6f30c-d6f6-4202-9774-4d2afa8af787" />


  * **FastAPI1 & FastAPI2:** Two identical containers running the main application. This implements **horizontal scaling** to handle a higher volume of HTTP requests.
  * **Nginx:** Acts as a Reverse Proxy and Load Balancer. It accepts incoming traffic, handles SSL termination, and distributes requests between `FastAPI1` and `FastAPI2`.
  * **Redis:**
      * Message Broker for Celery (Task Queue).
      * Pub/Sub mechanism for pushing task status updates to WebSocket channels in real-time.
  * **PostgreSQL:** Relational database for storing user data and task metadata.
  * **Worker:** A dedicated container running Celery that exclusively processes ("crunches") heavy mathematical tasks without burdening the main API services.
  * **PgAdmin:** Web interface for database administration.
  * **Docker Compose:** Orchestrator that spins up and links all services into a unified network.

-----

##  Technical Decisions & Rationale

Why the infrastructure is configured this way:

1.  **Why two FastAPI containers?**
    To ensure fault tolerance and load distribution. If one container fails or becomes overloaded, Nginx redirects requests to the other.

2.  **Why is `RUN_MIGRATIONS` set to "true" on only one instance?**
    The `RUN_MIGRATIONS` environment variable controls database migrations (Alembic) at startup. It is enabled only on `fastapi1` to avoid a **race condition** where two services simultaneously try to alter the DB structure, which could lead to errors.

3.  **Why `prefetch-multiplier=1` for the Worker?**
    This Celery setting forces the worker to take exactly one task at a time from the queue. Since the tasks are heavy and long-running (CPU-bound), we do not want one worker to "reserve" multiple tasks in advance, blocking them from being picked up by other potential workers.

4.  **Why `pool=solo`?**
    The `solo` execution pool is used so that tasks run in the same process without creating child processes (forking). This reduces resource overhead and simplifies monitoring for single, heavy computations.

5.  **How does SSL work?**
    The system uses self-signed certificates generated locally. Nginx is configured to listen on port 443, encrypt traffic, and proxy it to the internal HTTP ports of the applications.

-----

##  Getting Started

To deploy the project locally:

1.  **Clone the Repository**

    ```bash
    git clone <repo_url>
    ```

2.  **Environment Configuration**
    Create a `.env` file based on the provided `.env.example`.

3.  **Run Containers**
    Execute the command to build and start the services:

    ```bash
    docker-compose up --scale worker=N -d --build
    ```

    *(Replace `N` with the number of desired workers)*

4.  **Access Points**

      * **Web UI / API:** `https://localhost` (Port 443) or `http://localhost` (Port 80)
      * **PgAdmin:** `http://localhost:5050`

-----

##  Directory Structure

A brief overview of the code organization:

  * **`app/`**: Main Python source code directory.
      * Contains API logic (`routes`), security settings (`auth`), data models (`models`/`schemas`), and computation business logic.
  * **`nginx.conf`**: Configuration file for Nginx (proxy settings, SSL, upstreams).
  * **`docker-compose.yml`**: Infrastructure description, defining services, networks, and volumes.

-----

##  Frontend / UI

User Interface Overview:

### 1\. Sign Up / Login

Authentication page. Users enter Email and Password to receive a JWT access token.

<img width="1900" height="912" alt="image" src="https://github.com/user-attachments/assets/1c8643ad-17ed-4ca6-acec-8b0a210dde3b" />

### 2\. Create Task

New task creation page. The user specifies the matrix size ($n$) and fills in the data (Matrix A and Vector b) for calculation.

<img width="1897" height="903" alt="image" src="https://github.com/user-attachments/assets/ff36cf5e-534c-41c2-be64-545fa5d35f45" />

### 3\. Task Details

Active task page. Displays progress percentage, estimated time to completion, algorithm complexity metrics ($O(n^3)$), and a cancel button. Status updates in real-time.

<img width="1916" height="905" alt="image" src="https://github.com/user-attachments/assets/13a35071-b93d-47cc-8767-0a70d4d1ebfd" />

### 4\. Task History

A general list of all user tasks. Allows viewing the status of every task (Completed/Running) and detailed calculation results for finished tasks.

<img width="1918" height="911" alt="image" src="https://github.com/user-attachments/assets/e25d650e-38ed-429f-a2a5-d44ffb9fbae1" />

