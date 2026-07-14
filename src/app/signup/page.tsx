"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";
import AuthShell from "../../components/auth/AuthShell";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov)$/;
const PHONE_REGEX = /^03[0-9]{9}$/;

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    userPass: "",
    confirmPass: "",
    userRole: "technician",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { userName, userEmail, userPhone, userPass, confirmPass } = formData;
    if (!userName.trim() || userName.trim().length < 3) {
      Swal.fire({
        icon: "error",
        title: "Full name must be at least 3 characters",
        showConfirmButton: false,
        timer: 1800,
      });
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(userName)) {
      Swal.fire({
        icon: "error",
        title: "Full name can only contain letters",
        showConfirmButton: false,
        timer: 1800,
      });
      return false;
    }
    if (!EMAIL_REGEX.test(userEmail)) {
      Swal.fire({
        icon: "error",
        title: "Invalid email",
        text: "Must look like name@example.com",
        showConfirmButton: false,
        timer: 1800,
      });
      return false;
    }
    if (!PHONE_REGEX.test(userPhone)) {
      Swal.fire({
        icon: "error",
        title: "Invalid phone number",
        text: "Format: 03001234567",
        showConfirmButton: false,
        timer: 1800,
      });
      return false;
    }
    if (userPass.length < 8 || userPass.length > 20) {
      Swal.fire({
        icon: "error",
        title: "Password must be 8–20 characters",
        showConfirmButton: false,
        timer: 1800,
      });
      return false;
    }
    if (userPass !== confirmPass) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match",
        showConfirmButton: false,
        timer: 1800,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/add-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: formData.userName,
            userEmail: formData.userEmail,
            userPhone: formData.userPhone,
            userPass: formData.userPass,
            userRole: formData.userRole,
          }),
        },
      );
      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Account created successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        setTimeout(() => router.push("/login"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
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

  return (
    <AuthShell
      title="Create Your Account. Join The Team."
      subtitle="Register as staff to manage assets, triage issues, and keep equipment running."
      features={[
        "Role-based dashboards",
        "Secure authentication",
        "Fast, focused workflows",
      ]}
    >
      <h2 className="form-title">Create Account</h2>
      <p className="form-subtitle">Staff registration</p>

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        <div className="input-group">
          <label>Full Name</label>
          <div className="input-field">
            <FaUser className="field-icon" />
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div className="input-group">
          <label>Email Address</label>
          <div className="input-field">
            <FaEnvelope className="field-icon" />
            <input
              type="text"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="input-group">
          <label>Phone Number</label>
          <div className="input-field">
            <FaPhone className="field-icon" />
            <input
              type="text"
              name="userPhone"
              value={formData.userPhone}
              onChange={handleChange}
              placeholder="03001234567"
            />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-field">
            <FaLock className="field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="userPass"
              value={formData.userPass}
              onChange={handleChange}
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
          <label>Confirm Password</label>
          <div className="input-field">
            <FaLock className="field-icon" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPass"
              value={formData.confirmPass}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>Account Type</label>
          <div className="input-field">
            <FaShieldAlt className="field-icon" />
            <select
              name="userRole"
              value={formData.userRole}
              onChange={handleChange}
            >
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="auth-links">
          Already have an account? <Link href="/login">Login</Link>
        </div>
      </form>
    </AuthShell>
  );
}
