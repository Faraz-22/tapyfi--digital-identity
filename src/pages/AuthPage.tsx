import { useState, useEffect } from "react";
import { ArrowRight, Loader2, ShieldCheck, UserPlus, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { loginUser, registerUser, loginWithGoogle } from "../lib/api";

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

          <GlassCard className="p-7 flex flex-col justify-between">
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

          </GlassCard>
        </div>
      </div>
    </main>
  );
}
