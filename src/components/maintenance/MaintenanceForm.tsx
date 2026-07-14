"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash } from "react-icons/fa";
import { apiFetch } from "../../utils/api";
import "./MaintenanceForm.css";
import EvidenceUploader from "../ui/EvidenceUploader";

type Part = { partName: string; quantity: number; cost: number };

export default function MaintenanceForm({ issueId }: { issueId: string }) {
  const router = useRouter();
  const [inspectionFindings, setInspectionFindings] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [timeSpentMinutes, setTimeSpentMinutes] = useState("");
  const [finalCondition, setFinalCondition] = useState("Good");
  const [nextServiceDate, setNextServiceDate] = useState("");

  const [evidence, setEvidence] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addPart = () =>
    setParts([...parts, { partName: "", quantity: 1, cost: 0 }]);
  const removePart = (index: number) =>
    setParts(parts.filter((_, i) => i !== index));
  const updatePart = (index: number, field: keyof Part, value: string) => {
    const updated = [...parts];
    updated[index] = {
      ...updated[index],
      [field]: field === "partName" ? value : Number(value),
    };
    setParts(updated);
  };

  const totalCost = parts.reduce(
    (sum, p) => sum + (p.cost || 0) * (p.quantity || 1),
    0,
  );

  const validate = () => {
    if (workPerformed.trim().length < 5) {
      Swal.fire({
        icon: "error",
        title: "Describe the work performed",
        text: "Minimum 5 characters",
        showConfirmButton: false,
        timer: 1600,
      });
      return false;
    }
    for (const p of parts) {
      if (p.cost < 0) {
        Swal.fire({
          icon: "error",
          title: "Part cost cannot be negative",
          showConfirmButton: false,
          timer: 1600,
        });
        return false;
      }
      if (!p.partName.trim()) {
        Swal.fire({
          icon: "error",
          title: "Every part needs a name",
          showConfirmButton: false,
          timer: 1600,
        });
        return false;
      }
    }
    if (
      nextServiceDate &&
      new Date(nextServiceDate) < new Date(new Date().toDateString())
    ) {
      Swal.fire({
        icon: "error",
        title: "Next service date cannot be in the past",
        showConfirmButton: false,
        timer: 1600,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await apiFetch("/api/maintenance/add", {
        method: "POST",
        body: {
          issueId,
          inspectionFindings,
          workPerformed,
          partsUsed: parts,
          timeSpentMinutes: timeSpentMinutes
            ? Number(timeSpentMinutes)
            : undefined,
          evidence,
          finalCondition,
          nextServiceDate: nextServiceDate || undefined,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Issue resolved successfully",
        showConfirmButton: false,
        timer: 1600,
      });
      setTimeout(() => router.push("/technician"), 1600);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to resolve issue",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="maint-form">
      <h3 className="maint-form-title">Resolve Issue — Maintenance Record</h3>

      <div className="maint-field">
        <label>Inspection Findings</label>
        <textarea
          value={inspectionFindings}
          onChange={(e) => setInspectionFindings(e.target.value)}
          placeholder="What did you find during inspection?"
          rows={3}
        />
      </div>

      <div className="maint-field">
        <label>Work Performed *</label>
        <textarea
          value={workPerformed}
          onChange={(e) => setWorkPerformed(e.target.value)}
          placeholder="Describe the repair/maintenance work done"
          rows={3}
        />
      </div>

      <div className="maint-field">
        <label>Parts Used</label>
        {parts.map((part, i) => (
          <div className="maint-part-row" key={i}>
            <input
              type="text"
              placeholder="Part name"
              value={part.partName}
              onChange={(e) => updatePart(i, "partName", e.target.value)}
            />
            <input
              type="number"
              placeholder="Qty"
              min={1}
              value={part.quantity}
              onChange={(e) => updatePart(i, "quantity", e.target.value)}
            />
            <input
              type="number"
              placeholder="Cost"
              min={0}
              value={part.cost}
              onChange={(e) => updatePart(i, "cost", e.target.value)}
            />
            <button
              type="button"
              className="maint-remove-btn"
              onClick={() => removePart(i)}
            >
              <FaTrash />
            </button>
          </div>
        ))}
        <button type="button" className="maint-add-part-btn" onClick={addPart}>
          <FaPlus /> Add Part
        </button>
        {parts.length > 0 && (
          <p className="maint-total-cost">Total Cost: Rs. {totalCost}</p>
        )}
      </div>

      <div className="maint-row">
        <div className="maint-field">
          <label>Time Spent (minutes)</label>
          <input
            type="number"
            min={0}
            value={timeSpentMinutes}
            onChange={(e) => setTimeSpentMinutes(e.target.value)}
            placeholder="e.g. 45"
          />
        </div>
        <div className="maint-field">
          <label>Final Asset Condition</label>
          <select
            value={finalCondition}
            onChange={(e) => setFinalCondition(e.target.value)}
          >
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Unsafe">Unsafe</option>
          </select>
        </div>
      </div>

      <div className="maint-field">
        <label>Next Service Date (optional)</label>
        <input
          type="date"
          value={nextServiceDate}
          onChange={(e) => setNextServiceDate(e.target.value)}
        />
      </div>

      <div className="maint-field">
        <label>Evidence (optional)</label>
        <EvidenceUploader evidence={evidence} onChange={setEvidence} />
      </div>

      <button type="submit" disabled={loading} className="maint-submit-btn">
        {loading ? "Resolving..." : "Resolve Issue"}
      </button>
    </form>
  );
}
