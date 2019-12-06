const { createMacro, MacroError } = require("babel-plugin-macros");
const { log, assert } = require("./browserOrNode");

function condenseString(string) {
    // return string.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
    return string.replace(/\s+/g, " ").replace(/\B\s|\s\B/g, "");
}
function padString(string) {
    return string.padStart(" ").padEnd(" ");
}

// const log = window.console.log;
// const assert = window.console.assert;

function condenseGraphql({ references, /* state, */ babel }) {
    const { types } = babel;
    log("babel@version:", babel.version);
    // references refers to all the references of your (macro) expression.
    // references.default is the `import xyz from...`. Use the name of your
    // macro for named exports.
    references.default.forEach(referencePath => {
        // referencePath is the macro: condenseGraphql. An `Identifier` with a `name`
        // property which is the name assigned to the default import, eg "condenseQuery".

        // To inspect the path's node property (referencePath.node) to view it's attributes and methods.

        /*
        Get the `arguments` of the parentPath, `CallExpression`.
        The functions API only expects a single argument. If called correctly,
        the first arg will be the `TemplateLiteral`.
        */
        const functionArguments = referencePath.parentPath.get("arguments");
        const numberOfFunctionArguments = functionArguments.length;
        if (numberOfFunctionArguments === 0) {
            throw new MacroError("The macro function expected an argument but received none.");
        }
        if (numberOfFunctionArguments > 1) {
            throw new MacroError(
                `The macro function expected to receive a single argument but received ${numberOfFunctionArguments}`
            );
        }

        // The TemplateLiteral may have many quasis (TemplateElements) which we
        // will need to iterate over. See `quasis.map()` below.
        const [templateLiteralArg] = functionArguments;
        const templateLiteralNode = templateLiteralArg.node;
        assert(templateLiteralNode.type === "TemplateLiteral", "node is not a TemplateLiteral");

        const prevQuasis = templateLiteralArg.get("quasis");
        log("prevQuasis array", prevQuasis);

        const nextQuasis = prevQuasis.map(quasiPath => {
            // get the quasi node (TemplateElement) off the path.
            const { node: prevQuasi } = quasiPath;
            // log("nextQuasi", nextQuasi);

            // create a new node (TemplateElement) with modified values.
            const { value } = prevQuasi;
            const nextQuasi = types.TemplateElement({
                /*
                `raw` and `cooked` properties of a template string.
                > Illegal escape sequences must be represented in the "cooked" representation.
                > They will show up as undefined element in the “cooked” property.

                Refer to MDN on [TemplateLiterals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
                - [raw](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Raw_strings)
                - [cooked](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences)
                */
                raw: padString(condenseString(value.raw)),
                cooked: padString(condenseString(value.cooked))
            });
            // log("nextQuasi", nextQuasi);

            return nextQuasi;
        });

        /*
        In order to replace the macro expression with our changes, we need to get
        the CallExpression. This will be the `parentPath` on our `referencePath`.
        */
        const macroCallPath = templateLiteralArg.parentPath;
        // log("macroCallPath", macroCallPath);
        macroCallPath.replaceWith(
            // Create a new TemplateLiteral passing our changes.
            types.TemplateLiteral(nextQuasis, templateLiteralArg.node.expressions)
        );
    });
}

module.exports = createMacro(condenseGraphql);
// export default createMacro(condenseGraphql);
