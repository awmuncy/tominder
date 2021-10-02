import express from 'express';
import _ from 'date-fns';
import mongoose from 'mongoose';
import mongooseDeets from "./config/mongo.json";
import Reminder from './Reminder.schema.js';
import { format } from 'date-fns';
// import newReminder from './newReminder.js';
import AwarenessAgent from './awarenessAgent.js';
import cron from 'node-cron';

var agents = [];

await mongoose.connect(mongooseDeets.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

function refreshAgents() {
    Reminder.find({}, function (err, docs) {
        if(!Array.isArray(docs)) return;
        docs.forEach(doc => {
    
            var agent = new AwarenessAgent(doc);
    
            agent.reflect();
        })
    });
}

var myCronJob = cron.schedule('*/5 * * * *', refreshAgents);






var server = express();


import bodyParser from 'body-parser';

server.use( bodyParser.json() );       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var port = 3134;
server.listen(port, () => {console.log(`Server started on port ${port}`)});

import { ListAgents, MarkedComplete, AddReminder } from './layouts/useHandlebars.js';

server.use('/public', express.static('static'));

server.post('/sleep', async (req, res, next) => {
    if(req.body.action) {
        var doc = await Reminder.findOne({_id: req.body.action});
        //
    }
});

server.post('/clear-reminders', async (req, res, next) => {

    if(req.body.action) {
        var doc = await Reminder.findOne({_id: req.body.action});
        if(doc===null) {
            res.send("Reminder not found");
            return;
        }
  
        doc.remindersSent = [];
        await doc.save();
    } else {
        await Reminder.find({}, (err, docs) => {
            docs.forEach(async doc => {
                doc.remindersSent = [];
                var result = await doc.save();
            });
        });

    }

    refreshAgents();
    

    res.send("Okay");

});
refreshAgents();
server.post("/complete", async (req, res, next) => {
    var action = req.body.action;


    var found = await Reminder.findOne({title:action}); 

    if(!found) {
        res.send("No action found");
        return;
    }
    var at = req.body.time ? parseInt(req.body.time) : null;

    found = new AwarenessAgent(found);
    
    found.markComplete(at);

    res.send(MarkedComplete({title: action}));
});



server.get("/", async (req, res, next) => {

    var docs = await Reminder.find({}, () => {
        
    });

    var agents = docs.map(agentModel => {

        let agent = new AwarenessAgent(agentModel);

        var due = agent.isPastDue;

        return {
            nextReminderInt: agent.nextReminder.getTime(),
            title: agent.title,
            lastPerformed: format(new Date(agent.lastPerformed), "MMMM do, yyyy, h:mm aaa"),
            nextReminder: due ? "" :  format(agent.nextReminder, 'MMMM do, yyyy, h:mm aaa'),
            timeUntilNextReminder: due ? "" : _.formatDistance(new Date(), agent.nextReminder),
            id: agent.id,
            status: agent.status,
            asleep: agent.asleep || false
            
        }
    });

    agents.sort((a, b) => {
        return a.nextReminderInt > b.nextReminderInt ? 1 : -1;
    });
    
    agents.sort((a, b) => {
        return Number(a.asleep) - Number(b.asleep);
    });


    res.send(ListAgents({pageTitle:"List Agents", agents}));

});


import AddReminderRouter from './lib/AddReminder.js';
server.use("/", AddReminderRouter);


import EditReminderRouter from './lib/EditReminder.js';
server.use("/", EditReminderRouter);


