<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Проста корзина — Demo</title>
  <style>
    :root{--accent:#2563eb;--muted:#6b7280}
    body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial;display:flex;min-height:100vh;margin:0;background:#f8fafc;color:#111827}
    .container{max-width:1000px;margin:auto;padding:28px}
    header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
    h1{font-size:20px;margin:0}
    .grid{display:grid;grid-template-columns:1fr 360px;gap:18px}
    .card{background:#fff;border-radius:12px;padding:16px;box-shadow:0 6px 18px rgba(16,24,40,0.06)}
    .products{display:grid;gap:12px}
    .product{display:flex;gap:12px;align-items:center}
    .thumb{width:84px;height:64px;border-radius:8px;background:linear-gradient(135deg,#eef2ff,#f0f9ff);display:flex;align-items:center;justify-content:center;font-weight:600;color:var(--muted)}
    .meta{flex:1}
    .meta h3{margin:0;font-size:15px}
    .meta p{margin:4px 0 0 0;color:var(--muted);font-size:13px}
    .actions{display:flex;flex-direction:column;gap:8px;align-items:flex-end}
    button{background:var(--accent);color:#fff;border:0;padding:8px 10px;border-radius:8px;cursor:pointer}
    button.ghost{background:transparent;border:1px solid #e5e7eb;color:var(--muted)}
    .cart-list{display:flex;flex-direction:column;gap:10px;margin-top:8px}
    .cart-item{display:flex;align-items:center;gap:12px}
    .qty{display:inline-flex;align-items:center;border-radius:8px;overflow:hidden}
    .qty button{background:transparent;color:var(--accent);padding:6px 8px;border:1px solid #e6eefc}
    .qty span{padding:6px 10px;border-top:1px solid #e6eefc;border-bottom:1px solid #e6eefc}
    .totals{margin-top:12px;border-top:1px dashed #e6eefc;padding-top:12px}
    .muted{color:var(--muted);font-size:13px}
    .empty{color:var(--muted);text-align:center;padding:24px}
    .checkout{width:100%;padding:10px;border-radius:10px;font-weight:600}
    footer{margin-top:18px;color:var(--muted);font-size:13px}
    @media(max-width:880px){.grid{grid-template-columns:1fr} .actions{align-items:flex-start}}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Магазин — демо корзина</h1>
      <div class="muted">Корзина зберігається у localStorage</div>
    </header>

    <div class="grid">
      <section class="card">
        <h2 style="margin:0 0 12px 0;font-size:16px">Товари</h2>
        <div class="products" id="products"></div>
      </section>

      <aside class="card">
        <h2 style="margin:0 0 12px 0;font-size:16px">Корзина</h2>
        <div id="cart" class="cart-list"></div>
        <div id="cart-empty" class="empty" style="display:none">Корзина порожня</div>
        <div class="totals" id="totals" style="display:none">
          <div style="display:flex;justify-content:space-between"><div class="muted">Проміжок</div><div id="subtotal">0 ₴</div></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><div class="muted">Доставка</div><div id="shipping">50 ₴</div></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;margin-top:8px"><div>Разом</div><div id="total">0 ₴</div></div>
          <button id="checkout" class="checkout" style="margin-top:12px">Оформити замовлення</button>
          <button id="clear" class="ghost" style="margin-top:8px">Очистити</button>
        </div>
      </aside>
    </div>

    <footer>Підказка: відкрийте консоль, щоб побачити обʼєкт замовлення при натисканні «Оформити замовлення».</footer>
  </div>

  <script>
    // Простий список товарів — налаштуйте під свій сайт
    const PRODUCTS = [
      { id: 'p1', title: 'Еко-чашка 350мл', price: 220, sku: 'CUP-350' },
      { id: 'p2', title: 'Натуральне мило', price: 85, sku: 'SOAP-01' },
      { id: 'p3', title: 'Блокнот A5', price: 145, sku: 'NOTE-A5' },
      { id: 'p4', title: 'Футболка (S/M/L)', price: 450, sku: 'TSHIRT-01' }
    ]

    // Ключ для localStorage
    const STORAGE_KEY = 'demo_cart_v1'

    // Стан корзини в памʼяті
    let cart = loadCart()

    // --- Рендер товарів ---
    const productsEl = document.getElementById('products')
    PRODUCTS.forEach(p => {
      const el = document.createElement('div')
      el.className = 'product'
      el.innerHTML = `
        <div class="thumb">${p.title.split(' ')[0]}</div>
        <div class="meta">
          <h3>${p.title}</h3>
          <p class="muted">${p.sku} • ${p.price} ₴</p>
        </div>
        <div class="actions">
          <button data-add="${p.id}">Додати в кошик</button>
        </div>`
      productsEl.appendChild(el)
    })

    // --- Обробник додавання ---
    productsEl.addEventListener('click', e => {
      const btn = e.target.closest('button')
      if (!btn) return
      const id = btn.dataset.add
      if (id) addToCart(id)
    })

    // --- Cart rendering ---
    const cartEl = document.getElementById('cart')
    const cartEmptyEl = document.getElementById('cart-empty')
    const totalsEl = document.getElementById('totals')
    const subtotalEl = document.getElementById('subtotal')
    const shippingEl = document.getElementById('shipping')
    const totalEl = document.getElementById('total')
    const checkoutBtn = document.getElementById('checkout')
    const clearBtn = document.getElementById('clear')

    function renderCart(){
      cartEl.innerHTML = ''
      if (!cart.items.length){
        cartEmptyEl.style.display = 'block'
        totalsEl.style.display = 'none'
        return
      }
      cartEmptyEl.style.display = 'none'
      totalsEl.style.display = 'block'

      cart.items.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.id)
        const row = document.createElement('div')
        row.className = 'cart-item'
        row.innerHTML = `
          <div class="thumb" style="width:64px;height:48px;font-size:14px">${product.title.split(' ')[0]}</div>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center"><div>${product.title}</div><div>${(product.price*item.qty).toFixed(0)} ₴</div></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
              <div class="qty">
                <button data-decrease="${item.id}">−</button>
                <span>${item.qty}</span>
                <button data-increase="${item.id}">+</button>
              </div>
              <button class="ghost" data-remove="${item.id}">Видалити</button>
            </div>
          </div>`
        cartEl.appendChild(row)
      })

      const subtotal = cart.items.reduce((s,i)=>{
        const p = PRODUCTS.find(x=>x.id===i.id)
        return s + p.price * i.qty
      },0)
      const shipping = subtotal > 0 ? 50 : 0
      const total = subtotal + shipping

      subtotalEl.textContent = `${subtotal.toFixed(0)} ₴`
      shippingEl.textContent = `${shipping} ₴`
      totalEl.textContent = `${total.toFixed(0)} ₴`
    }

    // Обробник картки (збільшити/зменшити/видалити)
    cartEl.addEventListener('click', e => {
      const inc = e.target.closest('[data-increase]')
      const dec = e.target.closest('[data-decrease]')
      const rem = e.target.closest('[data-remove]')
      if (inc) changeQty(inc.dataset.increase, 1)
      if (dec) changeQty(dec.dataset.decrease, -1)
      if (rem) removeFromCart(rem.dataset.remove)
    })

    clearBtn.addEventListener('click', ()=>{
      if (!confirm('Очистити корзину?')) return
      cart.items = []
      saveCart()
      renderCart()
    })

    checkoutBtn.addEventListener('click', ()=>{
      if (!cart.items.length){ alert('Корзина порожня'); return }
      // Симуляція оформлення — тут можна викликати API
      const order = {
        id: 'order_' + Date.now(),
        created: new Date().toISOString(),
        items: cart.items.map(i=>{
          const p = PRODUCTS.find(x=>x.id===i.id)
          return { id: p.id, title: p.title, sku: p.sku, price: p.price, qty: i.qty }
        }),
        subtotal: cart.items.reduce((s,i)=>{
          const p = PRODUCTS.find(x=>x.id===i.id); return s + p.price*i.qty
        },0),
        shipping: 50,
        total: 0
      }
      order.total = order.subtotal + order.shipping
      console.log('Order payload (simulate send to server):', order)
      alert('Замовлення згенеровано. Подивіться консоль (F12).')
      // після оформлення очистимо корзину
      cart.items = []
      saveCart()
      renderCart()
    })

    // --- Cart management functions ---
    function addToCart(id, qty=1){
      const found = cart.items.find(i=>i.id===id)
      if (found) found.qty += qty
      else cart.items.push({id, qty})
      saveCart()
      renderCart()
    }

    function changeQty(id, delta){
      const it = cart.items.find(i=>i.id===id)
      if (!it) return
      it.qty += delta
      if (it.qty <= 0){
        cart.items = cart.items.filter(i=>i.id!==id)
      }
      saveCart()
      renderCart()
    }

    function removeFromCart(id){
      cart.items = cart.items.filter(i=>i.id!==id)
      saveCart()
      renderCart()
    }

    function saveCart(){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    }
    function loadCart(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return { items: [] }
        return JSON.parse(raw)
      }catch(e){ return { items: [] } }
    }

    // Ініціалізація
    renderCart()

    // --- Простий API: експортуємо функції на window для налагодження ---
    window._cart = cart
    window.addToCart = addToCart
    window.getCart = ()=>cart
  </script>
</body>
</html>
