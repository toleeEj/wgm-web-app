import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, phone, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile({
          full_name: data?.full_name || "",
          phone: data?.phone || "",
          avatar_url: data?.avatar_url || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Handle file upload
  const handleUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fileExt = file.name.split(".").pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  // Handle profile update
  const handleSave = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const updates = {
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("❌ Failed to update profile.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="text-center">
              <div className="relative inline-block">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile Avatar"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto">
                    <span className="text-4xl text-gray-400">👤</span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <span className="text-white text-sm">📷</span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {uploading ? "Uploading..." : "Click camera to update photo"}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your profile information is secure and private
          </p>
        </div>
      </div>
    </div>
  );
}