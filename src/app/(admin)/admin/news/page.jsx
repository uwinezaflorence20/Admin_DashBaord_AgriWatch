'use client';
import { useState,useEffect } from 'react';
import { z } from 'zod';
import {
  TbPlus, TbEdit, TbTrash, TbSearch, TbNews,
  TbEye, TbX, TbArrowLeft, TbCalendar, TbPencil, TbSpeakerphone, TbAlertCircle, TbCheck
} from 'react-icons/tb';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllNews, 
  createNews, 
  updateNews, 
  deleteNews 
} from '@/lib/api';
import Pagination from '@/components/shared/pagination';
import { toast as sonnerToast } from 'sonner';
import { formatDate } from '@/lib/utils';

const inputCls =
  'w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 text-primary bg-white';

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

/* ─── Image Modal ───────────────────────────────────────── */
function ImageModal({ item, onClose }) {
  if (!item) return null;
  const Icon = item.icon;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        <div className="relative h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          {Icon && <Icon size={64} className="text-white/40" />}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white"
          >
            <TbX size={16} />
          </button>
        </div>
        <div className="p-5 text-center">
          <p className="text-lg font-bold text-primary">{getText(item.title)}</p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <TbCalendar size={14} /> {formatDate(item.date)}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Delete Modal ──────────────────────────────────────── */
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
        <h3 className="text-xl font-bold text-red-500 mb-2">Delete News</h3>
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

/* ─── Add Modal ─────────────────────────────────────────── */
const bilingualString = (name) => z.object({
  en: z.string().min(1, `${name} (EN) is required`),
  rw: z.string().min(1, `${name} (RW) is required`),
});

const newsSchema = z.object({
  title: bilingualString("Title"),
  date: z.string().min(1, "Date is required"),
  desc: bilingualString("Short Description"),
  fullDesc: bilingualString("Full Description"),

});

function AddModal({ onSave, onClose }) {
  const [lang, setLang] = useState('en');
  const [form, setForm] = useState({ 
    title: { en: '', rw: '' }, 
    date: '', 
    desc: { en: '', rw: '' }, 
    fullDesc: { en: '', rw: '' }
  });
  const [toast, setToast] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setBilingual = (k) => (e) => setForm((p) => ({ ...p, [k]: { ...p[k], [lang]: e.target.value } }));

  const handleSave = async () => {
    setToast({ type: '', message: '' });
    try {
      newsSchema.parse(form);
      setIsSubmitting(true);
      
      const payload = {
        title: form.title,
        date: form.date,
        description: form.desc,
        fullDescription: form.fullDesc
      };

      const result = await createNews(payload);
      sonnerToast.success('News added successfully!');
      onSave(result.data || result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const msg = error.issues?.map(e => e.message).join(', ') || 'Validation error';
        setToast({ type: 'error', message: msg });
      } else {
        setToast({ type: 'error', message: error.message || 'Failed to create news' });
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h3 className="text-lg font-bold text-primary">Add News Article</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary">
            <TbX size={20} />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex bg-muted/30 p-1 rounded-xl w-max">
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-colors ${lang === 'en' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'}`}
            >
              English
            </button>
            <button
              onClick={() => setLang('rw')}
              className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-colors ${lang === 'rw' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'}`}
            >
              Kinyarwanda
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: 'Title', key: 'title', placeholder: 'Article headline...', isBilingual: true },
            { label: 'Date', key: 'date', placeholder: 'e.g. May 15, 2026', type: 'date' },
          ].map(({ label, key, placeholder, type, isBilingual }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {label} {isBilingual && <span className="text-accent ml-1">({lang.toUpperCase()})</span>}
              </label>
              <input type={type || "text"} className={inputCls} placeholder={placeholder} value={isBilingual ? form[key][lang] : form[key]} onChange={isBilingual ? setBilingual(key) : set(key)} />
            </div>
          ))}
          {[
            { label: 'Short Description', key: 'desc', rows: 2, placeholder: 'Brief summary...', isBilingual: true },
            { label: 'Full Description', key: 'fullDesc', rows: 4, placeholder: 'Full article content...', isBilingual: true },
          ].map(({ label, key, rows, placeholder, isBilingual }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {label} {isBilingual && <span className="text-accent ml-1">({lang.toUpperCase()})</span>}
              </label>
              <textarea className={inputCls} rows={rows} placeholder={placeholder} value={isBilingual ? form[key][lang] : form[key]} onChange={isBilingual ? setBilingual(key) : set(key)} />
            </div>
          ))}
         
        </div>

        {toast.message && (
          <div className={`mx-6 mb-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold ${
            toast.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {toast.type === 'success' ? <TbCheck size={18} /> : <TbAlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/40 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors shadow-md shadow-accent/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Detail View ───────────────────────────────────────── */
function DetailView({ item, onBack, onDelete, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [lang, setLang] = useState('en');
  const [isSaving, setIsSaving] = useState(false);

  const initData = { ...item };
  ['title', 'description', 'fullDescription'].forEach(k => {
    let targetKey = k === 'description' ? 'desc' : k === 'fullDescription' ? 'fullDesc' : k;
    if (typeof initData[k] === 'string') {
      try {
        initData[targetKey] = JSON.parse(initData[k]);
      } catch {
        initData[targetKey] = { en: initData[k], rw: initData[k] };
      }
    } else if (initData[k]) {
       initData[targetKey] = initData[k];
    } else {
       initData[targetKey] = { en: '', rw: '' };
    }
  });

  const [data, setData] = useState(initData);
  const set = (k) => (e) => setData((p) => ({ ...p, [k]: e.target.value }));
  const setBilingual = (k) => (e) => setData((p) => ({ ...p, [k]: { ...p[k], [lang]: e.target.value } }));
  const Icon = item.icon;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        title: data.title,
        date: data.date,
        description: data.desc,
        fullDescription: data.fullDesc
      };

      const result = await updateNews(item._id || item.id, payload);
      sonnerToast.success('News updated successfully!');
      onSave(result.data || result);
      setEditMode(false);
    } catch (error) {
      sonnerToast.error(error.message || 'Failed to update news');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="space-y-6 bg-white p-6 rounded shadow-sm"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <TbArrowLeft size={18} /> Back
        </button>

        <div className="flex bg-muted/30 p-1 rounded-xl w-max">
          <button
            onClick={() => setLang('en')}
            className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-colors ${lang === 'en' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'}`}
          >
            English
          </button>
          <button
            onClick={() => setLang('rw')}
            className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-colors ${lang === 'rw' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'}`}
          >
            Kinyarwanda
          </button>
        </div>

        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg text-sm font-semibold hover:bg-accent/5 transition-colors">
            <TbPencil size={15} /> EDIT ARTICLE
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setData(initData); setEditMode(false); }} className="px-4 py-2 border border-border text-muted-foreground rounded-lg text-sm font-semibold hover:bg-muted/40 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Article Information ── */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-primary">Article Information</h3>

          {/* Accent card */}
          <div className="bg-gradient-to-br  from-primary to-accent rounded-2xl p-6 text-white flex  gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <TbSpeakerphone size={24} className="text-white" />
            </div>
            {editMode ? (
              <input value={data.title[lang]} onChange={setBilingual('title')} className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm font-bold w-full" placeholder="Title" />
            ) : (
              <p className="font-bold text-base leading-snug">{getText(data.title, lang)}</p>
            )}
          </div>

          {/* Date card */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <TbCalendar size={16} /> Date
              </span>
              {editMode ? (
                <input type="date" value={data.date} onChange={set('date')} className="border border-border rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 w-40" />
              ) : (
                <span className="text-sm font-semibold text-primary">{formatDate(data.date)}</span>
              )}
            </div>
                  {/* Delete */}
            <div className="pt-4 border-t border-border">
              <button onClick={onDelete} className="w-full hover:py-2 hover:px-4 border-none rounded flex items-center justify-between text-[#ff502e] hover:bg-red-50/50 transition-colors bg-white cursor-pointer group">
                <div className="flex items-center gap-3 text-sm font-medium"><TbTrash className="text-[1.2rem]" /><span>Delete News</span></div>
                <TbArrowLeft className="text-[#ff502e] rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: User Details (mirrors profile page structure) ── */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-primary">User Details</h3>

          {/* Short Description */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-4">Description {editMode && <span className="text-accent ml-1">({lang.toUpperCase()})</span>}</h4>
            {editMode ? (
              <textarea rows={3} value={data.desc[lang]} onChange={setBilingual('desc')} className={inputCls} placeholder="Short description..." />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{getText(data.desc, lang) || '—'}</p>
            )}
          </div>

          {/* Full Description */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-4">Full Description {editMode && <span className="text-accent ml-1">({lang.toUpperCase()})</span>}</h4>
            {editMode ? (
              <textarea rows={6} value={data.fullDesc[lang]} onChange={setBilingual('fullDesc')} className={inputCls} placeholder="Full article content..." />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{getText(data.fullDesc, lang) || '—'}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function ManageNewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [imageItem, setImageItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews();
      setArticles(data);
    } catch (error) {
      sonnerToast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const filtered = articles.filter(
    (a) =>
      getText(a.title).toLowerCase().includes(search.toLowerCase()) ||
      getText(a.desc).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSaveEdit = (updated) => {
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelected(updated);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteNews(deleteItem._id || deleteItem.id);
      sonnerToast.success('News article deleted');
      setArticles((prev) => prev.filter((a) => (a._id || a.id) !== (deleteItem._id || deleteItem.id)));
      setDeleteItem(null);
      setSelected(null);
    } catch (error) {
      sonnerToast.error(error.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = (newArticle) => {
    setArticles((prev) => [newArticle, ...prev]);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {imageItem && <ImageModal item={imageItem} onClose={() => setImageItem(null)} />}
        {deleteItem && (
          <DeleteModal item={deleteItem} onConfirm={handleConfirmDelete} onCancel={() => setDeleteItem(null)} isDeleting={isDeleting} />
        )}
        {showAdd && <AddModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selected ? (
          <DetailView
            key="detail"
            item={selected}
            onBack={() => setSelected(null)}
            onDelete={() => setDeleteItem(selected)}
            onSave={handleSaveEdit}
          />
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full">
                <Input
                  placeholder="Search news..."
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
                <TbPlus size={20} /> Add News
              </button>
            </div>

            {/* Table */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        {['Date', 'Title', 'Description', 'Actions'].map((h, i) => (
                          <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground${i === 4 ? ' text-right' : ''}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                      {loading ? (
                        <tr><td colSpan={4} className="py-10 text-center text-muted-foreground italic">Loading news...</td></tr>
                      ) :
                      filtered.length === 0 ? (
                        <tr className="text-center py-20 bg-white border border-dashed border-border rounded-xl">
                          <td colSpan={4} className='py-10 text-center text-muted-foreground italic'>No news found.
                          </td>
                        </tr>
                      ):
                      paginated.map((article) => {
                        return (
                          <tr key={article._id || article.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-primary whitespace-nowrap">{formatDate(article.date)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-primary text-sm">{getText(article.title)}</span>
                              </div>
                            </td>
                           
                            <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{getText(article.description || article.desc)}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => setSelected(article)} className="p-2 hover:bg-accent/10 hover:text-accent rounded-lg text-muted-foreground transition-colors" title="View Details">
                                  <TbEye size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
        )}
      </AnimatePresence>
    </div>
  );
}
