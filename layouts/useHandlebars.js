import handlebarsBase from 'handlebars';
import fs from 'fs';
import path from "path";


import {allowInsecurePrototypeAccess} from '@handlebars/allow-prototype-access';
var handlebars = allowInsecurePrototypeAccess(handlebarsBase);

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

var createTemplate = (templateLocation=null) => {
    var template = fs.readFileSync(path.resolve(__dirname, templateLocation), 'utf-8');
    return handlebars.compile(template, {allowProtoMethods: true});
}

var createPartial = (templateLocation=null, partialName) => {
    var template = fs.readFileSync(path.resolve(__dirname, templateLocation), 'utf-8');
    handlebars.registerPartial(partialName, template);
}

createPartial("./site.html", "site");

var ListAgents = data => {
    return createTemplate("./list-agents.html", {allowProtoMethods: true})(data);
}


export {
    ListAgents
};