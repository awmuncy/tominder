import Reminder from '../Reminder.schema.js';

var parseIntForm = field => {
    
    return field ? parseInt(field) : 0;
}

export default async (post, edit=false) => {

    try {
        var thisReminder; 
        
        if(edit) {
            thisReminder = await Reminder.findOne({_id: post.id});
            console.log("Editing");
        } else {
            thisReminder = new Reminder();
            console.log("New Reminder");
        }

        var instance = {
            title: post.title,
            asleep: (post.asleep),
            cron: post.cron,
            interval: {
                seconds: parseIntForm(post.seconds),
                minutes: parseIntForm(post.minutes),
                hours: parseIntForm(post.hours),
                days: parseIntForm(post.days),
                weeks: parseIntForm(post.weeks),
                months: parseIntForm(post.months),
                giveOrTake: {
                    seconds: parseIntForm(post["give-or-take-seconds"]),
                    minutes: parseIntForm(post["give-or-take-minutes"]),
                    hours: parseIntForm(post["give-or-take-hours"]),
                    days: parseIntForm(post["give-or-take-days"]),
                    weeks: parseIntForm(post["give-or-take-weeks"]),
                    months: parseIntForm(post["give-or-take-months"])
                },
                mods: []
            },
            reminders: [],
            onComplete: []
        };

        if(!Array.isArray(post["action-url"])) {
            post["action-url"] = [post["action-url"]];
            post["action-title"] = [post["action-title"]];
            post["action-wait"] = [post["action-wait"]];
        }
        if(!Array.isArray(post["completion-action-title"])) {
            post["completion-action-url"] = [post["completion-action-url"]];
            post["completion-action-title"] = [post["completion-action-title"]];
        }
    
        var foundReminders = post["action-url"].forEach((action, key) => {
            var newReminder = {
                title: post["action-title"][key],
                action: action,
                wait: parseInt(post["action-wait"][key])
            };
            instance.reminders.push(newReminder);
        });
    
        var foundCompletions = post["completion-action-title"].forEach((action, key) => {
            var newCompletion = {
                title: action, 
                action: post["completion-action-url"][key]
            };

            instance.onComplete.push(newCompletion);
        });
    
        
        
        Object.assign(thisReminder, instance);
        

        thisReminder.save();
        return;

    } catch (e) {
        console.log(e);
        return false;
    }

};