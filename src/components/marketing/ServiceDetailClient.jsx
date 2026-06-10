'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TbArrowLeft, TbCheck, TbMessageCircle } from 'react-icons/tb';
import { services } from '@/data/services';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getText } from '@/lib/utils';

export default function ServiceDetailClient({ id }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  
  const service = services.find(s => s.id === id);

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-primary mb-4">Service Not Found</h1>
        <Link href="/services">
          <Button variant="outline">{t('services.backToServices')}</Button>
        </Link>
      </div>
    );
  }

  const title = getText(service.title, currentLang);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="bg-muted text-primary py-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full" />
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/services" className="inline-flex items-center gap-2 font-semibold text-xl uppercase text-accent transition-colors mb-8 group">
            <TbArrowLeft className="group-hover:-translate-x-1 transition-transform" /> {t('services.backToServices')}
          </Link>
          <div className="grid  sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          <div className="max-w-3xl space-y-3">
            <div className='flex gap-5'>
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-15 h-15 bg-accent rounded-2xl flex items-center justify-center  shadow-xl"
            >
               <service.icon size={40} className="text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl  font-bold flex items-center"
            >
              {title}
            </motion.h1>
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              {getText(service.fullDesc, currentLang)}
            </motion.p>
          </div>
          {/* left side design */}
            <aside>
                  <Card className="border-none shadow-2xl p-8 bg-white overflow-hidden relative group">
                     <div className="absolute top-0 left-0 w-full h-2 bg-accent" />
                     <h3 className="text-2xl font-bold text-primary mb-6">{t('services.needService')}</h3>
                     <p className="text-muted-foreground mb-8 text-sm">
                        {t('services.scheduleConsultation')}
                     </p>
                     <Link href={`/contact?subject=${encodeURIComponent(title)}`}>
                        <Button variant="gold" size="lg" className="w-full gap-2 text-white font-bold">
                           <TbMessageCircle size={20} /> {t('services.inquireNow')}
                        </Button>
                     </Link>
                  </Card>
               </aside>

          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
               <div className="lg:col-span-2 space-y-12">

                  <div className="bg-muted/30 p-8  rounded-3xl border border-muted">
                     <h3 className="text-2xl font-bold text-primary mb-4">{t('services.whatWeCover')}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {service.servicesIncluded?.map((item, i) => (
                           <div key={i} className="flex items-start gap-4">
                              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center mt-1">
                                 <TbCheck size={14} className="font-bold" />
                              </div>
                              <span className="font-medium text-primary/80">{getText(item, currentLang)}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <aside>

                  <div className="bg-muted p-8 rounded-3xl ">
                     <h4 className="text-md font-bold mb-4 text-primary">{t('services.whyChooseUs')}</h4>
                     <ul className="space-y-4 text-primary/70 text-sm">
                        <li className="flex gap-2"><span>•</span> {t('services.integrity')}</li>
                        <li className="flex gap-2"><span>•</span> {t('services.expertise')}</li>
                        <li className="flex gap-2"><span>•</span> {t('services.confidentiality')}</li>
                        <li className="flex gap-2"><span>•</span> {t('services.personalized')}</li>
                        <li className="flex gap-2"><span>•</span> {t('services.success')}</li>
                     </ul>
                  </div>
               </aside>
            </div>
         </div>
      </section>
    </div>
  );
}
