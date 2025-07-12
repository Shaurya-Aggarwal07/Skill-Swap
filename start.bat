@echo off
echo Starting Skill Swap Platform...
echo.

echo Installing backend dependencies...
npm install

echo.
echo Installing frontend dependencies...
cd client
npm install
cd ..

echo.
echo Starting the application...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.
echo Admin credentials: admin@skillswap.com / admin123
echo.

npm run dev 