'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { TbMail, TbPhone, TbMapPin, TbBrandFacebook, TbBrandTwitter, TbBrandLinkedin, TbBrandTiktok,TbBrandInstagram} from 'react-icons/tb';
import { services } from '@/data/services';
import { getText } from '@/lib/utils';

export default function Footer() {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex flex-col">
              <span className="text-2xl font-bold tracking-tighter text-white">
                AGRIWATCH
              </span>
              <span className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
                AI Potato Disease Detection
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/5 hover:bg-accent transition-colors rounded-full">
                <TbBrandFacebook size={20} />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-accent transition-colors rounded-full">
                <TbBrandTwitter size={20} />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-accent transition-colors rounded-full">
                <TbBrandLinkedin size={20} />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-accent transition-colors rounded-full">
                <TbBrandTiktok size={20} />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-accent transition-colors rounded-full">
                <TbBrandInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/10 pb-2 inline-block">
              {t('nav.about')}
            </h4>
            <ul className="flex flex-col gap-3 text-white/70 text-sm">
              <li><Link href="/about" className="hover:text-accent transition-colors">{t('nav.about')}</Link></li>
              <li><Link href="/services" className="hover:text-accent transition-colors">{t('nav.services')}</Link></li>
              <li><Link href="/news" className="hover:text-accent transition-colors">{t('nav.news')}</Link></li>
              <li><Link href="/team" className="hover:text-accent transition-colors">{t('nav.team')}</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/10 pb-2 inline-block">
              {t('nav.services')}
            </h4>
            <ul className="flex flex-col gap-3 text-white/70 text-sm">
              {services.map(service => (
                <li key={service.id}>
                  <Link href={`/services/${service.id}`} className="hover:text-accent transition-colors">
                    {getText(service.title, i18n.language)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/10 pb-2 inline-block">
              {t('nav.contact')}
            </h4>
            <div className="flex flex-col gap-4 text-white/70 text-sm">
              <div className="flex items-start gap-3">
                <TbMapPin className="text-accent shrink-0 mt-1" />
                <span>{t('topbar.location')}</span>
              </div>
              <div className="flex items-center gap-3">
                <TbPhone className="text-accent shrink-0" />
                <span>{t('topbar.phone')}</span>
              </div>
              <div className="flex items-center gap-3">
                <TbMail className="text-accent shrink-0" />
                <span>{t('topbar.email')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} AgriWatch. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/" className="hover:text-white transition-colors">{t('nav.home')}</a>
            <a href="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
