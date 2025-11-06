import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { 
  CheckBadgeIcon, 
  ClockIcon, 
  EyeIcon, 
  TrashIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

const AdminQnA = () => {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingResponse, setEditingResponse] = useState(null);

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
      .select("*, profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false });

    if (error) console.error("Error loading questions:", error);
    else setQuestions(data || []);
    setLoading(false);
  };

  const handleRespond = async (id) => {
    const response = responses[id];
    if (!response || !response.trim()) {
      alert("Please write a response before submitting.");
      return;
    }

    const { error } = await supabase
      .from("questions")
      .update({
        response,
        status: "Answered",
        responded_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error responding:", error);
      alert("Failed to respond.");
    } else {
      setResponses((prev) => ({ ...prev, [id]: "" }));
      setEditingResponse(null);
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
      fetchQuestions();
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
        <p className="mt-4 text-gray-600">Loading questions...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Q&A Management</h1>
          <p className="text-gray-600">Manage and respond to community questions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Questions"
            value={questions.length}
            color="blue"
            icon="❓"
          />
          <StatCard
            title="Pending"
            value={questions.filter(q => q.status === "Pending").length}
            color="orange"
            icon="⏳"
          />
          <StatCard
            title="Answered"
            value={questions.filter(q => q.status === "Answered").length}
            color="green"
            icon="✅"
          />
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Questions Yet</h3>
            <p className="text-gray-600">Questions from community members will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                response={responses[question.id] || ""}
                isEditing={editingResponse === question.id}
                onResponseChange={(value) => setResponses(prev => ({ ...prev, [question.id]: value }))}
                onRespond={() => handleRespond(question.id)}
                onEditStart={() => setEditingResponse(question.id)}
                onStatusChange={(status) => handleStatusChange(question.id, status)}
                onDelete={() => handleDelete(question.id)}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
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

const QuestionCard = ({ 
  question, 
  response, 
  isEditing, 
  onResponseChange, 
  onRespond, 
  onEditStart, 
  onStatusChange, 
  onDelete,
  getStatusIcon,
  getStatusColor 
}) => (
  <div className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-500 overflow-hidden hover:shadow-xl transition-all duration-300">
    <div className="p-6">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={question.profiles?.avatar_url || "/default-avatar.png"}
            alt={question.profiles?.full_name}
            className="w-10 h-10 rounded-full border-2 border-gray-200"
          />
          <div>
            <p className="font-semibold text-gray-800">{question.profiles?.full_name || "Anonymous"}</p>
            <p className="text-sm text-gray-500">
              {new Date(question.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(question.status)}`}>
            {getStatusIcon(question.status)}
            <span>{question.status}</span>
          </span>
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-4">
        <p className="text-gray-800 text-lg leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-200">
          {question.question}
        </p>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Status Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={question.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Answered">Answered</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {question.response && !isEditing && (
            <button
              onClick={onEditStart}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 text-sm font-semibold"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span>Edit Response</span>
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 text-sm font-semibold"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Response Section */}
      {question.response ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CheckBadgeIcon className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Admin Response</span>
            </div>
            <span className="text-xs text-green-600">
              {new Date(question.responded_at).toLocaleString()}
            </span>
          </div>
          
          {isEditing ? (
            <ResponseInput
              value={response}
              onChange={onResponseChange}
              onSubmit={onRespond}
              buttonText="Update Response"
            />
          ) : (
            <>
              <p className="text-green-700 mb-3 leading-relaxed">{question.response}</p>
            </>
          )}
        </div>
      ) : (
        <ResponseInput
          value={response}
          onChange={onResponseChange}
          onSubmit={onRespond}
          buttonText="Submit Response"
        />
      )}
    </div>
  </div>
);

const ResponseInput = ({ value, onChange, onSubmit, buttonText }) => (
  <div className="space-y-3">
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
      rows="3"
      placeholder="Write your response to the community member..."
    />
    <button
      onClick={onSubmit}
      disabled={!value.trim()}
      className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
    >
      <PaperAirplaneIcon className="w-4 h-4" />
      <span>{buttonText}</span>
    </button>
  </div>
);

export default AdminQnA;