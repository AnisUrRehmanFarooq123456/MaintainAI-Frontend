"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import { FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import AuthShell from "../../../components/auth/AuthShell";
import "./reset.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      Swal.fire({
        icon: "error",
        title: "Enter the 6-digit OTP",
        showConfirmButton: false,
        timer: 1600,
      });
      return;
    }
    if (newPassword.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Password too short",
        text: "Minimum 8 characters",
        showConfirmButton: false,
        timer: 1600,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match",
        showConfirmButton: false,
        timer: 1600,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Password reset successfully",
          showConfirmButton: false,
          timer: 1600,
        });
        setTimeout(() => router.push("/login"), 1600);
      } else {
        Swal.fire({
          icon: "error",
          title: "Reset Failed",
          text: data.message || "Invalid or expired OTP",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Unable to connect with server",
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure you want to cancel?",
      text: "You'll be taken back to the login page and will need to request a new code later.",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "Stay here",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      router.push("/login");
    }
  };

  return (
    <AuthShell
      title="Enter Your Reset Code"
      subtitle={`We sent a 6-digit code to ${email || "your email"}. Enter it below with your new password.`}
      features={[
        "Code expires in 10 minutes",
        "One-time use only",
        "Choose a strong new password",
      ]}
    >
      <h2 className="form-title">Set New Password</h2>
      <p className="form-subtitle">{email}</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <label>6-Digit OTP</label>
          <div className="input-field">
            <FaKey className="field-icon" />
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
            />
          </div>
        </div>

        <div className="input-group">
          <label>New Password</label>
          <div className="input-field">
            <FaLock className="field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>Confirm New Password</label>
          <div className="input-field">
            <FaLock className="field-icon" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>
        </div>

        <div className="auth-actions">
          <button
            type="button"
            onClick={goBack}
            disabled={loading}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
