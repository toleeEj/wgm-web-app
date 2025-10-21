import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MeetingForm({ onMeetingCreated }) {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a meeting.");

      // Insert meeting record
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
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Create Meeting</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Meeting Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded-lg"
          required
        />

        <input
          type="datetime-local"
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.target.value)}
          className="w-full border p-2 rounded-lg"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded-lg"
          rows="3"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create Meeting
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </div>
  );
}
