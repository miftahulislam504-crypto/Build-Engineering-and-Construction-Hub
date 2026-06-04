"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Invalid email address"); return; }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      const msg =
        err.code === "auth/user-not-found"
          ? "No account found with this email."
          : "Failed to send reset email. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-modal p-8">

        {sent ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
                            justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="font-display text-xl font-bold text-dark-900 mb-3">
              Email Sent
            </h2>
            <p className="text-dark-500 text-sm mb-6 leading-relaxed">
              Password reset link sent to{" "}
              <span className="font-semibold text-dark-800">{email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <Link href="/auth/login" className="btn-primary w-full justify-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold text-dark-900 mb-1">
                Forgot Password
              </h1>
              <p className="text-dark-400 text-sm">
                Enter your email to receive a reset link
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    className={cn("input pl-10", error && "input-error")}
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center btn-lg"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-dark-500
                           hover:text-primary-600 transition-colors"
              >
                <ArrowLeft size={15} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
