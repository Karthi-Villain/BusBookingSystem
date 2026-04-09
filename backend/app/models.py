from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    bookings = db.relationship("Booking", backref="user", lazy=True)

class Route(db.Model):
    __tablename__ = 'routes'
    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)

class Bus(db.Model):
    __tablename__ = 'buses'
    id = db.Column(db.String(50), primary_key=True) 
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'))

    travels_name = db.Column(db.String(150))
    bus_type = db.Column(db.String(150))
    is_ac = db.Column(db.Boolean)

    boarding_time = db.Column(db.String(10))
    dropping_time = db.Column(db.String(10))
    duration = db.Column(db.String(20))

    price = db.Column(db.Float)
    rating = db.Column(db.Float)

    total_seats = db.Column(db.Integer)
    single_seats = db.Column(db.Integer)

class Seat(db.Model):
    __tablename__ = 'seats'
    id = db.Column(db.Integer, primary_key=True)
    bus_id = db.Column(db.String(50), db.ForeignKey('buses.id'))
    journey_date = db.Column(db.String(20))

    seat_no = db.Column(db.String(10))
    is_available = db.Column(db.Boolean, default=True)
    price = db.Column(db.Float)
    seat_type = db.Column(db.String(20))   # SEATER / SLEEPER
    deck = db.Column(db.String(10))        # LOWER / UPPER
    gender = db.Column(db.String(10))      # M / F
    route_id = db.Column(db.Integer, db.ForeignKey("routes.id"))

class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    pnr = db.Column(db.String(20), unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    route_id = db.Column(db.Integer)
    bus_id = db.Column(db.String(50))
    source = db.Column(db.String(100))
    destination = db.Column(db.String(100))
    journey_date = db.Column(db.String(20))
    total_amount = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Passenger(db.Model):
    __tablename__ = 'passengers'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))

    name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    seat_no = db.Column(db.String(10))

class RouteStop(db.Model):
    __tablename__ = "route_stops"

    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(100))
    stop_name = db.Column(db.String(200))
    address = db.Column(db.String(300))