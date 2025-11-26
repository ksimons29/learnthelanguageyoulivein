import datetime


GRADE_QUALITY = {
    "again": 0,
    "hard": 3,
    "good": 4,
    "easy": 5,
}


def initial_state(now: datetime.datetime | None = None) -> dict:
    now = now or datetime.datetime.utcnow()
    return {
        "repetition": 0,
        "interval_days": 0,
        "easiness_factor": 2.5,
        "next_review_at": now.isoformat(),
    }


def apply_review(card: dict, grade: str, now: datetime.datetime | None = None) -> dict:
    """Return updated SRS fields for a graded card."""
    now = now or datetime.datetime.utcnow()
    quality = GRADE_QUALITY.get(grade, 0)
    repetition = card["repetition"]
    interval_days = card["interval_days"]
    ef = card["easiness_factor"]

    if quality < 3:
        repetition = 0
        interval_days = 1
    else:
        if repetition == 0:
            interval_days = 1
        elif repetition == 1:
            interval_days = 3
        else:
            interval_days = round(interval_days * ef) or 1
        repetition += 1
        ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        ef = max(1.3, ef)

    next_review_at = (now + datetime.timedelta(days=interval_days)).isoformat()
    return {
        "repetition": repetition,
        "interval_days": interval_days,
        "easiness_factor": ef,
        "next_review_at": next_review_at,
    }
