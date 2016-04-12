'use strict';

var _ = require('lodash');
var wordWrap = require('word-wrap');
var Yakuza = require('yakuza');

// var ESLINT_RULES_URL = 'http://eslint.org/docs/rules/';
var ESLINT_RULES_MD_URL = 'https://raw.githubusercontent.com/eslint/eslint.github.io/master/docs/rules/README.md';
var MAX_LINE_LENGTH = 120;

/**
 * ## enforceMaxLineLength
 */

/**
 * ## createComment
 */
function createComment(line, lines, padding, maxLineLength) {
    lines || (lines = []);
    var fill = padding ? _.fill(Array(padding), '//') : false;
    if (fill) {
        lines.push.apply(lines, fill);
    }

    lines.push.apply(lines, wordWrap(line.replace(/^\s*#+\s*/, ''), {
        width: maxLineLength - 3 - 4,
        indent: '// ',
        trim: true,
    }).split('\n'));

    if (fill) {
        lines.push.apply(lines, fill);
    }
    return lines;
}

/**
 * ## createValueMapping
 */
function createValueMapping(line, lines) {
    lines || (lines = []);
    var matched = line.match(/^\*\s+(?:\[([^\]]+)\]\([^\)]+\)|([^\s]+))(?::|\s+\-)\s+(.*)$/);
    if (matched) {
        lines.push({
            key: matched[1] || matched[2],
            value: 0,
            comment: matched[3],
        });
    }
}

/**
 * ## createRulesScraperJob
 */
function createRulesScraperJob(url) {
    Yakuza.scraper('rules');
    Yakuza.agent('rules', 'eslint').plan([
        'scrapeRules',
    ]);
    Yakuza.task('rules', 'eslint', 'scrapeRules').main(function(task, http, params) {
        http.get(url || ESLINT_RULES_MD_URL, function(err, res, body) {
            if (err) {
                task.fail(err, 'Request returned an error');
                return; // we return so that the task stops running
            }

            var lines = [];

            var firstLine = true;
            var previousComment = false;
            var maxLineLength = MAX_LINE_LENGTH;

            body.split('\n').forEach(function(line) {
                line = _.trim(line);
                if (_.startsWith(line, '# ')) {
                    if (!firstLine) {
                        lines.push('');
                    }
                    createComment(line, lines, 2, maxLineLength);
                    previousComment = false;
                } else if (_.startsWith(line, '## ')) {
                    if (!firstLine) {
                        lines.push('');
                    }
                    createComment(line, lines, 1, maxLineLength);
                    previousComment = false;
                } else if (_.startsWith(line, '* ')) {
                    if (previousComment) {
                        lines.push('');
                    }
                    createValueMapping(line, lines);
                    previousComment = false;
                } else {
                    if (previousComment || line) {
                        createComment(line, lines, 0, maxLineLength);
                    }
                    previousComment = true;
                }
                firstLine = false;
            });

            task.success(lines);
        });
    });
    return Yakuza.job('rules', 'eslint', {});
}

/**
 * ## scraape
 */
function scrape(url) {
    var dfd = Promise.defer();
    var job = createRulesScraperJob(url);

    job.enqueue('scrapeRules');
    job.on('task:scrapeRules:finish', function(response) {
        dfd.resolve(response.data);
    });
    job.on('task:scrapeRules:error', function(response) {
        dfd.reject(response.error.stack);
    });

    job.run();

    return dfd.promise;
}

module.exports = {
    scrape: scrape,
};
