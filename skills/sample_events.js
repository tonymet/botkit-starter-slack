var debug = require('debug')('sample_evens')
var rp = require('request-promise-native')
var {URL} = require('url')
const githubService = require('../services/github.js')
function saveFile(url_private){
    var private_url = new URL(url_private)
    private_url.pathname_safe = private_url.pathname.replace(/\//g, '__')
    debug('url_private', url_private )
    return rp({
        method: 'GET',
        uri: url_private,
        headers: {
            Authorization: 'Bearer ' + bot.team_info.token
        }
    }).then(res => {
        debug("res", res)
        return githubService.updateGist(private_url.pathname_safe, res)
    })
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
            sendPrompt(file)
    })
    controller.on('interactive_message_callback', function(bot, message) {
        debug('interactive message: ' , message)
        if(message.callback_id){
            debug('trggering ', 'interactive_message_callback:' + message.callback_id)
            controller.trigger('interactive_message_callback:' + message.callback_id, [bot,message])
        }
    })
    controller.on('interactive_message_callback:sendPrompt', (bot, message) => {
        if(message.actions.length > 0 && message.actions[0].name == "save"){
            saveFile(message.actions[0].value)
            .then(githubResponse => {
                debug(githubResponse)
                bot.reply(message, {text: 'I saved this snippet to the: ' + githubResponse.data.html_url, replace_original: true})
            })
            .catch(err => {
                debug(err)
                bot.reply(message, {text: 'I had trouble saving your snippet' + githubResponse.data.html_url, ephemeral: true})
            })
        } else {
            bot.reply(message, {text : "No worries, the snippet was not saved to gist", ephemeral: true, replace_original: true})
        }
    })
}
