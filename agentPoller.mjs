/**
 * Tells your agents to check if they should do anything.
 * 
 * @param {array} agents An array of active agents.
 * @param {int} interval How often to check the agents 
 * @returns {interval} An interval which can be canceled, I guess.
 */
function agentPoller(agents, interval) {
    var agents = agents;
    var poller;
    poller = setInterval(() => {
        
        if(process.argv[2] == "log") {
            console.log("Polling agents");
        }
        
        agents.forEach(agent => {
            agent.reflect();
        });
    }, interval);
    return {
        agents,
        poller
    };
}

export default agentPoller;