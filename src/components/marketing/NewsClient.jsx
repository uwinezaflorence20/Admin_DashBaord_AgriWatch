'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TbArrowRight, TbCalendar, TbLoader, TbSpeakerphone } from 'react-icons/tb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { getAllNews, getJobPostings } from '@/lib/api';
import Link from 'next/link';
import JobCard from '@/components/shared/JobCard';

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

export default function NewsClient() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [newsList, setNewsList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newsData, jobsData] = await Promise.all([
          getAllNews(),
          getJobPostings()
        ]);
        setNewsList(Array.isArray(newsData) ? newsData : (newsData?.data || []));
        // Only show open jobs
        setJobsList((Array.isArray(jobsData) ? jobsData : (jobsData?.data || [])).filter(j => j.status === 'open'));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative h-[40vh] flex items-center justify-center bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/Hero 4.jpg" 
            alt="News Hero" 
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-3xl lg:text-3xl font-bold mb-4 text-white uppercase tracking-tight"
          >
            {t('news.title')}
          </motion.h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            {t('news.subTitle')}
          </p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-accent mx-auto mt-6 rounded-full" 
          />
        </div>
      </section>

      <section className="py-24 bg-white min-h-[40vh]">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <TbLoader className="animate-spin mb-4" size={48} />
              <p>Loading news & vacancies...</p>
            </div>
          ) : (
            <div className=" grid grid-row-2 gap-8">
              {/* Jobs Section (Top) */}
              {jobsList.length > 0 && (
                <div>
                  <div className={jobsList.length > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "w-full space-y-8"}>
                    {jobsList.map((job) => (
                      <JobCard key={job._id || job.id} job={job} lang={currentLang} />
                    ))}
                  </div>
                 
                </div>
              )}

              {/* News Section */}
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {newsList.length > 0 ? (
                    newsList.map((item, idx) => (
                      <motion.div
                        key={item._id || item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="group hover:shadow-2xl transition-all duration-300 h-full border-muted bg-muted/30 flex flex-col relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                          <CardHeader className="relative z-10 pb-4">
                            <div className='flex gap-5 items-start'>
                              <div className="w-14 h-14 bg-accent text-white rounded-xl flex items-center justify-center shadow-md transition-colors duration-300 shrink-0">
                                <TbSpeakerphone size={30} />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest mb-1">
                                  <TbCalendar size={14} /> 
                                  {new Date(item.date).toLocaleDateString(currentLang === 'rw' ? 'rw-RW' : 'en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <CardTitle className="group-hover:text-gold transition-colors text-xl font-bold leading-snug">
                                  {getText(item.title, currentLang)}
                                </CardTitle>
                              </div>
                            </div>
                          
                            <CardDescription className="text-base pt-4 leading-relaxed min-h-[4.5rem]">
                              {getText(item.description || item.desc, currentLang)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="mt-auto relative z-10">
                            <Link href={`/news/${item._id || item.id}`} className="inline-flex items-center gap-2 text-accent font-bold group/link">
                              {t('common.readMore')} <TbArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                      <p className="text-xl text-muted-foreground font-medium">{t('news.notfound')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
