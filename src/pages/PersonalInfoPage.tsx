import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from '@/components/Sidebar'

const sidebarItems = [
  { label: 'Personal Info', href: '/personal-info', icon: 'User', active: true },
  { label: 'My Orders', href: '/my-orders', icon: 'ShoppingBag', active: false },
  { label: 'Addresses', href: '/addresses', icon: 'MapPin', active: false },
]

export default function PersonalInfoPage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [loading, user, navigate])

  if (loading) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-12">
          <Sidebar title="My Account" items={sidebarItems} hasDivider={true} />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const userEmail = user.email || ''
  const userPhone = user.user_metadata?.phone || ''

  const handleLogout = async () => {
    await signOut()
    sessionStorage.clear()
    localStorage.removeItem('appLoggedIn')
    localStorage.removeItem('appUserEmail')
    localStorage.removeItem('appUserName')
    navigate('/login')
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-12">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">My Account</h2>
          <nav className="space-y-1">
            {sidebarItems.map((item, i) => (
              <Link
                key={i}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  item.active
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t my-4" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-black w-full text-left"
          >
            <span>Logout</span>
          </button>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              <span className="text-xl font-medium text-gray-500">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">{userName}</h1>
              <p className="text-sm text-gray-500">{userEmail}</p>
              {userPhone && <p className="text-sm text-gray-500">{userPhone}</p>}
            </div>
          </div>

          <div className="border rounded-lg divide-y">
            {/* Profile Photo */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-500">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium">Profile photo</span>
              </div>
              <button className="text-sm text-gray-600 hover:text-black">Upload new photo</button>
            </div>

            {/* First Name */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">First name</p>
                <p className="text-sm font-medium">{userName.split(' ')[0] || '—'}</p>
              </div>
              <button className="text-sm text-gray-500 hover:text-black">Edit</button>
            </div>

            {/* Last Name */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last name</p>
                <p className="text-sm font-medium">{userName.split(' ').slice(1).join(' ') || '—'}</p>
              </div>
              <button className="text-sm text-gray-500 hover:text-black">Edit</button>
            </div>

            {/* Email */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium">{userEmail || '—'}</p>
              </div>
              <button className="text-sm text-gray-500 hover:text-black">Edit</button>
            </div>

            {/* Phone */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium">{userPhone || '—'}</p>
              </div>
              <button className="text-sm text-gray-500 hover:text-black">Edit</button>
            </div>

            {/* Password */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-sm text-gray-500">Change your account password</p>
              </div>
              <Link to="/forgot-password" className="px-4 py-2 border rounded text-sm hover:bg-gray-50">
                Change password
              </Link>
            </div>

            {/* Delete Account */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Delete account</p>
                <p className="text-sm text-gray-500">Permanently delete your account and all associated data</p>
              </div>
              <button className="px-4 py-2 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50">
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
