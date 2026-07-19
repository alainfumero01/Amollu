import { exchangeJobberCode } from "@/lib/jobber";

function page(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f8f6f1;
            color: #17213f;
            font-family: Arial, Helvetica, sans-serif;
          }
          main {
            width: min(720px, calc(100% - 32px));
            background: #fff;
            border: 1px solid #ebe4d7;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(6, 17, 38, .12);
          }
          h1 { margin: 0 0 12px; font-size: 28px; line-height: 1.15; }
          p { color: #5f687b; line-height: 1.65; }
          code {
            display: block;
            white-space: pre-wrap;
            word-break: break-all;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #eee6d8;
            background: #fbfaf7;
            color: #17213f;
          }
          a { color: #b87a1f; font-weight: 700; }
        </style>
      </head>
      <body><main>${body}</main></body>
    </html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const expectedState = process.env.JOBBER_OAUTH_STATE?.trim();

  if (error) {
    return page(
      "Jobber authorization was cancelled",
      `<h1>Jobber was not connected.</h1><p>${escapeHtml(error)}</p>`,
      400,
    );
  }

  if (!code) {
    return page(
      "Connect Jobber",
      "<h1>Ready to connect Jobber.</h1><p>This callback page is working. To authorize Jobber, start from <a href=\"/api/jobber/connect\">the Jobber connect link</a> so Jobber can send the authorization code back here.</p>",
    );
  }

  if (expectedState && state !== expectedState) {
    return page(
      "Jobber state mismatch",
      "<h1>Jobber could not be connected.</h1><p>The OAuth state did not match. Start again from the connect link.</p>",
      400,
    );
  }

  try {
    const tokens = await exchangeJobberCode(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      throw new Error("Jobber did not return a refresh token.");
    }

    return page(
      "Jobber connected",
      `<h1>Jobber authorization succeeded.</h1>
        <p>Add this value to Vercel as <strong>JOBBER_REFRESH_TOKEN</strong>, then redeploy or promote a new production deployment.</p>
        <code>${escapeHtml(refreshToken)}</code>
        <p>Keep this token private. If refresh token rotation is on in Jobber, this token can only be used once unless the app stores the replacement token.</p>`,
    );
  } catch (authError) {
    const message = authError instanceof Error ? authError.message : "Jobber authorization failed.";

    return page(
      "Jobber authorization failed",
      `<h1>Jobber could not be connected.</h1><p>${escapeHtml(message)}</p>`,
      502,
    );
  }
}
