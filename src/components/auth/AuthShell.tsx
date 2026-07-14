"use client";

import Link from "next/link";
import { FaRocket, FaCheckCircle } from "react-icons/fa";
import "./AuthShell.css";

type Props = {
  title: string;
  subtitle: string;
  features: string[];
  children: React.ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  features,
  children,
}: Props) {
  return (
    <main className="auth-page">
      <div className="auth-container">
        <section className="auth-left">
          <div className="auth-circle circle-one"></div>
          <div className="auth-circle circle-two"></div>
          <div className="auth-circle circle-three"></div>

          <div className="auth-left-content">
            <Link href="/" className="auth-brand">
              <FaRocket />
              <span>MaintainIQ</span>
            </Link>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <div className="auth-feature-list">
              {features.map((f, i) => (
                <div className="auth-feature-item" key={i}>
                  <FaCheckCircle />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="auth-right">
          <div className="auth-form-card">{children}</div>
        </section>
      </div>
    </main>
  );
}
