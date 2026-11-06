import { Link } from "react-router-dom";

function ScooterIcon() {
  return (
    <svg
      className="delivery-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path d="M8 17.5h7.2" />
      <path d="M15.5 17.5 13.8 7H11" />
      <path d="M13.8 7h3.2" />
      <path d="M3 12.5h7.5l1.2 5" />
    </svg>
  );
}

const specials = [
  {
    image: "/assets/greek-salad.png",
    name: "Greek salad",
    price: "$12.00",
    description: "The famous greek salad of crispy lettuce, peppers, olives and our Chicago style feta cheese, garnished with crunchy garlic and rosemary croutons.",
  },
  {
    image: "/assets/bruschetta.png",
    name: "Bruschetta",
    price: "$12.00",
    description: "Our Bruschetta is made from grilled bread that has been smeared with garlic and seasoned with salt and olive oil.",
  },
  {
    image: "/assets/lemon-dessert.png",
    name: "Lemon dessert",
    price: "$12.00",
    description: "This comes straight from grandma's recipe book, every last ingredient has been sourced and is as authentic as can be imagined.",
  },
];

function Specials() {
  return (
    <section id="specials" className="specials-section">
      <div className="site-container">
        <h2 className="section-title">This Weeks Specials!</h2>
        <div className="specials-grid">
          {specials.map((item) => (
            <article className="special-card" key={item.name}>
              <img src={item.image} alt={item.name} />
              <div className="special-content">
                <div className="special-heading">
                  <h3>{item.name}</h3>
                  <span>{item.price}</span>
                </div>
                <p>{item.description}</p>
                <Link className="delivery-button" to="/booking">Order a delivery <ScooterIcon /></Link>
              </div>
            </article>
          ))}
        </div>
        <Link className="primary-button explore-button" to="/booking">Explore Menu</Link>
      </div>
    </section>
  );
}

export default Specials;
