import { calculateImpressions } from "@/lib/utils";

function toInt(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function pick(body, ...keys) {
  for (const key of keys) {
    if (body[key] !== undefined) return body[key];
  }
  return undefined;
}

function normalizeRows(rows, fallbackKeys) {
  if (Array.isArray(rows)) return rows;
  if (rows && typeof rows === "object") return Object.values(rows);

  const fallback = [];
  for (let i = 1; i <= 15; i += 1) {
    const row = {};
    let hasValue = false;
    for (const key of fallbackKeys) {
      const value = pick(rows || {}, `${key}${i}`);
      if (value !== undefined && value !== "") {
        row[key] = value;
        hasValue = true;
      }
    }
    if (hasValue) fallback.push(row);
  }
  return fallback;
}

export function mapJobCardBase(body) {
  const data = {
    jobCardNo: pick(body, "jobCardNo"),
    jobType: pick(body, "jobType"),
    date: pick(body, "date") ? new Date(pick(body, "date")) : null,
    poNo: pick(body, "poNo"),
    oldJobNo: pick(body, "oldJobNo"),
    paperBy: pick(body, "paperBy"),
    deliveryDate: pick(body, "deliveryDate")
      ? new Date(pick(body, "deliveryDate"))
      : null,
    clientName: pick(body, "clientName"),
    category: pick(body, "category"),
    bindingType: pick(body, "bindingType"),
    jobSpec: pick(body, "jobSpec", "jobSpecification"),
    poplSample: pick(body, "poplSample"),
    clientSample: pick(body, "clientSample"),
    digitalPtg: pick(body, "digitalPtg"),
    ferrow: pick(body, "ferrow"),
    pdf: pick(body, "pdf"),
    oldSheet: pick(body, "oldSheet"),
    remark: pick(body, "remark"),
    jobOpHeader1: pick(body, "jobOpHeader1"),
    jobOpHeader2: pick(body, "jobOpHeader2"),
    jobOpHeader3: pick(body, "jobOpHeader3"),
    jobOpHeader4: pick(body, "jobOpHeader4"),
    jobOpHeader5: pick(body, "jobOpHeader5"),
    howManyDie: pick(body, "howManyDie"),
    typeOfDie: pick(body, "typeOfDie"),
    nameOfDie: pick(body, "nameOfDie"),
    dieNo: pick(body, "dieNo"),
    cartonBy: pick(body, "cartonBy"),
    labelBy: pick(body, "labelBy"),
    dispatchBy: pick(body, "dispatchBy"),
    shrink: pick(body, "shrink"),
    typeOfPacking: pick(body, "typeOfPacking"),
    requiredCtnPatti: pick(body, "requiredCtnPatti"),
    packingRemark: pick(body, "packingRemark"),
    paperRequiredRemark: pick(body, "paperRequiredRemark"),
    bookedBy: pick(body, "bookedBy"),
    companyName: pick(body, "companyName"),
    approvedBy: pick(body, "approvedBy"),
    createdBy: pick(body, "createdBy"),
    pdfUrl: pick(body, "pdfUrl"),
  };

  for (let i = 1; i <= 5; i += 1) {
    data[`jobName${i}`] = pick(body, `jobName${i}`, `NAME OF JOB ${i}`);
    data[`qty${i}`] = toInt(pick(body, `qty${i}`, `QTY ${i}`));
    data[`itemCode${i}`] = pick(body, `itemCode${i}`, `ITEM CODE ${i}`);
    data[`finishingSize${i}`] = pick(
      body,
      `finishingSize${i}`,
      `FINISHING SIZE ${i}`
    );
    data[`imageUrl${i}`] = pick(body, `imageUrl${i}`);

    data[`paperSize${i}`] = pick(body, `paperSize${i}`, `Paper Size ${i}`);
    data[`gsm${i}`] = pick(body, `gsm${i}`, `Gsm / mm ${i}`);
    data[`paperType${i}`] = pick(
      body,
      `paperType${i}`,
      `Type of Paper/Board ${i}`
    );
    data[`paperMill${i}`] = pick(body, `paperMill${i}`, `Paper Mill name ${i}`);
    data[`cuttingSize${i}`] = pick(body, `cuttingSize${i}`, `CUTTING SIZE ${i}`);
    data[`actualSheet${i}`] = toInt(pick(body, `actualSheet${i}`, `ACTUAL SHEET ${i}`));
    data[`wastageSheet${i}`] = toInt(
      pick(body, `wastageSheet${i}`, `WASTAGE SHEET ${i}`)
    );
    data[`forWhatPaper${i}`] = pick(body, `forWhatPaper${i}`, `For What ${i}`);
    data[`jobNamePaper${i}`] = pick(body, `jobNamePaper${i}`, `Job Name ${i}`);

    data[`machineName${i}`] = pick(body, `machineName${i}`);
    data[`noOfPlate${i}`] = toInt(pick(body, `noOfPlate${i}`));
    data[`noOfForms${i}`] = toInt(pick(body, `noOfForms${i}`));
    data[`printing${i}`] = pick(body, `printing${i}`);
    data[`plateType${i}`] = pick(body, `plateType${i}`);
    data[`forWhatMachine${i}`] = pick(body, `forWhatMachine${i}`);
    data[`totalSheets${i}`] = toInt(pick(body, `totalSheets${i}`));
    data[`printingSide${i}`] = pick(body, `printingSide${i}`);
    data[`impressions${i}`] = calculateImpressions(
      data[`totalSheets${i}`],
      data[`printingSide${i}`]
    );
  }

  return data;
}

export function mapJobOperations(body) {
  const source = normalizeRows(body.jobOperations, ["qty", "machine"]);
  return source
    .map((row, rowIndex) => {
      const columns = Array.isArray(row?.columns) ? row.columns : [];
      if (columns.length > 0) {
        return columns.map((col, colIndex) => ({
          rowNo: row.row ?? rowIndex + 1,
          colNo: colIndex + 1,
          headerNo: col.headerNo ?? colIndex + 1,
          qty: toInt(col.qty),
          machine: col.machine || null,
        }));
      }

      return [{
        rowNo: row.rowNo ?? rowIndex + 1,
        colNo: row.colNo ?? 1,
        headerNo: row.headerNo ?? 1,
        qty: toInt(row.qty),
        machine: row.machine || null,
      }];
    })
    .flat();
}

export function mapRequiredItems(body) {
  const source = normalizeRows(body.requiredItems, [
    "itemName",
    "size",
    "qty",
    "name",
    "remark",
  ]);

  return source.map((row, rowIndex) => ({
    rowNo: row.rowNo ?? rowIndex + 1,
    itemName: row.itemName || null,
    size: row.size || null,
    qty: toInt(row.qty),
    name: row.name || null,
    remark: row.remark || null,
  }));
}

export function mapRequiredPaper(body) {
  const source = normalizeRows(body.requiredPaper, [
    "paperBoardName",
    "gradeBrand",
    "sizeOfPaper",
    "gsm",
    "qty",
    "unit",
    "remark",
  ]);

  return source.map((row, rowIndex) => ({
    rowNo: row.rowNo ?? rowIndex + 1,
    paperBoardName: row.paperBoardName || null,
    gradeBrand: row.gradeBrand || null,
    sizeOfPaper: row.sizeOfPaper || null,
    gsm: row.gsm || null,
    qty: toInt(row.qty),
    unit: row.unit || null,
    remark: row.remark || null,
  }));
}
