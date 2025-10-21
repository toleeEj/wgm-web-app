import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch meetings from Supabase
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("meetings")
          .select("*")
          .order("meeting_date", { ascending: true });

        if (error) throw error;

        setMeetings(data || []);
      } catch (err) {
        console.error("Error fetching meetings:", err);
        setError(err.message || "Failed to fetch meetings.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading meetings...</p>;
  if (error) return <p className="text-center text-red-600 mt-6">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📅 Upcoming Meetings</h2>

      {meetings.length === 0 ? (
        <p className="text-gray-600 text-center">No meetings found.</p>
      ) : (
        <ul className="space-y-4">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow transition"
            >
              <h3 className="text-lg font-semibold text-blue-700">{meeting.title}</h3>
              <p className="text-sm text-gray-600 mb-1">
                {new Date(meeting.meeting_date).toLocaleString()}
              </p>
              <p className="text-gray-700">{meeting.description}</p>
              <p className="text-xs text-gray-400 mt-2">
                Created: {new Date(meeting.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
