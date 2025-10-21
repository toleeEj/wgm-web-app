import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AdminQnA = () => {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
    };
    loadSession();
  }, []);

  useEffect(() => {
    if (session) fetchQuestions();
  }, [session]);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (error) console.error("Error loading questions:", error);
    else setQuestions(data);
    setLoading(false);
  };

  const handleRespond = async (id) => {
    const response = responses[id];
    if (!response || !response.trim()) return;

    const { error } = await supabase
      .from("questions")
      .update({
        response,
        status: "Answered", // ✅ matches DB constraint
        responded_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error responding:", error);
      alert("Failed to respond.");
    } else {
      setResponses((prev) => ({ ...prev, [id]: "" }));
      fetchQuestions();
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from("questions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } else {
      fetchQuestions();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question.");
    } else {
      fetchQuestions(); // Refresh the question list
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading questions...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Q&A Management</h1>

      {questions.length === 0 ? (
        <p className="text-gray-500">No questions yet.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-semibold text-gray-800">{q.question}</p>
              <p className="text-sm text-gray-500">
                From: {q.profiles?.full_name || "Unknown"} —{" "}
                {new Date(q.created_at).toLocaleString()}
              </p>

              {/* Status Dropdown */}
              <div className="mt-2">
                <label className="text-sm text-gray-700 mr-2">Status:</label>
                <select
                  value={q.status}
                  onChange={(e) => handleStatusChange(q.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Answered">Answered</option>
                  <option value="Reviewed">Reviewed</option>
                </select>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(q.id)}
                className="bg-red-600 text-white px-3 py-1 mt-2 rounded hover:bg-red-700 text-sm"
              >
                Delete Question
              </button>

              {/* Response Section */}
              {q.response ? (
                <div className="bg-green-50 p-2 rounded mt-3">
                  <p className="text-sm">
                    <strong>Response:</strong> {q.response}
                  </p>
                  <p className="text-xs text-gray-400">
                    Responded on: {new Date(q.responded_at).toLocaleString()}
                  </p>
                  <textarea
                    value={responses[q.id] || ""}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    className="w-full border p-2 mt-2 rounded-md text-sm"
                    placeholder="Edit response..."
                  />
                  <button
                    onClick={() => handleRespond(q.id)}
                    className="bg-blue-600 text-white px-3 py-1 mt-1 rounded hover:bg-blue-700 text-sm"
                  >
                    Update Response
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={responses[q.id] || ""}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    className="w-full border p-2 rounded-md text-sm"
                    rows="2"
                    placeholder="Write your response..."
                  />
                  <button
                    onClick={() => handleRespond(q.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                  >
                    Submit Response
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQnA;