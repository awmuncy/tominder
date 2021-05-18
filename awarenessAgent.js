import fs from 'fs';
import slugify from 'slugify';
import _, {format} from 'date-fns';
import fetch from 'node-fetch';
import Reminder from './Reminder.schema.js';

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
    #lastPerformed;
    #nextReminder;
    #successActions;
    #remindersSent = [];
    #version;

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
        this.#version = props.version ?? 0;


        this.#interval = props.interval;
        this.#lastPerformed = props.lastPerformed ?? 0;
        this.#nextReminder = props.nextReminder ? new Date(props.nextReminder) : this.generateNextReminder();
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
        return this.#nextReminder ?? this.generateNextReminder();
    }

    regenerateNextReminder() {
        this.#nextReminder = this.generateNextReminder();
    }



    generateNextReminder() {
        var current = new Date(this.#lastPerformed);

        var timeDenoms = ["seconds", "minutes", "hours", "days", "weeks", "months"];

        var next = current;
        timeDenoms.forEach(denom => {

            next = _["add" + capitalize(denom)](next, this.#interval[denom] ?? 0);
        });

        // Give or take

        timeDenoms.forEach(denom => {
            if(!this.#interval?.giveOrTake?.[denom]) return;
            var giveOrTake = Math.floor((Math.random() - .5) * 2 * this.#interval.giveOrTake[denom]);

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

        return next;
    }


    isPastDue() {
        var isPastDue = (new Date().getTime() > this.#nextReminder.getTime());
        return isPastDue;

    }




    remind() {
        
        this.#reminders.forEach((reminder, key) => {
            var keyAlreadyFired = this.#remindersSent.includes(key);
            if(keyAlreadyFired) return;
            if(addInterval(reminder.wait ?? {}, this.#nextReminder.getTime()) < new Date().getTime()) {
                
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
Next Reminder: ${this.#nextReminder}
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
    get timeToNext() {
        return this.#nextReminder;
    }
    get nextReminder() {
        return this.#nextReminder;
    }

    markComplete() {
        this.#lastPerformed = new Date().getTime();
        console.log("Set latest complete day, shut reminder off, keep checking util...");
        this.#successActions?.forEach(successAction => {
            successAction(this);
        });
        this.#nextReminder = this.generateNextReminder();
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
        reminderDoc.nextReminder = this.#nextReminder.getTime();
        reminderDoc.save();

    }


}

export default StabilityAgent;