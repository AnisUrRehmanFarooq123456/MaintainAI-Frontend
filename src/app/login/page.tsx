"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserShield,
} from "react-icons/fa";
import AuthShell from "../../components/auth/AuthShell";
import { saveUser } from "../../utils/auth";
import { roleHomeRoute } from "../../utils/routes";
import { normalizeRole } from "../../utils/routes";
import ("./login.css")

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov)$/;

type DecodedToken = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "technician" | "supervisor" | "reporter";
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userEmail: "",
    userPass: "",
    userRole: "admin",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.userEmail.trim()) {
      Swal.fire({
        icon: "error",
        title: "Email is required",
        showConfirmButton: false,
        timer: 1500,
      });
      return false;
    }
    if (!EMAIL_REGEX.test(formData.userEmail)) {
      Swal.fire({
        icon: "error",
        title: "Invalid email address",
        showConfirmButton: false,
        timer: 1500,
      });
      return false;
    }
    if (!formData.userPass) {
      Swal.fire({
        icon: "error",
        title: "Password is required",
        showConfirmButton: false,
        timer: 1500,
      });
      return false;
    }
    if (formData.userPass.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Password too short",
        text: "Minimum 8 characters",
        showConfirmButton: false,
        timer: 1500,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/getUserByEmail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.userEmail,
            password: formData.userPass,
            role: formData.userRole,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        const token = data.token;
        if (!token) {
          Swal.fire({
            icon: "error",
            title: "Login response invalid",
            confirmButtonColor: "#2563eb",
          });
          return;
        }

        const decoded = jwtDecode<DecodedToken>(token);
        console.log("DEBUG decoded role:", decoded.role);
        console.log("DEBUG roleHomeRoute lookup:", roleHomeRoute[decoded.role]);

        saveUser({
          id: decoded.id,
          fullName: decoded.fullName,
          email: decoded.email,
          role: decoded.role,
          token,
        });

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: `Welcome ${decoded.fullName}`,
          showConfirmButton: false,
          timer: 1400,
        });

        setTimeout(() => router.push(roleHomeRoute[decoded.role] || "/"), 1400);
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Invalid email or password",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Unable to connect with server",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back. Login To Continue."
      subtitle="Manage assets, triage issues, and track maintenance — all in one dashboard."
      features={[
        "Secure role-based access",
        "Real-time issue tracking",
        "Full asset history",
      ]}
    >
      <h2 className="form-title">Login</h2>
      <p className="form-subtitle">Staff access only</p>

      <form onSubmit={handleSubmit} noValidate className="auth-form">
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
          <label>Password</label>
          <div className="input-field">
            <FaLock className="field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="userPass"
              value={formData.userPass}
              onChange={handleChange}
              placeholder="Enter password"
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
          <label>Login As</label>
          <div className="input-field">
            <FaUserShield className="field-icon" />
            <select
              name="userRole"
              value={formData.userRole}
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="technician">Technician</option>
              <option value="supervisor">Supervisor</option>
              <option value="reporter">Public User</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Logging In..." : "Login"}
        </button>

        <div className="auth-links">
          <Link href="/forgot-password">Forgot Password?</Link>
        </div>
        <div className="auth-links">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </div>
      </form>
    </AuthShell>
  );
}
