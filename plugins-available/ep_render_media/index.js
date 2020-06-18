const eejs = require('ep_etherpad-lite/node/eejs/');
const padHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler")
const apiHandler = require("ep_etherpad-lite/node/db/API")

var settings = require('ep_etherpad-lite/node/utils/Settings');
exports.clientVars = function (hook, context, callback) {
    // return the setting to the clientVars, sending the value
    return callback({
        "baseUrl": settings.ep_render_media.baseUrl,
        "padUrl": settings.ep_render_media.padUrl
    });
};
