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

Reminder.find({}, function (err, docs) {
    docs.forEach(doc => {

        var agent = new AwarenessAgent(doc);

        poller.agents.push(agent);
        agent.activate();
    })
});


var server = express();



import bodyParser from 'body-parser';

server.use( bodyParser.json() );       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


server.listen(3134, () => {console.log("Server")});
import agentPoller from './agentPoller.mjs';
import { ListAgents, MarkedComplete, AddReminder } from './layouts/useHandlebars.js';

server.use('/public', express.static('static'));


server.get("/complete", (req, res, next) => {
    var action = req.query.action;

    var found = poller.agents.find(element => element.title == action);
    if(!found) {
        res.send("No action found");
        return;
    }
    found.markComplete();

    res.send(MarkedComplete({title: action}));
});



server.get("/", (req, res, next) => {
    var agents = poller.agents.map(agent => {

        return {
            title: agent.title,
            timeToNext: format(agent.timeToNext, "yyyy"),
            lastPerformed: format(agent.lastPerformed, "MMMM do, yyyy, h:m aaa"),
            nextReminder: format(agent.nextReminder, 'MMMM do, yyyy, h:m aaa'),
            id: agent.id
        }
    });

    res.send(ListAgents({pageTitle:"List Agents", agents}));

});


import AddReminderRouter from './lib/AddReminder.js';
server.use("/", AddReminderRouter);


import EditReminderRouter from './lib/EditReminder.js';
server.use("/", EditReminderRouter);


