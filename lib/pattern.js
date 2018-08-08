'use strict';

const assert = require('assert');

const Pattern = module.exports = function() {
    this.map = pre.map.match(/(^|\n)[^\n$]+/g)
        .map(cur => cur.replace(/\n/, '').split(''));
};

Pattern.prototype = {
    constructor: Pattern,
    getCoor: function(val) {
        let coor;
        this.map.every((row, i) => row.every((cur, j) =>
            !(cur === val && (coor = [i, j]))
        ));
        return coor;
    },
    //获取坐标周围所有可连接的坐标对应的向量集合，该集合与地图大小正相关
    getVectors: function(coor) {
        assert(this.map[coor[0]] && this.map[coor[0]][coor[1]],
            `${coor} is not vaild coordinate.`
        );
        return this.map.map((row, i) => {
            const offset = i - coor[0];
            if (Math.abs(offset) !== 1) {
                return [
                    [offset, -1],
                    [offset, 1]
                ].filter(cur => row[cur[1] + coor[1]]);
            }
            return row.map((cur, i) => [offset, i - coor[1]]);
        }).reduce((res, cur) => res.concat(cur));
    },
    //获取坐标在对应的向量方向上最近的可用的坐标，它不能被包含在之前的轨迹中
    getLinable: function(coor, vector, path) {
        const map = this.map;
        while (coor = [coor[0] + vector[0], coor[1] + vector[1]]) {
            if (!(map[coor[0]] && map[coor[0]][coor[1]])) return null;
            const linable = path.every(cur =>
                !(cur[0] === coor[0] && cur[1] === coor[1])
            );
            if (linable) return coor;
        }
    }
};

//可配置地图，通过preset.map配置地图的大小与节点的值
const pre = Pattern.preset = { map: 'ABC\nDEF\nGHI' };

Pattern.go = function(fir, len, callback) {
    const total = this.map.reduce((res, cur) =>
        res.concat(cur)
    ).length;
    len > total && (len = 0);
    let paths = [];
    while (len--) {
        paths = [
            [], ...paths
        ].reduce((ctx, path) => {
            const last = path[path.length - 1];
            return this.getVectors(last).forEach(cur => {
                const coor = this.getLinable(last, cur, path);
                if (!coor) return;
                ctx.push([...path, coor]);
            }) || ctx;
        });
        paths.length || (paths = [
            [this.getCoor(fir)]
        ]);
    }
    return callback(paths, this);
};