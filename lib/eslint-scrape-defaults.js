'use strict';

var _ = require('lodash');

var eslintDefaults = require('eslint/conf/eslint.json');
var scraper = require('./scraper');
var mapper = require('./mapper');

var ESLINT_RULES_URL = 'http://eslint.org/docs/rules/';

/**
 * ## generateEslintConfig
 *
 * Generates a `.jshintrc` file with defaults
 */
function generateEslintConfig(config, indent) {
    if (config && !config.rules) {
        config = {
            rules: config,
        };
    }
    indent || (indent = 2);

    var eslintConfig = _.merge({}, eslintDefaults, config);
    var whenScraped = scraper.scrape();

    return whenScraped.then(function(lines) {
        var ruleLines = mapper.getRuleLines(lines);

        // No comma for the last rule
        _.last(ruleLines).noComma = true;

        // Assign the correct values
        _.forEach(ruleLines, function(line) {
            line.value = _.get(eslintConfig.rules, line.key, line.value);
        });

        // Get stringified thing without the rules
        eslintConfig.rules = {};

        // Add header
        var header = mapper.linesToJsonString([
            '',
            '//',
            '// ' + ESLINT_RULES_URL,
            '//',
            '',
        ], indent);

        var eslintrc = JSON.stringify(eslintConfig, true, indent);
        var mappedRules = mapper.linesToJsonString(lines, 2 * indent);

        return eslintrc.replace(/^(\s*"rules": \{)(\})/m, header + '\n$1\n' + mappedRules + '\n' + _.pad('', indent) + '$2');
    });
}

module.exports = generateEslintConfig;
