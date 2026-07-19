import { NextResponse } from "next/server";
import { Resend } from "resend";
import { syncQuoteToJobber, type JobberSyncResult } from "@/lib/jobber";

type QuoteRequest = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  propertyType?: unknown;
  service?: unknown;
  message?: unknown;
};

type JobberEmailStatus =
  | JobberSyncResult
  | {
      status: "failed";
      message: string;
    };

const destinationEmail = process.env.QUOTE_TO_EMAIL || "Info@amollu.com";
const phoneDisplay = "682-560-0797";
const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.amolluservices.com";
const logoUrl = `${publicSiteUrl}/brand/amollu-logo-horizontal.png`;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(content: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8f6f1;font-family:Arial,Helvetica,sans-serif;color:#17213f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #ebe4d7;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:#061126;">
                <img src="${logoUrl}" width="180" alt="Amollu Services" style="display:block;width:180px;max-width:100%;height:auto;">
              </td>
            </tr>
            ${content}
            <tr>
              <td style="padding:24px 32px;background:#061126;color:#ffffff;font-size:14px;line-height:1.6;">
                <strong>Amollu Services</strong><br>
                Property care and facility solutions<br>
                <a href="tel:6825600797" style="color:#f2bd4c;text-decoration:none;">${phoneDisplay}</a> ·
                <a href="mailto:Info@amollu.com" style="color:#f2bd4c;text-decoration:none;">Info@amollu.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function ownerHtml(fields: {
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  service: string;
  message: string;
}, jobberStatus: JobberEmailStatus) {
  const jobberValue =
    jobberStatus.status === "synced"
      ? `Synced to request ${jobberStatus.requestId}`
      : jobberStatus.message;
  const rows = [
    ["Name", fields.name],
    ["Email", fields.email],
    ["Phone", fields.phone || "Not provided"],
    ["Property type", fields.propertyType],
    ["Requested service", fields.service],
    ["Jobber sync", jobberValue],
  ];

  return shell(`
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 10px;color:#c98924;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">New quote request</p>
        <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;color:#101936;">${escapeHtml(fields.name)} requested an estimate.</h1>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:24px 0;">
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #eee6d8;color:#5f687b;width:150px;font-size:14px;">${label}</td>
                  <td style="padding:12px 0;border-bottom:1px solid #eee6d8;color:#17213f;font-size:15px;font-weight:700;">${escapeHtml(value)}</td>
                </tr>`,
            )
            .join("")}
        </table>
        <p style="margin:0 0 8px;color:#5f687b;font-size:14px;">Message</p>
        <p style="margin:0;padding:16px;background:#fbfaf7;border:1px solid #eee6d8;border-radius:6px;color:#17213f;line-height:1.6;">${escapeHtml(fields.message).replace(/\n/g, "<br>")}</p>
        ${
          jobberStatus.status === "synced" && jobberStatus.requestUrl
            ? `<p style="margin:18px 0 0;"><a href="${escapeHtml(jobberStatus.requestUrl)}" style="color:#c98924;font-weight:700;text-decoration:none;">Open this request in Jobber</a></p>`
            : ""
        }
      </td>
    </tr>`);
}

function customerHtml(name: string) {
  return shell(`
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 10px;color:#c98924;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Quote request received</p>
        <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;color:#101936;">Thank you for contacting Amollu Services, ${escapeHtml(name)}.</h1>
        <p style="margin:0 0 16px;color:#5f687b;font-size:16px;line-height:1.7;">We received your request and will review the details you shared. Someone from Amollu Services will follow up as soon as possible.</p>
        <p style="margin:0 0 22px;color:#5f687b;font-size:16px;line-height:1.7;">If you need to reach us sooner, call us directly at <a href="tel:6825600797" style="color:#c98924;font-weight:700;text-decoration:none;">${phoneDisplay}</a>.</p>
        <a href="${publicSiteUrl}" style="display:inline-block;padding:14px 20px;background:#c98924;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:700;">Visit Amollu Services</a>
      </td>
    </tr>`);
}

export async function POST(request: Request) {
  let body: QuoteRequest;

  try {
    body = (await request.json()) as QuoteRequest;
  } catch {
    return NextResponse.json({ message: "Please submit a valid quote request." }, { status: 400 });
  }

  const name = readString(body.name);
  const email = readString(body.email);
  const phone = readString(body.phone);
  const propertyType = readString(body.propertyType);
  const service = readString(body.service);
  const message = readString(body.message);

  if (!name || !email || !propertyType || !service || !message) {
    return NextResponse.json({ message: "Please complete all required fields." }, { status: 400 });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.QUOTE_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return NextResponse.json(
      {
        message:
          "The quote form is not connected yet. Please call 682-560-0797 or email Info@amollu.com.",
      },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  let jobberStatus: JobberEmailStatus;

  try {
    jobberStatus = await syncQuoteToJobber({ name, email, phone, propertyType, service, message });
    if (jobberStatus.status === "synced") {
      console.info("Jobber quote sync succeeded", {
        requestId: jobberStatus.requestId,
        clientId: jobberStatus.clientId,
      });
    } else {
      console.warn("Jobber quote sync skipped", { message: jobberStatus.message });
    }
  } catch (error) {
    jobberStatus = {
      status: "failed",
      message: error instanceof Error ? error.message : "Jobber sync failed.",
    };
    console.error("Jobber quote sync failed", { message: jobberStatus.message });
  }

  try {
    const ownerEmail = await resend.emails.send({
      from: fromEmail,
      to: destinationEmail,
      replyTo: email,
      subject: `New Amollu quote request from ${name}`,
      html: ownerHtml({ name, email, phone, propertyType, service, message }, jobberStatus),
      text: [
        "New quote request from amollu.com",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Property type: ${propertyType}`,
        `Requested service: ${service}`,
        `Jobber sync: ${
          jobberStatus.status === "synced"
            ? `Synced to request ${jobberStatus.requestId}${jobberStatus.requestUrl ? ` (${jobberStatus.requestUrl})` : ""}`
            : jobberStatus.message
        }`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (ownerEmail.error) {
      throw new Error(ownerEmail.error.message);
    }

    const customerEmail = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: destinationEmail,
      subject: "We received your Amollu Services quote request",
      html: customerHtml(name),
      text: [
        `Thank you for contacting Amollu Services, ${name}.`,
        "",
        "We received your request and will review the details you shared.",
        `If you need to reach us sooner, call ${phoneDisplay} or email Info@amollu.com.`,
      ].join("\n"),
    });

    if (customerEmail.error) {
      throw new Error(customerEmail.error.message);
    }
  } catch {
    return NextResponse.json(
      {
        message:
          "The request could not be sent right now. Please call 682-560-0797 or email Info@amollu.com.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: "Thanks. Your request has been sent to Amollu Services.",
  });
}
