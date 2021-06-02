import express from 'express';
import mongoose from 'mongoose';
import mongooseDeets from "./config/mongo.json";
import Reminder from './Reminder.schema.js';
import { format } from 'date-fns';
// import newReminder from './newReminder.js';
import AwarenessAgent from './awarenessAgent.js';

var agents = [];

await mongoose.connect(mongooseDeets.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
var poller = agentPoller([], 3000);


setInterval(() => {
    poller.agents = [];
    Reminder.find({}, function (err, docs) {
        docs.forEach(doc => {
    
            var agent = new AwarenessAgent(doc);
    
            poller.agents.push(agent);
            agent.reflect();
            agent.activate();
        })
    });
}, 3000);



var server = express();

export { poller }; 

import bodyParser from 'body-parser';

server.use( bodyParser.json() );       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


server.listen(3134, () => {console.log("Server")});
import agentPoller from './agentPoller.mjs';
import { ListAgents, MarkedComplete, AddReminder } from './layouts/useHandlebars.js';

server.use('/public', express.static('static'));

server.post('/clear-reminders', async (req, res, next) => {

    if(req.body.action) {
        var doc = await Reminder.findOne({_id: req.body.action});
        if(doc===null) {
            res.send("Reminder not found");
            return;
        }
    
        doc.remindersSent = [];
        doc.save();
    } else {
        Reminder.find({}, (err, docs) => {
            docs.forEach(doc => {
                doc.remindersSent = [];
                doc.save();
            });
        });

    }


    

    res.send("Okay");

});

server.post("/complete", (req, res, next) => {
    var action = req.body.action;

    var found = poller.agents.find(element => element.title == action);
    if(!found) {
        res.send("No action found");
        return;
    }
    var at = req.body.time ? parseInt(req.body.time) : null;

    found.markComplete(at);

    res.send(MarkedComplete({title: action}));
});



server.get("/", (req, res, next) => {
    var agents = poller.agents.map(agent => {


        return {
            title: agent.title,
            timeToNext: format(agent.timeToNext, "yyyy"),
            lastPerformed: format(new Date(agent.lastPerformed), "MMMM do, yyyy, h:mm aaa"),
            nextReminder: format(agent.nextReminder, 'MMMM do, yyyy, h:mm aaa'),
            id: agent.id,
            status: agent.status
        }
    });

    res.send(ListAgents({pageTitle:"List Agents", agents}));

});


import AddReminderRouter from './lib/AddReminder.js';
server.use("/", AddReminderRouter);


import EditReminderRouter from './lib/EditReminder.js';
server.use("/", EditReminderRouter);


