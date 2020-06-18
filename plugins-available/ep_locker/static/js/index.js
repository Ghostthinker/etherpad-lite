var _, $, jQuery;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;
/**
 * Initialize the button after load
 */
exports.postAceInit = function (hook, context) {
    var padId = clientVars.originalPadId;
    var authorId = clientVars.userId;

    /* Event: User clicks lock button */
    $('#lock-button').on('click', throttle( function ($event) {
        var locked = $event.currentTarget.getAttribute("data-locked");
        if (locked === "unlocked") {
            $.get(clientVars.padUrl + '/lock-pad', {padId: padId, authorId: authorId}, function (response, status) {
                if (response.success) {
                    $event.currentTarget.innerText = "lock_open";
                    $event.currentTarget.setAttribute("data-locked", "locked");
                }
            });
        } else if (locked === "locked") {
            $.get(clientVars.padUrl + '/unlock-pad', {padId: padId, authorId: authorId}, function (response, status) {
                if (response.success) {
                    $event.currentTarget.innerText = "lock";
                    $event.currentTarget.setAttribute("data-locked", "unlocked");
                }
            });
        }
    }, 1000));

    checkLock();
}

/**
 * This hook is called when the custom event 'lock' is fired.
 */
exports.handleClientMessage_lock = function (hook, context) {
    checkLock();
}

/**
 * Embed the css file
 */
exports.aceEditorCSS = function () {
    return ['ep_locker/static/css/lock.css'];
}

/**
 * Method checks if the pad is locked. If it is locked for the user, the client gets redirected to
 * the readonly pad.
 */
function checkLock() {
    var originalPadId = clientVars.originalPadId;
    var authorId = clientVars.userId;
    /* Check if pad locked */
    $.get(clientVars.padUrl + '/locked', {padId: originalPadId, authorId: authorId}, function (response) {
        var lockedPadId = clientVars.readOnlyId;
        if (response.locked) {
            if (clientVars.padId !== clientVars.readOnlyId) {
                location.href = clientVars.padUrl + '/p/' + lockedPadId;
            }
        } else {
            if (clientVars.padId === clientVars.readOnlyId) {
                location.href = clientVars.padUrl + '/p/' + originalPadId;
            }
        }
    });
}

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        var now = Date.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};
//# sourceURL=ep_locker.js
