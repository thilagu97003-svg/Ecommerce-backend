import { useEffect, useState } from "react";
import "../styles/ProductDetails.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PopupMessage from "../components/PopupMessage";
import { API_BASE } from "../config"; 

const COLOR_NAMES = [
  ["Black", "#111111"], ["White", "#ffffff"], ["Grey", "#888888"], ["Silver", "#c0c0c0"],
  ["Brown", "#704b45"], ["Tan", "#c49a76"], ["Beige", "#e6d1a8"], ["Navy", "#203d5b"],
  ["Blue", "#2e6fd1"], ["Red", "#e53935"], ["Pink", "#f48fb1"], ["Purple", "#9b7be0"],
  ["Green", "#4caf50"], ["Yellow", "#ffeb3b"], ["Orange", "#ff9800"],
];

function colorName(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex || "")) return "";
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r, g, b] = rgb(hex);
  let best = COLOR_NAMES[0][0];
  let min = Infinity;
  for (const [name, code] of COLOR_NAMES) {
    const [r2, g2, b2] = rgb(code);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < min) {
      min = d;
      best = name;
    }
  }
  return best;
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isMenProduct = location.pathname.startsWith("/men/product/");
  const isKidsProduct = location.pathname.startsWith("/kids/product/");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/products/`)
      .then((res) => {
        const found = res.data.find((item) => item.id === Number(id));

        if (found) {
          const desc = found.description || "";
          const ratingMatch = desc.match(/Rating:\s*(\d)/);
          const colorMatch = desc.match(/#[0-9a-fA-F]{6}/g);

          setProduct({
            ...found,
            rating: ratingMatch ? Number(ratingMatch[1]) : 4,
            colors: colorMatch || ["#17294D", "#111111"],
          });
        } else {
          setProduct(null);
        }
      })
      .catch((error) => {
        console.error("Product fetch error:", error);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="product-details-page">Loading product...</main>;
  }

  if (!product) {
    return (
      <main className="product-details-page">
        <h2>Product not found</h2>
        <button
          onClick={() =>
            navigate(isKidsProduct ? "/kids" : isMenProduct ? "/mens" : "/womens")
          }
        >
          Back to {isKidsProduct ? "Kids" : isMenProduct ? "Mens" : "Womens"}
        </button>
      </main>
    );
  }

  const colors = product.colors || [];
  const activeColor = colors[0] || "";
  const imageUrl = !product.image
    ? ""
    : product.image.startsWith("http")
    ? product.image
    : `${API_BASE}/media/${product.image.replace(/^\/?media\//, "")}`;

  const closePopup = () => setPopup(null);

  const askSize = () =>
    setPopup({
      type: "error",
      title: "Select a Size",
      message: "Please select a shoe size before continuing.",
      buttonText: "OK",
      onClose: closePopup,
    });

  // login illama Add to Cart / Buy Now kuduthaa
  const askLogin = (text, items) =>
    setPopup({
      type: "info",
      title: "Login Required",
      message: text,
      buttonText: "Log in",
      secondaryText: "Not now",
      closeOnOverlay: false,
      onSecondary: closePopup,
      onClose: () =>
        navigate("/login", {
          state: items ? { items } : { returnTo: location.pathname },
        }),
    });

  const handleAddToCart = async () => {
    if (!selectedSize) {
      askSize();
      return;
    }

    const token = localStorage.getItem("stepup_access_token");

    if (!token) {
      askLogin("Please log in to add items to your cart.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/cart/add/`,
        {
          product_id: product.id,
          size: String(selectedSize),
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find(
        (item) => item.id === product.id && String(item.size) === String(selectedSize)
      );

      if (existing) {
        existing.quantity = (existing.quantity || 1) + quantity;
      } else {
        cart.push({
          ...product,
          image: imageUrl,
          color: activeColor,
          size: selectedSize,
          quantity,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));

      setPopup({
        type: "success",
        title: "Added to Cart!",
        message: "Your product has been added to the cart successfully.",
        detail: `${product.name} · Size ${selectedSize} · Qty ${quantity}`,
        buttonText: "Go to Cart",
        secondaryText: "Continue Shopping",
        onSecondary: closePopup,
        onClose: () => navigate("/cart"),
      });
    } catch (error) {
      console.error(
        "Add to cart failed:",
        error.response?.status,
        error.response?.data
      );

      if (
        error.response?.status === 401 ||
        error.response?.data?.code === "token_not_valid"
      ) {
        localStorage.removeItem("stepup_access_token");
        localStorage.removeItem("stepup_refresh_token");
        localStorage.removeItem("stepup_logged_in");

        setPopup({
          type: "info",
          title: "Session Expired",
          message: "Your login session has expired. Please log in again.",
          buttonText: "Log in",
          closeOnOverlay: false,
          onClose: () =>
            navigate("/login", { state: { returnTo: location.pathname } }),
        });
        return;
      }

      setPopup({
        type: "error",
        title: "Could Not Add to Cart",
        message:
          error.response?.data?.detail ||
          "Something went wrong. Please try again.",
        buttonText: "OK",
        onClose: closePopup,
      });
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      askSize();
      return;
    }

    const checkoutItem = {
      ...product,
      image: imageUrl,
      color: activeColor,
      size: selectedSize,
      quantity,
    };

    const token = localStorage.getItem("stepup_access_token");

    if (!token) {
      askLogin("Please log in to continue with your purchase.", [checkoutItem]);
      return;
    }

    navigate("/checkout", { state: { items: [checkoutItem] } });
  };

  return (
    <main className="product-details-page">
      <button className="details-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-details-layout">
        {/* Left Side: Product Image & Product Description */}
        <div className="product-details-gallery">
          <div className="details-image-box">
            <img src={imageUrl} alt={product.name} />
          </div>
        </div>

        {/* Right Side: Product Info & Actions */}
        <section className="product-details-info">
          <h1>{product.name}</h1>

          <p className="details-rating">
            {"★".repeat(product.rating)}
            <span>{"★".repeat(5 - product.rating)}</span>
            <small>({product.rating}/5 reviews)</small>
          </p>

          <h2>MRP: ₹{Number(product.price).toLocaleString("en-IN")}</h2>

          {/* Color: display only current item color */}
          <div className="details-color-row">
            <span className="details-color-label">
              <strong>Color :</strong> {colorName(activeColor) || "Tan"}
            </span>
          </div>

          <hr />

          <p className="details-size-title">Shoe Size</p>
          <div className="details-sizes">
            {[4, 5, 6, 7, 8, 9].map((size) => (
              <button
                key={size}
                type="button"
                className={selectedSize === size ? "selected" : ""}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <hr />

          <p className="details-quantity">Quantity</p>
          <div className="details-quantity-control">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <hr />

          <div className="details-actions">
            <button className="details-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="details-buy-btn" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </section>
      </div>

      <section className="details-description-box full-width">
        <h3>Product Details</h3>
        <p className="details-description">
          The Harlan men's boat shoes from Comfy Steps are perfect for your casual
          summer outings. Featuring a tan upper with navy blue accents and intricate
          white stitching, these shoes offer a trendy look. The twin elasticated
          gussets and lace-up fastening ensure a quick and secure fit, while the
          gripped outsole provides stability and security.
        </p>
      </section>

      <section className="details-reviews"></section>

      <section className="details-reviews">
        <h2>Reviews:</h2>

        {[1, 2].map((review) => (
          <article className="details-review-card" key={review}>
            <div className="review-left">
              <div className="review-user">
                <img
                  className="review-avatar"
                  src={`/images/avatar${review}.png`}
                  alt="Reviewer avatar"
                />
                <div>
                  <strong>Reviewed by Beverley</strong>
                  <p>From: Weymouth</p>
                </div>
              </div>

              {["Fit", "Comfort", "Value for Money", "Quality"].map((item) => (
                <p className="review-rating" key={item}>
                  <span>{item}</span>
                  <span className="review-stars">★★★★★</span>
                </p>
              ))}
            </div>

            <div className="review-right">
              <strong>Super Looking</strong>
              <p>Overall rating <span className="review-stars">★★★★★</span></p>
              <p>
                Very pleased with the super fast delivery and packaging.
                Shoes are very good quality and superb. See more...
              </p>
              <small>Beverley would recommend this product <span>✔</span></small>
            </div>
          </article>
        ))}
      </section>

      {popup && <PopupMessage {...popup} />}
    </main>
  );
}

export default ProductDetails;