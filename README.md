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
NEXT_PUBLIC_SITE_URL=https://www.amolluservices.com
```

If the email variables are not configured, the form shows a clear message asking
visitors to call or email Amollu directly.

## Jobber Lead Sync

Website quote submissions can also sync into Jobber by creating or matching a
client, creating a request, and adding the full website submission as a pinned
request note.

Use this callback URL in the Jobber Developer Center:

```text
https://www.amolluservices.com/api/jobber/callback
```

Production needs these Vercel variables:

```bash
JOBBER_ENABLED=true
JOBBER_CLIENT_ID=your_jobber_client_id
JOBBER_CLIENT_SECRET=your_jobber_client_secret
JOBBER_REDIRECT_URI=https://www.amolluservices.com/api/jobber/callback
JOBBER_OAUTH_STATE=random_state_value
JOBBER_REFRESH_TOKEN=issued_after_jobber_authorization
```

After the app is deployed and the Jobber app has the callback URL above, visit
`https://www.amolluservices.com/api/jobber/connect` to authorize Jobber. The
callback page will show the refresh token that needs to be added to Vercel as
`JOBBER_REFRESH_TOKEN`.

This v1 setup stores the refresh token in Vercel env. Keep refresh token
rotation off in Jobber while using this setup, or add durable token storage
before turning rotation on.

## Deploy

This app is ready for Vercel. The canonical repository is:

```text
https://github.com/alainfumero01/Amollu/
```
