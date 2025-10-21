import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const Gallery = () => {
  const [session, setSession] = useState(null);
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [eventName, setEventName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editEvent, setEditEvent] = useState("");

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
      await loadMedia();
      setIsLoading(false);
    };
    initialize();
  }, []);

  const loadMedia = async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching media:", error);
      return;
    }

    setMedia(data || []);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      alert("❌ Failed to upload media.");
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName);

    const payload = {
      uploaded_by: session?.user?.id,
      image_url: urlData.publicUrl,
      caption: caption.trim() || null,
      event_name: eventName.trim() || null,
    };

    const { error: dbError } = await supabase.from("gallery").insert([payload]);

    if (dbError) {
      console.error("Error saving media:", dbError);
      alert("❌ Failed to save media.");
    } else {
      alert("✅ Media uploaded successfully!");
      setFile(null);
      setCaption("");
      setEventName("");
      setShowUploadForm(false);
      await loadMedia();
    }

    setIsUploading(false);
  };

  /** Delete media (only uploader can do this) */
  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this media?")) return;

    // Extract file name from URL for deletion from storage
    const path = imageUrl.split("/").pop();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("gallery")
      .remove([path]);

    if (storageError) console.warn("Warning: couldn't remove from storage", storageError);

    // Delete from database
    const { error: dbError } = await supabase.from("gallery").delete().eq("id", id);

    if (dbError) {
      console.error("Error deleting media:", dbError);
      alert("❌ Failed to delete media.");
    } else {
      alert("🗑️ Media deleted successfully!");
      await loadMedia();
    }
  };

  /** Start editing */
  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditCaption(item.caption || "");
    setEditEvent(item.event_name || "");
  };

  /** Cancel editing */
  const handleEditCancel = () => {
    setEditingId(null);
    setEditCaption("");
    setEditEvent("");
  };

  /** Save edited media info */
  const handleEditSave = async (id) => {
    if (!editEvent.trim()) {
      alert("Event name cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("gallery")
      .update({
        caption: editCaption.trim() || null,
        event_name: editEvent.trim(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating media:", error);
      alert("❌ Failed to update media.");
    } else {
      alert("✅ Media updated successfully!");
      setEditingId(null);
      await loadMedia();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          📸 Community Moments Gallery
        </h1>

        {/* Login Prompt */}
        {!session && (
          <div className="mb-8 text-center">
            <p className="text-gray-600">Please log in to upload or view media.</p>
            <button
              onClick={() => (window.location.href = "/Auth")}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
            >
              Go to Login Page
            </button>
          </div>
        )}


        {/* Upload Toggle Button + Form */}
        {session && (
          <div className="mb-8">
            <button
              onClick={() => setShowUploadForm((prev) => !prev)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
            >
              {showUploadForm ? "✖️ Cancel Upload" : "📤 Upload New Media"}
            </button>

            {showUploadForm && (
              <form onSubmit={handleUpload} className="border p-4 rounded-lg bg-gray-50">
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">
                    Image/Video File
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full border border-gray-300 p-2 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md"
                    placeholder="Enter event name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md h-24"
                    placeholder="Add a caption for the media"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`${
                    isUploading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-4 py-2 rounded`}
                >
                  {isUploading ? "Uploading..." : "✅ Submit Upload"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Gallery View */}
        {session && (
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              🖼️ Community Gallery
            </h2>
            {isLoading ? (
              <p className="text-gray-500">Loading gallery...</p>
            ) : media.length === 0 ? (
              <p className="text-gray-500">No media available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-md overflow-hidden bg-gray-50 relative"
                  >
                    {item.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={item.image_url}
                        controls
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <img
                        src={item.image_url}
                        alt={item.caption || "Community moment"}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-4">
                      {editingId === item.id ? (
                        <>
                          <input
                            type="text"
                            value={editEvent}
                            onChange={(e) => setEditEvent(e.target.value)}
                            className="w-full border border-gray-300 p-1 rounded mb-2"
                          />
                          <textarea
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            className="w-full border border-gray-300 p-1 rounded mb-2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSave(item.id)}
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
                          <p className="font-semibold text-gray-700">
                            {item.event_name || "Untitled Event"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.caption || "No caption"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded by {item.profiles?.full_name || "Unknown"} on{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Edit/Delete buttons (only uploader can see) */}
                    {item.uploaded_by === session?.user?.id && editingId !== item.id && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleEditStart(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.image_url)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
