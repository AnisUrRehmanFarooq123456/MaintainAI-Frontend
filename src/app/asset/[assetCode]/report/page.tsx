"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../utils/api";
import AITriageReview from "../../../../components/issues/AITriageReview";
import "./report-issue.css";
import EvidenceUploader from "../../../../components/ui/EvidenceUploader";

type AISuggestion = {
  title: string;
  category: string;
  priority: string;
  possibleCauses: string[];
  initialChecks: string[];
};

const EMPTY_SUGGESTION: AISuggestion = {
  title: "",
  category: "",
  priority: "Medium",
  possibleCauses: [],
  initialChecks: [],
};

export default function ReportIssuePage() {
  const params = useParams();
  const router = useRouter();
  const assetCode = params.assetCode as string;

  const [evidence, setEvidence] = useState<string[]>([]);
  const [complaint, setComplaint] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [triageLoading, setTriageLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [originalSuggestion, setOriginalSuggestion] =
    useState<AISuggestion | null>(null);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Goes back two entries in the browser history (used by Cancel and
  // after a successful submit) instead of pushing a hardcoded path.
  const goBackTwice = () => {
    if (typeof window !== "undefined") {
      window.history.go(-2);
    }
  };

  const handleGetSuggestion = async () => {
    if (complaint.trim().length < 5) {
      Swal.fire({
        icon: "error",
        title: "Describe the problem first",
        text: "Minimum 5 characters",
        showConfirmButton: false,
        timer: 1600,
      });
      return;
    }

    setTriageLoading(true);
    try {
      const res = await apiFetch("/api/triage/generate", {
        method: "POST",
        auth: false,
        body: { complaint },
      });

      // Helpful while debugging — check the browser console / network tab
      // to confirm what the backend actually returned.
      console.log("[triage] response:", res);

      if (!res || res.status === false) {
        throw new Error(res?.message || "Triage request failed");
      }

      // Guard against a malformed / partial shape from the API so the
      // review form never crashes on missing fields.
      const data =
        res.data && typeof res.data === "object"
          ? { ...EMPTY_SUGGESTION, ...res.data }
          : EMPTY_SUGGESTION;

      setSuggestion(data);
      setOriginalSuggestion(data);
      setAiAvailable(res.aiAvailable !== false);

      if (res.aiAvailable === false) {
        Swal.fire({
          icon: "info",
          title: "AI unavailable",
          text: "Please fill in the details manually",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (err: any) {
      console.error("[triage] error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to get AI suggestion",
        text: err?.message || "Something went wrong. Please try again.",
      });

      // Don't leave the user stuck with no form — fall back to a blank,
      // manually-editable suggestion so they can still submit the issue.
      setSuggestion(EMPTY_SUGGESTION);
      setOriginalSuggestion(EMPTY_SUGGESTION);
      setAiAvailable(false);
    } finally {
      setTriageLoading(false);
    }
  };

  const handleFieldChange = (field: keyof AISuggestion, value: string) => {
    if (!suggestion) return;
    setSuggestion({ ...suggestion, [field]: value });
  };

  const wasEdited = () => {
    if (!suggestion || !originalSuggestion) return false;
    return (
      suggestion.title !== originalSuggestion.title ||
      suggestion.category !== originalSuggestion.category ||
      suggestion.priority !== originalSuggestion.priority
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion) {
      Swal.fire({
        icon: "error",
        title: "Get an AI suggestion first (or fill it manually)",
        showConfirmButton: false,
        timer: 1800,
      });
      return;
    }
    if (!suggestion.title.trim()) {
      Swal.fire({
        icon: "error",
        title: "Title is required",
        showConfirmButton: false,
        timer: 1600,
      });
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/issue/report-issue", {
        method: "POST",
        auth: false,
        body: {
          assetCode,
          title: suggestion.title,
          description: complaint,
          category: suggestion.category,
          priority: suggestion.priority,
          reporterName: reporterName || undefined,
          reporterContact: reporterContact || undefined,
          evidence,
          aiSuggestion: aiAvailable ? originalSuggestion : undefined,
          aiSuggested: aiAvailable,
          aiEdited: wasEdited(),
        },
      });
      Swal.fire({
        icon: "success",
        title: "Issue reported successfully",
        text: "Thank you — the team has been notified",
        showConfirmButton: false,
        timer: 2200,
      });
      setTimeout(() => goBackTwice(), 2200);
    } catch (err: any) {
      console.error("[report-issue] submit error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to submit",
        text: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="report-issue-page">
      <div className="report-issue-card">
        <h1 className="report-issue-title">Report an Issue</h1>
        <p className="report-issue-subtitle">Asset: {assetCode}</p>

        <div className="report-issue-field">
          <label>Describe the problem</label>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="e.g. The projector display is flickering and sometimes does not detect HDMI"
            rows={4}
          />
          <button
            type="button"
            className="report-issue-ai-btn"
            onClick={handleGetSuggestion}
            disabled={triageLoading}
          >
            {triageLoading ? "Analyzing..." : "Get AI Suggestion"}
          </button>
        </div>

        {suggestion && (
          <AITriageReview
            suggestion={suggestion}
            onChange={handleFieldChange}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="report-issue-row">
            <div className="report-issue-field">
              <label>Your Name (optional)</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Ahmed Ali"
              />
            </div>
            <div className="report-issue-field">
              <label>Contact (optional)</label>
              <input
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="Phone or email"
              />
            </div>
          </div>
          <div className="report-issue-field">
            <label>Evidence (optional)</label>
            <EvidenceUploader evidence={evidence} onChange={setEvidence} />
          </div>
          <div className="report-issue-actions">
            <button
              type="button"
              className="report-issue-cancel-btn"
              onClick={goBackTwice}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !suggestion}
              className="report-issue-submit-btn"
            >
              {submitting ? "Submitting..." : "Submit Issue"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
