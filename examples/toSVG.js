'use strict';

const fs = require('fs');

const dxf = require('../lib/');

module.exports = (dxfPath, svgPath, code) => {
    const parsed = dxf.parseString(fs.readFileSync(dxfPath, code || 'utf-8'));
    const svg = dxf.toSVG(parsed);
    fs.writeFileSync(svgPath, svg, code || 'utf-8');
}
