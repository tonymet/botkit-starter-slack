var debug = require('debug')('botkit:onboarding');
var github = require('../services/github.js')
var util = require('util')


module.exports = function(controller) {

    controller.on('onboard', function(bot,team) {

        debug('Starting an onboarding experience!');

        if (controller.config.studio_token) {
            bot.api.im.open({user: bot.config.createdBy}, function(err, direct_message) {
                if (err) {
                    debug('Error sending onboarding message:', err);
                } else {
                    controller.studio.run(bot, 'onboarding', bot.config.createdBy, direct_message.channel.id, direct_message).catch(function(err) {
                        debug('Error: encountered an error loading onboarding script from Botkit Studio:', err);
                    });
                }
            });
        } else {
            bot.startPrivateConversation({user: bot.config.createdBy},function(err,convo) {
                if (err) {
                    console.log(err);
                    return
                }
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
                convo.say('Visit this url to login ' + github.getLoginUrl(controller.config.hostname_external));
            });
        }
    });

}
