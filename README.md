# ESLint Scrape Defaults

This thing sets up an `.eslintrc` file with the rules commented with info scraped from [eslint.org](http://eslint.org/docs/rules/), so you don't have to keep referring to the documentation when you want to update them.

## Usage

You could do something like this to create a default `.eslintrc` file:

    eslint-config > .eslintrc

You can also set the indentation and default config:

    eslint-config --indent=4 --config='{"env":{"node":true},"globals":{"Promise":true},"rules":{"comma-dangle": [2, "always"]}}' > .eslintrc
