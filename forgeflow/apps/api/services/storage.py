import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent.parent / "data" / "forgeflow.db"

def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                idea TEXT NOT NULL,
                stack TEXT NOT NULL,
                team_size INTEGER,
                deadline TEXT,
                constraints TEXT,
                status TEXT DEFAULT 'pending',
                artifacts TEXT DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.commit()

def create_project(idea: str, stack: str, team_size: int, deadline: str, constraints: str) -> dict:
    project_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    # derive a short title from first sentence of idea
    title = idea.split(".")[0][:80]
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (project_id, title, idea, stack, team_size, deadline, constraints,
             "pending", "{}", now, now)
        )
        conn.commit()
    return get_project(project_id)

def get_project(project_id: str) -> Optional[dict]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
    if not row:
        return None
    d = dict(row)
    d["artifacts"] = json.loads(d["artifacts"])
    return d

def list_projects() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM projects ORDER BY created_at DESC").fetchall()
    result = []
    for row in rows:
        d = dict(row)
        d["artifacts"] = json.loads(d["artifacts"])
        result.append(d)
    return result

def update_project_status(project_id: str, status: str):
    now = datetime.utcnow().isoformat()
    with get_conn() as conn:
        conn.execute(
            "UPDATE projects SET status=?, updated_at=? WHERE id=?",
            (status, now, project_id)
        )
        conn.commit()

def update_artifacts(project_id: str, artifacts: dict):
    now = datetime.utcnow().isoformat()
    with get_conn() as conn:
        conn.execute(
            "UPDATE projects SET artifacts=?, updated_at=? WHERE id=?",
            (json.dumps(artifacts), now, project_id)
        )
        conn.commit()
