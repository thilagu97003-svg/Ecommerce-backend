
import { useNavigate } from "react-router-dom";
import "../styles/Womens.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config"; 


function Mens() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
   const MensCardDetails = [
  { id: 1, name: "Comfy Steps White Strap Sandal", price: 1999, rating: 4, colors: ["#ffffff", "#111111"] },
  { id: 2, name: "Hush Puppies Tan Boat Shoe", price: 2799, rating: 5, colors: ["#b68a5b", "#26364a"] },
  { id: 3, name: "XL Wear Men’s Lace-Up Trainer", price: 2799, rating: 4, colors: ["#20243b", "#111111"] },
  { id: 4, name: "Doubal Strap Sandals", price: 1999, rating: 3, colors: ["#a66a35", "#111111"] },
  { id: 5, name: "Osaga Blue Lace-Up Trainer", price: 2799, rating: 4, colors: ["#27658a", "#111111"] },
  { id: 6, name: "Urban Territory Brown Boots", price: 3999, rating: 5, colors: ["#65513f", "#111111"] },
  { id: 7, name: "Men’s Black Leather Loafers", price: 2999, rating: 4, colors: ["#111111", "#704b45"] },
  { id: 8, name: "Urban Territory Black Boots", price: 3999, rating: 5, colors: ["#111111", "#555555"] },
  { id: 9, name: "Mateo Brown Casual Sneakers", price: 2999, rating: 3, colors: ["#65412e", "#111111"] },
  { id: 10, name: "Lamore Tan Leather Loafers", price: 3999, rating: 4, colors: ["#b87342", "#111111"] },
  { id: 11, name: "Leather Rhythmic Sandals", price: 2999, rating: 4, colors: ["#3b211e", "#111111"] },
  { id: 12, name: "Herfa Hand-Painted Leather Sandals", price: 4999, rating: 5, colors: ["#8b542f", "#4a3024"] },
];

useEffect(() => {
    fetch(`${API_BASE}/api/products/`)
      .then((response) => response.json())
      .then((data) => {
        const mensProducts = data
          .filter(
            (product) =>
              product.category &&
              product.category.toLowerCase().includes("men")
          )
          .map((product) => {
            let resolvedImage = "/images/men1.png";
            if (product.image) {
              resolvedImage = product.image.startsWith("http")
                ? product.image
                : `${API_BASE}/media/${product.image.replace(/^\/?media\//, "")}`;
            }

            return {
              ...product,
              image: resolvedImage,
              price: Number(product.price),
              rating: product.rating || 4,
              colors: product.colors || ["#17294D", "#111111"],
            };
          });

        setProducts(mensProducts);
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

  if (!token) {
    navigate("/login");
    return;
  }

  try {
   await axios.post(
  `${API_BASE}/api/cart/add/`,
  {
        product_id: product.id,
        quantity: 1,
        size: 6,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    window.dispatchEvent(new Event("cartUpdated"));
    alert(`${product.name} added to cart!`);
  } catch (error) {
    console.error("Add to cart failed:", error.response?.data || error);
    alert("Could not add product to cart.");
  }
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
  onClick={() => navigate(`/men/product/${product.id}`)}
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
    navigate(`/men/product/${product.id}`);
  }}
>
  Buy
</button>

         <button
  className="women-cart-btn"
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/men/product/${product.id}`);
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

export default Mens;
