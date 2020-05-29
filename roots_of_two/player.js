var audio = new AudioContext();

// table copied from https://github.com/PencilCode/musical.js
var freq_r = [0, 0, -0.203569, 0.5, -0.401676, 0.137128, -0.104117, 0.115965,
             -0.004413, 0.067884, -0.00888, 0.0793, -0.038756, 0.011882,
             -0.030883, 0.027608, -0.013429, 0.00393, -0.014029, 0.00972,
             -0.007653, 0.007866, -0.032029, 0.046127, -0.024155, 0.023095,
              -0.005522, 0.004511, -0.003593, 0.011248, -0.004919, 0.008505]
var freq_i = [0, 0.147621, 0, 0.000007, -0.00001, 0.000005, -0.000006, 0.000009,
             0, 0.000008, -0.000001, 0.000014, -0.000008, 0.000003,
             -0.000009, 0.000009, -0.000005, 0.000002, -0.000007, 0.000005,
             -0.000005, 0.000005, -0.000023, 0.000037, -0.000021, 0.000022,
             -0.000006, 0.000005, -0.000004, 0.000014, -0.000007, 0.000012];

var wave = audio.createPeriodicWave(freq_r, freq_i);

function play_note(note, instrument) {
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    gain.gain.value = 0;
    gain.connect(audio.destination);
    osc.connect(gain);
    // osc.setPeriodicWave(wave);
    osc.start();
    
    osc.frequency.setValueAtTime(note.frequency, note.time);
    gain.gain.setValueAtTime(0, note.time);
    gain.gain.linearRampToValueAtTime(note.volume, note.time + note.attack);
    gain.gain.linearRampToValueAtTime(0, note.time + note.duration);
}

var now_playing = null;
function play_scale(el, scale) {
    show_scale(el, scale);
    if (now_playing) { now_playing.stop(); now_playing = null; return; }
    var t = audio.currentTime, i = 0;
    var notes = Array.from(scale.notes())
    for(var note of notes) {
        console.log(note);
        play_note({
            wave:wave,
            frequency:note.frequency,
            time:t + i * 0.2,
            attack:0.01,
            duration:0.300,
            volume:0.1,
        });
        i++;
    }
}

var final_scale = null;
function show_scale(el, scale) {
    final_scale = scale;
    var notes = Array.from(scale.notes());
    scale_keys_view.innerHTML = "<tr><th>Note<th>Frequency<th>Rational Approximation</tr>";
    notes.forEach((note, i) => {
        var note = notes[i];
        var tr = scale_keys_view.insertRow(), td;
        td = tr.insertCell();
        td.innerHTML = i;
        td = tr.insertCell();
        td.innerHTML = (note.frequency * 100 | 0) / 100;
        td = tr.insertCell();
        td.innerHTML = note.ratio;
        tr.addEventListener("mousedown", () => {
            play_note({
                wave:wave,
                frequency:note.frequency,
                time:audio.currentTime,
                attack:0,
                duration:0.3,
                volume:0.1
            });
        });
    });
}

document.onkeydown = function keypress(e) {
    function play_key(n) {
        scale_keys_view.rows[n].dispatchEvent(new MouseEvent("mousedown"))
    };
    switch(e.key) {
    case '`': play_key(1); break;
    case '1': play_key(2); break;
    case '2': play_key(3); break;
    case '3': play_key(4); break;
    case '4': play_key(5); break;
    case '5': play_key(6); break;
    case '6': play_key(7); break;
    case '7': play_key(8); break;
    case '8': play_key(9); break;
    case '9': play_key(10); break;
    case '0': play_key(11); break;
    case '-': play_key(12); break;
    case '=': play_key(13); break;
    }
    
}
