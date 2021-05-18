import Reminder from '../Reminder.schema.js';

export default async (post, edit=false) => {

    try {
        var thisReminder; 
        
        if(edit) {
            thisReminder = await Reminder.findOne({_id: post.id});
            console.log("Editing");
        } else {
            thisReminder = new Reminder();
            console.log("Newb");
        }

        var instance = {
            title: post.title,
            interval: {
                seconds: parseInt(post.seconds) ?? 0,
                minutes: parseInt(post.minutes) ?? 0,
                hours: parseInt(post.hours) ?? 0,
                days: parseInt(post.days) ?? 0,
                weeks: parseInt(post.weeks) ?? 0,
                months: parseInt(post.months) ?? 0,
                giveOrTake: {
                    seconds: parseInt(post["give-or-take-days"]) ?? 0,
                    minutes: parseInt(post["give-or-take-minutes"]) ?? 0,
                    hours: parseInt(post["give-or-take-hours"]) ?? 0,
                    days: parseInt(post["give-or-take-days"]) ?? 0,
                    weeks: parseInt(post["give-or-take-weeks"]) ?? 0,
                    months: parseInt(post["give-or-take-months"]) ?? 0
                },
                mods: []
            },
            reminders: [],
            onComplete: []
        };
    
        var foundReminders = post["action-url"].forEach((action, key) => {
            var newReminder = {
                title: action,
                action: post["action-title"][key],
                wait: parseInt(post["action-wait"][key])
            };
            instance.reminders.push(newReminder);
        });
    
    
    
        
        
        Object.assign(thisReminder, instance);
        thisReminder.save();
    

    } catch (e) {
        console.log(e);
        return false;
    }

};