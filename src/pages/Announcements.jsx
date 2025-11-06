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
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);

      if (data?.session) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.session.user.id)
            .single();
          setIsAdmin(profile?.role === "Admin");
        } catch (err) {
          console.error("Profile fetch failed:", err.message);
          setIsAdmin(false);
        }
      }
      await loadAnnouncements();
      setIsLoading(false);
    };
    initialize();
  }, []);

  const loadAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*, profiles(full_name, email)")
      .eq("type", "Public")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error.message);
      return;
    }
    setAnnouncements(data || []);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    const { error } = await supabase.from("announcements").insert([{
      title: title.trim(),
      body: body.trim() || null,
      type: "Public",
      target_user_id: session?.user?.id,
    }]);

    if (!error) {
      setTitle("");
      setBody("");
      setShowForm(false);
      await loadAnnouncements();
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (!error) await loadAnnouncements();
  };

  const handleEdit = async (announcement) => {
    if (!announcement.title.trim()) return;

    const { error } = await supabase
      .from("announcements")
      .update({
        title: announcement.title.trim(),
        body: announcement.body?.trim() || null,
      })
      .eq("id", announcement.id);

    if (!error) {
      setEditingId(null);
      await loadAnnouncements();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📢 Announcements
          </h1>
          <p className="text-gray-600">Stay updated with the latest news</p>
        </div>

        {/* Login Section */}
        {!session && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🔒</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please log in to view and interact with announcements
            </p>
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Sign In with Google
            </button>
          </div>
        )}

        {/* Admin Controls */}
        {session && isAdmin && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold mb-4 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              {showForm ? (
                <>✖️ Cancel</>
              ) : (
                <>➕ Create Announcement</>
              )}
            </button>

            {showForm && (
              <form onSubmit={handlePost} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Create New Announcement
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Details
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32"
                      placeholder="Add announcement details..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isSaving ? "Posting..." : "📤 Publish Announcement"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Announcements List */}
        {session && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Latest Updates
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">📭</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Announcements Yet
                </h3>
                <p className="text-gray-500">
                  {isAdmin ? "Create the first announcement!" : "Check back later for updates."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {announcements.map((announcement) => (
                  <article
                    key={announcement.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 relative"
                  >
                    {editingId === announcement.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={announcement.title}
                          onChange={(e) => {
                            const updatedAnnouncements = announcements.map(a =>
                              a.id === announcement.id 
                                ? { ...a, title: e.target.value }
                                : a
                            );
                            setAnnouncements(updatedAnnouncements);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                        />
                        <textarea
                          value={announcement.body || ""}
                          onChange={(e) => {
                            const updatedAnnouncements = announcements.map(a =>
                              a.id === announcement.id 
                                ? { ...a, body: e.target.value }
                                : a
                            );
                            setAnnouncements(updatedAnnouncements);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                          >
                            ✖️ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 pr-16">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {announcement.body || "No details provided."}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            Posted by{" "}
                            <span className="font-medium">
                              {announcement.profiles?.full_name ||
                               announcement.profiles?.email ||
                               "Unknown"}
                            </span>
                          </span>
                          <span>
                            {new Date(announcement.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        {isAdmin && (
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button
                              onClick={() => setEditingId(announcement.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              aria-label="Edit announcement"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(announcement.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label="Delete announcement"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;