import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MeetingForm({ onMeetingCreated }) {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a meeting.");

      const { data, error } = await supabase
        .from("meetings")
        .insert([
          {
            title,
            description,
            meeting_date: meetingDate,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessage("✅ Meeting created successfully!");
      setTitle("");
      setMeetingDate("");
      setDescription("");

      if (onMeetingCreated) onMeetingCreated(data);
    } catch (err) {
      console.error("Error creating meeting:", err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageType = (msg) => {
    if (msg.includes("✅")) return "success";
    if (msg.includes("❌")) return "error";
    return "info";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">📅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Schedule Meeting
        </h2>
        <p className="text-gray-600 text-sm">
          Create a new meeting for your team
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Title *
          </label>
          <input
            type="text"
            placeholder="Enter meeting title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
            disabled={isLoading}
          />
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Date & Time *
          </label>
          <input
            type="datetime-local"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
            disabled={isLoading}
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            placeholder="Add meeting details, agenda, or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-32"
            rows="3"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Meeting...
            </>
          ) : (
            <>
              <span>📋</span>
              Create Meeting
            </>
          )}
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <div className={`mt-6 p-4 rounded-xl text-center ${
          getMessageType(message) === "success" 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message}
        </div>
      )}

      {/* Form Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
          💡 Quick Tips
        </h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Be specific with your meeting title</li>
          <li>• Include timezone in description if needed</li>
          <li>• Add agenda items for better preparation</li>
        </ul>
      </div>
    </div>
  );
}