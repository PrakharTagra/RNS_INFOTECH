/**
 * getDeliveryOptions — no real courier/pincode-serviceability check
 * here (no backend), so delivery windows are simulated the same way
 * OrdersContext simulates tracking: believable offsets from "now"
 * rather than a hard-coded date, so the page always shows sensible
 * options no matter when someone lands on it.
 */
export function getDeliveryOptions(from = new Date()) {
  const base = [
    { id: "standard", label: "Standard delivery", days: 5, extraCost: 0, note: "Free" },
    { id: "express", label: "Express delivery", days: 2, extraCost: 149, note: "+ ₹149" },
  ];

  return base.map((opt) => {
    const date = new Date(from);
    date.setDate(date.getDate() + opt.days);
    return { ...opt, date };
  });
}

export function formatDeliveryDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
