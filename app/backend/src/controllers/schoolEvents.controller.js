import fs from 'fs';
import path from 'path';
import SchoolEvent from '../models/SchoolEvent.js';
import Staff from '../models/Staff.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'events');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const getSchoolEvents = async (req, res, next) => {
  try {
    const { eventType, status, startDate, targetAudience } = req.query;
    const filter = { isActive: true };
    
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (targetAudience) filter.targetAudience = { $in: [targetAudience, 'all'] };
    
    if (startDate) {
      filter.startDate = { $gte: new Date(startDate) };
    }

    const events = await SchoolEvent.find(filter)
      .populate('createdBy', 'name email')
      .populate('specificClasses', 'name section')
      .sort({ startDate: 1 });
    
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

export const getSchoolEventById = async (req, res, next) => {
  try {
    const event = await SchoolEvent.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('specificClasses', 'name section');
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const createSchoolEvent = async (req, res, next) => {
  try {
    const { title, eventType, startDate, targetAudience, specificClasses, priority } = req.body;
    
    if (!title || !eventType || !startDate) {
      return res.status(400).json({ success: false, message: 'Title, event type, and start date are required' });
    }

    // Handle file attachments
    const attachments = (req.files || []).map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size
    }));

    const eventData = {
      title,
      eventType,
      startDate: new Date(startDate),
      targetAudience: targetAudience ? JSON.parse(targetAudience) : ['all'],
      specificClasses: specificClasses ? JSON.parse(specificClasses) : [],
      priority: priority || 'medium',
      attachments,
      createdBy: req.user.userId
    };

    // Auto-set status based on dates
    const now = new Date();
    now.setHours(0,0,0,0);
    const eventDate = new Date(eventData.startDate);
    eventDate.setHours(0,0,0,0);

    if (now < eventDate) {
      eventData.status = 'upcoming';
    } else if (now.getTime() === eventDate.getTime()) {
      eventData.status = 'ongoing';
    } else {
      eventData.status = 'completed';
    }

    const event = new SchoolEvent(eventData);
    await event.save();

    const populatedEvent = await SchoolEvent.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('specificClasses', 'name section');

    res.status(201).json({ success: true, data: populatedEvent });
  } catch (err) {
    next(err);
  }
};

export const updateSchoolEvent = async (req, res, next) => {
  try {
    const event = await SchoolEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const { title, eventType, startDate, targetAudience, specificClasses, priority, status } = req.body;

    // Update fields
    if (title) event.title = title;
    if (eventType) event.eventType = eventType;
    if (startDate) event.startDate = new Date(startDate);
    if (targetAudience) event.targetAudience = JSON.parse(targetAudience);
    if (specificClasses) event.specificClasses = JSON.parse(specificClasses);
    if (priority) event.priority = priority;
    if (status) event.status = status;

    // Auto-update status if not manually set
    if (!status) {
      const now = new Date();
      now.setHours(0,0,0,0);
      const eventDate = new Date(event.startDate);
      eventDate.setHours(0,0,0,0);

      if (now < eventDate) {
        event.status = 'upcoming';
      } else if (now.getTime() === eventDate.getTime()) {
        event.status = 'ongoing';
      } else {
        event.status = 'completed';
      }
    }

    await event.save();

    const updatedEvent = await SchoolEvent.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('specificClasses', 'name section');

    res.json({ success: true, data: updatedEvent });
  } catch (err) {
    next(err);
  }
};

export const deleteSchoolEvent = async (req, res, next) => {
  try {
    const event = await SchoolEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Delete attached files
    event.attachments.forEach(att => {
      const filePath = path.join(UPLOAD_DIR, att.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await SchoolEvent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getEventsForUser = async (req, res, next) => {
  try {
    const user = req.user;
    let userTargetAudience = ['all'];
    
    // Determine target audience based on user role
    if (user.role === 'student') {
      userTargetAudience = ['all', 'students'];
    } else if (user.role === 'staff') {
      userTargetAudience = ['all', 'staff'];
    } else if (user.role === 'parent') {
      userTargetAudience = ['all', 'parents'];
    } else if (user.role === 'admin') {
      userTargetAudience = ['all', 'students', 'staff', 'parents'];
    }

    // Show events for the current academic year (last 12 months → next 12 months)
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);
    from.setHours(0, 0, 0, 0);

    const filter = {
      isActive: true,
      targetAudience: { $in: userTargetAudience },
      startDate: { $gte: from }
    };

    const events = await SchoolEvent.find(filter)
      .populate('createdBy', 'name email')
      .populate('specificClasses', 'name section')
      .sort({ startDate: 1 })
      .limit(20);

    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};
