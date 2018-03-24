var debug = require('debug')('sample_evens')
var rp = require('request-promise-native')
var {URL} = require('url')
const githubService = require('../services/github.js')
function saveFile(message, url_private){
        if( url_private){
            var private_url = new URL(url_private)
            private_url.pathname_safe = private_url.pathname.replace(/\//g, '__')
            debug('url_private', url_private )
            var req = rp({
                method: 'GET',
                uri: url_private,
                headers: {
                    Authorization: 'Bearer ' + bot.team_info.token
                }
            }).then(res => {
                debug("res", res)
                return githubService.updateGist(private_url.pathname_safe, res)
            }).then(githubResponse => {
                debug(githubResponse)
                bot.reply(message, {text: 'I saved this snippet to the gist: ' + githubResponse.data.html_url, replace_original: true})
            }).catch(err => {
                debug(err)
            })
        }
}

function sendPrompt(file){
    bot.reply(file, {
        ephemeral: true,
        text: "Would you like to save the Gist?",
        fallback: "Saving Gists is interactive",
        attachments: [{
            title: 'Save Gist?',
            text: "Choose",
            callback_id: 'sendPrompt',
            actions: [
                {
                    "text": "Save?",
                    "name": "save",
                    "value": file.file.url_private,
                    "type": "button"
                },
                {
                    "text": "Cancel",
                    "name": "cancel",
                    "value": "cancel",
                    "type": "button"
                }
            ]
        }]
    })
}
module.exports = function(controller) {

    controller.on('file_share', function(bot, file) {
            debug(file)
            //saveFile(file)
            sendPrompt(file)
    })
    controller.on('interactive_message_callback', function(bot, message) {
        debug(message.actions)
        if(message.actions[0].name == "save"){
            saveFile(message,  message.actions[0].value)
        }
        else{
            bot.reply(message, {text : "No worries, the snippet was not saved to gist", ephemeral: true, replace_original: true})
        }
    })
}
