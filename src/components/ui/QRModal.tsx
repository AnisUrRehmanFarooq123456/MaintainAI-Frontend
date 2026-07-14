"use client";

import "./QRModal.css";

type Props = {
  qrCodeUrl?: string;
  publicUrl?: string;
  assetName: string;
  onClose: () => void;
};

export default function QRModal({
  qrCodeUrl,
  publicUrl,
  assetName,
  onClose,
}: Props) {
  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${assetName}-qr.png`;
    link.click();
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <button className="qr-modal-close" onClick={onClose}>
          ×
        </button>
        <h3 className="qr-modal-title">{assetName}</h3>
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="Asset QR Code" className="qr-modal-image" />
        ) : (
          <p>No QR code available</p>
        )}
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="qr-modal-link"
          >
            {publicUrl}
          </a>
        )}
        <div className="qr-modal-actions">
          <button className="qr-modal-btn" onClick={handleDownload}>
            Download
          </button>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="qr-modal-btn qr-modal-btn-outline"
            >
              Open Public Page
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
