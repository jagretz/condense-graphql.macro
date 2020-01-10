/**
 * Takes a string and runs it through a series of regular expressions to remove
 * any unnecessary whitespace characters.
 *
 * @public
 * @param {string} string to evaluate and manipulate
 * @returns {string} a new string
 */
function condenseString(string) {
    /*
    First, match any whitespace character, including space, tab, form feed, line feed
    and replaces with a whitespace character.
    Second, match any whitespace character that buds up against a non-word with the exception of:
    - a whitespace character occuring at the beginning of an input
    - a whitespace character occuring at the end of an input
    - a whitespace character followed by a dot character
    and replace with an empty space.
    */
    return string.replace(/\s+/gm, " ").replace(/(?<!^\B)\B | \B(?!\B$|\.)/g, "");
}

module.exports = { condenseString };
