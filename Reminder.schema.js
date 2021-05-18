import mongoose from 'mongoose';

const Reminder = new mongoose.Schema({
    title: { type: String, default: 'Some Title'},
    id: { type: String },
    version: { type: Number, default: 0},
    interval: { type: Object },
    reminders: { type: Array },
    onComplete: { type: Array },
    lastPerformed: { type: Number },
    remindersSent: { type: Array },
    nextReminder: { type: Number }
});

const ReminderModel = mongoose.model('Reminder', Reminder);

export default ReminderModel;