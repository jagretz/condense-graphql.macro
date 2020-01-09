const { createMacro, MacroError } = require("babel-plugin-macros");

/**
 * Takes a string and runs it through a series of regular expressions to remove
 * any unnecessary whitespace characters.
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

/**
 * Remove the first element of a string if the value matches the provided #padValue.
 * @param {*} padValue The value of padding to remove
 * @param {string} string the string to remove padding from
 * @returns {string} a new string
 */
function removeStartPadding(padValue, string) {
    if (string[0] === padValue) {
        return string.slice(1, string.length);
    }

    return string;
}

/**
 * Remove the last element of a string if the value matches the provided #padValue.
 * @param {*} padValue The value of padding to remove
 * @param {string} string the string to remove padding from
 * @returns {string} a new string
 */
function removeEndPadding(padValue, string) {
    if (string[string.length] === padValue) {
        return string.slice(0, string.length - 1);
    }

    return string;
}

/**
 * Parse, transform, and generate a new AST.
 *
 * @param {object} param0 the parsed code, wrapped in functions to allow access and
 * manipulation of the AST
 * @param {object} param0.references "This is an object that contains arrays of all
 * the references to things imported from macro keyed based on the name of the
 * import. The items in each array are the paths to the references. - babel-plugin-macros
 * @param {object} param0.babel This is the same thing you get as an argument to
 * normal babel plugins. It is also the same thing you get if you
 * require('babel-core'). - babel-plugin-macros
 */
function condenseGraphql({ references, babel }) {
    const { types } = babel;

    /*
    `references` refers to all the references of your (macro) expression.
    `references.default` is the `import xyz from...`. Use the name of your
    macro for named exports.
    */
    references.default.forEach(referencePath => {
        // referencePath is the macro: condenseGraphql. An `Identifier` with a `name`
        // property which is the name assigned to the default import, eg "condenseQuery".

        // To inspect the path's node property (referencePath.node) to view it's attributes and methods.

        /*
        Get the `arguments` of the parentPath, `CallExpression`.
        The functions API only expects a single argument. If called correctly,
        the first arg will be a babel-type.
        */
        const functionArguments = referencePath.parentPath.get("arguments");
        const numberOfFunctionArguments = functionArguments.length;
        if (numberOfFunctionArguments === 0) {
            throw new MacroError("The macro function expected an argument but received none.");
        }
        if (numberOfFunctionArguments > 1) {
            console.warn(
                `The macro function expected a single argument but received ${numberOfFunctionArguments} function arguments`.concat(
                    " The macro will only work against the first argument. All other arguments will be ignored."
                )
            );
        }

        const [arg1] = functionArguments;
        const { node } = arg1;
        const { type } = node;

        /* eslint-disable no-use-before-define */
        switch (type) {
            case "StringLiteral":
                replaceMacroCallPath(types, arg1, condenseStringLiteral);
                break;
            case "TemplateLiteral":
                replaceMacroCallPath(types, arg1, condenseTemplateLiteral);
                break;
            default:
                throw new MacroError(
                    `The function expected a function argument of type StringLiteral or TemplateLiteral, but received a type "${type}".`.concat(
                        " This macro only works against a string literal or a template literal as the (macro) function argument."
                    )
                );
        }
        /* eslint-enable no-use-before-define */
    });
}

module.exports = createMacro(condenseGraphql);

/**
 * Takes a replacer function to replace the macro call path with.
 *
 * Uses IoC to allow the caller to provide the replacer function.
 *
 * @param {*} types @see [babel-types]{@link https://babeljs.io/docs/en/babel-types}
 * @param {*} babelType the babel type to call the replacer function with.
 * @param {Function} replaceCallbackFunction a predicate function used to replace
 * the macro call path. Simply passed through additional function aruments.
 */
function replaceMacroCallPath(types, babelType, replaceCallbackFunction) {
    replaceCallbackFunction(types, babelType);
}

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

/**
 * Replaces the parent function's call path with a condense version of the
 * function argument's value.
 *
 * @param {*} types @see [babel-types]{@link https://babeljs.io/docs/en/babel-types}
 * @param {TemplateLiteral} templateLiteralArg @see {@link https://babeljs.io/docs/en/babel-types#templateliteral}
 */
function condenseTemplateLiteral(types, templateLiteralArg) {
    const { node } = templateLiteralArg;

    /*
    The TemplateLiteral can have many TemplateElements (quasis) and template
    expressions at various locations of the TemplateLiteral.

    In order to remove space from the start and end of each template string,
    we need to match against the TemplateLiteral `start` and `end` properties
    with the same properties on the TemplateElement.

    It is of some help to know the first and last element of a template literal
    is always template string, not a template expression. If written with an expression
    as the first or last part of the template literal, the internals will insert an empty
    string in order to assure this statement.
    */
    const templateLiteralStartIndex = node.start + 1;
    const templateLiteralEndIndex = node.end - 1;

    const prevQuasis = templateLiteralArg.get("quasis");

    /*
    The TemplateLiteral may have many quasis (TemplateElements) which we
    will need to iterate over.
    */
    const nextQuasis = prevQuasis.map(quasiPath => {
        // get the quasi node (TemplateElement) off the path.
        const { node: prevQuasi } = quasiPath;

        /*
        Remove padding from the start or end of the quasi value depending upon
        the posidtion of the quasi in relation to it's parent
        */
        const { value } = prevQuasi;
        let rawValue = condenseString(value.raw);

        if (prevQuasi.start === templateLiteralStartIndex) {
            rawValue = removeStartPadding(" ", rawValue);
        }

        if (prevQuasi.end === templateLiteralEndIndex) {
            rawValue = removeEndPadding(" ", rawValue);
        }

        // create a new node (TemplateElement) with modified values.
        const nextQuasi = types.TemplateElement({
            /*
            `raw` and `cooked` properties of a template string.
            > Illegal escape sequences must be represented in the "cooked" representation.
            > They will show up as undefined element in the “cooked” property.

            Refer to MDN on [TemplateLiterals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
            - [raw](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Raw_strings)
            - [cooked](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences)
            */
            raw: rawValue
        });

        return nextQuasi;
    });

    /*
    In order to replace the macro expression with our changes, we need to get
    the CallExpression. This will be the `parentPath` on our `referencePath`.
    */
    const macroCallPath = templateLiteralArg.parentPath;
    macroCallPath.replaceWith(
        // Create a new TemplateLiteral passing our changes.
        types.TemplateLiteral(nextQuasis, templateLiteralArg.node.expressions)
    );
}
