import { Minus, Plus } from 'lucide-react';
import { gradientFor, isAvailable, isVeg, itemEmoji, money } from '../utils/format';

export function VegMark({ veg }) {
  return (
    <span className={`veg ${veg ? 'veg--yes' : 'veg--no'}`} title={veg ? 'Vegetarian' : 'Non-vegetarian'}>
      <i />
    </span>
  );
}

export default function FoodItemCard({ item, qty, onAdd, onInc, onDec, disabled }) {
  const veg = isVeg(item);
  const available = isAvailable(item) && !disabled;

  return (
    <article className={`card item ${available ? '' : 'is-unavailable'}`}>
      <div className="item__info">
        <VegMark veg={veg} />
        <h3>{item.name}</h3>
        <p className="item__price">{money(item.price)}</p>
        {item.description && <p className="item__desc muted">{item.description}</p>}
      </div>

      <div className="item__side">
        <div className="item__art" style={{ background: gradientFor(item.name) }} aria-hidden="true">
          {itemEmoji(item.name, veg)}
        </div>
        {!available ? (
          <span className="item__sold">Unavailable</span>
        ) : qty > 0 ? (
          <div className="stepper stepper--float" role="group" aria-label={`Quantity of ${item.name}`}>
            <button type="button" onClick={onDec} aria-label="Remove one"><Minus size={16} /></button>
            <span>{qty}</span>
            <button type="button" onClick={onInc} aria-label="Add one more"><Plus size={16} /></button>
          </div>
        ) : (
          <button type="button" className="add-btn" onClick={onAdd}>
            <Plus size={16} /> Add
          </button>
        )}
      </div>
    </article>
  );
}
