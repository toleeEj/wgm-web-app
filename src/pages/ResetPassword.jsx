import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Parse hash params
  const parseHashParams = () => {
    const hash = window.location.hash.replace(/^#/, ""); // remove #
    return Object.fromEntries(new URLSearchParams(hash));
  };

  useEffect(() => {
    const params = parseHashParams();

    if (params.access_token) {
      setMessage("Please enter a new password.");
    } else if (params.error) {
      const description = decodeURIComponent(params.error_description || params.error);
      setMessage(`Error: ${description}`);
    } else {
      setMessage("Invalid or missing token.");
    }
  }, []);

  const handleResetPassword = async () => {
    const params = parseHashParams();
    const access_token = params.access_token;

    if (!access_token) {
      setMessage("No valid access token. Please request a new password reset.");
      return;
    }

    const { error } = await supabase.auth.updateUser(
      { password: newPassword },
      { accessToken: access_token }
    );

    if (error) setMessage(error.message);
    else {
      setMessage("Password successfully updated! Redirecting to login...");
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
        disabled={!newPassword}
      >
        Reset Password
      </button>
    </div>
  );
}
