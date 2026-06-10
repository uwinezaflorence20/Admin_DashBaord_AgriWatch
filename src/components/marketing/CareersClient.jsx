'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TbLoader, TbBriefcase } from 'react-icons/tb';
import { getJobPostings } from '@/lib/api';
import JobCard from '@/components/shared/JobCard';

export default function CareersClient() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getJobPostings();
        // Only show open jobs on the public page
        const openJobs = (Array.isArray(data) ? data : (data?.data || [])).filter(j => j.status === 'open');
        setJobs(openJobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative h-[40vh] flex items-center justify-center bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/Hero 4.jpg" 
            alt="Careers Hero" 
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
            {t('careers.title')}
          </motion.h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            {t('careers.subTitle')}
          </p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-accent mx-auto mt-6 rounded-full" 
          />
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-24 bg-white min-h-[40vh]">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <TbLoader className="animate-spin mb-4" size={48} />
              <p>Loading vacancies...</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-12">
              {jobs.length > 0 ? (
                jobs.map((job, idx) => (
                  <JobCard key={job._id || job.id} job={job} lang={currentLang} />
                ))
              ) : (
                <div className="py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground/40">
                    <TbBriefcase size={40} />
                  </div>
                  <p className="text-xl text-muted-foreground font-medium">{t('careers.notfound')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
