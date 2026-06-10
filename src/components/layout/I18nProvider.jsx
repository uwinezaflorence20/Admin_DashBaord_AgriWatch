'use client';

import { useEffect, useState } from 'react';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';

export default function I18nProvider({ children }) {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by waiting for mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white" />
    );
  }

  return children;
}
