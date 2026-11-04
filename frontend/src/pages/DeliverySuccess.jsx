import { useLocation, useNavigate } from "react-router-dom";
import "../styles/DeliverySuccess.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config"; 

function DeliverySuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const orderId = state?.orderId || "10";
  const rawProduct = state?.items?.[0] || null;

  const [productDetails, setProductDetails] = useState(rawProduct);

  useEffect(() => {
    // Product ID check (state-la 'product' field-la ID varum e.g. 13)
    const productId = rawProduct?.product || rawProduct?.id;

    if (productId && (!rawProduct?.image || !rawProduct?.name)) {
      // Backend API-la irundhu image and name fetch pannurom
      axios
        .get(`${API_BASE}/api/products/${productId}/`)
        .then((res) => {
          setProductDetails((prev) => ({
            ...prev,
            ...res.data,
            name: res.data.name,
            image: res.data.image,
          }));
        })
        .catch((err) => {
          console.error("Could not fetch product details:", err);
        });
    }

    // Clear item from local cart if delivered
    if (rawProduct) {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCart = cart.filter(
        (item) => !(item.id === productId && item.size === rawProduct.size)
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }, [rawProduct]);

  // Image URL helper (full localhost URL convert panna)
  const resolveImage = (img) => {
    if (!img) return "/images/trending1.jpg";
    if (img.startsWith("http")) return img;
    return `${API_BASE}${img.startsWith("/") ? "" : "/media/"}${img.replace(/^\/?media\//, "")}`;
  };

  return (
    <main className="delivery-success-page">
      <section className="delivery-success-card">
        <button
          className="delivery-success-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="delivery-success-check">✓</div>
        <h1>Delivered Successfully!</h1>

        <p className="delivery-success-message">
          Your order has been delivered. Thank you for shopping with StepUp.in!
        </p>

        <p className="delivery-success-order-id">
          Order ID: <strong>{orderId}</strong>
        </p>

        <div className="delivery-success-product">
          <img
            src={resolveImage(productDetails?.image)}
            alt={productDetails?.name || "Ordered product"}
            className="delivery-success-product-image"
            onError={(e) => {
              e.currentTarget.src = "/images/men1.png";
            }}
          />

          <div className="delivery-success-product-info">
            <h2>{productDetails?.name || "Comfortable Footwear"}</h2>
            <p>Size: {productDetails?.size ?? "8"}</p>
            <p>Quantity: {productDetails?.quantity ?? 1}</p>
          </div>
        </div>

        <div className="delivery-success-actions">
          <button
            className="delivery-success-shop-button"
            onClick={() => navigate("/mens")}
          >
            Continue Shopping
          </button>

          <button
            className="delivery-success-details-button"
            onClick={() =>
              navigate("/order-confirmation", {
                state: {
                  orderId,
                  form: state?.form,
                  items: productDetails ? [productDetails] : [],
                },
              })
            }
          >
            View Order Details
          </button>
        </div>
      </section>
    </main>
  );
}

export default DeliverySuccess;