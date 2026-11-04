import { useNavigate } from "react-router-dom";
import "../styles/Womens.css";
import { useEffect, useState } from "react";
import { API_BASE } from "../config"; 


const KidsCardDetails = [
  { id: 1, name: "Whitney Girls White Multi Marble EVA Clog", price: 2799, rating: 4, colors: ["#e8b8f0", "#ffffff"] },
  { id: 2, name: "Walkright Claudia Girls Blue Fasten Canvas", price: 3199, rating: 4, colors: ["#6b9cc4", "#ffffff"] },
  { id: 3, name: "Walkright Girls Pink Polka Dot Canvas", price: 3499, rating: 5, colors: ["#f48fb1", "#ffffff"] },
  { id: 4, name: "Walkright Girls Multi-T Bar Sandal", price: 4799, rating: 4, colors: ["#e8c9f4", "#ffffff"] },
  { id: 5, name: "The Slipper Company Cherish Girls Pink Bootie", price: 2699, rating: 4, colors: ["#f5c4e0", "#ffffff"] },
  { id: 6, name: "LOL Surprise Kids Fasten Slipper", price: 2799, rating: 5, colors: ["#ec238c", "#ffffff"] },
  { id: 7, name: "Bluey Kids Blue Easy Fasten Slipper", price: 4999, rating: 4, colors: ["#73b7ed", "#ffffff"] },
  { id: 8, name: "Spider-Man Kids Red Light Up Trainer", price: 5799, rating: 5, colors: ["#18365d", "#e53935"] },
  { id: 9, name: "Disney Stitch Pink Round Kids EVA Clog", price: 3999, rating: 4, colors: ["#c6a9e8", "#f5b9d5"] },
  { id: 10, name: "Disney Frozen Purple Strap Sandal", price: 5999, rating: 5, colors: ["#9b7be0", "#ffffff"] },
  { id: 11, name: "Shoeszone Short Kids Black Welly Size 1 to 6", price: 3999, rating: 4, colors: ["#222222", "#555555"] },
  { id: 12, name: "Shoeszone Kids Unicorn Welly", price: 3999, rating: 5, colors: ["#6d4c9b", "#ec8cc4"] },
];

function Kids() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

useEffect(() => {
  fetch(`${API_BASE}/api/products/`)
    .then((res) => res.json())
    .then((data) => {
      const kids = data
        .filter((p) => p.category === "Kids")
        .map((p) => {
          const local = KidsCardDetails.find((k) => k.name === p.name);
          return {
            ...p,
            price: Number(p.price),
            image: p.image
              ? p.image.startsWith("http")
                ? p.image
                : `${API_BASE}/media/${p.image.replace(/^\/?media\//, "")}`
              : local
              ? `/images/kids${local.id}.png`
              : "",
            rating: 4,
            colors: ["#17294D", "#111111", "#A6A6A6"],
          };
        });
      setProducts(kids);
    })
    .catch((err) => console.error("Products load failed:", err));
}, []);

  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState("all");
  const [selectedColors, setSelectedColors] = useState({});
  const [visibleCount, setVisibleCount] = useState(Infinity);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  let filteredProducts = [...products].filter(
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

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
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
  onClick={() => navigate(`/kids/product/${product.id}`)}
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
    navigate(`/kids/product/${product.id}`);
  }}
>
  Buy
</button>

                <button
                  className="women-cart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/kids/product/${product.id}`);
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

export default Kids;
