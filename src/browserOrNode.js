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
} else {
    mutableLog = window.console.log;
    mutableAssert = window.console.assert;
    mutableIsBrowser = true;
}
/* eslint-enable prefer-destructuring */

/*
Reassign and export as a 'const' to prevent re-assignment in user modules.

! Don't use es import/export unless you transpile before publishing, or can guarantee
! the version of node the user is running.
*/
module.exports = {
    log: mutableLog,
    assert: mutableAssert,
    isBrowser: mutableIsBrowser,
    isNode: !!mutableIsBrowser
};
