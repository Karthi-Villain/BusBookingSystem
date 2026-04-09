from flask import Blueprint, request, jsonify
from app.models import db, Route, Bus, Seat, Booking, Passenger, User, RouteStop
from datetime import datetime, timedelta
import random, uuid, os, json
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils import get_or_create_seats
from functools import wraps
from app.auth_utils import decode_token, generate_token

from app.utils import send_email_async
from app.utils import get_welcome_email, get_booking_confirmation_email, get_login_alert_email
from datetime import datetime

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
            age=p["age"],
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

    if User.query.filter_by(email=data["email"]).first():
        return {"error": "User already exists"}, 400

    user = User(
        name=data["name"],
        email=data["email"],
        password=generate_password_hash(data["password"])
    )

    db.session.add(user)
    db.session.commit()

    # TRIGGER WELCOME EMAIL IN BACKGROUND
    html_content = get_welcome_email(user.name)
    send_email_async(user.email, "Welcome to BusBooking!", html_content)

    return {"message": "User registered"}



@api.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return {"error": "Invalid credentials"}, 401

    token = generate_token(user.id)

    # TRIGGER LOGIN ALERT IN BACKGROUND
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ip_addr = request.remote_addr or "Unknown IP"
    html_content = get_login_alert_email(user.name, current_time, ip_addr)
    send_email_async(user.email, "Security Alert: New Login Detected", html_content)

    return {
        "token": token,
        "userId": user.id,
        "name": user.name,
        "email": user.email
    }


# 6. GET BOOKINGS
@api.route("/my-bookings", methods=["POST"])
@login_required
def my_bookings():
    bookings = Booking.query.filter_by(user_id=request.user_id).all()

    result = []

    for b in bookings:
        passengers = Passenger.query.filter_by(booking_id=b.id).all()

        result.append({
            "pnr": b.pnr,
            "busId": b.bus_id,
            "route": f"{b.source} → {b.destination}",
            "date": b.journey_date,
            "amount": b.total_amount,
            "source": b.source,
            "destination": b.destination,
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

    return {"data": result}


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