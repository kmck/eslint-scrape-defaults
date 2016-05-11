#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var fs = require('fs');
var minimist = require('minimist');
var expandTilde = require('expand-tilde');
var JSON5 = require('json5');

var generateEslintConfig = require('../lib/eslint-scrape-defaults');

var argv = minimist(process.argv.slice(2));
var indent = _.parseInt(argv.indent) || 2;
var config = {};

if (argv.config) {
    if (_.startsWith(argv.config, '{')) {
        config = JSON5.parse(argv.config);
    } else if (_.endsWith(argv.config, '.json')) {
        config = require(expandTilde(argv.config));
    } else {
        config = JSON5.parse(fs.readFileSync(expandTilde(argv.config)));
    }
}

generateEslintConfig(config, indent).then(function(eslintrc) {
    console.log(eslintrc);
}, function(err) {
    console.error(err);
});
