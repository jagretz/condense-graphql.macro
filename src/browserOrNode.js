/**
 * @module isBrowserOrNode
 * @description
 * Figures out whether the program is running in node or in the web browser
 */

let mutableLog;
let mutableAssert;
let mutableIsBrowser;

/* eslint-disable prefer-destructuring */
if (typeof window === "undefined") {
    // eslint-disable-next-line no-console
    mutableLog = console.log;
    mutableAssert = require("assert");
    mutableLog("running in node");
} else {
    mutableLog = window.console.log;
    mutableAssert = window.console.assert;
    mutableIsBrowser = true;
    mutableLog("running in browser");
}
/* eslint-enable prefer-destructuring */

/*
Reassign and export as a 'const' to prevent re-assignment in user modules.
*/
export const log = mutableLog;
export const assert = mutableAssert;
export const isBrowser = mutableIsBrowser;
export const isNode = !!isBrowser;
