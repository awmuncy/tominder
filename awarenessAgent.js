import _ from 'date-fns';
import fetch from 'node-fetch';
import Reminder from './Reminder.schema.js';
import parser from 'cron-parser';
var timeDenoms = ["seconds", "minutes", "hours", "days", "weeks", "months"];

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
};

function addInterval(intervalObj={}, date=new Date()) {

    var next = date;
    timeDenoms.forEach(denom => {

        next = _["add" + capitalize(denom)](next, intervalObj[denom] ?? 0);
    });

    return next;
}

function random(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}


/**
 * @class
 * @property {string} title It's a title
 * @param {object} options
 * @param {string} options.title 
 * @param 
 */
class StabilityAgent {

    #record;

    constructor(agent) {
        this.#record = agent;
    }

    get interval() {
        this.#record.interval;
    }

    get reminderSchedule() {
        return this.#record.reminderSchedule;
    }

    get title() {
        return this.#record.title;
    }

    get id() {
        return this.#record._id;
    }

    get interval() {
        return this.#record.interval;
    }

    get lastPerformed() {
        return this.#record.lastPerformed ?? 0;
    }

    get onComplete() {
        return this.#record.onComplete;
    }

    get successActions() {
        return this.#record.successActions;
    }

    get nextReminder() {
        return this.#generateNextReminder();
    }

    get remindersSent() {
        return this.#record.remindersSent;
    }

    get reminders() {
        return this.#record.reminders;
    }

    get status() {
        return this.nextReminder > new Date() ? "Completed" : "Incomplete";
    }

    reflect() {
        if(this.isPastDue) {
            this.remind();
            this.save();
        }        
    }

    /**
     * @returns {Number} Interger to add to miliseconds
     */
    #addDefaultInterval(previousDate) {
        var next = previousDate;


        timeDenoms.forEach(denom => {

            next = _["add" + capitalize(denom)](next, this.interval[denom] ?? 0);
        });

        return next;
    }

    #giveOrTake(previousDate) {
        var next = previousDate;
        var i = 1;
        timeDenoms.forEach(denom => {
            if(!this.interval?.giveOrTake?.[denom]) return;
            var giveOrTake = Math.floor((random(this.lastPerformed + i) - .5) * 2 * this.interval.giveOrTake[denom]);
            i++;
            next = _["add" + capitalize(denom)](next, giveOrTake ?? 0);
        });
        return next;
    }

    #findScheduledTime(previousDate) {

        if(!this.#record.cron) return previousDate;

        return parser.parseExpression(this.#record.cron, {currentDate: previousDate, iterator: true}).next().value._date.toJSDate();
    }

    #generateNextReminder() {

        var nextDate = new Date(this.lastPerformed);

        nextDate = this.#addDefaultInterval(nextDate);
        nextDate = this.#giveOrTake(nextDate);
        nextDate = this.#findScheduledTime(nextDate);

        return nextDate;
    }

    get isPastDue() {
        return (new Date() > this.nextReminder);
    }

    remind() {
        
        this.reminders.forEach((reminder, key) => {
            var keyAlreadyFired = this.remindersSent.includes(key);
            if(keyAlreadyFired) return;
            if(addInterval(reminder.wait ?? {}, this.nextReminder.getTime()) < new Date().getTime()) {
                
                fetch(reminder.action).then(r => {
                    this.#record.remindersSent.push(key);
                    var reminderId = reminder.title ?? key;
                    console.log(`Reminder ${reminderId} sent`);
                }).catch(err => {
                    //console.log(err);
                    console.log(`Agent ${this.title} (${this.id}) contains malformed reminders`);
                });
            }
        });

    }

    markComplete(completedAt) {

        this.#record.lastPerformed = completedAt ? new Date(completedAt).getTime() : new Date().getTime();
        console.log("Set latest complete day, shut reminder off, keep checking util...");
        this.successActions?.forEach(successAction => {
            successAction(this);
        });
        this.#record.remindersSent = [];
        this.onComplete.forEach(complete => {
            fetch(complete.action).then(r => {
                console.log(`"${this.title}" marked complete, ${complete.title} sent`);
            }).catch(err=>{
                console.log("Oof");
                console.log(err);
            })
        })
        this.save();

    }


    async save() {
        
        var reminderDoc = await Reminder.findOne({_id: this.id});
        if(!reminderDoc) throw(new Error("No document.")); 
        reminderDoc.lastPerformed = this.#record.lastPerformed;
        reminderDoc.remindersSent = this.#record.remindersSent;
        reminderDoc.save();

    }


}

export default StabilityAgent;