# 🧮 Bill & Tip Splitter – Full Stack Web Application

A full-stack web application designed for splitting restaurant bills, calculating tip options dynamically per person, and persisting calculation history.

Built as a school final project using **Angular 17**, **Python FastAPI**, and **PostgreSQL (SQL)**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Angular 17 (Standalone Architecture)
- **State Management:** Angular Signals (`signal`, `computed`)
- **HTTP Client:** Angular `HttpClient` & Reactive Data Binding
- **Styling:** Custom CSS with modern card UI layout & FontAwesome icons

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **ORM / Database Layer:** SQLAlchemy
- **Data Validation:** Pydantic
- **Server:** Uvicorn ASGI Server

### Database
- **Database Engine:** PostgreSQL (Managed via pgAdmin 4 / Homebrew Postgres)
- **Tables:** `bills`

---

## 🏗️ System Architecture

```text
  [ Angular 17 Frontend ]
    (Port 4200)
         │
         │  HTTP POST / GET Requests (JSON)
         ▼
   [ FastAPI Backend ]
    (Port 8000)
         │
         │  SQLAlchemy ORM
         ▼
[ PostgreSQL Database ] ─── (Visualized in pgAdmin 4)
 (Database: bill_splitter)