'use client';

import { useTranslation } from 'react-i18next';
import { TbMail, TbPhone, TbMapPin } from 'react-icons/tb';

export default function TopBar() {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:block bg-primary text-white py-2 border-b border-white/10">
      <div className="container mx-auto  px-4 flex justify-between items-center text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <TbMail className="text-accent" />
            <a href={`mailto:${t('topbar.email')}`} className="hover:text-accent transition-colors">
              {t('topbar.email')}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <TbPhone className="text-accent" />
            <a href={`tel:${t('topbar.phone')}`} className="hover:text-accent transition-colors">
              {t('topbar.phone')}
            </a>
          </div>
        </div>
        <div className='flex gap-8'>
        <div className="flex items-center gap-2">
          <TbMapPin className="text-accent" />
          <span>{t('topbar.location2')}</span>
        </div>
         <div className="flex items-center gap-2">
          <TbMapPin className="text-accent" />
          <span>{t('topbar.location')}</span>
        </div>
      
        </div>
      </div>
    </div>
  );
}
