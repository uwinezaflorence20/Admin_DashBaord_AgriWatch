'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { 
  TbUser, TbInfoCircle, TbPencil, TbX, TbCheck, TbAlertCircle, TbLock, TbEye, TbEyeOff, TbPhone
} from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyProfile, updateProfile, updatePassword, contactDevelopers } from '@/lib/api';

const getText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val.en || '';
};

// --- Validation Schema ---
const passwordSchema = z.object({
  existingPassword: z.string().min(1, "Existing password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('account');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [lang, setLang] = useState('en');

  const [passwordForm, setPasswordForm] = useState({
    existingPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    existing: false,
    new: false,
    confirm: false
  });
  
  const [toast, setToast] = useState({ type: '', message: '' });

  const [profile, setProfile] = useState({
    name: '',
    role: '',
    email: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  
  const [supportForm, setSupportForm] = useState({ subject: '', message: '', phoneNumber: '' });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        const loadedProfile = {
          name: data.name || '',
          role: data.role || 'Admin',
          email: data.email || '',
        };
        setProfile(loadedProfile);
        setEditForm(loadedProfile);
      } catch (error) {
        setToast({ type: 'error', message: 'Failed to load profile' });
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordUpdate = async () => {
    setToast({ type: '', message: '' });
    try {
      passwordSchema.parse(passwordForm);
      await updatePassword({ oldPassword: passwordForm.existingPassword, newPassword: passwordForm.newPassword });
      setToast({ type: 'success', message: 'Password updated successfully!' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordForm({ existingPassword: '', newPassword: '', confirmPassword: '' });
        setToast({ type: '', message: '' });
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setToast({ type: 'error', message: error.issues[0].message });
      } else {
        setToast({ type: 'error', message: error.message || 'Failed to update password' });
      }
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        await updateProfile({ name: editForm.name, email: editForm.email });
        setProfile(editForm);
        setIsEditing(false);
        localStorage.setItem('name', editForm.name);
        localStorage.setItem('email', editForm.email);
        setToast({ type: 'success', message: 'Profile updated successfully!' });
        setTimeout(() => setToast({ type: '', message: '' }), 2500);
        // Dispatch custom event to update layout navbar
        window.dispatchEvent(new Event('profileUpdated'));
      } catch (error) {
         setToast({ type: 'error', message: error.message || 'Failed to update profile' });
      }
    } else {
      setEditForm(profile);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleSupportSubmit = async () => {
    if (!supportForm.subject || !supportForm.message || !supportForm.phoneNumber) {
      setToast({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setIsSubmittingSupport(true);
    setToast({ type: '', message: '' });

    try {
      await contactDevelopers({
        fullName: profile.name,
        email: profile.email,
        phoneNumber: supportForm.phoneNumber,
        subject: supportForm.subject,
        message: supportForm.message
      });
      setToast({ type: 'success', message: 'Message sent successfully!' });
      setSupportForm({ subject: '', message: '', phoneNumber: '' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to send message' });
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl">
      
      {/* --- Left Sidebar (Tabs) --- */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-4">
        <button
          onClick={() => setActiveTab('account')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            activeTab === 'account' 
            ? 'border-accent text-accent bg-accent/5' 
            : 'border-border text-muted-foreground hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <TbUser size={20} />
            <span className="font-semibold text-sm">My Account</span>
          </div>
          <span className="text-xs">&gt;</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            activeTab === 'support' 
            ? 'border-accent text-accent bg-accent/5' 
            : 'border-border text-muted-foreground hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <TbInfoCircle size={20} />
            <span className="font-semibold text-sm">Contact Developer</span>
          </div>
          <span className="text-xs">&gt;</span>
        </button>
      </div>

      {/* --- Right Content Area --- */}
      <div className="flex-grow bg-white rounded-2xl shadow-sm border border-border p-6 lg:p-8">
        
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">My Account</h2>
              <div className="flex gap-2 items-center">
                {isEditing && (
                  <button onClick={handleCancel} className="px-3 py-1.5 text-sm font-semibold border border-border text-muted-foreground rounded-lg hover:bg-muted/40 transition-colors">
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleEditToggle} 
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    isEditing ? 'bg-accent text-white hover:bg-accent/90' : 'text-accent hover:bg-accent/10'
                  }`}
                >
                  {isEditing ? <TbCheck size={18} /> : <TbPencil size={20} />}
                  {isEditing && <span>Save</span>}
                </button>
              </div>
            </div>

            {toast.message && !isPasswordModalOpen && (
              <div className={`px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold ${
                toast.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {toast.type === 'success' ? <TbCheck size={18} /> : <TbAlertCircle size={18} />}
                <span>{toast.message}</span>
              </div>
            )}

            {/* Gradient Card */}
            <div className="bg-gradient-to-r from-accent to-primary rounded-xl p-6 text-white flex items-center gap-4">
              <div className="w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center shrink-0">
                <TbUser size={32} className="text-white" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value })}
                    className="bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-3 py-1.5 text-lg font-bold w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                ) : (
                  <h3 className="text-lg font-bold">{getText(profile.name, lang)}</h3>
                )}
                
                  <p className="text-white/80 text-sm font-medium mt-1 uppercase">Adminstrator</p>
                
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-0">

              <div className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  </div>
                  <span className="text-sm font-medium">Email</span>
                </div>
                {isEditing ? (
                  <input 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="border border-border rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 w-48 text-right"
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">{profile.email}</span>
                )}
              </div>

             

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                    <TbLock size={18} />
                  </div>
                  <span className="text-sm font-medium">Password</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">XXXXXXXX</span>
                  <button 
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    <TbPencil size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
             <h2 className="text-xl font-bold text-primary text-center">Contact Us</h2>
             <p className="text-sm text-muted-foreground text-center">If you experience any problem with the system, please fill out this form and describe where you are facing difficulties. Our development team will get back to you as soon as possible.</p>

             {toast.message && activeTab === 'support' && (
                <div className={`px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold max-w-2xl mx-auto ${
                  toast.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {toast.type === 'success' ? <TbCheck size={18} /> : <TbAlertCircle size={18} />}
                  <span>{toast.message}</span>
                </div>
              )}

             <div className="space-y-4 max-w-2xl mx-auto mt-6">
                <div className="border border-border rounded-xl p-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-accent/40 transition-all">
                   <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                     <TbInfoCircle className="text-accent" />
                   </div>
                   <input 
                    className="w-full text-sm outline-none bg-transparent" 
                    placeholder="Enter message subject" 
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                    disabled={isSubmittingSupport}
                   />
                </div>

                <div className="border border-border rounded-xl p-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-accent/40 transition-all">
                   <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                     <TbPhone className="text-accent" />
                   </div>
                   <input 
                    className="w-full text-sm outline-none bg-transparent" 
                    placeholder="Enter your phone number" 
                    value={supportForm.phoneNumber}
                    onChange={(e) => setSupportForm({...supportForm, phoneNumber: e.target.value})}
                    disabled={isSubmittingSupport}
                   />
                </div>

                <textarea 
                  className="w-full border border-border rounded-xl p-4 text-sm outline-none resize-none min-h-[150px] focus:ring-2 focus:ring-accent/40 transition-all" 
                  placeholder="Type your message here..."
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                  disabled={isSubmittingSupport}
                ></textarea>
                <button 
                  onClick={handleSupportSubmit}
                  disabled={isSubmittingSupport}
                  className="w-full bg-accent text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingSupport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>SENDING...</span>
                    </>
                  ) : (
                    <span>SEND</span>
                  )}
                </button>
             </div>
          </div>
        )}
      </div>

      {/* --- Update Password Modal --- */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-primary">Update Password</h3>
                <button 
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <TbX size={20} />
                </button>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Existing Password</label>
                  <div className="relative group">
                    <input 
                      type={showPasswords.existing ? "text" : "password"}
                      className="w-full border border-border rounded-xl pl-4 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all bg-muted/5 group-hover:bg-transparent"
                      placeholder="Enter existing password"
                      value={passwordForm.existingPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, existingPassword: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, existing: !showPasswords.existing})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors p-1"
                    >
                      {showPasswords.existing ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">New Password</label>
                  <div className="relative group">
                    <input 
                      type={showPasswords.new ? "text" : "password"}
                      className="w-full border border-border rounded-xl pl-4 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all bg-muted/5 group-hover:bg-transparent"
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors p-1"
                    >
                      {showPasswords.new ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <input 
                      type={showPasswords.confirm ? "text" : "password"}
                      className="w-full border border-border rounded-xl pl-4 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all bg-muted/5 group-hover:bg-transparent"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors p-1"
                    >
                      {showPasswords.confirm ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Toast Notification */}
              {toast.message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold border ${
                    toast.type === 'success' 
                    ? 'bg-green-50 text-green-600 border-green-100' 
                    : 'bg-red-50 text-red-600 border-red-100'
                  }`}
                >
                  {toast.type === 'success' ? <TbCheck size={18} /> : <TbAlertCircle size={18} />}
                  <span>{toast.message}</span>
                </motion.div>
              )}

              <button
                onClick={handlePasswordUpdate}
                className="w-full py-3.5 bg-accent text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 active:scale-[0.98]"
              >
                Update Password
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
