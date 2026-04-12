from flask import Blueprint, request, jsonify
from app.models import db, Route, Bus, Seat, Booking, Passenger, User, RouteStop
from datetime import datetime, timedelta
import random, uuid, os, json, base64, re, time
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils import get_or_create_seats
from functools import wraps
from app.auth_utils import decode_token, generate_token

from app.utils import send_email_async
from app.utils import get_welcome_email, get_booking_confirmation_email, get_login_alert_email, get_password_reset_email

serializer = URLSafeTimedSerializer(os.environ.get("SECRET_KEY", "your-secret-key"))

def is_valid_future_date(date_str):
    """Checks if the date string is today or a future date."""
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d").date()
        today = datetime.today().date()
        return dt >= today
    except (ValueError, TypeError):
        return False

def is_valid_email(email):
    """Checks if the email string matches standard email formatting."""
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email) is not None

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Token missing"}), 401
        try:
            token = auth_header.split(" ")[1]  # Bearer <token>
        except:
            return jsonify({"error": "Invalid token format"}), 401

        user_id = decode_token(token)

        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401
        request.user_id = user_id
        return f(*args, **kwargs)
    return wrapper

api = Blueprint("api", __name__, url_prefix="/api")

@api.route("/")
def home():
    return {"message": "API working"}

# 1. SEARCH BUSES (DATE INDEPENDENT)
@api.route("/search", methods=["GET"])
def search_buses():
    source = request.args.get("source")
    destination = request.args.get("destination")
    date = request.args.get("date")

    if not source or not destination or not date:
        return jsonify({"error": "source, destination, date required"}), 400

    if not is_valid_future_date(date):
        return jsonify({"error": "Invalid date. Must be today or a future date."}), 400

    route = Route.query.filter_by(source=source, destination=destination).first()
    if not route:
        return jsonify({"data": []})

    buses = Bus.query.filter_by(route_id=route.id).all()
    journey_date = datetime.strptime(date, "%Y-%m-%d")

    results = []
    for b in buses:
        # Available seats (if not generated → random fallback)
        available = Seat.query.filter_by(
            bus_id=b.id,
            journey_date=date,
            is_available=True
        ).count()

        # Proper datetime handling
        boarding_dt = f"{date} {b.boarding_time}"
        dropping_dt = (
            journey_date + timedelta(days=1)
        ).strftime("%Y-%m-%d") + f" {b.dropping_time}"

        min_seats = min(5, b.total_seats)
        max_seats = b.total_seats
        random_seats = random.randint(1, max_seats) if max_seats > 0 else 0

        results.append({
            "busId": b.id,
            "travelsName": b.travels_name,
            "busType": b.bus_type,
            "isAC": b.is_ac,
            "boardingTime": boarding_dt,
            "droppingTime": dropping_dt,
            "duration": b.duration,
            "price": b.price,
            "rating": b.rating,
            "availableSeats": available if available > 0 else random_seats  
        })

    return jsonify({"data": results})


# 3. GET BUS DETAILS
@api.route("/bus/<bus_id>", methods=["GET"])
def bus_details(bus_id):
    bus = Bus.query.get(bus_id)

    if not bus:
        return jsonify({"error": "Bus not found"}), 404

    return jsonify({
        "busId": bus.id,
        "travelsName": bus.travels_name,
        "busType": bus.bus_type,
        "isAC": bus.is_ac,
        "boardingTime": bus.boarding_time,
        "droppingTime": bus.dropping_time,
        "duration": bus.duration,
        "price": bus.price,
        "rating": bus.rating,
        "totalSeats": bus.total_seats
    })


@api.route("/bus/<bus_id>/seats", methods=["GET"])
def get_seats(bus_id):
    date = request.args.get("date")
    source = request.args.get("source")
    destination = request.args.get("destination")

    if not date or not destination or not source:
        return jsonify({"error": "date, source, destination required"}), 400

    # DATE VALIDATION CHECK
    if not is_valid_future_date(date):
        return jsonify({"error": "Invalid date. Must be today or a future date."}), 400
    
    route = Route.query.filter_by(source=source, destination=destination).first()

    if not route:
        return jsonify({"error": "Route not found"}), 404

    route_id = route.id
    seats, error = get_or_create_seats(bus_id, route_id, date)

    if error:
        return jsonify({"error": error}), 404

    # 🔥 Gender rule
    def apply_gender_rules(seats):
        for i in range(0, len(seats) - 1, 2):
            s1 = seats[i]
            s2 = seats[i + 1]

            g1 = getattr(s1, "gender", None)
            g2 = getattr(s2, "gender", None)

            if not s1.is_available and g1 == "F":
                s2.allowed_gender = "F"
            elif not s2.is_available and g2 == "F":
                s1.allowed_gender = "F"
            else:
                s1.allowed_gender = "ALL"
                s2.allowed_gender = "ALL"

        return seats

    lower = [s for s in seats if s.deck == "LOWER"]
    upper = [s for s in seats if s.deck == "UPPER"]

    lower = apply_gender_rules(lower)
    upper = apply_gender_rules(upper)

    def build_layout(seats):
        layout = []
        row = []

        for s in seats:
            row.append({
                "seatNo": s.seat_no,
                "available": s.is_available,
                "price": s.price,
                "type": s.seat_type,
                "allowedGender": getattr(s, "allowed_gender", "ALL")
            })

            if len(row) == 2:
                row.append(None)

            if len(row) == 4:
                layout.append(row)
                row = []

        if row:
            layout.append(row)

        return layout

    return jsonify({
        "busId": bus_id,
        "lowerDeck": build_layout(lower),
        "upperDeck": build_layout(upper)
    })


# 5. BOOK TICKET
@api.route("/book", methods=["POST"])
@login_required
def book_ticket():
    data = request.json

    bus_id = data.get("busId")
    date = data.get("date")
    seats = data.get("seats")
    passengers = data.get("passengers")
    source = data.get("source")
    destination = data.get("destination")

    if not all([bus_id, date, seats, passengers]):
        return jsonify({"error": "Invalid payload"}), 400

    if not is_valid_future_date(date):
        return jsonify({"error": "Invalid journey date. Must be today or a future date."}), 400

    for p in passengers:
        try:
            age = int(p.get("age", 0))
            if age <= 0:
                return jsonify({"error": f"Age must be a positive number. Invalid age provided for passenger: {p.get('name')}"}), 400
        except ValueError:
            return jsonify({"error": f"Invalid age format for passenger: {p.get('name')}"}), 400

    total = 0
    booked_seats = []

    for seat_no in seats:
        seat = Seat.query.filter_by(
            bus_id=bus_id,
            journey_date=date,
            seat_no=seat_no
        ).first()

        if not seat or not seat.is_available:
            return jsonify({"error": f"Seat {seat_no} not available"}), 400

        seat.is_available = False
        total += seat.price
        booked_seats.append(seat)

    booking = Booking(
        pnr="PNR" + str(uuid.uuid4().int)[:6],
        user_id=request.user_id,
        bus_id=bus_id,
        source=source,
        destination=destination,
        journey_date=date,
        total_amount=total
    )

    db.session.add(booking)
    db.session.flush()

    for p in passengers:
        db.session.add(Passenger(
            booking_id=booking.id,
            name=p["name"],
            age=int(p["age"]),
            gender=p["gender"],
            seat_no=p["seatNo"]
        ))

    db.session.commit()

    # Fetch user to get their email address
    user = User.query.get(request.user_id)

    # TRIGGER BOOKING CONFIRMATION EMAIL IN BACKGROUND
    if user:
        html_content = get_booking_confirmation_email(
            pnr=booking.pnr,
            source=source,
            destination=destination,
            date=date,
            amount=total,
            passengers=passengers
        )
        send_email_async(user.email, f"Ticket Confirmed - {booking.pnr}", html_content)

    return jsonify({
        "message": "Booking confirmed",
        "pnr": booking.pnr,
        "totalAmount": total
    })


@api.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email", "")

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    user = User(
        name=data["name"],
        email=email,
        password=generate_password_hash(base64.b64decode(data["password"]).decode("utf-8"))
    )

    db.session.add(user)
    db.session.commit()

    # TRIGGER WELCOME EMAIL IN BACKGROUND
    html_content = get_welcome_email(user.name, os.environ.get('VITE_FRONTEND_URL','http://localhost:5173'))
    send_email_async(user.email, "Welcome to BusBooking!", html_content)

    return jsonify({"message": "User registered"})


@api.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "")
    device = data.get("device", "Unknown Device")

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, base64.b64decode(data["password"]).decode("utf-8")):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user.id)

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ip_addr = request.remote_addr or "Unknown IP"
    
    html_content = get_login_alert_email(user.name, current_time, ip_addr, device)
    send_email_async(user.email, "Security Alert: New Login Detected", html_content)

    return jsonify({"token": token, "userId": user.id, "name": user.name, "email": user.email})


@api.route("/auth/forgot", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")
    device = data.get("device", "Unknown Device")

    if not email or not is_valid_email(email):
        return jsonify({"error": "Valid email is required"}), 400

    user = User.query.filter_by(email=email).first()
    
    if user:
        token = serializer.dumps(email, salt="password-reset-salt")
        reset_link = f"{os.environ.get('VITE_FRONTEND_URL','http://localhost:5173')}/auth?action=reset&token={token}"
        
        html_content = get_password_reset_email(user.name, reset_link, device)
        send_email_async(user.email, "Password Reset Request", html_content)

    return jsonify({"message": "If an account exists with this email, a reset link has been sent."})

@api.route("/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    token = data.get("token")
    new_password_raw = base64.b64decode(data.get("password")).decode("utf-8")

    try:
        email = serializer.loads(token, salt="password-reset-salt", max_age=900)
    except SignatureExpired:
        return jsonify({"error": "The reset link has expired. Please request a new one."}), 400
    except BadTimeSignature:
        return jsonify({"error": "Invalid reset token."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User no longer exists."}), 404

    user.password = generate_password_hash(new_password_raw)
    db.session.commit()

    return jsonify({"message": "Password updated successfully!"})

# 6. GET BOOKINGS
@api.route("/my-bookings", methods=["POST"])
@login_required
def my_bookings():
    bookings = Booking.query.filter_by(user_id=request.user_id).all()
    result = []

    for b in bookings:
        passengers = Passenger.query.filter_by(booking_id=b.id).all()
        # Fetch the bus to get the exact boarding and dropping times
        bus = Bus.query.filter_by(id=b.bus_id).first()

        result.append({
            "pnr": b.pnr,
            "busId": b.bus_id,
            "route": f"{b.source} → {b.destination}",
            "date": b.journey_date,
            "amount": b.total_amount,
            "source": b.source,
            "destination": b.destination,
            "boardingTime": bus.boarding_time if bus else "00:00",
            "droppingTime": bus.dropping_time if bus else "00:00",
            "passengers": [
                {
                    "name": p.name,
                    "age": p.age,
                    "gender": p.gender,
                    "seatNo": p.seat_no
                }
                for p in passengers
            ]
        })

    return jsonify({"data": result})


@api.route("/getRouteStops", methods=["GET"])
def get_route_stops():
    source = request.args.get("source")
    destination = request.args.get("destination")

    if not source or not destination:
        return jsonify({"error": "source and destination required"}), 400

    source = source.lower().strip()
    destination = destination.lower().strip()

    source_stops = RouteStop.query.filter_by(city=source).all()
    destination_stops = RouteStop.query.filter_by(city=destination).all()

    return jsonify({
        "source": source,
        "destination": destination,
        "boardingPoints": [
            {
                "name": s.stop_name,
                "address": s.address
            }
            for s in source_stops
        ],
        "droppingPoints": [
            {
                "name": s.stop_name,
                "address": s.address
            }
            for s in destination_stops
        ]
    })


@api.route("/getBusImages", methods=["GET"])
def get_bus_images():
    try:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        file_path = os.path.join(base_dir, "images", "bus_images.json")

        # Load JSON
        with open(file_path, "r") as f:
            data = json.load(f)

        images_list = data.get("images", [])

        if not images_list:
            return jsonify({"error": "No images found"}), 404

        # Pick random bus set
        selected_bus = random.choice(images_list)

        exterior_images = selected_bus.get("exterior_images", [])
        interior_images = selected_bus.get("interior_images", [])

        return jsonify({
            "exterior": exterior_images,
            "interior": interior_images
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@api.route('/getFullDataWithIds', methods=['GET'])
def get_full_data_with_ids():

    try:
        routes = Route.query.all()
        result = []

        for route in routes:
            buses = Bus.query.filter_by(route_id=route.id).all()

            boarding_points = RouteStop.query.filter_by(city=route.source).all()
            dropping_points = RouteStop.query.filter_by(city=route.destination).all()

            route_obj = {
                "from": route.source,
                "to": route.destination,
                "buses": [],
                "boarding_points": [],
                "dropping_points": []
            }

            for b in buses:
                route_obj["buses"].append({
                    "busId": b.id,  
                    "name": b.travels_name,
                    "type": b.bus_type,
                    "ac": b.is_ac,
                    "departure": b.boarding_time,
                    "arrival": b.dropping_time,
                    "duration": b.duration,
                    "price": b.price,
                    "rating": b.rating
                })

            for bp in boarding_points:
                route_obj["boarding_points"].append({
                    "name": bp.stop_name,
                    "address": bp.address
                })

            for dp in dropping_points:
                route_obj["dropping_points"].append({
                    "name": dp.stop_name,
                    "address": dp.address
                })

            route_obj["faqs"] = [
                {
                    "faq": "What is the luggage policy?",
                    "answer": "Each passenger is allowed 15kg luggage."
                },
                {
                    "faq": "Can I cancel my ticket?",
                    "answer": "Yes, cancellation allowed before departure."
                }
            ]

            if route_obj["buses"]:
                result.append(route_obj)


        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500