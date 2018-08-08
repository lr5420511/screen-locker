'use strict';

const Pattern = require('./lib/pattern');

const patternCount = module.exports = function(fir, len) {
    const pattern = new Pattern();
    return Pattern.go.call(pattern, fir, len,
        (res, cur) => res.map(path => path.map(me =>
            cur.map[me[0]][me[1]]
        ).join(''))
    );
};

patternCount.Pattern = Pattern;