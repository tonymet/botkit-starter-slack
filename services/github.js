const debug = require('debug')('github-service')
const GitHub  = require('github-api')
// unauthenticated client 
function createGist(content){
    const gh = new GitHub({token: process.env.github_api_token});
    let gist = gh.getGist(); // not a gist yet 
    return gist.create({
        public: false,
        description: 'gist1',
        files: {
            "file1.txt": {
                content: content
            }
        }})
}
module.exports = {createGist}