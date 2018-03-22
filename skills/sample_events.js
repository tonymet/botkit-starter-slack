var debug = require('debug')('sample_evens')
var rp = require('request-promise-native')
const githubService = require('../services/github.js')
module.exports = function(controller) {

    controller.on('file_share', function(bot, file) {
            debug(file)
        if( file.file.url_private){
            debug('url_private', file.file.url_private )
            var req = rp({
                method: 'GET',
                uri: file.file.url_private,
                headers: {
                    Authorization: 'Bearer ' + bot.team_info.token
                }
            }).then(res => {
                debug("res", res)
                return githubService.createGist(res) 
            }).then(githubResponse => {
                debug(githubResponse)
                bot.reply(file, 'created gist: ' + githubResponse.data.html_url)
            }).catch(err => {
                debug(err)
            })
        }
        bot.reply(file , 'Welcome, <@' + file.user + '>');

    });

}
