const { execSync } = require('child_process');
const path = require('path');

/**
 * Execute repomix command for a given configuration
 * @param {Object} config - Configuration object containing repomix parameters
 * @returns {Object} - Object containing success status and output/error
 */
function executeRepomix(config) {
    try {
        if (!config || typeof config !== 'object') {
            throw new Error('Invalid configuration object');
        }

        const defaultOptions = '--style plain --include="src/**/*"';
        const command = `repomix ${config.path} ${config.options || defaultOptions}`;
        console.log(`Executing: ${command}`);
        
        const output = execSync(command, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            timeout: 30000 // 30 seconds timeout
        });

        return {
            success: true,
            output
        };
    } catch (error) {
        console.error(`Error executing repomix command:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Process multiple configurations and summarize repository contents
 * @param {Array} configList - Array of configuration objects
 * @returns {Array} - Array of results with execution status
 */
function processRepositories(configList) {
    if (!Array.isArray(configList)) {
        console.error('configList must be an array');
        return [];
    }

    const results = [];
    
    for (const config of configList) {
        if (!config.path) {
            console.error('Missing required "path" parameter in config');
            continue;
        }

        console.log(`\nProcessing repository: ${config.path}`);
        const result = executeRepomix(config);
        
        results.push({
            path: config.path,
            ...result
        });
    }

    return results;
}

// Check if repomix is installed
function checkRepomixInstallation() {
    try {
        execSync('repomix --version', { stdio: 'pipe' });
        return true;
    } catch (error) {
        console.error('Error: repomix is not installed or not accessible in PATH');
        console.error('Please install repomix before running this script');
        return false;
    }
}

// Run directly
if (require.main === module) {
    if (!checkRepomixInstallation()) {
        process.exit(1);
    }

    const configList = [
        {
            path: '.',
            options: '--style plain --include="src/**/*"'
        }
    ];

    const results = processRepositories(configList);
    console.log('\nSummary Results:');
    console.log(JSON.stringify(results, null, 2));
}

// Export functions for potential module usage
module.exports = {
    executeRepomix,
    processRepositories,
    checkRepomixInstallation
};
