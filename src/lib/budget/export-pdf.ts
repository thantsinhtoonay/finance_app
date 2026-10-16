/**
 * Branded PDF transaction report (A4) — gold Shal Su header with the site
 * logo, summary cards, striped table with income/expense colors, page footer.
 * Pure-data parts live in ./report-data (unit-tested); this module is the
 * browser-facing generator (dynamic-imported by the settings screen).
 */
import { jsPDF } from "jspdf";
import autoTable, { type CellDef, type RowInput } from "jspdf-autotable";
import { formatDayFull, formatMoney, formatMonth } from "./format";
import { buildReportRows, summarizeReport } from "./report-data";
import type { Transaction } from "./types";

const GOLD: [number, number, number] = [184, 134, 11];
const INK: [number, number, number] = [61, 37, 18];
const MUTED: [number, number, number] = [139, 115, 85];
const INCOME: [number, number, number] = [46, 125, 50];
const EXPENSE: [number, number, number] = [192, 57, 43];
const BORDER: [number, number, number] = [224, 201, 168];
const CREAM: [number, number, number] = [255, 249, 240];

/** ASCII-safe money (helvetica lacks the U+2212 minus used by formatMoney). */
function money(value: number): string {
  const body = formatMoney(Math.abs(value));
  return value < 0 ? `-${body}` : body;
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/images/logo.jpg");
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return `data:image/jpeg;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

export async function exportToPdf(
  transactions: Transaction[],
  month?: string,
): Promise<void> {
  const rows = buildReportRows(transactions, month);
  const summary = summarizeReport(rows);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const stamp = new Date().toISOString().slice(0, 10);

  // ── Gold header band with framed logo + brand
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, W, 34, "F");
  const logo = await loadLogoDataUrl();
  let textX = M;
  if (logo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(M, 7, 20, 20, 4, 4, "F");
    try {
      doc.addImage(logo, "JPEG", M + 1.5, 8.5, 17, 17);
    } catch {
      // corrupt logo — keep the white tile
    }
    textX = M + 26;
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Shal Su", textX, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Transaction Report", textX, 21);
  doc.setFontSize(9);
  doc.text(month ? formatMonth(month) : "All transactions", textX, 26.5);
  doc.setFontSize(8.5);
  doc.text(`Generated ${stamp}`, W - M, 15, { align: "right" });
  doc.text(
    `${summary.count} transaction${summary.count === 1 ? "" : "s"}`,
    W - M,
    20.5,
    { align: "right" },
  );

  // ── Summary cards
  const cardY = 42;
  const cardH = 20;
  const gap = 4;
  const cardW = (W - 2 * M - 2 * gap) / 3;
  const cards: Array<{
    label: string;
    value: string;
    tint: [number, number, number];
    valueColor: [number, number, number];
  }> = [
    {
      label: "TOTAL INCOME",
      value: money(summary.income),
      tint: [232, 244, 233],
      valueColor: INCOME,
    },
    {
      label: "TOTAL EXPENSE",
      value: money(summary.expense),
      tint: [252, 232, 230],
      valueColor: EXPENSE,
    },
    {
      label: "NET",
      value: money(summary.net),
      tint: [245, 230, 208],
      valueColor: GOLD,
    },
  ];
  cards.forEach((card, i) => {
    const x = M + i * (cardW + gap);
    doc.setFillColor(...card.tint);
    doc.roundedRect(x, cardY, cardW, cardH, 2.5, 2.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(card.label, x + 4, cardY + 7);
    doc.setFontSize(11.5);
    doc.setTextColor(...card.valueColor);
    doc.text(card.value, x + 4, cardY + 15.5);
  });

  // ── Transactions table
  const emptyCell: CellDef = {
    content: "No transactions in this period.",
    colSpan: 5,
    styles: { halign: "center", textColor: MUTED },
  };
  const body: RowInput[] = rows.length
    ? rows.map((r) => [
        formatDayFull(r.date),
        r.type === "income" ? "Income" : "Expense",
        r.category,
        r.note,
        money(r.type === "expense" ? -r.amount : r.amount),
      ])
    : [[emptyCell]];

  autoTable(doc, {
    startY: cardY + cardH + 8,
    head: [["Date", "Type", "Category", "Note", "Amount"]],
    body,
    margin: { left: M, right: M, top: 12, bottom: 16 },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.2,
      textColor: INK,
      lineColor: BORDER,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: GOLD,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: CREAM },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 24 },
      2: { cellWidth: 32 },
      4: { halign: "right", cellWidth: 34, fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section !== "body" || rows.length === 0) return;
      const raw = data.row.raw as string[];
      const isExpense = raw[1] === "Expense";
      if (data.column.index === 1 || data.column.index === 4) {
        data.cell.styles.textColor = isExpense ? EXPENSE : INCOME;
      }
    },
    didDrawPage: () => {
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.4);
      doc.line(M, H - 12, W - M, H - 12);
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text("Shal Su · Personal Finance · www.thantsin.website", M, H - 7.5);
      doc.text(`Page ${doc.getNumberOfPages()}`, W - M, H - 7.5, {
        align: "right",
      });
    },
  });

  const filename = month
    ? `shalsu-report-${month}-${stamp}.pdf`
    : `shalsu-report-all-${stamp}.pdf`;
  doc.save(filename);
}
