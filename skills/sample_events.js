var debug = require('debug')('sample_events')
var rp = require('request-promise-native')
var {URL} = require('url')
const githubService = require('../services/github.js')
const validMimeTypes = ['text/plain']

function isValidFileType(mimeType){
    return validMimeTypes.includes(mimeType)
}

function saveFile(team, url_private){
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
        return githubService.updateGist(team,private_url.pathname_safe, res)
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
                    "value": file.files[0].url_private,
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
            debug("file_share file: ", file)
            if(!isValidFileType(file.event.files[0].mimetype)){
                bot.reply(file,  {text: "Not a valid type: " + file.event.file.mimetype, ephemeral: true, replace_original: true})
                return
            }
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
        if(message.actions.length < 1){
            debug("No actions")
            return
        }
        if( message.actions[0].name == "save"){
            saveFile(bot.team_info, message.actions[0].value)
            .then(githubResponse => {
                debug(githubResponse)
                bot.replyInteractive(message, {text: "Saved."})
                bot.reply(message, {
                    text: 'I saved this snippet to the Team Gist',
                    ephemeral: false,
                    attachments: [
                        {
                            "fallback": "Saved to Team Gist: " +  githubResponse.data.html_url,
                            "actions": [
                                {
                                    "type": "button",
                                    "text": `Open Team Gist ${ String.fromCodePoint(0x1F4DD)}`,
                                    "url": githubResponse.data.html_url
                                }
                            ]
                        }
                    ]
                })
            })
            .catch(err => {
                debug(err)
                bot.replyInteractive(message, {text: 'I had trouble saving your snippet', ephemeral: true})
            })
        } else {
            bot.replyInteractive(message, {text : "No worries, the snippet was not saved to gist", ephemeral: true, replace_original: true})
        }
    })
}
