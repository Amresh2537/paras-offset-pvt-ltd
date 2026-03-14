"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Message from "@/components/Message";
import ModeIndicator from "@/components/ModeIndicator";

const FIVE = [0, 1, 2, 3, 4];
const SEVEN = [0, 1, 2, 3, 4, 5, 6];

function emptyJobDetail() {
  return {
    jobName: "",
    qty: "",
    itemCode: "",
    finishingSize: "",
    imageUrl: "",
  };
}

function emptyPaperCutting() {
  return {
    paperSize: "",
    gsm: "",
    paperType: "",
    paperMill: "",
    cuttingSize: "",
    actualSheet: "",
    wastageSheet: "",
    forWhat: "",
    jobName: "",
  };
}

function emptyPrinting() {
  return {
    machineName: "",
    noOfPlate: "",
    noOfForms: "",
    printing: "",
    plateType: "",
    forWhat: "",
    totalSheets: "",
    printingSide: "",
    impressions: 0,
    jobNamePrinting: "",
  };
}

function emptyRequiredItem() {
  return {
    itemName: "",
    size: "",
    qty: "",
    name: "",
    remark: "",
  };
}

function emptyRequiredPaper() {
  return {
    paperBoardName: "",
    gradeBrand: "",
    sizeOfPaper: "",
    gsm: "",
    qty: "",
    unit: "",
    remark: "",
  };
}

function emptyOperationCell() {
  return {
    operation: "",
    qty: "",
  };
}

function createOperationRows(count = 9) {
  return Array.from({ length: count }, (_, row) => ({
    row: row + 1,
    columns: Array.from({ length: 5 }, () => emptyOperationCell()),
  }));
}

function toIntOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function calcImpressions(totalSheets, side) {
  const sheets = Number(totalSheets || 0);
  if (!sheets) return 0;
  return String(side || "").toUpperCase() === "DOUBLE" ? sheets * 2 : sheets;
}

function createEmptyForm() {
  return {
    jobCardNo: "",
    jobType: "",
    date: "",
    poNo: "",
    oldJobNo: "",
    paperBy: "",
    deliveryDate: "",
    clientName: "",
    category: "",
    bindingType: "",
    jobSpecification: "",
    samples: {
      poplSample: "",
      clientSample: "",
      digitalPtg: "",
      ferrow: "",
      pdf: "",
      oldSheet: "",
    },
    jobDetails: FIVE.map(() => emptyJobDetail()),
    paperCutting: FIVE.map(() => emptyPaperCutting()),
    printingMachines: FIVE.map(() => emptyPrinting()),
    remark: "",
    jobOperationHeaders: ["", "", "", "", ""],
    jobOperations: createOperationRows(9),
    dieInfo: {
      howManyDie: "",
      typeOfDie: "",
      nameOfDie: "",
      dieNo: "",
    },
    packing: {
      cartonBy: "",
      labelBy: "",
      dispatchBy: "",
      shrink: "",
      typeOfPacking: "",
      requiredCtnPatti: "",
      packingRemark: "",
    },
    booking: {
      bookedBy: "",
      companyName: "PARAS OFFSET PVT LTD",
      approvedBy: "",
    },
    requiredItems: SEVEN.map(() => emptyRequiredItem()),
    requiredPaper: SEVEN.map(() => emptyRequiredPaper()),
    paperRequiredRemark: "",
  };
}

function normalizePrimitive(value) {
  return value === null || value === undefined ? "" : value;
}

function sanitizeRow(defaultRow, incomingRow = {}) {
  const next = { ...defaultRow };
  for (const key of Object.keys(next)) {
    next[key] = normalizePrimitive(incomingRow[key]);
  }
  return next;
}

function mapDocToForm(jobCard) {
  const empty = createEmptyForm();
  if (!jobCard) return empty;

  const form = {
    ...empty,
    jobCardNo: jobCard.jobCardNo || "",
    jobType: jobCard.jobType || "",
    date: jobCard.date ? new Date(jobCard.date).toISOString().slice(0, 10) : "",
    poNo: jobCard.poNo || "",
    oldJobNo: jobCard.oldJobNo || "",
    paperBy: jobCard.paperBy || "",
    deliveryDate: jobCard.deliveryDate
      ? new Date(jobCard.deliveryDate).toISOString().slice(0, 10)
      : "",
    clientName: jobCard.clientName || "",
    category: jobCard.category || "",
    bindingType: jobCard.bindingType || "",
    jobSpecification: jobCard.jobSpecification || "",
    samples: {
      poplSample: jobCard.samples?.poplSample || "",
      clientSample: jobCard.samples?.clientSample || "",
      digitalPtg: jobCard.samples?.digitalPtg || "",
      ferrow: jobCard.samples?.ferrow || "",
      pdf: jobCard.samples?.pdf || "",
      oldSheet: jobCard.samples?.oldSheet || "",
    },
    remark: jobCard.remark || "",
    jobOperationHeaders: Array.isArray(jobCard.jobOperationHeaders)
      ? [
          jobCard.jobOperationHeaders[0] || "",
          jobCard.jobOperationHeaders[1] || "",
          jobCard.jobOperationHeaders[2] || "",
          jobCard.jobOperationHeaders[3] || "",
          jobCard.jobOperationHeaders[4] || "",
        ]
      : ["", "", "", "", ""],
    dieInfo: {
      howManyDie: jobCard.dieInfo?.howManyDie || "",
      typeOfDie: jobCard.dieInfo?.typeOfDie || "",
      nameOfDie: jobCard.dieInfo?.nameOfDie || "",
      dieNo: jobCard.dieInfo?.dieNo || "",
    },
    packing: {
      cartonBy: jobCard.packing?.cartonBy || "",
      labelBy: jobCard.packing?.labelBy || "",
      dispatchBy: jobCard.packing?.dispatchBy || "",
      shrink: jobCard.packing?.shrink || "",
      typeOfPacking: jobCard.packing?.typeOfPacking || "",
      requiredCtnPatti: jobCard.packing?.requiredCtnPatti || "",
      packingRemark: jobCard.packing?.packingRemark || "",
    },
    booking: {
      bookedBy: jobCard.booking?.bookedBy || "",
      companyName: jobCard.booking?.companyName || "PARAS OFFSET PVT LTD",
      approvedBy: jobCard.booking?.approvedBy || "",
    },
    paperRequiredRemark: jobCard.paperRequiredRemark || "",
  };

  form.jobDetails = FIVE.map((index) =>
    sanitizeRow(emptyJobDetail(), jobCard.jobDetails?.[index] || {})
  );

  form.paperCutting = FIVE.map((index) =>
    sanitizeRow(emptyPaperCutting(), jobCard.paperCutting?.[index] || {})
  );

  form.printingMachines = FIVE.map((index) => {
    const item = sanitizeRow(emptyPrinting(), jobCard.printingMachines?.[index] || {});
    return {
      ...item,
      impressions: calcImpressions(item.totalSheets, item.printingSide),
    };
  });

  form.requiredItems = SEVEN.map((index) =>
    sanitizeRow(emptyRequiredItem(), jobCard.requiredItems?.[index] || {})
  );

  form.requiredPaper = SEVEN.map((index) =>
    sanitizeRow(emptyRequiredPaper(), jobCard.requiredPaper?.[index] || {})
  );

  const incomingRows = Array.isArray(jobCard.jobOperations)
    ? jobCard.jobOperations
    : [];
  const rowCount = Math.max(9, incomingRows.length || 0);
  const rows = createOperationRows(rowCount);
  for (let r = 0; r < rowCount; r += 1) {
    const cols = incomingRows[r]?.columns || [];
    for (let c = 0; c < 5; c += 1) {
      rows[r].columns[c] = {
        operation: cols[c]?.machine ? String(cols[c].machine).split("|")[0].trim() : "",
        qty: cols[c]?.qty ?? "",
      };
    }
  }
  form.jobOperations = rows;

  return form;
}

function mapFormToPayload(form) {
  return {
    jobCardNo: form.jobCardNo || undefined,
    jobType: form.jobType || undefined,
    date: form.date ? new Date(form.date).toISOString() : undefined,
    poNo: form.poNo || undefined,
    oldJobNo: form.oldJobNo || undefined,
    paperBy: form.paperBy || undefined,
    deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : undefined,
    clientName: form.clientName || undefined,
    category: form.category || undefined,
    bindingType: form.bindingType || undefined,
    jobSpecification: form.jobSpecification || undefined,
    samples: { ...form.samples },
    jobDetails: form.jobDetails.map((row) => ({
      jobName: row.jobName || undefined,
      qty: toIntOrNull(row.qty),
      itemCode: row.itemCode || undefined,
      finishingSize: row.finishingSize || undefined,
      imageUrl: row.imageUrl || undefined,
    })),
    paperCutting: form.paperCutting.map((row) => ({
      paperSize: row.paperSize || undefined,
      gsm: row.gsm || undefined,
      paperType: row.paperType || undefined,
      paperMill: row.paperMill || undefined,
      cuttingSize: row.cuttingSize || undefined,
      actualSheet: toIntOrNull(row.actualSheet),
      wastageSheet: toIntOrNull(row.wastageSheet),
      forWhat: row.forWhat || undefined,
      jobName: row.jobName || undefined,
    })),
    printingMachines: form.printingMachines.map((row) => ({
      machineName: row.machineName || undefined,
      noOfPlate: toIntOrNull(row.noOfPlate),
      noOfForms: toIntOrNull(row.noOfForms),
      printing: row.printing || undefined,
      plateType: row.plateType || undefined,
      forWhat: row.forWhat || undefined,
      totalSheets: toIntOrNull(row.totalSheets),
      printingSide: row.printingSide || undefined,
      impressions: calcImpressions(row.totalSheets, row.printingSide),
      jobNamePrinting: row.jobNamePrinting || undefined,
    })),
    remark: form.remark || undefined,
    jobOperationHeaders: form.jobOperationHeaders,
    jobOperations: form.jobOperations.map((row, rowIndex) => ({
      row: rowIndex + 1,
      columns: row.columns.map((col) => ({
        qty: toIntOrNull(col.qty),
        machine: col.operation || undefined,
      })),
    })),
    dieInfo: { ...form.dieInfo },
    packing: { ...form.packing },
    booking: { ...form.booking },
    requiredItems: form.requiredItems.map((row) => ({
      itemName: row.itemName || undefined,
      size: row.size || undefined,
      qty: toIntOrNull(row.qty),
      name: row.name || undefined,
      remark: row.remark || undefined,
    })),
    requiredPaper: form.requiredPaper.map((row) => ({
      paperBoardName: row.paperBoardName || undefined,
      gradeBrand: row.gradeBrand || undefined,
      sizeOfPaper: row.sizeOfPaper || undefined,
      gsm: row.gsm || undefined,
      qty: toIntOrNull(row.qty),
      unit: row.unit || undefined,
      remark: row.remark || undefined,
    })),
    paperRequiredRemark: form.paperRequiredRemark || undefined,
  };
}

function Card({ title, children, right = null }) {
  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-sky-200">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export default function JobCardForm({ mode = "new", initialData = null }) {
  const router = useRouter();
  const [form, setForm] = useState(() => mapDocToForm(initialData));
  const [message, setMessage] = useState({ type: "info", text: "" });
  const [saving, setSaving] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [jobCardOptions, setJobCardOptions] = useState([]);
  const [selectedOldId, setSelectedOldId] = useState("");
  const [loadedCardId, setLoadedCardId] = useState(initialData?._id || "");
  const [isUpdateMode, setIsUpdateMode] = useState(mode === "edit");

  useEffect(() => {
    setForm(mapDocToForm(initialData));
    setLoadedCardId(initialData?._id || "");
    setIsUpdateMode(mode === "edit");
  }, [initialData, mode]);

  const isEdit = isUpdateMode;

  const impressionsPreview = useMemo(
    () => form.printingMachines.map((row) => calcImpressions(row.totalSheets, row.printingSide)),
    [form.printingMachines]
  );

  const patchTop = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  function patchObject(section, key, value) {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  }

  function patchArray(section, index, key, value) {
    setForm((prev) => {
      const next = [...prev[section]];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, [section]: next };
    });
  }

  function patchOperation(rowIndex, colIndex, key, value) {
    setForm((prev) => {
      const rows = [...prev.jobOperations];
      const row = rows[rowIndex];
      const cols = [...row.columns];
      cols[colIndex] = { ...cols[colIndex], [key]: value };
      rows[rowIndex] = { ...row, columns: cols };
      return { ...prev, jobOperations: rows };
    });
  }

  const refreshNumber = useCallback(async () => {
    try {
      const res = await fetch("/api/jobcard-numbers", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.nextJobCardNo) {
        patchTop("jobCardNo", data.nextJobCardNo);
      }
    } catch {
      // no-op
    }
  }, [patchTop]);

  const loadMeta = useCallback(async () => {
    try {
      const [dropRes, jobRes] = await Promise.all([
        fetch("/api/dropdowns", { cache: "no-store" }),
        fetch("/api/jobcards", { cache: "no-store" }),
      ]);

      if (dropRes.ok) {
        const dropData = await dropRes.json();
        setDropdowns(dropData.dropdowns || {});
      }

      if (jobRes.ok) {
        const jobsData = await jobRes.json();
        const options = (jobsData.jobCards || []).map((jobCard) => ({
          id: jobCard._id,
          no: jobCard.jobCardNo,
          clientName: jobCard.clientName,
        }));
        setJobCardOptions(options);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load dropdowns or old job cards." });
    }
  }, []);

  useEffect(() => {
    void loadMeta();
    if (!initialData?.jobCardNo) {
      void refreshNumber();
    }
  }, [initialData?.jobCardNo, loadMeta, refreshNumber]);

  async function handleValidateJobCardNo() {
    try {
      const res = await fetch("/api/jobcards", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const exists = (data.jobCards || []).some(
        (item) => String(item.jobCardNo) === String(form.jobCardNo)
      );
      if (exists) {
        setMessage({ type: "error", text: "Job card number already exists." });
      } else {
        setMessage({ type: "success", text: "Job card number is available." });
      }
    } catch {
      setMessage({ type: "error", text: "Validation failed." });
    }
  }

  async function handleLoadOld() {
    if (!selectedOldId) return;
    try {
      const res = await fetch(`/api/jobcards/${selectedOldId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load selected job card");
      }
      setForm(mapDocToForm(data.jobCard));
      setLoadedCardId(selectedOldId);
      setIsUpdateMode(true);
      setMessage({ type: "success", text: "Old job card loaded. You can update it now." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to load old job card." });
    }
  }

  function handleClearLoad() {
    setSelectedOldId("");
    setLoadedCardId("");
    setIsUpdateMode(false);
    setForm(createEmptyForm());
    setMessage({ type: "info", text: "Form cleared. Back to new mode." });
    void refreshNumber();
  }

  function autoFillJobNamesToPaper() {
    setForm((prev) => {
      const paperCutting = [...prev.paperCutting];
      for (let i = 0; i < 5; i += 1) {
        paperCutting[i] = {
          ...paperCutting[i],
          jobName: prev.jobDetails[i]?.jobName || paperCutting[i].jobName,
        };
      }
      return { ...prev, paperCutting };
    });
  }

  function copyForWhatToPrinting() {
    setForm((prev) => {
      const printingMachines = [...prev.printingMachines];
      for (let i = 0; i < 5; i += 1) {
        const actual = Number(prev.paperCutting[i]?.actualSheet || 0);
        const wastage = Number(prev.paperCutting[i]?.wastageSheet || 0);
        const totalSheets = actual + wastage || "";
        printingMachines[i] = {
          ...printingMachines[i],
          forWhat: prev.paperCutting[i]?.forWhat || printingMachines[i].forWhat,
          totalSheets,
          impressions: calcImpressions(totalSheets, printingMachines[i].printingSide),
        };
      }
      return { ...prev, printingMachines };
    });
  }

  function autoFillRequiredItemsFromJobDetails() {
    setForm((prev) => {
      const requiredItems = [...prev.requiredItems];
      for (let i = 0; i < 5; i += 1) {
        requiredItems[i] = {
          ...requiredItems[i],
          itemName: prev.jobDetails[i]?.jobName || requiredItems[i].itemName,
          size: prev.jobDetails[i]?.finishingSize || requiredItems[i].size,
          qty: prev.jobDetails[i]?.qty || requiredItems[i].qty,
          name: prev.clientName || requiredItems[i].name,
        };
      }
      return { ...prev, requiredItems };
    });
  }

  function autoFillRequiredPaperFromPaperCutting() {
    setForm((prev) => {
      const requiredPaper = [...prev.requiredPaper];
      for (let i = 0; i < 5; i += 1) {
        requiredPaper[i] = {
          ...requiredPaper[i],
          paperBoardName: prev.paperCutting[i]?.paperType || requiredPaper[i].paperBoardName,
          sizeOfPaper: prev.paperCutting[i]?.paperSize || requiredPaper[i].sizeOfPaper,
          gsm: prev.paperCutting[i]?.gsm || requiredPaper[i].gsm,
          qty: prev.paperCutting[i]?.actualSheet || requiredPaper[i].qty,
        };
      }
      return { ...prev, requiredPaper };
    });
  }

  function addOperationRow() {
    setForm((prev) => {
      if (prev.jobOperations.length >= 15) return prev;
      return {
        ...prev,
        jobOperations: [
          ...prev.jobOperations,
          {
            row: prev.jobOperations.length + 1,
            columns: Array.from({ length: 5 }, () => emptyOperationCell()),
          },
        ],
      };
    });
  }

  async function submitAsNew(keepOnForm = false) {
    setSaving(true);
    setMessage({ type: "info", text: "" });
    try {
      let nextNumber = form.jobCardNo;
      if (!nextNumber) {
        const resNum = await fetch("/api/jobcard-numbers", { cache: "no-store" });
        if (resNum.ok) {
          const numData = await resNum.json();
          nextNumber = numData.nextJobCardNo || "";
        }
      }

      const payload = mapFormToPayload({ ...form, jobCardNo: nextNumber });
      const res = await fetch("/api/jobcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save job card");
      }

      const savedId = data?.jobCard?._id;
      const pdfUrl = data?.pdfUrl || data?.jobCard?.pdfUrl || (savedId ? `/api/pdf/${savedId}` : "");
      if (pdfUrl) {
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
      }

      if (keepOnForm) {
        setForm(createEmptyForm());
        setLoadedCardId("");
        setIsUpdateMode(false);
        setMessage({ type: "success", text: "Job card saved. Ready for next new job card." });
        await refreshNumber();
      } else {
        setMessage({ type: "success", text: "Job card saved successfully." });
        router.push("/dashboard/jobcards");
        router.refresh();
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  async function submitUpdate() {
    if (!loadedCardId) {
      setMessage({ type: "error", text: "No loaded job card selected for update." });
      return;
    }

    setSaving(true);
    setMessage({ type: "info", text: "" });
    try {
      const payload = mapFormToPayload(form);
      const res = await fetch(`/api/jobcards/${loadedCardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update job card");
      }

      const pdfUrl = data?.pdfUrl || data?.jobCard?.pdfUrl || (loadedCardId ? `/api/pdf/${loadedCardId}` : "");
      if (pdfUrl) {
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
      }

      setMessage({ type: "success", text: "Loaded job card updated successfully." });
      router.push("/dashboard/jobcards");
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">JOB CARD MANAGEMENT SYSTEM</h1>
          <p className="text-xs text-slate-400">{isEdit ? "✏️ MODE: EDITING LOADED JOB CARD" : "🆕 MODE: CREATING NEW JOB CARD"}</p>
        </div>
        <ModeIndicator mode={isEdit ? "edit" : "new"} jobCardNo={form.jobCardNo} />
      </div>

      <Message type={message.type} text={message.text} />

      <Card title="LOAD FROM OLD JOB CARD (CRUD OPERATION)">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Select Old Job Card</label>
            <select
              value={selectedOldId}
              onChange={(e) => setSelectedOldId(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100"
            >
              <option value="">Select Job Card to Load</option>
              {jobCardOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.no} {option.clientName ? `- ${option.clientName}` : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleLoadOld}
            className="self-end rounded-md bg-sky-500 px-4 py-2 text-xs font-medium text-white hover:bg-sky-400"
          >
            Load Data
          </button>
          <button
            type="button"
            onClick={handleClearLoad}
            className="self-end rounded-md border border-slate-600 px-4 py-2 text-xs text-slate-100 hover:border-slate-400"
          >
            Clear
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Select an old job card to load its data. You can then UPDATE it or save as NEW.
        </p>
      </Card>

      <Card title="JOB CARD BASIC INFORMATION" right={<button type="button" onClick={refreshNumber} className="rounded border border-slate-600 px-2 py-1 text-[11px] text-slate-200">Refresh No.</button>}>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">JOB CARD NO</label>
            <div className="flex gap-2">
              <input
                value={form.jobCardNo}
                onChange={(e) => patchTop("jobCardNo", e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100"
                placeholder="Auto-generated or enter manually"
              />
              <button type="button" onClick={handleValidateJobCardNo} className="rounded border border-emerald-500/50 px-2 py-1 text-[11px] text-emerald-200">Validate</button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">JOB TYPE</label>
            <select value={form.jobType} onChange={(e) => patchTop("jobType", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100">
              <option value="">Select</option>
              <option value="NEW">NEW</option>
              <option value="REPEAT">REPEAT</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Date</label>
            <input type="date" value={form.date} onChange={(e) => patchTop("date", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">PO NO.</label>
            <input value={form.poNo} onChange={(e) => patchTop("poNo", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">OLD JOB NO</label>
            <input value={form.oldJobNo} onChange={(e) => patchTop("oldJobNo", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Paper By</label>
            <input value={form.paperBy} onChange={(e) => patchTop("paperBy", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Delivery date</label>
            <input type="date" value={form.deliveryDate} onChange={(e) => patchTop("deliveryDate", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100" />
          </div>
        </div>
      </Card>

      <Card title="CLIENT INFORMATION">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Name of Client</label>
            <select value={form.clientName} onChange={(e) => patchTop("clientName", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100">
              <option value="">Select Client</option>
              {(dropdowns.clientNames || []).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Category</label>
            <select value={form.category} onChange={(e) => patchTop("category", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100">
              <option value="">Select Category</option>
              {(dropdowns.categories || []).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Type of Binding</label>
            <select value={form.bindingType} onChange={(e) => patchTop("bindingType", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100">
              <option value="">Select Binding Type</option>
              {(dropdowns.bindingTypes || []).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="JOB DETAILS">
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px] text-slate-200">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="border border-slate-700 px-2 py-1">S NO</th>
                <th className="border border-slate-700 px-2 py-1">JOB NAME</th>
                <th className="border border-slate-700 px-2 py-1">QTY</th>
                <th className="border border-slate-700 px-2 py-1">ITEM CODE</th>
                <th className="border border-slate-700 px-2 py-1">FINISHING SIZE</th>
                <th className="border border-slate-700 px-2 py-1">IMAGE URL</th>
              </tr>
            </thead>
            <tbody>
              {FIVE.map((i) => (
                <tr key={i}>
                  <td className="border border-slate-700 px-2 py-1 text-center">{i + 1}</td>
                  <td className="border border-slate-700 p-1"><input value={form.jobDetails[i].jobName} onChange={(e) => patchArray("jobDetails", i, "jobName", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px]" placeholder="Enter Job Name" /></td>
                  <td className="border border-slate-700 p-1"><input type="number" value={form.jobDetails[i].qty} onChange={(e) => patchArray("jobDetails", i, "qty", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px]" placeholder="Qty" /></td>
                  <td className="border border-slate-700 p-1"><input value={form.jobDetails[i].itemCode} onChange={(e) => patchArray("jobDetails", i, "itemCode", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px]" placeholder="Item Code" /></td>
                  <td className="border border-slate-700 p-1"><input value={form.jobDetails[i].finishingSize} onChange={(e) => patchArray("jobDetails", i, "finishingSize", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px]" placeholder="Finishing Size" /></td>
                  <td className="border border-slate-700 p-1"><input value={form.jobDetails[i].imageUrl} onChange={(e) => patchArray("jobDetails", i, "imageUrl", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px]" placeholder="Image URL" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="JOB SPECIFICATION">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Job Specification Description</label>
            <textarea value={form.jobSpecification} onChange={(e) => patchTop("jobSpecification", e.target.value)} rows={3} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["poplSample", "POPL SAMPLE"],
              ["clientSample", "CLIENT SAMPLE"],
              ["digitalPtg", "DIGITAL PTG"],
              ["ferrow", "FERROW"],
              ["pdf", "PDF"],
              ["oldSheet", "OLD SHEET"],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-slate-300">{label}</label>
                <input value={form.samples[key]} onChange={(e) => patchObject("samples", key, e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="PAPER & CUTTING" right={<button type="button" onClick={autoFillJobNamesToPaper} className="rounded border border-emerald-500/50 px-2 py-1 text-[11px] text-emerald-200">Auto Fill Job Names from Job Details</button>}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px] text-slate-200">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="border border-slate-700 px-2 py-1">Paper Size</th>
                <th className="border border-slate-700 px-2 py-1">Gsm / mm</th>
                <th className="border border-slate-700 px-2 py-1">Type of Paper/Board</th>
                <th className="border border-slate-700 px-2 py-1">Paper Mill name</th>
                <th className="border border-slate-700 px-2 py-1">CUTTING SIZE</th>
                <th className="border border-slate-700 px-2 py-1">ACTUAL SHEET</th>
                <th className="border border-slate-700 px-2 py-1">WASTAGE SHEET</th>
                <th className="border border-slate-700 px-2 py-1">For What</th>
                <th className="border border-slate-700 px-2 py-1">Job Name</th>
              </tr>
            </thead>
            <tbody>
              {FIVE.map((i) => (
                <tr key={i}>
                  <td className="border border-slate-700 p-1"><input value={form.paperCutting[i].paperSize} onChange={(e) => patchArray("paperCutting", i, "paperSize", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Paper Size" /></td>
                  <td className="border border-slate-700 p-1"><input value={form.paperCutting[i].gsm} onChange={(e) => patchArray("paperCutting", i, "gsm", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="GSM" /></td>
                  <td className="border border-slate-700 p-1"><select value={form.paperCutting[i].paperType} onChange={(e) => patchArray("paperCutting", i, "paperType", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Type</option>{(dropdowns.paperTypes || []).map((item) => (<option key={item} value={item}>{item}</option>))}</select></td>
                  <td className="border border-slate-700 p-1"><select value={form.paperCutting[i].paperMill} onChange={(e) => patchArray("paperCutting", i, "paperMill", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Mill</option>{(dropdowns.paperMills || []).map((item) => (<option key={item} value={item}>{item}</option>))}</select></td>
                  <td className="border border-slate-700 p-1"><input value={form.paperCutting[i].cuttingSize} onChange={(e) => patchArray("paperCutting", i, "cuttingSize", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Cutting Size" /></td>
                  <td className="border border-slate-700 p-1"><input type="number" value={form.paperCutting[i].actualSheet} onChange={(e) => patchArray("paperCutting", i, "actualSheet", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Actual Sheets" /></td>
                  <td className="border border-slate-700 p-1"><input type="number" value={form.paperCutting[i].wastageSheet} onChange={(e) => patchArray("paperCutting", i, "wastageSheet", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Wastage Sheets" /></td>
                  <td className="border border-slate-700 p-1"><select value={form.paperCutting[i].forWhat} onChange={(e) => patchArray("paperCutting", i, "forWhat", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Purpose</option>{(dropdowns.forWhatOptions || []).map((item) => (<option key={item} value={item}>{item}</option>))}</select></td>
                  <td className="border border-slate-700 p-1"><input value={form.paperCutting[i].jobName} onChange={(e) => patchArray("paperCutting", i, "jobName", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Job Name" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="PRINTING MACHINE NAME, PLATE & PRINTING" right={<div className="flex gap-2"><button type="button" onClick={copyForWhatToPrinting} className="rounded border border-emerald-500/50 px-2 py-1 text-[11px] text-emerald-200">Copy For What</button><button type="button" onClick={copyForWhatToPrinting} className="rounded border border-sky-500/50 px-2 py-1 text-[11px] text-sky-200">Auto Pick Headers & Calculate Total</button></div>}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px] text-slate-200">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="border border-slate-700 px-2 py-1">Name of Machine</th>
                <th className="border border-slate-700 px-2 py-1">No of Plate</th>
                <th className="border border-slate-700 px-2 py-1">No of Forms</th>
                <th className="border border-slate-700 px-2 py-1">PRINTING</th>
                <th className="border border-slate-700 px-2 py-1">Type of plate</th>
                <th className="border border-slate-700 px-2 py-1">For What</th>
                <th className="border border-slate-700 px-2 py-1">Total Sheets</th>
                <th className="border border-slate-700 px-2 py-1">Printing Side</th>
                <th className="border border-slate-700 px-2 py-1">Impressions</th>
              </tr>
            </thead>
            <tbody>
              {FIVE.map((i) => (
                <tr key={i}>
                  <td className="border border-slate-700 p-1"><select value={form.printingMachines[i].machineName} onChange={(e) => patchArray("printingMachines", i, "machineName", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Machine</option>{(dropdowns.printingMachines || []).map((item) => (<option key={item} value={item}>{item}</option>))}</select></td>
                  <td className="border border-slate-700 p-1"><input type="number" value={form.printingMachines[i].noOfPlate} onChange={(e) => patchArray("printingMachines", i, "noOfPlate", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Plates" /></td>
                  <td className="border border-slate-700 p-1"><input type="number" value={form.printingMachines[i].noOfForms} onChange={(e) => patchArray("printingMachines", i, "noOfForms", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Forms" /></td>
                  <td className="border border-slate-700 p-1"><input value={form.printingMachines[i].printing} onChange={(e) => patchArray("printingMachines", i, "printing", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Printing" /></td>
                  <td className="border border-slate-700 p-1"><input value={form.printingMachines[i].plateType} onChange={(e) => patchArray("printingMachines", i, "plateType", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Plate Type" /></td>
                  <td className="border border-slate-700 p-1"><select value={form.printingMachines[i].forWhat} onChange={(e) => patchArray("printingMachines", i, "forWhat", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Purpose</option>{(dropdowns.forWhatOptions || []).map((item) => (<option key={item} value={item}>{item}</option>))}</select></td>
                  <td className="border border-slate-700 p-1"><input type="number" value={form.printingMachines[i].totalSheets} onChange={(e) => patchArray("printingMachines", i, "totalSheets", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Total" /></td>
                  <td className="border border-slate-700 p-1"><select value={form.printingMachines[i].printingSide} onChange={(e) => patchArray("printingMachines", i, "printingSide", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Side</option><option value="SINGLE">SINGLE</option><option value="DOUBLE">DOUBLE</option></select></td>
                  <td className="border border-slate-700 px-2 py-1 text-center text-sky-200">{impressionsPreview[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="REMARK">
        <textarea value={form.remark} onChange={(e) => patchTop("remark", e.target.value)} rows={3} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100" />
      </Card>

      <Card title="JOB OPERATION" right={<button type="button" onClick={addOperationRow} className="rounded border border-emerald-500/50 px-2 py-1 text-[11px] text-emerald-200">Add More Operations</button>}>
        <div className="mb-3 grid gap-2 md:grid-cols-5">
          {FIVE.map((index) => (
            <select
              key={index}
              value={form.jobOperationHeaders[index]}
              onChange={(e) => {
                const next = [...form.jobOperationHeaders];
                next[index] = e.target.value;
                patchTop("jobOperationHeaders", next);
              }}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100"
            >
              <option value="">Select Header</option>
              {(dropdowns.jobOperations || []).map((item) => (
                <option key={`${item}-header-${index}`} value={item}>{item}</option>
              ))}
            </select>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px] text-slate-200">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="border border-slate-700 px-2 py-1">S NO</th>
                {FIVE.map((col) => (
                  <th key={col} className="border border-slate-700 px-2 py-1">COL {col + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.jobOperations.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  <td className="border border-slate-700 px-2 py-1 text-center">{rowIndex + 1}</td>
                  {FIVE.map((colIndex) => (
                    <td key={`row-${rowIndex}-col-${colIndex}`} className="border border-slate-700 p-1">
                      <div className="grid grid-cols-1 gap-1">
                        <input type="number" value={row.columns[colIndex].qty} onChange={(e) => patchOperation(rowIndex, colIndex, "qty", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Qty" />
                        <select value={row.columns[colIndex].operation} onChange={(e) => patchOperation(rowIndex, colIndex, "operation", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-1">
                          <option value="">Select Operation</option>
                          {(dropdowns.jobOperations || []).map((item) => (
                            <option key={`${item}-row-${rowIndex}-col-${colIndex}`} value={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="DIE INFORMATION">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs text-slate-300">HOW MANY DIE:</label>
          <input value={form.dieInfo.howManyDie} onChange={(e) => patchObject("dieInfo", "howManyDie", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="HOW MANY DIE" />

          <label className="text-xs text-slate-300">Type of die:</label>
          <input value={form.dieInfo.typeOfDie} onChange={(e) => patchObject("dieInfo", "typeOfDie", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Type of die" />

          <label className="text-xs text-slate-300">Name of die:</label>
          <input value={form.dieInfo.nameOfDie} onChange={(e) => patchObject("dieInfo", "nameOfDie", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Name of die" />

          <label className="text-xs text-slate-300">Die no:</label>
          <input value={form.dieInfo.dieNo} onChange={(e) => patchObject("dieInfo", "dieNo", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Die no" />
        </div>
      </Card>

      <Card title="PACKING / LABELING / DISPATCH">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs text-slate-300">Carton by:</label>
          <input value={form.packing.cartonBy} onChange={(e) => patchObject("packing", "cartonBy", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Carton by" />

          <label className="text-xs text-slate-300">Label by:</label>
          <input value={form.packing.labelBy} onChange={(e) => patchObject("packing", "labelBy", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Label by" />

          <label className="text-xs text-slate-300">Dispatch by:</label>
          <input value={form.packing.dispatchBy} onChange={(e) => patchObject("packing", "dispatchBy", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Dispatch by" />

          <label className="text-xs text-slate-300">Shrink:</label>
          <input value={form.packing.shrink} onChange={(e) => patchObject("packing", "shrink", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Shrink" />

          <label className="text-xs text-slate-300">Type of Packing:</label>
          <input value={form.packing.typeOfPacking} onChange={(e) => patchObject("packing", "typeOfPacking", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Type of Packing" />

          <label className="text-xs text-slate-300">Required Ctn. Patti:</label>
          <input value={form.packing.requiredCtnPatti} onChange={(e) => patchObject("packing", "requiredCtnPatti", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Required Ctn. Patti" />

          <label className="text-xs text-slate-300">Packing Remark:</label>
          <input value={form.packing.packingRemark} onChange={(e) => patchObject("packing", "packingRemark", e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Packing Remark" />
        </div>
      </Card>

      <Card title="REQUIRED ITEM FOR JOB" right={<div className="flex gap-2"><button type="button" onClick={autoFillRequiredItemsFromJobDetails} className="rounded border border-emerald-500/50 px-2 py-1 text-[11px] text-emerald-200">Auto Fill from Job Details</button><button type="button" onClick={autoFillRequiredPaperFromPaperCutting} className="rounded border border-sky-500/50 px-2 py-1 text-[11px] text-sky-200">Auto Fill from Paper Details</button></div>}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px] text-slate-200">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="border border-slate-700 px-2 py-1">NAME OF ITEM</th>
                <th className="border border-slate-700 px-2 py-1">SIZE OF ITEM</th>
                <th className="border border-slate-700 px-2 py-1">QTY</th>
                <th className="border border-slate-700 px-2 py-1">Name</th>
                <th className="border border-slate-700 px-2 py-1">REMARK</th>
              </tr>
            </thead>
            <tbody>
              {SEVEN.map((i) => (
                <tr key={i}>
                  <td className="border border-slate-700 p-1"><select value={form.requiredItems[i].itemName} onChange={(e) => patchArray("requiredItems", i, "itemName", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Item</option>{(dropdowns.itemNames || []).map((item) => (<option key={item} value={item}>{item}</option>))}</select></td>
                  <td className="border border-slate-700 p-1"><input value={form.requiredItems[i].size} onChange={(e) => patchArray("requiredItems", i, "size", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Size" /></td>
                  <td className="border border-slate-700 p-1"><input type="number" value={form.requiredItems[i].qty} onChange={(e) => patchArray("requiredItems", i, "qty", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Qty" /></td>
                  <td className="border border-slate-700 p-1"><input value={form.requiredItems[i].name} onChange={(e) => patchArray("requiredItems", i, "name", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Name" /></td>
                  <td className="border border-slate-700 p-1"><input value={form.requiredItems[i].remark} onChange={(e) => patchArray("requiredItems", i, "remark", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Remark" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="REQUIRED PAPER & BOARD FOR JOB" right={<button type="button" onClick={autoFillRequiredPaperFromPaperCutting} className="rounded border border-emerald-500/50 px-2 py-1 text-[11px] text-emerald-200">Auto Fill from Paper & Cutting</button>}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px] text-slate-200">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="border border-slate-700 px-2 py-1">PAPER OR BOARD NAME</th>
                <th className="border border-slate-700 px-2 py-1">GRADE/BRAND NAME</th>
                <th className="border border-slate-700 px-2 py-1">SIZE OF PAPER</th>
                <th className="border border-slate-700 px-2 py-1">GSM</th>
                <th className="border border-slate-700 px-2 py-1">QTY</th>
                <th className="border border-slate-700 px-2 py-1">UNIT</th>
                <th className="border border-slate-700 px-2 py-1">REMARK</th>
              </tr>
            </thead>
            <tbody>
              {SEVEN.map((i) => (
                <tr key={i}>
                  <td className="border border-slate-700 p-1"><select value={form.requiredPaper[i].paperBoardName} onChange={(e) => patchArray("requiredPaper", i, "paperBoardName", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Paper/Board</option>{(dropdowns.paperBoardNames || []).map((item) => (<option key={item} value={item}>{item}</option>))}</select></td>
                  <td className="border border-slate-700 p-1"><select value={form.requiredPaper[i].gradeBrand} onChange={(e) => patchArray("requiredPaper", i, "gradeBrand", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Grade/Brand</option>{(dropdowns.gradeBrands || []).map((item) => (<option key={item} value={item}>{item}</option>))}</select></td>
                  <td className="border border-slate-700 p-1"><input value={form.requiredPaper[i].sizeOfPaper} onChange={(e) => patchArray("requiredPaper", i, "sizeOfPaper", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Paper Size" /></td>
                  <td className="border border-slate-700 p-1"><input value={form.requiredPaper[i].gsm} onChange={(e) => patchArray("requiredPaper", i, "gsm", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="GSM" /></td>
                  <td className="border border-slate-700 p-1"><input type="number" value={form.requiredPaper[i].qty} onChange={(e) => patchArray("requiredPaper", i, "qty", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Qty" /></td>
                  <td className="border border-slate-700 p-1"><select value={form.requiredPaper[i].unit} onChange={(e) => patchArray("requiredPaper", i, "unit", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"><option value="">Select Unit</option><option value="SHEET">SHEET</option><option value="KG">KG</option><option value="REAM">REAM</option><option value="PCS">PCS</option></select></td>
                  <td className="border border-slate-700 p-1"><input value={form.requiredPaper[i].remark} onChange={(e) => patchArray("requiredPaper", i, "remark", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Remark" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 space-y-1">
          <label className="text-xs text-slate-300">Paper Required Remark</label>
          <input value={form.paperRequiredRemark} onChange={(e) => patchTop("paperRequiredRemark", e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100" />
        </div>
      </Card>

      <Card title="BOOKED BY">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Booked By:</label>
            <input value={form.booking.bookedBy} onChange={(e) => patchObject("booking", "bookedBy", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Booked By" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Company Name:</label>
            <input value={form.booking.companyName || "PARAS OFFSET PVT LTD"} readOnly className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-2 text-xs text-slate-200" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Approved By:</label>
            <input value={form.booking.approvedBy} onChange={(e) => patchObject("booking", "approvedBy", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs" placeholder="Approved By" />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-0 z-10 rounded-xl border border-slate-700/70 bg-slate-950/95 p-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={() => submitAsNew(false)} disabled={saving} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60">Save as New Job Card</button>
          <button type="button" onClick={() => submitAsNew(true)} disabled={saving} className="rounded-md bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-60">Save & New</button>
          <button type="button" onClick={submitUpdate} disabled={saving || !isEdit} className="rounded-md bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50">Update Loaded Job Card</button>
          <button type="button" onClick={handleClearLoad} className="rounded-md border border-slate-600 px-3 py-2 text-xs text-slate-100 hover:border-slate-400">Clear Form</button>
          <button type="button" onClick={() => router.push("/dashboard/jobcards")} className="rounded-md border border-slate-600 px-3 py-2 text-xs text-slate-100 hover:border-slate-400">Close</button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Save as New: creates new card with new number. Update: updates the loaded old job card.</p>
      </div>
    </div>
  );
}
