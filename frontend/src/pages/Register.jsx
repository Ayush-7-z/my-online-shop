import { useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import useAuth from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { Field, PasswordField, PasswordStrength, SubmitButton } from "../components/AuthFields";
import { nextPath, rules } from "../utils/auth";

const FIELDS = ["name", "email", "phone", "password", "confirm"];

function Register() {
  const { user, register } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const nameRef = useRef(null), emailRef = useRef(null), phoneRef = useRef(null), passwordRef = useRef(null), confirmRef = useRef(null);
  const refs = { name: nameRef, email: emailRef, phone: phoneRef, password: passwordRef, confirm: confirmRef };

  // The server signs new customers in, so a signed-in user simply continues to where they were heading.
  if (user) return <Navigate to={nextPath(location.state?.from)} replace />;

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };
  const validateOnBlur = (key) => () => {
    if (form[key]) setErrors((er) => ({ ...er, [key]: rules[key](form[key], form) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const found = Object.fromEntries(FIELDS.map((key) => [key, rules[key](form[key], form)]));
    setErrors(found);
    const firstInvalid = FIELDS.find((key) => found[key]);
    if (firstInvalid) return refs[firstInvalid].current?.focus();

    setLoading(true);
    const result = await register(form.name.trim(), form.email.trim(), form.phone.trim(), form.password);
    setLoading(false);
    if (result.ok) return;
    if (result.status === 409) {
      setErrors({ email: result.message });
      refs.email.current?.focus();
    } else {
      setServerError(result.message);
    }
  };

  const props = (key) => ({ name: key, value: form[key], onChange: update(key), onBlur: validateOnBlur(key), error: errors[key] });

  return (
    <AuthLayout
      heading="Join ShopEase"
      text="Create a free account to check out faster and keep everything you love in one place."
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={<>Already have an account? <Link to="/login" state={location.state}>Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <div className="auth-alert" role="alert">{serverError}</div>}
        <Field label="Full name" type="text" {...props("name")} ref={nameRef} autoComplete="name" />
        <Field label="Email" type="email" {...props("email")} ref={emailRef} autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} />
        <Field label="Phone" optional type="tel" {...props("phone")} ref={phoneRef} autoComplete="tel" inputMode="tel" />
        <PasswordField label="Password" {...props("password")} ref={passwordRef} autoComplete="new-password"
          hint="At least 8 characters with a letter and a number." />
        <PasswordStrength password={form.password} />
        <PasswordField label="Confirm password" {...props("confirm")} ref={confirmRef} autoComplete="new-password" />
        <SubmitButton loading={loading} idle="Create account" busy="Creating account..." />
      </form>
    </AuthLayout>
  );
}

export default Register;
