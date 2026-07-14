"use client";

import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { FaCamera, FaTimes } from "react-icons/fa";
import "./EvidenceUploader.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Props = {
  evidence: string[];
  onChange: (urls: string[]) => void;
};

export default function EvidenceUploader({ evidence, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (evidence.length + files.length > 5) {
      Swal.fire({
        icon: "error",
        title: "Maximum 5 photos allowed",
        showConfirmButton: false,
        timer: 1600,
      });
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    setUploading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/upload/evidence`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onChange([...evidence, ...data.data]);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message || "Please try again",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    onChange(evidence.filter((_, i) => i !== index));
  };

  return (
    <div className="evidence-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4"
        multiple
        onChange={handleFileSelect}
        className="evidence-file-input"
        id="evidence-upload-input"
      />
      <label htmlFor="evidence-upload-input" className="evidence-upload-label">
        <FaCamera /> {uploading ? "Uploading..." : "Add Photos"}
      </label>

      {evidence.length > 0 && (
        <div className="evidence-preview-grid">
          {evidence.map((url, i) => (
            <div className="evidence-preview-item" key={i}>
              <img src={url} alt={`Evidence ${i + 1}`} />
              <button
                type="button"
                className="evidence-remove-btn"
                onClick={() => handleRemove(i)}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
