import Link from "next/link";
import { FaQrcode, FaTools, FaChartLine } from "react-icons/fa";
import "./home.css";

export default function HomePage() {
  return (
    <main className="home-page">
      <nav className="home-navbar">
        <span className="home-logo">MaintainIQ</span>
        <Link href="/login" className="home-login-btn">
          Staff Login
        </Link>
      </nav>

      <section className="home-hero">
        <h1>
          Give every asset a digital identity —{" "}
          <span className="home-highlight">report, triage, resolve.</span>
        </h1>
        <p>
          Scan the QR code on any equipment to report an issue instantly — no
          login required. Staff manage the full maintenance lifecycle from one
          dashboard.
        </p>

        <div className="home-feature-grid">
          <div className="home-feature-card">
            <FaQrcode className="home-feature-icon" />
            <p>Scan & report in seconds</p>
          </div>
          <div className="home-feature-card">
            <FaTools className="home-feature-icon" />
            <p>AI-assisted issue triage</p>
          </div>
          <div className="home-feature-card">
            <FaChartLine className="home-feature-icon" />
            <p>Full asset history</p>
          </div>
        </div>
      </section>
    </main>
  );
}
