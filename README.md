[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

# condense-graphql.macro

Remove unnecessary whitespace characters from graphql queries, mutations, etc at
compile time.

[Demo](https://astexplorer.net/#/gist/83b1337139eaf22be01d9815547e2f22/44a4dcff182d27463bfb8a56274e0219ef8e331f) -
Thanks to [astexplorer.net](http://astexplorer.net)!

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [About](#about)
- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# About

This is a [babel macro](https://github.com/kentcdodds/babel-plugin-macros) that
takes a well-formatted (albeit verbose) graphql query string and removes all
unnecessary whitespace.

That allows you to build well-formatted graphql queries, even run a formatter
against them, during development, and at (compile) build time, remove all
unnecessary whitespace resulting in a much smaller memory footprint.

# Install

```js
npm install --save-dev condense-graphql.macro
```

# Usage

```js
// import the macro
import condenseGraphql from "condense-graphql.macro";

// Wrap you query with the macro
const query = condenseGraphql(`
    query {
        myQuery {
            options
        }
    }
`);
```

When compiled, the above code will be condensed into a much smaller query
string.

```js
const query = `query{simpleQuery{options}}`;
```

Notice the `import` statement and wrapping `condenseGraphql` are automatically
removed!

**Dynamic Queries**

This works the same for queries that accept template expressions as well:

```js
import condenseGraphql from "condense-graphql.macro";

function queryWithVariables(type) {
  return condenseGraphql(`
    query products(
      $type: String,
      $contains: String
    ){
        product(type: $type, contains: $contains) {
            id
            ${type}
            description
        }
    }
    `);
}
```

Produces:

```js
function queryWithVariables(type) {
  return `query products($type:String,$contains:String){product(type:$type,contains:$contains){id ${type} description}}`;
}
```

# Contributing

Help / improvement is appreciated!

Open an issue and/or submit a pull-request.

See [DEVELOPMENT.md](./DEVELOPMENT.md) for help developing this macro.

# License

Refer to [LICENSE.md](./LICENSE.md).
