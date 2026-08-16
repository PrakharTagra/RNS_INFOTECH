import React from "react";
import Button from "./Button";

export default function Hero({ eyebrow, title, subtitle, primaryCta, secondaryCta, stats }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--rns-line)" }}>
      {/* quiet schematic backdrop — static, low-contrast, no motion */}
      <svg
        aria-hidden="true"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.5 }}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="rns-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#eef0f6" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rns-grid)" />
      </svg>

      <div
        className="rns-container"
        style={{
          position: "relative",
          padding: "0px 24px 40px",
          display: "grid",
          gridTemplateColumns: "minmax(0,640px) 1fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(32px, 4.2vw, 52px)", lineHeight: 1.1, marginTop: 16 }}>
            {title}
          </h1>
          <p style={{ marginTop: 20, fontSize: 17, color: "var(--rns-ink-soft)", maxWidth: 520 }}>
            {subtitle}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <Button as="a" href={primaryCta.href} variant="primary">{primaryCta.label}</Button>
            <Button as="a" href={secondaryCta.href} variant="ghost">{secondaryCta.label}</Button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 28,
              marginTop: 28,
              paddingTop: 20,
              borderTop: "1px solid var(--rns-line)",
              flexWrap: "wrap",
            }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "var(--rns-font-display)", fontSize: 26, fontWeight: 700 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: "var(--rns-ink-faint)", marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* schematic "device" panel — a flat, line-drawn stand-in image */}
        <div
          aria-hidden="true"
          className="rns-hero-panel"
          style={{
            border: "1px solid var(--rns-line)",
            borderRadius: 16,
            minHeight: 320,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src="/assets/rns_hero.png"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              minHeight: 320,
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .rns-hero-panel { display: none; }
        }
      `}</style>
    </section>
  );
}
