// Form rules shared by Login and Register. They mirror backend/api/register.php, which stays the
// real gatekeeper; each rule returns an error message, or "" when the value is fine.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const rules = {
  name: (v) => (v.trim().length < 2 ? "Enter your full name." : v.trim().length > 100 ? "Name is too long." : ""),
  email: (v) => (!v.trim() ? "Enter your email address." : !EMAIL.test(v.trim()) ? "Enter a valid email, like name@example.com." : ""),
  phone: (v) => (v.trim() && !/^[0-9+()\s-]{7,15}$/.test(v.trim()) ? "Use 7-15 digits (you can include + - and spaces)." : ""),
  password: (v) =>
    v.length < 8 ? "Use at least 8 characters."
    : v.length > 72 ? "Use at most 72 characters."
    : !/[A-Za-z]/.test(v) || !/\d/.test(v) ? "Include at least one letter and one number."
    : "",
  confirm: (v, form) => (v !== form.password ? "Passwords do not match." : ""),
};

// 0-4 strength score for the meter (informational only; `rules.password` is the requirement).
export function passwordStrength(password) {
  if (!password) return { score: 0, label: "" };
  if (password.length < 8) return { score: 0, label: "Too short" };
  const score =
    1 + (password.length >= 12) + (/[a-z]/.test(password) && /[A-Z]/.test(password)) + (/\d/.test(password) && /[^A-Za-z0-9]/.test(password));
  return { score, label: ["Too short", "Weak", "Fair", "Good", "Strong"][score] };
}

// Only follow in-site paths ("/orders"), never "//evil.com" or full URLs, after logging in.
export function nextPath(from) {
  return typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/";
}
