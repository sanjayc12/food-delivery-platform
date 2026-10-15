import { Heart, MapPin, Timer, Utensils } from 'lucide-react';

const values = [
  { icon: <Utensils size={20} />, title: 'Local favourites', text: 'Discover restaurants and dishes made by the people in your neighbourhood.' },
  { icon: <Timer size={20} />, title: 'Clear updates', text: 'Follow your order as it moves from preparation to your door.' },
  { icon: <Heart size={20} />, title: 'Made for good food', text: 'A simple way to find something delicious and get on with enjoying it.' },
];

export default function About() {
  return (
    <section className="info-page">
      <p className="eyebrow">A little about us</p>
      <h1 className="page-title">Good food brings us together.</h1>
      <p className="info-page__intro muted">
        FoodRush makes it easy to explore neighbourhood restaurants, order the food you love,
        and keep up with your delivery along the way.
      </p>
      <div className="info-cards">
        {values.map((value) => (
          <article className="card panel info-card" key={value.title}>
            <span className="info-card__icon">{value.icon}</span>
            <h2>{value.title}</h2>
            <p className="muted">{value.text}</p>
          </article>
        ))}
      </div>
      <p className="info-page__location"><MapPin size={18} /> Supporting local restaurants, one meal at a time.</p>
    </section>
  );
}
