import express from 'express';
var Router = express.Router();

import { AddReminder } from '../layouts/useHandlebars.js';
import postToMongo from './postToMongo.js';

// TODO: Unify with EditReminder.js :routes:

Router.post("/reminder", (req, res, next) => {

    postToMongo(req.body, req.body.id ? true : false);


    res.json(req.body);
});


Router.get("/add-reminder", (req, res, next) => {
    
    
    res.send(AddReminder());
});


export default Router;