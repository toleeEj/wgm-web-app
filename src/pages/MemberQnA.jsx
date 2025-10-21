import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const MemberQnA = () => {
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState("");
  const [myQuestions, setMyQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
    };
    loadSession();
  }, []);

  useEffect(() => {
    if (session) fetchMyQuestions();
  }, [session]);

  const fetchMyQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("member_id", session?.user?.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching questions:", error);
    else setMyQuestions(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const { error } = await supabase.from("questions").insert([
      {
        member_id: session.user.id,
        question,
        status: "Pending",
      },
    ]);

    if (error) {
      console.error("Error submitting question:", error);
      alert("Failed to submit question.");
    } else {
      setQuestion("");
      fetchMyQuestions();
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
      fetchMyQuestions(); // Refresh the question list
    }
  };

  const handleEditSubmit = async (id) => {
    if (!editQuestionText.trim()) {
      alert("Question cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("questions")
      .update({ question: editQuestionText })
      .eq("id", id);

    if (error) {
      console.error("Error updating question:", error);
      alert("Failed to update question.");
    } else {
      setEditingQuestionId(null);
      setEditQuestionText("");
      fetchMyQuestions(); // Refresh the question list
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading your questions...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Member Q&A / Suggestions</h1>

      {/* 📝 Submit Question */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Ask a Question or Suggestion</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full border rounded-md p-2"
          rows="3"
          placeholder="Write your question..."
        />
        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      {/* 📋 My Questions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">My Questions</h2>
        {myQuestions.length === 0 ? (
          <p className="text-gray-500">You haven’t submitted any questions yet.</p>
        ) : (
          <div className="space-y-3">
            {myQuestions.map((q) => (
              <div key={q.id} className="border p-3 rounded">
                {editingQuestionId === q.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editQuestionText}
                      onChange={(e) => setEditQuestionText(e.target.value)}
                      className="w-full border rounded-md p-2"
                      rows="3"
                      placeholder="Edit your question..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSubmit(q.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingQuestionId(null)}
                        className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-gray-800">{q.question}</p>
                    <p className="text-sm text-gray-500">
                      Status: <strong>{q.status}</strong> —{" "}
                      {new Date(q.created_at).toLocaleString()}
                    </p>

                    {/* Delete and Edit Buttons */}
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestionId(q.id);
                          setEditQuestionText(q.question);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                    </div>

                    {q.response && (
                      <div className="bg-green-50 p-2 rounded mt-2">
                        <p className="text-sm">
                          <strong>Admin Response:</strong> {q.response}
                        </p>
                        <p className="text-xs text-gray-400">
                          Responded on: {new Date(q.responded_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberQnA;