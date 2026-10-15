import { Link } from 'react-router-dom';
import { EmptyState } from '../components/States';

export default function NotFound() {
  return (
    <EmptyState emoji="🍳" title="This page is off the menu" text="The page you are looking for does not exist.">
      <Link className="btn btn--primary" to="/">Back to restaurants</Link>
    </EmptyState>
  );
}
