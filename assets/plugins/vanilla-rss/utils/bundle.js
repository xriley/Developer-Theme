const { rollup } = require("rollup");
const { terser } = require("rollup-plugin-terser");
const resolve = require('rollup-plugin-node-resolve');
const { writeFileSync } = require('fs');
const versions = [
    {
        options: { format: 'iife', name: 'RSS' },
        name: 'global'
    }, {
        options: { format: 'cjs', name: 'RSS' },
        name: 'node'
    }
];

(async () => {
    const bundle = await rollup({
        input: __dirname + "/../src/rss.js",
        plugins: [resolve(), terser()]
    });

    versions.forEach((async ({ options, name }) => {
        const { output } = await bundle.generate(options);
        const outputPath = `${__dirname}/../dist/rss.${name}.min.js`;

        writeFileSync(outputPath, output[0].code);
        console.log(`${outputPath} was updated!`);
    }));
})();