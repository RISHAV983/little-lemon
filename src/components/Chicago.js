const gallery = [
  { image: "/assets/about-gallery-1.png", alt: "Little Lemon salmon dish" },
  { image: "/assets/about-gallery-2.png", alt: "Little Lemon salad" },
  { image: "/assets/about-gallery-3.png", alt: "Little Lemon pasta dish" },
  { image: "/assets/about-gallery-4.png", alt: "Little Lemon spaghetti dish" },
];

function Chicago() {
  return (
    <section id="about" className="chicago-section">
      <div className="site-container">
        <h2>Little Lemon</h2>
        <h3>Chicago</h3>
        <p className="chicago-copy">Little Lemon Chicago is a family owned Mediterranean restaurant located in the heart of the city. The restaurant is run by brothers Mario and Adrian, who have always had a passion for cooking and serving delicious food. Growing up in a Mediterranean household, the brothers were exposed to traditional recipes from an early age, and they decided to bring those recipes to the masses with a modern twist. At Little Lemon, you can expect to find a menu full of classic dishes with a creative twist that makes them stand out from the rest. Whether you're looking for a quick lunch or a leisurely dinner, Little Lemon Chicago is the perfect place to indulge in a delicious meal in a cozy and welcoming atmosphere.</p>
        <div className="gallery-grid">
          {gallery.map((item, index) => (
            <img
              key={item.image}
              className={`gallery-image gallery-image-${index + 1}`}
              src={item.image}
              alt={item.alt}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Chicago;
