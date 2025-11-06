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
  const [editPayment, setEditPayment] = useState(null);
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
        if (filePath) {
          await supabase.storage.from("payment-proofs").remove([filePath]);
        }
        const fileExt = editProofFile.name.split(".").pop();
        filePath = `${session.user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(filePath, editProofFile);
        if (uploadError) throw uploadError;
      }

      const { error: updateError } = await supabase
        .from("payments")
        .update({
          month: editMonth,
          amount: editAmount,
          proof_url: filePath,
          status: "Pending",
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
      if (payment.proof_url) {
        await supabase.storage.from("payment-proofs").remove([payment.proof_url]);
      }

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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payments...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Payments
          </h1>
          <p className="text-gray-600">Manage and track your payment history</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
            <h2 className="text-xl font-semibold text-white">Upload Payment Proof</h2>
          </div>
          <form onSubmit={handleUpload} className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month <span className="text-red-500">*</span>
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="" disabled>Select Month</option>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </span>
              ) : (
                "Submit Payment"
              )}
            </button>
          </form>
        </div>

        {/* Payment History Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-xl font-semibold text-white mb-2 sm:mb-0">Payment History</h2>
            <div className="flex gap-2">
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200">
                Export CSV
              </button>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200">
                Export PDF
              </button>
            </div>
          </div>

          <div className="p-6">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💸</div>
                <p className="text-gray-500 text-lg">No payment records found.</p>
                <p className="text-gray-400">Upload your first payment above to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Proof</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved At</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">{p.month}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="font-semibold text-gray-900">₹{p.amount}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {p.signed_url ? (
                            <img
                              src={p.signed_url}
                              alt={`Proof for ${p.month}`}
                              className="cursor-pointer w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-all duration-200 mx-auto"
                              onClick={() => openModal(p.signed_url)}
                            />
                          ) : (
                            <span className="text-gray-400">Loading...</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            p.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : p.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {p.approved_at ? new Date(p.approved_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(p)}
                              disabled={p.status === "Approved"}
                              className="bg-blue-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              disabled={p.status === "Approved"}
                              className="bg-red-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 transition-colors duration-200"
            >
              ✕
            </button>
            <img
              src={modalImage}
              alt="Enlarged Proof"
              className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Edit Payment</h2>
                <button onClick={closeEditModal} className="text-white text-2xl hover:text-gray-200 transition-colors duration-200">
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={editMonth}
                  onChange={(e) => setEditMonth(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="" disabled>Select Month</option>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Proof File</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                  onChange={handleEditFileChange}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 disabled:opacity-50 disabled:transform-none transition-all duration-200"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </span>
                  ) : (
                    "Update Payment"
                  )}
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