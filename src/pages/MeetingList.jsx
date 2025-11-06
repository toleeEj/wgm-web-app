import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("meetings")
          .select("*, profiles(full_name)")
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

  const formatMeetingDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === date.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMeetingStatus = (meetingDate) => {
    const now = new Date();
    const meeting = new Date(meetingDate);
    const diffTime = meeting - now;
    const diffHours = diffTime / (1000 * 60 * 60);
    
    if (diffHours < 0) return "past";
    if (diffHours < 24) return "upcoming";
    return "scheduled";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-red-600">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Meetings</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl text-white">📅</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Upcoming Meetings
        </h1>
        <p className="text-gray-600">
          Stay updated with your team's schedule
        </p>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📋 Meeting Schedule
            {meetings.length > 0 && (
              <span className="text-sm font-normal bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
              </span>
            )}
          </h2>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Meetings Scheduled
            </h3>
            <p className="text-gray-500">
              When meetings are scheduled, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => {
              const status = getMeetingStatus(meeting.meeting_date);
              const statusConfig = {
                past: { color: "bg-gray-100 text-gray-600", label: "Completed" },
                upcoming: { color: "bg-orange-100 text-orange-600", label: "Soon" },
                scheduled: { color: "bg-green-100 text-green-600", label: "Scheduled" }
              };
              const { color, label } = statusConfig[status];

              return (
                <div
                  key={meeting.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {meeting.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">🕐</span>
                      <span className="font-medium">{formatMeetingDate(meeting.meeting_date)}</span>
                    </div>
                    {meeting.profiles?.full_name && (
                      <div className="flex items-center gap-2">
                        <span className="text-purple-500">👤</span>
                        <span>By {meeting.profiles.full_name}</span>
                      </div>
                    )}
                  </div>

                  {meeting.description && (
                    <p className="text-gray-700 leading-relaxed mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      {meeting.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span>
                      Created {new Date(meeting.created_at).toLocaleDateString()}
                    </span>
                    {status === "upcoming" && (
                      <span className="text-orange-500 font-medium">
                        ⚡ Happening soon!
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {meetings.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {meetings.filter(m => getMeetingStatus(m.meeting_date) === "upcoming").length}
            </div>
            <div className="text-sm text-blue-700">Happening Soon</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {meetings.filter(m => getMeetingStatus(m.meeting_date) === "scheduled").length}
            </div>
            <div className="text-sm text-green-700">Scheduled</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {meetings.filter(m => getMeetingStatus(m.meeting_date) === "past").length}
            </div>
            <div className="text-sm text-gray-700">Completed</div>
          </div>
        </div>
      )}
    </div>
  );
}