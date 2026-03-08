export function formatINR(value) {
  if (!value && value !== 0) return "₹0";
  const num = parseInt(value, 10);
  if (isNaN(num)) return "₹0";
  const s = Math.abs(num).toString();
  if (s.length <= 3) return `₹${num < 0 ? "-" : ""}${s}`;
  const lastThree = s.slice(-3);
  let rest = s.slice(0, -3);
  let formatted = "";
  while (rest.length > 2) {
    formatted = "," + rest.slice(-2) + formatted;
    rest = rest.slice(0, -2);
  }
  formatted = rest + formatted;
  return `₹${num < 0 ? "-" : ""}${formatted},${lastThree}`;
}

export function getScoreColor(score) {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#eab308";
  return "#f97316";
}

export function getScoreLabel(score) {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

export function getRiskColor(level) {
  if (level === "high") return "#f97316";
  if (level === "medium") return "#eab308";
  return "#10b981";
}
