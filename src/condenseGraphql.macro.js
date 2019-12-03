const { createMacro } = require("babel-plugin-macros");
const { log, assert } = require("./browserOrNode");

function condenseString(string) {
    // return string.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");
    return string.replace(/\s+/g, " ").replace(/\B\s|\s\B/g, "");
}

// const log = window.console.log;
// const assert = window.console.assert;

function condenseGraphql({ references, /* state, */ babel }) {
    const { types: t } = babel;
    // log(JSON.stringify(t))
    log("babel@version:", babel.version);
    references.default.forEach(referencePath => {
        // referencePath is the macro, condenseQuery
        // log("referencePath", referencePath)
        // reference the `node` to inspect properties on the path
        const iNode = referencePath.node;
        // log(`referencePath type/name ${iNode.type}/${iNode.name}`)

        const [arg1] = referencePath.parentPath.get("arguments");
        const tNode = arg1.node;
        assert(tNode.type === "TemplateLiteral", "node is not a TemplateLiteral");

        const quasis = arg1.get("quasis");
        assert(quasis && quasis.length > 0, "quasis is empty");
        // log(quasis)
        const [q] = quasis;
        const oldNode = q.node;
        q.assertTemplateElement(oldNode);
        log("oldNode", oldNode);

        // create a new node
        const newNode = t.TemplateElement(
            {
                raw: condenseString(oldNode.value.raw),
                cooked: condenseString(oldNode.value.cooked)
            },
            oldNode.tail
        );
        log("newNode", newNode);
        q.replaceWith(newNode);
    });
}

// quasiPath.parent.arguments[0].quasis[0].value.raw

module.exports = createMacro(condenseGraphql);
// export default createMacro(condenseGraphql);
