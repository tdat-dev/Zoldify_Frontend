/** @type {import('jest').Config} */
module.exports = {
    // Sử dụng jsdom environment để mock browser APIs
    testEnvironment: 'jsdom',
    
    // Pattern tìm file test
    testMatch: [
        '<rootDir>/tests/**/*.test.js'
    ],
    
    // Ignore folders
    testPathIgnorePatterns: [
        '/node_modules/',
        '/vendor/'
    ],
    
    // Coverage configuration
    collectCoverageFrom: [
        'public/js/**/*.js',
        '!**/node_modules/**'
    ],
    
    // Module file extensions
    moduleFileExtensions: ['js', 'json'],
    
    // Verbose output
    verbose: true
};
