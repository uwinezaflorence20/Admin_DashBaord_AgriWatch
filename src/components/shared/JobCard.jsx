'use client';
import { TbBriefcase, TbMapPin, TbCalendar, TbClock, TbSchool, TbPointFilled, TbAward } from 'react-icons/tb';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

const getText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val.en || '';
};

export default function JobCard({ job, lang = 'en' }) {
  if (!job) return null;

  const statusColors = {
    open: 'bg-green-100 text-green-700 border-green-200',
    closed: 'bg-red-100 text-red-700 border-red-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusDotColors = {
    open: 'bg-green-500',
    closed: 'bg-red-500',
    draft: 'bg-gray-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 group relative"
    >
      <motion.div 
        animate={{ 
          x: [0, 5, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute -top-3 left-8 bg-green-500 text-white px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-green-200 z-20 ring-4 ring-white"
      >
        We Are Hiring
      </motion.div>
      <div className="p-8 pt-10">
        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-15 h-15 bg-accent/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <TbBriefcase size={36} className="text-accent" />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-primary mb-0  transition-colors">
              {getText(job.title, lang)}
            </h3>
            <p className="text-md font-semibold text-primary mb-1">
              {job.companyName}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <TbMapPin size={18} className="text-muted-foreground/60" />
              <span>{job.location?.city}, {job.location?.country}</span>
              <span className="mx-1 opacity-40">•</span>
              <span className="capitalize">{job.work_mode?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/60 mb-4" />

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Job Type</p>
            <p className="font-bold text-primary flex items-center gap-2">
              <TbClock size={16} className="text-accent" />
              <span className="capitalize">{job.employment_type?.replace('_', ' ')}</span>
            </p>
          </div>

           {/* Work mode */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Work Mode</p>
            <p className="font-bold text-primary flex items-center gap-2">
              <TbMapPin size={16} className="text-accent" />
              <span className="capitalize">{job.work_mode}</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Experience</p>
            <p className="font-bold text-primary flex items-center gap-2">
              <TbAward size={16} className="text-accent" />
              <span>{job.experience?.min_years} - {job.experience?.max_years} years</span>
            </p>
          </div>
        </div>

        <div className="h-px bg-border/60 mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4" >
          {/* Education Level */}
             <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Education</p>
            <p className="font-bold text-primary flex items-center gap-2">
              <TbSchool size={16} className="text-accent" />
              <span>{getText(job.education_level, lang)}</span>
            </p>
          </div>
          {/* Application Deadline */}
            <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Application Deadline</p>
            <p className="font-bold text-primary flex items-center gap-2">
              <TbCalendar size={16} className="text-accent" />
              <span className="capitalize">{formatDate(job.dates?.application_deadline, lang)}</span>
            </p>
          </div>
        </div>
        <div className="h-px bg-border/60 mb-4" />
       
        {/* Skills */}
        <div className="w-full">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Skills Required</p>
          <div className="flex gap-2">
            {job.skills_required?.map((skill, i) => (
              <ul key={i} className="px-4 py-1.5 bg-accent/5 text-accent text-sm font-bold rounded-xl border border-accent/10">
                <li className='flex items-center gap-2'><TbPointFilled size={16} />{skill}</li>
              </ul>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-8 py-5 bg-muted/20 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${statusColors[job.status || 'open']}`}>
              <span className={`w-2 h-2 rounded-full ${statusDotColors[job.status || 'open']}`} />
              {job.status || 'open'}
           </div>
           <div className="h-4 w-px bg-border" />
           <p className="text-sm text-muted-foreground font-medium">
             Posted on {formatDate(job.createdAt, lang)}
           </p>
        </div>
        <a 
          href={job.applyLink || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-accent/20 active:scale-95 text-center"
        >
          Apply now
        </a>
      </div>
    </motion.div>
  );
}
