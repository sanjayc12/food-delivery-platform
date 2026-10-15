import { Mail, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <section className="info-page">
      <p className="eyebrow">We’re here to help</p>
      <h1 className="page-title">Get in touch.</h1>
      <p className="info-page__intro muted">
        Have a question about FoodRush, a restaurant listing, or your experience? Send us a message.
      </p>
      <div className="card panel contact-card">
        <span className="info-card__icon"><MessageCircle size={22} /></span>
        <h2>Customer support</h2>
        <p className="muted">Email us and our team will get back to you as soon as possible.</p>
        <p className="muted contact-card__note">Demo contact address — replace it with your support email before launch.</p>
        <a className="btn btn--primary" href="mailto:support@foodrush.example">
          <Mail size={17} /> support@foodrush.example
        </a>
      </div>
    </section>
  );
}
