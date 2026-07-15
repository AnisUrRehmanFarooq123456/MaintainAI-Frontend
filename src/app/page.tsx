"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FaClipboardList,
  FaUserGear,
  FaChartLine,
  FaShieldHalved,
  FaArrowRight,
  FaBolt,
  FaWrench,
  FaCircleCheck,
  FaScrewdriverWrench,
} from "react-icons/fa6";
import "./home.css";

const PIPELINE_STAGES = ["Reported", "Assigned", "In Progress", "Resolved"];

const FEATURES = [
  {
    icon: FaClipboardList,
    title: "Report in seconds",
    desc: "Anyone can flag a broken asset from their phone — no login, no ticket queue to dig through, just a photo and a few taps.",
  },
  {
    icon: FaUserGear,
    title: "Route to the right hands",
    desc: "Supervisors assign the right technician by trade and workload the moment a report lands, not hours later.",
  },
  {
    icon: FaChartLine,
    title: "Track every stage",
    desc: 'From reported to resolved, every issue carries a full timeline — no more "is someone even looking at this?"',
  },
  {
    icon: FaShieldHalved,
    title: "Built for accountability",
    desc: "Role-based access keeps reporters, technicians, supervisors, and admins each seeing exactly what they need.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Report the issue",
    desc: "Snap a photo, pick the asset, describe what's wrong. Takes under a minute.",
  },
  {
    n: "02",
    title: "Get assigned",
    desc: "A supervisor triages by priority and hands it to the right technician.",
  },
  {
    n: "03",
    title: "Work gets done",
    desc: "Status updates in real time as inspection, parts, and repair move forward.",
  },
  {
    n: "04",
    title: "Close the loop",
    desc: "Supervisor approves the fix, the reporter sees it resolved — done.",
  },
];

const STATS = [
  { value: "24h", label: "Avg. time to first response" },
  { value: "8", label: "Status stages tracked" },
  { value: "100%", label: "Issues traceable to resolution" },
];

export default function LandingPage() {
  const [activeStage, setActiveStage] = useState(0);
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  // cycle the hero pipeline visualization
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // scroll-reveal for sections below the fold
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lp-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="lp-page">
      {/* ---------- Nav ---------- */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <span className="lp-logo-mark">
              <FaScrewdriverWrench />
            </span>
            <span className="lp-logo-text">
              Maintain<span className="lp-logo-accent">IQ</span>
            </span>
          </div>
          <Link href="/login" className="lp-cta lp-cta-nav">
            Sign Up / Login
          </Link>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="lp-hero">
        <div className="lp-hero-grid" aria-hidden="true" />
        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow">
              <FaBolt /> Asset issue tracking, done right
            </p>
            <h1 className="lp-hero-title">
              Every asset issue,
              <br />
              tracked from report
              <br />
              to resolve.
            </h1>
            <p className="lp-hero-sub">
              MaintainIQ gives your team one place to report faults, assign
              technicians, and follow every repair through to close-out —
              nothing falls through the cracks.
            </p>
            <Link href="/login" className="lp-cta lp-cta-hero">
              Sign Up / Login
              <FaArrowRight className="lp-cta-arrow" />
            </Link>
          </div>

          {/* Signature element: live ticket pipeline */}
          <div className="lp-pipeline-card">
            <div className="lp-pipeline-head">
              <span className="lp-pipeline-tag">#MQ-0482</span>
              <span className="lp-pipeline-title">HVAC Unit — Floor 3</span>
            </div>
            <div className="lp-pipeline-track">
              {PIPELINE_STAGES.map((stage, i) => (
                <div
                  className={`lp-pipeline-stage ${
                    i === activeStage ? "lp-stage-active" : ""
                  } ${i < activeStage ? "lp-stage-done" : ""}`}
                  key={stage}
                >
                  <span className="lp-pipeline-dot">
                    {i < activeStage ? <FaCircleCheck /> : null}
                  </span>
                  <span className="lp-pipeline-label">{stage}</span>
                </div>
              ))}
              <div
                className="lp-pipeline-fill"
                style={{
                  width: `${(activeStage / (PIPELINE_STAGES.length - 1)) * 100}%`,
                }}
              />
            </div>
            <p className="lp-pipeline-note">
              <FaWrench /> Updating live as work progresses
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="lp-section">
        <div className="lp-section-head lp-reveal" ref={addRevealRef}>
          <p className="lp-kicker">Why teams switch</p>
          <h2 className="lp-section-title">
            Built around how maintenance work actually happens
          </h2>
        </div>
        <div className="lp-features">
          {FEATURES.map((f, i) => (
            <div
              className="lp-feature-card lp-reveal"
              key={f.title}
              ref={addRevealRef}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="lp-feature-icon">
                <f.icon />
              </span>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="lp-section lp-section-alt">
        <div className="lp-section-head lp-reveal" ref={addRevealRef}>
          <p className="lp-kicker">The workflow</p>
          <h2 className="lp-section-title">
            From report to resolved, in order
          </h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <div
              className="lp-step lp-reveal"
              key={s.n}
              ref={addRevealRef}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className="lp-step-num">{s.n}</span>
              <div className="lp-step-body">
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && <span className="lp-step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="lp-stats lp-reveal" ref={addRevealRef}>
        {STATS.map((s) => (
          <div className="lp-stat" key={s.label}>
            <span className="lp-stat-value">{s.value}</span>
            <span className="lp-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="lp-closing lp-reveal" ref={addRevealRef}>
        <h2 className="lp-closing-title">
          Stop chasing updates in group chats.
        </h2>
        <p className="lp-closing-sub">
          Get every asset issue on one board, visible to everyone who needs it.
        </p>
        <Link href="/login" className="lp-cta lp-cta-closing">
          Sign Up / Login
          <FaArrowRight className="lp-cta-arrow" />
        </Link>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="lp-footer">
        <div className="lp-logo">
          <span className="lp-logo-mark lp-logo-mark-sm">
            <FaScrewdriverWrench />
          </span>
          <span className="lp-logo-text lp-logo-text-sm">
            Maintain<span className="lp-logo-accent">IQ</span>
          </span>
        </div>
        <p className="lp-footer-copy">
          © {new Date().getFullYear()} MaintainIQ. Built for teams who keep
          things running.
        </p>
      </footer>
    </div>
  );
}
