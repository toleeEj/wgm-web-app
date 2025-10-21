import { jsPDF } from "jspdf";

export const exportToCSV = (payments) => {
  const headers = ["Month", "Amount", "Status", "Approved At"];
  const rows = payments.map((p) => [
    p.month,
    p.amount,
    p.status,
    p.approved_at ? new Date(p.approved_at).toLocaleString() : "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "payment_history.csv";
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = (payments) => {
  const doc = new jsPDF();
  doc.text("Payment History Report", 10, 10);

  let y = 20;
  payments.forEach((p) => {
    doc.text(
      `${p.month} | ₹${p.amount} | ${p.status} | ${
        p.approved_at ? new Date(p.approved_at).toLocaleString() : "-"
      }`,
      10,
      y
    );
    y += 8;
  });

  doc.save("payment_history.pdf");
};
