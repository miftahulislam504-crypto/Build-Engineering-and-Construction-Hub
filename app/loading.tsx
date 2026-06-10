export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center
                         justify-center mx-auto mb-5">
          <span className="text-white font-display font-bold text-2xl">B</span>
        </div>

        {/* Spinner */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-600 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <p className="text-dark-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
