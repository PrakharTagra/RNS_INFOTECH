import PermissionBoundary from "../../components/PermissionBoundary";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import Badge from "../../components/Badge";
import Toast from "../../components/Toast";
import ConfirmDialog from "../../components/ConfirmDialog";
import useToast from "../../hooks/useToast";
import OrderShipModal from "./OrderShipModal";

import { getOrder, confirmOrder, packOrder, shipOrder, markOutForDelivery, markDelivered, markReturned, cancelOrder } from "../../services/ordersService";
import { STATUS_TONE, statusLabel } from "../../utils/format";

function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN");
}
function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TIMELINE_STAGES = ["pending", "confirmed", "packed", "shipped", "out-for-delivery", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { toast, showToast, clearToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let alive = true;
    getOrder(id).then((o) => {
      if (!alive) return;
      setOrder(o);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  async function handleConfirm() {
    setConfirming(true);
    try {
      const updated = await confirmOrder(order.id);
      setOrder(updated);
      showToast("Order confirmed");
    } catch (err) {
      showToast(err.message || "Something went wrong.", "danger");
    } finally {
      setConfirming(false);
    }
  }

  async function runTransition(action, message) {
    try {
      const updated = await action(order.id);
      setOrder(updated);
      showToast(message);
    } catch (err) {
      showToast(err.message || "Something went wrong.", "danger");
    }
  }

  function handleShipped(updated) {
    setOrder(updated);
    setShipping(false);
    showToast(`Marked as shipped — customer now sees ${updated.courierName} tracking ${updated.trackingId}`);
  }

  async function handleCancelConfirmed() {
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      showToast("Order cancelled");
    } catch (err) {
      showToast(err.message || "Something went wrong.", "danger");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <div className="admin-card">Loading order…</div>;
  }

  if (!order) {
    return (
      <div className="admin-card admin-empty">
        <h3>Order not found</h3>
        <p>Check the order ID and try again.</p>
        <Link to="/orders" className="admin-btn admin-btn--primary" style={{ marginTop: 14 }}>
          Back to orders
        </Link>
      </div>
    );
  }

  const currentIndex = TIMELINE_STAGES.indexOf(order.status);
  const canCancel = ["pending", "confirmed", "packed"].includes(order.status);

  return (
    <PermissionBoundary permission="orders.write"><div>
      <Link to="/orders" className="admin-back-link">
        <Icon name="chevronLeft" size={13} />
        Back to orders
      </Link>

      <div className="admin-page-header">
        <div>
          <h1>{order.id}</h1>
          <p style={{ marginBottom: 8 }}>
            Placed {formatDateTime(order.date)} · {order.paymentMethod}
          </p>
          <Badge tone={STATUS_TONE[order.status]}>{statusLabel(order.status)}</Badge>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {order.status === "pending" && (
            <button className="admin-btn admin-btn--primary" type="button" onClick={handleConfirm} disabled={confirming}>
              <Icon name="check" size={14} />
              {confirming ? "Confirming…" : "Confirm order"}
            </button>
          )}
          {order.status === "confirmed" && (
            <button className="admin-btn admin-btn--primary" type="button" onClick={() => runTransition(packOrder, "Order packed")}>
              <Icon name="check" size={14} /> Pack order
            </button>
          )}
          {order.status === "packed" && (
            <button className="admin-btn admin-btn--primary" type="button" onClick={() => setShipping(true)}>
              <Icon name="truck" size={14} /> Mark as shipped
            </button>
          )}
          {order.status === "shipped" && (
            <button className="admin-btn admin-btn--primary" type="button" onClick={() => runTransition(markOutForDelivery, "Marked out for delivery")}>
              <Icon name="truck" size={14} /> Out for delivery
            </button>
          )}
          {order.status === "out-for-delivery" && (
            <button className="admin-btn admin-btn--primary" type="button" onClick={() => runTransition(markDelivered, "Order delivered")}>
              <Icon name="check" size={14} /> Mark delivered
            </button>
          )}
          {order.status === "return-requested" && (
            <button className="admin-btn admin-btn--primary" type="button" onClick={() => runTransition(markReturned, "Return received")}>
              <Icon name="check" size={14} /> Mark returned
            </button>
          )}
          {canCancel && (
            <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setCancelling(true)}>
              Cancel order
            </button>
          )}
        </div>
      </div>

      {["cancelled", "return-requested", "returned", "refunded"].includes(order.status) ? (
        <div className="admin-card" style={{ marginBottom: 20, borderColor: order.status === "cancelled" ? "var(--admin-danger)" : "var(--admin-line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--admin-danger)", fontWeight: 600, fontSize: 13.5 }}>
            <Icon name="alert" size={16} />
            {statusLabel(order.status)}
          </div>
        </div>
      ) : (
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 16 }}>Fulfillment timeline</h3>
          <div className="admin-timeline">
            {TIMELINE_STAGES.map((stage, i) => (
              <div key={stage} className={`admin-timeline__step${i <= currentIndex ? " is-complete" : ""}`}>
                <div className="admin-timeline__dot" />
                <div className="admin-timeline__label">{statusLabel(stage)}</div>
              </div>
            ))}
          </div>
          {order.status === "shipped" ? (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "var(--admin-ink-soft)",
                background: "var(--admin-success-tint)",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              <Icon name="check" size={15} style={{ color: "var(--admin-success)", flexShrink: 0 }} />
              <span>
                Shipped via <strong>{order.courierName}</strong> · Tracking ID <strong>{order.trackingId}</strong> — RNS INFOTECH's
                part in this order is complete; the customer sees these same details on the storefront.
              </span>
            </div>
          ) : (
            <p style={{ marginTop: 14, fontSize: 12.5, color: "var(--admin-ink-faint)" }}>
              Expected delivery: {formatDate(order.deliveryDate)} · {order.deliveryLabel}
            </p>
          )}
        </div>
      )}

      <div className="admin-grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="admin-card" style={{ padding: 0 }}>
            <h3 style={{ fontSize: 14, padding: "16px 16px 0" }}>Items</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th style={{ textAlign: "right" }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <div className="admin-table__title-cell">
                          <img className="admin-table__thumb" src={it.image} alt="" />
                          <div>
                            <Link to={`/products/${it.id}`} className="admin-table__title-main" style={{ textDecoration: "none" }}>
                              {it.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td>{it.category}</td>
                      <td>{it.qty}</td>
                      <td style={{ textAlign: "right" }}>{formatINR(it.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="admin-card">
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Order summary</h3>
            <div className="admin-kv-list">
              <div>
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div>
                <span>Shipping</span>
                <span>{order.shipping ? formatINR(order.shipping) : "Free"}</span>
              </div>
              <div>
                <span>Savings</span>
                <span>{formatINR(order.savings)}</span>
              </div>
              <div>
                <span>Total</span>
                <span>{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Customer &amp; shipping</h3>
            <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
              <div style={{ fontWeight: 600 }}>{order.shippingAddress.name}</div>
              <div style={{ color: "var(--admin-ink-soft)" }}>{order.shippingAddress.phone}</div>
              <div style={{ color: "var(--admin-ink-soft)" }}>{order.customerEmail}</div>
              <div style={{ marginTop: 10, color: "var(--admin-ink-soft)" }}>
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
                <br />
                {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(", ")}
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Payment</h3>
            <div className="admin-kv-list">
              <div>
                <span>Method</span>
                <span>{order.paymentMethod}</span>
              </div>
            </div>
            <Link to={`/payments/PAY-${order.id}`} className="admin-btn admin-btn--ghost admin-btn--sm" style={{ marginTop: 12 }}>
              <Icon name="creditCard" size={13} />
              View payment
            </Link>
          </div>
        </div>
      </div>

      {shipping && <OrderShipModal order={order} onClose={() => setShipping(false)} onSaved={handleShipped} />}
      <ConfirmDialog
        open={cancelling}
        title="Cancel this order?"
        description={`${order.id} will be marked cancelled and removed from the fulfillment queue.`}
        confirmLabel="Cancel order"
        onConfirm={handleCancelConfirmed}
        onCancel={() => setCancelling(false)}
      />
      <Toast message={toast.message} tone={toast.tone} onClose={clearToast} />
    </div>
  </PermissionBoundary>
  );}
