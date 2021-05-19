import express from 'express';
var Router = express.Router();
import Reminder from '../Reminder.schema.js';

import { UseTemplate } from '../layouts/useHandlebars.js'; 

// TODO: Unify with AddReminder.js 

Router.get("/edit-reminder", async (req, res, next) => {
    var doc = await Reminder.findOne({_id: req.query.id});

    if(doc===null) {
        res.send("Reminder not found");
        return;
    }

    res.send(UseTemplate("reminder-form", {id: doc._id, doc: doc}));
});


Router.post("/edit-reminder", (req, res, next) => {

});


export default Router;