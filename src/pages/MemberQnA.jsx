import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { 
  PaperAirplaneIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
  ClockIcon,
  EyeIcon,
  UserCircleIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

const MemberQnA = () => {
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState("");
  const [myQuestions, setMyQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    else setMyQuestions(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert("Please write a question before submitting.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("questions").insert([
      {
        member_id: session.user.id,
        question: question.trim(),
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
    setSubmitting(false);
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
      fetchMyQuestions();
    }
  };

  const handleEditSubmit = async (id) => {
    if (!editQuestionText.trim()) {
      alert("Question cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("questions")
      .update({ question: editQuestionText.trim() })
      .eq("id", id);

    if (error) {
      console.error("Error updating question:", error);
      alert("Failed to update question.");
    } else {
      setEditingQuestionId(null);
      setEditQuestionText("");
      fetchMyQuestions();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Answered":
        return <CheckBadgeIcon className="w-4 h-4 text-green-500" />;
      case "Reviewed":
        return <EyeIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Answered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your questions...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Q&A & Suggestions</h1>
          <p className="text-gray-600">Ask questions and share suggestions with the community</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Questions"
            value={myQuestions.length}
            color="blue"
            icon="❓"
          />
          <StatCard
            title="Awaiting Response"
            value={myQuestions.filter(q => q.status === "Pending").length}
            color="orange"
            icon="⏳"
          />
          <StatCard
            title="Answered"
            value={myQuestions.filter(q => q.status === "Answered").length}
            color="green"
            icon="✅"
          />
        </div>

        {/* Submit Question Form */}
        <div className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-500 mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <PlusIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800">Ask a Question</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                rows="4"
                placeholder="Write your question or suggestion for the community..."
              />
              <button
                type="submit"
                disabled={!question.trim() || submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>{submitting ? "Submitting..." : "Submit Question"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* My Questions Section */}
        <div className="bg-white rounded-2xl shadow-lg border-l-4 border-green-500 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <UserCircleIcon className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-800">My Questions</h2>
            </div>

            {myQuestions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Questions Yet</h3>
                <p className="text-gray-600">Submit your first question using the form above!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {myQuestions.map((q) => (
                  <QuestionItem
                    key={q.id}
                    question={q}
                    isEditing={editingQuestionId === q.id}
                    editText={editQuestionText}
                    onEditTextChange={setEditQuestionText}
                    onEditStart={() => {
                      setEditingQuestionId(q.id);
                      setEditQuestionText(q.question);
                    }}
                    onEditCancel={() => {
                      setEditingQuestionId(null);
                      setEditQuestionText("");
                    }}
                    onEditSubmit={() => handleEditSubmit(q.id)}
                    onDelete={() => handleDelete(q.id)}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    green: "bg-green-500"
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`text-2xl p-3 rounded-xl ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const QuestionItem = ({ 
  question, 
  isEditing, 
  editText, 
  onEditTextChange, 
  onEditStart, 
  onEditCancel, 
  onEditSubmit, 
  onDelete,
  getStatusIcon,
  getStatusColor 
}) => (
  <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 bg-gray-50">
    {isEditing ? (
      <EditMode
        editText={editText}
        onEditTextChange={onEditTextChange}
        onEditSubmit={onEditSubmit}
        onEditCancel={onEditCancel}
      />
    ) : (
      <ViewMode
        question={question}
        onEditStart={onEditStart}
        onDelete={onDelete}
        getStatusIcon={getStatusIcon}
        getStatusColor={getStatusColor}
      />
    )}
  </div>
);

const EditMode = ({ editText, onEditTextChange, onEditSubmit, onEditCancel }) => (
  <div className="space-y-4">
    <textarea
      value={editText}
      onChange={(e) => onEditTextChange(e.target.value)}
      className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
      rows="3"
      placeholder="Edit your question..."
    />
    <div className="flex space-x-3">
      <button
        onClick={onEditSubmit}
        disabled={!editText.trim()}
        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
      >
        <CheckBadgeIcon className="w-4 h-4" />
        <span>Save Changes</span>
      </button>
      <button
        onClick={onEditCancel}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold"
      >
        <span>Cancel</span>
      </button>
    </div>
  </div>
);

const ViewMode = ({ question, onEditStart, onDelete, getStatusIcon, getStatusColor }) => (
  <>
    {/* Question Header */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(question.status)}`}>
          {getStatusIcon(question.status)}
          <span>{question.status}</span>
        </span>
      </div>
      <span className="text-sm text-gray-500">
        {new Date(question.created_at).toLocaleString()}
      </span>
    </div>

    {/* Question Content */}
    <p className="text-gray-800 text-lg leading-relaxed mb-4">
      {question.question}
    </p>

    {/* Action Buttons */}
    <div className="flex items-center space-x-3">
      <button
        onClick={onEditStart}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 text-sm font-semibold"
      >
        <PencilSquareIcon className="w-4 h-4" />
        <span>Edit</span>
      </button>
      <button
        onClick={onDelete}
        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 text-sm font-semibold"
      >
        <TrashIcon className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>

    {/* Admin Response */}
    {question.response && (
      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckBadgeIcon className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-800">Admin Response</span>
        </div>
        <p className="text-green-700 leading-relaxed mb-2">{question.response}</p>
        <p className="text-xs text-green-600">
          Responded on: {new Date(question.responded_at).toLocaleString()}
        </p>
      </div>
    )}
  </>
);

export default MemberQnA;