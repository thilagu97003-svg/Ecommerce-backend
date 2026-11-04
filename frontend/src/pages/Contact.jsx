import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../styles/Contact.css";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
}

const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const FIELD_ORDER = ["name", "email", "phone", "message"];

function validate({ name, email, phone, message }) {
  const errors = {};

  const n = name.trim();
  if (!n) errors.name = "Please enter your name.";
  else if (n.length < 3) errors.name = "Name must be at least 3 characters.";
  else if (!NAME_RE.test(n)) errors.name = "Name can have only letters and spaces.";

  const e = email.trim();
  if (!e) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(e)) errors.email = "Enter a valid email (example: name@gmail.com).";

  if (!phone) errors.phone = "Please enter your mobile number.";
  else if (!PHONE_RE.test(phone)) errors.phone = "Enter a valid 10 digit mobile number.";

  const m = message.trim();
  if (!m) errors.message = "Please type your message.";
  else if (m.length < 10)
    errors.message = `Message must be at least 10 characters (${m.length}/10).`;

  return errors;
}

function Popup({ type, onClose }) {
  const okRef = useRef(null);
  const isSuccess = type === "success";

  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`popup-icon ${isSuccess ? "ok" : "fail"}`}>
          {isSuccess ? "✓" : "✕"}
        </div>

        <h3>{isSuccess ? "Thank you!" : "Oops!"}</h3>

        <p>
          {isSuccess
            ? "Your enquiry has been submitted successfully. Our team will contact you soon."
            : "We could not send your enquiry right now. Please try again in a moment."}
        </p>

        <button type="button" ref={okRef} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

function Contact() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [popup, setPopup] = useState(null);

  const errors = validate(values);
  const showError = (field) => touched[field] && errors[field];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const clean = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setValues((prev) => ({ ...prev, [name]: clean }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ name: true, email: true, phone: true, message: true });

    const firstBad = FIELD_ORDER.find((field) => errors[field]);
    if (firstBad) {
      document.getElementById(`contact-${firstBad}`)?.focus();
      return;
    }

    const data = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone,
      message: values.message.trim(),
    };

    setSending(true);

    try {
      await axios.get("http://localhost:8000/api/contact/csrf/", {
        withCredentials: true,
      });

      const csrfToken = getCookie("csrftoken");

      await axios.post("http://localhost:8000/api/contact/", data, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfToken },
      });

      setValues({ name: "", email: "", phone: "", message: "" });
      setTouched({});
      setPopup("success");
    } catch (error) {
      console.error("Contact form submit failed:", error.response?.data || error);
      setPopup("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-details">
          <h1>Contact Us</h1>

          <h3>For Online Orders</h3>
          <p>Inquiry/Complaint</p>
          <p>9976357250</p>

          <p className="contact-sub">Any other queries</p>
          <p>9976357250</p>
          <p>9976357250</p>
          <p>10 AM-7.00 PM</p>
          <p>
            Email:{" "}
            <a href="mailto:customercarestepup.in@gmail.com">
              customercarestepup.in@gmail.com
            </a>
          </p>
        </div>

        <img
          className="contact-image"
          src="/images/contact-shoes.jpg"
          alt="Colorful shoes"
        />
      </section>

      <section className="enquiry-section">
        <h2>Enquiry Form</h2>

        <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={showError("name") ? "invalid" : ""}
            />
            {showError("name") && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="contact-form-row">
            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={showError("email") ? "invalid" : ""}
              />
              {showError("email") && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="contact-phone">Phone</label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={showError("phone") ? "invalid" : ""}
              />
              {showError("phone") && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              value={values.message}
              onChange={handleChange}
              onBlur={handleBlur}
              className={showError("message") ? "invalid" : ""}
            />
            {showError("message") && <span className="field-error">{errors.message}</span>}
          </div>

          <button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </section>

      {popup && <Popup type={popup} onClose={() => setPopup(null)} />}
    </main>
  );
}

export default Contact;