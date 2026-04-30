# Recursive Tree Structure Application

A modern, responsive web application for managing hierarchical tree structures. Users can create nodes, add children, update data, and export the entire tree as a nested JSON structure.

## Features

- **Recursive Rendering**: Infinite depth tree structure support.
- **Dynamic Management**: Add, edit, and delete nodes at any level.
- **Data Persistence**: Integrated with a Django-based backend API.
- **JSON Export**: Export the current tree state into a clean, simplified JSON format.
- **Responsive UI**: Built with React and TailwindCSS for a premium look and feel.
- **Loading States**: Visual feedback during initial data fetch and export processing.

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS.
- **Backend**: Django, Django Rest Framework.
- **Database**: SQLite (Default) or PostgreSQL (Configurable).

---

## Local Setup Guide

### 1. Prerequisites

- Node.js (v18 or higher)
- Python (v3.10 or higher)
- npm or yarn

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ../tree-backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the Django server:
   ```bash
   python manage.py runserver
   ```
   The backend will be running at `http://127.0.0.1:8000`.

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../tree-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## API Endpoints

- `GET /api/tree/`: Fetch root nodes or all nodes (if `?all=true`).
- `GET /api/tree/?parent_id=<id>`: Fetch children of a specific node.
- `POST /api/tree/`: Create a new node.
- `PUT /api/tree/?id=<id>`: Update an existing node.
- `DELETE /api/tree/?id=<id>`: Delete a node and its children.

---

## Deployment

The project includes a GitHub Actions workflow for automated deployment to a VPS using Docker. See `.github/workflows/deploy.yml` for configuration details.
