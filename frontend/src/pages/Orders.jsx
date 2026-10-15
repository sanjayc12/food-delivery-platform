import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { endpoints } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { buildSteps, dateTime, money, stageSummary } from '../utils/format';
import { getOrderHistory, getOrderSnapshot } from '../utils/hooks';
import { EmptyState } from '../components/States';

const ok = (r) => (r.status === 'fulfilled' ? r.value.data : undefined);

export default function Orders() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);

  const load = useCallback(async () => {
    const ids = getOrderHistory(user.username);
    const result = await Promise.all(
      ids.map(async (id) => {
        const [o, p, d] = await Promise.allSettled([endpoints.order(id), endpoints.payment(id), endpoints.delivery(id)]);
        return { id, order: ok(o), payment: ok(p), delivery: ok(d) };
      }),
    );
    setRows(result);
  }, [user.username]);

  useEffect(() => {
    load();
  }, [load]);

  if (rows === null) {
    return (
      <div aria-hidden="true">
        <div className="skeleton skeleton--title" />
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton skeleton--row" />)}
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">My orders</h1>
      {rows.length === 0 ? (
        <EmptyState emoji="🧾" title="No orders yet" text="Your orders will show up here, with live status.">
          <Link className="btn btn--primary" to="/">Find something tasty</Link>
        </EmptyState>
      ) : (
        <ul className="order-list">
          {rows.map(({ id, order, payment, delivery }) => {
            const snap = getOrderSnapshot(id);
            const summary = order ? stageSummary(buildSteps({ order, payment, delivery })) : null;
            return (
              <li key={id}>
                <Link to={`/orders/${id}`} className="card order-row">
                  <div className="order-row__main">
                    <div className="order-row__top">
                      <h3>{snap?.restaurant?.name || `Order #${id}`}</h3>
                      {summary && <span className={`pill pill--${summary.tone}`}>{summary.label}</span>}
                    </div>
                    <p className="muted">
                      #{id}{order?.createdAt ? ` · ${dateTime(order.createdAt)}` : ''}
                      {snap?.items ? ` · ${snap.items.reduce((n, i) => n + i.quantity, 0)} items` : ''}
                    </p>
                    {!order && <p className="muted">We could not load this order right now.</p>}
                  </div>
                  <div className="order-row__side">
                    {order && <strong>{money(order.totalAmount)}</strong>}
                    <ChevronRight size={20} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
