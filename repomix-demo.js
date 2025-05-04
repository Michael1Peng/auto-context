const { execSync } = require('child_process');

/**
 * Execute repomix command for a given configuration
 * @param {Object} config - Configuration object containing repomix parameters
 * @returns {Object} - Object containing success status and output
 */
function executeRepomix(config) {
    if (!config || typeof config !== 'object') {
        return { success: false, error: 'Invalid configuration object' };
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
}

/**
 * Convert a repomix config object to command line arguments
 * @param {Object} config - Repomix config object (like repomix.config.json)
 * @returns {string} - Command line arguments string
 */
function configToArgs(config) {
    if (!config || typeof config !== 'object') return '';

    const args = [];

    // Output options
    if (config.output) {
        if (config.output.filePath) args.push(`-o "${config.output.filePath}"`);
        if (config.output.style) args.push(`--style ${config.output.style}`);
        if (config.output.compress) args.push('--compress');
        if (config.output.removeComments) args.push('--remove-comments');
        if (config.output.removeEmptyLines) args.push('--remove-empty-lines');
        if (config.output.showLineNumbers) args.push('--output-show-line-numbers');
        if (config.output.copyToClipboard) args.push('--copy');
        if (config.output.headerText) args.push(`--header-text "${config.output.headerText}"`);
        if (config.output.instructionFilePath) args.push(`--instruction-file-path "${config.output.instructionFilePath}"`);
        if (config.output.fileSummary === false) args.push('--no-file-summary');
        if (config.output.directoryStructure === false) args.push('--no-directory-structure');
        if (config.output.git) {
            if (config.output.git.sortByChanges === false) args.push('--no-git-sort');
            if (config.output.git.sortByChangesMaxCommits) args.push(`--git-sort-max-commits ${config.output.git.sortByChangesMaxCommits}`);
        }
        if (config.output.includeEmptyDirectories) args.push('--include-empty-directories');
        if (typeof config.output.topFilesLength === 'number') args.push(`--top-files-len ${config.output.topFilesLength}`);
    }

    // Include/ignore patterns
    if (Array.isArray(config.include) && config.include.length > 0) {
        args.push(`--include "${config.include.join(',')}"`);
    }
    if (config.ignore) {
        if (config.ignore.useGitignore === false) args.push('--no-gitignore');
        if (config.ignore.useDefaultPatterns === false) args.push('--no-default-patterns');
        if (Array.isArray(config.ignore.customPatterns) && config.ignore.customPatterns.length > 0) {
            args.push(`--ignore "${config.ignore.customPatterns.join(',')}"`);
        }
    }

    // Security
    if (config.security && config.security.enableSecurityCheck === false) {
        args.push('--no-security-check');
    }

    // Other options can be added here as needed

    return args.join(' ');
}

/**
 * Process a repomix config object and run repomix with generated arguments
 * @param {Object} config - Repomix config object (like repomix.config.json)
 * @returns {Object} - Result of execution
 */
function processConfig(config) {
    if (!config || typeof config !== 'object') {
        return { success: false, error: 'Invalid configuration object' };
    }
    const args = configToArgs(config);
    const pathArg = config.path || '.';
    return executeRepomix({ path: pathArg, options: args });
}

// Deep merge utility
function deepMerge(target, source) {
    if (typeof target !== 'object' || target === null) return source;
    if (typeof source !== 'object' || source === null) return target;
    const result = Array.isArray(target) ? [...target] : { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// Example usage:
const defaultConfig = {
    path: '.',
    output: {
        style: 'plain',
    },
    ignore: {
        useGitignore: true,
    },
};

const configList = [
    {
        include: ['src/**/*', 'package.json'],
        output: {
            filePath: 'output/src.md',
            style: 'markdown',
        }
    }
].map(config => deepMerge(defaultConfig, config));

const result = configList.map(config => processConfig(config));
console.log(result);
