// src/pages/MemberPayments.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { exportToCSV, exportToPDF } from "../lib/reportUtils";

const MemberPayments = () => {
  const [session, setSession] = useState(null);
  const [payments, setPayments] = useState([]);
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPayment, setEditPayment] = useState(null); // Store payment being edited
  const [editMonth, setEditMonth] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editProofFile, setEditProofFile] = useState(null);

  // Load session
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
    };
    loadSession();
  }, []);

  // Fetch payments with signed URLs
  useEffect(() => {
    if (!session) return;
    fetchPayments();
  }, [session]);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("id, month, amount, status, proof_url, approved_at, created_at")
      .eq("member_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payments:", error);
      return;
    }

    const enrichedPayments = await Promise.all(
      data.map(async (p) => {
        let signed_url = null;
        if (p.proof_url) {
          const filePath = p.proof_url.split("/object/public/payment-proofs/")[1] || p.proof_url;
          const { data: signed } = await supabase
            .storage
            .from("payment-proofs")
            .createSignedUrl(filePath, 60 * 60);
          signed_url = signed?.signedUrl || null;
        }
        return { ...p, signed_url };
      })
    );

    setPayments(enrichedPayments);
    setLoading(false);
  };

  // Upload new payment proof
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!proofFile || !month || !amount) {
      alert("Please fill in all fields and attach proof.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = proofFile.name.split(".").pop();
      const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, proofFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("payments").insert([
        {
          member_id: session.user.id,
          month,
          amount,
          proof_url: filePath,
          status: "Pending",
        },
      ]);

      if (insertError) throw insertError;

      alert("Payment proof uploaded successfully!");
      setMonth("");
      setAmount("");
      setProofFile(null);
      fetchPayments();
    } catch (err) {
      console.error("Upload failed:", err.message);
      alert("Error uploading payment proof.");
    } finally {
      setUploading(false);
    }
  };

  // Edit payment
  const handleEdit = (payment) => {
    setEditPayment(payment);
    setEditMonth(payment.month);
    setEditAmount(payment.amount);
    setEditProofFile(null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editMonth || !editAmount) {
      alert("Please fill in all fields.");
      return;
    }

    setUploading(true);
    try {
      let filePath = editPayment.proof_url;
      if (editProofFile) {
        // Delete old file if new file is uploaded
        if (filePath) {
          await supabase.storage.from("payment-proofs").remove([filePath]);
        }
        // Upload new file
        const fileExt = editProofFile.name.split(".").pop();
        filePath = `${session.user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(filePath, editProofFile);
        if (uploadError) throw uploadError;
      }

      // Update payment record
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          month: editMonth,
          amount: editAmount,
          proof_url: filePath,
          status: "Pending", // Reset to Pending on edit
        })
        .eq("id", editPayment.id);

      if (updateError) throw updateError;

      alert("Payment updated successfully!");
      setIsEditModalOpen(false);
      setEditPayment(null);
      setEditMonth("");
      setEditAmount("");
      setEditProofFile(null);
      fetchPayments();
    } catch (err) {
      console.error("Update failed:", err.message);
      alert("Error updating payment.");
    } finally {
      setUploading(false);
    }
  };

  // Delete payment
  const handleDelete = async (payment) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      // Delete proof file from storage
      if (payment.proof_url) {
        await supabase.storage.from("payment-proofs").remove([payment.proof_url]);
      }

      // Delete payment record
      const { error } = await supabase.from("payments").delete().eq("id", payment.id);

      if (error) throw error;

      alert("Payment deleted successfully!");
      fetchPayments();
    } catch (err) {
      console.error("Delete failed:", err.message);
      alert("Error deleting payment.");
    }
  };

  const handleFileChange = (e) => setProofFile(e.target.files[0]);
  const handleEditFileChange = (e) => setEditProofFile(e.target.files[0]);

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditPayment(null);
    setEditMonth("");
    setEditAmount("");
    setEditProofFile(null);
  };

  if (loading) return <div className="p-6 text-gray-500">Loading payments...</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Payments</h1>

      {/* 💳 Upload Form */}
      <form onSubmit={handleUpload} className="bg-white p-4 rounded-lg shadow space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">Upload Payment Proof</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="" disabled>Select Month</option>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount (₹)"
            className="border p-2 rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="border p-2 rounded-lg"
            onChange={handleFileChange}
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          {uploading ? "Uploading..." : "Submit Payment"}
        </button>
      </form>

      {/* 📜 Payment History */}
      <section className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Payment History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("csv")}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition duration-300"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition duration-300"
            >
              Export PDF
            </button>
          </div>
        </div>

        {payments.length === 0 ? (
          <p className="text-gray-500">No payment records found.</p>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Month</th>
                <th className="border px-3 py-2 text-right">Amount (₹)</th>
                <th className="border px-3 py-2">Proof</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Approved At</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="border px-3 py-2">{p.month}</td>
                  <td className="border px-3 py-2 text-right">{p.amount}</td>
                  <td className="border px-3 py-2 text-center">
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
                  </td>
                  <td
                    className={`border px-3 py-2 text-center font-medium ${
                      p.status === "Approved"
                        ? "text-green-600"
                        : p.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {p.status}
                  </td>
                  <td className="border px-3 py-2 text-sm text-gray-500">
                    {p.approved_at ? new Date(p.approved_at).toLocaleString() : "-"}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600 transition duration-300"
                      disabled={p.status === "Approved"} // Disable edit for approved payments
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                      disabled={p.status === "Approved"} // Disable delete for approved payments
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Edit Payment</h2>
              <button onClick={closeEditModal} className="text-gray-500 text-xl">
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
              <select
                value={editMonth}
                onChange={(e) => setEditMonth(e.target.value)}
                className="border p-2 rounded-lg w-full"
              >
                <option value="" disabled>Select Month</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount (₹)"
                className="border p-2 rounded-lg w-full"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="border p-2 rounded-lg w-full"
                onChange={handleEditFileChange}
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
                  disabled={uploading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  {uploading ? "Updating..." : "Update Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPayments;