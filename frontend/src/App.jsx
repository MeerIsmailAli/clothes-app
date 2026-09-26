import { useEffect, useMemo, useState } from 'react'
import AuthDialog from './components/AuthDialog.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { useCart } from './context/CartContext.jsx'

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api'

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
}

function ClothingCard({ item, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-image">
        {item.image_url ? <img src={item.image_url} alt={item.name} loading="lazy" /> : <span aria-hidden="true">{item.category?.slice(0, 1).toUpperCase() || 'S'}</span>}
        <span className={`stock-tag ${item.stock > 0 ? '' : 'sold-out'}`}>{item.stock > 0 ? 'In stock' : 'Sold out'}</span>
      </div>
      <div className="product-info">
        <div className="product-heading"><h3>{item.name}</h3><strong>{formatPrice(item.price)}</strong></div>
        <p className="product-category">{item.category}</p>
        {item.description && <p className="product-description">{item.description}</p>}
        {(item.color || item.size) && <p className="product-details">{[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(' · ')}</p>}
        <button className="add-to-bag" disabled={item.stock < 1} onClick={() => onAdd(item)}>{item.stock > 0 ? 'ADD TO BAG' : 'SOLD OUT'} <span>↗</span></button>
      </div>
    </article>
  )
}

function App() {
  const { user, logout } = useAuth()
  const { count, addItem } = useCart()
  const [authOpen, setAuthOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [ordering, setOrdering] = useState('')
  const [inStock, setInStock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))].sort(), [items])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (category) params.set('category', category)
    if (ordering) params.set('ordering', ordering)
    if (inStock) params.set('in_stock', 'true')
    setLoading(true)
    setError('')
    fetch(`${API_URL}/clothes/?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('The catalog could not be loaded.')
        return response.json()
      })
      .then((data) => setItems(Array.isArray(data) ? data : data.results || []))
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Unable to reach the store. Start the Django server and refresh the page.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [search, category, ordering, inStock])

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Thread and Form home"><span className="wordmark-mark">T</span> THREAD & FORM</a>
        <nav className="header-actions" aria-label="Account and store">
          <a className="header-link" href="#collection">THE COLLECTION <span>↘</span></a>
          <button className="cart-button" onClick={() => setCartOpen(true)}>BAG ({count})</button>
          {user ? <div className="signed-in"><span>HI, {user.username.toUpperCase()}</span><button onClick={logout}>SIGN OUT</button></div> : <button className="account-button" onClick={() => setAuthOpen(true)}>SIGN IN</button>}
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <p className="eyebrow">A MORE CONSIDERED WARDROBE</p>
          <h1>Wear what<br /><em>moves you.</em></h1>
          <p className="hero-copy">Everyday pieces, chosen with care. Find your next forever favorite.</p>
          <a className="hero-link" href="#collection">EXPLORE THE COLLECTION <span>↓</span></a>
          <div className="hero-stamp" aria-hidden="true">MADE FOR<br />YOUR EVERYDAY</div>
        </section>

        <section className="collection" id="collection">
          <div className="collection-top">
            <div><p className="eyebrow">THE SHOP</p><h2>Find your fit.</h2></div>
            <p className="item-count">{loading ? 'LOADING…' : `${items.length} ${items.length === 1 ? 'PIECE' : 'PIECES'}`}</p>
          </div>
          <div className="toolbar">
            <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pieces" aria-label="Search clothing" /></label>
            <div className="filters">
              <label className="select-label"><span className="sr-only">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="select-label"><span className="sr-only">Sort by</span><select value={ordering} onChange={(event) => setOrdering(event.target.value)}><option value="">Recently added</option><option value="price">Price: low to high</option><option value="-price">Price: high to low</option><option value="name">Name: A to Z</option></select></label>
              <label className="stock-filter"><input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} /> In stock</label>
            </div>
          </div>

          {error ? <div className="notice error-notice">{error}</div> : loading ? <div className="notice">Finding the good stuff…</div> : items.length ? <div className="product-grid">{items.map((item) => <ClothingCard key={item.id} item={item} onAdd={addItem} />)}</div> : <div className="notice empty-state"><span>Nothing on the rack just yet.</span><p>Try another search or check back soon.</p></div>}
        </section>
      </main>

      <footer><a className="wordmark" href="#top"><span className="wordmark-mark">T</span> THREAD & FORM</a><span>GOOD CLOTHES. GOOD DAYS.</span></footer>
      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} />}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </div>
  )
}

export default App
