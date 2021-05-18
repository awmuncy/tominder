import Reminder from '../Reminder.schema.js';

var parseIntForm = field => {
    
    return field==="" ? 0 : parseInt(field);
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
            interval: {
                seconds: parseIntForm(post.seconds ?? 0),
                minutes: parseIntForm(post.minutes ?? 0),
                hours: parseIntForm(post.hours ?? 0),
                days: parseIntForm(post.days ?? 0),
                weeks: parseIntForm(post.weeks ?? 0),
                months: parseIntForm(post.months=="" ?? 0),
                giveOrTake: {
                    seconds: parseIntForm(post["give-or-take-days"] ?? 0),
                    minutes: parseIntForm(post["give-or-take-minutes"] ?? 0),
                    hours: parseIntForm(post["give-or-take-hours"] ?? 0),
                    days: parseIntForm(post["give-or-take-days"] ?? 0),
                    weeks: parseIntForm(post["give-or-take-weeks"] ?? 0),
                    months: parseIntForm(post["give-or-take-months"] ?? 0)
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
    

    } catch (e) {
        console.log(e);
        return false;
    }

};