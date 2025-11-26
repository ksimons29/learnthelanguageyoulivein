import os
import datetime
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, g, flash
from werkzeug.security import generate_password_hash, check_password_hash

import models
import srs

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key")

models.init_db()


# Helpers

def get_token_from_headers() -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]
    return None


def load_current_user():
    token = session.get("token") or get_token_from_headers()
    if not token:
        return None
    return models.get_user_by_token(token)


def require_login(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        if not g.user:
            return redirect(url_for("login"))
        return view_func(*args, **kwargs)

    return wrapper


def require_api_auth(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        if not g.user:
            return jsonify({"error": "Unauthorized"}), 401
        return view_func(*args, **kwargs)

    return wrapper


def login_user(user):
    token = models.create_session(user["id"])
    session["token"] = token
    return token


def logout_user():
    token = session.pop("token", None) or get_token_from_headers()
    if token:
        models.delete_session(token)


@app.before_request
def attach_user():
    g.user = load_current_user()


@app.context_processor
def inject_now():
    return {"now": datetime.datetime.utcnow()}


# HTML Routes


@app.route("/")
def index():
    if g.user:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        target_language = request.form.get("target_language", "")
        timezone = request.form.get("timezone", "UTC")
        if not email or not password:
            flash("Email and password are required.")
            return render_template("signup.html")
        if models.get_user_by_email(email):
            flash("User already exists. Please log in.")
            return render_template("signup.html")
        user = models.create_user(
            email,
            generate_password_hash(password),
            target_language,
            timezone,
        )
        login_user(user)
        return redirect(url_for("dashboard"))
    return render_template("signup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        user = models.get_user_by_email(email)
        if user and check_password_hash(user["password_hash"], password):
            login_user(user)
            return redirect(url_for("dashboard"))
        flash("Invalid credentials")
    return render_template("login.html")


@app.route("/logout")
@require_login
def logout():
    logout_user()
    return redirect(url_for("login"))


@app.route("/dashboard")
@require_login
def dashboard():
    stats = models.stats_overview(g.user["id"])
    cards = models.list_cards(g.user["id"])[:5]
    due_banner = stats["due_today"] > 0 and stats["reviewed_today"] == 0
    return render_template("dashboard.html", stats=stats, recent_cards=cards, due_banner=due_banner)


@app.route("/cards")
@require_login
def cards_list():
    cards = models.list_cards(g.user["id"])
    return render_template("cards_list.html", cards=cards)


@app.route("/cards/new", methods=["GET", "POST"])
@require_login
def card_new():
    if request.method == "POST":
        phrase = request.form.get("phrase", "").strip()
        meaning = request.form.get("meaning", "").strip()
        context_tag = request.form.get("context_tag", "other")
        if not phrase:
            flash("Phrase is required")
            return render_template("card_form.html", card=None)
        card = models.create_card(
            g.user["id"],
            phrase,
            meaning,
            context_tag,
            srs.initial_state(),
        )
        return redirect(url_for("cards_list"))
    return render_template("card_form.html", card=None)


@app.route("/cards/<card_id>/edit", methods=["GET", "POST"])
@require_login
def card_edit(card_id):
    card = models.get_card(card_id, g.user["id"])
    if not card:
        flash("Card not found")
        return redirect(url_for("cards_list"))
    if request.method == "POST":
        phrase = request.form.get("phrase", "").strip()
        meaning = request.form.get("meaning", "").strip()
        context_tag = request.form.get("context_tag", "other")
        if not phrase:
            flash("Phrase is required")
            return render_template("card_form.html", card=card)
        card = models.update_card(
            card_id,
            g.user["id"],
            phrase=phrase,
            meaning=meaning,
            context_tag=context_tag,
        )
        return redirect(url_for("cards_list"))
    return render_template("card_form.html", card=card)


@app.route("/cards/<card_id>/delete", methods=["POST"])
@require_login
def card_delete(card_id):
    models.delete_card(card_id, g.user["id"])
    return redirect(url_for("cards_list"))


@app.route("/review")
@require_login
def review():
    due = models.due_cards(g.user["id"], limit=50)
    if not due:
        models.log_event(g.user["id"], "review_session_completed")
        return render_template("review_done.html")
    card = due[0]
    show_answer = request.args.get("show") == "answer"
    progress = {"current": 1, "total": len(due)}
    if not show_answer:
        models.log_event(g.user["id"], "review_started")
        return render_template("review_question.html", card=card, progress=progress)
    return render_template("review_answer.html", card=card, progress=progress)


@app.route("/review/grade", methods=["POST"])
@require_login
def review_grade():
    card_id = request.form.get("card_id")
    grade = request.form.get("grade")
    card = models.get_card(card_id, g.user["id"])
    if not card:
        flash("Card not found")
        return redirect(url_for("review"))
    updates = srs.apply_review(card, grade)
    models.log_review(g.user["id"], card_id, grade)
    models.update_card(card_id, g.user["id"], **updates)
    return redirect(url_for("review"))


# API helpers

def user_to_dict(user):
    return {
        "id": user["id"],
        "email": user["email"],
        "target_language": user["target_language"],
        "timezone": user["timezone"],
        "created_at": user["created_at"],
    }


def card_to_dict(card):
    return {
        "id": card["id"],
        "phrase": card["phrase"],
        "meaning": card["meaning"],
        "context_tag": card["context_tag"],
        "created_at": card["created_at"],
        "updated_at": card["updated_at"],
        "next_review_at": card["next_review_at"],
        "interval_days": card["interval_days"],
        "easiness_factor": card["easiness_factor"],
        "repetition": card["repetition"],
        "suspended": bool(card["suspended"]),
    }


# API Routes


@app.route("/api/auth/signup", methods=["POST"])
def api_signup():
    data = request.get_json(force=True)
    email = data.get("email", "").strip()
    password = data.get("password", "")
    target_language = data.get("target_language", "")
    timezone = data.get("timezone", "UTC")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if models.get_user_by_email(email):
        return jsonify({"error": "User already exists"}), 400
    user = models.create_user(email, generate_password_hash(password), target_language, timezone)
    token = login_user(user)
    return jsonify({"user": user_to_dict(user), "token": token})


@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.get_json(force=True)
    email = data.get("email", "").strip()
    password = data.get("password", "")
    user = models.get_user_by_email(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401
    token = login_user(user)
    return jsonify({"user": user_to_dict(user), "token": token})


@app.route("/api/auth/logout", methods=["POST"])
@require_api_auth
def api_logout():
    logout_user()
    return "", 204


@app.route("/api/cards", methods=["GET"])
@require_api_auth
def api_cards_list():
    cards = [card_to_dict(c) for c in models.list_cards(g.user["id"])]
    return jsonify(cards)


@app.route("/api/cards", methods=["POST"])
@require_api_auth
def api_cards_create():
    data = request.get_json(force=True)
    phrase = data.get("phrase", "").strip()
    meaning = data.get("meaning", "")
    context_tag = data.get("context_tag", "other")
    if not phrase:
        return jsonify({"error": "Phrase is required"}), 400
    card = models.create_card(
        g.user["id"],
        phrase,
        meaning,
        context_tag,
        srs.initial_state(),
    )
    return jsonify(card_to_dict(card)), 201


@app.route("/api/cards/<card_id>", methods=["PUT"])
@require_api_auth
def api_cards_update(card_id):
    data = request.get_json(force=True)
    card = models.get_card(card_id, g.user["id"])
    if not card:
        return jsonify({"error": "Card not found"}), 404
    fields = {}
    for key in ["phrase", "meaning", "context_tag", "suspended"]:
        if key in data:
            fields[key] = data[key]
    updated = models.update_card(card_id, g.user["id"], **fields)
    return jsonify(card_to_dict(updated))


@app.route("/api/cards/<card_id>", methods=["DELETE"])
@require_api_auth
def api_cards_delete(card_id):
    models.delete_card(card_id, g.user["id"])
    return "", 204


@app.route("/api/review/queue", methods=["GET"])
@require_api_auth
def api_review_queue():
    due = [card_to_dict(c) for c in models.due_cards(g.user["id"], limit=50)]
    if not due:
        models.log_event(g.user["id"], "review_session_completed")
    else:
        models.log_event(g.user["id"], "review_started")
    return jsonify(due)


@app.route("/api/review/submit", methods=["POST"])
@require_api_auth
def api_review_submit():
    data = request.get_json(force=True)
    card_id = data.get("card_id")
    grade = data.get("grade")
    card = models.get_card(card_id, g.user["id"])
    if not card:
        return jsonify({"error": "Card not found"}), 404
    updates = srs.apply_review(card, grade)
    models.log_review(g.user["id"], card_id, grade)
    updated = models.update_card(card_id, g.user["id"], **updates)
    return jsonify(card_to_dict(updated))


@app.route("/api/stats/overview", methods=["GET"])
@require_api_auth
def api_stats_overview():
    return jsonify(models.stats_overview(g.user["id"]))


if __name__ == "__main__":
    # Bind to all interfaces so you can reach it from other devices on the network.
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
