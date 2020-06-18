var _, $, jQuery;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;
/**
 * Initialize the button after load
 */
exports.postAceInit = function (hook, context) {
    /* Event: User clicks upload media button */
    $('#media-upload-button').on('click', function ($event) {
            window.top.postMessage('showUploadModal', clientVars.baseUrl)
            // Storing cursor line number in clientVars
            context.ace.callWithAce(function (ace) {
                clientVars.cursorLine = _handleNewLines(ace);
            }, 'img', true);
        }
    );
}

var _handleNewLines = function (ace) {
    var rep = ace.ace_getRep();
    var lineNumber = rep.selStart[0];
    var curLine = rep.lines.atIndex(lineNumber);
    if (curLine.text) {
        return lineNumber + 1;
    }
    return lineNumber;
};

/**
 * Embed the css file
 */
exports.aceEditorCSS = function () {
    return ['ep_media_upload_button/static/css/uploadMediaButton.css'];
}
//# sourceURL=mediaUploadButton.js
