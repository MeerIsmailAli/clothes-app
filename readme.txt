Complete Setup: React + Django + MySQL on Ubuntu
Step 1 — System updates & core dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv python3-dev \
  build-essential curl git pkg-config libmysqlclient-dev
Step 2 — MySQL
# Install
sudo apt install -y mysql-server

# Start and enable on boot
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure the installation (set root password when prompted)
sudo mysql_secure_installation
Create your project database and user:

sudo mysql -u root -p
CREATE DATABASE styleshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shopuser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON styleshop.* TO 'shopuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
Step 3 — Python virtual environment & Django
# Create your project folder
mkdir ~/styleshop && cd ~/styleshop

# Create and activate venv
python3 -m venv venv
source venv/bin/activate

# Install this repository's backend dependencies. SQLite works out of the box.
pip install -r requirements.txt

# For MySQL instead, first install libmysqlclient-dev as above, then:
pip install -r requirements-mysql.txt

This repository already contains the Django project and app. Settings are in
backend/settings.py. Copy .env.example to .env to configure a local database.
Set DB_ENGINE=mysql and the DB_* credentials there to select MySQL. PostgreSQL
providers are configured through DATABASE_URL instead.
Run migrations:

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
Step 4 — Node.js & React (Vite)
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v    # should print v20.x.x
npm -v     # should print 10.x.x
Create the React project:

# From your ~/styleshop folder
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
tailwind.config.js:

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
src/index.css — replace all contents:

@tailwind base;
@tailwind components;
@tailwind utilities;
Start the dev server:

npm run dev
# Vite runs at http://localhost:5173
Step 5 — Run both servers
Open two terminals:

# Terminal 1 — Django (from ~/styleshop, with venv active)
source venv/bin/activate
python manage.py runserver

# Terminal 2 — React (from ~/styleshop/frontend)
npm run dev
Step 6 — Verify everything works
# Check MySQL is running
sudo systemctl status mysql

# Check Django can reach the DB (from venv)
python manage.py dbshell
# You should drop into a mysql> prompt — type EXIT; to leave

# Check the Django API responds
curl http://localhost:8000/api/clothes/

# Check Node/npm versions
node -v && npm -v

Project usage
-------------
Activate the virtual environment, install requirements, then apply migrations:

source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_clothes

The seed command is safe to rerun; it adds any missing sample rows and preserves
changes made to existing sample items.
SQLite is the default database. To use the MySQL database from the setup above,
copy .env.example to .env and set DB_ENGINE=mysql plus your DB credentials. The
MySQL server and mysqlclient build dependencies must be installed first.

Authentication API
------------------
POST /api/auth/register/ accepts username, email, and password, creates a customer,
and returns access and refresh JWTs. POST /api/auth/token/ accepts username and
password for sign-in. POST /api/auth/token/refresh/ exchanges a refresh JWT for a
new access JWT. GET /api/auth/me/ returns the signed-in user's profile and requires
Authorization: Bearer <access-token>. Access tokens expire after 30 minutes and
refresh tokens after 7 days. POST /api/auth/logout/ blacklists the refresh token.
The React storefront includes sign-in, registration, session restore, and sign-out.
Product changes remain staff-only in the API/admin.

To verify the configured DB really accepts a connection, run:

python manage.py shell -c 'from django.db import connection; connection.ensure_connection(); print(connection.vendor, "connection OK")'

For an SQLite seed row count, run:

python manage.py shell -c 'from store.models import ClothingItem; print(ClothingItem.objects.count())'

Cart and hosting
----------------
The storefront cart is stored in the current browser's local storage. It supports
adding clothing, changing quantities, removing items, and showing a subtotal.
Checkout and order placement are not implemented yet.

The render.yaml Blueprint prepares a Render static storefront and Django API.
Create a PostgreSQL database on Neon, then connect your Git repository in Render
using New > Blueprint. Supply the Neon connection URL when Render requests
DATABASE_URL. The Blueprint connects the storefront URL to the API and applies
migrations plus the sample catalog during its build.

Render's free web services sleep after 15 minutes without traffic, and its own
free PostgreSQL databases expire after 30 days. Neon Free PostgreSQL computes
sleep after 5 minutes idle and has 0.5 GB storage and 100 compute-hours per month.
These free tiers suit demos and learning, not a store with production customers.
See the provider docs for current limits before deployment.

For local MySQL installs, install mysqlclient separately with
pip install -r requirements-mysql.txt after installing the system MySQL headers.
