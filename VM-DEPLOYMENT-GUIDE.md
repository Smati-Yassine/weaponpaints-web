# VM Deployment Guide - CS2 WeaponPaints Web Interface

## 🚀 Quick Start on VM

### Prerequisites
- Ubuntu/Debian VM (or similar Linux distribution)
- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL 8.0+
- Git

---

## Step 1: Install Dependencies on VM

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0

# Install MySQL (if not already installed)
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
```

---

## Step 2: Setup MySQL Database

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE cs2_server;
CREATE USER 'cs2_user'@'localhost' IDENTIFIED BY '1304';
GRANT ALL PRIVILEGES ON cs2_server.* TO 'cs2_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Test connection
mysql -u cs2_user -p1304 cs2_server
```

### Create Database Tables

The CS2 WeaponPaints plugin will create these tables automatically, but if you need to create them manually:

```sql
USE cs2_server;

-- Weapon skins table
CREATE TABLE IF NOT EXISTS `wp_player_skins` (
  `steamid` varchar(18) NOT NULL,
  `weapon_team` int(1) NOT NULL,
  `weapon_defindex` int(6) NOT NULL,
  `weapon_paint_id` int(6) NOT NULL,
  `weapon_wear` float NOT NULL DEFAULT 0.000001,
  `weapon_seed` int(16) NOT NULL DEFAULT 0,
  `weapon_nametag` VARCHAR(128) DEFAULT NULL,
  `weapon_stattrak` tinyint(1) NOT NULL DEFAULT 0,
  `weapon_stattrak_count` int(10) NOT NULL DEFAULT 0,
  `weapon_sticker_0` VARCHAR(128) NOT NULL DEFAULT '0;0;0;0;0;0;0',
  `weapon_sticker_1` VARCHAR(128) NOT NULL DEFAULT '0;0;0;0;0;0;0',
  `weapon_sticker_2` VARCHAR(128) NOT NULL DEFAULT '0;0;0;0;0;0;0',
  `weapon_sticker_3` VARCHAR(128) NOT NULL DEFAULT '0;0;0;0;0;0;0',
  `weapon_sticker_4` VARCHAR(128) NOT NULL DEFAULT '0;0;0;0;0;0;0',
  `weapon_keychain` VARCHAR(128) NOT NULL DEFAULT '0;0;0;0;0',
  UNIQUE KEY `steamid` (`steamid`, `weapon_team`, `weapon_defindex`)
);

-- Knife table
CREATE TABLE IF NOT EXISTS `wp_player_knife` (
  `steamid` varchar(18) NOT NULL,
  `weapon_team` int(1) NOT NULL,
  `knife` varchar(64) NOT NULL,
  UNIQUE KEY `steamid` (`steamid`, `weapon_team`)
);

-- Gloves table
CREATE TABLE IF NOT EXISTS `wp_player_gloves` (
  `steamid` varchar(18) NOT NULL,
  `weapon_team` int(1) NOT NULL,
  `weapon_defindex` int(11) NOT NULL,
  UNIQUE KEY `steamid` (`steamid`, `weapon_team`)
);

-- Agents table
CREATE TABLE IF NOT EXISTS `wp_player_agents` (
  `steamid` varchar(18) NOT NULL,
  `agent_ct` varchar(64) DEFAULT NULL,
  `agent_t` varchar(64) DEFAULT NULL,
  UNIQUE KEY `steamid` (`steamid`)
);

-- Music table
CREATE TABLE IF NOT EXISTS `wp_player_music` (
  `steamid` varchar(64) NOT NULL,
  `weapon_team` int(1) NOT NULL,
  `music_id` int(11) NOT NULL,
  UNIQUE KEY `steamid` (`steamid`, `weapon_team`)
);

-- Pins table
CREATE TABLE IF NOT EXISTS `wp_player_pins` (
  `steamid` varchar(64) NOT NULL,
  `weapon_team` int(1) NOT NULL,
  `id` int(11) NOT NULL,
  UNIQUE KEY `steamid` (`steamid`, `weapon_team`)
);
```

---

## Step 3: Clone and Setup Project

```bash
# Navigate to your web directory
cd /var/www  # or wherever you want to deploy

# Clone/copy your project
# (Assuming you're transferring files to VM)

# Navigate to project
cd cs2-weaponpaints-web-interface

# Install all dependencies
npm run install:all

# This will install dependencies for both backend and frontend
```

---

## Step 4: Configure Environment Variables

```bash
# Backend configuration
cd backend
cp .env.example .env
nano .env  # or use vim/vi
```

Update the `.env` file with your VM's IP address:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=cs2_user
DB_PASSWORD=1304
DB_NAME=cs2_server

# Steam Authentication
STEAM_API_KEY=07D0B8130AC860282B7C42FD2C80B979
STEAM_RETURN_URL=http://YOUR_VM_IP:5000/api/auth/steam/callback
STEAM_REALM=http://YOUR_VM_IP:5000

# Session Configuration
SESSION_SECRET=your_secure_random_secret_here_change_this
SESSION_MAX_AGE=86400000

# CORS Configuration
CORS_ORIGIN=http://YOUR_VM_IP:3000
```

```bash
# Frontend configuration
cd ../frontend
cp .env.example .env
nano .env
```

Update frontend `.env`:

```env
VITE_API_BASE_URL=http://YOUR_VM_IP:5000/api
```

**Replace `YOUR_VM_IP` with your actual VM IP address (e.g., `34.76.234.253`)**

---

## Step 5: Run Tests (Optional but Recommended)

```bash
# Test backend
cd backend
npm test

# If tests fail due to database, that's expected
# The important tests are the unit tests for validation, serialization, etc.
```

---

## Step 6: Start the Application

### Option 1: Development Mode (for testing)

```bash
# From project root
npm run dev

# This starts both backend (port 5000) and frontend (port 3000)
```

### Option 2: Production Mode with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Build the application
npm run build

# Start backend with PM2
cd backend
pm2 start dist/index.js --name cs2-backend

# Start frontend with PM2 (using serve)
cd ../frontend
npm install -g serve
pm2 start "serve -s dist -l 3000" --name cs2-frontend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

---

## Step 7: Configure Firewall

```bash
# Allow ports 3000 (frontend) and 5000 (backend)
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp
sudo ufw allow 80/tcp   # If using nginx
sudo ufw allow 443/tcp  # If using SSL

# Enable firewall if not already enabled
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 8: Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/cs2-weaponpaints
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name YOUR_VM_IP;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/cs2-weaponpaints /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

---

## Step 9: Verify Installation

```bash
# Check if backend is running
curl http://localhost:5000/health

# Should return: {"status":"ok","message":"CS2 WeaponPaints API is running"}

# Check if frontend is accessible
curl http://localhost:3000

# Check PM2 status
pm2 status

# View logs
pm2 logs cs2-backend
pm2 logs cs2-frontend
```

---

## Step 10: Access the Application

Open your browser and navigate to:
- **Frontend:** `http://YOUR_VM_IP:3000` (or `http://YOUR_VM_IP` if using Nginx)
- **Backend API:** `http://YOUR_VM_IP:5000/health`
- **Steam Login:** `http://YOUR_VM_IP:3000` → Click "Login with Steam"

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs cs2-backend

# Common issues:
# 1. Database connection - verify MySQL is running
sudo systemctl status mysql

# 2. Port already in use
sudo lsof -i :5000

# 3. Environment variables not set
cd backend && cat .env
```

### Frontend won't start
```bash
# Check logs
pm2 logs cs2-frontend

# Rebuild frontend
cd frontend
npm run build
```

### Database connection fails
```bash
# Test MySQL connection
mysql -u cs2_user -p1304 cs2_server

# Check MySQL is running
sudo systemctl status mysql

# Restart MySQL if needed
sudo systemctl restart mysql
```

### Steam authentication not working
- Verify `STEAM_API_KEY` is correct in `.env`
- Ensure `STEAM_RETURN_URL` matches your VM IP
- Check firewall allows incoming connections on port 5000

---

## 📊 Monitoring

```bash
# View PM2 dashboard
pm2 monit

# View logs in real-time
pm2 logs

# Restart services
pm2 restart cs2-backend
pm2 restart cs2-frontend

# Stop services
pm2 stop cs2-backend
pm2 stop cs2-frontend
```

---

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull  # or copy new files

# Reinstall dependencies if needed
npm run install:all

# Rebuild
npm run build

# Restart services
pm2 restart all
```

---

## 🔐 Security Recommendations

1. **Change SESSION_SECRET** to a strong random string
2. **Use HTTPS** in production (setup SSL with Let's Encrypt)
3. **Restrict MySQL** to localhost only
4. **Keep Node.js and npm updated**
5. **Regular backups** of the database
6. **Monitor logs** for suspicious activity

---

## 📝 Quick Commands Reference

```bash
# Start everything
npm run dev

# Stop PM2 services
pm2 stop all

# Restart PM2 services
pm2 restart all

# View logs
pm2 logs

# Check status
pm2 status

# Database backup
mysqldump -u cs2_user -p1304 cs2_server > backup.sql

# Database restore
mysql -u cs2_user -p1304 cs2_server < backup.sql
```

---

## ✅ Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] MySQL installed and running
- [ ] Database `cs2_server` created
- [ ] Database tables created
- [ ] Project files copied to VM
- [ ] Dependencies installed (`npm run install:all`)
- [ ] Environment variables configured (`.env` files)
- [ ] Backend starts successfully
- [ ] Frontend builds successfully
- [ ] Firewall configured
- [ ] PM2 configured (for production)
- [ ] Nginx configured (optional)
- [ ] Steam authentication tested
- [ ] Database connection verified

---

**Good luck with your deployment! 🚀**

If you encounter any issues, check the logs with `pm2 logs` or review the troubleshooting section above.
