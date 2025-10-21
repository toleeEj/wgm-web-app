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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">My Profile</h2>

      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt="Avatar"
          className="w-24 h-24 rounded-full mb-4 object-cover"
        />
      ) : (
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
      )}

      <input type="file" onChange={handleUpload} disabled={uploading} />

      <label className="block mt-4">Full Name</label>
      <input
        className="border p-2 w-full rounded"
        type="text"
        value={profile.full_name || ""}
        onChange={(e) =>
          setProfile({ ...profile, full_name: e.target.value })
        }
      />

      <label className="block mt-4">Phone</label>
      <input
        className="border p-2 w-full rounded"
        type="text"
        value={profile.phone || ""}
        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
      />

      <button
        onClick={handleSave}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}
