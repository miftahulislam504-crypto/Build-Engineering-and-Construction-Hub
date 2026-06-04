"use client";

import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Camera, Loader2, Save, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [form, setForm] = useState({
    name:  user?.name  || "",
    phone: user?.phone || "",
  });
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);

  const [pwForm, setPwForm] = useState({
    current: "", newPw: "", confirm: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  // ── Update profile ──
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      await updateProfile(auth.currentUser!, { displayName: form.name });
      await updateDoc(doc(db, "users", user!.id), {
        name:      form.name,
        phone:     form.phone,
        updatedAt: serverTimestamp(),
      });
      setUser({ ...user!, name: form.name, phone: form.phone });
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Avatar upload ──
  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user!.id}/avatar.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser!, { photoURL: url });
      await updateDoc(doc(db, "users", user!.id), {
        avatar: url, updatedAt: serverTimestamp(),
      });
      setUser({ ...user!, avatar: url });
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  // ── Change password ──
  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pwForm.current) { toast.error("Current password required"); return; }
    if (pwForm.newPw.length < 6) { toast.error("Min 6 characters"); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Passwords don't match"); return; }
    setPwSaving(true);
    try {
      const cred = EmailAuthProvider.credential(user!.email, pwForm.current);
      await reauthenticateWithCredential(auth.currentUser!, cred);
      await updatePassword(auth.currentUser!, pwForm.newPw);
      setPwForm({ current: "", newPw: "", confirm: "" });
      toast.success("Password changed successfully!");
    } catch (err: any) {
      const msg = err.code === "auth/wrong-password"
        ? "Current password is incorrect."
        : "Failed to change password.";
      toast.error(msg);
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="font-display text-2xl font-bold text-dark-900">Profile Settings</h1>

      {/* Avatar */}
      <div className="card p-6">
        <h2 className="font-semibold text-dark-800 mb-5">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-dark-100" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center border-2 border-dark-100">
                <span className="font-display font-bold text-3xl text-primary-700">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-white" />
              </div>
            )}
          </div>
          <div>
            <label className="btn-secondary btn-sm cursor-pointer inline-flex items-center gap-2">
              <Camera size={15} />
              {uploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-dark-400 mt-2">JPG, PNG. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="card p-6">
        <h2 className="font-semibold text-dark-800 mb-5">Basic Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="input bg-dark-50 text-dark-400 cursor-not-allowed"
            />
            <p className="text-xs text-dark-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="label">
              Phone Number
              <span className="text-dark-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="input"
              placeholder="01XXXXXXXXX"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h2 className="font-semibold text-dark-800 mb-5 flex items-center gap-2">
          <Lock size={17} className="text-dark-400" />
          Change Password
        </h2>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { label: "Current Password", key: "current",  ph: "Current password" },
            { label: "New Password",     key: "newPw",    ph: "Min. 6 characters" },
            { label: "Confirm Password", key: "confirm",  ph: "Repeat new password" },
          ].map(({ label, key, ph }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                type={showPw ? "text" : "password"}
                value={pwForm[key as keyof typeof pwForm]}
                onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                className="input"
                placeholder={ph}
              />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showpw"
              checked={showPw}
              onChange={(e) => setShowPw(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showpw" className="text-sm text-dark-500 cursor-pointer">
              Show passwords
            </label>
          </div>
          <button type="submit" disabled={pwSaving} className="btn-secondary">
            {pwSaving ? (
              <><Loader2 size={16} className="animate-spin" /> Updating...</>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
