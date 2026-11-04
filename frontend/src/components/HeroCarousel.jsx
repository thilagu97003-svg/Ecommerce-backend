
import { useEffect, useState } from "react";
import "../styles/HeroCarousel.css";

 const slides = [
  {
    image: "/images/kids-shoe.jpg",
    title: "Flat 50% Sale",
    subtitle: "Kids Shoes",
    button: "Shop Now",
    category: "Kids",
  },

  {
    image: "/images/women-shoe.jpg",
    title: "Womens red color high heel for party for your first order get a free gift",
    button: "Shop Now",
    category: "Womens",
  },
  {
    image: "/images/men-shoe.jpg",
    title: "Men’s wear high heel office shoe only 40% discount today only",
    button: "Shop Now",
    category: "Mens",
  },
  {
    image: "/images/women-shoe1.jpg",
    subtitle: "Women High Heels Flat 30 %offer for your first order",
    button: "Shop Now",
    category: "Womens",
  },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="hero-carousel">
     
{current === 0 ? (
  <div className="kids-banner">
        {[1, 2, 3, 4].map((part) => (
      <div
        key={part}
        className={`kids-banner-part kids-part-${part}`}
        style={{
          backgroundImage: `url(${slide.image})`,
        }}
      />
    ))}
  </div>
) : (
  <img
    className={`hero-image hero-image-${current + 1}`}
    src={slide.image}
    alt={slide.subtitle}
  />
)}
      <div className="hero-overlay">
        <h2>{slide.title}</h2>
        <p>{slide.subtitle}</p>

        <button
          onClick={() =>
            (window.location.href =
              `/products?category=${slide.category}`)
          }
        >
          {slide.button}
        </button>
      </div>

      <div className="hero-dots">
        {slides.map((item, index) => (
          <button
            key={item.category}
            className={current === index ? "active" : ""}
            onClick={() => setCurrent(index)}
            aria-label={`Show banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
