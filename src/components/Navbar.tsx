import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Search, Heart, ShoppingCart, ChevronDown, Menu, X, User } from 'lucide-react'
import navbarData from '@/data/navbar.json'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [pagesOpen, setPagesOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { logo, mainNav, rightNav, favorites, cart } = navbarData

  const handleLogout = async () => {
    await signOut()
    sessionStorage.clear()
    localStorage.removeItem('appLoggedIn')
    localStorage.removeItem('appUserEmail')
    localStorage.removeItem('appUserName')
    setAccountOpen(false)
    navigate('/')
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account'
  const userEmail = user?.email || ''

  // Build account links dynamically based on auth state
  const accountLinks = [
    { label: 'Personal Info', href: '/personal-info', icon: 'User' },
    { label: 'My Orders', href: '/my-orders', icon: 'ShoppingBag' },
    { label: 'Addresses', href: '/addresses', icon: 'MapPin' },
  ]

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to={logo.href} className="text-xl font-bold tracking-tight">
            {logo.label}
          </Link>

          {/* Main Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {mainNav.map((item, i) => (
              <div key={i} className="relative">
                {item.children ? (
                  <>
                    <button
                      onClick={() => setPagesOpen(!pagesOpen)}
                      className="flex items-center gap-1 text-sm hover:text-gray-600 transition"
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${pagesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {pagesOpen && (
                      <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-64 z-50">
                        {item.children.map((link, j) => (
                          <Link key={j} to={link.href} className="block text-sm py-1 hover:text-gray-600" onClick={() => setPagesOpen(false)}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={item.href} className="text-sm hover:text-gray-600 transition">{item.label}</Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right Nav */}
          <div className="flex items-center gap-4">
            {rightNav.map((item, i) => (
              <div key={i} className="relative">
                {item.label === 'Search' ? (
                  <button className="p-2 hover:bg-gray-100 rounded-full transition">
                    <Search className="w-5 h-5" />
                  </button>
                ) : item.label === 'Favorites' ? (
                  <button onClick={() => setFavoritesOpen(!favoritesOpen)} className="p-2 hover:bg-gray-100 rounded-full transition relative">
                    <Heart className="w-5 h-5" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                    )}
                  </button>
                ) : item.label === 'Cart' ? (
                  <button onClick={() => setCartOpen(!cartOpen)} className="p-2 hover:bg-gray-100 rounded-full transition relative">
                    <ShoppingCart className="w-5 h-5" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                    )}
                  </button>
                ) : null}

                {/* Favorites Dropdown */}
                {item.label === 'Favorites' && favoritesOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-72 z-50">
                    <h3 className="font-medium mb-3">My wishlist</h3>
                    {favorites.map((fav: any, j: number) => (
                      <div key={j} className="flex gap-3 py-3 border-b last:border-0">
                        <div className="w-16 h-20 bg-gray-100 rounded flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{fav.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {fav.originalPrice && <span className="text-xs text-gray-400 line-through">${fav.originalPrice}</span>}
                            <span className="text-sm">${fav.price}</span>
                          </div>
                          <button className="text-xs text-gray-500 hover:text-black mt-1">Add to cart</button>
                        </div>
                      </div>
                    ))}
                    <Link to="#" className="block text-center text-sm mt-3 hover:underline">View wishlist</Link>
                  </div>
                )}

                {/* Cart Dropdown */}
                {item.label === 'Cart' && cartOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-80 z-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Cart ({cart.itemCount})</h3>
                      <span className="text-sm font-medium">${cart.subtotal}</span>
                    </div>
                    {cart.items.map((cartItem: any, j: number) => (
                      <div key={j} className="flex gap-3 py-3 border-b last:border-0">
                        <div className="w-16 h-20 bg-gray-100 rounded flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{cartItem.name}</p>
                          <p className="text-xs text-gray-500">{cartItem.color} / {cartItem.size}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {cartItem.originalPrice && <span className="text-xs text-gray-400 line-through">${cartItem.originalPrice}</span>}
                            <span className="text-sm">${cartItem.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 space-y-2">
                      <Link to="/cart" className="block w-full py-2 bg-black text-white text-center text-sm rounded-lg hover:bg-gray-800">Checkout</Link>
                      <Link to="/cart" className="block w-full py-2 border text-center text-sm rounded-lg hover:bg-gray-50">Edit Cart</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* User Avatar / Account Dropdown */}
            <div className="relative">
              <button onClick={() => setAccountOpen(!accountOpen)} className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                {user ? (
                  <span className="text-xs font-medium text-gray-600">{userName.charAt(0).toUpperCase()}</span>
                ) : (
                  <User className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {accountOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-80 z-50">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-600">{userName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{userName}</p>
                          <p className="text-xs text-gray-500">{userEmail}</p>
                        </div>
                      </div>
                      <div className="border-t pt-3 space-y-1">
                        {accountLinks.map((link: any, index: number) => (
                          <Link
                            key={index}
                            to={link.href}
                            className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setAccountOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="w-full rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-gray-900"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <span className="block text-sm font-semibold">Account</span>
                      </div>
                      <Link
                        to="/login"
                        className="block w-full rounded-lg bg-black px-3 py-2 text-sm text-white text-center hover:bg-gray-900"
                        onClick={() => setAccountOpen(false)}
                      >
                        Log in
                      </Link>
                      <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/create-account" className="text-black underline" onClick={() => setAccountOpen(false)}>
                          Register
                        </Link>
                      </p>
                      <div className="border-t pt-3 space-y-2">
                        <Link
                          to="/my-orders"
                          className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setAccountOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/order-checkup"
                          className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setAccountOpen(false)}
                        >
                          Order Status
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="space-y-2">
              {mainNav.map((item, i) => (
                <div key={i}>
                  {item.children ? (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-500">{item.label}</span>
                      <div className="pl-4 space-y-1">
                        {item.children.map((link: any, j: number) => (
                          <Link key={j} to={link.href} className="block text-sm py-1 hover:text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link to={item.href} className="block text-sm py-2 hover:text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
