"use client";

import "./AITriageReview.css";

type AISuggestion = {
  title: string;
  category: string;
  priority: string;
  possibleCauses: string[];
  initialChecks: string[];
};

type Props = {
  suggestion: AISuggestion;
  onChange: (field: keyof AISuggestion, value: string) => void;
};

export default function AITriageReview({ suggestion, onChange }: Props) {
  return (
    <div className="ai-review-card">
      <div className="ai-review-header">
        <span className="ai-review-tag">
          AI Suggested — Review Before Submitting
        </span>
      </div>

      <div className="ai-review-field">
        <label>Title</label>
        <input
          type="text"
          value={suggestion.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </div>

      <div className="ai-review-row">
        <div className="ai-review-field">
          <label>Category</label>
          <input
            type="text"
            value={suggestion.category}
            onChange={(e) => onChange("category", e.target.value)}
          />
        </div>
        <div className="ai-review-field">
          <label>Priority</label>
          <select
            value={suggestion.priority}
            onChange={(e) => onChange("priority", e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {suggestion.possibleCauses?.length > 0 && (
        <div className="ai-review-list-block">
          <p className="ai-review-list-label">Possible Causes</p>
          <ul>
            {suggestion.possibleCauses.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestion.initialChecks?.length > 0 && (
        <div className="ai-review-list-block">
          <p className="ai-review-list-label">Initial Checks</p>
          <ul>
            {suggestion.initialChecks.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
