@echo off
echo Deploying Adfali (ادفع لي) Edge Functions to Supabase...
echo.

REM Deploy edfali-init
echo [1/2] Deploying edfali-init...
npx supabase functions deploy edfali-init --project-ref vkfzyzsnkdlybexfqjmt --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy edfali-init
    pause
    exit /b 1
)
echo [1/2] edfali-init deployed successfully!
echo.

REM Deploy edfali-confirm
echo [2/2] Deploying edfali-confirm...
npx supabase functions deploy edfali-confirm --project-ref vkfzyzsnkdlybexfqjmt --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy edfali-confirm
    pause
    exit /b 1
)
echo [2/2] edfali-confirm deployed successfully!
echo.

REM Set secrets (credentials stored server-side, NOT in frontend code)
echo Setting Adfali credentials as Supabase secrets...
npx supabase secrets set EDFALI_MOBILE=0923987512 --project-ref vkfzyzsnkdlybexfqjmt
npx supabase secrets set EDFALI_PIN=6529 --project-ref vkfzyzsnkdlybexfqjmt
npx supabase secrets set EDFALI_PW=123@xdsr$#!! --project-ref vkfzyzsnkdlybexfqjmt
echo.

echo ============================================
echo  All done! Adfali payment is now deployed.
echo ============================================
pause
