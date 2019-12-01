module.exports = {
    /*
    We like to be descriptive with our variable names. 100-char line length
    provides a little more wiggle room than the default 80 without forcing
    line breaks.
    */
    printWidth: 100,
    // a 4-space tab length is easier on the eyes 👀
    tabWidth: 4,
    overrides: [
        /*
         A slight variation to retain the defaults set for markdown.
         The variation is added since markdown is more typically intended
         for documentation, and thus reading, which is easier without
         scanning long lines of text.
         */
        {
            files: "*.{md,mdx}",
            options: {
                printWidth: 80,
                tabWidth: 2,
                proseWrap: "always"
            }
        }
    ]
};
