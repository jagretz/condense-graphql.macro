const { createMacro, MacroError } = require("babel-plugin-macros");
const { condenseStringLiteral } = require("./condenseStringLiteral.js");
const { condenseTemplateLiteral } = require("./condenseTemplateLiteral.js");

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
    references.default.forEach((referencePath) => {
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
                        " This macro will only work against a string literal or a template literal."
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
