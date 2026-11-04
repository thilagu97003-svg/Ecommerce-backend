import { useState } from "react";
import "../styles/Login.css";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import PopupMessage from "../components/PopupMessage";
import { API_BASE } from "../config"; 

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [popup, setPopup] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

   const redirectAfterLogin = () => {
    const checkoutItems = location.state?.items;

    if (checkoutItems?.length) {
      navigate("/checkout", {
        state: { items: checkoutItems },
      });
      return;
    }

    const returnTo = location.state?.returnTo;

    if (returnTo) {
      navigate(returnTo);
      return;
    }

    const checkoutPending =
      sessionStorage.getItem("stepup_checkout_pending") === "true";

    if (checkoutPending) {
      sessionStorage.removeItem("stepup_checkout_pending");
      navigate("/checkout");
    } else {
      navigate("/");
    }
  };

  const showLoginSuccess = (text) => {
    setPopup({
      type: "success",
      title: "Login Successful!",
      message: text,
      buttonText: "Continue",
      closeOnOverlay: false,
      onClose: redirectAfterLogin,
    });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      localStorage.setItem(
        "stepup_google_user",
        JSON.stringify(tokenResponse)
      );
      showLoginSuccess("You have signed in with Google. Welcome to StepUp.in!");
    },
    onError: () => showMessage("Google login failed. Please try again."),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const switchTab = (register) => {
    setIsRegister(register);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (isRegister && form.password !== form.confirmPassword) {
      showMessage("Passwords do not match. Please try again.");
      return;
    }

    const endpoint = isRegister
      ? `${API_BASE}/api/register/`
      : `${API_BASE}/api/login/`;

    const payload = isRegister
      ? {
          username: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }
      : {
          email: form.email.trim(),
          password: form.password,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Request failed. Please try again.");
        return;
      }

      if (isRegister) {
        setForm({
          name: "",
          email: form.email,
          password: "",
          confirmPassword: "",
        });
        setIsRegister(false);
        showMessage("Registration successful! Please log in.", "success");
        return;
      }

      localStorage.setItem("stepup_logged_in", JSON.stringify(data.user));
      localStorage.setItem("stepup_access_token", data.access);
      localStorage.setItem("stepup_refresh_token", data.refresh);

      showLoginSuccess("You have logged in successfully. Welcome back!");
    } catch (error) {
      showMessage("Backend connection failed. Please check the Django server.");
    }
  };

  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-tabs">
          <button
            type="button"
            className={!isRegister ? "active-tab" : ""}
            onClick={() => switchTab(false)}
          >
            Log in
          </button>

          <button
            type="button"
            className={isRegister ? "active-tab" : ""}
            onClick={() => switchTab(true)}
          >
            Register
          </button>
        </div>

        {message && (
          <p className={`login-message ${messageType}`}>{message}</p>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="field">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="field">
            <label>Email id</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />

              <button
                type="button"
                className="eye"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {!isRegister && (
              <a className="forgot-link">Forgot Password?</a>
            )}
          </div>

          {isRegister && (
            <div className="field">
              <label>Confirm Password</label>
              <div className="password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />

                <button
                  type="button"
                  className="eye"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>
          )}

          <button className="login-submit" type="submit">
            {isRegister ? "Register" : "Log In"}
          </button>
        </form>

        {!isRegister && (
          <>
            <p className="login-or">Or</p>

            <button
              type="button"
              className="google-button"
              onClick={() => googleLogin()}
            >
              Continue with Google
              <svg className="g-icon" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
                />
              </svg>
            </button>

            <p className="register-text">
              Don’t have an account?{" "}
              <a onClick={() => switchTab(true)}>Register</a>
            </p>
          </>
        )}
      </div>

      {popup && <PopupMessage {...popup} />}
    </section>
  );
}

export default Login;