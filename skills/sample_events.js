var debug = require('debug')('sample_evens')
var rp = require('request-promise-native')
var {URL} = require('url')
const githubService = require('../services/github.js')
module.exports = function(controller) {

    controller.on('file_share', function(bot, file) {
            debug(file)
        if( file.file.url_private){
            var private_url = new URL(file.file.url_private)
            private_url.pathname_safe = private_url.pathname.replace(/\//g, '__')
            debug('url_private', file.file.url_private )
            var req = rp({
                method: 'GET',
                uri: file.file.url_private,
                headers: {
                    Authorization: 'Bearer ' + bot.team_info.token
                }
            }).then(res => {
                debug("res", res)
                return githubService.updateGist(private_url.pathname_safe, res)
            }).then(githubResponse => {
                debug(githubResponse)
                bot.reply(file, 'updated gist: ' + githubResponse.data.html_url)
            }).catch(err => {
                debug(err)
            })
        }
    });
}
