import { useNavigate } from "react-router-dom";
import "../styles/Womens.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config"; 


function Womens() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const womensCardDetails = [
  { name: "Lamar Tan Women’s Lace Sandal", rating: 5, colors: ["#c49a76", "#111111"] },
  { name: "Lilley White Diamante Slip-On Shoe", rating: 4, colors: ["#ffffff", "#d8c8b8"] },
  { name: "Softlines Navy Sandal", rating: 3, colors: ["#203d5b", "#111111"] },
  { name: "Shoezone Floral Beach Mule", rating: 3, colors: ["#426c9b", "#e9b5c7"] },
  { name: "Ophelia Women’s Silver Heel", rating: 5, colors: ["#c0c0c0", "#d8b6c0"] },
  { name: "Lilley Women’s Patent Shoe", rating: 4, colors: ["#222222", "#704b45"] },
  { name: "Noelle Mesh Bow Ballerinas", rating: 3, colors: ["#33201a", "#b99b7d"] },
  { name: "Stella Flat Embellished Slides", rating: 5, colors: ["#c8a16b", "#ffffff"] },
  { name: "Olivia Pencil Heels", rating: 4, colors: ["#111111", "#b8a28b"] },
  { name: "Amelia Kitten Heels", rating: 2, colors: ["#e6d1a8", "#111111"] },
  { name: "Beckett Sandals", rating: 5, colors: ["#b9a18a", "#ffffff"] },
  { name: "Glamo Flat Black Sandals", rating: 3, colors: ["#111111", "#c49a76"] },
];
useEffect(() => {
  fetch(`${API_BASE}/api/products/`)
    .then((response) => response.json())
    .then((data) => {
      const womensProducts = data
        .filter((product) => product.category === "Womens")
        .map((product) => {
          const details = womensCardDetails.find((item) => item.name === product.name);
          const desc = product.description || "";
          const ratingMatch = desc.match(/Rating:\s*(\d)/);
          const colorMatch = desc.match(/#[0-9a-fA-F]{6}/g);

          return {
            ...product,
            price: Number(product.price),
            image: product.image
              ? product.image.startsWith("http")
                ? product.image
                : `${API_BASE}/media/${product.image.replace(/^\/?media\//, "")}`
              : "",
            rating: details?.rating ?? (ratingMatch ? Number(ratingMatch[1]) : 4),
            colors: details?.colors ?? colorMatch ?? ["#17294D", "#111111"],
          };
        });

      setProducts(womensProducts);
    })
    .catch((error) => console.error("Products load failed:", error));
}, []);

  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState("all");
  const [selectedColors, setSelectedColors] = useState({});
  const [visibleCount, setVisibleCount] = useState(Infinity);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  let filteredProducts = products.filter(
    (product) =>
      maxPrice === "all" || product.price <= Number(maxPrice)
  );

  if (sortBy === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "new") {
    filteredProducts.sort((a, b) => b.id - a.id);
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const addToCart = async (product) => {
    const token = localStorage.getItem("stepup_access_token");

    // 1. LocalStorage update (frontend instant update-kku)
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1, size: "9" });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    // 2. Token irundha Django backend database-kku live sync aagum
    if (token) {
      try {
        await axios.post(
          `${API_BASE}/api/cart/add/`,
          {
            product_id: product.id,
            size: "9",
            quantity: 1,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Backend add to cart failed:", error.response?.data || error);
      }
    }

    alert(`${product.name} added to cart!`);
  };

  const buyNow = (product) => {
    addToCart(product);
    navigate("/cart");
  };

  return (
    <main className="womens-page">

      {/* Back button */}
      <button
        className="women-back"
        onClick={() => navigate("/")}
      >
        ← Back
      </button>

      {/* Filter and Sort toolbar */}
      <div className="women-toolbar">

        <div className="women-filter">

          <button
            type="button"
            className="women-filter-toggle"
            onClick={() => setShowPriceFilter(!showPriceFilter)}
          >
            Filters {showPriceFilter ? "⬅" : "➜"}
          </button>

          {showPriceFilter && (
            <div className="women-filter-options">

              {/* Style */}
              <select defaultValue="">
                <option value="" disabled>Style</option>
                <option>New Arrivals</option>
                <option>Sandals</option>
                <option>Trainers</option>
                <option>Boots</option>
                <option>Slippers</option>
                <option>Canvas</option>
                <option>Summer Shop</option>
              </select>

              {/* Size */}
              <select defaultValue="">
                <option value="" disabled>Size</option>
                <option>Junior</option>
                <option>UK3</option>
                <option>UK4</option>
                <option>UK5</option>
                <option>UK6</option>
                <option>UK7</option>
                <option>UK8</option>
                <option>UK9</option>
              </select>

              {/* Brands */}
              <select defaultValue="">
                <option value="" disabled>Brands</option>
                <option>Beckett</option>
                <option>Comfy Steps</option>
                <option>Kickers</option>
                <option>Lambert</option>
                <option>Marvel</option>
                <option>Skechers</option>
                <option>Totes</option>
              </select>

              {/* Color */}
<div className="women-color-filter">
 <button
  type="button"
  className="women-color-filter-toggle"
  onClick={() => setShowColorOptions(!showColorOptions)}
>
  Color <span className="color-arrow"></span>
</button>

  {showColorOptions && (
    <div className="women-color-options">
      {[
        { name: "Black", code: "#000000" },
        { name: "Blue", code: "#2196F3" },
        { name: "Orange", code: "#ff5722" },
        { name: "Green", code: "#4caf50" },
        { name: "Brown", code: "#795548" },
        { name: "White", code: "#ffffff" },
        { name: "Yellow", code: "#ffeb3b" },
        { name: "Red", code: "#f44336" },
        { name: "Grey", code: "#9e9e9e" },
      ].map((color) => (
        <button
          type="button"
          key={color.name}
          className="women-color-option"
        >
          <span style={{ backgroundColor: color.code }}></span>
          {color.name}
        </button>
      ))}
    </div>
  )}
</div>

            </div>
          )}

        </div>

        <div className="women-sort-container">
  <button
    type="button"
    className="women-sort"
    onClick={() => setShowSortOptions(!showSortOptions)}
  >
    Sort by

    <span className="sort-arrow">
      {showSortOptions ? "⌃" : "⌄"}
    </span>
  </button>

  {showSortOptions && (
    <div className="women-sort-dropdown">
      {[
        { value: "featured", label: "Featured" },
        { value: "new", label: "New Arrivals" },
        { value: "low", label: "Price: Low–High" },
        { value: "high", label: "Price: High–Low" },
        { value: "rating", label: "Overall Rating" },
      ].map((option) => (
        <button
          type="button"
          key={option.value}
          onClick={() => {
            setSortBy(option.value);
            setShowSortOptions(false);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )}
</div>

      </div>

      {/* Product cards */}
      <section className="women-product-grid">
        {filteredProducts.slice(0, visibleCount).map((product) => (
          <article
            className="women-product-card"
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
          >

            <div className="women-image-box">
              <img
src={product.image}
  alt={product.name}
  onError={(e) => {
    e.currentTarget.style.visibility = "hidden";
  }}
/>
            </div>

            <div className="women-product-info">
              <h3>{product.name}</h3>

              <div className="women-rating" aria-label={`Rated ${product.rating} out of 5`}>
  {"★".repeat(product.rating)}
  <span className="empty-stars">
    {"★".repeat(5 - product.rating)}
  </span>
</div>

              <p className="women-price">
                MRP: ₹{product.price.toLocaleString("en-IN")}
              </p>

              <div className="women-colors">
                <span>Color</span>

                {product.colors.map((color, index) => (
                  <button
                    key={color}
                    className={`women-color ${
                      selectedColors[product.id] === color ||
                      (!selectedColors[product.id] && index === 0)
                        ? "selected"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Choose color ${color}`}
                    onClick={() =>
                      setSelectedColors((prev) => ({
                        ...prev,
                        [product.id]: color,
                      }))
                    }
                  />
                ))}
              </div>

              <div className="women-product-actions">
  <button
    className="women-buy-btn"
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/product/${product.id}`);
    }}
  >
    Buy
  </button>

  <button
    className="women-cart-btn"
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/product/${product.id}`);
    }}
  >
    Add to Cart
  </button>
</div>
              </div>
            
          </article>
        ))}
      </section>

      {filteredProducts.length === 0 && (
        <p className="women-empty">
          No products match this price filter.
        </p>
      )}

      
        <div className="women-view-all">
          <button onClick={() => setVisibleCount(products.length)}>
            View All
          </button>
        </div>
      

    </main>
  );
}

export default Womens;
