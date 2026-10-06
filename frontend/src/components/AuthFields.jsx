import { useId, useState } from "react";
import { passwordStrength } from "../utils/auth";

export function Icon({ children, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const EyeIcon = () => <Icon><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Icon>;
const EyeOffIcon = () => (
  <Icon><path d="M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4.4-1" /><path d="m2 2 20 20M9.9 9.9a3 3 0 0 0 4.2 4.2" /></Icon>
);

// Labelled input with an inline error/hint wired up for screen readers (aria-invalid + aria-describedby).
export function Field({ label, error, hint, optional, trailing, ref, ...inputProps }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`field${error ? " field-invalid" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="field-optional"> (optional)</span>}
      </label>
      <div className="field-control">
        <input id={id} ref={ref} aria-invalid={error ? "true" : undefined} aria-describedby={describedBy} {...inputProps} />
        {trailing}
      </div>
      {error ? <p id={`${id}-error`} className="field-error">{error}</p>
        : hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>
  );
}

export function PasswordField(props) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button type="button" className="field-toggle" onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}

export function PasswordStrength({ password }) {
  const { score, label } = passwordStrength(password);
  if (!password) return null;
  return (
    <div className={`strength strength-${score}`} aria-live="polite">
      <div className="strength-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => <span key={n} className={n <= score ? "on" : ""} />)}
      </div>
      <span className="strength-label">Password strength: {label}</span>
    </div>
  );
}

export function SubmitButton({ loading, idle, busy }) {
  return (
    <button type="submit" className="auth-submit" disabled={loading} aria-busy={loading}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {loading ? busy : idle}
    </button>
  );
}
