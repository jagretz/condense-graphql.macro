const production = "production";

/**
 * Generates a different build configuration based upon an environment variable `NODE_ENV`.
 *
 * NODE_ENV is a custom environment variable and needs to be specified explictly
 * when running the build script.
 *
 * @param {*} api the babel API.
 * @returns {*} build configuration options provided to babel.
 */
module.exports = function configure(api) {
    const environment = process.env.NODE_ENV || "development";
    const isTestEnv = !!(environment === "test");

    api.cache(true);

    // We don't need to see this information every time we run our test suite.
    if (!isTestEnv) {
        console.info(`Generating ${environment} build version ${process.env.npm_package_version}`);
    }

    const baseOptions = {
        plugins: ["macros"],
        comments: false,
    };

    const baseBuildConfiguration = {
        ...baseOptions,
        ignore: ["src/**/*.test.js", "src/**/__tests__", "src/**/__snapshots__"],
    };

    if (isTestEnv) {
        return baseOptions;
    }

    // eslint-disable-next-line no-use-before-define
    const presets = getPresets(environment);

    if (environment === production) {
        return {
            ...baseBuildConfiguration,
            ...presets,
            /* sourceMaps only work as a cli option in @babel/core v7.7.4 */
            sourceMaps: true,
        };
    }

    // Configuration for the "development" environment and any others
    return { ...baseBuildConfiguration, ...presets };
};

/**
 * Returns a set of babel presets based upon the envirnmentl
 *
 * @param {string} env environment variable
 * @returns {object} babel presets based upon the environment.
 */
function getPresets(env) {
    const presets = {
        presets: [
            [
                "@babel/preset-env",
                {
                    targets: {
                        node: true,
                    },
                },
            ],
        ],
    };

    if (env === production) {
        return {
            presets: [...presets.presets, "minify"],
        };
    }

    return presets;
}
