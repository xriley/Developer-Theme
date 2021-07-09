const fs = require('fs');
const { version } = require('../package.json');
const sourcePath = __dirname + '/../src/rss.js';

const lines = fs.readFileSync(sourcePath).toString().split('\n');
const updatedLines = lines.map((line) => {
    if (!line.includes('// Synced version')) {
        return line;
    }

    return `    this.version = "${version}"; // Synced version`
});

fs.writeFileSync(sourcePath, updatedLines.join('\n'));