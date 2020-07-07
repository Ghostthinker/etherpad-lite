var $, jQuery;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');

var image = {
    removeMedia: function (lineNumber) {
        var documentAttributeManager = this.documentAttributeManager;
        documentAttributeManager.removeAttributeOnLine(lineNumber, 'img'); // make the line a task list
    },
    addMedia: function (lineNumber, src, tag) {
        var documentAttributeManager = this.documentAttributeManager;
        documentAttributeManager.setAttributeOnLine(lineNumber, tag, src); // make the line a task list
    }
};

var _handleNewLines = function (ace) {
    var rep = ace.ace_getRep();
    var lineNumber = rep.selStart[0];
    var curLine = rep.lines.atIndex(lineNumber);
    var curPos = rep.selStart[1];
    var numberOfLines = rep.alines.length;

    if (curLine.text) {

        // Cursor in line
        if (curPos < curLine.text.length && curPos > 0) {
            ace.ace_doReturnKey();
            ace.ace_doReturnKey();
            return lineNumber + 1;
        }
        // Cursor line end
        else if (curPos == curLine.text.length) {
            ace.ace_doReturnKey();

            if (numberOfLines == lineNumber + 1) {
                ace.ace_doReturnKey();
            }

            return lineNumber + 1;
        }
        // Cursor line start
        else {
            ace.ace_doReturnKey();
            return lineNumber;
        }
    } else {
        // Last line
        if (numberOfLines == lineNumber + 1) {
            ace.ace_doReturnKey();
        }
        return lineNumber;
    }
};


/**
 * Initializing message even listener after load
 */
exports.postAceInit = function (hook, context) {
    /* Message Event Listener */
    window.addEventListener("message", function (e) {
        context.ace.callWithAce(function (ace) {
            if (e.data.messageType === "Video") {
                const cursorLine = _handleNewLines(ace);
                const src = '<media data-mediaId=' + e.data.id + '>';
                ace.ace_addMedia(cursorLine, src, 'media');
            }
            if (e.data.messageType === "Annotation") {
                const cursorLine = _handleNewLines(ace);
                const src = '<annotation data-mediaId=' + e.data.id + ' data-thumbnail=' + e.data.showThumbnail + '>';
                ace.ace_addMedia(cursorLine, src, 'annotation');
            }
        }, 'div', true);
    }, false);

    window.openPlayer = function (event) {
        var data = {
            message: 'openPlayer',
            mediaId: event.dataset.mediaid,
            annotationId: event.dataset.annotationid
        }
        window.top.postMessage(data, clientVars.baseUrl)
    }
}

exports.aceInitialized = function (hook, context) {
    var editorInfo = context.editorInfo;
    editorInfo.ace_addMedia = _(image.addMedia).bind(context);
    editorInfo.ace_removeMedia = _(image.removeMedia).bind(context);
};

exports.aceAttribsToClasses = function (name, context) {
    if (context.key === 'media') {
        return ['media:' + context.value];
    }
    if (context.key === 'annotation') {
        return ['annotation:' + context.value];
    }
};

// Rewrite the DOM contents when an IMG attribute is discovered
exports.aceDomLineProcessLineAttributes = function (name, context) {
    var cls = context.cls;
    const mediaTypes = ["media", "annotation"];
    var result = ''
    mediaTypes.forEach(function (item, index) {
        var rx = '(?:^| )' + item + ':([^>]*)';
        var regex = new RegExp(rx);
        var imgType = cls.match(regex, "g");
        if (!imgType) return [];
        var template = '<span>';
        if (imgType[1]) {
            var exp = /data-thumbnail=(.*true)/
            var showThumbnail = exp.exec(cls) ? exp.exec(cls)[1] : false;
            var mediaId = imgType[1].replace(/\D/g, "");
            var url = clientVars.baseUrl + '/rest/' + item + '/render/' + mediaId
            $.ajax({
                url: showThumbnail ?  url + "/thumbnail" : url,
                type: "GET",
                datatype: "jsonp",
                async: false,
                success: function (response) {
                    var preHtml = response;
                    var postHtml = '</span>';
                    var modifier = {
                        preHtml: preHtml,
                        postHtml: postHtml,
                        processedMarker: true
                    };

                    result = [modifier];
                }
            });
        }
    });
    return result;
    return [];
};
exports.collectContentImage = function (name, context) {
    var tname = context.tname;
    var state = context.state;
    var lineAttributes = state.lineAttributes;
    if (tname === 'div' || tname === 'p') {
        delete lineAttributes.img;
    }
    if (tname === 'img') {
        lineAttributes.img = context.node.outerHTML;
    }
};
exports.aceRegisterBlockElements = function () {
    return ['div'];
};

/**
 * Embed the css file
 */
exports.aceEditorCSS = function () {
    return ['ep_render_media/static/css/renderMedia.css'];
}

//# sourceURL=renderMedia.js
