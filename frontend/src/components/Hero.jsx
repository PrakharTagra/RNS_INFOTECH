import React from "react";
import Button from "./Button";

export default function Hero({ eyebrow, title, subtitle, primaryCta, secondaryCta, stats = [] }) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--rns-bg)",
        borderBottom: "1px solid var(--rns-line)",
      }}
    >
      {/* a single soft glow, not a pattern — the only atmospheric
          flourish in the hero, kept quiet and out of the way of type */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-18%",
          right: "-8%",
          width: 620,
          height: 620,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(33,81,255,0.10) 0%, rgba(123,92,250,0.05) 45%, transparent 72%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="rns-container"
        style={{
          position: "relative",
          padding: "76px 24px 64px",
          display: "grid",
          gridTemplateColumns: "minmax(0,560px) 1fr",
          gap: 56,
          alignItems: "center",
        }}
      >
        <div>
          {eyebrow && (
            <span className="rns-badge">
              <span className="rns-badge__dot" aria-hidden="true" />
              {eyebrow}
            </span>
          )}
          <h1 style={{ fontSize: "clamp(36px, 4.2vw, 60px)", lineHeight: 1.06, marginTop: 20 }}>
            {title}
          </h1>
          <p style={{ marginTop: 22, fontSize: 17.5, color: "var(--rns-ink-soft)", maxWidth: 500, lineHeight: 1.6 }}>
            {subtitle}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Button as="a" href={primaryCta.href} variant="primary">{primaryCta.label}</Button>
            <Button as="a" href={secondaryCta.href} variant="ghost">{secondaryCta.label}</Button>
          </div>

          {stats.length > 0 && (
            <div style={{ marginTop: 40, paddingTop: 4 }}>
              <div className="rns-trace" aria-hidden="true" style={{ marginBottom: 26 }}>
                {stats.map((_, i) => (
                  <span
                    key={i}
                    className="rns-trace__node"
                    style={{ left: `${((i + 1) / (stats.length + 1)) * 100}%` }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: 34, flexWrap: "wrap" }}>
                {stats.map((s) => (
                  <div key={s.label}>
                    <div style={{ fontFamily: "var(--rns-font-display)", fontSize: 26, fontWeight: 800 }}>
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontFamily: "var(--rns-font-mono)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--rns-ink-faint)",
                        marginTop: 6,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* product panel — a single clean product photograph on a soft
            platinum backdrop, elevated with shadow only. No props, no
            decoration standing in for the product itself. */}
        <div className="rns-hero-panel" aria-hidden="true" style={{ position: "relative" }}>
          <div
            style={{
              position: "relative",
              borderRadius: "var(--rns-r-lg)",
              minHeight: 380,
              overflow: "hidden",
              boxShadow: "var(--rns-shadow-lg)",
              background: "var(--rns-bg-alt)",
            }}
          >
            <img
              src="/assets/rns_hero.png"
              alt=""
              style={{
                width: "100%",
                height: "100%",
                minHeight: 380,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
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
