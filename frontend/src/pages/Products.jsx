import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../styles/Products.css";
import { API_BASE } from "../config"; 

const API = `${API_BASE}`;

// Old hard-coded list: now used ONLY to get the rating and a fallback image
// (matched by product name). The real product id always comes from the API,
// so every card opens its own detail page.
const LOCAL_PRODUCTS = [
  { id: 1, name: "Lamar Tan Women’s Lace Sandal", price: 2799, rating: 5, category: "women" },
  { id: 2, name: "Lilley White Diamante Slip-On Shoe", price: 2799, rating: 4, category: "women" },
  { id: 3, name: "Softlines Navy Sandal", price: 2999, rating: 3, category: "women" },
  { id: 4, name: "Shoezone Floral Beach Mule", price: 2799, rating: 3, category: "women" },
  { id: 5, name: "Ophelia Women’s Silver Heel", price: 5999, rating: 5, category: "women" },
  { id: 6, name: "Lilley Women’s Patent Shoe", price: 3999, rating: 4, category: "women" },
  { id: 7, name: "Noelle Mesh Bow Ballerinas", price: 3999, rating: 3, category: "women" },
  { id: 8, name: "Stella Flat Embellished Slides", price: 1999, rating: 5, category: "women" },
  { id: 9, name: "Olivia Pencil Heels", price: 3999, rating: 4, category: "women" },
  { id: 10, name: "Amelia Kitten Heels", price: 2999, rating: 2, category: "women" },
  { id: 11, name: "Beckett Sandals", price: 2999, rating: 5, category: "women" },
  { id: 12, name: "Glamo Flat Black Sandals", price: 1799, rating: 3, category: "women" },

  { id: 1, name: "Comfy Steps White Strap Sandal", price: 1999, rating: 5, category: "men" },
  { id: 2, name: "Hush Puppies Tan Boat Shoe", price: 2799, rating: 4, category: "men" },
  { id: 3, name: "XL Wear Men’s Lace-Up Trainer", price: 2799, rating: 4, category: "men" },
  { id: 4, name: "Doubal Strap Sandals", price: 1999, rating: 4, category: "men" },
  { id: 5, name: "Osaga Blue Lace-Up Trainer", price: 2799, rating: 4, category: "men" },
  { id: 6, name: "Urban Territory Brown Boots", price: 3999, rating: 5, category: "men" },
  { id: 7, name: "Men’s Black Leather Loafers", price: 2999, rating: 4, category: "men" },
  { id: 8, name: "Urban Territory Black Boots", price: 3999, rating: 5, category: "men" },
  { id: 9, name: "Mateo Brown Casual Sneakers", price: 2999, rating: 4, category: "men" },
  { id: 10, name: "Lamore Tan Leather Loafers", price: 3999, rating: 4, category: "men" },
  { id: 11, name: "Leather Rhythmic Sandals", price: 2999, rating: 4, category: "men" },
  { id: 12, name: "Herfa Hand-Painted Leather Sandals", price: 4999, rating: 5, category: "men" },

  { id: 1, name: "Whitney Girls White Multi Marble EVA Clog", price: 2799, rating: 4, category: "kids" },
  { id: 2, name: "Walkright Claudia Girls Blue Fasten Canvas", price: 3199, rating: 4, category: "kids" },
  { id: 3, name: "Walkright Girls Pink Polka Dot Canvas", price: 3499, rating: 5, category: "kids" },
  { id: 4, name: "Walkright Girls Multi-T Bar Sandal", price: 4799, rating: 4, category: "kids" },
  { id: 5, name: "The Slipper Company Cherish Girls Pink Bootie", price: 2699, rating: 4, category: "kids" },
  { id: 6, name: "LOL Surprise Kids Fasten Slipper", price: 2799, rating: 5, category: "kids" },
  { id: 7, name: "Bluey Kids Blue Easy Fasten Slipper", price: 4999, rating: 4, category: "kids" },
  { id: 8, name: "Spider-Man Kids Red Light Up Trainer", price: 5799, rating: 5, category: "kids" },
  { id: 9, name: "Disney Stitch Pink Round Kids EVA Clog", price: 3999, rating: 4, category: "kids" },
  { id: 10, name: "Disney Frozen Purple Strap Sandal", price: 5999, rating: 5, category: "kids" },
  { id: 11, name: "Shoeszone Short Kids Black Welly Size 1 to 6", price: 3999, rating: 4, category: "kids" },
  { id: 12, name: "Shoeszone Kids Unicorn Welly", price: 3999, rating: 5, category: "kids" },
];

const CATEGORY_KEY = {
  women: "women",
  womens: "women",
  men: "men",
  mens: "men",
  kids: "kids",
  kid: "kids",
};

function getLocalImage(category, id) {
  if (category === "kids") return `/images/kids${id}.png`;
  if (category === "men") return `/images/men${id}.png`;
  return `/images/women${id}.jpg`;
}

function getApiImage(image) {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${API}/media/${image.replace(/^\/?media\//, "")}`;
}

function getDetailsPath(product) {
  if (product.category === "kids") return `/kids/product/${product.id}`;
  if (product.category === "men") return `/men/product/${product.id}`;
  return `/product/${product.id}`;
}

function Products() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const rawCategory = searchParams.get("category")?.trim().toLowerCase() || "";
  const category = CATEGORY_KEY[rawCategory] || rawCategory;

  useEffect(() => {
    fetch(`${API}/api/products/`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];

        setItems(
          list.map((p) => {
            const cat = CATEGORY_KEY[String(p.category || "").toLowerCase()] || "women";
            const local = LOCAL_PRODUCTS.find(
              (l) => l.category === cat && l.name === p.name
            );

            return {
              id: p.id, // real database id
              name: p.name,
              category: cat,
              price: Number(p.price),
              rating: local?.rating ?? 4,
              image: getApiImage(p.image),
              fallback: local ? getLocalImage(cat, local.id) : "",
            };
          })
        );
      })
      .catch(() => setError("Could not load products. Is the Django server running?"))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = items.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search);
    const matchesCategory = !category || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="products-page">
      <h1>New &amp; Trending</h1>

      {loading && <p className="no-products">Loading products...</p>}
      {error && <p className="no-products">{error}</p>}
      {!loading && !error && filteredProducts.length === 0 && (
        <p className="no-products">No matching products found.</p>
      )}

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <article className="product-card" key={`${product.category}-${product.id}`}>
            <Link to={getDetailsPath(product)} className="product-image-link">
              <img
                src={product.image || product.fallback}
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  if (product.fallback && !e.currentTarget.dataset.tried) {
                    e.currentTarget.dataset.tried = "1";
                    e.currentTarget.src = product.fallback;
                  } else {
                    e.currentTarget.style.visibility = "hidden";
                  }
                }}
              />
            </Link>

            <div className="product-info">
              <h2>{product.name}</h2>
              <p className="product-rating">
                {"★".repeat(product.rating)}
                <span>{"★".repeat(5 - product.rating)}</span>
              </p>
              <p className="product-price">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
              <Link to={getDetailsPath(product)} className="product-view-btn">
                View Product
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Products;