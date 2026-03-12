import mongoose from 'mongoose';

const onlineClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Class title is required'],
    trim: true,
  },
  platform: {
    type: String,
    enum: ['Google Meet', 'Teams', 'Zoom', 'Webex', 'Other'],
    required: [true, 'Platform is required'],
  },
  meetingLink: {
    type: String,
    required: [true, 'Meeting link is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required'],
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Staff ID is required'],
  },
}, { timestamps: true });

export default mongoose.model('OnlineClass', onlineClassSchema);
