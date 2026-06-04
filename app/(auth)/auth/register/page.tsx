"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name:     "",
    email:    "",
    phone:    "",
    password: "",
    confirm:  "",
  });
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  // ── Validation ──
  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())          e.name    = "Name is required";
    if (!form.email)                e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (form.phone && !/^01[3-9]\d{8}$/.test(form.phone))
                                    e.phone   = "Invalid BD phone number";
    if (!form.password)             e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Email Register ──
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth, form.email, form.password
      );

      // Update display name
      await updateProfile(cred.user, { displayName: form.name });

      // Save to Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        name:       form.name,
        email:      form.email,
        phone:      form.phone || "",
        role:       "customer",
        avatar:     "",
        isVerified: false,
        createdAt:  serverTimestamp(),
        updatedAt:  serverTimestamp(),
      });

      toast.success("Account created successfully!");
      router.push("/");
    } catch (err: any) {
      const msg =
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Google Register ──
  async function handleGoogle() {
    setGLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Account created with Google!");
      router.push("/");
    } catch {
      toast.error("Google signup failed. Please try again.");
    } finally {
      setGLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-modal p-8">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-dark-900 mb-1">
            Create Account
          </h1>
          <p className="text-dark-400 text-sm">
            Join BuildMart BD today
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          disabled={gLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4
                     rounded-xl border-2 border-dark-200 hover:border-dark-300
                     hover:bg-dark-50 transition-all duration-200 mb-6
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {gLoading ? (
            <Loader2 size={18} className="animate-spin text-dark-400" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span className="text-sm font-medium text-dark-700">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-dark-100" />
          <span className="text-xs text-dark-400">or register with email</span>
          <div className="flex-1 h-px bg-dark-100" />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Name */}
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your full name"
                className={cn("input pl-10", errors.name && "input-error")}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="your@email.com"
                className={cn("input pl-10", errors.email && "input-error")}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="label">
              Phone Number
              <span className="text-dark-400 font-normal ml-1">(optional)</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="01XXXXXXXXX"
                className={cn("input pl-10", errors.phone && "input-error")}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 6 characters"
                className={cn("input pl-10 pr-10", errors.password && "input-error")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2
                           text-dark-400 hover:text-dark-600 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type={showPass ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                placeholder="Repeat your password"
                className={cn("input pl-10", errors.confirm && "input-error")}
              />
            </div>
            {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
          </div>

          {/* Terms */}
          <p className="text-xs text-dark-400 text-center">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-primary-600 hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</Link>
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center btn-lg"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Creating Account...</>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-dark-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login"
            className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
