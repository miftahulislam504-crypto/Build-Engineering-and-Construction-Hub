"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { whatsappLink, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill required fields"); return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...form, createdAt: serverTimestamp(), isRead: false,
      });
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-14">
        <div className="container-main text-center">
          <h1 className="font-display text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-primary-200 text-sm max-w-md mx-auto">
            Have questions? We are here to help you with your construction needs.
          </p>
        </div>
      </div>

      <div className="container-main py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

          {/* Contact Info */}
          <div className="space-y-5">
            <h2 className="font-display text-xl font-bold text-dark-900">Get In Touch</h2>

            {[
              {
                icon: Phone,
                label: "Call Us",
                value: process.env.NEXT_PUBLIC_CALL_NUMBER || "+880 1XXX-XXXXXX",
                href:  `tel:${process.env.NEXT_PUBLIC_CALL_NUMBER}`,
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: MessageSquare,
                label: "WhatsApp",
                value: "Chat on WhatsApp",
                href:  whatsappLink(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""),
                color: "bg-green-50 text-green-600",
              },
              {
                icon: Mail,
                label: "Email",
                value: "info@buildenginex.vercel.app",
                href:  "mailto:info@buildenginex.vercel.app",
                color: "bg-orange-50 text-orange-600",
              },
              {
                icon: MapPin,
                label: "Office",
                value: "Dhaka, Bangladesh",
                href:  "#",
                color: "bg-purple-50 text-purple-600",
              },
            ].map(({ icon: Icon, label, value, href, color }) => (
              <a key={label} href={href}
                className="flex items-center gap-4 p-4 card hover:shadow-card-hover
                           transition-shadow group">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-0.5">{label}</p>
                  <p className="font-medium text-dark-800 text-sm group-hover:text-primary-700
                                 transition-colors">
                    {value}
                  </p>
                </div>
              </a>
            ))}

            {/* Office Hours */}
            <div className="card p-5">
              <p className="font-semibold text-dark-800 text-sm mb-3">Office Hours</p>
              <div className="space-y-1.5 text-xs text-dark-500">
                <div className="flex justify-between">
                  <span>Saturday – Thursday</span>
                  <span className="font-medium text-dark-700">9:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday</span>
                  <span className="font-medium text-dark-700">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-dark-900 mb-5">
                Send a Message
              </h2>

              {sent ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
                                   justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-display font-bold text-dark-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-dark-500 text-sm mb-5">
                    Thank you for contacting us. We will get back to you within 24 hours.
                  </p>
                  <button onClick={() => setSent(false)} className="btn-primary btn-sm">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="input" placeholder="Your full name" required />
                    </div>
                    <div>
                      <label className="label">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input type="email" value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className="input" placeholder="your@email.com" required />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input type="tel" value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className="input" placeholder="01XXXXXXXXX" />
                    </div>
                    <div>
                      <label className="label">Subject</label>
                      <input type="text" value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        className="input" placeholder="How can we help?" />
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea value={form.message} rows={5} required
                      onChange={(e) => update("message", e.target.value)}
                      className="input resize-none"
                      placeholder="Describe your inquiry in detail..." />
                  </div>
                  <button type="submit" disabled={sending}
                    className="btn-primary w-full justify-center btn-lg">
                    {sending ? (
                      <><Loader2 size={18} className="animate-spin" /> Sending...</>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
