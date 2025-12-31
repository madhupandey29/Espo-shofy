@echo off
echo Updating Next.js to fix security vulnerability...
echo.

echo Step 1: Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✅ node_modules removed
) else (
    echo ℹ️ node_modules not found
)

echo.
echo Step 2: Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo ✅ package-lock.json removed
) else (
    echo ℹ️ package-lock.json not found
)

echo.
echo Step 3: Installing updated dependencies...
npm install

echo.
echo Step 4: Testing build...
npm run build

echo.
echo ✅ Update complete! Security vulnerability should be resolved.
echo.
echo Next steps:
echo 1. Test your app: npm run dev
echo 2. Commit changes: git add package.json package-lock.json
echo 3. Push to deploy: git push
pause