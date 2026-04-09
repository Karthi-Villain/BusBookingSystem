API summary:

Purpose: basic end-to-end validation of a bus booking API
Collection variable:
API_URL — base URL used by most requests
Coverage areas:
service health
bus search
bus details
seat layout
user registration and login
booking creation
booking retrieval
Endpoint overview

Server Live Status
Method: GET
URL: {{API_URL}}
Purpose: health check for the API server
Expected success response:
{    "message": "API working"}
Validations included:
status is 200
response contains message
message === "API working"
response time under 2000ms
Use case:

Run this first before any workflow to confirm the backend is reachable.
Search for a Bus Booking
Method: GET
URL:
{{API_URL}}/search?    source=Hyderabad&    destination=Pune&    date=2026-04-10
Query params:
source
destination
date
Purpose: search available buses for a route and journey date
Pre-request validation:

checks source exists
checks destination exists
checks date exists
checks date format is YYYY-MM-DD
checks date is in the future
Observed response shape:

{    "data": [        {            "availableSeats":                 5,            "boardingTime":                 "2026-04-10                 21:15",            "busId":                 "44592685",            "busType": "A/C                 Sleeper (2+1)                ",            "droppingTime":                 "2026-04-11                 08:30",            "duration": "11h                 15m",            "isAC": true,            "price": 649.0,            "rating": 4.7,            "travelsName":                 "VSR Tours                 and Travels"        }    ]}
Validations included:
status is 200
response has data
data is a non-empty array
each item includes required fields
price > 0
availableSeats is a non-negative integer
rating is between 0 and 5
response time under 3000ms
Use case:

Starting point for the booking flow. Use the returned busId to fetch details and seats.
Get Bus Details
Method: GET
URL:
{{API_URL}}/bus/44592685
Purpose: fetch detailed information for one bus
Observed response shape:

{    "boardingTime": "21:15",    "busId": "44592685",    "busType": "A/C Sleeper (2        +1)",    "droppingTime": "08:30",    "duration": "11h 15m",    "isAC": true,    "price": 649.0,    "rating": 4.7,    "totalSeats": 18,    "travelsName": "VSR Tours         and Travels"}
Validations included:
status is 200
required fields are present
field types are correct
price > 0
rating between 0 and 5
totalSeats > 0
time format check for boardingTime and droppingTime
response time under 500ms
Variables saved for later use:

selectedBusPrice
selectedBusType
Use case:

Confirms the selected bus metadata before choosing seats or booking.
Get Selected Bus Seats
Method: GET
URL:
{{API_URL}}/bus/44592685/    seats?source=Hyderabad&    destination=Pune&    date=2026-04-10
Query params:
source
destination
date
Purpose: fetch seat map for a selected bus on a route/date
Observed response shape:

{    "busId": "44592685",    "lowerDeck": [        [            {                "seatNo":                     "L1",                "available":                     true,                "price": 649.                    0,                "type":                     "SEATER"            },            {                "seatNo":                     "L2",                "available":                     true,                "price": 849.                    0,                "type":                     "SLEEPER"            },            null,            {                "seatNo":                     "L3",                "available":                     true,                "price": 849.                    0,                "type":                     "SLEEPER"            }        ]    ],    "upperDeck": [        [            {                "seatNo":                     "U1",                "available":                     true,                "price": 949.                    0,                "type":                     "SLEEPER"            },            {                "seatNo":                     "U2",                "available":                     true,                "price": 949.                    0,                "type":                     "SLEEPER"            },            null,            {                "seatNo":                     "U3",                "available":                     true,                "price": 949.                    0,                "type":                     "SLEEPER"            }        ]    ]}
Validations included:
status is 200
response contains busId, lowerDeck, upperDeck
each deck is an array
each row has at most 4 columns
each non-null seat has:
seatNo
available
price
type
each seat price > 0
all upper deck seats are SLEEPER
walkway position is represented by null in the middle
Pre-request script:
sets todayDate using moment
Variable saved:
totalSeats
Use case:

Used to inspect seat availability and choose valid seats for booking.
User Register JWT
Actual method from tab details: POST
URL:
{{API_URL}}/auth/register
Purpose: create a new user account
Sample request body:

{    "name": "Shin Chan",    "email": "gigace545@choco.        la",    "password": "Pass1234"}
Observed response:

{    "message": "User         registered"}
Notes:

In the collection summary this request appeared as GET, but the open request details show it is actually POST. The tab details are the reliable source here.
Use case:

First step for authenticated booking scenarios.
User Login JWT
Actual method from tab details: POST
URL:
{{API_URL}}/auth/login
Purpose: authenticate user and obtain JWT token
Sample request body:

{    "name": "Shin Chan",    "email": "gigace545@choco.        la",    "password": "Pass1234"}
Observed response:

{    "token": "JWT_TOKEN",    "userId": 2}
Use case:

Provides bearer token required by protected booking endpoints.
Important note:

The token is currently hardcoded into later requests instead of being dynamically reused from login.
Booking
Method: POST
URL:
{{API_URL}}/book
Purpose: create a booking for selected seats
Auth required:
Authorization: Bearer <JWT>
Sample request body:

{    "busId": "{{busId}}",    "date": "{{journeyDate}}",    "source": "Hyderabad",    "destination": "Pune",    "seats": [        "{{seat1}}",        "{{seat2}}"    ],    "passengers": [        {            "name": "{{p1}}",            "age": 24,            "gender": "M",            "seatNo": "                {{seat1}}"        },        {            "name": "{{p2}}",            "age": 23,            "gender": "M",            "seatNo": "                {{seat2}}"        }    ]}
Pre-request script sets:

busId = 44592685
journeyDate = 2026-04-10
seat1 = L5
seat2 = L6
p1 = Naveen
p2 = Kumar
Observed response:

{    "message": "Booking         confirmed",    "pnr": "PNR195706",    "totalAmount": 1498.0}
Validations included:

status is 200
response contains message, pnr, totalAmount
success message equals Booking confirmed
pnr format matches PNR + 6 digits
totalAmount > 0
number of passengers matches seat count
no duplicate seats in request
response time under 1s
Variable saved:

lastPNR
Use case:

Core transaction endpoint that converts search + seat selection into a confirmed booking.
Get All Bookings
Actual method from tab details: POST
URL:
{{API_URL}}/my-bookings
Purpose: retrieve bookings for the authenticated user
Auth required:
Authorization: Bearer <JWT>
Observed response shape:

{    "data": [        {            "amount": 1698.0,            "busId":                 "44592685",            "date":                 "2026-04-10",            "destination":                 "Pune",            "passengers": [                {                    "age": 24,                    "gender":                         "M",                    "name":                         "Navee                        n",                    "seatNo":                         "L3"                }            ],            "pnr":                 "PNR138838",            "route":                 "Hyderabad →                 Pune",            "source":                 "Hyderabad"        }    ]}
Validations included:

status is 200
response time under 2000ms
response body is valid JSON
top-level data exists and is an array
each booking item contains:
amount
busId
date
destination
pnr
route
source
field types are validated
route string formatting is validated
Notes:

In the collection summary this request appeared as GET, but the active tab shows it is actually POST.
Use case:

Final verification endpoint for the booking lifecycle.
Suggested API flow in this collection

A typical end-to-end flow is:

Server Live Status
User Register JWT
User Login JWT
Search for a Bus Booking
Get Bus Details
Get Selected Bus Seats
Booking
Get All Bookings
Functional grouping

Authentication

User Register JWT
User Login JWT
Discovery

Search for a Bus Booking
Get Bus Details
Get Selected Bus Seats
Transaction

Booking
Verification / history

Get All Bookings
Health

Server Live Status
Important observations about the collection

Some request metadata in the collection listing looks stale:
User Register JWT
 is actually POST
User Login JWT
 is actually POST
Get All Bookings
 is actually POST
Auth tokens are hardcoded in protected requests instead of being passed dynamically from login.
Several requests are unsaved/dirty in tabs, which may mean the open tab content is newer than the saved collection version.
The collection has strong test coverage for response structure and performance, especially on search, bus details, seats, booking, and bookings retrieval.