// Auth.jsx – FINAL VERSION: Clean, Safe, Works Forever (2025+)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Icons & Components
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    <span>Loading...</span>
  </div>
);

const Message = ({ message, type = "info" }) => {
  const styles = {
    success: "bg-green-50 text-green-700 border border-green-200",
    error: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };
  return (
    <div className={`mt-4 p-3 rounded-xl text-sm text-center ${styles[type]}`}>
      {message}
    </div>
  );
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      let user = null;

      if (isSignUp) {
        // === SIGN UP ===
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error("Sign up failed: No user returned.");

        user = data.user;

        // Optional: Show confirmation if email confirmation is required
        if (data.user.identities?.length === 0) {
          setMessage("This email is already registered.");
          setIsLoading(false);
          return;
        }

        setMessage("Account created! Signing you in...");
      } else {
        // === SIGN IN ===
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error("Login failed: No user returned.");

        user = data.user;
      }

      // === CRITICAL: Now user is guaranteed and has .id ===
      if (!user?.id) {
        throw new Error("Authentication succeeded but user has no ID.");
      }

      // === FETCH PROFILE ROLE ===
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        if (profileError.code === "PGRST116") {
          throw new Error("Your profile is missing. Please contact admin.");
        }
        throw profileError;
      }

      // === ROLE-BASED REDIRECT ===
      const role = profile.role;
      if (role === "Super Admin" || role === "Admin") {
        navigate("/admin", { replace: true });
      } else if (role === "Member") {
        navigate("/member", { replace: true });
      } else {
        navigate("/unauthorized", { replace: true });
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setMessage(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const redirectTo = import.meta.env.VITE_SITE_URL
      ? `${import.meta.env.VITE_SITE_URL.replace(/\/$/, "")}/`
      : `${window.location.origin}/`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setMessage("Google login failed: " + error.message);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email first.");
      return;
    }

    setIsLoading(true);
    const redirectTo = import.meta.env.VITE_SITE_URL
      ? `${import.meta.env.VITE_SITE_URL.replace(/\/$/, "")}/reset-password`
      : `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setIsLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset link sent! Check your email.");
    }
  };

  const getMessageType = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("check") || lower.includes("sent") || lower.includes("created")) return "success";
    if (lower.includes("error") || lower.includes("failed") || lower.includes("missing")) return "error";
    return "info";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl text-white">Lock</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600">
            {isSignUp
              ? "Join us today — it's free and fast"
              : "Sign in to continue to your dashboard"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner /> : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="mt-6 flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
              className="text-blue-600 hover:underline font-medium"
            >
              {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isLoading}
              className="text-gray-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {message && <Message message={message} type={getMessageType(message)} />}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}