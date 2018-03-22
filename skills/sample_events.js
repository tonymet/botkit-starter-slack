var debug = require('debug')('sample_evens')
module.exports = function(controller) {

    controller.on('app_mention,message.channels,file_share,ambient,user_channel_join,user_group_join', function(bot, message) {

        debug(message)
        if(message.event.subtype == 'file_share'){
            debug('file share received')
            debug('url_private', message.event.file.url_private )
        }
        bot.reply(message, 'Welcome, <@' + message.user + '>');

    });

}
