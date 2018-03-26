const rp = require('request-promise-native')
var debug = require('debug')('botkit:github:oauth');
var github = require('../../services/github.js')

function createTeamGist(team){
    return github.createGist(team)
        .then(gist => {
            debug("createGist gist: ", gist)
            if(! (gist.id && gist.html_url)){
                return Promise.reject("gist is incomplete. Missing gist.id or gist.html_url")
            }
            return {id: gist.id, html_url: gist.html_url}
        })
}

function addGistToTeam( team, gistInfo){
    if(!team.github){
        throw new Error("github not initialized for team")
    }
    team.github.gist = gistInfo
    debug("saveGistInfo to team team: ", team, "gistinfo:", gistInfo)
    return team
}

module.exports = function(webserver, controller) {
    var handler = {
        login: function(req, res) {
            if(!req.query.team_id){
                res.status(400).send("Sorry, team_id is not set")
            }
            res.redirect(github.getAuthorizeURL({id: req.query.team_id}));
        },
        oauth: function(req, res) {
            debug(req.query)
            // look up a team's memory and configuration and return it, or
            // return an error!
            var code = req.query.code;
            var state = JSON.parse(req.query.state);
            debug("code/state", {code, state})
            var opts = {
                client_id: process.env.github_clientId,
                client_secret: process.env.github_clientSecret,
                code: code
            };
            debug(opts)
            // get team from storage
            controller.findTeamByIdPromise(state.team)
            .then(team=>{
                debug('github.ExchangeCodeForToken team: ', team)
                // get oauth token from github
                return github.exchangeCodeForToken(opts)
                    .then(tokenObject => {
                        if(tokenObject){
                            team.github = {oauth: tokenObject }
                        }
                        return team
                    })
            })
            // save oauth token . good if we break before getting gist
            .then(team => {
                return controller.saveTeamPromise(team).then( () => team )
            })
            // create gist and add to team object
            .then(team => {
                return createTeamGist(team)
                .then( gistInfo => addGistToTeam(team, gistInfo) )
            })
            // save team object again
            .then(controller.saveTeamPromise)
            .then(() => {
                // TODO convo.say("your new gist is ready") via controller event
                res.redirect('/login_success.html');
            })
            .catch(err => {
                // TODO convo.say('We\'ve had a problem creating your team\'s gist.  Please re-install  ');
                debug(err)
                res.status(500).json({error: "error"})
            })
        }
    }
    webserver.get('/github/login', handler.login);
    webserver.get('/github/oauth', handler.oauth);
    return handler;
}
