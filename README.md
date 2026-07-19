# Amollu Services

One-page Next.js website for Amollu Services, focused on residential property care,
commercial services, facility solutions, and quote requests.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quote Form Email

The quote form uses a Vercel serverless route and Resend for email delivery.
Set these environment variables in Vercel before expecting live submissions:

```bash
QUOTE_TO_EMAIL=Info@amollu.com
QUOTE_FROM_EMAIL=quotes@your-verified-domain.com
RESEND_API_KEY=your_resend_api_key
```

If the email variables are not configured, the form shows a clear message asking
visitors to call or email Amollu directly.

## Deploy

This app is ready for Vercel. The canonical repository is:

```text
https://github.com/alainfumero01/Amollu/
```
