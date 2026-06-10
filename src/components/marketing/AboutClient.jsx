'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TbTrophy, TbEye, TbRocket, TbCertificate, TbUsers, TbGavel, TbScale } from 'react-icons/tb';

export default function AboutClient() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Header */}
      <section className="relative h-[20vh] md:h-[30vh] flex items-center justify-center bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/Hero 4.jpg" 
            alt="About Hero" 
            className="w-full h-full object-cover opacity-40 scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-3xl lg:text-3xl font-bold mb-6 text-white uppercase tracking-tight"
          >
            {t('nav.about')}
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1.5 bg-accent mx-auto rounded-full" 
          />
        </div>
      </section>

      {/* Our Story / Who We Are */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <img src="/Hero 4.jpg" alt="Office Interior" className="w-full h-auto" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-accent font-bold tracking-widest uppercase text-sm mb-2"> #{t('about.legacy')}</h2>
              <h3 className="text-3xl md:text-2xl font-semibold text-primary mb-6 leading-tight uppercase ">
                {t('about.ourCommitment')}
              </h3>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  {t('about.firstDesc1')} <span className="text-primary font-bold">"Lustitia"</span>, {t('about.firstDesc2')} <span className="text-primary font-bold">"Omnibus"</span> {t('about.firstDesc3')}
                </p>
                <p>
                  {t('about.secondDesc')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Values Grid */}
      <section className="py-2">
        <div className="container mx-auto px-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-10 bg-white rounded-xl space-y-2 shadow-sm hover:shadow-xl hover:bg-accent/10 transition-all duration-300 border border-transparent group"
              >
                <div className="flex gap-4">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-xl flex items-center justify-center  group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-lg shadow-accent/5">
                  <TbRocket size={32} />
                </div>
                <h4 className="text-2xl font-bold text-primary flex items-center hover:text-accent group-hover:text-accent ">Mission</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                {t('about.ourMission')}
                </p>
              </motion.div>
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-10 bg-white rounded-xl space-y-2 shadow-sm hover:shadow-xl hover:bg-accent/10 transition-all duration-300 border border-transparent group"
              >
                <div className="flex gap-4">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-xl flex items-center justify-center  group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-lg shadow-accent/5">
                  <TbEye size={32} />
                </div>
                <h4 className="text-2xl font-bold text-primary flex items-center hover:text-accent group-hover:text-accent ">Vision</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                {t('about.ourVision')}
                </p>
              </motion.div>
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay:  0.1 }}
                className="p-10 bg-white rounded-xl space-y-2 shadow-sm hover:shadow-xl hover:bg-accent/10 transition-all duration-300 border border-transparent group"
              >
                <div className="flex gap-4">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-xl flex items-center justify-center  group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-lg shadow-accent/5">
                  <TbGavel size={32} />
                </div>
                <h4 className="text-2xl font-bold text-primary flex items-center hover:text-accent group-hover:text-accent "> Core Values</h4>
                </div>
                <div className="text-muted-foreground leading-relaxed">
                 <ul className="list-disc pl-5 space-y-1">
                 {Array.isArray(t('about.ourValues', { returnObjects: true })) && 
                  t('about.ourValues', { returnObjects: true }).map((value, index) => (
                    <li key={index}>{value}</li>
                  ))}
                 </ul>
                </div>
              </motion.div>
            
          </div>
        </div>
      </section>

      {/* Philosophy / Quote */}
      <section className="py-10 bg-muted mt-10 overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10 ">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-3">
                <h2 className="text-4xl font-bold text-primary mb-8">Our Philosophy</h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    We believe that justice should be accessible, clear, and delivered with authority. Every client deserves a partner who understands the complexities of the legal system and can navigate them with precision.
                  </p>
                  <p>
                    Integrity is the cornerstone of our practice. We maintain complete transparency with our clients, providing honest assessments and realistic expectations at every stage of their legal journey.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-2 hover:scale-105 transition-all duration-500">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-primary p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <TbGavel className="text-accent/20 w-24 h-24 absolute -bottom-4 -left-4 -rotate-12" />
                  
                  <p className="text-2xl font-serif italic text-accent mb-8 leading-relaxed relative z-10">
                    "Justice is the constant and perpetual will to allot to every man his due."
                  </p>
                  <p className="text-right text-white/50 font-medium relative z-10 uppercase tracking-widest text-xs">
                    — Ulpian, Roman Jurist
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
