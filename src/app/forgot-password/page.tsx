"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FaEnvelope } from "react-icons/fa";
import AuthShell from "../../components/auth/AuthShell";
import "./forgot-password.css";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov)$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Enter a valid email address",
        showConfirmButton: false,
        timer: 1600,
      });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/request-password-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "OTP sent",
          text: "Check your email inbox",
          showConfirmButton: false,
          timer: 1800,
        });
        setTimeout(
          () =>
            router.push(
              `/forgot-password/reset?email=${encodeURIComponent(email)}`,
            ),
          1800,
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Request Failed",
          text: data.message || "Please try again",
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
      text: "You'll be taken back to the login page.",
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
      title="Forgot Your Password?"
      subtitle="No worries — we'll email you a one-time code to reset it."
      features={[
        "One-time code via email",
        "Expires in 10 minutes",
        "Secure password reset",
      ]}
    >
      <h2 className="form-title">Reset Password</h2>
      <p className="form-subtitle">Enter your account email</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <label>Email Address</label>
          <div className="input-field">
            <FaEnvelope className="field-icon" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
            Back
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
