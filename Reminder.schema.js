import mongoose from 'mongoose';

const Reminder = new mongoose.Schema({
    title: { type: String },
    cron: { type: String },
    reminderTimes: { type: String },
    id: { type: String },
    interval: { type: Object },
    reminders: { type: Array },
    onComplete: { type: Array },
    lastPerformed: { type: Number },
    remindersSent: { type: Array }
});

const ReminderModel = mongoose.model('Reminder', Reminder);

export default ReminderModel;