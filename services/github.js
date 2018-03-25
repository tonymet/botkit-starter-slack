const debug = require('debug')('github-service')
const GitHub  = require('github-api')
// unauthenticated client 
function updateGist(filename,content){
    debug(bot.team_info)
    if(!bot.team_info.github.oauth.access_token){
        return Promise.reject("No Access token for team")
    }
    var token = {token: bot.team_info.github.oauth.access_token}
    const gh = new GitHub(token);
    let gist = gh.getGist(process.env.github_gist_id)
    var params = {
        public: false,
        description: 'gist1',
        files: {}
    }
    params.files[filename] = {content: content}
    debug(params)
    return gist.update(params)
}
module.exports = {updateGist}