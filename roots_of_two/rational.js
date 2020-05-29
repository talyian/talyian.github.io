function Ratio(num, denom) {
    this.n = num;
    this.d = denom;
}
Ratio.prototype.toString = function() { return `${this.n}/${this.d}`; };

function RationalApproximate(value, opts) {
    if (!opts) {
        opts = {};
        opts.cutoff_start = rat_cutoff_start.value * 1;
        opts.cutoff = rat_cutoff.value * 1;
        opts.limit = rat_limit.value * 1;
    }
    opts = opts || {};
    // use continued fractions to build a rational approximation
    var approx = [], vv = value;
    while(approx.length < (opts.limit || 10)) {
        var w = value | 0;
        var f = value % 1;
        approx.push(w);
        if (f < 0.00001) break;
        if (approx.length >= (opts.cutoff_start || 2) && f < 1 / (opts.cutoff || 20))
            break;
        value = 1 / f;
    }
    var n = 1, d = 0;
    for(var i = approx.length; i --> 0; ) {
        t = n;
        n = d;
        d = t;
        n += d * approx[i];
    }
    console.log('continued', vv, approx, `${n}/${d}`);
    return new Ratio(n, d);
}
