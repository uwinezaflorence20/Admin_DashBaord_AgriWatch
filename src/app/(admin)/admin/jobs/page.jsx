'use client';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  TbPlus, TbEdit, TbTrash, TbSearch, TbBriefcase,
  TbEye, TbX, TbArrowLeft, TbCalendar, TbPencil, TbAlertCircle, TbCheck, TbMapPin, TbClock, TbSchool, TbCurrencyDollar, TbAward
} from 'react-icons/tb';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getJobPostings,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting
} from '@/lib/api';
import Pagination from '@/components/shared/pagination';
import { toast as sonnerToast } from 'sonner';
import { formatDate } from '@/lib/utils';

const inputCls =
  'w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 text-primary bg-white';

const selectCls =
  'w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 text-primary bg-white appearance-none';

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

/* ─── Delete Modal ──────────────────────────────────────── */
function DeleteModal({ item, onConfirm, onCancel, isDeleting }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-8 flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <TbTrash size={28} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-red-500 mb-2">Delete Job</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <strong>&ldquo;{getText(item.title)}&rdquo;</strong>?
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-red-500/20 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'YES'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Add/Edit Modal ─────────────────────────────────────────── */
const bilingualString = (name) => z.object({
  en: z.string().min(1, `${name} (EN) is required`),
  rw: z.string().min(1, `${name} (RW) is required`),
});

const jobSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  applyLink: z.string().min(1, "Application Link is required"),
  title: bilingualString("Title"),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'temporary']),
  work_mode: z.enum(['remote', 'on_site', 'hybrid']),
  location: z.object({
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
  }),
  experience: z.object({ 
    min_years: z.number().min(0),
    max_years: z.number().min(0),
  }),
  skills_required: z.array(z.string()).min(1, "At least one skill is required"),
  education_level: z.string().min(1, "Education Level is required"),
  dates: z.object({
    application_deadline: z.string().min(1, "Deadline is required"),
    start_date: z.string().optional().nullable(),
  }),
  status: z.enum(['open', 'closed', 'draft']),
});

function JobModal({ item, onSave, onClose }) {
  const [lang, setLang] = useState('en');
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState(item || {
    companyName: 'AgriWatch',
    applyLink: '',
    title: { en: '', rw: '' },
    employment_type: 'full_time',
    work_mode: 'on_site',
    location: { city: 'Kigali', country: 'Rwanda' },
    experience: { min_years: 0, max_years: 0 },
    skills_required: [],
    education_level: '',
    dates: { application_deadline: '', start_date: '' },
    status: 'open',
  });
  const [toast, setToast] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setNested = (p1, p2) => (e) => setForm((p) => ({
    ...p,
    [p1]: { ...p[p1], [p2]: p2.includes('salary') || p2.includes('years') ? Number(e.target.value) : e.target.value }
  }));
  const setBilingual = (k) => (e) => setForm((p) => ({ ...p, [k]: { ...p[k], [lang]: e.target.value } }));

  const addSkill = () => {
    if (skillInput && !form.skills_required.includes(skillInput)) {
      setForm(p => ({ ...p, skills_required: [...p.skills_required, skillInput] }));
      setSkillInput('');
    }
  };

  const removeSkill = (s) => {
    setForm(p => ({ ...p, skills_required: p.skills_required.filter(skill => skill !== s) }));
  };

  const handleSave = async () => {
    setToast({ type: '', message: '' });
    try {
      jobSchema.parse(form);
      setIsSubmitting(true);

      const result = item ? await updateJobPosting(item._id || item.id, form) : await createJobPosting(form);
      sonnerToast.success(`Job ${item ? 'updated' : 'added'} successfully!`);
      onSave(result.data || result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const msg = error.issues?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation error';
        setToast({ type: 'error', message: msg });
      } else {
        setToast({ type: 'error', message: error.message || 'Failed to save job' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
          <h3 className="text-lg font-bold text-primary">{item ? 'Edit' : 'Add'} Job Posting</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
            <TbX size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {/* Language Toggle */}
          <div className="flex items-center justify-between">
             <div className="flex bg-muted/30 p-1 rounded-xl w-max">
                <button onClick={() => setLang('en')} className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-colors ${lang === 'en' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'}`}>English</button>
                <button onClick={() => setLang('rw')} className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-colors ${lang === 'rw' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'}`}>Kinyarwanda</button>
             </div>
             <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                <select className={`${selectCls} w-32`} value={form.status} onChange={set('status')}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Company Name</label>
                <input className={inputCls} value={form.companyName} onChange={set('companyName')} placeholder="e.g. JM Lustitia" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Job Title <span className="text-accent ml-1">({lang.toUpperCase()})</span></label>
                <input className={inputCls} value={form.title[lang]} onChange={setBilingual('title')} placeholder="e.g. Senior Associate" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Employment Type</label>
                    <select className={selectCls} value={form.employment_type} onChange={set('employment_type')}>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="temporary">Temporary</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Work Mode</label>
                    <select className={selectCls} value={form.work_mode} onChange={set('work_mode')}>
                      <option value="on_site">On Site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">City</label>
                    <input className={inputCls} value={form.location.city} onChange={setNested('location', 'city')} placeholder="Kigali" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Country</label>
                    <input className={inputCls} value={form.location.country} onChange={setNested('location', 'country')} placeholder="Rwanda" />
                 </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Education Level</label>
                <input className={inputCls} value={form.education_level} onChange={set('education_level')} placeholder="e.g. Bachelor's in Law" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Min Experience (Years)</label>
                    <input type="number" className={inputCls} value={form.experience.min_years} onChange={setNested('experience', 'min_years')} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Max Experience (Years)</label>
                    <input type="number" className={inputCls} value={form.experience.max_years} onChange={setNested('experience', 'max_years')} />
                 </div>
              </div>
           
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Skills Required</label>
                <div className="flex gap-2 mb-2">
                  <input className={inputCls} value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSkill()} placeholder="Add a skill..." />
                  <button onClick={addSkill} className="bg-accent text-white px-4 rounded-xl font-bold hover:bg-accent/90 transition-colors"><TbPlus /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {form.skills_required.map(s => (
                     <span key={s} className="bg-muted/50 text-primary px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 border border-border">
                        {s} <TbX className="cursor-pointer text-muted-foreground hover:text-red-500" onClick={() => removeSkill(s)} />
                     </span>
                   ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Application Deadline</label>
                    <input type="date" className={inputCls} value={form.dates.application_deadline ? new Date(form.dates.application_deadline).toISOString().split('T')[0] : ''} onChange={(e) => setForm(p => ({ ...p, dates: { ...p.dates, application_deadline: e.target.value } }))} />
                 </div>
              </div>
              {/* Application Link */}
               <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Application Link </label>
                <input className={inputCls} value={form.applyLink} onChange={set('applyLink')} placeholder="e.g. https://www.google.com" />
              </div>
            </div>
          </div>
        </div>

        {toast.message && (
          <div className={`mx-6 mt-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold ${
            toast.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {toast.type === 'success' ? <TbCheck size={18} /> : <TbAlertCircle size={18} />}
            <span className="truncate">{toast.message}</span>
          </div>
        )}

        <div className="flex gap-3 px-6 py-6 border-t border-border bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/40 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors shadow-md shadow-accent/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : item ? 'Update Job' : 'Save Job'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobPostings();
      setJobs(data);
      autoCloseExpiredJobs(data);
    } catch (error) {
      sonnerToast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setIsUpdatingStatus(id);
      await updateJobPosting(id, { status: newStatus });
      sonnerToast.success(`Status updated to ${newStatus}`);
      setJobs((prev) =>
        prev.map((j) => ((j._id || j.id) === id ? { ...j, status: newStatus } : j))
      );
    } catch (error) {
      sonnerToast.error(error.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const autoCloseExpiredJobs = async (allJobs) => {
    const now = new Date();
    const expiredJobs = allJobs.filter(
      (job) =>
        job.status === 'open' &&
        job.dates.application_deadline &&
        new Date(job.dates.application_deadline) < now
    );

    if (expiredJobs.length === 0) return;

    let successCount = 0;
    for (const job of expiredJobs) {
      try {
        await updateJobPosting(job._id || job.id, { status: 'closed' });
        successCount++;
      } catch (error) {
        console.error(`Failed to auto-close job ${job._id}:`, error);
      }
    }

    if (successCount > 0) {
      const data = await getJobPostings();
      setJobs(data);
      sonnerToast.info(`${successCount} expired job(s) automatically closed`);
    }
  };

  const filtered = jobs.filter(
    (j) =>
      getText(j.title).toLowerCase().includes(search.toLowerCase()) ||
      j.companyName.toLowerCase().includes(search.toLowerCase()) ||
      j.location.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSave = (saved) => {
    if (modalItem) {
      setJobs((prev) => prev.map((j) => ((j._id || j.id) === (saved._id || saved.id) ? saved : j)));
    } else {
      setJobs((prev) => [saved, ...prev]);
    }
    setModalItem(null);
    setShowAdd(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteJobPosting(deleteItem._id || deleteItem.id);
      sonnerToast.success('Job posting deleted');
      setJobs((prev) => prev.filter((j) => (j._id || j.id) !== (deleteItem._id || deleteItem.id)));
      setDeleteItem(null);
    } catch (error) {
      sonnerToast.error(error.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {deleteItem && (
          <DeleteModal item={deleteItem} onConfirm={handleConfirmDelete} onCancel={() => setDeleteItem(null)} isDeleting={isDeleting} />
        )}
        {(showAdd || modalItem) && <JobModal item={modalItem} onSave={handleSave} onClose={() => { setShowAdd(false); setModalItem(null); }} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full">
            <Input
              placeholder="Search jobs by title, company or city..."
              icon={TbSearch}
              className="bg-white border-border"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold py-2.5 px-5 rounded-xl transition-all active:scale-95 whitespace-nowrap shadow-md shadow-accent/20"
          >
            <TbPlus size={20} /> Add Job Posting
          </button>
        </div>

        {/* Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {['Job Details', 'Type/Mode', 'Location','Status', 'Deadline', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {loading ? (
                    <tr><td colSpan={6} className="py-10 text-center text-muted-foreground italic">Loading jobs...</td></tr>
                  ) :
                  filtered.length === 0 ? (
                    <tr><td colSpan={6} className='py-10 text-center text-muted-foreground italic'>No job postings found.</td></tr>
                  ):
                  paginated.map((job) => (
                    <tr key={job._id || job.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          
                          <div>
                            <p className="font-bold text-primary text-sm">{getText(job.title)}</p>
                            <p className="text-xs text-muted-foreground">{job.companyName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="space-y-1">
                            <p className="text-xs font-bold text-primary capitalize flex items-center gap-1"><TbClock size={12} className="text-accent" /> {job.employment_type?.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1"><TbMapPin size={12} /> {job.work_mode}</p>
                         </div>
                      </td>
                      <td className='px-6 py-4 text-sm font-semibold text-primary whitespace-nowrap'>
                        {job.location.city}
                      </td>
        
                      <td className="px-6 py-4">
                        <select
                          value={job.status}
                          disabled={isUpdatingStatus === (job._id || job.id)}
                          onChange={(e) => handleStatusUpdate(job._id || job.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none focus:ring-2 focus:ring-accent/20 outline-none transition-all appearance-none text-center min-w-[70px] ${
                            job.status === 'open' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                            job.status === 'closed' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 
                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } ${isUpdatingStatus === (job._id || job.id) ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="draft">Draft</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-primary whitespace-nowrap">
                        {formatDate(job.dates.application_deadline)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setModalItem(job)} className="p-2 hover:bg-accent/10 hover:text-accent rounded-lg text-muted-foreground transition-colors" title="Edit Job">
                            <TbEdit size={18} />
                          </button>
                          <button onClick={() => setDeleteItem(job)} className="p-2 hover:bg-red-100 hover:text-red-500 rounded-lg text-muted-foreground transition-colors" title="Delete Job">
                            <TbTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filtered.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(val) => { setRowsPerPage(val); setPage(1); }}
          />
        )}
      </motion.div>
    </div>
  );
}
