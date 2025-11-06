import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Google SVG Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    Loading...
  </div>
);

// Message Component
const Message = ({ message, type = "info" }) => {
  const styles = {
    success: "bg-green-50 text-green-700 border border-green-200",
    error: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200"
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
      let authResponse;
      
      if (isSignUp) {
        authResponse = await supabase.auth.signUp({ email, password });
        if (authResponse.error) throw authResponse.error;
        setMessage("✅ Check your email for a verification link.");
        setIsLoading(false);
        return;
      } else {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
        if (authResponse.error) throw authResponse.error;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authResponse.data.user.id)
        .single();

      if (profileError) throw profileError;

      // Navigate based on role
      const redirectPaths = {
        "Super Admin": "/admin",
        "Admin": "/admin", 
        "Member": "/member"
      };

      navigate(redirectPaths[profile.role] || "/unauthorized");
      
    } catch (err) {
      setMessage(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage("Please enter your email to reset password.");
      return;
    }
    
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Check your email for password reset instructions.");
    }
    setIsLoading(false);
  };

  const getMessageType = (msg) => {
    if (msg.includes("✅")) return "success";
    if (msg.includes("Error") || msg.includes("failed")) return "error";
    return "info";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl text-white">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            {isSignUp ? "Create your account to get started" : "Sign in to your account to continue"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-4 text-sm text-gray-500">or continue with</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Footer Links */}
          <div className="flex justify-between mt-6 text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <Message message={message} type={getMessageType(message)} />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}