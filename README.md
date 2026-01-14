## Infinite Locus (group-1)

Collaborative document editor with real-time editing and OTP-based email verification.

### 1. Tech stack

- **Frontend**: React 18, Vite, React Router, Socket.IO client, React Toastify
- **Backend**: Node.js, Express, Socket.IO, MongoDB (Mongoose), JWT, Nodemailer
- **Build/Tooling**: Vite (frontend), npm scripts, ES modules

### 2. Project structure

- **`frontend/`**: React SPA
  - **Routing**: `App.jsx` + `PrivateRoutes`
  - **Auth pages**: `Login`, `Register`, `VerifyEmail`
  - **Main pages**: `DocumentHome`, `EditDocument`, collaborative editor
  - **Context**:
    - `authContext` → logged-in user + token
    - `supplierContext` → socket instance, current doc, loading, dark mode
  - **Helpers**:
    - `helpers/auth` → login, register, OTP verify, localStorage with expiry
    - `helpers/docs` → document CRUD and collaborators
    - `helpers/config` → API base URL (`API`)
- **`backend/`**: API + WebSocket server
  - **Auth**: register, login, `/me`, OTP verification
  - **Documents**: create, list, delete, collaborators, real-time content
  - **Sockets**: join/leave rooms, cursors, text changes, save/load doc
  - **Utils**:
    - `dbConnect` → MongoDB connection
    - `email` + `emailTemplate` → OTP mailer and HTML templates

---

### 3. Environment variables

#### Backend (`backend/.env`)

Copy from `backend/env.example` and adjust:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8080
# Allowed origins (comma-separated)
CORS_ORIGIN=http://localhost:5173
BACKEND_URL=http://localhost:8080/api/v1
FRONTEND_URL=http://localhost:5173
EMAIL=your_gmail_address
PASSWORD=your_app_password_or_smtp_password
```

- **`BACKEND_URL`**: base API URL (used in some emails if you ever re-enable link flows).
- **`FRONTEND_URL`**: URL of the React app (used in success email template).
- **`EMAIL` / `PASSWORD`**: credentials for Nodemailer (Gmail or other provider).

#### Frontend (`frontend/.env` — optional)

Copy from `frontend/env.example` if needed:

```bash
VITE_APP_BACKEND_URL=/api/v1
VITE_APP_SOCKET_URL=/
```

- In **local dev**, you can rely on defaults because Vite proxies to the backend.
- In **separate deployments**, point to your backend domain:

```bash
VITE_APP_BACKEND_URL=https://your-backend.example.com/api/v1
VITE_APP_SOCKET_URL=https://your-backend.example.com
```

---

### 4. Running the app in development

The frontend talks to the backend through a Vite proxy:

- **REST API**: `/api/*` → `http://localhost:8080`
- **Socket.IO**: `/socket.io` → `http://localhost:8080`

#### Step 1: Start backend

```bash
cd backend
npm install
npm run dev
```

#### Step 2: Start frontend

```bash
cd frontend
npm install
npm run dev
```

- Open the app at **`http://localhost:5173`**.

---

### 5. Auth & email verification (OTP-based)

- **Registration flow**
  - User submits **username, email, password**.
  - Backend:
    - Validates uniqueness of email and username.
    - Hashes password with bcrypt.
    - Generates a **6-digit OTP** valid for **10 minutes**.
    - Stores `verificationCode` and `verificationCodeExpires` on the user.
    - Sends OTP via email using Nodemailer.
  - Frontend:
    - After successful registration, user is redirected to `/verify-email`.

- **OTP verification**
  - User enters **email + OTP** on `/verify-email`.
  - Frontend calls `POST /api/v1/users/verify-otp`.
  - Backend:
    - Verifies user exists and is not already verified.
    - Checks OTP matches and is not expired.
    - Sets `isVerified = true` and clears OTP fields.
  - After success, user is redirected to **login**.

- **Login**
  - Only works if `isVerified` is `true`.
  - Backend returns JWT token (1h expiry) and user data.
  - Frontend stores auth data in localStorage with expiry and in `authContext`.

---

### 6. Real-time document collaboration

- **Document operations (REST)**
  - Create a new doc (private by default).
  - List logged-in user’s docs.
  - Delete docs.
  - Add collaborators and view collaborators list.

- **Real-time editing (Socket.IO)**
  - Each document corresponds to a **room**.
  - Users join a room, and:
    - Broadcast cursor positions.
    - Broadcast text changes using Quill deltas.
    - Persist document content via `save-doc` events.
  - When a user joins:
    - Backend loads the document content.
    - Emits `load-document` with current content to the room.

---

### 7. Production (single-server deployment)

In production, the backend serves:

- **API** under `/api/v1/*`
- **Built frontend** from `frontend/dist`

#### Build (from repo root)

```bash
npm run build
```

- This:
  - Builds the React app into `frontend/dist`.
  - Installs backend dependencies.

#### Start (from repo root)

```bash
npm start
```

- This:
  - Runs the Express server in **production mode**.
  - Serves the React app and API on the same origin.
- Access the app at **`http://localhost:8080`** (or your server’s URL/port).

---

### 8. Useful npm scripts (root)

From the **project root**:

- **`npm run dev:backend`** – start backend dev server (`backend/nodemon`).
- **`npm run dev:frontend`** – start frontend dev server (`frontend/vite`).
- **`npm run build`** – build frontend and prepare backend.
- **`npm start`** – start production backend (serves API + built frontend).

You can also run scripts directly in each subfolder (`backend/`, `frontend/`) if you prefer.
