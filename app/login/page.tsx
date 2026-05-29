"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Home, ArrowRight } from "lucide-react";

const CREDENTIALS = {
  admin: { password: "admin", role: "admin" as const, name: "Admin" },
  landowner: { password: "landowner", role: "landowner" as const, name: "Landowner" },
};

const SNOWFLAKES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  char: (["❄", "✦", "*", "❅"] as const)[i % 4],
  left: `${(i * 17 + 3) % 100}%`,
  duration: `${5 + (i * 7 % 11)}s`,
  delay: `-${(i * 3) % 10}s`,
  fontSize: `${10 + (i * 3 % 11)}px`,
  opacity: Number((0.3 + (i % 6) * 0.1).toFixed(1)),
  color: i % 3 === 0 ? "#22c55e" : "#ffffff",
}));

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const homeFor = (role: string) => role === 'admin' ? '/admin' : '/dashboard';

  useEffect(() => {
    if (user) router.replace(homeFor(user.role));
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = username.toLowerCase().trim() as keyof typeof CREDENTIALS;
    const cred = CREDENTIALS[key];
    if (!cred || cred.password !== password) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    login(cred.role, cred.name);
    router.push(homeFor(cred.role));
  };

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Snowflake layer */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        {SNOWFLAKES.map((flake) => (
          <span
            key={flake.id}
            style={{
              position: "absolute",
              left: flake.left,
              top: 0,
              fontSize: flake.fontSize,
              opacity: flake.opacity,
              color: flake.color,
              animation: `snowfall ${flake.duration} ${flake.delay} linear infinite`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {flake.char}
          </span>
        ))}
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-900 border border-brand-700 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-500 uppercase tracking-widest mb-6">
            <Home size={12} />
            LANDOS V1
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">เข้าสู่ระบบ</h1>
          <p className="text-sm text-gray-500">Land Development Feasibility System</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">ชื่อผู้ใช้</label>
            <input
              className="input-field"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="admin หรือ landowner"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label className="label">รหัสผ่าน</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl text-base transition-all shadow-lg hover:-translate-y-0.5 mt-2"
          >
            เข้าสู่ระบบ
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Demo: admin/admin · landowner/landowner
        </p>
      </div>
    </div>
  );
}
