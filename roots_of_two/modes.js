class SmallestFractionFilter {
    constructor(scale, n, limit) {
        var notes = Array.from(scale.notes());

        if (limit | 0) {
            notes = notes.filter(function(a) {
                return a.ratio.n + a.ratio.d < limit;
            });
        }

        if (n) { 
            notes.sort(function(a, b) {
                return (a.ratio.n + a.ratio.d) - (b.ratio.n + b.ratio.d);
            });
            notes = notes.slice(0, n);
            notes.sort(function(a, b) { return a.frequency - b.frequency; });
        }
        this._notes = notes;
    }
    notes() { return this._notes; }
}
