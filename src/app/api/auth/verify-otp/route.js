import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import OtpToken from "@/models/OtpToken";
import { signJwt, createAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const record = await OtpToken.findOne({ email }).sort({ createdAt: -1 });
    if (!record) {
      return NextResponse.json(
        { message: "No OTP request found for this email" },
        { status: 400 }
      );
    }

    if (record.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    const { name, passwordHash } = record;

    const existing = await User.findOne({ email });
    if (existing) {
      await OtpToken.deleteMany({ email });
      return NextResponse.json(
        { message: "User already exists. Please login." },
        { status: 400 }
      );
    }

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role: "user",
    });

    await OtpToken.deleteMany({ email });

    const token = signJwt({
      sub: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const response = NextResponse.json({
      message: "OTP verified. Account created and logged in.",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    response.headers.set("Set-Cookie", createAuthCookie(token));

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

