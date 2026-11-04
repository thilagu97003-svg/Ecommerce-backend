import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MyOrders.css";
import { API_BASE } from "../config"; 

function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  useEffect(() => {
    const token = localStorage.getItem("stepup_access_token");

    if (!token) {
      // Fallback: local storage
      const localOrders = JSON.parse(localStorage.getItem("stepup_orders") || "[]");
      setOrders(localOrders);
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE}/api/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const orderList = Array.isArray(res.data) ? res.data : res.data.orders || [];
        setOrders(orderList);
      })
      .catch((err) => {
        console.warn("Backend orders fetch error, falling back to local:", err);
        const localOrders = JSON.parse(localStorage.getItem("stepup_orders") || "[]");
        setOrders(localOrders);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <section className="my-orders-page"><p>Loading your orders...</p></section>;
  }

  return (
    <section className="my-orders-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <>
          <p>No orders found yet.</p>
          <Link to="/womens">Continue Shopping</Link>
        </>
      ) : (
        orders.map((order) => {
          const orderId = order.order_id || order.orderId || order.id;
          const status = order.status || "Order Confirmed";
          const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : order.date;

          return (
            <article className="my-order-card" key={orderId}>
              <h2>Order ID: {orderId}</h2>
              <p>Order Date: {orderDate}</p>
              <p>
                Status: <strong style={{ color: "#015733" }}>{status}</strong>
              </p>

              {(order.items || []).map((item, index) => (
                <p key={index}>
                  {item.product_name || item.name || "Product"} — Qty: {item.quantity || 1} —{" "}
                  {formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
                </p>
              ))}

              <p>
                <strong>Total: {formatPrice(order.total_amount || order.total)}</strong>
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/track-order", {
                    state: {
                      orderId: orderId,
                      status: status,
                      items: order.items || [],
                    },
                  })
                }
              >
                Track Order
              </button>
            </article>
          );
        })
      )}
    </section>
  );
}

export default MyOrders;