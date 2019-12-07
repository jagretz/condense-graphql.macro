const babel = require("@babel/core");

const options = {
    // plugins: [require.resolve("babel-plugin-macros")]
    plugins: ["macros"]
};

/*
Option 1: transform file
Pro: Easy to write and understand. Since it is a separate js file, syntax highlighting
is available along with and linting and formatting tools you've setup.
Con: Code is located separate from the test itself. This requires the developer to jump
between multiple files while testing.
*/
test("should remove white unnecessary space from template literal", () => {
    const inputFile = "./src/example.js";

    const result = babel.transformFileSync(inputFile, options);

    expect(result.code).toMatchSnapshot();
});

/*
Option 2: transform code snippet
Pro: Code under test is inlined next to the test assertions.
Con: Difficult to write code under test: syntax highlighting is not available,
  you may be forced to use escape characters such as when using back ticks (`),
  template expressions, and nested template literals
*/
it("should remove white unnecessary space from template literal", () => {
    // const five = 5;
    const transform = `
    const condenseGraphql = require("./condenseGraphql.macro.js");
    condenseGraphql(\`jason     has \${five} quarts
        of line\`)
    `;

    /*
    Babel API:
    [transform API](https://babeljs.io/docs/en/babel-core#transform)
    transform [options](https://babeljs.io/docs/en/options)
    */
    const { code } = babel.transform(transform, {
        plugins: ["macros"],
        /*
        Resolve the macro import relative to this filepath.
        @see [filename](https://babeljs.io/docs/en/options#filename)
        */
        filename: __filename
    });
    expect(code).toMatchSnapshot();
});
