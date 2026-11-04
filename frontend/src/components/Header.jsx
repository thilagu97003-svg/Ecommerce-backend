

import logo from "../assets/logo.jpg";
import "../styles/Header.css";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, UserRound } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../config"; 

const BRAND_COLUMNS = [
  [["B", ["Barbie", "Beckett", "Bluey"]], ["C", ["Comfort Plus", "Comfy steps", "Crocs", "Cushion Walk"]]],
  [["D", ["Disney frozen", "Disney stitch", "Divaz", "Dunlop"]], ["E", ["EarthWorks"]], ["G", ["Gabbys Dollhouse"]]],
  [["H", ["Heart", "Heavenly feet", "Hobos", "Hush puppies"]], ["J", ["Jo & Joe", "JuJu"]]],
  [["K", ["Kickers", "Krush"]], ["L", ["Lambretta", "Lilley", "LoL", "Lotus", "Lunar"]]],
  [["M", ["Marco Lozzi", "Marvel", "Maya grace"]], ["O", ["Original penguin", "Osaga"]]],
  [["P", ["Paw patrol", "Pokemon"]], ["R", ["Red fish", "Red level", "Regatta", "Rieker", "Rocket Dog"]]],
  [["S", ["Skechers", "Soft line", "Softlites", "Spider-man", "Stone creek", "Super mario"]]],
  [["T", ["Totes isotoner", "Trespass", "Truffle", "Trux"]], ["U", ["Umbro"]]],
  [["W", ["Walkright", "Wednesday", "Wrangler"]], ["X", ["XL"]]],
];

function Header()
 {
  const [cartCount, setCartCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
const navigate = useNavigate();
const [searchTerm, setSearchTerm] = useState("");
const loggedInUser = JSON.parse(
  localStorage.getItem("stepup_logged_in") || "null"
);
const isLoggedIn =
  Boolean(localStorage.getItem("stepup_logged_in")) ||
  Boolean(localStorage.getItem("stepup_google_user"));

useEffect(() => {
  const updateCartCount = async () => {
    const token = localStorage.getItem("stepup_access_token");

    // 1. Token irundhaal backend API moolama cart count edukkurom
    if (token) {
      try {
        const response = await axios.get(`${API_BASE}/api/cart/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const items = response.data.items || [];
        const count = items.reduce(
          (total, item) => total + Number(item.quantity || 1),
          0
        );

        setCartCount(count);
        localStorage.setItem("cart", JSON.stringify(items));
        return;
      } catch (error) {
        console.error("Cart count load failed from backend:", error.response?.data || error);
      }
    }

    // 2. Token illanaal alladhu API fail aanaal localStorage-la irundhu count edukkurom
    try {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const localCount = localCart.reduce(
        (total, item) => total + Number(item.quantity || 1),
        0
      );
      setCartCount(localCount);
    } catch {
      setCartCount(0);
    }
  };

  updateCartCount();

  const handleCartUpdate = () => updateCartCount();
  window.addEventListener("cartUpdated", handleCartUpdate);
  window.addEventListener("storage", handleCartUpdate);

  return () => {
    window.removeEventListener("cartUpdated", handleCartUpdate);
    window.removeEventListener("storage", handleCartUpdate);
  };
}, []);
  return (
    <>
    
            <header className="top-header">
        <Link to="/" className="brand-logo" aria-label="StepUp home">
          <img src={logo} alt="StepUp.in Logo" />
        </Link>

        <form
          className="header-search"
          onSubmit={(e) => {
            e.preventDefault();
            const query = searchTerm.trim();

            if (query) {
              navigate(`/products?search=${encodeURIComponent(query)}`);
            }
          }}
        >
          <Search size={21} />

          <input
            type="search"
            name="search"
            placeholder="Search here"
            aria-label="Search here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <nav className="header-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>

          {!isLoggedIn && <NavLink to="/login">Log in</NavLink>}

          <NavLink to="/cart" className="cart-link">
            Cart <ShoppingCart size={20} />
            <span className="cart-badge">{cartCount}</span>
          </NavLink>

          {isLoggedIn && (
            <div className="profile-menu">
              <button
                type="button"
                className="profile-button"
                aria-label="Profile menu"
                onClick={() => setProfileOpen((open) => !open)}
              >
                <UserRound size={22} />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  {loggedInUser?.email && (
                    <div className="profile-email">{loggedInUser.email}</div>
                  )}
                  <Link to="/my-orders" onClick={() => setProfileOpen(false)}>
                    My Orders
                  </Link>
                  <Link to="/track-order" onClick={() => setProfileOpen(false)}>
                    Track Order
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("stepup_logged_in");
                      localStorage.removeItem("stepup_google_user");
                      setProfileOpen(false);
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <section className="brand-navigation">
        <Link to="/" className="brand-title">
          StepUp.in
        </Link>

        <nav className="category-navigation">
  <div className="category-item womens-menu">
    <NavLink to="/womens">
  Womens
</NavLink>

    <div className="mega-menu">
      <div className="mega-column">
        <h4>New Arrivals</h4>
        <Link to="/products?category=Womens">View all</Link>
      </div>

      <div className="mega-column">
        <h4>Sandals</h4>
        <Link to="/products?category=Womens">View all</Link>
        <Link to="/products?category=Womens">Flat</Link>
        <Link to="/products?category=Womens">Flip Flop</Link>
        <Link to="/products?category=Womens">Slider</Link>
        <Link to="/products?category=Womens">Strappy</Link>
      </div>

      <div className="mega-column">
        <h4>Trainers</h4>
        <Link to="/products?category=Womens">View all</Link>
        <Link to="/products?category=Womens">Chunky</Link>
        <Link to="/products?category=Womens">Lace Up</Link>
        <Link to="/products?category=Womens">Slip On</Link>
      </div>

      <div className="mega-column">
        <h4>Canvas</h4>
        <Link to="/products?category=Womens">View all</Link>
        <Link to="/products?category=Womens">Lace Up</Link>
        <Link to="/products?category=Womens">Slip On</Link>
      </div>

      <div className="mega-column">
        <h4>Shoes</h4>
        <Link to="/products?category=Womens">View all</Link>
        <Link to="/products?category=Womens">Ballerina</Link>
        <Link to="/products?category=Womens">Brogue</Link>
        <Link to="/products?category=Womens">Flat Heel</Link>
        <Link to="/products?category=Womens">Leather</Link>
      </div>

      <div className="mega-column">
        <h4>Safety Footwear</h4>
        <Link to="/products?category=Womens">View all</Link>
      </div>
      

      <div className="mega-column">
        <h4>Boots</h4>
        <Link to="/products?category=Womens">View all</Link>
        <Link to="/products?category=Womens">Ankle</Link>
        <Link to="/products?category=Womens">Biker</Link>
        <Link to="/products?category=Womens">Knee High</Link>
      </div>

      <div className="mega-column">
        <h4>Slippers</h4>
        <Link to="/products?category=Womens">View all</Link>
        <Link to="/products?category=Womens">Easy Fasten</Link>
        <Link to="/products?category=Womens">Moccasin</Link>
      </div>
    </div>
  </div>
  

<div className="category-item mens-menu">
  <NavLink to="/mens">Mens</NavLink>

  <div className="mega-menu">
    <div className="mega-column">
      <h4>New Arrivals</h4>
      <Link to="/products?category=Mens">View all</Link>
    </div>

    <div className="mega-column">
      <h4>Sandals</h4>
      <Link to="/products?category=Mens">View all</Link>
      <Link to="/products?category=Mens">Flat</Link>
      <Link to="/products?category=Mens">Flip Flop</Link>
      <Link to="/products?category=Mens">Slider</Link>
      <Link to="/products?category=Mens">Strappy</Link>
    </div>

    <div className="mega-column">
      <h4>Trainers</h4>
      <Link to="/products?category=Mens">View all</Link>
      <Link to="/products?category=Mens">Chunky</Link>
      <Link to="/products?category=Mens">Lace Up</Link>
      <Link to="/products?category=Mens">Slip On</Link>
    </div>

    <div className="mega-column">
      <h4>Canvas</h4>
      <Link to="/products?category=Mens">View all</Link>
      <Link to="/products?category=Mens">Lace Up</Link>
      <Link to="/products?category=Mens">Slip On</Link>
    </div>

    <div className="mega-column">
      <h4>Shoes</h4>
      <Link to="/products?category=Mens">View all</Link>
      <Link to="/products?category=Mens">Brogue</Link>
      <Link to="/products?category=Mens">Formal</Link>
      <Link to="/products?category=Mens">Loafers</Link>
      <Link to="/products?category=Mens">Leather</Link>
    </div>

    <div className="mega-column">
      <h4>Safety Footwear</h4>
      <Link to="/products?category=Mens">View all</Link>
    </div>

    <div className="mega-column">
      <h4>Boots</h4>
      <Link to="/products?category=Mens">View all</Link>
      <Link to="/products?category=Mens">Ankle</Link>
      <Link to="/products?category=Mens">Biker</Link>
      <Link to="/products?category=Mens">Chelsea</Link>
    </div>

    <div className="mega-column">
      <h4>Slippers</h4>
      <Link to="/products?category=Mens">View all</Link>
      <Link to="/products?category=Mens">Easy Fasten</Link>
      <Link to="/products?category=Mens">Moccasin</Link>
    </div>
  </div>
</div>
  <div className="category-item kids-menu">
  <NavLink to="/kids">Kids</NavLink>

  <div className="mega-menu">
    <div className="mega-column">
      <h4>Girls</h4>
      <Link to="/kids">View all</Link>
      <Link to="/kids">Sandals</Link>
      <Link to="/kids">Canvas</Link>
      <Link to="/kids">Trainers</Link>
      <Link to="/kids">Shoes</Link>
      <Link to="/kids">Boots</Link>
      <Link to="/kids">Wellies</Link>
      <Link to="/kids">Slippers</Link>
    </div>

    <div className="mega-column">
      <h4>Girls Trending</h4>
      <Link to="/kids">Save</Link>
      <Link to="/kids">New arrivals</Link>
      <Link to="/kids">Character footwear</Link>
      <Link to="/kids">Online exclusive</Link>
      <Link to="/kids">Back to school</Link>
    </div>

    <div className="mega-column">
      <h4>Back to school</h4>
      <Link to="/kids">View all shoes</Link>
      <Link to="/kids">Girls school shoes</Link>
      <Link to="/kids">Boys school shoes</Link>
    </div>

    <div className="mega-column">
      <h4>Canvas</h4>
      <Link to="/kids">View all</Link>
      <Link to="/kids">Lace Up</Link>
      <Link to="/kids">Slip On</Link>
    </div>

    <div className="mega-column">
      <h4>Boys</h4>
      <Link to="/kids">View all</Link>
      <Link to="/kids">Sandals</Link>
      <Link to="/kids">Canvas</Link>
      <Link to="/kids">Trainers</Link>
      <Link to="/kids">Shoes</Link>
      <Link to="/kids">Boots</Link>
      <Link to="/kids">Wellies</Link>
      <Link to="/kids">Slippers</Link>
    </div>

    <div className="mega-column">
      <h4>Safety Footwear</h4>
      <Link to="/kids">View all</Link>
    </div>

    <div className="mega-column">
      <h4>Boys Trending</h4>
      <Link to="/kids">SAVE</Link>
      <Link to="/kids">New arrivals</Link>
      <Link to="/kids">Character</Link>
      <Link to="/kids">Online exclusive</Link>
      <Link to="/kids">Back to school</Link>
    </div>

    <div className="mega-column">
      <h4>Slippers</h4>
      <Link to="/kids">Boys slippers</Link>
      <Link to="/kids">Girls slippers</Link>
    </div>
  </div>
</div>
   <div className="category-item brands-menu">
    <NavLink to="/brands">Brands</NavLink>

    <div className="mega-menu brands-mega-menu">
      {BRAND_COLUMNS.map((column, i) => (
        <div className="brand-col" key={i}>
          {column.map(([letter, names]) => (
            <div className="brand-group" key={letter}>
              <h4>{letter}</h4>
              {names.map((name) => (
                <Link key={name} to="/brands">{name}</Link>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>



  <div className="category-item offers-menu">
    <NavLink to="/offers">Offers</NavLink>

    <div className="mega-menu offers-mega-menu">
      <div className="mega-column">
        <h4>SAVE</h4>
        <Link to="/offers">Two pairs for thousand</Link>
        <Link to="/offers">Clearance Outlet</Link>
        <Link to="/offers">Boots Sale</Link>
        <Link to="/offers">View all offers</Link>
      </div>
    </div>
  </div>
</nav>


      </section>
    </>
  );
}

export default Header;
