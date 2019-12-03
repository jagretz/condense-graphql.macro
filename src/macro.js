/*
install

npm i @babel/cli @babel/core @babel/node @babel/traverse

*/

// Figures out whether the program is running in node or in the web browser?

let mutableLog;
let mutableAssert;

/* eslint-disable prefer-destructuring */
if (typeof window === "undefined") {
    mutableLog = console.log;
    mutableAssert = require("assert");
    mutableLog("running in node");
} else {
    mutableLog = window.console.log;
    mutableAssert = window.console.assert;
    mutableLog("running in browser");
}
/* eslint-enable prefer-destructuring */

/* reassign and export as a const to prevent re-assignment in user modules */
export const log = mutableLog;
export const assert = mutableAssert;
