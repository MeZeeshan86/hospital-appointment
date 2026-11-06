# Project 2 — Hospital Appointment Booking System

## Modules covered
- Patient registration and login
- Doctor details and specialization search
- Appointment booking and cancellation
- Admin appointment management

## Run locally
Open PowerShell in this folder:
```powershell
py -m http.server 5500
```
Open http://localhost:5500

Demo admin: `admin@hospital.test` / `admin123`.
Register a patient account to test the patient flow.

## Selenium
Keep the application running at http://localhost:8080 (Docker) or set `APP_URL`.
```powershell
npm install
npm test
```
Node.js, npm and Google Chrome must be installed. Selenium 4 uses Selenium Manager to locate/download a compatible driver. The Jenkinsfile also runs these tests after deploying the container, so the Jenkins service account must be able to run Docker, Node.js, npm and Chrome.

## Docker
```powershell
docker build -t carepoint-hospital:latest .
docker run -d -p 8080:80 --name carepoint-hospital-container carepoint-hospital:latest
docker ps
```
Open http://localhost:8080
Stop/remove:
```powershell
docker stop carepoint-hospital-container
docker rm carepoint-hospital-container
```

## Important limitation
This is a browser-only academic prototype. It stores data in localStorage and uses demo credentials. It has no server/database, real authentication, privacy controls, or real hospital scheduling integration. Do not enter real patient information.
