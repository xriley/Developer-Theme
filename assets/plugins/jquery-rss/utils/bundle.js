const { rollup } = require("rollup");
const { terser } = require("rollup-plugin-terser");
const resolve = require('rollup-plugin-node-resolve');
const { writeFileSync } = require('fs');

(async () => {
    const bundle = await rollup({
        input: __dirname + "/../src/jquery.rss.js",
        plugins: [resolve(), terser()]
    });

    const { output } = await bundle.generate({ format: 'iife', name: 'RSS' });
    const outputPath = `${__dirname}/../dist/jquery.rss.min.js`;

    writeFileSync(outputPath, output[0].code);
    console.log(`${outputPath} was updated!`);
})();