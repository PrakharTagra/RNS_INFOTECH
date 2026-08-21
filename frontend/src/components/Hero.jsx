import React from "react";
import Button from "./Button";

export default function Hero({ eyebrow, title, subtitle, primaryCta, secondaryCta, stats = [] }) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--rns-bg-alt)",
        borderBottom: "1px solid var(--rns-line)",
      }}
    >
      {/* cutting-mat grid — the desk surface this whole brand sits on */}
      <svg
        aria-hidden="true"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.7 }}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="rns-mat-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="var(--rns-line)" strokeWidth="1" />
          </pattern>
          <pattern id="rns-mat-grid-major" width="140" height="140" patternUnits="userSpaceOnUse">
            <path d="M140 0H0V140" fill="none" stroke="var(--rns-line-strong)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rns-mat-grid)" />
        <rect width="100%" height="100%" fill="url(#rns-mat-grid-major)" />
      </svg>

      {/* ruler edge along the very top — ticks like the ruled border
          printed on a real cutting mat */}
      <div aria-hidden="true" className="rns-hero-ruler" />

      <div
        className="rns-container"
        style={{
          position: "relative",
          padding: "56px 24px 44px",
          display: "grid",
          gridTemplateColumns: "minmax(0,620px) 1fr",
          gap: 44,
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
          <h1 style={{ fontSize: "clamp(34px, 4.4vw, 58px)", lineHeight: 1.05, marginTop: 18 }}>
            {title}
          </h1>
          <p style={{ marginTop: 20, fontSize: 17, color: "var(--rns-ink-soft)", maxWidth: 520 }}>
            {subtitle}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <Button as="a" href={primaryCta.href} variant="primary">{primaryCta.label}</Button>
            <Button as="a" href={secondaryCta.href} variant="ghost">{secondaryCta.label}</Button>
          </div>

          {stats.length > 0 && (
            <div style={{ marginTop: 30, paddingTop: 4 }}>
              <div className="rns-trace" aria-hidden="true" style={{ marginBottom: 20 }}>
                {stats.map((_, i) => (
                  <span
                    key={i}
                    className="rns-trace__node"
                    style={{ left: `${((i + 1) / (stats.length + 1)) * 100}%` }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
                {stats.map((s) => (
                  <div key={s.label}>
                    <div style={{ fontFamily: "var(--rns-font-display)", fontSize: 27, fontWeight: 700 }}>
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontFamily: "var(--rns-font-mono)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--rns-ink-faint)",
                        marginTop: 5,
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

        {/* "pinned reference photo" panel — a product shot on the mat,
            held down with a strip of tape. The one deliberate flourish
            in the hero; everything else stays quiet. */}
        <div className="rns-hero-panel" aria-hidden="true" style={{ position: "relative" }}>
          <div
            style={{
              position: "relative",
              border: "1px solid var(--rns-line-strong)",
              borderRadius: "var(--rns-r-lg)",
              minHeight: 340,
              overflow: "hidden",
              boxShadow: "var(--rns-shadow-lg)",
              background: "var(--rns-bg)",
            }}
          >
            <img
              src="/assets/rns_hero.png"
              alt=""
              style={{
                width: "100%",
                height: "100%",
                minHeight: 340,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
          {/* cut-line — a dashed offset border, like the outline scored
              into the mat around the photo */}
          <div
            style={{
              position: "absolute",
              inset: -10,
              border: "2px dashed var(--rns-line-strong)",
              borderRadius: "calc(var(--rns-r-lg) + 8px)",
              pointerEvents: "none",
            }}
          />
          {/* tape strip */}
          <div
            style={{
              position: "absolute",
              top: -16,
              left: "50%",
              width: 108,
              height: 34,
              background: "rgba(255,177,153,0.55)",
              border: "1px solid rgba(255,177,153,0.8)",
              transform: "translateX(-50%) rotate(-3deg)",
              boxShadow: "0 2px 6px rgba(27,27,22,0.12)",
            }}
          />
        </div>
      </div>

      <style>{`
        .rns-hero-ruler {
          height: 22px;
          background: var(--rns-bg-alt);
          border-bottom: 1px solid var(--rns-line-strong);
          background-image: repeating-linear-gradient(
            90deg,
            var(--rns-line-strong) 0,
            var(--rns-line-strong) 1px,
            transparent 1px,
            transparent 40px
          );
          position: relative;
        }
        .rns-hero-ruler::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            90deg,
            var(--rns-line) 0,
            var(--rns-line) 1px,
            transparent 1px,
            transparent 10px
          );
        }
        @media (max-width: 860px) {
          .rns-hero-panel { display: none; }
        }
      `}</style>
    </section>
  );
}
