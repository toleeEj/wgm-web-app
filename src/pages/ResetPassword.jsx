import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("Checking reset link...");
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for recovery session
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMessage("Please enter your new password.");
        setSessionReady(true);
      }
    });

    // Try to get the current session if it's already active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
        setMessage("Please enter your new password.");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) setMessage(`Error: ${error.message}`);
    else {
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      {message && <p className="mb-2 text-red-500">{message}</p>}
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <button
        onClick={handleResetPassword}
        className="w-full bg-blue-500 text-white p-2 rounded"
        disabled={!newPassword || !sessionReady}
      >
        Reset Password
      </button>
    </div>
  );
}
