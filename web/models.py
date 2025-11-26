import os
import sqlite3
import uuid
import datetime
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "llyli.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            target_language TEXT,
            timezone TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS cards (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            phrase TEXT NOT NULL,
            meaning TEXT,
            context_tag TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            next_review_at TEXT,
            interval_days INTEGER DEFAULT 0,
            easiness_factor REAL DEFAULT 2.5,
            repetition INTEGER DEFAULT 0,
            suspended INTEGER DEFAULT 0
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS review_logs (
            id TEXT PRIMARY KEY,
            card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            reviewed_at TEXT NOT NULL,
            grade TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            payload TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def log_event(user_id: Optional[str], name: str, payload: str = ""):
    conn = get_connection()
    conn.execute(
        "INSERT INTO events (id, user_id, name, created_at, payload) VALUES (?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), user_id, name, datetime.datetime.utcnow().isoformat(), payload),
    )
    conn.commit()
    conn.close()


def create_user(email: str, password_hash: str, target_language: str, timezone: str):
    conn = get_connection()
    user_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO users (id, email, password_hash, created_at, target_language, timezone) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, email.lower(), password_hash, now, target_language, timezone),
    )
    conn.commit()
    conn.close()
    log_event(user_id, "user_signed_up")
    return get_user_by_id(user_id)


def get_user_by_email(email: str) -> Optional[sqlite3.Row]:
    conn = get_connection()
    cur = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),))
    row = cur.fetchone()
    conn.close()
    return row


def get_user_by_id(user_id: str) -> Optional[sqlite3.Row]:
    conn = get_connection()
    cur = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    return row


def create_session(user_id: str) -> str:
    token = str(uuid.uuid4())
    conn = get_connection()
    conn.execute(
        "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
        (token, user_id, datetime.datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    log_event(user_id, "login")
    return token


def get_user_by_token(token: str) -> Optional[sqlite3.Row]:
    conn = get_connection()
    cur = conn.execute(
        "SELECT users.* FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.token = ?",
        (token,),
    )
    row = cur.fetchone()
    conn.close()
    return row


def delete_session(token: str):
    conn = get_connection()
    conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()


def create_card(user_id: str, phrase: str, meaning: str, context_tag: str, srs_defaults: dict):
    conn = get_connection()
    card_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    conn.execute(
        """
        INSERT INTO cards (
            id, user_id, phrase, meaning, context_tag, created_at, updated_at,
            next_review_at, interval_days, easiness_factor, repetition, suspended
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        """,
        (
            card_id,
            user_id,
            phrase,
            meaning,
            context_tag,
            now,
            now,
            srs_defaults.get("next_review_at"),
            srs_defaults.get("interval_days", 0),
            srs_defaults.get("easiness_factor", 2.5),
            srs_defaults.get("repetition", 0),
        ),
    )
    conn.commit()
    conn.close()
    log_event(user_id, "card_created")
    return get_card(card_id, user_id)


def get_card(card_id: str, user_id: str) -> Optional[sqlite3.Row]:
    conn = get_connection()
    cur = conn.execute("SELECT * FROM cards WHERE id = ? AND user_id = ?", (card_id, user_id))
    row = cur.fetchone()
    conn.close()
    return row


def list_cards(user_id: str) -> list[sqlite3.Row]:
    conn = get_connection()
    cur = conn.execute("SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cur.fetchall()
    conn.close()
    return rows


def update_card(card_id: str, user_id: str, **fields):
    if not fields:
        return get_card(card_id, user_id)
    allowed = [
        "phrase",
        "meaning",
        "context_tag",
        "next_review_at",
        "interval_days",
        "easiness_factor",
        "repetition",
        "suspended",
    ]
    sets = []
    values = []
    for key, value in fields.items():
        if key in allowed:
            sets.append(f"{key} = ?")
            values.append(value)
    if not sets:
        return get_card(card_id, user_id)
    values.append(datetime.datetime.utcnow().isoformat())
    values.append(card_id)
    values.append(user_id)
    conn = get_connection()
    conn.execute(
        f"UPDATE cards SET {', '.join(sets)}, updated_at = ? WHERE id = ? AND user_id = ?",
        tuple(values),
    )
    conn.commit()
    conn.close()
    return get_card(card_id, user_id)


def delete_card(card_id: str, user_id: str):
    conn = get_connection()
    conn.execute("DELETE FROM cards WHERE id = ? AND user_id = ?", (card_id, user_id))
    conn.commit()
    conn.close()


def due_cards(user_id: str, limit: int = 50):
    now = datetime.datetime.utcnow().isoformat()
    conn = get_connection()
    cur = conn.execute(
        """
        SELECT * FROM cards
        WHERE user_id = ? AND suspended = 0 AND (next_review_at IS NULL OR next_review_at <= ?)
        ORDER BY next_review_at ASC
        LIMIT ?
        """,
        (user_id, now, limit),
    )
    rows = cur.fetchall()
    conn.close()
    return rows


def log_review(user_id: str, card_id: str, grade: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO review_logs (id, card_id, user_id, reviewed_at, grade) VALUES (?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), card_id, user_id, datetime.datetime.utcnow().isoformat(), grade),
    )
    conn.commit()
    conn.close()
    log_event(user_id, "review_graded", payload=grade)


def reviewed_today_count(user_id: str) -> int:
    now = datetime.datetime.utcnow()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    conn = get_connection()
    cur = conn.execute(
        "SELECT COUNT(*) as c FROM review_logs WHERE user_id = ? AND reviewed_at >= ?",
        (user_id, start_of_day.isoformat()),
    )
    row = cur.fetchone()
    conn.close()
    return row["c"] if row else 0


def stats_overview(user_id: str) -> dict:
    conn = get_connection()
    cur = conn.execute("SELECT COUNT(*) as c FROM cards WHERE user_id = ?", (user_id,))
    total_cards = cur.fetchone()["c"]

    seven_days_ago = (datetime.datetime.utcnow() - datetime.timedelta(days=7)).isoformat()
    cur = conn.execute(
        "SELECT COUNT(*) as c FROM cards WHERE user_id = ? AND created_at >= ?",
        (user_id, seven_days_ago),
    )
    added_last_7 = cur.fetchone()["c"]

    now_iso = datetime.datetime.utcnow().isoformat()
    cur = conn.execute(
        "SELECT COUNT(*) as c FROM cards WHERE user_id = ? AND suspended = 0 AND (next_review_at IS NULL OR next_review_at <= ?)",
        (user_id, now_iso),
    )
    due_today = cur.fetchone()["c"]
    conn.close()

    return {
        "total_cards": total_cards,
        "cards_added_last_7_days": added_last_7,
        "due_today": due_today,
        "reviewed_today": reviewed_today_count(user_id),
    }
