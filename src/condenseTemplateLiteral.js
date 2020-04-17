const { condenseString } = require("./utils.js");

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
    const nextQuasis = prevQuasis.map((quasiPath) => {
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
            raw: rawValue,
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

module.exports = { condenseTemplateLiteral };
