import { useCart } from '../context/CartContext.jsx'

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
}

export default function CartDrawer({ onClose }) {
  const { lines, subtotal, setQuantity, removeItem } = useCart()
  return (
    <div className="cart-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-heading"><div><p className="eyebrow">YOUR PICKS</p><h2 id="cart-title">The bag <span>({lines.reduce((sum, line) => sum + line.quantity, 0)})</span></h2></div><button className="dialog-close" onClick={onClose} aria-label="Close cart">×</button></div>
        {lines.length ? <>
          <div className="cart-lines">{lines.map(({ item, quantity }) => <article className="cart-line" key={item.id}>
            <div className="cart-thumb">{item.image_url ? <img src={item.image_url} alt="" /> : <span>{item.category?.slice(0, 1).toUpperCase() || 'S'}</span>}</div>
            <div className="cart-line-info"><div className="cart-line-title"><h3>{item.name}</h3><strong>{formatPrice(Number(item.price) * quantity)}</strong></div><p>{item.category}{item.color ? ` · ${item.color}` : ''}</p>
              <div className="cart-line-actions"><div className="quantity-control"><button onClick={() => setQuantity(item.id, quantity - 1)} aria-label={`Remove one ${item.name}`}>−</button><span>{quantity}</span><button onClick={() => setQuantity(item.id, quantity + 1)} disabled={quantity >= item.stock} aria-label={`Add one ${item.name}`}>+</button></div><button className="remove-link" onClick={() => removeItem(item.id)}>REMOVE</button></div>
            </div>
          </article>)}</div>
          <div className="cart-summary"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>Shipping and any applicable taxes are calculated at checkout.</p><button disabled className="checkout-button">CHECKOUT COMING SOON</button></div>
        </> : <div className="cart-empty"><span>Your bag is taking a quiet moment.</span><p>Add something you love and it’ll show up here.</p><button onClick={onClose}>BACK TO THE COLLECTION</button></div>}
      </aside>
    </div>
  )
}
