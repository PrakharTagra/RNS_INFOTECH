import PermissionBoundary from "../../components/PermissionBoundary";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";
import StatCard from "../../components/StatCard";
import useToast from "../../hooks/useToast";
import { STATUS_TONE, statusLabel } from "../../utils/format";
import { getReviews, getReviewStats, setReviewStatus, deleteReview } from "../../services/reviewsService";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

function Stars({ rating }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, color: "var(--admin-warning)" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" size={13} style={{ fill: i < rating ? "currentColor" : "none" }} />
      ))}
    </span>
  );
}

export default function ReviewsListPage() {
  const { toast, showToast, clearToast } = useToast();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load(statusFilter = tab) {
    setError("");
    try {
      const [items, s] = await Promise.all([getReviews({ status: statusFilter }), getReviewStats()]);
      setReviews(items);
      setStats(s);
    } catch (err) {
      setReviews(null);
      setError(err.message || "Unable to load reviews.");
    }
  }

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = useMemo(() => {
    if (!reviews) return [];
    const q = search.trim().toLowerCase();
    return reviews
      .filter((r) => tab === "all" || r.status === tab)
      .filter(
        (r) =>
          !q ||
          r.productName.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
      )
      .sort((a, b) => a.status.localeCompare(b.status));
  }, [reviews, tab, search]);

  async function act(id, status) {
    await setReviewStatus(id, status);
    showToast(status === "approved" ? "Review approved" : "Review rejected");
    load();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteReview(pendingDelete.id);
    setPendingDelete(null);
    showToast("Review deleted");
    load();
  }

  return (
    <PermissionBoundary permission="reviews.write"><div>
      <div className="admin-page-header">
        <div>
          <h1>Reviews</h1>
          <p>Moderate product reviews. Approving or rejecting a review updates that product's rating automatically.</p>
        </div>
      </div>

      {stats && (
        <div className="admin-stat-grid" style={{ marginBottom: 20 }}>
          <StatCard label="Pending" value={stats.pending} icon="clock" />
          <StatCard label="Approved" value={stats.approved} icon="check" />
          <StatCard label="Rejected" value={stats.rejected} icon="close" />
          <StatCard label="Total" value={stats.total} icon="star" />
        </div>
      )}

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <Icon name="search" size={15} />
          <input
            className="admin-input"
            placeholder="Search product, customer, or comment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-segmented admin-segmented--sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`admin-segmented__btn${tab === t.key ? " is-active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {stats && t.key !== "all" ? ` (${stats[t.key]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="admin-card"><div style={{ color: "var(--admin-danger)", marginBottom: 12 }}>{error}</div><button className="admin-btn admin-btn--ghost" type="button" onClick={() => load(tab)}>Try again</button></div>
      ) : reviews === null ? (
        <div className="admin-card">Loading reviews…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="star" title="No reviews here" description="Nothing matches this view right now." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r) => (
            <div key={r.id} className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <strong>{r.customerName}</strong>
                    <Stars rating={r.rating} />
                    <Badge tone={STATUS_TONE[r.status]}>{statusLabel(r.status)}</Badge>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--admin-ink-soft)", marginTop: 2 }}>
                    on{" "}
                    <Link to={`/products/${r.productId}`} style={{ color: "var(--admin-primary)" }}>
                      {r.productName}
                    </Link>{" "}
                    · {r.date}
                  </div>
                  <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55 }}>{r.comment}</p>
                </div>
                <div className="admin-table__actions" style={{ flexShrink: 0 }}>
                  {r.status !== "approved" && (
                    <button className="admin-icon-btn" type="button" aria-label="Approve" title="Approve" onClick={() => act(r.id, "approved")}>
                      <Icon name="check" size={14} />
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      className="admin-icon-btn admin-icon-btn--danger"
                      type="button"
                      aria-label="Reject"
                      title="Reject"
                      onClick={() => act(r.id, "rejected")}
                    >
                      <Icon name="close" size={14} />
                    </button>
                  )}
                  <button
                    className="admin-icon-btn admin-icon-btn--danger"
                    type="button"
                    aria-label="Delete"
                    title="Delete"
                    onClick={() => setPendingDelete(r)}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this review?"
        description={pendingDelete ? `The review from "${pendingDelete.customerName}" will be permanently removed.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <Toast message={toast.message} tone={toast.tone} onClose={clearToast} />
    </div>
  </PermissionBoundary>
  );}
