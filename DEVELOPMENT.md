# Development Guide

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Development](#development)
- [Debugging](#debugging)
- [Testing](#testing)
- [Builds](#builds)
- [External Documentation and Resources](#external-documentation-and-resources)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Development

The easiest way to get started is by forking the
[demo](https://astexplorer.net/#/gist/83b1337139eaf22be01d9815547e2f22/44a4dcff182d27463bfb8a56274e0219ef8e331f) -
at [astexplorer.net](http://astexplorer.net).

This allows you to run the AST and preview output immediately. Additionally, you
can use `console.log` to output contents to the developer console.

The main entry point is `src/condenseGraphql.macro.js`. This file contains the
macro and any additional helper functions used in parsing and code transforms.

# Debugging

Several options are available.

1. Use the
   [demo](https://astexplorer.net/#/gist/83b1337139eaf22be01d9815547e2f22/44a4dcff182d27463bfb8a56274e0219ef8e331f) -
   at [astexplorer.net](http://astexplorer.net)

2. Use node-inspect along with visual studio code (`launch.json` settings
   included in repository).
   - Create a temporary debug file under src. For example, `src/debug.js`
     ```js
     const condenseGraphql = require("./condenseGraphql.macro.js");
     const result = condenseGraphql(\`
         query {
             simpleQuery{
                 options
             }
         }\`)
     `;
     ```
   - Set breakpoints in the debug file or macro script.
   - Run vscode's debugger using the provided `launch.json`
   - Debug with vscodes built-in debugger, or debug in your browser (example
     using Chrome), navigate to [chrome://inspect](chrome://inspect)

Ref. to
[node inspect](https://nodejs.org/en/docs/guides/debugging-getting-started/#node-inspect)

# Testing

[Jest](https://jestjs.io/docs/en/expect.html) is used for unit and snapshot
testing.

- Test files are indicated with the `*.test.js` extension.
- Snapshots are output to `__snapshots__` directory.

Each test (`it` block) generates a snapshot.

Each test also uses `@babel/core` to transform a block of code. The result is
used to generate the snapshot.

Additionally, the result is wrapped in a `Function` constructor, executed, and
the result evaluated just as it would in a running application.

# Builds

Babel is used to produce minified production build with source maps output to
`/dist`.

Some babel configurations are intentionally set on the build script rather than
in the `.babelrc` so as not to change (minify) with the output during debugging
and testing.

This is controlled through the npm script `build` and uses a `.babelrc`.

For production builds, run `npm version <version>` to update the version before
submitting a release.

Run `npm publish` to publish to the registry. Only authorized contributors may
publish packages.

# External Documentation and Resources

- [astexplorer.et](https://astexplorer.net/)
- [babel-types](https://babeljs.io/docs/en/babel-types)
