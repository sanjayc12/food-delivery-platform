import { Bike, Check, CreditCard, PackageCheck, ReceiptText, X } from 'lucide-react';

const ICONS = {
  placed: ReceiptText,
  payment: CreditCard,
  tracking: Bike,
  delivered: PackageCheck,
};

export default function StatusTimeline({ steps }) {
  return (
    <ol className="timeline">
      {steps.map((s) => {
        const Icon = ICONS[s.key];
        return (
          <li key={s.key} className={`timeline__step is-${s.state}`}>
            <span className="timeline__dot">
              {s.state === 'done' ? <Check size={16} strokeWidth={3} /> : s.state === 'failed' ? <X size={16} strokeWidth={3} /> : <Icon size={16} />}
            </span>
            <div>
              <h4>{s.title}</h4>
              <p className="muted">{s.state === 'todo' && s.key !== 'payment' ? 'Waiting' : s.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
