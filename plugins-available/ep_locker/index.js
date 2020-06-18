const eejs = require('ep_etherpad-lite/node/eejs/');
const padHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler")
const apiHandler = require("ep_etherpad-lite/node/db/API")
let lockedPads = [];
/**
 * Append the menu with a lock button
 */
exports.eejsBlock_editbarMenuRight = function (hook_name, args, cb) {
    args.content = args.content + eejs.require("ep_locker/templates/lockButton.ejs");
    return cb();
}
/**
 * Extend the clientVars with the original PadId - The one which is referenced by the readOnlyId
 */
exports.clientVars = async function (hook, context, callback) {
    try {
        const result = await apiHandler.getPadID(context.clientVars.padId);
        return callback({"originalPadId": result.padID});
    } catch (e) {
        return callback({"originalPadId": context.clientVars.padId});
    }
};
/**
 * Create server endpoints
 */
exports.expressCreateServer = function (hook_name, args, cb) {
    args.app.get('/locked', async function (req, res) {
        const padId = req.query.padId;
        const authorId = req.query.authorId;
        res.send({locked: padIsLockedForUser(padId, authorId)})
    });
    args.app.get('/lock-pad', function (req, res) {
        const padId = req.query.padId;
        const authorId = req.query.authorId;
        if (padIsLocked(padId)) {
            console.warn('Client tried to lock but pad is already locked!')
            res.send({success: false})
            return;
        }
        lockedPads.push({
            padId: padId,
            authorId: authorId
        });
        // Send the client the message that pad is locked
        padHandler.handleCustomMessage(padId, 'lock');
        res.send({success: true})
    });
    args.app.get('/unlock-pad', function (req, res) {
        const padId = req.query.padId;
        unlockPad(padId);
        padHandler.handleCustomMessage(padId, 'lock');
        res.send({success: true})
    });
}

/**
 * Called when user leaves
 */
exports.userLeave = function (hook, session, callback) {
    const padId = session.padId;
    const authorId = session.author;
    if (padIsLockedByUser(padId, authorId)) {
        unlockPad(padId);
        padHandler.handleCustomMessage(padId, 'lock');
        console.log('%s left pad %s. Unlocked it.', session.author, session.padId);
    }
};


/**
 * Function unlocks a pad by id
 * @param padId The id of the pad
 */
function unlockPad(padId) {
    lockedPads = lockedPads.filter(function (value) {
        return value.padId !== padId && value.authorId;
    });
    // Send the client the message that pad is unlocked
    padHandler.handleCustomMessage(padId, 'lock');
}

/**
 * Function tells if pad is locked
 * @param padId The id of the pad
 * @returns {boolean} True if already locked, false if not locked
 */
function padIsLocked(padId) {
    const result = lockedPads.filter((value => {
        return value.padId === padId;
    }))
    return result.length > 0;
}

/**
 * Indicates if pad was or is locked by a user
 * @param padId The id of the pad
 * @param authorId The id of the author
 * @returns {boolean} True if locked, false if not locked by user
 */
function padIsLockedByUser(padId, authorId) {
    const result = lockedPads.filter((value => {
        return value.padId === padId && value.authorId === authorId;
    }))
    return result.length > 0;
}

/**
 * Indicates if pad was or is locked for a user (Can the user edit it or not?)
 * @param padId The id of the pad
 * @param authorId The id of the author
 * @returns {boolean} True if locked, false if not locked for user
 */
function padIsLockedForUser(padId, authorId) {
    const result = lockedPads.filter((value => {
        return value.padId === padId && value.authorId !== authorId;
    }))
    return result.length > 0;
}
