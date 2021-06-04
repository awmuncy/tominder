import fs from 'fs';
import slugify from 'slugify';
import _, {format} from 'date-fns';
import fetch from 'node-fetch';
import Reminder from './Reminder.schema.js';
import parser from 'cron-parser';


// const cronExpression = "*/30 * * * *";
// const interval = parser.parseExpression(cronExpression);
// console.log('Next run:', interval.prev().getTime());

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
};


function addInterval(intervalObj={}, date=new Date()) {
    var timeDenoms = ["seconds", "minutes", "hours", "days", "weeks", "months"];

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

    title;
    #id;
    #interval;
    #reminderSchedule;
    #lastPerformed;
    #successActions;
    #remindersSent = [];

    #reminders = []; 
    #onComplete = [];

/**
 *
 * @param {Object} props Description
 * @param {String} props.title Description
 * @param {Number} props.interval Description
 * @param {Number} [props.lastPerformed] Last time you did this 
 * @param {Callback} [props.reminderActions] Actions
 */
    constructor(props) {
        this.title = props.title || "Stability Agent";
        this.#id = props._id;

        this.#reminderSchedule = props.reminderSchedule;
        this.#interval = props.interval;
        this.#lastPerformed = props.lastPerformed ?? 0;
        this.#remindersSent = props.remindersSent ?? [];



        this.#reminders = props.reminders;
        this.#onComplete = props.onComplete;
    }

    reflect() {
        if(this.isPastDue()) {
            this.remind();
            this.exportCurrentState();
        }        
    }


    get nextReminder() {
        return this.generateNextReminder();
    }


    get status() {
        return this.nextReminder > new Date() ? "Completed, waiting" : "Incomplete";
    }



    generateNextReminder() {



        var current = new Date(this.#lastPerformed);

        var timeDenoms = ["seconds", "minutes", "hours", "days", "weeks", "months"];

        var next = current;
        timeDenoms.forEach(denom => {

            next = _["add" + capitalize(denom)](next, this.#interval[denom] ?? 0);
        });

        // Give or take
        var i = 1;
        timeDenoms.forEach(denom => {
            if(!this.#interval?.giveOrTake?.[denom]) return;
            var giveOrTake = Math.floor((random(current.getTime() + i) - .5) * 2 * this.#interval.giveOrTake[denom]);
            i++;
            next = _["add" + capitalize(denom)](next, giveOrTake ?? 0);
        });

        //  / Give or take

        // Mods 

        this.#interval.mods?.forEach(mod => {

            try {

                var modArgs = mod.slice(1);

                next = _[mod[0]](next, ...modArgs);

            } catch (e) {
                console.log(e);
            }


        });

        // / Mods
        next = isNaN(next.getTime()) ? new Date() : next;
        return next;
    }


    isPastDue() {
        
        if(this.#reminderSchedule) {

            var latestSlot = parser.parseExpression(this.#reminderSchedule).prev().getTime();

            var lastPerformedTooOld = (new Date(this.#lastPerformed) < latestSlot);
            var latestSlotAfterDue = (latestSlot > this.nextReminder );

            return (lastPerformedTooOld && latestSlotAfterDue);
        } else {
            this.nextReminder.getTime();
            var isPastDue = (new Date().getTime() > this.nextReminder.getTime());
            return isPastDue;
        }


    }




    remind() {
        
        this.#reminders.forEach((reminder, key) => {
            var keyAlreadyFired = this.#remindersSent.includes(key);
            if(keyAlreadyFired) return;
            if(addInterval(reminder.wait ?? {}, this.nextReminder.getTime()) < new Date().getTime()) {
                
                fetch(reminder.action).then(r => {
                    this.#remindersSent.push(key);
                    var reminderId = reminder.title ?? key;
                    console.log(`Reminder ${reminderId} sent`);
                }).catch(err => {
                    //console.log(err);
                    console.log(`Agent ${this.title} (${this.#id}) contains malformed reminders`);
                });
            }
        });

    }
    
    resendLastReminder() {
        remind(false);
    }


    activate() {
  
        console.log("\x1b[1m", `
${this.title}`, "\x1b[0m", `activited
Last performed: ${format(new Date(this.#lastPerformed ?? 0), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")}
Next Reminder: ${this.nextReminder}
`);


    }

    get id() {
        return this.#id;
    }

    get interval() {
        return this.#interval;
    }
    get lastPerformed() {
        return this.#lastPerformed;
    }


    markComplete(completedAt) {

        this.#lastPerformed = completedAt ? new Date(completedAt).getTime() : new Date().getTime();
        console.log("Set latest complete day, shut reminder off, keep checking util...");
        this.#successActions?.forEach(successAction => {
            successAction(this);
        });
        this.#remindersSent = [];
        this.#onComplete.forEach(complete => {
            fetch(complete.action).then(r => {

            }).catch(err=>{
                console.log("Oof");
                console.log(err);
            })
        })
        this.exportCurrentState() // Saves data;
        this.activate();

    }


    async exportCurrentState(location=null) {
        
        var reminderDoc = await Reminder.findOne({_id: this.#id});
        if(!reminderDoc) return;
        reminderDoc.lastPerformed = this.#lastPerformed;
        reminderDoc.remindersSent = this.#remindersSent;
        reminderDoc.save();

    }


}

export default StabilityAgent;