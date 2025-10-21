import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Handle login/signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      let authResponse;
      if (isSignUp) {
        authResponse = await supabase.auth.signUp({ email, password });
        if (authResponse.error) throw authResponse.error;
        setMessage("Check your email for a verification link.");
        return;
      } else {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
        if (authResponse.error) throw authResponse.error;
      }

      // Fetch user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authResponse.data.user.id)
        .single();

      if (profileError) throw profileError;

      // Redirect based on role
      if (profile.role === "Super Admin" || profile.role === "Admin") {
        navigate("/admin");
      } else if (profile.role === "Member") {
        navigate("/member");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
    // Google OAuth may require a redirect URL set in Supabase dashboard
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!email) return setMessage("Enter your email to reset password.");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return setMessage(error.message);
    setMessage("Check your email for password reset instructions.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
            required
          />

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Continue with Google
        </button>

        <div className="flex justify-between mt-4 text-sm">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:underline"
          >
            {isSignUp ? "Have an account? Sign In" : "New user? Sign Up"}
          </button>
          <button
            onClick={handleResetPassword}
            className="text-gray-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
