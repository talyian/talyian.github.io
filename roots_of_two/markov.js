// Given a scale, generate a series of random notes from the scale
class MarkovMelody {
    constructor(scale, n) {
        this.scale = scale;
        this.n = n;
    }
    * notes() {
        var notes = Array.from(this.scale.notes());
        var len = notes.length;
        while(true) 
            yield notes[(Math.random() * len) | 0];
    }
}
