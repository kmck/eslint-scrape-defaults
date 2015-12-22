'use strict';

var _ = require('lodash');

function isNotFalse(v) {
    return (v !== false);
}

function quoteString(text) {
    return '"' + _.escape(text) + '"';
}

/**
 * ## getRulesFromLines
 *
 * Extract key/value for rules mapping
 */
function getRulesFromLines(lines) {
    return _.transform(lines, function(rules, line) {
        if (_.isPlainObject(line)) {
            rules[line.key] = line.value;
        }
    }, {});
}

/**
 * ## getRuleLines
 *
 * Filter lines down to only objects that specify key/value rule mapping
 */
function getRuleLines(lines) {
    return _.filter(lines, _.isPlainObject);
}

/**
 * ## linesToJsonString
 *
 * Converts an array of lines to a JSON string with optional comments
 */
function linesToJsonString(lines, indent) {
    var indentation = _.pad('', indent);
    return _.map(_.filter(lines, isNotFalse), function(line) {
        var lineString = line;

        if (!_.isString(lineString)) {
            lineString = quoteString(line.key) + ': ';

            if (_.isObject(line.value)) {
                lineString += JSON.stringify(line.value, false, 1)
                    // Remove line breaks and add spaces
                    .replace(/^\s*/gm, '').replace(/\n/g, ' ')
                    // Remove spaces inside brackets
                    .replace(/(\[)\s*(.*?)\s*(\])/, '$1$2$3')
                    .replace(/(\{)\s*(.*?)\s*(\})/, '$1$2$3');
            } else if (_.isString(line.value)) {
                lineString += quoteString(line.value);
            } else {
                lineString += line.value;
            }

            if (!line.noComma) {
                lineString += ',';
            }

            if (line.comment) {
                lineString += ' // ' + line.comment;
            }
        }

        if (lineString) {
            return indentation + lineString;
        } else {
            return '';
        }
    }).join('\n');
}

//
// Lines
//

module.exports = {
    getRulesFromLines: getRulesFromLines,
    getRuleLines: getRuleLines,
    linesToJsonString: linesToJsonString,
};
