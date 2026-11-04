
import HeroCarousel from "../components/HeroCarousel";
import "../styles/Home.css";
import { Gift } from "lucide-react";
import { Link } from "react-router-dom";

const TRENDING = [
  { img: "/images/trending1.jpg", name: "Ophelia Womens Silver Diamante Heel", price: "₹2,299" },
  { img: "/images/trending2.jpg", name: "Billie Womens Silver Diamante Heel", price: "₹3,000" },
  { img: "/images/trending3.jpg", name: "Drew Womens Blush Diamante Slip On Shoe", price: "₹2,599" },
  { img: "/images/trending4.jpg", name: "Drew Womens Navy Diamante Slip On Shoe", price: "₹1,999" },
  { img: "/images/trending5.jpg", name: "Weaver Mens Navy Lace Up Trainer", price: "₹799" },
  { img: "/images/trending6.jpg", name: "Weaver Mens White Lace Up Trainer", price: "₹2,250" },
  { img: "/images/trending7.jpg", name: "Calista Girls Pink Daisy Print Sandal", price: "₹1,899" },
  { img: "/images/trending8.jpg", name: "Colby Boys Blue Dinosaur Canvas", price: "₹899" },
];

function Home() {
  return (
    <div className="home-page">
      <HeroCarousel />

      <section className="home-overview">
        <h2>Overview</h2>
                <p className="overview-text">
          <span className="ov-line">&quot;Explore our curated selection of high-quality shoes for every occasion. From durable athletic shoes designed for</span>
          <span className="ov-line">peak performance to stylish casual sneakers and elegant dress shoes, we offer a diverse range of footwear to suit your</span>
          <span className="ov-line">needs. Our user-friendly interface makes it easy to browse our collection and find the perfect pair, while detailed</span>
          <span className="ov-line">product descriptions and high-quality images ensure you make an informed decision. Join our community of style</span>
          <span className="ov-line">and discover your next favorite shoe!&quot;</span>
        </p>
      </section>

      <section className="home-categories">
        <h2>What are you looking for?</h2>

        <div className="category-grid">
          <div className="category-card">
  <Link to="/mens">
    <img src="/images/mens-category.jpg" alt="Men's footwear collection" />
    <h3>Mens</h3>
  </Link>
</div>

<div className="category-card">
  <Link to="/womens">
    <img src="/images/womens-category.jpg" alt="Women's footwear collection" />
    <h3>Womens</h3>
  </Link>
</div>

<div className="category-card">
  <Link to="/kids">
    <img src="/images/kids-category.jpg" alt="Kids' footwear collection" />
    <h3>Kids</h3>
  </Link>
</div>

             </div>
      </section>
      
<section className="trending-section">
  <h2>New &amp; Trending</h2>

    <div className="trending-grid">
    {TRENDING.map((item) => (
      <Link
        key={item.img}
        to={`/products?search=${encodeURIComponent(item.name)}`}
        className="trending-card"
      >
        <img src={item.img} alt={item.name} />
        <h3>{item.name}</h3>
        <p>MRP: {item.price}</p>
      </Link>
    ))}
  </div>

 <Link to="/products" className="trending-view-btn">
  View all
</Link>
</section>

{/* Animated Gift Offer Banner */}
<section className="gift-offer-banner">
  <span className="gift-icon">
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Gift box - Violet */}
    <rect x="6" y="17" width="28" height="19" rx="3" fill="#8B2BE2" />
    <rect x="4" y="13" width="32" height="7" rx="2" fill="#8B2BE2" />

    {/* Yellow ribbon */}
    <rect x="17" y="13" width="6" height="23" fill="#FFD700" />

    {/* Orange bow */}
    <path
      d="M20 13 C7 13 7 3 14 5 C18 6 20 13 20 13Z"
      fill="#FF9800"
    />
    <path
      d="M20 13 C33 13 33 3 26 5 C22 6 20 13 20 13Z"
      fill="#FF9800"
    />
  </svg>
</span>

  <h2>Get your first order with free gift</h2>

  <span className="gift-icon">
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Gift box - Violet */}
    <rect x="6" y="17" width="28" height="19" rx="3" fill="#8B2BE2" />
    <rect x="4" y="13" width="32" height="7" rx="2" fill="#8B2BE2" />

    {/* Yellow ribbon */}
    <rect x="17" y="13" width="6" height="23" fill="#FFD700" />

    {/* Orange bow */}
    <path
      d="M20 13 C7 13 7 3 14 5 C18 6 20 13 20 13Z"
      fill="#FF9800"
    />
    <path
      d="M20 13 C33 13 33 3 26 5 C22 6 20 13 20 13Z"
      fill="#FF9800"
    />
  </svg>
</span>

  <h2>&amp; 50 % offer</h2>

  <span className="offer-icon">🌟</span>
</section>
    </div>
  );
}

export default Home;
