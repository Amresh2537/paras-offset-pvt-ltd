import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import JobCard from "@/models/JobCard";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN");
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function renderInfoGrid(title, rows) {
  const validRows = rows.filter((row) => hasValue(row.value));
  if (validRows.length === 0) return "";

  return `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      <table>
        <tbody>
          ${validRows
            .map(
              (row) => `
                <tr>
                  <th class="key">${escapeHtml(row.label)}</th>
                  <td>${escapeHtml(row.value)}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderTable(title, headers, rows) {
  if (!rows || rows.length === 0) return "";

  return `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr>${row
                  .map((cell) => `<td>${escapeHtml(cell)}</td>`)
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const jobCard = await JobCard.findById(id).lean();

    if (!jobCard) {
      return NextResponse.json({ message: "Job card not found" }, { status: 404 });
    }

    const jobDetailsRows = (jobCard.jobDetails || [])
      .filter((item) =>
        hasValue(item?.jobName) ||
        hasValue(item?.qty) ||
        hasValue(item?.itemCode) ||
        hasValue(item?.finishingSize) ||
        hasValue(item?.imageUrl)
      )
      .map((item, index) => [
        index + 1,
        item.jobName || "",
        item.qty ?? "",
        item.itemCode || "",
        item.finishingSize || "",
        item.imageUrl || "",
      ]);

    const paperCuttingRows = (jobCard.paperCutting || [])
      .filter((item) =>
        hasValue(item?.paperSize) ||
        hasValue(item?.gsm) ||
        hasValue(item?.paperType) ||
        hasValue(item?.paperMill) ||
        hasValue(item?.cuttingSize) ||
        hasValue(item?.actualSheet) ||
        hasValue(item?.wastageSheet) ||
        hasValue(item?.forWhat) ||
        hasValue(item?.jobName)
      )
      .map((item, index) => [
        index + 1,
        item.paperSize || "",
        item.gsm || "",
        item.paperType || "",
        item.paperMill || "",
        item.cuttingSize || "",
        item.actualSheet ?? "",
        item.wastageSheet ?? "",
        item.forWhat || "",
        item.jobName || "",
      ]);

    const printingRows = (jobCard.printingMachines || [])
      .filter((item) =>
        hasValue(item?.machineName) ||
        hasValue(item?.noOfPlate) ||
        hasValue(item?.noOfForms) ||
        hasValue(item?.printing) ||
        hasValue(item?.plateType) ||
        hasValue(item?.forWhat) ||
        hasValue(item?.totalSheets) ||
        hasValue(item?.printingSide) ||
        hasValue(item?.impressions)
      )
      .map((item, index) => [
        index + 1,
        item.machineName || "",
        item.noOfPlate ?? "",
        item.noOfForms ?? "",
        item.printing || "",
        item.plateType || "",
        item.forWhat || "",
        item.totalSheets ?? "",
        item.printingSide || "",
        item.impressions ?? "",
      ]);

    const jobOpsRows = (jobCard.jobOperations || [])
      .filter((row) => (row?.columns || []).some((col) => hasValue(col?.qty) || hasValue(col?.machine)))
      .map((row, index) => {
        const columns = row?.columns || [];
        return [
          row?.row || index + 1,
          `${columns[0]?.qty ?? ""}${hasValue(columns[0]?.machine) ? ` | ${columns[0].machine}` : ""}`,
          `${columns[1]?.qty ?? ""}${hasValue(columns[1]?.machine) ? ` | ${columns[1].machine}` : ""}`,
          `${columns[2]?.qty ?? ""}${hasValue(columns[2]?.machine) ? ` | ${columns[2].machine}` : ""}`,
          `${columns[3]?.qty ?? ""}${hasValue(columns[3]?.machine) ? ` | ${columns[3].machine}` : ""}`,
          `${columns[4]?.qty ?? ""}${hasValue(columns[4]?.machine) ? ` | ${columns[4].machine}` : ""}`,
        ];
      });

    const reqItemsRows = (jobCard.requiredItems || [])
      .filter((item) =>
        hasValue(item?.itemName) ||
        hasValue(item?.size) ||
        hasValue(item?.qty) ||
        hasValue(item?.name) ||
        hasValue(item?.remark)
      )
      .map((item, index) => [
        index + 1,
        item.itemName || "",
        item.size || "",
        item.qty ?? "",
        item.name || "",
        item.remark || "",
      ]);

    const reqPaperRows = (jobCard.requiredPaper || [])
      .filter((item) =>
        hasValue(item?.paperBoardName) ||
        hasValue(item?.gradeBrand) ||
        hasValue(item?.sizeOfPaper) ||
        hasValue(item?.gsm) ||
        hasValue(item?.qty) ||
        hasValue(item?.unit) ||
        hasValue(item?.remark)
      )
      .map((item, index) => [
        index + 1,
        item.paperBoardName || "",
        item.gradeBrand || "",
        item.sizeOfPaper || "",
        item.gsm || "",
        item.qty ?? "",
        item.unit || "",
        item.remark || "",
      ]);

    const jobOpHeaders = [
      jobCard.jobOperationHeaders?.[0] || "COL 1",
      jobCard.jobOperationHeaders?.[1] || "COL 2",
      jobCard.jobOperationHeaders?.[2] || "COL 3",
      jobCard.jobOperationHeaders?.[3] || "COL 4",
      jobCard.jobOperationHeaders?.[4] || "COL 5",
    ];

    const sections = [
      renderInfoGrid("JOB CARD BASIC INFORMATION", [
        { label: "Job Card No", value: jobCard.jobCardNo || "" },
        { label: "Job Type", value: jobCard.jobType || "" },
        { label: "Date", value: formatDate(jobCard.date) },
        { label: "PO No", value: jobCard.poNo || "" },
        { label: "Old Job No", value: jobCard.oldJobNo || "" },
        { label: "Paper By", value: jobCard.paperBy || "" },
        { label: "Delivery Date", value: formatDate(jobCard.deliveryDate) },
      ]),
      renderInfoGrid("CLIENT INFORMATION", [
        { label: "Name of Client", value: jobCard.clientName || "" },
        { label: "Category", value: jobCard.category || "" },
        { label: "Type of Binding", value: jobCard.bindingType || "" },
      ]),
      renderInfoGrid("JOB SPECIFICATION", [
        { label: "Job Specification Description", value: jobCard.jobSpecification || "" },
        { label: "POPL Sample", value: jobCard.samples?.poplSample || "" },
        { label: "Client Sample", value: jobCard.samples?.clientSample || "" },
        { label: "Digital PTG", value: jobCard.samples?.digitalPtg || "" },
        { label: "Ferrow", value: jobCard.samples?.ferrow || "" },
        { label: "PDF", value: jobCard.samples?.pdf || "" },
        { label: "Old Sheet", value: jobCard.samples?.oldSheet || "" },
      ]),
      renderTable(
        "JOB DETAILS",
        ["S No", "Job Name", "Qty", "Item Code", "Finishing Size", "Image URL"],
        jobDetailsRows
      ),
      renderTable(
        "PAPER & CUTTING",
        [
          "S No",
          "Paper Size",
          "GSM",
          "Type of Paper/Board",
          "Paper Mill",
          "Cutting Size",
          "Actual Sheet",
          "Wastage Sheet",
          "For What",
          "Job Name",
        ],
        paperCuttingRows
      ),
      renderTable(
        "PRINTING MACHINE, PLATE & PRINTING",
        [
          "S No",
          "Machine",
          "No of Plate",
          "No of Forms",
          "Printing",
          "Plate Type",
          "For What",
          "Total Sheets",
          "Printing Side",
          "Impressions",
        ],
        printingRows
      ),
      renderInfoGrid("REMARK", [{ label: "Remark", value: jobCard.remark || "" }]),
      renderTable("JOB OPERATION (Qty | Operation)", ["S No", ...jobOpHeaders], jobOpsRows),
      renderInfoGrid("DIE INFORMATION", [
        { label: "HOW MANY DIE", value: jobCard.dieInfo?.howManyDie || "" },
        { label: "Type of die", value: jobCard.dieInfo?.typeOfDie || "" },
        { label: "Name of die", value: jobCard.dieInfo?.nameOfDie || "" },
        { label: "Die no", value: jobCard.dieInfo?.dieNo || "" },
      ]),
      renderInfoGrid("PACKING / LABELING / DISPATCH", [
        { label: "Carton by", value: jobCard.packing?.cartonBy || "" },
        { label: "Label by", value: jobCard.packing?.labelBy || "" },
        { label: "Dispatch by", value: jobCard.packing?.dispatchBy || "" },
        { label: "Shrink", value: jobCard.packing?.shrink || "" },
        { label: "Type of Packing", value: jobCard.packing?.typeOfPacking || "" },
        { label: "Required Ctn. Patti", value: jobCard.packing?.requiredCtnPatti || "" },
        { label: "Packing Remark", value: jobCard.packing?.packingRemark || "" },
      ]),
      renderTable(
        "REQUIRED ITEM FOR JOB",
        ["S No", "Name of Item", "Size of Item", "Qty", "Name", "Remark"],
        reqItemsRows
      ),
      renderTable(
        "REQUIRED PAPER & BOARD FOR JOB",
        [
          "S No",
          "Paper/Board Name",
          "Grade/Brand",
          "Size of Paper",
          "GSM",
          "Qty",
          "Unit",
          "Remark",
        ],
        reqPaperRows
      ),
      renderInfoGrid("BOOKED BY", [
        { label: "Booked By", value: jobCard.booking?.bookedBy || "" },
        { label: "Company Name", value: jobCard.booking?.companyName || "" },
        { label: "Approved By", value: jobCard.booking?.approvedBy || "" },
      ]),
      renderInfoGrid("PAPER REQUIRED REMARK", [
        { label: "Paper Required Remark", value: jobCard.paperRequiredRemark || "" },
      ]),
    ].filter(Boolean);

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Job Card ${jobCard.jobCardNo || ""}</title>
  <style>
    :root { color-scheme: light only; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 16px; color: #0f172a; }
    h1 { margin: 0; font-size: 20px; }
    h2 { margin: 0 0 8px; font-size: 13px; color: #0f172a; letter-spacing: 0.02em; }
    .header { border: 1px solid #cbd5e1; background: #f8fafc; padding: 10px 12px; margin-bottom: 12px; }
    .header-row { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    .sub { font-size: 11px; color: #475569; margin-top: 4px; }
    .section { margin-bottom: 10px; page-break-inside: avoid; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: left; vertical-align: top; }
    th { background: #e2e8f0; font-weight: 700; }
    .key { width: 240px; background: #f1f5f9; }
    @media print {
      body { margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-row">
      <h1>JOB CARD ${escapeHtml(jobCard.jobCardNo || "")}</h1>
      <div style="text-align:right; font-size:11px;">
        <div><strong>Date:</strong> ${escapeHtml(formatDate(jobCard.date))}</div>
        <div><strong>Client:</strong> ${escapeHtml(jobCard.clientName || "")}</div>
      </div>
    </div>
    <div class="sub">Generated from saved job card data. All filled information is included below.</div>
  </div>
  ${sections.join("\n")}
  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
      }, 120);
    };
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("[pdf][id][GET]", err);
    return NextResponse.json({ message: "Failed to generate PDF" }, { status: 500 });
  }
}
