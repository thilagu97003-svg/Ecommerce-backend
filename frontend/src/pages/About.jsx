import "../styles/About.css";

function About() {
  return (
    <main className="about-page">
      <section className="about-intro">
        <h1>About StepUp</h1>
        <p>
          <span className="ov-line">StepUp is India’s largest sports and athleisure footwear brand. Incorporated in 2006, StepUp Activewear is</span>
          <span className="ov-line">one of the leading players in organized sports &amp; casual footwear sector in India. Since 2016, the flagship</span>
          <span className="ov-line">brand &quot;StepUp&quot;, has been the largest sports and athleisure footwear brand in India, in both volume and</span>
          <span className="ov-line">value terms. The company’s products are available via an expansive Pan-India network of over 15,000</span>
          <span className="ov-line">geo-tagged multi-brand retail stores, 35+ company-owned exclusive outlets, large format stores such as</span>
          <span className="ov-line">Walmart, Vishal Retail and Reliance Smart among others and all the leading e-commerce portals.</span>
        </p>
      </section>

      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          <span className="ov-line">At StepUp we craft shoes with care for everyone- men, women and kids, with an equal attention to</span>
          <span className="ov-line">detail, letting each shoe speak for itself. The world-class quality, trendy designs and affordable</span>
          <span className="ov-line">prices have captured the imagination of millions of people, across the country- making StepUp,</span>
          <span className="ov-line">an aspirational brand especially for - young adults, everyday performers and fashionistas.</span>
        </p>
      </section>

      <section className="about-showcase">
        <img
          className="about-side-image"
          src="/images/about-main.jpg"
          alt="StepUp footwear collection"
        />

        <img
          className="about-center-image"
          src="/images/about-shoes.jpg"
          alt="Comfortable shoes from StepUp"
        />
      </section>

            <section className="about-values">
        <article>
          <h3>Simplicity In Design</h3>
          <p>
            <span className="ov-line">No flashy logos, no senseless details.</span>
            <span className="ov-line">Just the world’s most comfortable</span>
            <span className="ov-line">shoes, made naturally and designed</span>
            <span className="ov-line">practically. It’s that simple.</span>
          </p>
        </article>

        <article>
          <h3>Confidence In Comfort</h3>
          <p>
            <span className="ov-line">Trying is believing. Give our shoes a</span>
            <span className="ov-line">shot for 30 days, and if you’re not</span>
            <span className="ov-line">walking on cloud nine, we’ll take them</span>
            <span className="ov-line">back - no questions asked.</span>
          </p>
        </article>

        <article>
          <h3>Made from Nature</h3>
          <p>
            <span className="ov-line">The footwear industry often overlooks</span>
            <span className="ov-line">Mother Nature’s materials in favor of</span>
            <span className="ov-line">cheaper, synthetic alternatives. We</span>
            <span className="ov-line">think it’s time to change that.</span>
          </p>
        </article>
      </section>
    </main>
  );
}

export default About;