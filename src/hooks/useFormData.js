import { useCallback, useMemo, useState } from "react";
import { calculateImpressions } from "@/lib/utils";

export function useFormData(initialData = {}) {
  const [formData, setFormData] = useState(() => ({
    jobCardNo: initialData.jobCardNo || "",
    jobType: initialData.jobType || "",
    date: initialData.date ? String(initialData.date).slice(0, 10) : "",
    clientName: initialData.clientName || "",
    category: initialData.category || "",
    remark: initialData.remark || "",
    totalSheets1: initialData.totalSheets1 ?? "",
    printingSide1: initialData.printingSide1 || "SINGLE",
  }));

  const updateField = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const patchData = useCallback((next) => {
    setFormData((prev) => ({ ...prev, ...next }));
  }, []);

  const payload = useMemo(() => {
    const output = {
      ...formData,
      date: formData.date ? new Date(formData.date).toISOString() : null,
    };

    for (let i = 1; i <= 5; i += 1) {
      output[`impressions${i}`] = calculateImpressions(
        output[`totalSheets${i}`],
        output[`printingSide${i}`]
      );
    }

    return output;
  }, [formData]);

  return {
    formData,
    updateField,
    patchData,
    payload,
    setFormData,
  };
}
