import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const Announcements = () => {
  const [session, setSession] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // 👈 for update mode
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  /** Initialize session and load announcements on mount */
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);

      if (data?.session) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.session.user.id)
            .single();

          if (error) throw error;

          setIsAdmin(profile?.role === "Admin");
        } catch (err) {
          console.error("Profile fetch failed:", err.message, err);
          alert("⚠️ Failed to verify admin status.");
          setIsAdmin(false);
        }
      }

      await loadAnnouncements();
      setIsLoading(false);
    };
    initialize();
  }, []);

  /** Fetch announcements */
  const loadAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*, profiles(full_name, email)")
      .eq("type", "Public")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error.message, error);
      alert("❌ Failed to load announcements.");
      return;
    }
    setAnnouncements(data || []);
  };

  /** Create announcement */
  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    setIsSaving(true);

    const payload = {
      title: title.trim(),
      body: body.trim() || null,
      type: "Public",
      target_user_id: session?.user?.id,
    };

    const { error } = await supabase.from("announcements").insert([payload]);

    if (error) {
      console.error("Error posting announcement:", error.message, error);
      alert("❌ Failed to post announcement.");
    } else {
      alert("✅ Announcement posted successfully!");
      setTitle("");
      setBody("");
      setShowForm(false);
      await loadAnnouncements();
    }

    setIsSaving(false);
  };

  /** Delete announcement */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    const { error } = await supabase.from("announcements").delete().eq("id", id);

    if (error) {
      console.error("Error deleting announcement:", error.message, error);
      alert("❌ Failed to delete announcement.");
    } else {
      alert("🗑️ Announcement deleted.");
      await loadAnnouncements();
    }
  };

  /** Start editing an announcement */
  const handleEditStart = (announcement) => {
    setEditingId(announcement.id);
    setEditTitle(announcement.title);
    setEditBody(announcement.body || "");
  };

  /** Cancel editing */
  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  };

  /** Save updates */
  const handleEditSave = async (id) => {
    if (!editTitle.trim()) {
      alert("Title cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("announcements")
      .update({
        title: editTitle.trim(),
        body: editBody.trim() || null,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating announcement:", error.message, error);
      alert("❌ Failed to update announcement.");
    } else {
      alert("✅ Announcement updated successfully!");
      setEditingId(null);
      await loadAnnouncements();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          📢 Notifications & Announcements
        </h1>

        {/* Login Prompt */}
        {!session && (
          <div className="mb-8 text-center">
            <p className="text-gray-600">Please log in to view or post announcements.</p>
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
            >
              Log In
            </button>
          </div>
        )}

        {/* Admin Post Button + Conditional Form */}
        {session && isAdmin && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition"
            >
              {showForm ? "✖️ Cancel" : "➕ Create Announcement"}
            </button>

            {showForm && (
              <form onSubmit={handlePost} className="border p-4 rounded-md bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Post New Announcement
                </h2>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md h-32"
                    placeholder="Write the announcement details..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`${
                    isSaving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-4 py-2 rounded`}
                >
                  {isSaving ? "Posting..." : "📤 Post Announcement"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Announcements List */}
        {session && (
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              🕓 Past Announcements
            </h2>
            {isLoading ? (
              <p className="text-gray-500">Loading announcements...</p>
            ) : announcements.length === 0 ? (
              <p className="text-gray-500">No announcements available.</p>
            ) : (
              <ul className="space-y-4">
                {announcements.map((announcement) => (
                  <li
                    key={announcement.id}
                    className="border p-4 rounded-md bg-gray-50 announcement-item relative"
                  >
                    {editingId === announcement.id ? (
                      <>
                        {/* Editing Mode */}
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-md mb-2"
                        />
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-md h-24 mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSave(announcement.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                          >
                            ✖️ Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* View Mode */}
                        <h3 className="text-lg font-semibold text-gray-800">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {announcement.body || "No details provided."}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Posted by{" "}
                          {announcement.profiles?.full_name ||
                            announcement.profiles?.email ||
                            "Unknown"}{" "}
                          on {new Date(announcement.created_at).toLocaleDateString()}
                        </p>

                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              onClick={() => handleEditStart(announcement)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(announcement.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <style>
        {`
          .announcement-item:hover {
            background-color: #f9fafb;
            transition: background-color 0.3s ease;
          }
        `}
      </style>
    </div>
  );
};

export default Announcements;
