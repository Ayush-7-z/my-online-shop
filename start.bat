@echo off
cd /d "%~dp0"
echo Starting ShopEase on http://localhost:8000
php -S 127.0.0.1:8000 -t frontend router-dev.php
