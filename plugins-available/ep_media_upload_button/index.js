const eejs = require('ep_etherpad-lite/node/eejs/');
const padHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler")
const apiHandler = require("ep_etherpad-lite/node/db/API")
let lockedPads = [];
/**
 * Append the menu with a upload media button
 */
exports.eejsBlock_editbarMenuLeft  = function (hook_name, args, cb) {
    args.content = args.content + eejs.require("ep_media_upload_button/templates/uploadMediaButton.ejs");
    return cb();
}
