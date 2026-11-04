import { useState } from "react";

import "../styles/Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import PopupMessage from "../components/PopupMessage";
import axios from "axios";
import { API_BASE } from "../config"; 

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  paymentMethod: "card",
  cardHolder: "",
  cardNumber: "",
  cvv: "",
  expiry: "",
  upiId: "",
  paypalEmail: "",
  address: "",
  city: "",
  state: "",
  landmark: "",
  pincode: "",
};

const paymentMethods = [
  ["card", "Card"],
  ["gpay", "Google Pay / UPI"],
  ["paypal", "PayPal"],
  ["clearpay", "Clearpay"],
  ["klarna", "Klarna"],
  ["cod", "Cash on Delivery"],
];
const paymentMap = {
  card: "Card",
  gpay: "UPI",
  paypal: "PayPal",
  clearpay: "Clearpay",
  klarna: "Klarna",
  cod: "COD",
};

const BNPL = {
  clearpay: { name: "Clearpay", count: 4, gap: "weeks", step: 2 },
  klarna: { name: "Klarna", count: 3, gap: "months", step: 1 },
};

function BnplInfo({ plan, total }) {
  const part = Math.ceil(total / plan.count);
  const last = total - part * (plan.count - 1);

  const rows = Array.from({ length: plan.count }, (_, i) => {
    const amount = i === plan.count - 1 ? last : part;
    const when =
      i === 0
        ? "Today"
        : `In ${i * plan.step} ${
            plan.gap === "months" && i * plan.step === 1 ? "month" : plan.gap
          }`;
    return { when, amount };
  });

  return (
    <div className="bnpl-box">
      <h4>
        Pay in {plan.count} interest-free instalments with {plan.name}
      </h4>

      <ul>
        {rows.map((row) => (
          <li key={row.when}>
            <span>{row.when}</span>
            <strong>₹{row.amount.toLocaleString("en-IN")}</strong>
          </li>
        ))}
      </ul>

      <p className="payment-note">
        Demo payment. No real money is charged. In a live store you would
        continue on the {plan.name} website to approve the plan.
      </p>
    </div>
  );
}

const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^[1-9]\d{5}$/;
const UPI_RE = /^[\w.-]{2,}@[A-Za-z]{2,}$/;

const FIELD_ORDER = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "cardHolder",
  "cardNumber",
  "cvv",
  "expiry",
  "upiId",
  "paypalEmail",
  "address",
  "city",
  "state",
  "pincode",
];

const onlyDigits = (value, max) => value.replace(/\D/g, "").slice(0, max);
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// type pannum podhe thappana characters remove aagum
function clean(name, value) {
  switch (name) {
    case "phone":
      return onlyDigits(value, 10);
    case "pincode":
      return onlyDigits(value, 6);
    case "cvv":
      return onlyDigits(value, 3);
    case "cardNumber":
      return onlyDigits(value, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    case "expiry": {
      const digits = onlyDigits(value, 4);
      return digits.length > 2
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : digits;
    }
    case "firstName":
    case "lastName":
    case "cardHolder":
    case "city":
    case "state":
      return value.replace(/[^A-Za-z .'-]/g, "");
    case "email":
    case "paypalEmail":
      return value.replace(/\s/g, "");
    default:
      return value;
  }
}

function validate(form) {
  const e = {};

  const checkName = (name, label, min) => {
    const v = form[name].trim();
    if (!v) e[name] = `Please enter ${label}.`;
    else if (v.length < min)
      e[name] = `${cap(label)} must have at least ${min} letters.`;
    else if (!NAME_RE.test(v))
      e[name] = `${cap(label)} can have only letters.`;
  };

  checkName("firstName", "your first name", 2);
  checkName("lastName", "your last name", 1);

  const email = form.email.trim();
  if (!email) e.email = "Please enter your email.";
  else if (!EMAIL_RE.test(email))
    e.email = "Enter a valid email (example: name@gmail.com).";

  if (!form.phone) e.phone = "Please enter your mobile number.";
  else if (form.phone.length < 10)
    e.phone = `Mobile number must be 10 digits (${form.phone.length}/10).`;
  else if (!PHONE_RE.test(form.phone))
    e.phone = "Mobile number must start with 6, 7, 8 or 9.";

  if (form.paymentMethod === "card") {
    checkName("cardHolder", "the card holder name", 3);

    const digits = form.cardNumber.replace(/\s/g, "");
    if (!digits) e.cardNumber = "Please enter your card number.";
    else if (digits.length < 16)
      e.cardNumber = `Card number must be 16 digits (${digits.length}/16).`;

    if (!form.cvv) e.cvv = "Please enter CVV.";
    else if (form.cvv.length < 3) e.cvv = "CVV must be 3 digits.";

    if (!form.expiry) {
      e.expiry = "Please enter expiry date.";
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
      e.expiry = "Use MM/YY format (example: 08/28).";
    } else {
      const month = Number(form.expiry.slice(0, 2));
      const year = 2000 + Number(form.expiry.slice(3));
      const now = new Date();
      const expired =
        year < now.getFullYear() ||
        (year === now.getFullYear() && month < now.getMonth() + 1);
      if (expired) e.expiry = "This card has expired.";
    }
  }

  if (form.paymentMethod === "gpay") {
    const upi = form.upiId.trim();
    if (!upi) e.upiId = "Please enter your UPI ID.";
    else if (!UPI_RE.test(upi)) e.upiId = "Enter a valid UPI ID (example@okaxis).";
  }

  if (form.paymentMethod === "paypal") {
    const pp = form.paypalEmail.trim();
    if (!pp) e.paypalEmail = "Please enter your PayPal email.";
    else if (!EMAIL_RE.test(pp)) e.paypalEmail = "Enter a valid email address.";
  }

  const address = form.address.trim();
  if (!address) e.address = "Please enter your address.";
  else if (address.length < 5) e.address = "Address is too short.";

  checkName("city", "your city", 2);
  checkName("state", "your state", 2);

  if (!form.pincode) e.pincode = "Please enter your pincode.";
  else if (form.pincode.length < 6)
    e.pincode = `Pincode must be 6 digits (${form.pincode.length}/6).`;
  else if (!PIN_RE.test(form.pincode)) e.pincode = "Enter a valid pincode.";

  return e;
}

function readLocalCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

function imageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${API_BASE}${image.startsWith("/") ? "" : "/media/"}${image}`;
}

function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const cartItems = state?.items?.length ? state.items : readLocalCart();

  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [popup, setPopup] = useState(null);

  const errors = validate(form);
  const showError = (name) => (touched[name] || attempted) && errors[name];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "paymentMethod" ? value : clean(name, value),
    }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  };

  const goToLogin = () => {
    navigate("/login", { state: { items: cartItems } });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (placing) return;

    setAttempted(true);

    const firstBad = FIELD_ORDER.find((name) => errors[name]);
    if (firstBad) {
      document.querySelector(`[name="${firstBad}"]`)?.focus();
      return;
    }

    const token = localStorage.getItem("stepup_access_token");

    if (!token) {
      goToLogin();
      return;
    }

    const payload = {
      customer_name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      email: form.email.trim(),
      phone: form.phone,
      address: [
        form.address.trim(),
        form.city.trim(),
        form.state.trim(),
        form.pincode,
        form.landmark.trim(),
      ]
        .filter(Boolean)
        .join(", "),
      items: cartItems.map((item) => ({
        product: item.product_id ?? item.id,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      total_amount: subtotal,
      payment_method: paymentMap[form.paymentMethod] || "COD",
      cart_item_ids: cartItems.map((item) => item.cart_item_id).filter(Boolean),
    };

    setPlacing(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/orders/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.dispatchEvent(new Event("cartUpdated"));

      // card / CVV details confirmation page ku anuppa koodadhu
      // eslint-disable-next-line no-unused-vars
      const { cardNumber, cvv, expiry, cardHolder, ...safeForm } = form;

      const orderId = response.data.order_id;
      const isCod = ["cod", "clearpay", "klarna"].includes(form.paymentMethod);

      setPopup({
        type: "success",
        title: isCod ? "Order Confirmed!" : "Payment Successful!",
               message:
          form.paymentMethod === "cod"
            ? "Your order has been confirmed. Please pay in cash when your order is delivered."
            : isCod
            ? "Your order has been confirmed. Your first instalment will be collected as per your plan."
            : "Your payment was successful and your order has been confirmed.",
        detail: orderId ? `Order ID: ${orderId}` : "",
        buttonText: "View Order",
        closeOnOverlay: false,
        onClose: () =>
          navigate("/order-confirmation", {
            state: {
              orderId,
              form: safeForm,
              items: cartItems,
            },
          }),
      });
    } catch (error) {
      console.error("Order creation failed:", error.response?.data || error);

      if (error.response?.status === 401) {
        localStorage.removeItem("stepup_access_token");
        localStorage.removeItem("stepup_refresh_token");
        localStorage.removeItem("stepup_logged_in");

        setPopup({
          type: "error",
          title: "Session Expired",
          message: "Please log in again to place your order.",
          buttonText: "Log in",
          closeOnOverlay: false,
          onClose: goToLogin,
        });
      } else {
        setPopup({
          type: "error",
          title: "Order Failed",
          message:
            "We could not place your order right now. Please check your details and try again.",
          buttonText: "Try Again",
          onClose: () => setPopup(null),
        });
      }
    } finally {
      setPlacing(false);
    }
  };

  const field = (label, name, placeholder, options = {}) => {
    const {
      type = "text",
      maxLength,
      inputMode,
      autoComplete,
      optional = false,
    } = options;
    const error = showError(name);

    return (
      <label className="checkout-field">
        <span>
          {label}
          {optional && <em className="optional-tag"> (optional)</em>}
        </span>
        <input
          type={type}
          name={name}
          value={form[name]}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={updateField}
          onBlur={handleBlur}
          aria-invalid={error ? "true" : "false"}
        />
        {error && <small className="field-error">{errors[name]}</small>}
      </label>
    );
  };

  return (
    <main className="checkout-page">
      <button
        type="button"
        className="checkout-back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1 className="checkout-title">Checkout</h1>

      <ProgressBar currentStep={0} />

      <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
        <aside className="order-summary">
          <h2>Order Summary</h2>

          {cartItems.length === 0 && <p>Your cart is empty.</p>}

          {cartItems.map((item, index) => (
            <div
              className="summary-product"
              key={item.cart_item_id || item.id || index}
            >
              {item.image ? (
                <img
                  className="summary-product-image"
                  src={imageUrl(item.image)}
                  alt={item.name || item.title || "Product"}
                />
              ) : (
                <div className="summary-image-placeholder">👟</div>
              )}

              <div>
                <h3>{item.name || item.title || "Product"}</h3>
                <p>Size: {item.size ?? "—"}</p>
                <p>Quantity: {item.quantity || 1}</p>
                <p>Price: ₹{Number(item.price || 0).toLocaleString("en-IN")}</p>
              </div>
            </div>
          ))}

          <div className="summary-line">
            <span>Amount</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="summary-line">
            <span>Delivery Fees</span>
            <span>Free</span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
          </div>
        </aside>

        <section className="checkout-form-panel">
          <h2>Complete Your Order</h2>

          <h3>Personal Details</h3>

          <div className="checkout-fields">
            {field("First Name", "firstName", "Enter your first name", {
              autoComplete: "given-name",
            })}
            {field("Last Name", "lastName", "Enter your last name", {
              autoComplete: "family-name",
            })}
            {field("Email Id", "email", "Enter your email", {
              type: "email",
              autoComplete: "email",
            })}
            {field("Phone Number", "phone", "Enter 10-digit mobile number", {
              type: "tel",
              inputMode: "numeric",
              maxLength: 10,
              autoComplete: "tel",
            })}
          </div>

          <h3>Payment Details</h3>

          <div className="payment-options">
            {paymentMethods.map(([value, label]) => (
              <label className="payment-option" key={value}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={value}
                  checked={form.paymentMethod === value}
                  onChange={updateField}
                />

                <span className={`payment-method-logo ${value}`}>{label}</span>
              </label>
            ))}
          </div>

          {form.paymentMethod === "card" && (
            <div className="checkout-fields">
              {field("Card Holder Name", "cardHolder", "Enter name as on card", {
                autoComplete: "off",
              })}
              {field("Card Number", "cardNumber", "1234 5678 9012 3456", {
                inputMode: "numeric",
                maxLength: 19,
                autoComplete: "off",
              })}
              {field("CVV", "cvv", "3-digit CVV", {
                type: "password",
                inputMode: "numeric",
                maxLength: 3,
                autoComplete: "off",
              })}
              {field("Expiration Date", "expiry", "MM/YY", {
                inputMode: "numeric",
                maxLength: 5,
                autoComplete: "off",
              })}
            </div>
          )}

          {form.paymentMethod === "gpay" && (
            <div className="checkout-fields">
              {field("UPI ID", "upiId", "example@okaxis", {
                autoComplete: "off",
              })}
              <p className="payment-note">
                Google Pay payment will be completed securely after placing the order.
              </p>
            </div>
          )}

          {form.paymentMethod === "paypal" && (
            <div className="checkout-fields">
              {field("PayPal Email", "paypalEmail", "Enter your PayPal email", {
                type: "email",
              })}
              <p className="payment-note">
                You will continue to PayPal after placing the order.
              </p>
            </div>
          )}

        

          {form.paymentMethod === "cod" && (
            <p className="payment-note">
              Pay in cash when your order is delivered.
            </p>
          )}

          <h3>Shipping Address</h3>

          <div className="checkout-fields">
            {field("Address Line 1", "address", "Enter your address", {
              autoComplete: "street-address",
            })}
            {field("City", "city", "Enter city", {
              autoComplete: "address-level2",
            })}
            {field("State", "state", "Enter state", {
              autoComplete: "address-level1",
            })}
            {field("Landmark", "landmark", "Any landmark", {
              optional: true,
            })}
            {field("Pincode", "pincode", "Enter 6-digit pincode", {
              inputMode: "numeric",
              maxLength: 6,
              autoComplete: "postal-code",
            })}
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button type="submit" className="order-button" disabled={placing}>
              {placing ? "Placing order..." : "Order Now"}
            </button>
          </div>
        </section>
      </form>

      {popup && <PopupMessage {...popup} />}
    </main>
  );
}

export default Checkout;