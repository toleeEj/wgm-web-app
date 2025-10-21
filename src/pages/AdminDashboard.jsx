// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];
const MONTHLY_FEE = 200;

const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState({ total: 0, monthly: [] });
  const [pendingPayments, setPendingPayments] = useState([]);
  const [meetings, setMeetings] = useState({ upcoming: [], past: [] });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For edit modal
  const [editMeeting, setEditMeeting] = useState(null); // Store meeting being edited
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMeetingDate, setEditMeetingDate] = useState("");
  const [editMinutesUrl, setEditMinutesUrl] = useState("");
  const [updating, setUpdating] = useState(false); // For loading state during updates

  // Modal functions for image preview
  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  // Modal functions for editing meetings
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

  // 1️⃣ Load session
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
    };
    loadSession();
  }, []);

  // 2️⃣ Fetch all dashboard data
  useEffect(() => {
    if (!session) return;
    fetchFinancialStats();
    fetchPendingPayments();
    fetchMeetings();
    fetchPaymentHistory();
  }, [session]);

  // 🧮 Financial Stats
  const fetchFinancialStats = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("month, amount")
      .ilike("status", "approved");

    if (error) {
      console.error("Error fetching financial stats:", error);
      return;
    }

    const total = data.reduce((sum, p) => sum + Number(p.amount), 0);

    const monthly = Object.entries(
      data.reduce((acc, p) => {
        acc[p.month] = (acc[p.month] || 0) + Number(p.amount);
        return acc;
      }, {})
    ).map(([month, total]) => ({ month, total }));

    setStats({ total, monthly });
  };

  // 💳 Pending Payments
  const fetchPendingPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("id, member_id, month, amount, proof_url, created_at, status")
      .ilike("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending payments:", error);
      return;
    }

    const enrichedPayments = await Promise.all(
      data.map(async (p) => {
        let signed_url = null;
        if (p.proof_url) {
          const filePath = p.proof_url.split('/object/public/payment-proofs/')[1] || p.proof_url;
          const { data: signed } = await supabase
            .storage
            .from('payment-proofs')
            .createSignedUrl(filePath, 60 * 60);
          signed_url = signed?.signedUrl || null;
        }

        const { data: member } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", p.member_id)
          .single();

        return {
          ...p,
          signed_url,
          member: member || { full_name: "Unknown", avatar_url: null },
        };
      })
    );

    setPendingPayments(enrichedPayments);
  };

  // 🧾 Meetings
  const fetchMeetings = async () => {
    const { data, error } = await supabase
      .from("meetings")
      .select("id, title, description, meeting_date, minutes_url, created_by")
      .order("meeting_date", { ascending: true });

    if (error) {
      console.error("Error fetching meetings:", error);
      return;
    }

    const now = new Date();
    const upcoming = data.filter((m) => new Date(m.meeting_date) >= now);
    const past = data.filter((m) => new Date(m.meeting_date) < now);

    setMeetings({ upcoming, past });
    setLoading(false);
  };

  // 🧾 Payment History Summary
  const fetchPaymentHistory = async () => {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("member_id, month, amount, status");

    if (error) {
      console.error("Error fetching payment history:", error);
      return;
    }

    const memberIds = [...new Set(payments.map((p) => p.member_id))];
    const { data: members } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", memberIds);

    const memberMap = Object.fromEntries(members.map((m) => [m.id, m.full_name]));

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

  // ✅ Approve or Reject payment
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
      console.error("Error updating payment:", error);
      alert("Action failed!");
      return;
    }

    fetchPendingPayments();
    fetchFinancialStats();
    fetchPaymentHistory();
  };

  // ✏️ Edit Meeting
  const handleEditMeeting = async (e) => {
    e.preventDefault();
    if (!editTitle || !editMeetingDate) {
      alert("Please fill in the title and meeting date.");
      return;
    }

    setUpdating(true);
    try {
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

      if (error) throw error;

      alert("Meeting updated successfully!");
      closeEditModal();
      fetchMeetings();
    } catch (err) {
      console.error("Error updating meeting:", err.message);
      alert("Error updating meeting.");
    } finally {
      setUpdating(false);
    }
  };

  // 🗑️ Delete Meeting
  const handleDeleteMeeting = async (meeting) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", meeting.id);

      if (error) throw error;

      alert("Meeting deleted successfully!");
      fetchMeetings();
    } catch (err) {
      console.error("Error deleting meeting:", err.message);
      alert("Error deleting meeting.");
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-100 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>

      {/* 💰 Financial Stats */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Financial Overview</h2>
        <p className="text-gray-600 mb-3">
          Total Approved Collection: <strong>₹{stats.total}</strong>
        </p>
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Month</th>
              <th className="border px-3 py-2 text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {stats.monthly.map((m) => (
              <tr key={m.month}>
                <td className="border px-3 py-2">{m.month}</td>
                <td className="border px-3 py-2 text-right">{m.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ⏳ Pending Approvals */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Pending Payment Approvals</h2>
        {pendingPayments.length === 0 ? (
          <p className="text-gray-500">No pending approvals 🎉</p>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map((p) => (
              <div
                key={p.id}
                className="border p-3 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.member.avatar_url || "/default-avatar.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full border"
                  />
                  <div>
                    <p className="font-semibold">{p.member.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {p.month} — ₹{p.amount}
                    </p>
                    {p.signed_url ? (
                      <img
                        src={p.signed_url}
                        alt={`Proof for ${p.month}`}
                        className="cursor-pointer w-20 h-20 object-cover mt-2"
                        onClick={() => openModal(p.signed_url)}
                      />
                    ) : (
                      <span>Loading...</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproval(p.id, "Approved")}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-300"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(p.id, "Rejected")}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 📅 Meeting Management */}
      <section className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Meeting Management</h2>
          <Link
            to="/meeting-form"
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition duration-300"
          >
            + Create Meeting
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Upcoming Meetings</h3>
            {meetings.upcoming.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming meetings.</p>
            ) : (
              <ul className="space-y-2">
                {meetings.upcoming.map((m) => (
                  <li key={m.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{m.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(m.meeting_date).toLocaleString()}
                        </p>
                        <p className="text-sm">{m.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(m)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Past Meetings</h3>
            {meetings.past.length === 0 ? (
              <p className="text-gray-500 text-sm">No meeting history yet.</p>
            ) : (
              <ul className="space-y-2">
                {meetings.past.map((m) => (
                  <li key={m.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{m.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(m.meeting_date).toLocaleString()}
                        </p>
                        {m.minutes_url && (
                          <a
                            href={m.minutes_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 text-sm underline"
                          >
                            View Minutes
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(m)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 📊 Member Payment History */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Member Payment History</h2>
        {paymentHistory.length === 0 ? (
          <p className="text-gray-500">No payment data available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Member</th>
                  {MONTHS.map((m) => (
                    <th key={m} className="border px-2 py-2 text-center capitalize">
                      {m.slice(0, 3)}
                    </th>
                  ))}
                  <th className="border px-3 py-2 text-right">Total Paid</th>
                  <th className="border px-3 py-2 text-right">Amount Left</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((row) => (
                  <tr key={row.member_name}>
                    <td className="border px-3 py-2">{row.member_name}</td>
                    {MONTHS.map((m) => (
                      <td
                        key={m}
                        className={`border px-2 py-2 text-center ${
                          row.paidMonths.includes(m)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.paidMonths.includes(m) ? "✓" : "✗"}
                      </td>
                    ))}
                    <td className="border px-3 py-2 text-right">{row.totalPaid}</td>
                    <td className="border px-3 py-2 text-right">{row.amountLeft}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal for Enlarged Image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white text-xl"
            >
              ×
            </button>
            <img
              src={modalImage}
              alt="Enlarged Proof"
              className="max-w-full max-h-screen object-contain"
            />
          </div>
        </div>
      )}

      {/* Modal for Editing Meetings */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Edit Meeting</h2>
              <button onClick={closeEditModal} className="text-gray-500 text-xl">
                ×
              </button>
            </div>
            <form onSubmit={handleEditMeeting} className="space-y-3">
              <input
                type="text"
                placeholder="Meeting Title"
                className="border p-2 rounded-lg w-full"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                placeholder="Description"
                className="border p-2 rounded-lg w-full"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <input
                type="datetime-local"
                className="border p-2 rounded-lg w-full"
                value={editMeetingDate}
                onChange={(e) => setEditMeetingDate(e.target.value)}
              />
              <input
                type="url"
                placeholder="Minutes URL (optional)"
                className="border p-2 rounded-lg w-full"
                value={editMinutesUrl}
                onChange={(e) => setEditMinutesUrl(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  {updating ? "Updating..." : "Update Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;