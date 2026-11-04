import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "../styles/OrderConfirmation.css";
import ProgressBar from "../components/ProgressBar";
import { API_BASE } from "../config"; 

const API = `${API_BASE}`;

function imageUrl(img) {
  if (img && typeof img === "object") img = img.image || img.url || "";
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("/images/")) return img;
  return `${API}/media/${img.replace(/^\/?media\//, "").replace(/^\/+/, "")}`;
}

function OrderConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [catalog, setCatalog] = useState({});
  const [ready, setReady] = useState(false);

  // The order API only returns { product: <id>, size, quantity, price }.
  // Fetch the product list once so we can show name, brand and image.
  useEffect(() => {
    const rawItems = state?.items || [];
    const needsLookup = rawItems.some((i) => !i.name && !i.title);

    if (!needsLookup) {
      setReady(true);
      return;
    }

    fetch(`${API}/api/products/`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setCatalog(Object.fromEntries(list.map((p) => [p.id, p])));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [state]);

  const items = useMemo(
    () =>
      (state?.items || []).map((item) => {
        const nested = item.product && typeof item.product === "object" ? item.product : null;
        const id = nested ? nested.id : item.product ?? item.id;
        const p = nested || catalog[id] || {};

        return {
          ...item,
          id,
          name: item.name || item.title || item.product_name || p.name || p.title,
          brand:
            typeof item.brand === "string"
              ? item.brand
              : typeof p.brand === "string"
              ? p.brand
              : "",
          image: imageUrl(item.image || item.product_image || p.image),
          price: item.price ?? p.price,
          quantity: item.quantity ?? item.qty ?? 1,
        };
      }),
    [state, catalog]
  );

  // Save the order once the product details are ready
  useEffect(() => {
    if (!ready || !state?.orderId || !state?.form) return;

    const savedOrders = JSON.parse(localStorage.getItem("stepup_orders") || "[]");
    const index = savedOrders.findIndex((order) => order.orderId === state.orderId);

    if (index === -1) {
      savedOrders.push({
        orderId: state.orderId,
        email: state.form.email.trim().toLowerCase(),
        form: state.form,
        items,
        status: "Order Confirmed",
        date: new Date().toLocaleDateString("en-IN"),
      });
    } else {
      savedOrders[index] = { ...savedOrders[index], items };
    }

    localStorage.setItem("stepup_orders", JSON.stringify(savedOrders));
  }, [ready, state, items]);

  if (!state?.orderId || !state?.form) {
    return (
      <main className="confirmation-page">
        <section className="confirmation-card">
          <h2>Order details not found</h2>
          <button onClick={() => navigate("/womens")}>
            Continue Shopping
          </button>
        </section>
      </main>
    );
  }

  const { orderId, form } = state;
  const fullName = `${form.firstName} ${form.lastName}`.trim();

  const fullAddress = [
    form.address,
    form.landmark,
    `${form.city}, ${form.state} - ${form.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const formatPrice = (price) =>
    `₹${price.toLocaleString("en-IN")}`;

  const addProductImageToPDF = (pdf, imagePath, x, y, width = 45, height = 45) =>
    new Promise((resolve) => {
      if (!imagePath) {
        resolve();
        return;
      }

      const image = new Image();
      image.crossOrigin = "anonymous";

      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;

          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);

          const imageData = canvas.toDataURL("image/png");
          pdf.addImage(imageData, "PNG", x, y, width, height);
        } catch (error) {
          console.error("Could not add product image to PDF:", error);
        }

        resolve();
      };

      image.onerror = () => resolve();
      image.src = imagePath;
    });

  const handleBillDownload = async () => {
    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text("StepUp.in", 20, 20);

    pdf.setFontSize(16);
    pdf.text("Order Bill", 20, 35);

    pdf.setFontSize(11);
    pdf.text(`Order ID: ${orderId}`, 20, 50);
    pdf.text(`Customer: ${fullName}`, 20, 60);
    pdf.text(`Email: ${form.email}`, 20, 70);
    pdf.text(`Phone: ${form.phone}`, 20, 80);

    let y = 95;

    for (const product of items) {
      if (y > 240) {
        pdf.addPage();
        y = 20;
      }

      await addProductImageToPDF(pdf, product.image, 20, y, 35, 35);

      const productName = product.name || product.title || "Product";
      const quantity = Number(product.quantity || 1);
      const price = Number(product.price || 0);
      const itemTotal = price * quantity;

      pdf.text(`Product: ${productName}`, 65, y + 5);
      pdf.text(`Size: ${product.size || "-"}`, 65, y + 15);
      pdf.text(`Quantity: ${quantity}`, 65, y + 25);
      pdf.text(`Price: Rs. ${itemTotal.toLocaleString("en-IN")}`, 65, y + 35);

      y += 50;
    }

    if (y > 220) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(`Subtotal: Rs. ${subtotal.toLocaleString("en-IN")}`, 20, y + 5);
    pdf.text("Shipping: FREE", 20, y + 15);
    pdf.text(`Total Amount: Rs. ${subtotal.toLocaleString("en-IN")}`, 20, y + 25);

    pdf.text("Delivery Address:", 20, y + 45);
    pdf.text(pdf.splitTextToSize(fullAddress, 170), 20, y + 55);

    pdf.save(`${orderId}-bill.pdf`);
  };

  return (
    <main className="confirmation-page">
      <section className="confirmation-card">
        <div className="confirmation-success-icon">✓</div>
        <ProgressBar currentStep={2} />
        <h1>Order Confirmed!</h1>
        <p className="confirmation-message">Thank you for your order.</p>

        <div className="confirmation-order-id">
          <span>Order ID</span>
          <strong>{orderId}</strong>
        </div>

        <section className="confirmation-box">
          <h2>Order Summary</h2>

          {items.map((item, index) => (
            <div
              className="confirmation-product"
              key={`${item.id}-${index}`}
            >
              <img
                className="confirmation-product-image"
                src={item.image}
                alt={item.name || item.title || "Product"}
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />

              <div>
                <h3>{item.brand || "StepUp.in"}</h3>
                <p>{item.name || item.title || "Product"}</p>
                <p>Size: {item.size || "—"}</p>
                <p>Quantity: {item.quantity || 1}</p>
              </div>

              <strong>
                {formatPrice(
                  Number(item.price || 0) * Number(item.quantity || 1)
                )}
              </strong>
            </div>
          ))}

          <div className="confirmation-total-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="confirmation-total-row">
            <span>Shipping</span>
            <strong>FREE</strong>
          </div>

          <div className="confirmation-grand-total">
            <span>Total Amount</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
        </section>

        <section className="confirmation-box">
          <h2>📍 Delivery Address</h2>
          <p><strong>{fullName}</strong></p>
          <p>{form.phone}</p>
          <p>{form.email}</p>
          <p>{form.address}</p>
          {form.landmark && <p>{form.landmark}</p>}
          <p>{form.city}, {form.state} - {form.pincode}</p>
        </section>

        <p className="confirmation-delivery-note">
          Estimated delivery: 5–7 business days
        </p>

        <div className="confirmation-actions">
          <button
            className="confirmation-primary-button"
            onClick={handleBillDownload}
          >
            📄 Go to Bill Download
          </button>

          <button
            className="confirmation-outline-button"
            onClick={() =>
              navigate("/track-order", {
                state: {
                  orderId,
                  form,
                  items: items[0] ? [items[0]] : [],
                },
              })
            }
          >
            📦 Track Order
          </button>

          <button
            className="confirmation-outline-button"
            onClick={() => navigate("/womens")}
          >
            Continue Shopping
          </button>
        </div>
      </section>
    </main>
  );
}

export default OrderConfirmation;