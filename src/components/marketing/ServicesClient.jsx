'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TbArrowRight } from 'react-icons/tb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { services } from '@/data/services';
import Link from 'next/link';
import { getText } from '@/lib/utils';

export default function ServicesClient() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative h-[30vh] flex items-center justify-center bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/Hero 4.jpg" 
            alt="Services Hero" 
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-3xl lg:text-3xl font-bold mb-4 text-white uppercase"
          >
            {t('nav.services')}
          </motion.h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">{t('services.subtitle')}</p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-accent mx-auto mt-6 rounded-full" 
          />
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 h-full border-muted bg-muted/30 flex flex-col relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                  <CardHeader className="relative z-10">
                    <div className='flex gap-5'>
                       <div className="w-14 h-14 bg-accent text-white rounded-xl flex items-center justify-center shadow-md transition-colors duration-300">
                      <service.icon size={30} />
                    </div>
                       <CardTitle className="group-hover:text-gold transition-colors text-2xl font-bold flex items-center">
                       {getText(service.title, currentLang)}
                    </CardTitle>

                       </div>
                   
                 
                    <CardDescription className="text-base pt-2 leading-relaxed min-h-[4.5rem]">
                      {getText(service.desc, currentLang)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto relative z-10">
                    <Link href={`/services/${service.id}`} className="inline-flex items-center gap-2 text-accent font-bold group/link">
                      Read More <TbArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-10 bg-muted text-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('services.process_title')}</h2>
            <div className="w-20 h-1 bg-accent mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[ 
              { step: "01", title: t('services.process_step1_title'), text: t('services.process_step1_text') },
              { step: "02", title: t('services.process_step2_title'), text: t('services.process_step2_text') },
              { step: "03", title: t('services.process_step3_title'), text: t('services.process_step3_text') },
              { step: "04", title: t('services.process_step4_title'), text: t('services.process_step4_text') }
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                <div className="text-4xl font-bold text-primary absolute -top-10 left-1/2 -translate-x-1/2 select-none">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-accent mb-4 relative z-10">{item.title}</h3>
                <p className="text-primary text-sm relative z-10">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
