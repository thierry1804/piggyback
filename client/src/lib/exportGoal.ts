import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Goal, Transaction } from "./localStorage";
import { format } from "date-fns";

export function exportGoalToPdf(
  goal: Goal & { transactions?: Transaction[] },
  currencySymbol: string,
  options?: { returnBuffer?: boolean }
): Uint8Array | void {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(goal.name, 14, 22);
  doc.setFontSize(11);
  doc.text(`Target: ${currencySymbol}${(goal.targetAmount / 100).toLocaleString()}`, 14, 30);
  doc.text(`Current: ${currencySymbol}${(goal.currentAmount / 100).toLocaleString()}`, 14, 36);
  if (goal.deadline) {
    doc.text(`Deadline: ${format(new Date(goal.deadline), "MMM d, yyyy")}`, 14, 42);
  }
  doc.text(`Generated: ${format(new Date(), "MMM d, yyyy HH:mm")}`, 14, 48);

  const transactions = goal.transactions ?? [];
  if (transactions.length > 0) {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const headers = [["Date", "Type", "Amount", "Note"]];
    const rows = sorted.map((t) => [
      format(new Date(t.createdAt), "MMM d, yyyy"),
      t.amount > 0 ? "Deposit" : "Withdrawal",
      `${t.amount > 0 ? "+" : ""}${currencySymbol}${(Math.abs(t.amount) / 100).toLocaleString()}`,
      t.note ?? "",
    ]);
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 56,
      styles: { fontSize: 9 },
    });
  }
  if (options?.returnBuffer) {
    const ab = doc.output("arraybuffer");
    return ab instanceof ArrayBuffer ? new Uint8Array(ab) : (ab as Uint8Array);
  }
  doc.save(`${goal.name.replace(/[^a-z0-9]/gi, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

export function exportGoalToExcel(
  goal: Goal & { transactions?: Transaction[] },
  currencySymbol: string
): void {
  const wsData: (string | number)[][] = [
    ["Goal", goal.name],
    ["Target", `${currencySymbol}${(goal.targetAmount / 100).toLocaleString()}`],
    ["Current", `${currencySymbol}${(goal.currentAmount / 100).toLocaleString()}`],
    ["Deadline", goal.deadline ? format(new Date(goal.deadline), "MMM d, yyyy") : ""],
    [],
    ["Date", "Type", "Amount", "Note"],
  ];
  const transactions = goal.transactions ?? [];
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  sorted.forEach((t) => {
    wsData.push([
      format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
      t.amount > 0 ? "Deposit" : "Withdrawal",
      t.amount / 100,
      t.note ?? "",
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, goal.name.slice(0, 31));
  XLSX.writeFile(
    wb,
    `${goal.name.replace(/[^a-z0-9]/gi, "_")}_${format(new Date(), "yyyy-MM-dd")}.xlsx`
  );
}
