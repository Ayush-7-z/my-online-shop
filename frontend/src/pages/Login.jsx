import { useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import useAuth from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { Field, PasswordField, SubmitButton } from "../components/AuthFields";
import { nextPath, rules } from "../utils/auth";

function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const refs = { email: emailRef, password: passwordRef };

  // Signed in (just now, or already): go back to where the visitor was heading.
  if (user) return <Navigate to={nextPath(location.state?.from)} replace />;

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const found = { email: rules.email(form.email), password: form.password ? "" : "Enter your password." };
    setErrors(found);
    const firstInvalid = Object.keys(found).find((key) => found[key]);
    if (firstInvalid) return refs[firstInvalid].current?.focus();

    setLoading(true);
    const result = await login(form.email.trim(), form.password);
    setLoading(false);
    if (!result.ok) {
      setServerError(result.message);
      passwordRef.current?.focus();
    }
  };

  return (
    <AuthLayout
      heading="Welcome back"
      text="Sign in to pick up where you left off: your cart, wishlist and orders are waiting."
      title="Sign in"
      subtitle="Use the email and password you registered with."
      footer={<>New to ShopEase? <Link to="/register" state={location.state}>Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <div className="auth-alert" role="alert">{serverError}</div>}
        <Field label="Email" type="email" name="email" ref={emailRef} value={form.email} onChange={update("email")}
          error={errors.email} autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} />
        <PasswordField label="Password" name="password" ref={passwordRef} value={form.password} onChange={update("password")}
          error={errors.password} autoComplete="current-password" />
        <SubmitButton loading={loading} idle="Sign in" busy="Signing in..." />
      </form>
    </AuthLayout>
  );
}

export default Login;
