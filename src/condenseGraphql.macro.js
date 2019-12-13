const { createMacro, MacroError } = require("babel-plugin-macros");
const { log, assert } = require("./browserOrNode");

function condenseString(string) {
    /*
    First, match any white space character, including space, tab, form feed, line feed
    and replaces with a white space character.
    Second, match any white space character that buds up against a non-word with the exception of:
    - a white space character occuring at the beginning of an input
    - a white space character occuring at the end of an input
    - a white space character followed by a dot character
    and replace with an empty space.
    */
    return string.replace(/\s+/gm, " ").replace(/(?<!^\B)\B | \B(?!\B$|\.)/g, "");
}

function removeStartPadding(padValue, compareIndex, string) {
    if (string[compareIndex] === padValue) {
        return string.slice(1, string.length)
    }

    return string;
}
function removeEndPadding(padValue, compareIndex, string) {
    if (string[compareIndex] === padValue) {
        return string.slice(0, string.length - 1)
    }

    return string;
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
        const templateLiteralStartIndex = templateLiteralNode.start + 1;
        const templateLiteralEndIndex = templateLiteralNode.end - 1;
        log(
            "templateLiteralStartIndex start/end",
            templateLiteralStartIndex,
            templateLiteralEndIndex
        );

        const prevQuasis = templateLiteralArg.get("quasis");
        // log("prevQuasis array", prevQuasis);

        const nextQuasis = prevQuasis.map(quasiPath => {
            // get the quasi node (TemplateElement) off the path.
            const { node: prevQuasi } = quasiPath;

            // Determine if we need to pad the start/end of the quasi string.
            // const isTemplateElementTheStartOfTheQuais =
            //     prevQuasi.start === templateLiteralStartIndex;
            // const isTemplateElementTheEndOfTheQuais = prevQuasi.end === templateLiteralEndIndex;

            // create a new node (TemplateElement) with modified values.
            const { value } = prevQuasi;
            let rawValue = condenseString(value.raw);

            if (prevQuasi.start === templateLiteralStartIndex) {
                 rawValue = removeStartPadding(" ", 0, rawValue)
            }

            if (prevQuasi.end === templateLiteralEndIndex) {
                 rawValue = removeEndPadding(" ", rawValue.length, rawValue)
            }

            const nextQuasi = types.TemplateElement({
                /*
                `raw` and `cooked` properties of a template string.
                > Illegal escape sequences must be represented in the "cooked" representation.
                > They will show up as undefined element in the “cooked” property.

                Refer to MDN on [TemplateLiterals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
                - [raw](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Raw_strings)
                - [cooked](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences)
                */
                // raw: padString(condenseString(value.raw), padStart, padEnd),
                // cooked: padString(condenseString(value.cooked), padStart, padEnd)
                // raw: condenseString(value.raw),
                // cooked: condenseString(value.cooked)
                raw: rawValue
            });

            // log("nextQuasi", nextQuasi);
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
    });
}

module.exports = createMacro(condenseGraphql);
