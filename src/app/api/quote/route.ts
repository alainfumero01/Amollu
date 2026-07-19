import { NextResponse } from "next/server";
import { Resend } from "resend";

type QuoteRequest = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  propertyType?: unknown;
  service?: unknown;
  message?: unknown;
};

const destinationEmail = process.env.QUOTE_TO_EMAIL || "Info@amollu.com";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

  try {
    await resend.emails.send({
      from: fromEmail,
      to: destinationEmail,
      replyTo: email,
      subject: `New Amollu quote request from ${name}`,
      text: [
        "New quote request from amollu.com",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Property type: ${propertyType}`,
        `Requested service: ${service}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });
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
