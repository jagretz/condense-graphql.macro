/* eslint-disable no-new-func */
const babel = require("@babel/core");

const babelOptions = {
    plugins: ["macros"],
    /*
    Resolve the macro import relative to this filepath.
    @see [filename](https://babeljs.io/docs/en/options#filename)
    */
    filename: __filename
};

describe("condenseGraphql.macro", () => {
    it("should remove unnecessary whitespace from template literal", () => {
        const transform = `
        const condenseGraphql = require("./condenseGraphql.macro.js");
        const result = condenseGraphql(\`replaces \${amount}    whitespace	characters
        with a single space.\`)
        `;

        /*
        Babel API:
        [transform API](https://babeljs.io/docs/en/babel-core#transform)
        transform [options](https://babeljs.io/docs/en/options)
        */
        const { code } = babel.transform(transform, babelOptions);

        expect(code).toMatchSnapshot();

        const fn = new Function(
            "amount",
            `
            ${code};
            return result;
            `
        );
        const result = fn(5);

        expect(result).toBe("replaces 5 whitespace characters with a single space.");
    });

    it("retains whitespace before, in-between, and after template expressions", () => {
        const transform = `
        const condenseGraphql = require("./condenseGraphql.macro.js");
        const result = condenseGraphql(\`retains space \${before}, \${after} and between \${template} \${expressions}.\`)
        `;

        const { code } = babel.transform(transform, babelOptions);

        expect(code).toMatchSnapshot();

        const fn = new Function(
            "before",
            "after",
            "template",
            "expressions",
            `
            ${code};
            return result;
            `
        );
        const result = fn("before", "after", "template", "expressions");

        expect(result).toBe("retains space before,after and between template expressions.");
    });

    it("retains space between template expressions when separated by a new line", () => {
        const transform = `
        const condenseGraphql = require("./condenseGraphql.macro.js");
        const result = condenseGraphql(\`retains space between \${template}
        \${expressions} when separated by a new line.\`)
        `;

        const { code } = babel.transform(transform, babelOptions);

        expect(code).toMatchSnapshot();

        const fn = new Function(
            "template",
            "expressions",
            `
            ${code};
            return result;
            `
        );
        const result = fn("template", "expressions");

        expect(result).toBe(
            "retains space between template expressions when separated by a new line."
        );
    });

    describe("removes unnecessary whitespace from a graphql query", () => {
        it("containing a single object", () => {
            const transform = `
            const condenseGraphql = require("./condenseGraphql.macro.js");
            const result = condenseGraphql(\`
                query {
                    simpleQuery{
                        options
                    }
                }\`)
            `;

            const { code } = babel.transform(transform, babelOptions);
            expect(code).toMatchSnapshot();

            const fn = new Function(
                `
                ${code};
                return result;
                `
            );
            const result = fn();

            expect(result).toBe("query{simpleQuery{options}}");
        });

        it("containing multiple query params", () => {
            const transform = `
            const condenseGraphql = require("./condenseGraphql.macro.js");
            const result = condenseGraphql(\`
                query {
                    simpleQuery{
                        options
                        date
                        age
                    }
                }\`)
            `;

            const { code } = babel.transform(transform, babelOptions);
            expect(code).toMatchSnapshot();

            const fn = new Function(
                `
                ${code};
                return result;
                `
            );
            const result = fn();

            expect(result).toBe("query{simpleQuery{options date age}}");
        });

        it("containing query variables and nested objects", () => {
            const transform = `
            const condenseGraphql = require("./condenseGraphql.macro.js");
            const result = condenseGraphql(\`
                query queryWithVariables(
                    $id: ID,
                    $age: String,
                    $startDate: Date){
                        products(type: $type) {
                            id
                            code
                            options {
                                timeInMilliseconds
                            }
                        }
                    }\`)
            `;

            const { code } = babel.transform(transform, babelOptions);
            expect(code).toMatchSnapshot();

            const fn = new Function(
                `
                ${code};
                return result;
                `
            );
            const result = fn();

            expect(result).toBe(
                "query queryWithVariables($id:ID,$age:String,$startDate:Date){products(type:$type){id code options{timeInMilliseconds}}}"
            );
        });
    });
});
