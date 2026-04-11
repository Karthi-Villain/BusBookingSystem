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
        msg['From'] = f"BusBooking System <{SMTP_USER}>"
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

def get_welcome_email(user_name, app_url):
    return f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="height: 6px; background: linear-gradient(to right, #ef4444, #b91c1c);"></div>
            
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #0f172a; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome Aboard!</h1>
                </div>
                
                <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Hi {user_name},</h2>
                <p style="font-size: 16px; line-height: 1.7; color: #475569;">
                    Your account has been successfully created. We are thrilled to have you join India's fastest-growing online bus ticket booking platform!
                </p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px dashed #cbd5e1;">
                    <p style="margin: 0; font-size: 15px; color: #1e293b; line-height: 1.6;">
                        🌟 <strong>Why travel with us?</strong><br>
                        • Real-time GPS tracking for all buses.<br>
                        • Flexible "Zero-Fee" cancellations.<br>
                        • 24/7 Priority support for every journey.
                    </p>
                </div>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="{app_url}" style="background-color: #ef4444; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">Book Your First Trip</a>
                </div>
                
                <p style="font-size: 14px; color: #64748b; text-align: center;">Need help getting started? Just reply to this email.</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                © 2026 BusBooking System • 123 Travel Lane, Chennai, India
            </div>
        </div>
    </div>
    """

def get_login_alert_email(user_name, login_time, ip_address, device):
    return f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="height: 6px; background: linear-gradient(to right, #ef4444, #b91c1c);"></div>
            
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="background-color: #fef2f2; color: #dc2626; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Security Notification</span>
                </div>
                
                <h2 style="margin-top: 0; color: #0f172a; text-align: center; font-size: 24px; font-weight: 800;">New Login Detected</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #475569;">Hi {user_name},</p>
                <p style="font-size: 16px; line-height: 1.6; color: #475569;">We noticed a new login to your account. Please review the details below to ensure it was you.</p>
                
                <div style="background-color: #f1f5f9; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                    <table width="100%" style="font-size: 14px; border-spacing: 0 8px;">
                        <tr><td style="color: #64748b; width: 100px;">Time</td><td style="color: #1e293b; font-weight: 600;">{login_time}</td></tr>
                        <tr><td style="color: #64748b;">Device</td><td style="color: #1e293b; font-weight: 600;">{device}</td></tr>
                        <tr><td style="color: #64748b;">IP Address</td><td style="color: #1e293b; font-weight: 600;">{ip_address}</td></tr>
                    </table>
                </div>
                
                <p style="font-size: 14px; color: #64748b; background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px; border-radius: 4px;">
                    <strong>Not you?</strong> Please <a href="#" style="color: #ef4444; font-weight: bold; text-decoration: none;">reset your password</a> immediately to secure your account.
                </p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                © 2026 BusBooking System • Your safety is our priority.
            </div>
        </div>
    </div>
    """

def get_booking_confirmation_email(pnr, source, destination, date, amount, passengers):
    passenger_html = ""
    for p in passengers:
        gender_text = "Male" if p['gender'] == 'M' else "Female" if p['gender'] == 'F' else "Other"
        passenger_html += f"""
        <tr>
            <td style="padding: 14px; color: #1e293b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{p['name']}</td>
            <td style="padding: 14px; color: #64748b; border-bottom: 1px solid #f1f5f9;">{p['age']} yrs • {gender_text}</td>
            <td style="padding: 14px; color: #ef4444; font-weight: 800; text-align: right; border-bottom: 1px solid #f1f5f9;">{p['seatNo']}</td>
        </tr>
        """

    return f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="height: 6px; background: linear-gradient(to right, #ef4444, #b91c1c);"></div>
            
            <div style="padding: 30px; background: #fffcfc; border-bottom: 1px solid #fee2e2;">
                <table width="100%">
                    <tr>
                        <td>
                            <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #ef4444; font-weight: 800;">Booking Confirmed</p>
                            <h2 style="margin: 4px 0 0 0; font-size: 32px; color: #0f172a; letter-spacing: -1px;">{pnr}</h2>
                        </td>
                        <td align="right">
                             <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 8px 16px; border-radius: 10px; text-align: center;">
                                <p style="margin: 0; font-size: 10px; color: #ef4444; text-transform: uppercase; font-weight: bold;">Fare Paid</p>
                                <p style="margin: 0; font-size: 20px; color: #b91c1c; font-weight: 800;">₹{amount}</p>
                             </div>
                        </td>
                    </tr>
                </table>
            </div>

            <div style="padding: 30px;">
                <div style="background-color: #f1f5f9; padding: 24px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                    <table width="100%">
                        <tr>
                            <td width="45%">
                                <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">From</p>
                                <h3 style="margin: 4px 0 0 0; color: #0f172a; font-size: 22px;">{source}</h3>
                            </td>
                            <td width="10%" align="center" style="vertical-align: middle;">
                                <span style="font-size: 24px; color: #cbd5e1;">→</span>
                            </td>
                            <td width="45%" align="right">
                                <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">To</p>
                                <h3 style="margin: 4px 0 0 0; color: #0f172a; font-size: 22px;">{destination}</h3>
                            </td>
                        </tr>
                    </table>
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; font-size: 14px; color: #1e293b;">📅 <strong>Date of Journey:</strong> {date}</p>
                    </div>
                </div>

                <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 16px; font-weight: 800;">Passenger Details</h4>
                <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    {passenger_html}
                </table>

                <div style="margin-top: 30px; padding: 15px; background: #fff7ed; border-radius: 8px; border-left: 4px solid #f97316;">
                    <p style="margin: 0; font-size: 13px; color: #9a3412;">
                        <strong>Travel Tip:</strong> Please report at the boarding point at least 15 minutes before departure with a valid ID proof.
                    </p>
                </div>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                Track your bus live on the BusBooking App.<br>
                © 2026 BusBooking System • Your safety is our priority.
            </div>
        </div>
    </div>
    """

def get_password_reset_email(user_name, reset_link, device):
    return f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="height: 6px; background: linear-gradient(to right, #ef4444, #b91c1c);"></div>
            
            <div style="padding: 40px 30px;">
                <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-top: 0;">Password Reset Request</h2>
                <p style="font-size: 16px; color: #475569;">Hi {user_name},</p>
                <p style="font-size: 16px; color: #475569;">We received a request to reset your password. For your security, this request was initiated from:</p>
                
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px left solid #ef4444;">
                    <p style="margin: 0; font-size: 14px; color: #1e293b;"><strong>Device:</strong> {device}</p>
                </div>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="{reset_link}" style="background-color: #ef4444; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">Reset My Password</a>
                </div>
                
                <p style="font-size: 13px; color: #94a3b8; text-align: center;">This link will expire in 15 minutes.</p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8;">If you didn't request this, no action is needed. Your password will remain unchanged.</p>
            </div>
        </div>
    </div>
    """