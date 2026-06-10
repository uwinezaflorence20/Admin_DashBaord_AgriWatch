'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { TbMenu, TbX, TbChevronDown } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

import { services } from '@/data/services';
import { getText } from '@/lib/utils';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const menuItems = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { 
      name: t('nav.services'), 
      href: '/services',
      dropdown: services.map(service => ({
        name: getText(service.title, i18n.language),
        href: `/services/${service.id}`
      }))
    },
    { name: t('nav.team'), href: '/team' },
    { 
      name:t('publications.title'), 
      href: '#',
      dropdown: [
        { name: t('nav.news'), href: '/news' },
        { name: t('nav.activities'), href: '/activities' },
        { name: t('articles.title'), href: '/articles' },
      ]
    },
   
    { name: t('nav.contact'), href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md font-['Poppins', sans-serif]">
      <div className="container px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo / Brand Name */}
          <Link href="/" >
        <div className='w-24 h-20 relative  rounded  overflow-hidden'>
            <img src="/logo2.png" alt="Logo" className="w-full h-full" />
        </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-8 font-['Poppins', sans-serif]">
            <div className="flex gap-6">
              {menuItems.map((item) => {
                const isDropdown = !!item.dropdown;
                const isActive = item.dropdown 
                  ? item.dropdown.some(sub => pathname === sub.href)
                  : pathname === item.href;

                if (isDropdown) {
                  const isClickable = item.href && item.href !== '#';
                  const NavComponent = isClickable ? Link : 'button';
                  const componentProps = isClickable ? { href: item.href } : { type: 'button' };

                  return (
                    <div 
                      key={item.name} 
                      className="relative group"
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <NavComponent
                        {...componentProps}
                        className={cn(
                          "text-sm font-medium transition-all py-8 flex items-center gap-1 group",
                          isActive ? "text-accent" : "hover:text-accent text-primary/80"
                        )}
                      >
                        {item.name}
                        <TbChevronDown className={cn("transition-transform duration-300", activeDropdown === item.name && "rotate-180")} />
                        {isActive && (
                          <motion.div 
                            layoutId="nav-underline"
                            className="absolute bottom-[20px] left-0 w-full h-0.5 bg-accent"
                          />
                        )}
                      </NavComponent>
                      
                      <AnimatePresence>
                        {activeDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 w-64 bg-white border border-border shadow-xl rounded-lg py-2 mt-[-10px]"
                          >
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={cn(
                                  "block px-4 py-2 text-sm transition-colors",
                                  pathname === subItem.href ? "bg-accent/10 text-accent font-bold" : "text-primary/80 hover:bg-muted hover:text-accent"
                                )}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-all py-8 relative group",
                      isActive ? "text-accent" : "hover:text-accent text-primary/80"
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute bottom-[20px] left-0 w-full h-0.5 bg-accent"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center border-l border-border pl-12">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 lg:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary hover:text-accent p-2"
            >
              {isOpen ? <TbX size={28} /> : <TbMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {menuItems.map((item) => {
                const isDropdown = !!item.dropdown;
                const isActive = item.dropdown 
                  ? item.dropdown.some(sub => pathname === sub.href)
                  : pathname === item.href;
                
                if (isDropdown) {
                  const isClickable = item.href && item.href !== '#';
                  return (
                    <div key={item.name} className="flex flex-col gap-2">
                      {isClickable ? (
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-lg font-bold uppercase tracking-widest text-xs mb-2",
                            pathname === item.href ? "text-accent" : "text-accent/80 hover:text-accent"
                          )}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <div className="text-lg font-bold text-accent uppercase tracking-widest text-xs mb-2">
                          {item.name}
                        </div>
                      )}
                      <div className="pl-4 flex flex-col gap-2 border-l-2 border-muted">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "text-base font-medium transition-colors py-1",
                              pathname === subItem.href ? "text-accent" : "text-primary/70"
                            )}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors py-2 flex items-center justify-between",
                      isActive ? "text-accent border-l-4 border-accent pl-4" : "hover:text-accent text-primary"
                    )}
                  >
                    {item.name}
                    {isActive && <div className="h-2 w-2 rounded-full bg-accent" />}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
