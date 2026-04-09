import json
from app import create_app
from app.models import db, Route, Bus, RouteStop

app = create_app()

def load_route(json_file, source, destination):
    print(f"\nLoading route: {source} → {destination}")

    # 1. Check/Create Route
    route = Route.query.filter_by(source=source, destination=destination).first()
    if not route:
        route = Route(source=source, destination=destination)
        db.session.add(route)
        db.session.flush()

    # 2. Reverse Route
    reverse_route = Route.query.filter_by(source=destination, destination=source).first()
    if not reverse_route:
        reverse_route = Route(source=destination, destination=source)
        db.session.add(reverse_route)
        db.session.flush()

    # 3. Load JSON
    with open(json_file, "r") as f:
        buses = json.load(f)

    for bus in buses:

        # ---------- FORWARD BUS ----------
        existing_bus = Bus.query.get(bus["id"])
        if not existing_bus:
            db.session.add(Bus(
                id=bus["id"],
                route_id=route.id,
                travels_name=bus["travels_name"],
                bus_type=bus["bus_type"],
                is_ac=bus["isAC"],
                boarding_time=bus["boarding_time"],
                dropping_time=bus["dropping_time"],
                duration=bus["duration"],
                price=bus["price"],
                rating=bus["rating"],
                total_seats=bus["total_seats"],
                single_seats=bus["single_seats"]
            ))

        # ---------- REVERSE BUS ----------
        reverse_id = bus["id"] + "_R"

        existing_reverse = Bus.query.get(reverse_id)
        if not existing_reverse:
            db.session.add(Bus(
                id=reverse_id,
                route_id=reverse_route.id,
                travels_name=bus["travels_name"],
                bus_type=bus["bus_type"],
                is_ac=bus["isAC"],

                # 🔁 SWAPPED TIMES
                boarding_time=bus["dropping_time"],
                dropping_time=bus["boarding_time"],

                duration=bus["duration"],
                price=bus["price"],
                rating=bus["rating"],
                total_seats=bus["total_seats"],
                single_seats=bus["single_seats"]
            ))

    db.session.commit()
    print(f"✅ Loaded {len(buses)} buses + reverse")


def load_city(file_path, city_name):
    with open(file_path, "r") as f:
        data = json.load(f)

    for stop in data:
        existing = RouteStop.query.filter_by(
            city=city_name,
            stop_name=stop["name"]
        ).first()

        if existing:
            continue

        new_stop = RouteStop(
            city=city_name.lower(),
            stop_name=stop["name"],
            address=stop["address"]
        )

        db.session.add(new_stop)

    db.session.commit()
    print(f"{city_name} loaded ✅")



def run_loader():
    with app.app_context():   # 🔥 MUST HAVE

        print("Dropping tables...")
        db.drop_all()

        print("Creating tables...")
        db.create_all()

        print("Loading data...")

        # call your load_route()
        load_route("data/nlr-hyd.json", "Nellore", "Hyderabad")
        load_route("data/hyd-pun.json", "Hyderabad", "Pune")
        load_route("data/ban-hyd.json", "Bangalore", "Hyderabad")

        
        load_city("data/Bangalore.json", "Bangalore")
        load_city("data/hyderabad.json", "Hyderabad")
        load_city("data/nellore.json", "Nellore")
        load_city("data/Pune.json", "Pune")

        print("✅ Done")


if __name__ == "__main__":
    run_loader()