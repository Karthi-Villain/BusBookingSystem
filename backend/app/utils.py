from app.models import db, Bus, Seat
import random

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import threading
import os

# Configuration: Ideally, load these from your .env file
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "your_email@gmail.com") 
SMTP_PASS = os.environ.get("SMTP_PASS", "your_app_password")


def generate_seats(bus, route_id, date):

    rows_per_column = random.choice([5, 6])

    lower_seats = []
    upper_seats = []

    layout_type = random.choice([1, 2, 3])  # 3 scenarios

    def get_seat_type(col):
        if "SLEATER" in bus.bus_type.upper():

            if layout_type == 1:
                if col == 1:
                    return "SLEEPER"
                elif col in [3, 4]:
                    return "SEATER"
                else:
                    return "SEATER"

            elif layout_type == 2:
                return "SLEEPER"

            elif layout_type == 3:
                return "SEATER"

        # Default fallback
        return "SEATER"

    seat_index = 1

    # LOWER DECK (4 columns)
    for row in range(rows_per_column):

        for col in range(1, 5):

            seat_type = get_seat_type(col)

            # Sleeper = occupies 1 slot
            if seat_type == "SLEEPER":
                lower_seats.append(Seat(
                    bus_id=bus.id,
                    route_id=route_id,
                    journey_date=date,
                    seat_no=f"L{seat_index}",
                    is_available=True,
                    price=bus.price + 200,
                    seat_type="SLEEPER",
                    deck="LOWER",
                    gender=None
                ))
                seat_index += 1

            # Seater = 2 seats in same space
            else:
                for _ in range(2):
                    lower_seats.append(Seat(
                        bus_id=bus.id,
                        route_id=route_id,
                        journey_date=date,
                        seat_no=f"L{seat_index}",
                        is_available=True,
                        price=bus.price,
                        seat_type="SEATER",
                        deck="LOWER",
                        gender=None
                    ))
                    seat_index += 1

    # UPPER DECK (always sleeper)
    upper_index = 1
    for row in range(rows_per_column):
        for col in range(1, 5):
            upper_seats.append(Seat(
                bus_id=bus.id,
                route_id=route_id,
                journey_date=date,
                seat_no=f"U{upper_index}",
                is_available=True,
                price=bus.price + 300,
                seat_type="SLEEPER",
                deck="UPPER",
                gender=None
            ))
            upper_index += 1

    db.session.add_all(lower_seats + upper_seats)
    db.session.commit()


def get_or_create_seats(bus_id, route_id, date):
    bus = Bus.query.get(bus_id)

    if not bus:
        return None, "Bus not found"

    seats = Seat.query.filter_by(
        bus_id=bus_id,
        route_id=route_id,
        journey_date=date
    ).all()

    if not seats:
        generate_seats(bus, route_id, date)

        seats = Seat.query.filter_by(
            bus_id=bus_id,
            route_id=route_id,
            journey_date=date
        ).all()

    return seats, None




def _send_email_task(recipient, subject, html_content):
    """The actual function that sends the email, intended to run in a thread."""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"Pluto Travels <{SMTP_USER}>"
        msg['To'] = recipient

        # Attach the HTML content
        part = MIMEText(html_content, 'html')
        msg.attach(part)

        # Connect to server and send
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, recipient, msg.as_string())
        server.quit()
        print(f"Email successfully sent to {recipient}")
    except Exception as e:
        print(f"Failed to send email to {recipient}: {str(e)}")

def send_email_async(recipient, subject, html_content):
    """
    Triggers the email sending process in a background thread.
    This ensures the main API request doesn't wait for the email to be sent.
    """
    thread = threading.Thread(target=_send_email_task, args=(recipient, subject, html_content))
    thread.start()

def get_welcome_email(user_name):
    return f"""
    <div style="font-family: Arial, sans-serif; background-color: #fcfbf9; padding: 40px 20px; color: #1e293b;">
        <div style="max-w-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #1e293b; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Pluto Travels!</h1>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="margin-top: 0; color: #1e293b;">Hi {user_name},</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                    Your account has been successfully created. We are thrilled to have you onboard India's No. 1 online bus ticket booking platform!
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                    Whether you are planning a weekend getaway or a trip back home, we offer the best routes, flexi-tickets, and free cancellations to make your journey smooth.
                </p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="http://localhost:3000" style="background-color: #ef4444; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Book Your First Trip</a>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                © 2026 Pluto Travels. All rights reserved.<br>
                This is an automated message, please do not reply.
            </div>
        </div>
    </div>
    """

def get_login_alert_email(user_name, login_time, ip_address="Unknown"):
    return f"""
    <div style="font-family: Arial, sans-serif; background-color: #fcfbf9; padding: 40px 20px; color: #1e293b;">
        <div style="max-w-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="background-color: #fee2e2; color: #dc2626; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">Security Alert</span>
                </div>
                <h2 style="margin-top: 0; color: #1e293b; text-align: center;">New Login Detected</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #475569;">Hi {user_name},</p>
                <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                    We noticed a new login to your Pluto Travels account. If this was you, you can safely ignore this email.
                </p>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Time:</strong> {login_time}</p>
                    <p style="margin: 0;"><strong>IP Address:</strong> {ip_address}</p>
                </div>
                <p style="font-size: 14px; color: #64748b; border-left: 4px solid #ef4444; padding-left: 15px;">
                    If you did not authorize this login, please change your password immediately and contact our support team.
                </p>
            </div>
        </div>
    </div>
    """

def get_booking_confirmation_email(pnr, source, destination, date, amount, passengers):
    # Generate passenger rows dynamically
    passenger_html = ""
    for p in passengers:
        gender_text = "Male" if p['gender'] == 'M' else "Female" if p['gender'] == 'F' else "Other"
        passenger_html += f"""
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px; color: #1e293b; font-weight: bold;">{p['name']}</td>
            <td style="padding: 12px; color: #475569;">{p['age']} yrs, {gender_text}</td>
            <td style="padding: 12px; color: #1e293b; font-weight: bold; text-align: right;">{p['seatNo']}</td>
        </tr>
        """

    return f"""
    <div style="font-family: Arial, sans-serif; background-color: #fcfbf9; padding: 40px 20px; color: #1e293b;">
        <div style="max-w-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <div style="background: linear-gradient(to right, #ef4444, #dc2626); padding: 30px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #fee2e2;">PNR Number</p>
                    <h2 style="margin: 5px 0 0 0; font-size: 28px; letter-spacing: 2px;">{pnr}</h2>
                </div>
                <div>
                    <span style="background-color: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">Confirmed</span>
                </div>
            </div>

            <div style="padding: 30px; border-bottom: 2px dashed #e2e8f0;">
                <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td width="40%">
                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Source</p>
                            <h3 style="margin: 5px 0 0 0; color: #1e293b; font-size: 20px;">{source}</h3>
                        </td>
                        <td width="20%" align="center" style="color: #ef4444; font-size: 24px;">→</td>
                        <td width="40%" align="right">
                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Destination</p>
                            <h3 style="margin: 5px 0 0 0; color: #1e293b; font-size: 20px;">{destination}</h3>
                        </td>
                    </tr>
                </table>
                <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    <tr>
                        <td>
                            <p style="margin: 0; font-size: 12px; color: #64748b;">Journey Date</p>
                            <p style="margin: 5px 0 0 0; font-weight: bold; color: #1e293b;">{date}</p>
                        </td>
                        <td align="right">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">Total Fare</p>
                            <p style="margin: 5px 0 0 0; font-weight: bold; color: #ef4444; font-size: 20px;">₹{amount}</p>
                        </td>
                    </tr>
                </table>
            </div>

            <div style="padding: 30px;">
                <h4 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px;">Passenger Details</h4>
                <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px;">
                    {passenger_html}
                </table>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                Have a safe journey! Track your bus live on the Pluto Travels app.
            </div>
        </div>
    </div>
    """