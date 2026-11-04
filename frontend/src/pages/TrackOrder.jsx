import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/TrackOrder.css";
import { API_BASE } from "../config"; 

function TrackOrder() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [orderId, setOrderId] = useState(state?.orderId || null);
  const [orderStatus, setOrderStatus] = useState(state?.status || "Loading...");
  const [trackError, setTrackError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("stepup_access_token");

    const getOrderStatus = async () => {
      try {
        let currentId = orderId;

        // Oruvelai refresh panninaal latest order ID edukkum
        if (!currentId) {
          const listRes = await axios.get(`${API_BASE}/api/orders/`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          const orders = Array.isArray(listRes.data)
            ? listRes.data
            : listRes.data.orders || [];

          if (orders.length > 0) {
            currentId = orders[0].id;
            setOrderId(currentId);
          } else {
            setTrackError("No active orders found.");
            return;
          }
        }

        // Live status fetch from backend
        const res = await axios.get(
          `${API_BASE}/api/orders/${currentId}/`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const status = res.data.status;
        setOrderStatus(status);

        if (status === "Delivered") {
          navigate("/delivery-success", {
            state: {
              orderId: currentId,
              items: res.data.items || state?.items || [],
              form: state?.form,
            },
          });
        }
      } catch (err) {
        console.error("Track status error:", err);
      }
    };

    getOrderStatus();
    const interval = setInterval(getOrderStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId, navigate, state]);

  // Admin status matches: Pending (0), Confirmed (1), Shipped (2), Delivered (3)
  const statusList = ["Pending", "Confirmed", "Shipped", "Delivered"];
  const currentStage = statusList.indexOf(orderStatus);

  const stages = [
    {
      title: "Order Placed",
      description: "We have received your order.",
      icon: "🛒",
      done: currentStage >= 0,
    },
    {
      title: "Order Confirmed",
      description: "Your order is confirmed.",
      icon: "📦",
      done: currentStage >= 1,
    },
    {
      title: "Order Dispatched",
      description: "Your order has been dispatched.",
      icon: "🚚",
      done: currentStage >= 2,
    },
    {
      title: "Delivered",
      description: "Your order will be delivered to your address.",
      icon: "✓",
      done: currentStage >= 3,
    },
  ];

  return (
    <main className="track-order-page">
      <section className="track-order-card">
        <h1>Track Your Order</h1>

        <p className="track-order-id">
          Order ID: <strong>{orderId || "Loading..."}</strong>
        </p>

        {trackError && <p className="track-error">{trackError}</p>}

        <p className="track-current-status">
          Current status: <strong>{orderStatus}</strong>
        </p>

        <div className="track-steps-list">
          {stages.map((stage, index) => (
            <div
              className={`track-step-row ${stage.done ? "active" : ""}`}
              key={index}
            >
              <div className="track-icon-col">
                <span className="track-step-circle">{stage.icon}</span>
                {index < stages.length - 1 && <span className="track-vertical-line" />}
              </div>

              <div className="track-text-col">
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="track-continue-btn"
          onClick={() => navigate("/mens")}
        >
          Continue Shopping
        </button>
      </section>
    </main>
  );
}

export default TrackOrder;