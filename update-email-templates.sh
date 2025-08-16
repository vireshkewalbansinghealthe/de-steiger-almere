#!/bin/bash

# Unity Units - Supabase Email Template Update Script
# This script updates the email templates for the de-steiger-cms project

PROJECT_REF="dsqzacajytrbhgmdrjgv"

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    echo "📁 Loading environment variables from .env.local..."
    export $(grep -v '^#' .env.local | xargs)
fi

# Check if SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN environment variable is not set"
    echo ""
    echo "Please add your Supabase access token to .env.local:"
    echo "1. Get your access token from: https://supabase.com/dashboard/account/tokens"
    echo "2. Add this line to your .env.local file:"
    echo "   SUPABASE_ACCESS_TOKEN=sbp_your_token_here"
    echo "3. Run this script again"
    echo ""
    echo "Alternatively, you can run:"
    echo "export SUPABASE_ACCESS_TOKEN=\"your-access-token\" && ./update-email-templates.sh"
    exit 1
fi

echo "🚀 Updating Unity Units email templates for project: $PROJECT_REF"

# Confirmation email template (minified HTML)
CONFIRMATION_TEMPLATE='<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Bevestig uw account - Unity Units</title><style>@import url('\''https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'\'');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'\''Inter'\'', -apple-system, BlinkMacSystemFont, '\''Segoe UI'\'', Roboto, sans-serif;line-height:1.6;color:#374151;background-color:#f8fafc}.email-container{max-width:600px;margin:0 auto;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.header{background:linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);padding:40px 32px;text-align:center;position:relative;overflow:hidden}.header::before{content:'\'\'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(45deg, transparent 30%, rgba(250, 204, 21, 0.1) 50%, transparent 70%);animation:shimmer 3s ease-in-out infinite}@keyframes shimmer{0%, 100%{transform:translateX(-100%)}50%{transform:translateX(100%)}}.logo{width:80px;height:80px;background:linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);border-radius:20px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(251, 191, 36, 0.3);position:relative;z-index:1}.logo-text{color:#0f172a;font-size:28px;font-weight:700;letter-spacing:-0.5px}.welcome-title{color:#ffffff;font-size:32px;font-weight:700;margin-bottom:12px;position:relative;z-index:1}.welcome-subtitle{color:#cbd5e1;font-size:18px;font-weight:400;position:relative;z-index:1}.content{background:#ffffff;padding:48px 32px}.greeting{font-size:20px;font-weight:600;color:#1f2937;margin-bottom:24px}.message{font-size:16px;color:#6b7280;margin-bottom:32px;line-height:1.7}.cta-container{text-align:center;margin:40px 0}.cta-button{display:inline-block;background:linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);color:#0f172a;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 4px 14px 0 rgba(251, 191, 36, 0.4);transition:all 0.3s ease;border:2px solid transparent}.cta-button:hover{transform:translateY(-2px);box-shadow:0 8px 25px 0 rgba(251, 191, 36, 0.5);background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%)}.alternative-link{margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #fbbf24}.alternative-text{font-size:14px;color:#6b7280;margin-bottom:8px}.link-text{font-size:13px;color:#374151;word-break:break-all;font-family:'\''Monaco'\'', '\''Menlo'\'', '\''Ubuntu Mono'\'', monospace;background:#ffffff;padding:8px;border-radius:4px;border:1px solid #e5e7eb}.footer{background:#f8fafc;padding:32px;text-align:center;border-top:1px solid #e5e7eb}.footer-text{color:#9ca3af;font-size:14px;margin-bottom:16px}.company-info{color:#6b7280;font-size:13px;line-height:1.5}.security-note{background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin-top:24px}.security-title{color:#92400e;font-weight:600;font-size:14px;margin-bottom:8px}.security-text{color:#a16207;font-size:13px;line-height:1.5}@media (max-width: 600px){.email-container{margin:16px;border-radius:12px}.header{padding:32px 24px}.content{padding:32px 24px}.welcome-title{font-size:28px}.logo{width:64px;height:64px}.logo-text{font-size:24px}}</style></head><body><div style="padding: 32px 16px; background-color: #f8fafc; min-height: 100vh;"><div class="email-container"><div class="header"><div class="logo"><div class="logo-text">U</div></div><h1 class="welcome-title">Welkom bij Unity Units!</h1><p class="welcome-subtitle">Bevestig uw account om te beginnen</p></div><div class="content"><div class="greeting">Hallo daar! 👋</div><div class="message">Bedankt voor het aanmelden bij Unity Units! We zijn verheugd u te verwelkomen in onze community van ondernemers en investeerders.<br><br>Om uw account te activeren en toegang te krijgen tot al onze premium bedrijfsunits en opslagboxen, hoeft u alleen maar op onderstaande knop te klikken.</div><div class="cta-container"><a href="{{ .ConfirmationURL }}" class="cta-button">✨ Activeer Mijn Account</a></div><div class="alternative-link"><div class="alternative-text"><strong>Werkt de knop niet?</strong> Kopieer en plak deze link in uw browser:</div><div class="link-text">{{ .ConfirmationURL }}</div></div><div class="security-note"><div class="security-title">🔒 Veiligheid eerst</div><div class="security-text">Deze link is 24 uur geldig en kan slechts één keer worden gebruikt. Als u deze aanmelding niet heeft gedaan, kunt u deze e-mail veilig negeren.</div></div></div><div class="footer"><div class="footer-text">Deze e-mail werd verzonden door Unity Units</div><div class="company-info">Unity Units BV<br>Premium Bedrijfsruimtes & Opslagoplossingen<br>Nederland</div></div></div></div></body></html>'

# Update email templates using Supabase Management API
echo "📧 Updating email templates..."

curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
      \"mailer_subjects_confirmation\": \"Welkom bij Unity Units - Bevestig uw account\",
      \"mailer_templates_confirmation_content\": \"$CONFIRMATION_TEMPLATE\",
      \"mailer_subjects_magic_link\": \"Uw Unity Units inlog link\",
      \"mailer_templates_magic_link_content\": \"<div style='font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;'><div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); padding: 40px 32px; text-align: center;'><div style='width: 80px; height: 80px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3);'><div style='color: #0f172a; font-size: 28px; font-weight: 700;'>U</div></div><h1 style='color: #ffffff; font-size: 32px; font-weight: 700; margin-bottom: 12px;'>Inloggen bij Unity Units</h1><p style='color: #cbd5e1; font-size: 18px;'>Uw persoonlijke inlog link</p></div><div style='background: #ffffff; padding: 48px 32px;'><div style='font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 24px;'>Hallo! 👋</div><div style='font-size: 16px; color: #6b7280; margin-bottom: 32px; line-height: 1.7;'>U heeft een inlog link aangevraagd voor uw Unity Units account. Klik op onderstaande knop om veilig in te loggen zonder wachtwoord.</div><div style='text-align: center; margin: 40px 0;'><a href='{{ .ConfirmationURL }}' style='display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(251, 191, 36, 0.4);'>🔐 Inloggen bij Unity Units</a></div></div></div>\",
      \"mailer_subjects_recovery\": \"Reset uw Unity Units wachtwoord\",
      \"mailer_templates_recovery_content\": \"<div style='font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;'><div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); padding: 40px 32px; text-align: center;'><div style='width: 80px; height: 80px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3);'><div style='color: #0f172a; font-size: 28px; font-weight: 700;'>U</div></div><h1 style='color: #ffffff; font-size: 32px; font-weight: 700; margin-bottom: 12px;'>Wachtwoord Reset</h1><p style='color: #cbd5e1; font-size: 18px;'>Stel uw nieuwe wachtwoord in</p></div><div style='background: #ffffff; padding: 48px 32px;'><div style='font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 24px;'>Hallo! 👋</div><div style='font-size: 16px; color: #6b7280; margin-bottom: 32px; line-height: 1.7;'>U heeft een wachtwoord reset aangevraagd voor uw Unity Units account. Klik op onderstaande knop om een nieuw wachtwoord in te stellen.</div><div style='text-align: center; margin: 40px 0;'><a href='{{ .ConfirmationURL }}' style='display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(251, 191, 36, 0.4);'>🔑 Nieuw Wachtwoord Instellen</a></div></div></div>\"
  }"

if [ $? -eq 0 ]; then
    echo "✅ Email templates updated successfully!"
    echo "🎉 Your Unity Units email templates are now live with:"
    echo "   - Beautiful Dutch branding"
    echo "   - Unity Units logo and colors"
    echo "   - Professional dark/yellow theme"
    echo "   - Mobile-responsive design"
    echo ""
    echo "Test it by registering a new user in your app!"
else
    echo "❌ Failed to update email templates"
    echo "Please check your SUPABASE_ACCESS_TOKEN and try again"
fi
