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
  const [selectedMedia, setSelectedMedia] = useState(null);

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

  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this media?")) return;

    const path = imageUrl.split("/").pop();
    const { error: storageError } = await supabase.storage
      .from("gallery")
      .remove([path]);

    if (storageError) console.warn("Warning: couldn't remove from storage", storageError);

    const { error: dbError } = await supabase.from("gallery").delete().eq("id", id);

    if (dbError) {
      console.error("Error deleting media:", dbError);
      alert("❌ Failed to delete media.");
    } else {
      alert("🗑️ Media deleted successfully!");
      await loadMedia();
    }
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditCaption(item.caption || "");
    setEditEvent(item.event_name || "");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditCaption("");
    setEditEvent("");
  };

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

  // Fixed fullscreen functions
  const openFullscreen = (item, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedMedia(item);
  };

  const closeFullscreen = (e) => {
    if (e) e.stopPropagation();
    setSelectedMedia(null);
  };

  const navigateMedia = (direction, e) => {
    if (e) e.stopPropagation();
    const currentIndex = media.findIndex(item => item.id === selectedMedia.id);
    const nextIndex = (currentIndex + direction + media.length) % media.length;
    setSelectedMedia(media[nextIndex]);
  };

  // Close fullscreen on Escape key and background click
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeFullscreen();
    };

    const handleBackgroundClick = (e) => {
      if (e.target === e.currentTarget) {
        closeFullscreen();
      }
    };

    document.addEventListener('keydown', handleEscape);
    if (selectedMedia) {
      document.addEventListener('click', handleBackgroundClick);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleBackgroundClick);
    };
  }, [selectedMedia]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl text-white">📸</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Community Moments Gallery
          </h1>
          <p className="text-gray-600">Share and relive your favorite moments</p>
        </div>

        {/* Login Prompt */}
        {!session && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🔒</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please log in to upload and view community media
            </p>
            <button
              onClick={() => (window.location.href = "/Auth")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Upload Section */}
        {session && (
          <div className="mb-8">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mb-4"
            >
              {showUploadForm ? (
                <>✖️ Cancel Upload</>
              ) : (
                <>📤 Upload New Media</>
              )}
            </button>

            {showUploadForm && (
              <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Share Your Moment
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image/Video File *
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter event name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Caption
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32"
                      placeholder="Add a caption for the media"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 w-full"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </div>
                    ) : (
                      "✅ Submit Upload"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        {session && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🖼️ Community Gallery
              {media.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({media.length} items)
                </span>
              )}
            </h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">📷</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Media Yet
                </h3>
                <p className="text-gray-500">
                  {showUploadForm ? "Upload the first media!" : "Be the first to share a moment!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group relative"
                  >
                    {/* Media Content - Fixed click handler */}
                    <div 
                      className="cursor-pointer aspect-square overflow-hidden"
                      onClick={(e) => openFullscreen(item, e)}
                    >
                      {item.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={item.image_url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={item.image_url}
                          alt={item.caption || "Community moment"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="text-white text-lg font-semibold">Click to view</span>
                    </div>

                    {/* Media Info */}
                    <div className="p-4">
                      {editingId === item.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editEvent}
                            onChange={(e) => setEditEvent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Event name"
                          />
                          <textarea
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Caption"
                            rows="2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSave(item.id)}
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              💾 Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              ✖️ Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-gray-800 text-sm mb-1">
                            {item.event_name || "Untitled Event"}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {item.caption || "No caption provided"}
                          </p>
                          <p className="text-xs text-gray-500">
                            By {item.profiles?.full_name || "Unknown"} •{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {item.uploaded_by === session?.user?.id && editingId !== item.id && (
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStart(item);
                          }}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                          aria-label="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id, item.image_url);
                          }}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                          aria-label="Delete"
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

        {/* Fullscreen Modal - Fixed click handlers */}
        {selectedMedia && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            <div 
              className="relative max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on content
            >
              {/* Close Button */}
              <button
                onClick={closeFullscreen}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                aria-label="Close"
              >
                ✕
              </button>

              {/* Navigation Buttons */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={(e) => navigateMedia(-1, e)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => navigateMedia(1, e)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Media Display */}
              <div className="flex flex-col items-center">
                {selectedMedia.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={selectedMedia.image_url}
                    controls
                    className="max-w-full max-h-[80vh] rounded-lg"
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedMedia.image_url}
                    alt={selectedMedia.caption || "Community moment"}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                )}

                {/* Media Info */}
                <div className="text-white text-center mt-4 max-w-2xl">
                  <h3 className="text-xl font-bold mb-2">
                    {selectedMedia.event_name || "Untitled Event"}
                  </h3>
                  {selectedMedia.caption && (
                    <p className="text-gray-300 mb-2">{selectedMedia.caption}</p>
                  )}
                  <p className="text-sm text-gray-400">
                    Uploaded by {selectedMedia.profiles?.full_name || "Unknown"} on{" "}
                    {new Date(selectedMedia.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Counter */}
              {media.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                  {media.findIndex(item => item.id === selectedMedia.id) + 1} / {media.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;