const debug = require('debug')('github-service')
const GitHub  = require('github-api')
// unauthenticated client 
function updateGist(filename,content){
    const gh = new GitHub({token: process.env.github_api_token});
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