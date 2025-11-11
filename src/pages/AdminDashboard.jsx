// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTHLY_FEE = 200;
const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  background: "#F8FAFC",
  card: "#FFFFFF"
};

const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState({ total: 0, monthly: [] });
  const [pendingPayments, setPendingPayments] = useState([]);
  const [meetings, setMeetings] = useState({ upcoming: [], past: [] });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMeeting, setEditMeeting] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMeetingDate, setEditMeetingDate] = useState("");
  const [editMinutesUrl, setEditMinutesUrl] = useState("");
  const [updating, setUpdating] = useState(false);

  // Load session
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
    };
    loadSession();
  }, []);

  // Fetch all data
  useEffect(() => {
    if (!session) return;
    Promise.all([
      fetchFinancialStats(),
      fetchPendingPayments(),
      fetchMeetings(),
      fetchPaymentHistory()
    ]).finally(() => setLoading(false));
  }, [session]);

  const fetchFinancialStats = async () => {
    const { data } = await supabase
      .from("payments")
      .select("month, amount")
      .ilike("status", "approved");

    if (!data) return;

    const total = data.reduce((sum, p) => sum + Number(p.amount), 0);
    const monthly = Object.entries(
      data.reduce((acc, p) => {
        acc[p.month] = (acc[p.month] || 0) + Number(p.amount);
        return acc;
      }, {})
    ).map(([month, total]) => ({ month, total }));

    setStats({ total, monthly });
  };

  const fetchPendingPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select("id, member_id, month, amount, proof_url, created_at, status")
      .ilike("status", "pending")
      .order("created_at", { ascending: false });

    if (!data) return;

    const enrichedPayments = await Promise.all(
      data.map(async (p) => {
        let signed_url = null;
        if (p.proof_url) {
          const filePath = p.proof_url.split('/object/public/payment-proofs/')[1] || p.proof_url;
          const { data: signed } = await supabase.storage.from('payment-proofs').createSignedUrl(filePath, 3600);
          signed_url = signed?.signedUrl;
        }

        const { data: member } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", p.member_id)
          .single();

        return { ...p, signed_url, member: member || { full_name: "Unknown", avatar_url: null } };
      })
    );

    setPendingPayments(enrichedPayments);
  };

  const fetchMeetings = async () => {
    const { data } = await supabase
      .from("meetings")
      .select("id, title, description, meeting_date, minutes_url, created_by")
      .order("meeting_date", { ascending: true });

    if (!data) return;

    const now = new Date();
    const upcoming = data.filter((m) => new Date(m.meeting_date) >= now);
    const past = data.filter((m) => new Date(m.meeting_date) < now);

    setMeetings({ upcoming, past });
  };

  const fetchPaymentHistory = async () => {
    const { data: payments } = await supabase
      .from("payments")
      .select("member_id, month, amount, status");

    if (!payments) return;

    const memberIds = [...new Set(payments.map((p) => p.member_id))];
    const { data: members } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", memberIds);

    const memberMap = Object.fromEntries((members || []).map((m) => [m.id, m.full_name]));

    const summary = memberIds.map((id) => {
      const userPayments = payments.filter((p) => p.member_id === id && p.status?.toLowerCase() === "approved");
      const paidMonths = userPayments.map((p) => p.month.toLowerCase());
      const totalPaid = userPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const unpaidMonths = MONTHS.filter((m) => !paidMonths.includes(m));
      const amountLeft = unpaidMonths.length * MONTHLY_FEE;

      return {
        member_name: memberMap[id] || "Unknown",
        paidMonths,
        totalPaid,
        amountLeft,
      };
    });

    setPaymentHistory(summary);
  };

  const handleApproval = async (paymentId, status) => {
    if (!session) return;
    
    const { error } = await supabase
      .from("payments")
      .update({
        status,
        approved_by: session.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (error) {
      alert("Action failed!");
      return;
    }

    fetchPendingPayments();
    fetchFinancialStats();
    fetchPaymentHistory();
  };

  const handleEditMeeting = async (e) => {
    e.preventDefault();
    if (!editTitle || !editMeetingDate) {
      alert("Please fill in the title and meeting date.");
      return;
    }

    setUpdating(true);
    const { error } = await supabase
      .from("meetings")
      .update({
        title: editTitle,
        description: editDescription,
        meeting_date: editMeetingDate,
        minutes_url: editMinutesUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editMeeting.id);

    if (error) {
      alert("Error updating meeting.");
    } else {
      alert("Meeting updated successfully!");
      closeEditModal();
      fetchMeetings();
    }
    setUpdating(false);
  };

  const handleDeleteMeeting = async (meeting) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;

    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", meeting.id);

    if (error) {
      alert("Error deleting meeting.");
    } else {
      alert("Meeting deleted successfully!");
      fetchMeetings();
    }
  };

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const openEditModal = (meeting) => {
    setEditMeeting(meeting);
    setEditTitle(meeting.title);
    setEditDescription(meeting.description || "");
    setEditMeetingDate(new Date(meeting.meeting_date).toISOString().slice(0, 16));
    setEditMinutesUrl(meeting.minutes_url || "");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditMeeting(null);
    setEditTitle("");
    setEditDescription("");
    setEditMeetingDate("");
    setEditMinutesUrl("");
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage payments, meetings, and members</p>
          </div>
          <Link
            to="/meeting-form"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
          >
            <span>+</span> Create Meeting
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Collection"
            value={`${stats.total} birr`}
            color="blue"
            icon="💰"
          />
          <StatCard
            title="Pending Approvals"
            value={pendingPayments.length}
            color="orange"
            icon="⏳"
          />
          <StatCard
            title="Upcoming Meetings"
            value={meetings.upcoming.length}
            color="green"
            icon="📅"
          />
          <StatCard
            title="Total Members"
            value={paymentHistory.length}
            color="purple"
            icon="👥"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Pending Payments */}
          <DashboardSection title="Pending Approvals" color="warning">
            {pendingPayments.length === 0 ? (
              <EmptyState message="No pending approvals 🎉" />
            ) : (
              <div className="space-y-3">
                {pendingPayments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onApprove={() => handleApproval(payment.id, "Approved")}
                    onReject={() => handleApproval(payment.id, "Rejected")}
                    onViewProof={() => openModal(payment.signed_url)}
                  />
                ))}
              </div>
            )}
          </DashboardSection>

          {/* Financial Overview */}
          <DashboardSection title="Financial Overview" color="primary">
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{stats.total} birr</p>
                <p className="text-blue-500 text-sm">Total Approved Collection</p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 font-semibold text-gray-600">Month</th>
                      <th className="text-right py-3 font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.monthly.map((month) => (
                      <tr key={month.month} className="border-b border-gray-100">
                        <td className="py-3 text-gray-700 capitalize">{month.month}</td>
                        <td className="py-3 text-right font-semibold text-green-600">{month.total} birr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DashboardSection>

          {/* Meetings */}
          <DashboardSection title="Meeting Management" color="success">
            <div className="space-y-6">
              <MeetingList
                title="Upcoming Meetings"
                meetings={meetings.upcoming}
                onEdit={openEditModal}
                onDelete={handleDeleteMeeting}
                emptyMessage="No upcoming meetings"
              />
              <MeetingList
                title="Past Meetings"
                meetings={meetings.past}
                onEdit={openEditModal}
                onDelete={handleDeleteMeeting}
                emptyMessage="No meeting history yet"
              />
            </div>
          </DashboardSection>

          {/* Payment History */}
          <DashboardSection title="Payment History" color="purple">
            {paymentHistory.length === 0 ? (
              <EmptyState message="No payment data available yet" />
            ) : (
              <div className="overflow-x-auto">
                <PaymentHistoryTable payments={paymentHistory} />
              </div>
            )}
          </DashboardSection>
        </div>
      </div>

      {/* Modals */}
      <ImageModal isOpen={isModalOpen} imageUrl={modalImage} onClose={closeModal} />
      <EditMeetingModal
        isOpen={isEditModalOpen}
        meeting={editMeeting}
        title={editTitle}
        description={editDescription}
        meetingDate={editMeetingDate}
        minutesUrl={editMinutesUrl}
        onTitleChange={setEditTitle}
        onDescriptionChange={setEditDescription}
        onMeetingDateChange={setEditMeetingDate}
        onMinutesUrlChange={setEditMinutesUrl}
        onClose={closeEditModal}
        onSubmit={handleEditMeeting}
        updating={updating}
      />
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
    purple: "bg-purple-500"
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

const DashboardSection = ({ title, color, children }) => {
  const borderColors = {
    primary: "border-l-blue-500",
    success: "border-l-green-500",
    warning: "border-l-orange-500",
    purple: "border-l-purple-500"
  };

  return (
    <section className={`bg-white rounded-2xl shadow-lg border-l-4 ${borderColors[color]} overflow-hidden`}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        {children}
      </div>
    </section>
  );
};

const PaymentCard = ({ payment, onApprove, onReject, onViewProof }) => (
  <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={payment.member.avatar_url || "/default-avatar.png"}
          alt={`${payment.member.full_name}'s avatar`}
          className="w-12 h-12 rounded-full border-2 border-gray-200"
        />
        <div>
          <p className="font-semibold text-gray-800">{payment.member.full_name}</p>
          <p className="text-sm text-gray-600">
            {payment.month} — {payment.amount} birr
          </p>
          {payment.signed_url && (
            <button
              onClick={onViewProof}
              className="text-blue-500 text-sm hover:underline mt-1"
            >
              View Proof
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 font-semibold shadow-md"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 font-semibold shadow-md"
        >
          Reject
        </button>
      </div>
    </div>
  </div>
);

const MeetingList = ({ title, meetings, onEdit, onDelete, emptyMessage }) => (
  <div>
    <h3 className="font-semibold text-gray-700 mb-3 text-lg">{title}</h3>
    {meetings.length === 0 ? (
      <EmptyState message={emptyMessage} />
    ) : (
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{meeting.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(meeting.meeting_date).toLocaleString()}
                </p>
                {meeting.description && (
                  <p className="text-gray-700 text-sm mt-2">{meeting.description}</p>
                )}
                {meeting.minutes_url && (
                  <a
                    href={meeting.minutes_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline inline-block mt-2"
                  >
                    View Minutes
                  </a>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onEdit(meeting)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(meeting)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const PaymentHistoryTable = ({ payments }) => (
  <table className="min-w-full">
    <thead>
      <tr className="border-b-2 border-gray-200">
        <th className="text-left py-3 font-semibold text-gray-600">Member</th>
        {MONTHS.map((month) => (
          <th key={month} className="text-center py-3 font-semibold text-gray-600 text-xs uppercase">
            {month.slice(0, 3)}
          </th>
        ))}
        <th className="text-right py-3 font-semibold text-gray-600">Paid</th>
        <th className="text-right py-3 font-semibold text-gray-600">Due</th>
      </tr>
    </thead>
    <tbody>
      {payments.map((row, index) => (
        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
          <td className="py-3 text-gray-800 font-medium">{row.member_name}</td>
          {MONTHS.map((month) => (
            <td key={month} className="text-center py-3">
              <span className={`inline-block w-6 h-6 rounded-full ${
                row.paidMonths.includes(month) 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              } flex items-center justify-center text-sm font-bold`}>
                {row.paidMonths.includes(month) ? "✓" : "✗"}
              </span>
            </td>
          ))}
          <td className="text-right py-3 font-semibold text-green-600">{row.totalPaid} birr</td>
          <td className="text-right py-3 font-semibold text-red-600">{row.amountLeft} birr</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-8 text-gray-500">
    <p>{message}</p>
  </div>
);

const ImageModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 transition-colors duration-300"
          aria-label="Close modal"
        >
          ×
        </button>
        <img
          src={imageUrl}
          alt="Payment proof"
          className="max-w-full max-h-screen object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

const EditMeetingModal = ({ 
  isOpen, meeting, title, description, meetingDate, minutesUrl, updating,
  onTitleChange, onDescriptionChange, onMeetingDateChange, onMinutesUrlChange, onClose, onSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Edit Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl transition-colors duration-300"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              rows="3"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              value={meetingDate}
              onChange={(e) => onMeetingDateChange(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minutes URL
            </label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              value={minutesUrl}
              onChange={(e) => onMinutesUrlChange(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Updating..." : "Update Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;