const fs = require('fs').promises;
const path = require('path');
const v8toIstanbul = require('v8-to-istanbul');
const reports = require('istanbul-reports');
const { createContext } = require('istanbul-lib-report');
const { createCoverageMap } = require('istanbul-lib-coverage');

const coverageDir = path.join(process.cwd(), 'coverage/temp'); // Playwright v8 coverage
const istanbulCoverageDir = path.join(process.cwd(), 'coverage/frontend'); // Final report output

async function convertCoverage() {
    // Exit if no coverage data exists
    try {
        await fs.access(coverageDir);
    } catch {
        console.log('No coverage data found.');
        return;
    }

    const coverageMap = createCoverageMap();
    const files = await fs.readdir(coverageDir);

    for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const v8Coverage = JSON.parse(
            await fs.readFile(path.join(coverageDir, file), 'utf-8')
        );

        for (const entry of v8Coverage) {
            if (!entry.url || !entry.source) continue;

            // Resolve pathname safely
            let pathname;
            try {
                pathname =
                    entry.url.startsWith('http') || entry.url.startsWith('file://')
                        ? new URL(entry.url).pathname
                        : entry.url;
            } catch {
                pathname = entry.url;
            }

            // Skip non-JS, node_modules, or non-localhost external URLs
            if (
                !pathname.endsWith('.js') ||
                (entry.url.startsWith('http') && !entry.url.includes('localhost')) ||
                entry.url.includes('node_modules')
            ) {
                continue;
            }

            // Handle Windows file paths
            const filePath = entry.url.startsWith('file://')
                ? pathname.replace(/^\/([a-zA-Z]:)/, '$1') // /C:/path -> C:/path
                : pathname;

            // Normalize path for matching
            const normalizedPath = filePath.replace(/\\/g, '/');

            // 🔒 ONLY include Joe.js
            if (!normalizedPath.endsWith('/Joe.js')) {
                console.warn(`Skipping non-target file: ${normalizedPath}`);
                continue;
            }

            try {
                const converter = v8toIstanbul(
                    'public/' + filePath,
                    0,
                    { source: entry.source }
                );
                await converter.load();
                converter.applyCoverage(entry.functions);
                coverageMap.merge(converter.toIstanbul());
            } catch (err) {
                console.warn(`Skipping coverage for ${entry.url}: ${err.message}`);
            }
        }
    }

    if (!Object.keys(coverageMap.data).length) {
        console.log('No coverage data was converted.');
        return;
    }

    // Ensure output directory exists
    try {
        await fs.access(istanbulCoverageDir);
    } catch {
        await fs.mkdir(istanbulCoverageDir, { recursive: true });
    }

    // Generate reports
    const context = createContext({
        dir: istanbulCoverageDir,
        coverageMap
    });

    ['html', 'lcovonly'].forEach(type =>
        reports.create(type).execute(context)
    );

    // Coverage thresholds (apply ONLY to Joe.js)
    const summary = coverageMap.getCoverageSummary().data;

    const thresholds = {
        lines: 50,
        statements: 50,
        functions: 50,
        branches: 50
    };

    const belowThreshold = [];

    for (const [metric, threshold] of Object.entries(thresholds)) {
        const covered = summary[metric].pct;
        if (covered < threshold) {
            belowThreshold.push(`${metric}: ${covered}% (below ${threshold}%)`);
        }
    }

    if (belowThreshold.length > 0) {
        console.error('\n✗ Coverage threshold NOT met:');
        belowThreshold.forEach(msg => console.error(` - ${msg}`));
        process.exitCode = 1;
    } else {
        console.log('\n✓ All coverage thresholds met.');
    }

    console.log(`Coverage report generated in ${istanbulCoverageDir}`);
}

convertCoverage();
