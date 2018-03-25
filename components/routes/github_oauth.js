const rp = require('request-promise-native')
const util = require('util')
var debug = require('debug')('botkit:github:oauth');

const GithubOAuth = {
    getAuthorizeURL : () => {
        return "https://www.github.com/login/oauth/authorize?client_id=" + encodeURIComponent("d9469c047df788b75800")
        + '&scope=' + encodeURIComponent('gist')
        + '&state=' + encodeURIComponent(JSON.stringify({team: "T8JP4PBJL"}))
    },

    exchangeCodeForToken: options => {
        return rp({
            method: 'POST',
            uri: 'https://github.com/login/oauth/access_token',
            headers: {
                Accept: 'application/json',
                "User-Agent": "NodeJS / Oauth Client"
            },
            transform2xxOnly : true,
            json: true,
            body:  {
                client_id: options.client_id,
                client_secret: options.client_secret,
                code: options.code
            }
        })
    }
}

module.exports = function(webserver, controller) {

    var handler = {
        login: function(req, res) {
            res.redirect(GithubOAuth.getAuthorizeURL());
        },
        oauth: function(req, res) {
            debug(req.query)
            var bot = controller
            saveTeam = util.promisify(bot.storage.teams.save)
            // look up a team's memory and configuration and return it, or
            // return an error!
            findTeamById = util.promisify(bot.storage.teams.get)
            var code = req.query.code;
            var state = JSON.parse(req.query.state);
            debug("code/state", {code, state})
            var opts = {
                client_id: process.env.github_clientId,
                client_secret: process.env.github_clientSecret,
                code: code
            };
            debug(opts)

            // look up team
            // save token
            // redirct to success
            findTeamById(state.team)
            .then(team=>{
                return GithubOAuth.exchangeCodeForToken(opts)
                    .then(tokenObject => {
                        if(tokenObject){
                            team.github = {oauth: tokenObject }
                        }
                        return team
                    })
            })
            .then(saveTeam)
            .then(team => {
                bot.team_info = team
            })
            .then(() => {
                res.json({success: true})

            })
            .catch(debug)
        }
    }


    // Create a /login link
    // This link will send user's off to Slack to authorize the app
    // See: https://github.com/howdyai/botkit/blob/master/readme-slack.md#custom-auth-flows
    debug('Configured /login url');
    webserver.get('/github/login', handler.login);

    // Create a /oauth link
    // This is the link that receives the postback from Slack's oauth system
    // So in Slack's config, under oauth redirect urls,
    // your value should be https://<my custom domain or IP>/oauth
    debug('Configured /oauth url');
    webserver.get('/github/oauth', handler.oauth);

    return handler;
}
