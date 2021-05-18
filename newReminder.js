import Reminder from './Reminder.schema.js';

const instance = new Reminder();

var blueFruit = {
    "title": "Haircut",
    "interval": {
        "minutes": 0,
        "months": 0,
        "days": 0,
        "weeks": 0,
        "seconds": 15,
        "giveOrTake": {
            "seconds": 0,
            "days": 0,
            "weeks": 0,
            "minutes": 0
        },
        "mods": [

        ]
    },
    "reminders": [
        {
            "action": "http://ras.allenmuncy.com:3450/0/0/255/0/0"
        },
        {
            "action": "http://ras.allenmuncy.com:3450/0/0/255/0/0",
            "wait": {
                "seconds": 15
            }
        }
    ],
    "onComplete": [
        {
            "action": "http://ras.allenmuncy.com:3450/0/0/0/0/0"
        }
    ]
};

Object.assign(instance, blueFruit);
instance.save();

export default {};