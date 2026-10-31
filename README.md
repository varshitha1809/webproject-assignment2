# CampusPulse — Your campus, in sync ✳

**Assignment-2 project** using Node.js, Express.js, MongoDB and Docker.

CampusPulse is a creative campus-life engagement platform. Instead of being only a standard academic dashboard, it brings student activities and everyday campus services into one cheerful, community-first interface.

## What makes it different?

- **Discover events:** view upcoming workshops, culture nights, sports and career activities; create events.
- **Lost & found:** post found/lost items and mark items as claimed.
- **Campus fixes:** report Wi-Fi, maintenance, cleanliness and safety issues; update issue status.
- **Community corner:** browse campus clubs and meeting times.
- **Live overview:** summary counts and upcoming events are loaded from MongoDB via Express APIs.
- Responsive design, custom illustration, pastel visual system, dark mode and toast feedback.
- Docker Compose runs the Express app and MongoDB with a persistent named volume.
- Demo records are seeded automatically on first run.

## Run with Docker (recommended)

Requirements: Docker Desktop or Docker Engine + Docker Compose.

```bash
docker compose up --build
```

Open **http://localhost:3000**.

Stop with `Ctrl+C`. To stop and remove containers (while keeping the database volume):

```bash
docker compose down
```

To remove containers **and erase the saved database data**:

```bash
docker compose down -v
```

## Run without Docker

Requires Node.js 20+ and MongoDB.

```bash
cp .env.example .env
npm install
npm start
```

## REST API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | App and database health |
| GET | `/api/dashboard` | Overview counts and latest records |
| GET | `/api/events` | List upcoming events |
| POST | `/api/events` | Create an event |
| GET | `/api/lost-found` | List/search lost-and-found items |
| POST | `/api/lost-found` | Create a lost/found post |
| PATCH | `/api/lost-found/:id/claim` | Mark an item claimed |
| GET | `/api/issues` | List campus issues |
| POST | `/api/issues` | Report an issue |
| PATCH | `/api/issues/:id` | Update issue status |
| GET | `/api/clubs` | List campus communities |
| POST | `/api/clubs` | Create a community |

### Example request

```bash
curl -X POST http://localhost:3000/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Broken light near the gate",
    "location": "North entrance",
    "category": "Safety",
    "description": "The path light is not working after sunset.",
    "reportedBy": "Campus member",
    "priority": "High"
  }'
```

## Structure

```text
campuspulse/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── models/
│   │   ├── Event.js
│   │   ├── LostItem.js
│   │   ├── Issue.js
│   │   └── Club.js
│   └── seed.js
├── server.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
└── package.json
```

## Explain the stack in your viva

- **Node.js** runs the server-side JavaScript.
- **Express.js** serves the web app and exposes REST endpoints.
- **MongoDB** stores event, lost-item, issue and club documents.
- **Mongoose** provides schemas and validation for MongoDB documents.
- **Docker** packages the app; **Docker Compose** starts the app and database together.
- The frontend uses `fetch()` to call the API, and the dashboard values are populated from the database.

## Future scope

Add student login, admin/moderator roles, event registration limits, email notifications, image uploads, campus maps and automated issue-priority rules. This demo uses sample data and is not intended for real student personal information without authentication and access controls.
