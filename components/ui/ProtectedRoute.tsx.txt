"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

interface Props {
  children:  React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAdmin   = useAuthStore((s) => s.isAdmin);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (adminOnly && !isAdmin()) {
      router.replace("/");
    }
  }, [user, isLoading, adminOnly, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-sm text-dark-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && !isAdmin()) return null;

  return <>{children}</>;
}
