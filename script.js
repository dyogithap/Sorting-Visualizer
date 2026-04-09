let array = [];
let history = [];
let currentStep = 0;
let audioCtx = null;

function init() {
    const size = document.getElementById('size').value;
    // Generate random values
    array = Array.from({length: size}, () => Math.floor(Math.random() * 100) + 10);
    generateBubbleSortSteps();
    currentStep = 0;
    render();
}

function generateBubbleSortSteps() {
    history = [];
    let temp = [...array];
    history.push({ arr: [...temp], highlight: [], line: 0 });

    for (let i = 0; i < temp.length; i++) {
        for (let j = 0; j < temp.length - i - 1; j++) {
            // Comparison snapshot
            history.push({ arr: [...temp], highlight: [j, j+1], line: 2 });
            if (temp[j] > temp[j+1]) {
                [temp[j], temp[j+1]] = [temp[j+1], temp[j]];
                // Swap snapshot
                history.push({ arr: [...temp], highlight: [j, j+1], line: 3 });
            }
        }
    }
}

function render() {
    const container = document.getElementById('chart-1');
    const step = history[currentStep];
    container.innerHTML = '';
    
    step.arr.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar' + (step.highlight.includes(idx) ? ' comparing' : '');
        bar.style.height = `${val}%`;
        container.appendChild(bar);
    });

    // Highlight the code line
    [1,2,3].forEach(l => document.getElementById(`line-${l}`).className = '');
    if(step.line > 0) document.getElementById(`line-${step.line}`).className = 'highlight';
    
    document.getElementById('comp-count').innerText = currentStep;

    // AUDIO LOGIC: Play a beep based on the value of the bar
    if(audioCtx && step.highlight.length > 0) {
        const val = step.arr[step.highlight[0]];
        playTone(200 + (val * 5)); // Higher value = higher pitch
    }
}

function next() { if(currentStep < history.length - 1) { currentStep++; render(); } }
function prev() { if(currentStep > 0) { currentStep--; render(); } }

// Audio Controller
function toggleAudio() {
    if(!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        document.getElementById('audio-status').innerText = 'ON';
    } else {
        audioCtx.close(); 
        audioCtx = null;
        document.getElementById('audio-status').innerText = 'OFF';
    }
}

function playTone(freq) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

// Start the app
init();