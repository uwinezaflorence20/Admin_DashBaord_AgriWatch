'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  TbPlus, TbEdit, TbTrash, TbSearch, TbUser, TbEye, TbX,
  TbPhone,  
  TbArrowLeft, TbMail, TbBrandLinkedin, TbBrandTwitter, TbCheck, TbPencil, TbPhoto, TbAlertCircle
} from 'react-icons/tb';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} from '@/lib/api';
import Pagination from '@/components/shared/pagination';
import { toast as sonnerToast } from 'sonner';

/* ─── small helpers ─────────────────────────────────────── */
const initials = (name = '') => {
  const str = typeof name === 'object' ? (name.en || '') : name;
  return str.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
};

const getText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val.en || '';
};

const Field = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    <span className="text-sm font-semibold text-primary text-right">{value}</span>
  </div>
);

/* ─── Image Modal ───────────────────────────────────────── */
function ImageModal({ item, onClose, onUpdate }) {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!item) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (!imageFile) return;
    try {
      setIsUpdating(true);
      const fd = new FormData();
      fd.append('image', imageFile);
      const result = await updateTeamMember(item._id || item.id, fd);
      sonnerToast.success("Image updated successfully");
      onUpdate(result.data || result);
      onClose();
    } catch (error) {
      sonnerToast.error(error.message || "Failed to update image");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelUpdate = () => {
    setImageFile(null);
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        <div className="relative h-64 bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
          <img 
            src={preview || item.image} 
            alt={getText(item.name)} 
            className={`w-full h-full object-contain transition-opacity ${isUpdating ? 'opacity-50' : 'opacity-100'}`} 
          />
          
          {/* Close button (only if not previewing or if updating) */}
          {!preview && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <TbX size={16} />
            </button>
          )}

          {/* Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group">
            {!preview ? (
              <label className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-primary cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0" title="Change Image">
                <TbPencil size={24} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleConfirm}
                  disabled={isUpdating}
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform scale-110 disabled:opacity-50"
                  title="Confirm Update"
                >
                  {isUpdating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TbCheck size={24} />}
                </button>
                <button
                  onClick={handleCancelUpdate}
                  disabled={isUpdating}
                  className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform scale-110 disabled:opacity-50"
                  title="Cancel"
                >
                  <TbX size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-5 text-center">
          <p className="text-lg font-bold text-primary">{getText(item.name)}</p>
          <p className="text-sm text-muted-foreground mt-1">{getText(item.role)}</p>
        </div>
      </motion.div>
    </div>
  );
}

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
        <h3 className="text-xl font-bold text-red-500 mb-2">Delete Member</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <strong>{getText(item.name)}</strong>? This action cannot be undone.
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

/* ─── Add Member Modal ──────────────────────────────────── */
const bilingualString = (name) => z.object({
  en: z.string().min(1, `${name} (EN) is required`),
  rw: z.string().min(1, `${name} (RW) is required`),
});

const teamSchema = z.object({
  name: z.string().min(1, "Full Name is required"),
  email: z.string().email("Must be a valid email"),
  phone: z.string().min(1, "Phone Number is required"),
  role: bilingualString("Role"),
  linkedin: z.string().url("Must be a valid URL").or(z.literal("")),
  twitter: z.string().url("Must be a valid URL").or(z.literal("")),
  bio: bilingualString("Short Bio"),
  fullBio: bilingualString("Full Bio"),
  image: z.string().min(1, "Profile Image is required"),
});

function AddModal({ onSave, onClose }) {
  const [lang, setLang] = useState('en');
  const [form, setForm] = useState({
    name: '', // Model says name is a string
    email: '',
    phone: '',
    role: { en: '', rw: '' },
    bio: { en: '', rw: '' },
    fullBio: { en: '', rw: '' },
    linkedin: '',
    twitter: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [toast, setToast] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setBilingual = (k) => (e) => setForm((p) => ({ ...p, [k]: { ...p[k], [lang]: e.target.value } }));
  const inputCls = 'w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 text-primary';

  const handleSave = async () => {
    setToast({ type: '', message: '' });
    try {
      if (!imageFile) throw new Error("Profile Image is required");

      teamSchema.parse({ ...form, image: 'present' });
      setIsSubmitting(true);

      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('role', JSON.stringify(form.role));
      fd.append('bio', JSON.stringify(form.bio));
      fd.append('fullBio', JSON.stringify(form.fullBio));
      fd.append('linkedin', form.linkedin);
      fd.append('twitter', form.twitter);
      fd.append('image', imageFile);

      const result = await createTeamMember(fd);
      sonnerToast.success('Member added successfully!');
      onSave(result.data || result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const msg = error.issues?.map(e => e.message).join(', ') || 'Validation error';
        setToast({ type: 'error', message: msg });
      } else {
        setToast({ type: 'error', message: error.message || 'Failed to create member' });
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto px-2"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h3 className="text-lg font-bold text-primary">Add New Member</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
            <TbX size={20} className='text-red-500 ' />
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
            { label: 'Full Name', key: 'name', placeholder: 'e.g. Adv. John Doe' },
            { label: 'Email', key: 'email', placeholder: 'e.g. jmlustita@gmail.com' },
            { label: 'Phone Number', key: 'phone', placeholder: 'e.g. +2507...' },
            { label: 'Role / Position', key: 'role', placeholder: 'e.g. Senior Partner', isBilingual: true },
            { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'https://linkedin.com/in/...' },
            { label: 'Twitter URL', key: 'twitter', placeholder: 'https://twitter.com/...' },
          ].map(({ label, key, placeholder, isBilingual }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {label} {isBilingual && <span className="text-accent ml-1">({lang.toUpperCase()})</span>}
              </label>
              <input className={inputCls} placeholder={placeholder} value={isBilingual ? form[key][lang] : form[key]} onChange={isBilingual ? setBilingual(key) : set(key)} />
            </div>
          ))}
          {[
            { label: 'Short Bio', key: 'bio', rows: 2, placeholder: 'A brief bio...', isBilingual: true },
            { label: 'Full Bio', key: 'fullBio', rows: 4, placeholder: 'Full detailed biography...', isBilingual: true },
          ].map(({ label, key, rows, placeholder, isBilingual }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {label} {isBilingual && <span className="text-accent ml-1">({lang.toUpperCase()})</span>}
              </label>
              <textarea className={inputCls} rows={rows} placeholder={placeholder} value={isBilingual ? form[key][lang] : form[key]} onChange={isBilingual ? setBilingual(key) : set(key)} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Profile Image</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden group border border-border">
                <img src={imagePreview} alt="Selected" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(''); }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  title="Clear Image"
                >
                  <TbX size={16} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 border-2 border-dashed border-border rounded-xl px-4 py-3 cursor-pointer hover:border-accent/50 transition-colors">
                <TbPhoto size={20} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setImagePreview(reader.result);
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            )}
          </div>
        </div>

        {toast.message && (
          <div className={`mx-6 mb-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold ${toast.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
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
            {isSubmitting ? 'Saving...' : 'Save Member'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Detail View ───────────────────────────────────────── */
function DetailView({ member, onBack, onDelete, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [lang, setLang] = useState('en');
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Convert legacy string values to bilingual objects for editing
  const initData = { ...member };
  ['role', 'bio', 'fullBio'].forEach(k => {
    if (typeof initData[k] === 'string') {
      try {
        initData[k] = JSON.parse(initData[k]);
      } catch {
        initData[k] = { en: initData[k], rw: initData[k] };
      }
    } else if (!initData[k]) {
      initData[k] = { en: '', rw: '' };
    }
  });

  const [data, setData] = useState(initData);
  const set = (k) => (e) => setData((p) => ({ ...p, [k]: e.target.value }));
  const setBilingual = (k) => (e) => setData((p) => ({ ...p, [k]: { ...p[k], [lang]: e.target.value } }));

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 text-primary bg-white';

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('email', data.email);
      fd.append('phone', data.phone);
      fd.append('role', JSON.stringify(data.role));
      fd.append('bio', JSON.stringify(data.bio));
      fd.append('fullBio', JSON.stringify(data.fullBio));
      fd.append('linkedin', data.linkedin);
      fd.append('twitter', data.twitter);
      if (imageFile) fd.append('image', imageFile);

      const result = await updateTeamMember(member._id || member.id, fd);
      sonnerToast.success('Member updated successfully!');
      onSave(result.data || result);
      setEditMode(false);
    } catch (error) {
      sonnerToast.error(error.message || 'Failed to update member');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="space-y-6 bg-white p-4 px-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
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
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg text-sm font-semibold hover:bg-accent/5 transition-colors"
          >
            <TbPencil size={15} /> EDIT MEMBER
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setData(initData); setEditMode(false); }}
              className="px-4 py-2 border border-border text-muted-foreground rounded-lg text-sm font-semibold hover:bg-muted/40 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Member Information ── */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-primary">Member Information</h3>

          {/* Gradient card */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center overflow-hidden relative group shrink-0">
                {data.image ? (
                  <img src={data.image} alt={getText(data.name, lang)} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-xl">{initials(data.name)}</span>
                )}

                {editMode && (
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" title="Change Image">
                    <TbPencil size={16} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setData(p => ({ ...p, image: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <input value={data.name} onChange={set('name')} className="bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-2 py-1 text-sm font-bold w-full mb-1" placeholder="Full Name" />
                ) : (
                  <p className="font-bold text-base leading-tight truncate">{getText(data.name, lang)}</p>
                )}
                {editMode ? (
                  <input value={data.role[lang]} onChange={setBilingual('role')} className="bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-2 py-1 text-xs w-full mt-1" placeholder="Role" />
                ) : (
                  <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mt-0.5">{getText(data.role, lang)}</p>
                )}
              </div>
            </div>
          </div>



          {/* Info card */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            {/* Email */}
            <div className="flex items-center gap-3">
              <TbMail size={16} className="text-primary shrink-0" />
              {editMode ? (
                <input value={data.email} onChange={set('email')} className={inputCls} placeholder="Email" />
              ) : (
                <span className="text-sm text-primary font-medium truncate">{data.email}</span>
              )}
            </div>
            {/* Phone */}
            <div className="flex items-center gap-3">
              <TbPhone size={16} className="text-primary shrink-0" />
              {editMode ? (
                <input value={data.phone} onChange={set('phone')} className={inputCls} placeholder="Phone Number" />
              ) : (
                <span className="text-sm text-primary font-medium truncate">{data.phone}</span>
              )}
            </div>
            {/* LinkedIn */}
            <div className="flex items-center gap-3">
              <TbBrandLinkedin size={16} className="text-primary shrink-0" />
              {editMode ? (
                <input value={data.linkedin} onChange={set('linkedin')} className={inputCls} placeholder="LinkedIn URL" />
              ) : (
                <a href={data.linkedin} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">{data.linkedin || '—'}</a>
              )}
            </div>
            {/* Twitter */}
            <div className="flex items-center gap-3">
              <TbBrandTwitter size={16} className="text-primary shrink-0" />
              {editMode ? (
                <input value={data.twitter} onChange={set('twitter')} className={inputCls} placeholder="Twitter URL" />
              ) : (
                <a href={data.twitter} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">{data.twitter || '—'}</a>
              )}
            </div>

            {/* Delete */}
            <div className="pt-4 border-t border-border">
              <button onClick={onDelete} className="w-full hover:py-2 hover:px-4 border-none rounded flex items-center justify-between text-[#ff502e] hover:bg-red-50/50 transition-colors bg-white cursor-pointer group">
                <div className="flex items-center gap-3 text-sm font-medium"><TbTrash className="text-[1.2rem]" /><span>Delete Team Member</span></div>
                <TbArrowLeft className="text-[#ff502e] rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: User Details (Bio / Full Bio) ── */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-primary">User Details</h3>

          {/* Bio */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-4">Bio {editMode && <span className="text-accent ml-1">({lang.toUpperCase()})</span>}</h4>
            {editMode ? (
              <textarea
                rows={3}
                value={data.bio[lang]}
                onChange={setBilingual('bio')}
                className={inputCls}
                placeholder="Short bio..."
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{getText(data.bio, lang) || '—'}</p>
            )}
          </div>

          {/* Full Bio */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-4">Full Bio {editMode && <span className="text-accent ml-1">({lang.toUpperCase()})</span>}</h4>
            {editMode ? (
              <textarea
                rows={6}
                value={data.fullBio[lang]}
                onChange={setBilingual('fullBio')}
                className={inputCls}
                placeholder="Full biography..."
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{getText(data.fullBio, lang) || '—'}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function ManageTeamPage() {
  const [members, setMembers] = useState([]);
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
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await getTeamMembers();
      setMembers(res.data || []);
    } catch (error) {
      sonnerToast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const filtered = members.filter(
    (m) =>
      getText(m.name).toLowerCase().includes(search.toLowerCase()) ||
      getText(m.role).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSaveEdit = (updated) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelected(updated);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTeamMember(deleteItem._id || deleteItem.id);
      sonnerToast.success('Member removed');
      setMembers((prev) => prev.filter((m) => (m._id || m.id) !== (deleteItem._id || deleteItem.id)));
      setDeleteItem(null);
      setSelected(null);
    } catch (error) {
      sonnerToast.error(error.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddMember = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {imageItem && (
          <ImageModal
            item={imageItem}
            onClose={() => setImageItem(null)}
            onUpdate={(newImg) => {
              const updated = { ...imageItem, image: newImg };
              setImageItem(updated);
              handleSaveEdit(updated);
            }}
          />
        )}
        {deleteItem && (
          <DeleteModal item={deleteItem} onConfirm={handleConfirmDelete} onCancel={() => setDeleteItem(null)} isDeleting={isDeleting} />
        )}
        {showAdd && <AddModal onSave={handleAddMember} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selected ? (
          <DetailView
            key="detail"
            member={selected}
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
                  placeholder="Search team members..."
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
                <TbPlus size={20} /> Add New Member
              </button>
            </div>

            {/* Table */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        {['Name', 'Image', 'Email', 'Role', 'Actions'].map((h, i) => (
                          <th
                            key={h}
                            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground${i === 4 ? ' text-right' : ''}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                      {loading ? (
                        <tr><td colSpan={5} className="py-10 text-center text-muted-foreground italic">Loading team...</td></tr>
                      ) : 
                      filtered.length === 0 ? (
                        <tr><td colSpan={5} className="py-10 text-center text-muted-foreground italic">No team members found.</td></tr>
                      ) : 
                      paginated.map((member) => (
                        <tr key={member._id || member.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-primary">{getText(member.name)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setImageItem(member)}
                              className="flex items-center gap-2 text-accent hover:text-accent/70 transition-colors group"
                            >
                              <span className="text-sm font-medium">View Image</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{member.email}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{getText(member.role)}</td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setSelected(member)}
                                className="p-2 hover:bg-accent/10 hover:text-accent rounded-lg text-muted-foreground transition-colors"
                                title="View Details"
                              >
                                <TbEye size={18} />
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
        )}
      </AnimatePresence>
    </div>
  );
}
