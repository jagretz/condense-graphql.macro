/*
install

npm i @babel/cli @babel/core @babel/node @babel/traverse @babel/types babel-plugin-macros

*/

// Node or Browser?

let log, assert;

if (typeof window === "undefined") {
    log = console.log;
    assert = require("assert");
    log("running in node")
} else {
    log = window.console.log;
    assert = window.console.assert;
    log("running in browser")
}