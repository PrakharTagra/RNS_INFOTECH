import React from "react";

export default function StatusToggle({ active, onChange, disabled }) {
  return (
    <button
      type="button"
      className={`admin-toggle${active ? " is-on" : ""}`}
      onClick={() => onChange(!active)}
      disabled={disabled}
      aria-pressed={active}
      aria-label={active ? "Active — click to deactivate" : "Inactive — click to activate"}
    >
      <span className="admin-toggle__track" />
      <span style={{ fontSize: 12, color: "var(--admin-ink-soft)", fontWeight: 600 }}>
        {active ? "Active" : "Inactive"}
      </span>
    </button>
  );
}
