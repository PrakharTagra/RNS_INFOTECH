import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import Icon from "./Icon";
import Avatar from "./Avatar";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLiveChat } from "../context/LiveChatContext";
import { useCompare } from "../context/CompareContext";

/** NavLink — internal (path-starting) hrefs render as a router Link so
 * navigation stays client-side; anything else (mailto:, external URLs)
 * falls back to a plain <a>. Same convention as SectionHeader/CTASection. */
function NavLink({ href, children, onClick, style, className }) {
  const isInternal = href?.startsWith("/");
  return isInternal ? (
    <Link to={href} onClick={onClick} style={style} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} onClick={onClick} style={style} className={className}>
      {children}
    </a>
  );
}

function CompareAffordance() {
  const { count } = useCompare();
  const navigate = useNavigate();

  if (count === 0) return null;

  function handleClick() {
    navigate("/compare");
  }

  return (
    <button
      onClick={handleClick}
      aria-label={`${count} product${count === 1 ? "" : "s"} selected to compare`}
      title="Compare list"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        color: "var(--rns-on-ink)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <Icon name="compare" size={20} />
      <span
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          background: "var(--rns-primary)",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1,
          minWidth: 16,
          height: 16,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 4px",
          fontFamily: "var(--rns-font-mono)",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function CompareLiveRegion() {
  const { count } = useCompare();
  return (
    <div className="rns-visually-hidden" aria-live="polite" role="status">
      {count > 0 ? `${count} product${count === 1 ? "" : "s"} selected to compare.` : ""}
    </div>
  );
}

export default function Navbar({ logo, links, cta }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const { itemCount } = useCart();
  const { isAuthenticated, currentUser } = useAuth();
  const { toggleChat, unreadCount } = useLiveChat();
  const location = useLocation();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  function closeMenus() {
    setOpen(false);
  }

  const lightIconStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    color: "var(--rns-on-ink)",
  };

  return (
    <header
      ref={navRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--rns-bg-ink)",
        borderTop: "3px solid var(--rns-primary)",
        boxShadow: scrolled ? "0 10px 28px rgba(15,20,15,0.28)" : "none",
        transition: "box-shadow 0.2s ease",
      }}
    >
      <div className="rns-visually-hidden" aria-live="polite" role="status">
        {itemCount > 0 ? `Cart has ${itemCount} item${itemCount === 1 ? "" : "s"}.` : ""}
      </div>
      <CompareLiveRegion />

      <div
        className="rns-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
          gap: 20,
        }}
      >
        <Link
          to="/"
          className="rns-nav-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "var(--rns-on-ink)",
              borderRadius: 10,
              padding: "5px 9px",
              lineHeight: 0,
            }}
          >
            <img
              src="/assets/rns_logo.jpg"
              alt="RNS INFOTECH"
              style={{ height: "42px", display: "block" }}
            />
          </span>
        </Link>

        <nav
          className="rns-nav-links"
          style={{ display: "flex", gap: 30, fontSize: 14, fontWeight: 500 }}
        >
          {links.map((l) => {
            const active = location.pathname === l.href.split("?")[0];
            return (
              <NavLink
                key={l.label}
                href={l.href}
                className={active ? "rns-nav-link rns-nav-link--active" : "rns-nav-link"}
                style={{ color: "var(--rns-on-ink)" }}
              >
                {l.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="rns-nav-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            aria-label={isAuthenticated ? "Your account" : "Log in"}
            className="rns-nav-hide-mobile"
            style={lightIconStyle}
          >
            {isAuthenticated ? <Avatar name={currentUser.name} size={26} /> : <Icon name="user" size={20} />}
          </Link>
          <Link to="/orders" aria-label="Your orders" className="rns-nav-hide-mobile" style={lightIconStyle}>
            <Icon name="package" size={20} />
          </Link>
          <CompareAffordance />
          <button
            onClick={toggleChat}
            aria-label={unreadCount > 0 ? `Support chat, ${unreadCount} new message` : "Support chat"}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              color: "var(--rns-on-ink)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Icon name="message" size={20} />
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "var(--rns-primary)",
                  border: "1.5px solid var(--rns-bg-ink)",
                }}
              />
            )}
          </button>
          <Link to="/cart" aria-label="View cart" style={{ position: "relative", ...lightIconStyle }}>
            <Icon name="cart" size={20} />
            {itemCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "var(--rns-primary)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: 1,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  fontFamily: "var(--rns-font-mono)",
                }}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          <Button
            as="a"
            href={cta.href}
            variant="primary"
            className="rns-nav-hide-mobile"
            style={{ background: "var(--rns-primary)", color: "#fff" }}
          >
            {cta.label}
          </Button>
          <button
            aria-label="Toggle menu"
            className="rns-nav-toggle"
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              padding: 4,
              color: "var(--rns-on-ink)",
            }}
          >
            <Icon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {/* ruler-tick strip — the cutting-mat edge motif, echoed again in
          the hero. Purely decorative, sits between the main row and
          the search row. */}
      <div
        aria-hidden="true"
        style={{
          height: 6,
          background:
            "repeating-linear-gradient(90deg, rgba(234,241,228,0.28) 0, rgba(234,241,228,0.28) 1px, transparent 1px, transparent 10px)",
        }}
      />

      <div style={{ background: "var(--rns-on-ink)" }}>
        <div className="rns-container" style={{ padding: "10px var(--rns-gutter)" }}>
          <SearchBar />
        </div>
      </div>

      {open && (
        <div
          className="rns-container rns-nav-mobile-menu"
          style={{
            display: "flex",
            flexDirection: "column",
            borderTop: "1px solid #33473A",
            background: "var(--rns-bg-ink)",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", padding: "14px 0 8px" }}>
            {links.map((l) => (
              <NavLink
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  fontSize: 14.5,
                  padding: "10px 2px",
                  borderBottom: "1px solid #33473A",
                  color: "var(--rns-on-ink)",
                }}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 2px 18px" }}>
            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: "var(--rns-on-ink)" }}
            >
              {isAuthenticated ? <Avatar name={currentUser.name} size={22} /> : <Icon name="user" size={18} />}
              {isAuthenticated ? "Your account" : "Log in"}
            </Link>
            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: "var(--rns-on-ink)" }}
            >
              <Icon name="package" size={18} />
              Your orders
            </Link>
            <Button
              as="a"
              href={cta.href}
              variant="primary"
              onClick={() => setOpen(false)}
              style={{ marginTop: 4, justifyContent: "center", background: "var(--rns-primary)", color: "#fff" }}
            >
              {cta.label}
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .rns-nav-link { position: relative; padding: 4px 0; }
        .rns-nav-link:hover,
        .rns-nav-link--active {
          text-decoration-line: underline;
          text-decoration-style: wavy;
          text-decoration-color: var(--rns-primary);
          text-decoration-thickness: 2px;
          text-underline-offset: 7px;
        }

        @media (max-width: 800px) {
          .rns-nav-links { display: none !important; }
          .rns-nav-toggle { display: inline-flex !important; }
          .rns-nav-hide-mobile { display: none !important; }
          .rns-nav-actions { gap: 8px !important; }
        }
        @media (max-width: 420px) {
          .rns-nav-logo img { height: 32px !important; }
        }
      `}</style>
    </header>
  );
}
