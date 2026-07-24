import { useState } from "react";
import { ArrowRight, Loader2, ShieldCheck, CheckCircle2, KeyRound, Eye, EyeOff, XCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { resetPassword } from "../lib/api";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordValid = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (!passwordValid) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may be expired or invalid.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="noise grid min-h-screen place-items-center bg-ink px-4 py-10 text-white">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-3 text-sm text-white/68">
            <img src="/assets/tapyfi-mark.svg" alt="" className="h-9 w-9 rounded-[8px]" />
            tapyfi
          </Link>
          <GlassCard className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pulse/10 border border-pulse/20">
              <XCircle size={28} className="text-pulse" />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h1>
            <p className="text-sm text-white/55 leading-relaxed mb-6">
              This password reset link is missing or invalid. Please request a new one from the login page.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-signal font-medium hover:underline"
            >
              ← Back to Sign In
            </Link>
          </GlassCard>
        </div>
      </main>
    );
  }

  return (
    <main className="noise grid min-h-screen place-items-center bg-ink px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-3 text-sm text-white/68">
          <img src="/assets/tapyfi-mark.svg" alt="" className="h-9 w-9 rounded-[8px]" />
          tapyfi
        </Link>

        <GlassCard className="p-8">
          {success ? (
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-signal/10 border border-signal/20">
                <CheckCircle2 size={32} className="text-signal" />
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">Password Reset!</h1>
              <p className="text-sm text-white/55 leading-relaxed mb-6">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="premium-focus inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-signal px-8 text-sm font-bold text-ink transition hover:brightness-110"
              >
                Sign In
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal/10 border border-signal/20">
                  <KeyRound size={18} className="text-signal" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-white mt-4 mb-1">Set new password</h1>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                Enter your new password below. Make sure it's at least 8 characters long.
              </p>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <label className="grid gap-2 text-sm text-white/72">
                  New Password
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      className="premium-focus w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 pr-12 text-white placeholder:text-white/30"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-white/30 hover:text-white/60 transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        newPassword.length < 8 ? "bg-pulse/40" : newPassword.length < 12 ? "bg-ember/50" : "bg-signal/50"
                      }`} />
                      <span className={`transition ${
                        newPassword.length < 8 ? "text-pulse/70" : newPassword.length < 12 ? "text-ember/70" : "text-signal/70"
                      }`}>
                        {newPassword.length < 8 ? "Too short" : newPassword.length < 12 ? "Good" : "Strong"}
                      </span>
                    </div>
                  )}
                </label>

                <label className="grid gap-2 text-sm text-white/72">
                  Confirm Password
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter your new password"
                    className={`premium-focus rounded-[8px] border bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/30 transition ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-signal/30"
                          : "border-pulse/30"
                        : "border-white/10"
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <span className="text-xs text-pulse/70">Passwords don't match</span>
                  )}
                </label>

                {error && (
                  <p className="text-sm font-semibold text-pulse leading-snug">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !passwordValid || !passwordsMatch}
                  className="premium-focus mt-2 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-signal px-6 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-white/40">
                <ShieldCheck size={14} className="text-leaf" />
                Password is encrypted with bcrypt before storage.
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </main>
  );
}
