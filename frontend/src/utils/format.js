const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const money = (n) => inr.format(Number(n || 0));

/** Java's LocalDateTime has 7 fractional digits, which Safari can't parse. Trim to milliseconds. */
function toDate(iso) {
  if (!iso) return null;
  const d = new Date(String(iso).replace(/(\.\d{3})\d+/, '$1'));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function dateTime(iso) {
  const d = toDate(iso);
  if (!d) return '';
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function timeOnly(iso) {
  const d = toDate(iso);
  return d ? d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '';
}

/** Spring serialises Lombok `boolean isOpen` as `open`. Accept either spelling. */
export const pick = (obj, ...keys) => {
  for (const k of keys) if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
};
export const isOpen = (r) => pick(r, 'open', 'isOpen') !== false;
export const isVeg = (i) => !!pick(i, 'veg', 'isVeg');
export const isAvailable = (i) => pick(i, 'available', 'isAvailable') !== false;

// ---------- Visual helpers (no image assets needed) ----------
const CUISINES = [
  [/pizza|ital/i, '🍕'],
  [/burger|american|fast/i, '🍔'],
  [/south|dosa|idli/i, '🥞'],
  [/biryani|mughlai|hyderabad/i, '🍲'],
  [/indian|curry|north|punjabi/i, '🍛'],
  [/chin|asian|noodle/i, '🥡'],
  [/thai/i, '🍜'],
  [/jap|sushi/i, '🍣'],
  [/mex|taco/i, '🌮'],
  [/dessert|sweet|bake|cake|ice/i, '🍰'],
  [/cafe|coffee|tea/i, '☕'],
  [/health|salad|vegan/i, '🥗'],
  [/sea|fish/i, '🦐'],
  [/bbq|grill|kebab/i, '🍢'],
];

export function cuisineEmoji(cuisine) {
  const hit = CUISINES.find(([re]) => re.test(cuisine || ''));
  return hit ? hit[1] : '🍽️';
}

const ITEMS = [
  [/pizza/i, '🍕'],
  [/burger/i, '🍔'],
  [/fries|chips/i, '🍟'],
  [/bread|garlic|bun|naan|roti/i, '🥖'],
  [/biryani/i, '🍲'],
  [/paneer|cheese/i, '🧀'],
  [/pasta|spaghetti|lasagna/i, '🍝'],
  [/noodle|ramen|chow/i, '🍜'],
  [/cake|brownie|pastry|dessert/i, '🍰'],
  [/ice|kulfi|gelato/i, '🍨'],
  [/coffee|latte|tea|chai/i, '☕'],
  [/dosa|uttapam|idli|pancake/i, '🥞'],
  [/salad/i, '🥗'],
  [/chicken|wings|tikka/i, '🍗'],
  [/rice/i, '🍚'],
  [/sushi|roll/i, '🍣'],
  [/taco|wrap|burrito/i, '🌮'],
  [/soup/i, '🍲'],
  [/juice|shake|smoothie|cola|soda/i, '🥤'],
  [/egg/i, '🍳'],
  [/momo|dumpling/i, '🥟'],
];

export function itemEmoji(name, veg) {
  const hit = ITEMS.find(([re]) => re.test(name || ''));
  return hit ? hit[1] : veg ? '🥘' : '🍴';
}

const GRADIENTS = [
  ['#ff8a3d', '#ff5a2c'],
  ['#ffb84d', '#ff7a45'],
  ['#ff6b81', '#ff8a5c'],
  ['#f7b733', '#fc4a1a'],
  ['#ff9966', '#ff5e62'],
  ['#ffc371', '#ff5f6d'],
];

export function gradientFor(seed) {
  let h = 0;
  for (const ch of String(seed || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = GRADIENTS[h % GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

// ---------- Order tracking ----------
export const STEPS = [
  { key: 'placed', title: 'Order placed', desc: 'We have received your order.' },
  { key: 'payment', title: 'Payment completed', desc: 'Your demo payment was successful.' },
  { key: 'tracking', title: 'Order live tracking', desc: 'Your order is being prepared.' },
  { key: 'delivered', title: 'Delivered', desc: 'Enjoy your meal!' },
];

/** Derives the timeline from what each microservice currently knows about the order. */
export function buildSteps({ order, payment, delivery }) {
  const ds = delivery?.status;
  const paymentMethod = payment?.paymentMethod || order?.paymentMethod;
  const isCod = paymentMethod === 'COD';
  const isPaymentSuccessful = payment?.status === 'SUCCESS';
  const trackingStarted = !!delivery || isPaymentSuccessful;
  const done = {
    placed: !!order,
    payment: isPaymentSuccessful,
    tracking: ds === 'DELIVERED',
    delivered: ds === 'DELIVERED',
  };
  const paymentFailed = payment?.status === 'FAILED';

  let activeTaken = false;
  return STEPS.map((s) => {
    if (done[s.key]) return { ...s, state: 'done' };
    if (s.key === 'payment' && paymentFailed) {
      activeTaken = true;
      return { ...s, title: 'Payment failed', desc: 'We could not process your payment.', state: 'failed' };
    }
    if (s.key === 'payment' && isCod) {
      const waitingForDelivery = !delivery;
      if (waitingForDelivery) activeTaken = true;
      return {
        ...s,
        title: 'Cash on delivery',
        desc: 'Payment is due when your order arrives.',
        state: waitingForDelivery ? 'active' : 'todo',
      };
    }
    if (s.key === 'payment' && !isPaymentSuccessful) {
      activeTaken = true;
      return { ...s, title: 'Payment pending', desc: 'Waiting for payment confirmation.', state: 'active' };
    }
    if (s.key === 'tracking' && !trackingStarted) {
      return { ...s, desc: 'Live tracking starts after payment is completed.', state: 'todo' };
    }
    if (s.key === 'tracking' && !delivery) {
      activeTaken = true;
      return { ...s, desc: 'Waiting for a delivery partner to be assigned.', state: 'active' };
    }
    if (s.key === 'tracking' && ds === 'ASSIGNED') {
      activeTaken = true;
      return { ...s, desc: 'A delivery partner has been assigned to your order.', state: 'active' };
    }
    if (s.key === 'tracking' && ds === 'OUT_FOR_DELIVERY') {
      activeTaken = true;
      return { ...s, desc: 'Your food is on the way.', state: 'active' };
    }
    if (!activeTaken) {
      activeTaken = true;
      return { ...s, state: 'active' };
    }
    return { ...s, state: 'todo' };
  });
}

/** Short label + tone for order list chips. */
export function stageSummary(steps) {
  if (steps.some((s) => s.state === 'failed')) return { label: 'Payment failed', tone: 'red' };
  const active = steps.find((s) => s.state === 'active');
  if (!active) return { label: 'Delivered', tone: 'green' };
  return { label: active.title, tone: 'amber' };
}
