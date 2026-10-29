# Job Portal Backend

A modern Job Portal backend powered by PostgreSQL, Redis, Seq, and SMTP4Dev running through Docker Compose.

---

## Prerequisites

- Docker
- Docker Compose
- Node.js
- Prisma

---

## Infrastructure Services

Start all services:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://dev:dev@localhost:5432/myjobportal?schema=public"

# Redis
REDIS_URL=redis://localhost:6379

# Email (SMTP4Dev)
MAIL_HOST=localhost
MAIL_PORT=2525
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@myjobportal.com

# Seq Logging
SEQ_URL=http://localhost:5341
```

---

## Services

### PostgreSQL

| Property | Value |
|-----------|---------|
| Host | localhost |
| Port | 5432 |
| Database | myjobportal |
| Username | dev |
| Password | dev |

Connection String:

```env
DATABASE_URL="postgresql://dev:dev@localhost:5432/myjobportal?schema=public"
```

---

### Redis

| Property | Value |
|-----------|---------|
| Host | localhost |
| Port | 6379 |

Connection String:

```env
REDIS_URL=redis://localhost:6379
```

---

### Seq

Centralized application logging.

#### URL

```text
http://localhost:5341
```

#### Credentials

```text
Username: admin
Password: test@12345
```

---

### SMTP4Dev

Local email testing server.

#### SMTP Server

```text
Host: localhost
Port: 2525
```

#### Web Interface

```text
http://localhost:3000
```

All outgoing emails can be viewed here.

SMTP4Dev does not require authentication by default.

---

## Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Create and apply migrations:

```bash
npx prisma migrate dev --name init
```

---

## Useful Docker Commands

Start services:

```bash
docker compose up -d
```

Stop services:

```bash
docker compose down
```

Restart services:

```bash
docker compose restart
```

View logs:

```bash
docker compose logs -f
```

View logs for a specific service:

```bash
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f seq
docker compose logs -f emailserver
```

---

## Service URLs

| Service | URL |
|----------|-----|
| API | http://localhost:5000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| Seq | http://localhost:5341 |
| SMTP4Dev UI | http://localhost:3000 |
| SMTP4Dev SMTP | localhost:2525 |

---

## Docker Containers

| Container | Purpose |
|------------|---------|
| postgres | PostgreSQL Database |
| redis | Caching & Queues |
| seq | Centralized Logging |
| JobPortalEmail | Email Testing Server |

---

## First-Time Setup

```bash
# Install dependencies
npm install

# Generate prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start application
npm run dev
```

---

## Default Development Credentials

### PostgreSQL

```text
Username: dev
Password: dev
Database: myjobportal
```

### Seq

```text
Username: admin
Password: test@12345
```

### SMTP4Dev

```text
No authentication required
```