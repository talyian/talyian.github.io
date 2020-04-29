class PythagoreanScale {
    constructor(base_freq, n, n2, octaves) {
        this.name = `Pythagorean Tuning, ${base_freq}`;
        this.base_freq = base_freq;
        this.n = n;
        this.n2 = n2;
        this.octaves = octaves;
        this.upper_limit = this.base_freq * Math.pow(2, this.octaves);
    }
    * notes_unsorted() {
        for(var i = -this.n2; i <= this.n; i++) {
            var value =  this.base_freq * Math.pow(3, i);
            while(value < this.upper_limit)
                value *= 2;
            while(value > this.upper_limit)
                value /= 2;
            while(value >= this.base_freq) {
                yield value;
                value /= 2;
            }
        }
    }
    * notes() {
        var x = Array.from(this.notes_unsorted());
        x.sort(function(a,b) { return a - b; });
        for(var n of x)
            yield {
                frequency: n,
                ratio: new RationalApproximate(n / this.base_freq),
            }
    }
}

class Shruti {
    constructor(base_freq) {
        this.name = `Shruti (Indian Chromatic Scale)`;
        this.base_freq = base_freq;
    }
    * notes_unsorted() {
        for(var i3 = -5; i3 <= 5; i3++) {
            for(var i5 = -1; i5 <= 1; i5++) {
                if (Math.abs(i5) && Math.abs(i3) > 3) continue;
                if (Math.abs(i5) && Math.abs(i5 + i3) > 3) continue;
                var value = Math.pow(3, i3) * Math.pow(5, i5);
                while(value < 2) value *= 2;
                while(value >= 2) value /= 2;
                
                // something odd is happening here
                // 64/45 is really close to 729/512,
                // but we prefer the latter at note 12
                // however, at note 11 we *do* use 45/32 instead of 1024/729!

                // I'm not going to call out the original sources as
                // wrong per se, but it seems like the difference
                // (0.001 relative error) would be really hard to
                // distinguish.
                if (i3 === -2 && i5 === -1)
                    yield 729 / 512 * this.base_freq
                else 
                    yield value * this.base_freq;
            }
        }
    }    
    * notes() {
        var x = Array.from(this.notes_unsorted());
        x.sort(function(a,b) { return a - b; });
        for(var n of x)
            yield {
                frequency: n,
                ratio: new RationalApproximate(n / this.base_freq),
            }
    }
}

class EqualTemperamentScale {
    constructor(base_freq, n, range) {
        this.name = `Equal Temperament, ${base_freq}, ${n}`;
        this.base_freq = base_freq;
        this.n = n;
        this.range = range;
    }
    * notes() {
        for(var i = 0; i <= this.n; i++) {
            var q = Math.pow(this.range, i / this.n);
            yield {
                frequency:this.base_freq * q,
                ratio: new RationalApproximate(q),
            };
        }
    }
}

const all_scales = {
    E12: new EqualTemperamentScale(200, 12, 2),
    E24: new EqualTemperamentScale(200, 24, 2),
}
