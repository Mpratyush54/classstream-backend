# School Management Backend (v1.1.0)

A production‑ready **Node.js + Express** backend powering a comprehensive **school management** platform used by **teachers** and **students** for content, streaming, notifications, admissions, and administration. It uses **MySQL** for core relational data and **MongoDB** for audits and streaming key logs. Video processing supports **DASH** with **CENC (ClearKey)** encryption and multi‑resolution transcoding.

---

## Table of Contents

* [Overview](#overview)
* [Core Features](#core-features)

  * [Authentication & Authorization](#authentication--authorization)
  * [Teacher Features](#teacher-features)
  * [Student Features](#student-features)
  * [Video Processing & Streaming](#video-processing--streaming)
  * [Real‑time Communication](#real-time-communication)
  * [Push Notifications](#push-notifications)
  * [AI & Image Recognition](#ai--image-recognition)
  * [Voting System](#voting-system)
  * [Administration](#administration)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Configuration](#configuration)
* [Database Initialization](#database-initialization)
* [Run & Deploy](#run--deploy)
* [Project Structure](#project-structure)
* [API Summary](#api-summary)
* [Security Notes](#security-notes)
* [Troubleshooting](#troubleshooting)
* [Contributing](#contributing)
* [Reporting Issues](#reporting-issues)
* [License](#license)
* [Changelog](#changelog)

---

## Overview

This backend exposes REST APIs and WebSocket endpoints for a school platform. Teachers can upload videos/notes, start live streams, and notify classes. Students can watch encrypted DASH video, read notes, join live streams, chat, and submit admissions aided by AI OCR/vision. Admins manage data and sessions.

Tech highlights: **Express**, **Socket.IO**, **MySQL**, **MongoDB (Mongoose)**, **FFmpeg**, **Bento4**, **web-push**, **OpenCV**, **OpenAI**/**Vertex AI** integration for image understanding.

---

## Core Features

### Authentication & Authorization

* Secure login with **bcryptjs**.
* **JWT** for API authorization; role‑based access (teacher/student).
* Session verification using tokens recorded in MySQL `loginlog`.
* Password reset via **nodemailer** email links.
* Mongo **LoginAudit** model logs logins/logouts, device, IP, and session state (active/revoked).

### Teacher Features

* Upload video metadata and files (supports **chunked uploads**).
* Upload and verify video thumbnails.
* Check upload/processing status; list processing/processed videos.
* Create/manage notes (rich text or **PDF**).
* Manage students (fetch/search/edit/delete) from `user_data`.
* Register new users (signup) with validation.
* Start **live streaming** sessions (generate stream keys/hashes).
* Send push notifications to classes.
* Participate in real‑time chat (Socket.IO).

### Student Features

* Fetch and view assigned notes (text/PDF) by class; dedicated PDF endpoint.
* List and stream videos (DASH with CENC ClearKey).
* View video posters/thumbnails.
* Join class live streams.
* Real‑time chat.
* Register devices for push notifications.
* Submit admission forms with image uploads; view/export submitted data.
* Manage notification device settings.
* View profile photos and signatures.

### Video Processing & Streaming

* Large file handling via **chunked upload**.
* **FFmpeg** transcodes to multiple resolutions (1080p/720p/480p).
* **Bento4** (`mp4fragment`, `mp4encrypt`, `mp4dash`) packages **MPEG‑DASH** with **MPEG‑CENC (ClearKey)**.
* Stores per‑quality KIDs/keys in MySQL `videos` (`enc_1080p_key`, `enc_1080p_kid`, etc.).
* **Secure Key Delivery**:

  * `/api/video/issue-key` issues short‑lived *dummy* keys (Mongo `VideoKeyLog`).
  * `/api/video/get-key` validates user/session/video & quality, returns actual decryption key; logs to `VideoAccessLog` & history.
* Efficient streaming with HTTP range requests.

### Real‑time Communication

* **Socket.IO** chat: join rooms, broadcast, fetch history, ban users.
* Persists chat in MySQL `chats`.
* **node-media-server** supports RTMP ingest for live.

### Push Notifications

* **web-push** with VAPID; stores subscriptions in `notification_divice_detalis`.
* Tracks messages in `notifiction` with delivery status; cleans expired endpoints.

### AI & Image Recognition

* Admission form uploads processed by **OpenAI** (e.g., `gpt-4o-mini`) to extract structured JSON per schema; statuses in MySQL `processing_data`.
* **opencv4nodejs** detects faces (Haar Cascade) and crops faces from forms.
* Optional **Python** pipeline `pp3.py` uses **Vertex AI (Gemini 1.5 Pro)** on images referenced in `processing_data`.
* Endpoints to list pending/completed jobs and serve source/cropped images.
* Utilities for **Unicode ⇄ KrutiDev 010** font conversion.

### Voting System

* `/vote` routes to upload/fetch/delete candidates and register votes (MySQL `election_head_boy`).

### Administration

* Student data: list/all/by class/by SR/UID/search/edit/delete; PDF exports.
* Notes lifecycle: create/fetch/delete.
* User management: list/search/create.
* Academic session config in `admin_data`.

---

## Prerequisites

* **Node.js** ≥ 18
* **npm** (bundled with Node)
* **MySQL** server
* **MongoDB** server
* **FFmpeg** in `PATH`
* **Bento4** tools in `PATH` (`mp4fragment`, `mp4encrypt`, `mp4dash`)
* **Python 3** (for optional `pp3.py`)
* **Google Cloud** SDK/credentials (if using Vertex AI)
* **OpenCV** libs (system) for `opencv4nodejs` *(optional but recommended)*

---

## Installation

```bash
git clone <your-repository-url>
cd <project-directory>
npm install
```

> Native modules (e.g., `sharp`, `opencv4nodejs`) may require build tools (g++, make, Python).

Create required directories (git‑ignored at runtime):

```bash
mkdir -p assets temp media logs logs/cron \
  Student_entrance_form student_photo Student_sig \
  student_adhar_back student_adhar_front unprocessed_streams
```

---

## Configuration

Create `.env` in the project root:

```dotenv
# MySQL
host=your_mysql_host
user=your_mysql_user
password=your_mysql_password
database="school"

# MongoDB
MONGO_URI=mongodb://apiuser:your_password@localhost:27017/mydb?authSource=admin

# OpenAI (optional)
OPENAI_ORG_ID=your_org_id
OPENAI_PROJECT_ID=your_project_id
OPENAI_API_KEY=your_api_key

# JWT/Crypto Secrets — generate strong unique values
crypto=REPLACE_WITH_LONG_RANDOM_STRING
refresh_token=REPLACE_WITH_LONG_RANDOM_STRING

# Web Push VAPID (optional)
# VAPID_PUBLIC_KEY=...
# VAPID_PRIVATE_KEY=...
```

**Security:** Do not commit `.env`. Rotate compromised keys immediately.

---

## Database Initialization

**MySQL**

```bash
mysql -u <user> -p -e 'CREATE DATABASE IF NOT EXISTS school;'
mysql -u <user> -p school < data.sql
```

**MongoDB**

* Ensure server is running; Mongoose will create collections from `models/`.

---

## Run & Deploy

**Development** (with `nodemon`):

```bash
npm start
```

**Production** (with `pm2`):

```bash
npm i -g pm2
pm2 start app.js --name "school-backend"
pm2 monit    # or: pm2 logs school-backend
```

**Optional AI Worker (Python / Vertex AI):**

```bash
python pp3.py
```

Ensure `Google.json` credentials are configured if using Vertex AI.

---

## Project Structure

```
.
├── ai_recognaition/               # AI image processing (OpenAI/OpenCV)
│   ├── index.js                   # Router for AI endpoints
│   ├── pending_upload.js          # List/fetch AI results, font conversion
│   ├── photo.js                   # Serve source/cropped faces
│   └── upload_and_recognation.js  # Upload + invoke AI/OpenCV
├── assets/                        # Processed media (gitignored)
├── corn/                          # Cron jobs
│   └── video_processor.js         # FFmpeg + Bento4 transcoding/encryption
├── database/
│   ├── index.js                   # MySQL pool
│   └── mongo.cjs                  # Mongoose connection
├── live/                          # Node Media Server config/files
├── login/
│   ├── forgot-password.js         # Reset tokens + email
│   ├── index.js                   # Login, JWT, session logging
│   └── json/index.json            # (Legacy) notification endpoints seed
├── media/                         # RTMP/DASH outputs (gitignored)
├── models/                        # Mongoose schemas
│   ├── LoginAudit.js
│   ├── VideoAccessLog.js
│   ├── VideoKeyCache.js           # (optional/legacy)
│   ├── VideoKeyHistory.js
│   └── VideoKeyLog.js
├── ntifcation/
│   └── index.js                   # Web-push subscriptions & send
├── student/
│   ├── Signature.js               # Signatures & Aadhaar images
│   ├── add-student.js             # CRUD + AI assisted forms
│   ├── index.js                   # Router + auth middleware
│   ├── live.js                    # Active streams for class
│   ├── notes.js                   # Class notes (text/PDF)
│   ├── notes_pdf.js               # PDF download endpoint
│   ├── photo.js                   # Student profile photos
│   ├── playvideo.js               # DASH video streaming
│   ├── setings.js                 # Notification settings (WIP)
│   ├── video_poster.js            # Video posters
│   ├── videoindex.js              # All processed videos for student
│   └── videowatch.js              # Watch-time tracking (WIP)
├── teacher/
│   ├── chat.js                    # (legacy) basic chat
│   ├── connetion_teacher.js       # Live stream setup (IDs/hashes)
│   ├── fetch_video.js             # List teacher uploads
│   ├── notes.js                   # Create text note
│   ├── notes_fetch.js             # Fetch notes
│   ├── notes_manage.js            # Delete note
│   ├── playvideo.js               # DASH streaming
│   ├── poster.js                  # Posters
│   ├── processvideo.js            # (legacy) manual processing
│   ├── signup.js                  # User list/search/create
│   ├── student-details.js         # Student CRUD/search
│   ├── upload_video_data.js       # Video metadata
│   ├── upload_video_thumnail.js   # Thumbnail upload
│   ├── upload_video_video.js      # File upload (legacy)
│   ├── upload_video_video/v2/*    # Chunked upload (init/chunk/complete)
│   └── verify_data.js             # Verify video/thumb status
├── utils/
│   ├── getKeyService.js           # Validate & return actual keys
│   └── keyManager.js              # Issue dummy keys; access rules
├── video-licensing/
│   ├── video_encryption.js        # /issue-key & /get-key routes
│   └── video_encryption_backup.js # Backup implementation
├── vote/
│   ├── delete.js
│   ├── fetch_data.js
│   ├── index.js
│   ├── upload_data.js
│   └── votefor.js
├── .env                           # Environment variables (DO NOT COMMIT)
├── .gitignore
├── app.js                         # Express app + Socket.IO
├── data.sql                       # MySQL schema & seed
├── index.json                     # (legacy) admission seed
├── package.json
├── package-lock.json
└── pp3.py                         # Vertex AI worker (optional)
```

---

## API Summary

**Base URL:** `/api`

### Auth & Account

* `POST /login` — Login, issue JWT; log session.
* `POST /forgot-password` — Start reset; verify token & update password.

### AI Processing (Admissions)

* `POST /photo/upload` — Upload image(s) for AI processing *(alias/dup)*.
* `GET  /photo/photo/:id` — Original image for a job.
* `GET  /photo/personal/:id` — Cropped face image.
* `POST /photo/upload-pending` — List pending/completed jobs.
* `POST /photo/individual` — Fetch single job result.

### Student (requires student auth headers)

* `POST /student/verify` — Verify student auth.
* `POST /student/videofetch` — List available videos.
* `POST /student/notes` — Notes for class.
* `POST /student/notes/individual` — Fetch single note.
* `GET  /student/notes/pdf/:id` — Download a note PDF.
* `POST /student/live/index` — Active live streams.
* `POST /student/live/index_main` — Details of a live stream.
* `POST /student/add-student` — CRUD admission data.
* `GET  /student/photo/student/:id` — Profile photo.
* `GET  /student/Signature/:id` — Signature image.
* `GET  /student/Signature/adhar-front/:id` — Aadhaar front.
* `GET  /student/Signature/adhar-back/:id` — Aadhaar back.
* `GET  /student/video/poster/:id` — Video poster image.

### Teacher (requires teacher auth headers)

* `POST /teacher/login-verify` — Verify teacher auth.
* `POST /teacher/videofetch` — List teacher’s videos.
* `POST /teacher/upload-data` — Upload video metadata.
* `POST /teacher/verify-upload` — Check video/thumb upload state.
* `POST /teacher/processvideo` — *(legacy)* Manual processing trigger.
* `POST /teacher/notes` — Create text note.
* `POST /teacher/notes/file` — Upload PDF note.
* `POST /teacher/notes_fetch` — List notes.
* `POST /teacher/notes_manage/delete` — Delete note.
* `POST /teacher/signup/index` — List users.
* `POST /teacher/signup/user-search` — Search user.
* `POST /teacher/signup` — Create user.
* `POST /teacher/live/live-setup/new` — Create live session.
* `POST /teacher/live/live-setup/details` — Live session details.
* `POST /teacher/fetch-details` — Student data management (all/class/PDF/search/edit).
* `POST /teacher/upload_video_thumnail/:id` — Thumbnail upload.
* `POST /teacher/upload_video_video/:id` — Video upload (legacy).
* `POST /teacher/upload_video_video/v2/init/:id` — Init chunked upload.
* `POST /teacher/upload_video_video/v2/chunk/:id/:index` — Upload chunk.
* `POST /teacher/upload_video_video/v2/complete/:id` — Complete & merge.
* `GET  /teacher/playvideo/:id` — Stream video.
* `GET  /teacher/playvideo/poster/:id` — Poster image.

### Video Licensing

* `POST /video/issue-key` — Issue temporary (dummy) keys per user/video.
* `POST /video/get-key` — Validate & return actual CENC key for a given KID/quality.

### Voting

* `POST /vote/upload-data` — Add candidate.
* `POST /vote/fetch-data` — Fetch all candidates.
* `POST /vote/fetch-data/custom` — Fetch by type/post.
* `POST /vote/delete` — Delete candidate.
* `POST /vote/vote` — Register a vote.

> **Tip:** Use standard auth headers (JWT) for protected routes; some routes also verify session token against MySQL `loginlog`.

---

## Security Notes

* **Secrets:** Keep `crypto` & `refresh_token` long and random. Rotate on suspicion of leak.
* **CORS:** Lock down allowed origins in `app.js` for production.
* **Uploads:** Validate file types (MP4/JPG/PDF) and size limits; store outside web root if served via signed routes.
* **Keys:** Never expose real CENC keys in client logs. `/issue-key` should only emit placeholders; `/get-key` returns the real key only after user/session/class validation and rate‑limits.
* **Audit:** Monitor `LoginAudit`, `VideoAccessLog`, and `VideoKeyHistory`.
* **Rate Limiting & Bans:** Apply API throttling; enforce chat bans across WebSocket + REST.

---

## Troubleshooting

* **Native builds fail** → Ensure build‑essentials and Python are installed before `npm install`.
* **FFmpeg/Bento4 not found** → Verify binaries in `PATH`; print versions with `ffmpeg -version` and `mp4dash -version`.
* **CORS errors** → Confirm response headers include your frontend origin and required headers.
* **Mongo validation errors** → Check required fields in models (e.g., `kid` for `VideoAccessLog`).
* **DASH decryption issues** → Confirm the KID/key pair for the requested quality matches the MPD and encryption logs.

---

## Contributing

1. Fork the repo.
2. Create a branch: `git checkout -b feature/my-feature` or `fix/bug-xyz`.
3. Make changes following existing style.
4. Commit: `git commit -m "feat: add X"`.
5. Push: `git push origin feature/my-feature`.
6. Open a PR with a clear description.

---

## Reporting Issues

* **Search** existing issues first.
* **New bug**: provide steps to reproduce, expected vs. actual results, logs, and environment.
* **Feature request**: describe the use case and expected behavior.

---

## License

Distributed under the **ISC License**. See `package.json` for details.

---

## Changelog

### v1.1.0

* Polished documentation and structure.
* Clarified video licensing flow and model usage.
* Documented chunked upload v2 and legacy endpoints.
* Added security and troubleshooting sections.
