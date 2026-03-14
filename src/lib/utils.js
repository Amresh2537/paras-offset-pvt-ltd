import { format } from "date-fns";

export function calculateImpressions(totalSheets, printingSide) {
  const sheets = Number(totalSheets || 0);
  if (!sheets || Number.isNaN(sheets) || sheets <= 0) return 0;
  const multiplier = String(printingSide || "").toUpperCase() === "DOUBLE" ? 2 : 1;
  return sheets * multiplier;
}

export function formatDateForDisplay(dateValue) {
  if (!dateValue) return "";
  try {
    if (typeof dateValue === "string") return dateValue;
    if (dateValue instanceof Date) return format(dateValue, "EEE, d MMM yyyy, HH:mm");
    return String(dateValue);
  } catch {
    return "";
  }
}

export function isEmpty(value) {
  if (value === null || value === undefined || value === "") return true;
  const stringValue = value.toString().trim();
  if (stringValue === "") return true;

  const placeholders = [
    "select operation",
    "select person",
    "select purpose",
    "select",
    "select machine",
    "select header",
    "select client",
    "select category",
    "select binding type",
    "select type",
    "select mill",
    "select side",
    "select item",
    "select paper/board",
    "select grade/brand",
    "select unit",
  ];

  if (placeholders.includes(stringValue.toLowerCase())) return true;
  return value === 0 || value === "0";
}

export async function generateJobCardNumber() {
  const [{ connectDB }, jobCardModule] = await Promise.all([
    import("@/lib/db"),
    import("@/models/JobCard"),
  ]);
  const JobCard = jobCardModule.default;

  await connectDB();

  const last = await JobCard.findOne({}, { jobCardNo: 1 })
    .sort({ createdAt: -1 })
    .lean();

  if (!last?.jobCardNo) return "1";
  const numeric = parseInt(String(last.jobCardNo).replace(/[^0-9]/g, ""), 10);
  if (Number.isNaN(numeric)) return "1";
  return String(numeric + 1);
}

export function normalizeLoadedData(jobCardData) {
  if (!jobCardData) return {};
  const normalized = { ...jobCardData };

  if (normalized.date) {
    const d = new Date(normalized.date);
    if (!Number.isNaN(d.getTime())) {
      normalized.date = d.toISOString().slice(0, 10);
    }
  }

  if (normalized.deliveryDate) {
    const d = new Date(normalized.deliveryDate);
    if (!Number.isNaN(d.getTime())) {
      normalized.deliveryDate = d.toISOString().slice(0, 10);
    }
  }

  normalized.jobOperations = Array.isArray(normalized.jobOperations)
    ? normalized.jobOperations
    : [];
  normalized.requiredItems = Array.isArray(normalized.requiredItems)
    ? normalized.requiredItems
    : [];
  normalized.requiredPaper = Array.isArray(normalized.requiredPaper)
    ? normalized.requiredPaper
    : [];

  return normalized;
}

export function collectFormData(formElements) {
  const result = {};

  for (const element of Array.from(formElements || [])) {
    if (!element || !element.name) continue;

    if (element.type === "checkbox") {
      result[element.name] = Boolean(element.checked);
      continue;
    }

    if (element.type === "number") {
      const raw = element.value;
      result[element.name] = raw === "" ? null : Number(raw);
      continue;
    }

    result[element.name] = element.value;
  }

  for (let i = 1; i <= 5; i += 1) {
    result[`impressions${i}`] = calculateImpressions(
      result[`totalSheets${i}`],
      result[`printingSide${i}`]
    );
  }

  return result;
}
