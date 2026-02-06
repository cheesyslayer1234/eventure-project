module.exports = {
    // Specify the environment in which tests will run
    testEnvironment: 'node',
    // Define the pattern for test files
    // Jest will look for files ending with .test.js inside any 'tests' folder
    testMatch: ['**/tests/**/*.test.js'],
    // Enable code coverage collection
    collectCoverage: true,
    // Specify which files to include in the coverage report
    // Here, all JS files in 'utils' folder and 'index.js' are included
    collectCoverageFrom: [
        'utils/**/MalcolmNgUtil.js',
    ],
    // Directory where coverage reports will be saved
    coverageDirectory: 'coverage/backend',
    // Define the format(s) for coverage reports
    // 'text' outputs to console, 'html' creates a browsable HTML report
    coverageReporters: ['text', 'html', 'lcov'],
    // Set minimum coverage thresholds to enforce test quality
    // Tests will fail if coverage falls below these percentages
    coverageThreshold: {
        global: {
            branches: 200, // minimum 90% of conditional branches covered
            functions: 200, // minimum 90% of functions covered
            lines: 200, // minimum 90% of lines covered
            statements: 200, // minimum 90% of statements covered
        },
    },
};