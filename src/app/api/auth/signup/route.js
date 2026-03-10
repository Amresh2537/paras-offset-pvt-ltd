import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import OtpToken from "@/models/OtpToken";
import { hashPassword } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/mailer";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpToken.deleteMany({ email });
    await OtpToken.create({
      name,
      email,
      passwordHash,
      otp,
      expiresAt,
    });

    try {
      await sendOtpEmail({ otp, forEmail: email });
    } catch (err) {
      console.error("Failed to send OTP email", err);
      // Still allow flow; OTP exists in DB
    }

    return NextResponse.json({
      message:
        "OTP generated and sent to admin email. Please enter the OTP to complete signup.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

