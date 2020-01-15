const { condenseString } = require("./utils.js");

/**
 * Replaces the parent function's call path with a condense version of the
 * function argument's value.
 *
 * @param {*} types @see [babel-types]{@link https://babeljs.io/docs/en/babel-types}
 * @param {StringLiteral} stringLiteralArg @see {@link https://babeljs.io/docs/en/babel-types#stringliteral}
 */
function condenseStringLiteral(types, stringLiteralArg) {
    const { value } = stringLiteralArg.node;
    const condensedStringValue = condenseString(value);
    const nextValue = types.StringLiteral(condensedStringValue);

    stringLiteralArg.parentPath.replaceWith(nextValue);
}

module.exports = { condenseStringLiteral };
