const debug = require('debug')('github-service')
const GitHub  = require('github-api')
const rp = require('request-promise-native')
function createGist(team){
    if(!team.github.oauth.access_token){
        return Promise.reject("No Access token for team")
    }
    const gh = new GitHub({token: team.github.oauth.access_token});
    let gist = gh.getGist()
    var params = {
        public: false,
        description: 'gist1',
        files: {
            "file1.txt": {
               content: "Welcome to slack-gist"
            }
         }
    }
    debug("createGist params:" , params)
    return gist.create(params)
        .then( res => res.data )
}

function updateGist(team, filename,content){
    debug(team)
    if(!team.github.oauth.access_token){
        return Promise.reject("No Access token for team")
    }
    const gh = new GitHub({token: team.github.oauth.access_token});
    let gist = gh.getGist(team.github.gist.id)
    var params = {
        public: false,
        description: 'gist1',
        files: {}
    }
    params.files[filename] = {content: content}
    debug(params)
    return gist.update(params)
}

getLoginUrl = (hostname_external, team_id) => {
    return hostname_external + "/github/login?team_id=" + team_id
}

getAuthorizeURL = (team) => {
    if(!team.id){
        throw new Error("team.id is undefined")
    }
    return "https://www.github.com/login/oauth/authorize?client_id=" + encodeURIComponent(process.env.github_clientId)
    + '&scope=' + encodeURIComponent('gist')
    + '&state=' + encodeURIComponent(JSON.stringify({team: team.id}))
}

exchangeCodeForToken = options => {
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
    }).then(tokenObject => {
        debug('tokenObject', tokenObject)
        if(!tokenObject || tokenObject.error){
            return Promise.reject("github token error")
        }
        return tokenObject
    })
}
module.exports = {updateGist, createGist, exchangeCodeForToken, getAuthorizeURL, getLoginUrl}