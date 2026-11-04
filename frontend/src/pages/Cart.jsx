import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Trash2, Truck } from "lucide-react";
import axios from "axios";
import "../styles/Cart.css";
import { API_BASE } from "../config"; 

const SIZES = [4, 5, 6, 7, 8, 9, 10, 11, 12];
const QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function useDayCountdown() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const total = Math.max(0, Math.floor((end - now) / 1000));
    return {
      h: Math.floor(total / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60,
    };
  };

  const [left, setLeft] = useState(calc);

  useEffect(() => {
    const timer = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, []);

  return left;
}

function splitName(item) {
  if (item.brand) return [item.brand, item.name || ""];
  const words = (item.name || "").split(" ");
  return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
}

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const left = useDayCountdown();

  const handleProceedToCheckout = (item) => {
    const items = item ? [item] : cart;
    const hasToken = Boolean(localStorage.getItem("stepup_access_token"));

    navigate(hasToken ? "/checkout" : "/login", { state: { items } });
  };

  const loadCart = async () => {
    const token = localStorage.getItem("stepup_access_token");

    if (!token) {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(localCart);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/api/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const items = response.data.items || [];
      setCart(items);
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (error) {
      console.error("Cart load failed:", error.response?.data || error);
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(localCart);
    }
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => loadCart();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);
  const saveLocal = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const updateQuantity = async (index, newQuantity) => {
    const item = cart[index];
    const token = localStorage.getItem("stepup_access_token");

    saveLocal(
      cart.map((c, i) => (i === index ? { ...c, quantity: newQuantity } : c))
    );

    if (token && item.cart_item_id) {
      try {
        await axios.patch(
          `${API_BASE}/api/cart/${item.cart_item_id}/`,
          { quantity: Number(newQuantity) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error(
          "Quantity update failed in backend:",
          error.response?.status,
          error.response?.data || error
        );
        return;
      }
    }

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateSize = async (index, newSize) => {
    const item = cart[index];
    const token = localStorage.getItem("stepup_access_token");

    saveLocal(
      cart.map((c, i) => (i === index ? { ...c, size: String(newSize) } : c))
    );

    if (token && item.cart_item_id) {
      try {
        await axios.patch(
          `${API_BASE}/api/cart/${item.cart_item_id}/`,
          { size: String(newSize) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error(
          "Size update failed in backend:",
          error.response?.status,
          error.response?.data || error
        );
        return;
      }
    }

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = async (item, index) => {
    const token = localStorage.getItem("stepup_access_token");

    saveLocal(cart.filter((_, i) => i !== index));

    if (token && item.cart_item_id) {
      try {
        await axios.delete(
          `${API_BASE}/api/cart/${item.cart_item_id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error(
          "Remove item failed in backend:",
          error.response?.status,
          error.response?.data || error
        );
        return;
      }
    }

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const formatPrice = (price) => `₹ ${Number(price).toLocaleString("en-IN")}`;

  return (
    <main className="cart-page">
      <h1 className="cart-title">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <p>Your shopping cart is empty.</p>
          <button onClick={() => navigate("/mens")}>Continue Shopping</button>
        </div>
      ) : (
        <>
          <div className="cart-bar">
            <strong>Free &amp; Fast arriving by Monday</strong>
            <span>
              Order within {left.h} hours,{left.m} minutes,{left.s} seconds
            </span>
          </div>

          <section aria-label="Shopping cart">
            {cart.map((item, index) => {
              const [brand, productName] = splitName(item);
              const quantity = Number(item.quantity || 1);

              return (
                <article
                  className="cart-item"
                  key={item.cart_item_id || item.id || index}
                >
                  {item.image ? (
                    <img
                      className="ci-img"
                      src={
                        item.image.startsWith("http")
                          ? item.image
                          : `${API_BASE}${item.image}`
                      }
                      alt={item.name || "Product"}
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                  ) : (
                    <div className="ci-img ci-img-empty" />
                  )}

                  <div className="ci-info">
                    <h3 className="ci-brand">{brand}</h3>
                    <p className="ci-name">{productName}</p>
                    <p className="ci-price">MRP{formatPrice(item.price || 0)}</p>
                  </div>

                  <div className="ci-selects">
                    <select
                      className="ci-select"
                      value={item.size || "8"}
                      onChange={(event) => updateSize(index, event.target.value)}
                      aria-label={`Select size for ${item.name}`}
                    >
                      {SIZES.map((size) => (
                        <option key={size} value={size}>
                          Size ({size})
                        </option>
                      ))}
                    </select>

                    <select
                      className="ci-select"
                      value={quantity}
                      onChange={(event) =>
                        updateQuantity(index, Number(event.target.value))
                      }
                      aria-label={`Select quantity for ${item.name}`}
                    >
                      {QUANTITIES.map((q) => (
                        <option key={q} value={q}>
                          Quantity ({q})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="ci-remove"
                    onClick={() => removeItem(item, index)}
                  >
                    Remove <Trash2 size={20} />
                  </button>
                </article>
              );
            })}
          </section>

          <section className="cs-rows" aria-label="Order summary">
            <div className="cs-row">
              <span>Summary</span>
            </div>
            <div className="cs-row">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="cs-row">
              <span>Delivery</span>
              <span>Free</span>
            </div>

            <a className="cs-info" href="#delivery-info" onClick={(e) => e.preventDefault()}>
              Delivery &amp; return information <Truck size={22} />
            </a>
          </section>

          <button
            type="button"
            className="cs-checkout"
            onClick={() => handleProceedToCheckout()}
          >
            <Lock size={20} /> Checkout Securely
          </button>
        </>
      )}
    </main>
  );
}

export default Cart;