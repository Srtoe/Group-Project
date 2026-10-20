
import { useEffect, useState } from 'react'
import products from './data'
import './App.css'

const fallbackImage =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">' +
      '<rect width="300" height="200" rx="12" fill="#e7eef6"/>' +
      '<rect x="82" y="42" width="136" height="116" rx="12" fill="#123963"/>' +
      '<circle cx="150" cy="100" r="36" fill="#ffffff"/>' +
      '<path d="M140 80 L174 100 L140 120 Z" fill="#0759b8"/>' +
      '</svg>'
  )

function App() {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('eztech-cart')
      const storedItems = savedCart ? JSON.parse(savedCart) : []

      if (!Array.isArray(storedItems)) {
        return []
      }

      return storedItems.filter((item) =>
        products.some((product) => product.id === item.id)
      )
    } catch (error) {
      console.error('Unable to load shopping cart:', error)
      return []
    }
  })

  const [warning, setWarning] = useState('')

  useEffect(() => {
    localStorage.setItem('eztech-cart', JSON.stringify(cart))
  }, [cart])

  const isSubscription = (product) => product.id <= 4

  const handleAddToCart = (product) => {
    setWarning('')

    if (isSubscription(product)) {
      const existingSubscription = cart.find((item) =>
        isSubscription(item)
      )

      if (existingSubscription) {
        setWarning(
          'Only one subscription is allowed at a time. Remove your current subscription before adding another.'
        )
        return
      }
    }

    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart((currentCart) => [
        ...currentCart,
        { ...product, quantity: 1 },
      ])
    }
  }

  const handleRemoveItem = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    )
    setWarning('')
  }

  const handleUpdateQuantity = (id, change) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== id) {
          return item
        }

        const newQuantity = item.quantity + change

        if (newQuantity < 1) {
          return item
        }

        if (isSubscription(item) && newQuantity > 1) {
          return item
        }

        return { ...item, quantity: newQuantity }
      })
    )
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">▶</span>
          <h2>EZTechMovie / StreamList</h2>
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#subscriptions">Subscriptions</a>
          <a href="#cart">Cart ({cartCount})</a>
        </nav>
      </header>

      <main>
        <section id="home" className="welcome-section">
          <h1>Welcome to EZTechMovie</h1>
          <p>
            Explore our streaming subscriptions and EZTech accessories.
          </p>
        </section>

        <section id="subscriptions" className="products-section">
          <h2>Subscriptions and Accessories</h2>

          {warning && (
            <div className="cart-warning" role="alert">
              {warning}
            </div>
          )}

          <div className="products-grid">
            {products.map((product) => (
              <div className="product-card" key={product.id}>
                <img
                  src={product.img}
                  alt={product.service}
                  className="product-image"
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = fallbackImage
                  }}
                />

                <h3>{product.service}</h3>
                <p>{product.serviceInfo}</p>

                <p className="product-price">
                  ${product.price.toFixed(2)}
                </p>

                <button
                  type="button"
                  className="add-button"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="cart" className="cart-section">
          <h2>Shopping Cart</h2>

          {cart.length === 0 ? (
            <p>Your shopping cart is currently empty.</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-info">
                      <h3>{item.service}</h3>
                      <p>${item.price.toFixed(2)} each</p>
                    </div>

                    <div className="cart-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(item.id, -1)
                        }
                        disabled={item.quantity === 1}
                        aria-label={`Decrease ${item.service} quantity`}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(item.id, 1)
                        }
                        disabled={isSubscription(item)}
                        aria-label={`Increase ${item.service} quantity`}
                      >
                        +
                      </button>
                    </div>

                    <p className="cart-item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <p>Total Items: {cartCount}</p>
                <h3>Total Price: ${cartTotal.toFixed(2)}</h3>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
