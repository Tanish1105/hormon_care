import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INTERESTS = new Set(["arogya", "garbha", "parenting", "other"]);

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20).replace(/[^\d+\s-]/g, "");
  const email = clean(body.email, 120);
  const interestRaw = clean(body.interest, 40);
  const message = clean(body.message, 1000);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }
  if (message.length < 8) {
    return NextResponse.json({ error: "Please write a short message" }, { status: 400 });
  }

  const interest = INTERESTS.has(interestRaw) ? interestRaw : null;

  const inquiry = await prisma.inquiry.create({
    data: {
      name,
      phone,
      email: email || null,
      interest,
      message,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: inquiry.id });
}
