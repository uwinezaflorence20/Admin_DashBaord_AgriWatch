'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TbBrandLinkedin, TbBrandTwitter, TbMail, TbArrowRight, TbLoader } from 'react-icons/tb';
import { Card, CardContent } from '@/components/ui/Card';
import { getTeamMembers } from '@/lib/api';
import Link from 'next/link';

const getText = (val, lang = 'en') => {
  if (!val) return '';
  let parsed = val;
  if (typeof val === 'string') {
    try {
      parsed = JSON.parse(val);
    } catch {
      return val;
    }
  }
  if (typeof parsed === 'string') return parsed;
  return parsed[lang] || parsed.en || '';
};

export default function TeamClient() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const data = await getTeamMembers();
        setTeamList(Array.isArray(data) ? data : (data?.data || []));
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative h-[30vh] flex items-center justify-center bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/Hero 4.jpg" 
            alt="Team Hero" 
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-4xl lg:text-3xl font-bold mb-4 text-white uppercase tracking-tight"
          >
            {t('nav.team')}
          </motion.h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">{t('team.subTitle')}</p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-accent mx-auto mt-6 rounded-full" 
          />
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-14 bg-white min-h-[40vh]">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <TbLoader className="animate-spin mb-4" size={48} />
              <p>Loading team members...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamList.length > 0 ? (
                teamList.map((member, idx) => (
                  <motion.div
                    key={member._id || member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all group overflow-hidden  flex items-center">
                      <div className="aspect-[4/5]  h-50 w-50  relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className='w-full h-full  grayscale hover:grayscale-0 transition-all duration-500 group-hover:scale-105 transition-transform duration-500' 
                          />
                        </div>
                        {/* Social Overlay */}
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-4">
                            {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent"><TbBrandLinkedin size={22} /></a>}
                            {member.twitter && <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent"><TbBrandTwitter size={22} /></a>}
                            {member.email && <a href={`mailto:${member.email}`} className="text-white hover:text-accent"><TbMail size={22} /></a>}
                        </div> 
                      </div>
                      <CardContent className="p-6 text-center">
                        <div className="text-xl font-bold text-primary mb-1  transition-colors w-full line-clamp-1">{member.name}</div>
                        <p className="text-accent font-medium text-sm mb-4 uppercase tracking-[0.1em]">{getText(member.role, currentLang)}</p>

                       
                        <Link href={`/team/${member._id || member.id}`}>
                          <button className="text-xs font-bold uppercase bg-accent text-white px-4 py-2 rounded-md tracking-widest  flex items-center gap-2 mx-auto transition-colors">
                            View Profile <TbArrowRight size={14} />
                          </button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                  <p className="text-xl text-muted-foreground font-medium">{t('team.notfound')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
