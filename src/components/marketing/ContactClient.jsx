'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TbPhone, TbMail, TbMapPin, TbClock } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { submitContact } from '@/lib/api';

export default function ContactClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject');
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative h-[30vh] flex items-center justify-center bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/Hero3.jpg" 
            alt="Contact Hero" 
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-4xl lg:text-4xl font-bold mb-4 text-white uppercase tracking-tight"
          >
            {t('nav.contact')}
          </motion.h1>
        <p className="text-white/60 max-w-2xl mx-auto text-lg">{t('contact.subTitle')}</p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-accent mx-auto mt-6 rounded-full" 
          />
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Info Section */}
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center shrink-0">
                  <TbPhone size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary mb-2">{t('contact.callus')}</h4>
                  <p className="text-muted-foreground">{t('topbar.phone')}</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center shrink-0">
                  <TbMail size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary mb-2">{t('contact.emailus')}</h4>
                  <p className="text-muted-foreground">{t('topbar.email')}</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center shrink-0">
                  <TbMapPin size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary mb-2">{t('contact.visitUs')}</h4>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Nyamirambo,Bazil Height Building ,1st Floor</p>
                    <p className="text-muted-foreground">Musanze,Kanyarukato Building ,1st Floor</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center shrink-0">
                  <TbClock size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary mb-2">{t('contact.workingHours')}</h4>
                  <p className="text-muted-foreground">{t('contact. MondayFriday')}: 8:00 AM - 6:00 PM</p>
                  <p className="text-muted-foreground">{t('contact.Saturday')}: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-2xl p-8 md:p-12">
                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const formData = {
                    fullName: form[0].value,
                    email: form[1].value,
                    phoneNumber: form[2].value,
                    subject: form[3].value,
                    message: form[4].value,
                  };

                  setFormMessage(null);

                  if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.subject || !formData.message) {
                    setFormMessage({ type: 'error', text: 'Please fill in all required fields' });
                    return;
                  }

                  try {
                    setSubmitting(true);
                    await submitContact(formData);
                    setFormMessage({ type: 'success', text: t('contact.successText') });
                    form.reset();
                  } catch (error) {
                    setFormMessage({ type: 'error', text: error.message || 'Failed to send message. Please try again later.' });
                  } finally {
                    setSubmitting(false);
                  }
                }}>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-primary uppercase tracking-wider">{t('contact.name')}</label>
                      <Input name="name" required placeholder={t('contact.namePlaceholder')} />
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-primary uppercase tracking-wider">Phone Number</label>
                      <Input name="phoneNumber" type="text" required 
                      placeholder={t('contact.phonePlaceholder')} />
                    </div>
                     <div className="space-y-2">
                      <label className="text-sm font-bold text-primary uppercase tracking-wider">{t('contact.email')}</label>
                      <Input name="email" type="email" required placeholder={t('contact.emailPlaceholder')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    
                    <label className="text-sm font-bold text-primary uppercase tracking-wider">Subject</label>
                    <Input name="subject" defaultValue={subjectParam || ''} 
                    placeholder={t('contact.subjectPlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary uppercase tracking-wider">{t('contact.message')}</label>
                    <textarea 
                      name="message"
                      required
                      className="w-full min-h-[150px] p-4 rounded-md border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                      placeholder={t('contact.yourMessage')}
                    ></textarea>
                  </div>

                  {formMessage && (
                    <div className={`p-4 rounded-md text-sm font-medium ${
                      formMessage.type === 'error'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-green-50 text-green-600 border border-green-200'
                    }`}>
                      {formMessage.text}
                    </div>
                  )}

                  <Button variant="gold" size="lg" disabled={submitting} className="w-full h-14 text-lg rounded-md">
                    {submitting ? 'Sending...' : t('contact.send')}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[500px] w-full bg-muted relative group">
        <iframe 
          src="https://www.google.com/maps?q=MBC+Hospital+Nyamirambo+Kigali&output=embed" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale hover:grayscale-0 transition-all duration-500"
        ></iframe>
        
        {/* Map Overlay Button */}
        <div className="absolute top-2 left-1 z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <a 
              href="https://www.google.com/maps/search/MBC+Nyamirambo"
              target="_blank"
              rel="noopener noreferrer"
              className=""
            >
              <Button variant="gold" className="shadow flex items-center gap-2 h-12 px-6 rounded font-bold group/btn hover:scale-105 transition-transform">
                <TbMapPin size={20} className="group-hover/btn:animate-bounce" />
                Open in Google Maps
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
