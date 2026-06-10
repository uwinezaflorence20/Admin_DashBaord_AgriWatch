'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  TbLayoutDashboard, TbUsers, TbActivity, TbSpeakerphone,
  TbLogout, TbMenu2, TbX, TbUser, TbChevronDown, TbNews, TbBriefcase, TbChartHistogram
} from 'react-icons/tb';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { logout as logoutApi } from '@/lib/api';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState('Admin User');
  const [userInitials, setUserInitials] = useState('AD');
  const dropdownRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ... (useEffect and handleLogout same as before)
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);

    // Fetch user details from local storage
    const fetchUserDetails = () => {
      const storedName = localStorage.getItem('name');
      if (storedName) {
        setUserName(storedName);
        const initials = storedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        setUserInitials(initials || 'AD');
      }
    };

    fetchUserDetails();
    window.addEventListener('profileUpdated', fetchUserDetails);
    window.addEventListener('storage', fetchUserDetails);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('profileUpdated', fetchUserDetails);
      window.removeEventListener('storage', fetchUserDetails);
    };
  }, []);

  const isAuthPage =
    pathname === '/admin/login' ||
    pathname === '/login' ||
    pathname === '/admin/forgot-password' ||
    pathname.startsWith('/admin/reset-password');

  if (isAuthPage) return <>{children}</>;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutApi();
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: TbLayoutDashboard },
    { name: 'Team Members', href: '/admin/team', icon: TbUsers },
    { name: 'Activities', href: '/admin/activities', icon: TbActivity },
    { name: 'News', href: '/admin/news', icon: TbSpeakerphone },
    { name: 'Users framer', href: '/admin/articles', icon: TbNews },
    { name: 'Job Postings', href: '/admin/jobs', icon: TbBriefcase },
    { name: 'Model Performance', href: '/admin/model-performance', icon: TbChartHistogram },
    { name: 'Profile', href: '/admin/profile', icon: TbUser },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-primary text-white sticky top-0 h-screen shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <Link href="/admin/dashboard" className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-white">AGRIWATCH</span>
            <span className="text-[10px] font-medium tracking-[0.2em] text-accent uppercase -mt-1">AI Detection System</span>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all group',
                pathname === item.href
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon
                size={22}
                className={cn(
                  'transition-colors',
                  pathname === item.href ? 'text-white' : 'group-hover:text-white'
                )}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all group"
          >
            <TbLogout size={22} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 lg:h-20 bg-white border-b border-border sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-primary">
              <TbMenu2 size={24} />
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-primary">
              {menuItems.find((m) => m.href === pathname)?.name || 'Admin Panel'}
            </h1>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 hover:bg-muted/40 rounded-xl px-3 py-2 transition-all"
            >
              <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-primary leading-none">{userName}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Super Admin</span>
              </div>
              <div className="w-10 h-10 lg:w-11 lg:h-11 bg-accent rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">{userInitials}</span>
              </div>
              <TbChevronDown
                size={16}
                className={cn('text-muted-foreground transition-transform duration-200', profileOpen && 'rotate-180')}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden"
                >
                  <Link
                    href="/admin/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-muted/40 transition-colors"
                  >
                    <TbUser size={18} className="text-accent" />
                    <span className="font-semibold">Profile</span>
                  </Link>
                  <div className="border-t border-border" />
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <TbLogout size={18} />
                    <span className="font-semibold">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="p-4 lg:p-8 flex-grow">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-primary text-white z-[101] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <span className="text-xl font-bold tracking-tighter">AGRIWATCH</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <TbX size={24} />
                </button>
              </div>
              <nav className="flex-grow p-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      pathname === item.href ? 'bg-white/20' : 'hover:bg-white/10'
                    )}
                  >
                    <item.icon size={22} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <TbLogout size={22} className="group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-primary mb-3">Confirm Logout</h3>
              <p className="text-muted-foreground mb-8">
                Are you sure you want to log out? You will need to sign in again to access the admin portal.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 border border-border rounded-xl font-bold text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    'Confirm Logout'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
