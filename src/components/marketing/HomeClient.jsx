'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TbGavel, TbScale, TbAward, TbUsers, TbChevronRight } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { services as allServices } from '@/data/services';
import { getText } from '@/lib/utils';
import Image from 'next/image';

export default function HomeClient() {
  const { t, i18n } = useTranslation();

  const services = allServices.slice(0, 4);

  return (
    <div className="flex flex-col w-full ">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-primary font-['Poppins', sans-serif]">
        {/* Placeholder for user-uploaded image */}
        <div className="absolute inset-0 opacity-40 bg-[url('/Hero2.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-10 leading-relaxed font-light">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button variant="gold" size="lg" className="rounded-full px-10">
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="rounded-full px-10 border-white text-white hover:bg-white hover:text-primary">
                  {t('nav.about')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-accent font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
                {t('nav.about')}
              </span>
              <h2 className="text-4xl font-bold text-primary mb-6">
                AgriWatch
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t('hero.subtitle')} {t('about.home')}
              </p>
              <Link href="/about">
                <Button variant="ghost" className="group p-0 hover:bg-transparent text-accent font-bold flex items-center gap-2 uppercase">
                  {t('about.moreabout')} <TbChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            <div className="relative">
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden shadow-2xl relative">
                 <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 italic">
                    <Image 
                      src="/Hero1.jpg" 
                      alt="Firm Intro Image" 
                      fill
                      className='object-cover' 
                    />
                 </div>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-accent text-white p-8 rounded-xl shadow-xl hidden md:block">
                <p className="text-4xl font-bold mb-1">10+</p>
                <p className="text-sm uppercase tracking-wider">{t('about.homeExcellenceYear')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-10 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-4xl font-bold text-primary mb-4 uppercase">{t('services.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('services.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/services/${service.id}`} className="block h-full">
                  <Card className="h-full border-none shadow-md hover:shadow-xl bg-white hover:bg-accent/20 transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                        <service.icon size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-accent  transition-colors duration-300">
                        {getText(service.title, i18n.language)}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {getText(service.desc, i18n.language)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link href="/services">
              <Button variant="outline" size="lg" className="rounded-full text-white bg-accent hover:bg-primary hover:text-white font-semibold">
                {t('services.viewAll')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team Preview CTA */}
      <section className="py-10 bg-white text-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-4xl font-bold mb-6 uppercase">{t('team.homeTitle')}</h2>
              <p className="text-primary/70 text-lg mb-8 leading-relaxed">
                {t('team.homeDescription')}
              </p>
              <Link href="/team">
                <Button variant="gold" size="lg" className="rounded-full px-10">
                  {t('team.meetTeam')}
                </Button>
              </Link>
            </div>
            <div className="relative group">
              <div className="w-full h-auto md:w-80 md:h-100 relative rounded overflow-hidden"> 
                 <Image 
                   src="/team member 4.jpg" 
                   alt="Team Member" 
                   width={320}
                   height={400}
                   className='w-full h-full object-cover' 
                 />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
