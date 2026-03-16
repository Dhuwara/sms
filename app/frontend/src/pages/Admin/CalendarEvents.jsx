import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Edit2, Trash2, X, Upload, FileText, MapPin, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/utils/api';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses } from '@/store/slices/classesSlice';

const AdminCalendarEvents = () => {
  const dispatch = useDispatch();
  const classes = useSelector(s => s.classes.list);
  const classesStatus = useSelector(s => s.classes.status);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null });
  
  const [formData, setFormData] = useState({
    title: '',
    eventType: 'other',
    startDate: '',
    targetAudience: ['all'],
    specificClasses: [],
    priority: 'medium'
  });

  useEffect(() => {
    fetchEvents();
    if (classesStatus === 'idle') dispatch(fetchClasses());
  }, [classesStatus, dispatch]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/school-events');
      setEvents(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      eventType: 'other',
      startDate: '',
      targetAudience: ['all'],
      specificClasses: [],
      priority: 'medium'
    });
    setFiles([]);
    setEditingEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('eventType', formData.eventType);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('targetAudience', JSON.stringify(formData.targetAudience));
      formDataToSend.append('specificClasses', JSON.stringify(formData.specificClasses));
      formDataToSend.append('priority', formData.priority);

      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      if (editingEvent) {
        await api.put(`/api/school-events/${editingEvent._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Event updated successfully');
      } else {
        await api.post('/api/school-events', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Event created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      eventType: event.eventType,
      startDate: new Date(event.startDate).toISOString().split('T')[0],
      targetAudience: event.targetAudience,
      specificClasses: event.specificClasses?.map(c => c._id) || [],
      priority: event.priority
    });
    setShowModal(true);
  };

  const handleDelete = (eventId) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/api/school-events/${eventId}`);
          toast.success('Event deleted successfully');
          fetchEvents();
        } catch (error) {
          toast.error('Failed to delete event');
        }
      }
    });
  };

  const getEventStyle = (eventType, priority) => {
    const eventColors = {
      holiday: { bg: 'bg-[#E0E7FF]', border: 'border-[#6366F1]', text: 'text-[#4338CA]' },
      exam: { bg: 'bg-[#FEE2E2]', border: 'border-[#DC2626]', text: 'text-[#991B1B]' },
      sports: { bg: 'bg-[#D1FAE5]', border: 'border-[#10B981]', text: 'text-[#065F46]' },
      cultural: { bg: 'bg-[#FED7AA]', border: 'border-[#FB923C]', text: 'text-[#C2410C]' },
      academic: { bg: 'bg-[#DBEAFE]', border: 'border-[#3B82F6]', text: 'text-[#1E40AF]' },
      meeting: { bg: 'bg-[#F3F4F6]', border: 'border-[#6B7280]', text: 'text-[#374151]' },
      other: { bg: 'bg-[#FEF3C7]', border: 'border-[#F59E0B]', text: 'text-[#92400E]' }
    };
    
    const baseStyle = eventColors[eventType] || eventColors.other;
    
    if (priority === 'high') {
      return {
        ...baseStyle,
        bg: 'bg-[#FEE2E2]',
        border: 'border-[#DC2626]',
        text: 'text-[#991B1B]'
      };
    }
    
    return baseStyle;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0F172A]">School Calendar Events</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#4338CA] transition-colors"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl border-2 border-[#FCD34D] p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="text-[#10B981]" size={24} />
          Upcoming Events
        </h2>
        
        {events.length === 0 ? (
          <div className="text-center py-12 text-[#64748B]">
            <CalendarDays className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg font-medium">No events scheduled</p>
            <p className="text-sm mt-1">Create your first school event to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const style = getEventStyle(event.eventType, event.priority);
              return (
                <div key={event._id} className={`p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-bold text-lg ${style.text}`}>{event.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          event.status === 'upcoming' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                          event.status === 'ongoing' ? 'bg-[#D1FAE5] text-[#065F46]' :
                          event.status === 'completed' ? 'bg-[#F1F5F9] text-[#64748B]' :
                          'bg-[#FEE2E2] text-[#991B1B]'
                        }`}>
                          {event.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${style.bg} ${style.text}`}>
                          {event.eventType}
                        </span>
                        {event.priority === 'high' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-[#FEE2E2] text-[#991B1B]">
                            High Priority
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(event.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {event.targetAudience.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Edit2 size={12} />
                          By {event.createdBy?.name || 'Admin'}
                        </span>
                        {event.attachments && event.attachments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {event.attachments.length} file(s)
                          </span>
                        )}
                      </div>
                      
                      {event.specificClasses && event.specificClasses.length > 0 && (
                        <div className="mt-2 text-xs text-[#64748B]">
                          Classes: {event.specificClasses.map(c => c.name).join(', ')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-[#4F46E5] hover:bg-[#DBEAFE] rounded-lg transition-colors"
                        title="Edit event"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0F172A]">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2"
                  placeholder="Enter event title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Type *</label>
                  <select
                    required
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2"
                  >
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="academic">Academic</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience</label>
                <div className="space-y-2">
                  {['all', 'students', 'staff', 'parents'].map((audience) => (
                    <label key={audience} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.targetAudience.includes(audience)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, targetAudience: [...formData.targetAudience, audience] });
                          } else {
                            setFormData({ ...formData, targetAudience: formData.targetAudience.filter(a => a !== audience) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="capitalize">{audience}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.targetAudience.includes('specific-class') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Specific Classes</label>
                  <select
                    multiple
                    value={formData.specificClasses}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, specificClasses: selected });
                    }}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2 h-24"
                  >
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - {cls.section}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#64748B] mt-1">Hold Ctrl/Cmd to select multiple classes</p>
                </div>
              )}

              {formData.eventType !== 'holiday' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Attachments <span className="text-[#64748B] font-normal">(Optional — Max 3 files, 10MB each)</span></label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-2"
                    accept="*/*"
                  />
                  {files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {files.map((file, index) => (
                        <div key={index} className="text-xs text-[#64748B] flex items-center gap-2">
                          <FileText size={12} />
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border-2 border-[#E2E8F0] rounded-lg font-semibold hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4338CA] disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminCalendarEvents;
