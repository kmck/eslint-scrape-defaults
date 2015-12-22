#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var fs = require('fs');
var minimist = require('minimist');

var generateEslintConfig = require('../lib/eslint-scrape-defaults');

var argv = minimist(process.argv.slice(2));
var indent = _.parseInt(argv.indent) || 2;
var config = {};

if (argv.config) {
    if (_.startsWith(argv.config, '{')) {
        config = JSON.parse(argv.config);
    } else if (_.endsWith(argv.config, '.json')) {
        config = require(argv.config);
    } else {
        config = JSON.parse(fs.readFileSync(argv.config));
    }
}

generateEslintConfig(config, indent).then(function(eslintrc) {
    console.log(eslintrc);
}, function(err) {
    console.error(err);
});
