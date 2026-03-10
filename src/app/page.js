"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });
  const [step, setStep] = useState("credentials"); // for signup: "credentials" | "otp"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      setMessage("Login successful. Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupStart(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }
      setMessage(
        "OTP requested. Please obtain OTP from admin and enter it below."
      );
      setStep("otp");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }
      setMessage("Signup complete. Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-parasWhite text-slate-900 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="space-y-6 order-2 md:order-1">
          <div className="flex items-center gap-3">
            <Image
              src="/paras-logo.png"
              alt="Paras Offset logo"
              width={48}
              height={48}
              className="rounded-xl bg-parasWhite shadow-sm"
            />
            <div>
              <p className="text-xs font-semibold text-parasBlue uppercase tracking-wide">
                Paras Offset Pvt Ltd
              </p>
              <p className="text-[11px] text-slate-600">
                Print & Packaging • Operations
              </p>
            </div>
          </div>
          <div className="inline-flex items-center rounded-full bg-parasBlue/10 px-3 py-1 text-xs font-medium text-parasBlue ring-1 ring-parasBlue/40">
            Internal SaaS Dashboard
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Central dashboard for{" "}
            <span className="text-parasBlue">
              Job Cards, Dispatch & Inventory
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            Securely manage production jobs, dispatches, and raw material
            inventory in one place. Sign in to access the internal operations
            dashboard for Paras Offset Pvt Ltd.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
            <div className="rounded-2xl border border-parasGray bg-white p-4 space-y-2 shadow-sm">
              <p className="font-medium text-slate-900">Job Card Tracking</p>
              <p className="text-slate-600">
                Monitor status from Pending to Completed with search and
                history.
              </p>
            </div>
            <div className="rounded-2xl border border-parasGray bg-white p-4 space-y-2 shadow-sm">
              <p className="font-medium text-slate-900">Dispatch & Inventory</p>
              <p className="text-slate-600">
                Link dispatches to jobs and keep stock balances up to date.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-parasGray rounded-2xl shadow-xl p-5 md:p-8 space-y-6 order-1 md:order-2 w-full">
          <div className="flex rounded-full bg-parasGray/40 p-1 text-xs">
            <button
              className={`flex-1 rounded-full px-3 py-2 font-medium transition ${
                mode === "login"
                  ? "bg-parasBlue text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => {
                setMode("login");
                setStep("credentials");
                setError("");
                setMessage("");
              }}
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-full px-3 py-2 font-medium transition ${
                mode === "signup"
                  ? "bg-parasBlue text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => {
                setMode("signup");
                setStep("credentials");
                setError("");
                setMessage("");
              }}
            >
              First-time Signup
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-xl border border-parasTeal/40 bg-parasTeal/10 px-3 py-2 text-xs text-slate-800">
              {message}
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 text-xs">
                <label className="block text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-parasGray bg-parasWhite px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-parasBlue focus:outline-none focus:ring-1 focus:ring-parasBlue"
                  placeholder="you@parasoffset.com"
                />
              </div>
              <div className="space-y-2 text-xs">
                <label className="block text-slate-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-parasGray bg-parasWhite px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-parasBlue focus:outline-none focus:ring-1 focus:ring-parasBlue"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-parasBlue px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-parasBlue/30 transition hover:bg-[#0180b7] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login to Dashboard"}
              </button>
            </form>
          )}

          {mode === "signup" && step === "credentials" && (
            <form onSubmit={handleSignupStart} className="space-y-4">
              <div className="space-y-2 text-xs">
                <label className="block text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-parasGray bg-parasWhite px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-parasBlue focus:outline-none focus:ring-1 focus:ring-parasBlue"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2 text-xs">
                <label className="block text-slate-700">Work Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-parasGray bg-parasWhite px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-parasBlue focus:outline-none focus:ring-1 focus:ring-parasBlue"
                  placeholder="you@parasoffset.com"
                />
              </div>
              <div className="space-y-2 text-xs">
                <label className="block text-slate-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-parasGray bg-parasWhite px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-parasBlue focus:outline-none focus:ring-1 focus:ring-parasBlue"
                  placeholder="Create a strong password"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                An OTP will be sent to the admin email{" "}
                <span className="font-semibold text-parasBlue">
                  mis.admin@parasoffset.com
                </span>{" "}
                for verification. Please contact admin to receive the OTP.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-parasBlue px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-parasBlue/30 transition hover:bg-[#0180b7] disabled:opacity-60"
              >
                {loading ? "Requesting OTP..." : "Request OTP"}
              </button>
            </form>
          )}

          {mode === "signup" && step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2 text-xs">
                <label className="block text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-parasGray bg-parasWhite px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-parasBlue focus:outline-none focus:ring-1 focus:ring-parasBlue"
                  placeholder="you@parasoffset.com"
                />
              </div>
              <div className="space-y-2 text-xs">
                <label className="block text-slate-700">OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  className="w-full rounded-lg border border-parasGray bg-parasWhite px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-parasBlue focus:outline-none focus:ring-1 focus:ring-parasBlue tracking-[0.3em]"
                  placeholder="••••••"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setMessage("");
                    setError("");
                  }}
                  className="text-parasPink hover:text-parasBlue underline-offset-2 hover:underline"
                >
                  Change email or password
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-parasTeal px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-parasTeal/40 transition hover:bg-[#4aa0a9] disabled:opacity-60"
              >
                {loading ? "Verifying OTP..." : "Verify OTP & Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

