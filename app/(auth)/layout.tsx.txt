import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-dark-900
                    flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">B</span>
          </div>
          <span className="font-display font-bold text-white text-xl">BuildMart BD</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-primary-300 text-xs">
          &copy; {new Date().getFullYear()} BuildMart BD. All rights reserved.
        </p>
      </div>
    </div>
  );
}
