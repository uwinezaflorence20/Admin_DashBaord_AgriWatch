"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TbActivity, TbUsers, TbEye, TbChecklist, TbTrash,
  TbMailForward, TbLoader2, TbX, TbAlertCircle, TbBrain
} from 'react-icons/tb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getTeamMembers,
  getContacts,
  deleteContact,
  getRecentActivities,
  deleteRecentActivity,
  getModelMetrics
} from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState([
    { label: 'Total Activities', value: '...', icon: TbActivity, color: 'bg-blue-500' },
    { label: 'Team Members', value: '...', icon: TbUsers, color: 'bg-accent' },
    { label: 'Pending Inquiries', value: '...', icon: TbChecklist, color: 'bg-orange-500' },
  ]);
  
  const [modelAccuracy, setModelAccuracy] = useState(null);

  const [allRecentActivities, setAllRecentActivities] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllContacts, setShowAllContacts] = useState(false);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'contact' or 'activity'
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchModelAccuracy();
  }, []);

  const fetchModelAccuracy = async () => {
    try {
      const data = await getModelMetrics();
      setModelAccuracy(data.test_accuracy);
    } catch (error) {
      setModelAccuracy('error');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [activitiesRes, teamRes, contactRes] = await Promise.all([
        getRecentActivities(),
        getTeamMembers(),
        getContacts() 
      ]);

      const team = teamRes.data || [];
      const contactData = contactRes.data || contactRes || [];
      const activitiesData = Array.isArray(activitiesRes) ? activitiesRes : (activitiesRes.data || []);

      setAllRecentActivities(activitiesData);
      setAllContacts(contactData);

      setStats([
        { label: 'Total Activities', value: activitiesData.length.toString(), icon: TbActivity, color: 'bg-blue-500' },
        { label: 'Team Members', value: team.length.toString(), icon: TbUsers, color: 'bg-accent' },
        { label: 'Pending Inquiries', value: contactData.length.toString(), icon: TbChecklist, color: 'bg-orange-500' },
      ]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    try {
      setIsDeleting(true);
      if (deleteType === 'contact') {
        await deleteContact(itemToDelete);
        toast.success('Inquiry deleted');
        const updatedAll = allContacts.filter(c => (c._id || c.id) !== itemToDelete);
        setAllContacts(updatedAll);
        setStats(prev => prev.map(s => s.label === 'Pending Inquiries' ? { ...s, value: updatedAll.length.toString() } : s));
      } else {
        await deleteRecentActivity(itemToDelete);
        toast.success('Activity removed');
        const updatedAll = allRecentActivities.filter(a => (a._id || a.id) !== itemToDelete);
        setAllRecentActivities(updatedAll);
        setStats(prev => prev.map(s => s.label === 'Total Activities' ? { ...s, value: updatedAll.length.toString() } : s));
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(`Failed to delete ${deleteType}`);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  const handleReply = (email) => {
    window.location.href = `mailto:${email}?subject=Reply to your inquiry - AgriWatch`;
  };

  const handleActivityView = (title) => {
    const t = title.toLowerCase();
    if (t.includes('news')) router.push('/admin/news');
    else if (t.includes('team')) router.push('/admin/team');
    else if (t.includes('activity')) router.push('/admin/activities');
    else if (t.includes('article')) router.push('/admin/articles');
    else if (t.includes('contact')) router.push('/admin/dashboard');
    else toast.info('No specific page for this activity type.');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
      day: '2-digit'
    }).format(date).replace(',', '');
  };

  const getText = (val, lang = 'en') => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val.en || '';
  };

  const displayedActivities = showAllActivities ? allRecentActivities : allRecentActivities.slice(0, 3);
  const displayedContacts = showAllContacts ? allContacts : allContacts.slice(0, 2);

  const modelAccuracyValue =
    modelAccuracy === null ? '...' : modelAccuracy === 'error' ? 'N/A' : `${modelAccuracy}%`;

  const allStats = [
    ...stats,
    { label: 'Model Accuracy', value: modelAccuracyValue, icon: TbBrain, color: 'bg-purple-500', href: '/admin/model-performance' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {allStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              onClick={stat.href ? () => router.push(stat.href) : undefined}
              className={cn(
                "border-none bg-white shadow-sm h-full hover:shadow-md transition-shadow",
                stat.href && "cursor-pointer"
              )}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={cn("p-4 rounded-full text-white", stat.color || "bg-accent")}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{stat.value}</div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Activities Card */}
        <Card className="border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                 <div className="flex justify-center py-10 text-muted-foreground"><TbLoader2 className="animate-spin" size={24} /></div>
              ) : displayedActivities.length > 0 ? (
                <>
                  {displayedActivities.map((act, i) => (
                    <div key={act._id || act.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg group transition-colors hover:bg-muted/60">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">{getText(act.title)}</p>
                            <p className="text-xs text-muted-foreground">{act.description}</p>
                            <p className="text-[10px] text-muted-foreground/60 uppercase font-bold mt-1">
                              {formatDate(act.createdAt)}
                            </p>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleActivityView(getText(act.title))}
                          className="text-accent hover:bg-accent/10 p-2 rounded-full transition-colors"
                          title="View Details"
                        >
                          <TbEye size={18} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(act._id || act.id, 'activity')}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Activity"
                        >
                          <TbTrash size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {allRecentActivities.length > 3 && (
                    <button 
                      onClick={() => setShowAllActivities(!showAllActivities)}
                      className="w-full py-2 text-xs font-bold text-accent hover:bg-accent/5 rounded-lg transition-colors border border-dashed border-accent/20 mt-2"
                    >
                      {showAllActivities ? 'Show Less' : `See All (${allRecentActivities.length})`}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-center py-10 text-muted-foreground italic">No activities yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contacts Card */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Contact Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
             {loading ? (
                <div className="flex justify-center py-10 text-muted-foreground"><TbLoader2 className="animate-spin" size={24} /></div>
             ) : displayedContacts.length > 0 ? (
               <div className="space-y-3">
                 <AnimatePresence mode="popLayout">
                   {displayedContacts.map((contact) => (
                     <motion.div
                       key={contact._id || contact.id}
                       initial={{ opacity: 0, y: 5 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="p-4 bg-muted/30 rounded-xl border border-border group hover:border-accent/40 transition-colors"
                     >
                       <div className="flex justify-between items-start mb-2">
                         <div>
                           <h4 className="font-bold text-primary text-sm">{contact.fullName || contact.name}</h4>
                           <div className='flex flex-col md:flex-row justify-between gap-3'>
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                           <p className='text-xs text-muted-foreground'>{contact.phoneNumber}</p>
                           </div>
                         
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleReply(contact.email)}
                              className="p-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg transition-colors"
                              title="Reply via Email"
                            >
                              <TbMailForward size={16} />
                            </button>
                            <button 
                              onClick={() => confirmDelete(contact._id || contact.id, 'contact')}
                              className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                              title="Delete Inquiry"
                            >
                              <TbTrash size={16} />
                            </button>
                         </div>
                       </div>
                       <p className="text-xs text-primary/80 line-clamp-2 italic">&ldquo;{contact.subject}&rdquo;</p>
                       <p className="text-xs text-primary/80 line-clamp-2 italic">{contact.message}</p>
                       <div className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                          <TbChecklist size={10} /> {formatDate(contact.createdAt)}
                       </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>

                 {allContacts.length > 2 && (
                    <button 
                      onClick={() => setShowAllContacts(!showAllContacts)}
                      className="w-full py-2 text-xs font-bold text-accent hover:bg-accent/5 rounded-lg transition-colors border border-dashed border-accent/20 mt-2"
                    >
                      {showAllContacts ? 'Show Less' : `See All (${allContacts.length})`}
                    </button>
                  )}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-48 bg-muted/20 rounded-xl border border-dashed border-border p-8 text-center">
                  <TbChecklist size={48} className="text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-sm">No new inquiries today.</p>
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <h3 className="text-xl font-bold text-primary mb-2">Are you sure?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                This action cannot be undone. This {deleteType === 'contact' ? 'inquiry' : 'activity log'} will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-md shadow-red-200 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
