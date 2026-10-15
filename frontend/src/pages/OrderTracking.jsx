import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote, Bell, Bike, CreditCard, Loader2, MapPin, PackageCheck, QrCode, RefreshCw } from 'lucide-react';
import { endpoints, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { buildSteps, dateTime, money, stageSummary, timeOnly } from '../utils/format';
import { getOrderSnapshot, usePolling } from '../utils/hooks';
import StatusTimeline from '../components/StatusTimeline';
import { VegMark } from '../components/FoodItemCard';
import { ErrorState } from '../components/States';

const value = (r) => (r.status === 'fulfilled' ? r.value.data : undefined);

export default function OrderTracking() {
  const { id } = useParams();
  const toast = useToast();
  const [data, setData] = useState({ order: null, payment: undefined, delivery: undefined, notifications: [] });
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [updating, setUpdating] = useState('');
  const [paymentChoice, setPaymentChoice] = useState('UPI');
  const [savingPayment, setSavingPayment] = useState(false);
  const snapshot = getOrderSnapshot(id);

  const refresh = useCallback(async () => {
    const [o, p, d, n] = await Promise.allSettled([
      endpoints.order(id),
      endpoints.payment(id),
      endpoints.delivery(id),
      endpoints.notifications(id),
    ]);
    if (o.status === 'rejected') {
      setError(o.reason?.response?.status === 404 ? `Order #${id} does not exist.` : errorMessage(o.reason, 'Could not load this order'));
      setLoaded(true);
      return;
    }
    setError('');
    setData({
      order: o.value.data,
      payment: value(p),
      delivery: value(d),
      notifications: Array.isArray(value(n)) ? value(n) : [],
    });
    setLoaded(true);
  }, [id]);

  const steps = buildSteps(data);
  const summary = data.order ? stageSummary(steps) : null;
  const finished = summary?.label === 'Delivered' || summary?.label === 'Payment failed';

  // Poll for live updates until the order is delivered (or payment failed).
  usePolling(refresh, 4000, !finished && !error, [id]);

  const advance = async (status) => {
    setUpdating(status);
    try {
      await endpoints.updateDelivery(id, status);
      toast.success(status === 'DELIVERED' ? 'Marked as delivered' : 'Marked out for delivery');
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update delivery'));
    } finally {
      setUpdating('');
    }
  };

  const savePaymentMethod = async () => {
    setSavingPayment(true);
    try {
      await endpoints.selectPaymentMethod(id, paymentChoice, order.totalAmount);
      toast.success(paymentChoice === 'COD' ? 'Cash on delivery selected' : 'Demo payment completed');
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save payment method'));
    } finally {
      setSavingPayment(false);
    }
  };

  if (!loaded) {
    return (
      <div aria-hidden="true">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--banner" />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Link to="/orders" className="back"><ArrowLeft size={18} /> My orders</Link>
        <ErrorState message={error} onRetry={refresh} />
      </>
    );
  }

  const { order, payment, delivery, notifications } = data;
  const deliveryStatus = delivery?.status;
  const total = snapshot?.items ? snapshot.items.reduce((s, i) => s + i.price * i.quantity, 0) : order.totalAmount;
  const paymentMethod = payment?.paymentMethod || order.paymentMethod;
  const paymentMethodName = paymentMethod === 'COD'
    ? 'Cash on delivery'
    : paymentMethod === 'DEBIT_CARD'
      ? 'Debit / credit card'
      : paymentMethod === 'UPI'
        ? 'UPI'
        : 'Payment';
  const paymentStatus = payment?.status === 'SUCCESS'
    ? (paymentMethod === 'COD' ? 'paid' : 'demo payment completed')
    : payment?.status === 'FAILED'
      ? 'failed'
      : paymentMethod === 'COD'
        ? 'due on delivery'
        : 'processing';
  const canSelectPayment = !payment || payment.status === 'PENDING';

  return (
    <>
      <Link to="/orders" className="back"><ArrowLeft size={18} /> My orders</Link>

      <header className="track-head">
        <div>
          <p className="eyebrow">Order #{order.orderId} · {dateTime(order.createdAt)}</p>
          <h1>{snapshot?.restaurant?.name || 'Your order'}</h1>
        </div>
        <span className={`pill pill--lg pill--${summary.tone}`}>
          {!finished && <span className="pulse" aria-hidden="true" />}
          {summary.label}
        </span>
      </header>

      <div className="track">
        <section className="card panel">
          <div className="panel__head">
            <h2>Live status</h2>
            {!finished && <span className="live"><RefreshCw size={14} className="spin-slow" /> Updating live</span>}
          </div>
          <StatusTimeline steps={steps} />

          {delivery && (
            <div className="rider">
              <span className="rider__avatar"><Bike size={20} /></span>
              <div>
                <strong>{delivery.deliveryPartnerName}</strong>
                <p className="muted">Your delivery partner</p>
              </div>
            </div>
          )}

          {delivery && deliveryStatus !== 'DELIVERED' && (
            <details className="demo">
              <summary>Simulate delivery (demo controls)</summary>
              <p className="muted">In a real app the rider's phone would send these updates.</p>
              <div className="demo__actions">
                <button
                  className="btn btn--ghost"
                  disabled={!!updating || deliveryStatus === 'OUT_FOR_DELIVERY'}
                  onClick={() => advance('OUT_FOR_DELIVERY')}
                >
                  {updating === 'OUT_FOR_DELIVERY' ? <Loader2 size={16} className="spin" /> : <Bike size={16} />} Out for delivery
                </button>
                <button className="btn btn--primary" disabled={!!updating} onClick={() => advance('DELIVERED')}>
                  {updating === 'DELIVERED' ? <Loader2 size={16} className="spin" /> : <PackageCheck size={16} />} Mark delivered
                </button>
              </div>
            </details>
          )}
        </section>

        <div className="track__side">
          <section className="card panel">
            <h2>Order details</h2>
            {snapshot?.items ? (
              <ul className="summary-list">
                {snapshot.items.map((i) => (
                  <li key={i.foodItemId}>
                    <VegMark veg={i.veg} />
                    <span>{i.quantity} × {i.foodItemName}</span>
                    <strong>{money(i.price * i.quantity)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Item details are only stored on the device that placed the order.</p>
            )}
            <div className="sum-row sum-row--total">
              <span>Total</span>
              <strong>{money(order.totalAmount ?? total)}</strong>
            </div>
            <p className={`note note--${payment?.status === 'SUCCESS' ? 'green' : payment?.status === 'FAILED' ? 'red' : 'pending'}`}>
              {paymentMethodName} · {paymentStatus}{payment ? ` · ${money(payment.amount)}` : ''}
            </p>
            {canSelectPayment && (
              <div className="track-payment">
                <h3>Choose a payment method</h3>
                <p className="muted">Select how you want to pay for this order.</p>
                <fieldset className="payment-options">
                  <legend className="sr-only">Choose a payment method</legend>
                  <label className={`payment-option${paymentChoice === 'UPI' ? ' is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="trackingPaymentMethod"
                      value="UPI"
                      checked={paymentChoice === 'UPI'}
                      onChange={(e) => setPaymentChoice(e.target.value)}
                    />
                    <QrCode size={20} />
                    <span><strong>UPI</strong><small>Demo payment</small></span>
                  </label>
                  <label className={`payment-option${paymentChoice === 'DEBIT_CARD' ? ' is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="trackingPaymentMethod"
                      value="DEBIT_CARD"
                      checked={paymentChoice === 'DEBIT_CARD'}
                      onChange={(e) => setPaymentChoice(e.target.value)}
                    />
                    <CreditCard size={20} />
                    <span><strong>Debit / credit card</strong><small>Demo payment</small></span>
                  </label>
                  <label className={`payment-option${paymentChoice === 'COD' ? ' is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="trackingPaymentMethod"
                      value="COD"
                      checked={paymentChoice === 'COD'}
                      onChange={(e) => setPaymentChoice(e.target.value)}
                    />
                    <Banknote size={20} />
                    <span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span>
                  </label>
                </fieldset>
                <p className="note">
                  {paymentChoice === 'COD'
                    ? 'Pay the delivery partner when your order arrives.'
                    : 'Demo payment only: no money will be charged.'}
                </p>
                <button className="btn btn--primary btn--block" onClick={savePaymentMethod} disabled={savingPayment}>
                  {savingPayment
                    ? <><Loader2 size={18} className="spin" /> Saving payment...</>
                    : paymentChoice === 'COD'
                      ? 'Confirm cash on delivery'
                      : `Pay ${money(payment?.amount ?? order.totalAmount)} with ${paymentChoice === 'UPI' ? 'UPI' : 'card'}`}
                </button>
              </div>
            )}
            {snapshot?.address && <p className="note"><MapPin size={16} /> {snapshot.address}</p>}
          </section>

          <section className="card panel">
            <h2><Bell size={18} /> Notifications</h2>
            {notifications.length === 0 ? (
              <p className="muted">Updates will appear here as your order moves along.</p>
            ) : (
              <ul className="notes">
                {[...notifications].reverse().map((n, idx) => (
                  <li key={`${n.type}-${idx}`}>
                    <span className="notes__time">{timeOnly(n.sentAt)}</span>
                    <span>{n.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
