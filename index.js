import agents from './agents/_agents.js';
import express from 'express';
var server = express();
server.listen(3134, () => {console.log("Server")});
import agentPoller from './agentPoller.mjs';
import { ListAgents } from './layouts/useHandlebars.js';

var activeAgents = agents.map(agent => {

    agent.activate();

    return agent;
});

agentPoller(activeAgents, 3000);

server.get("/complete", (req, res, next) => {
    var action = req.query.action;

    var found = activeAgents.find(element => element.title == action);
    if(!found) {
        res.send("No action found");
        return;
    }
    found.markComplete();

    res.send(`Agent "${action}" marked complete`);
});

server.get("/regen", (req, res, next) => {
    var action = req.query.action;

    var found = activeAgents.find(element => element.title == action);
    if(!found) {
        res.send("No action found");
        return;
    }
    found.regenerateNextReminder();

    res.send(`Agent "${action}" marked complete`);
});


server.get("/list-agents", (req, res, next) => {

    res.send(ListAgents({pageTitle:"List Agents", agents: activeAgents}));

    // var send = "";
	// activeAgents.forEach(agent => {
    //     send += agent.title + "<br><br>";
    //     send += agent.interval + "<br><br>";
    // });

	// res.send(send);
});

