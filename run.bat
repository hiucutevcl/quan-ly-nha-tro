@echo off
echo ===================================================
echo   KHOI DONG HE THONG QUAN LY NHA TRO 
echo ===================================================

echo.
echo [1/3] Kiem tra phien ban Node.js...
node -v
if %errorlevel% neq 0 (
    echo [LOI] Vui long cai dat Node.js de chay du an.
    pause
    exit
)

echo.
echo [2/3] Khoi dong Backend (Port 5000)...
start "Backend - Nha Tro" cmd /k "cd backend && npm install && npm start"

echo.
echo [3/3] Khoi dong Frontend (Port 5173 / 3000)...
start "Frontend - Nha Tro" cmd /k "cd frontend && npm install --legacy-peer-deps && npm run dev"

echo.
echo ===================================================
echo  He thong dang khoi dong. Vui long doi giay lat...
echo  - Backend se chay tren port 5000
echo  - Frontend se chay tren port 5173 hoac 3000
echo ===================================================
pause
