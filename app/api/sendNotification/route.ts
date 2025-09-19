import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_PROJECT_KEY,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req: Request) {
  const { token, title, body } = await req.json();

  try {
    const response = await admin.messaging().send({
      token,
      notification: { title, body },
    });
    return NextResponse.json({ success: true, response });
  } catch (err) {
    console.error("Error sending message:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}