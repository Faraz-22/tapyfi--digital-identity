import { useState, useEffect } from "react";
import { ArrowRight, Loader2, ShieldCheck, UserPlus, LogIn, KeyRound, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { loginUser, registerUser, loginWithGoogle, requestPasswordReset } from "../lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

export function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  useEffect(() => {
    const id = "google-gsi-client";
    if (document.getElementById(id)) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogle();
    document.body.appendChild(script);
  }, [isSignUp]);

  function initializeGoogle() {
    if (!window.google) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "972173167198-mndscvpe2vj91dfn83v1k1k7jcku6h9h.apps.googleusercontent.com";
    
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        auto_select: false
      });

      const btnContainer = document.getElementById("google-signin-btn");
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: "outline",
          size: "large",
          width: 320,
          text: isSignUp ? "signup_with" : "signin_with",
          shape: "pill"
        });
      }
    } catch (err) {
      console.error("GSI init error:", err);
    }
  }

  async function handleGoogleCallback(response: any) {
    setLoading(true);
    setError(null);
    try {
      const authResponse = await loginWithGoogle(response.credential);
      localStorage.setItem("tapyfi.auth.token", authResponse.token);
      localStorage.setItem("tapyfi.auth.user", JSON.stringify(authResponse.user));
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google authentication failed:", err);
      setError(err.message || "Google auth session verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Run real registration request
        const response = await registerUser(name, email, password);
        localStorage.setItem("tapyfi.auth.token", response.token);
        localStorage.setItem("tapyfi.auth.user", JSON.stringify(response.user));
        navigate("/dashboard");
      } else {
        // Run real login request
        const response = await loginUser(email, password);
        localStorage.setItem("tapyfi.auth.token", response.token);
        localStorage.setItem("tapyfi.auth.user", JSON.stringify(response.user));
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setError(err.message || "Authentication request failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Please enter your email address.");
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      await requestPasswordReset(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      setForgotError(err.message || "Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <main className="noise grid min-h-screen place-items-center bg-ink px-4 py-10 text-white">
      <div className="w-full max-w-5xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-3 text-sm text-white/68">
          <img src="/assets/tapyfi-mark.svg" alt="" className="h-9 w-9 rounded-[8px]" />
          tapyfi
        </Link>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <GlassCard className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              <p className="text-sm uppercase text-signal font-semibold">Protected workspace</p>
              <h1 className="mt-4 text-4xl font-semibold md:text-6xl leading-tight">
                {isSignUp ? "Create your dynamic identity." : "Enter the identity OS."}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/62">
                {isSignUp
                  ? "Sign up to program your customizable landing page, write URLs onto NFC, build Dynamic QR assets, and launch metrics."
                  : "Sign in to manage your digital cards, modify your dynamic profile routing, generate AI descriptions, and track scans in real-time."}
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-white/60">
              <ShieldCheck className="text-leaf animate-pulse" size={18} />
              Bcrypt credentials & JWT session checks active.
            </div>
          </GlassCard>

          <GlassCard className="p-7 flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-[12px] bg-white/[0.04] border border-white/5 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                  }}
                  className={`py-2 px-3 text-sm font-semibold rounded-[8px] transition duration-200 flex items-center justify-center gap-2 ${
                    !isSignUp ? "bg-white text-ink shadow-lg" : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <LogIn size={14} />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                  }}
                  className={`py-2 px-3 text-sm font-semibold rounded-[8px] transition duration-200 flex items-center justify-center gap-2 ${
                    isSignUp ? "bg-white text-ink shadow-lg" : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <UserPlus size={14} />
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                {isSignUp && (
                  <label className="grid gap-2 text-sm text-white/72">
                    Full Name
                    <input
                      type="text"
                      required
                      placeholder="e.g. Faraz Khan"
                      className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/30"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                )}
                <label className="grid gap-2 text-sm text-white/72">
                  Email
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="grid gap-2 text-sm text-white/72">
                  Password
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                    className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>

                {/* Forgot password link — only on Sign In */}
                {!isSignUp && (
                  <div className="flex justify-end -mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setForgotEmail(email || "");
                        setForgotSent(false);
                        setForgotError(null);
                      }}
                      className="text-xs text-signal/80 hover:text-signal transition font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <p className="text-sm font-semibold text-pulse leading-snug">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="premium-focus mt-2 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-signal px-6 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isSignUp ? "Create Account" : "Continue"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-5 flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-[10px] text-white/40 uppercase font-bold tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="flex justify-center">
                <div id="google-signin-btn" className="w-full flex justify-center bg-transparent rounded-full min-h-[40px] px-2 py-0.5" />
              </div>
            </div>

            {/* Forgot Password Overlay */}
            {showForgotPassword && (
              <div className="absolute inset-0 z-10 flex flex-col justify-center rounded-[inherit] bg-[#13181f]/[0.97] backdrop-blur-xl p-7 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSent(false);
                    setForgotError(null);
                  }}
                  className="absolute top-5 left-5 p-2 rounded-full hover:bg-white/5 transition text-white/50 hover:text-white"
                >
                  <ArrowLeft size={18} />
                </button>

                {forgotSent ? (
                  <div className="text-center px-4">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-signal/10 border border-signal/20">
                      <CheckCircle2 size={28} className="text-signal" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
                    <p className="text-sm text-white/55 leading-relaxed max-w-[320px] mx-auto">
                      If an account with <span className="text-white/80 font-medium">{forgotEmail}</span> exists, we've sent a password reset link. It expires in 1 hour.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotSent(false);
                      }}
                      className="mt-6 text-sm text-signal/80 hover:text-signal font-medium transition"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                ) : (
                  <div className="px-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal/10 border border-signal/20">
                        <KeyRound size={18} className="text-signal" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-4 mb-1">Reset your password</h3>
                    <p className="text-sm text-white/50 mb-6 leading-relaxed">
                      Enter the email address associated with your account and we'll send you a link to reset your password.
                    </p>
                    <form onSubmit={handleForgotPassword} className="grid gap-4">
                      <label className="grid gap-2 text-sm text-white/72">
                        Email address
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                          <input
                            type="email"
                            required
                            placeholder="name@company.com"
                            className="premium-focus w-full rounded-[8px] border border-white/10 bg-white/[0.06] pl-11 pr-4 py-3 text-white placeholder:text-white/30"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </label>
                      {forgotError && (
                        <p className="text-sm font-semibold text-pulse leading-snug">{forgotError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="premium-focus inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-signal px-6 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-50"
                      >
                        {forgotLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Reset Link
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

          </GlassCard>
        </div>
      </div>
    </main>
  );
}
