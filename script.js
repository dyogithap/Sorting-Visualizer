let array = [];
let history = [];
let currentStep = 0;
let audioCtx = null;

function init(useCustom = false) {
    const algo = document.getElementById('algo-type').value;
    const customVal = document.getElementById('custom-input').value;
    
    // 1. Data Logic
    if (useCustom && customVal) {
        array = customVal.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    } else {
        array = Array.from({length: 8}, () => Math.floor(Math.random() * 70) + 15);
    }

    // 2. Clear & Generate
    currentStep = 0;
    history = [];
    let temp = [...array];
    history.push({ arr: [...temp], highlight: [], line: 0 });

    if (algo === 'bubble') generateBubble(temp);
    else if (algo === 'selection') generateSelection(temp);
    else if (algo === 'insertion') generateInsertion(temp);

    updateUIStrings(algo);
    render();
}

function updateUIStrings(algo) {
    const titles = { bubble: "Bubble Sort", selection: "Selection Sort", insertion: "Insertion Sort" };
    const tips = {
        bubble: "Bubble Sort: Comparing two neighbors and swapping the bigger one to the right!",
        selection: "Selection Sort: Finding the smallest number and moving it to the front!",
        insertion: "Insertion Sort: Picking a number and sliding it into its correct spot!"
    };
    document.getElementById('algo-title').innerText = titles[algo];
    document.getElementById('simple-explanation').innerText = tips[algo];
}

// --- Algorithm Logic ---
function generateBubble(temp) {
    for (let i = 0; i < temp.length; i++) {
        for (let j = 0; j < temp.length - i - 1; j++) {
            history.push({ arr: [...temp], highlight: [j, j+1], line: 2 });
            if (temp[j] > temp[j+1]) {
                [temp[j], temp[j+1]] = [temp[j+1], temp[j]];
                history.push({ arr: [...temp], highlight: [j, j+1], line: 3 });
            }
        }
    }
}

function generateSelection(temp) {
    for (let i = 0; i < temp.length; i++) {
        let min = i;
        for (let j = i + 1; j < temp.length; j++) {
            history.push({ arr: [...temp], highlight: [i, j], line: 2 });
            if (temp[j] < temp[min]) min = j;
        }
        [temp[i], temp[min]] = [temp[min], temp[i]];
        history.push({ arr: [...temp], highlight: [i, min], line: 3 });
    }
}

function generateInsertion(temp) {
    for (let i = 1; i < temp.length; i++) {
        let key = temp[i];
        let j = i - 1;
        while (j >= 0 && temp[j] > key) {
            history.push({ arr: [...temp], highlight: [j, j+1], line: 2 });
            temp[j+1] = temp[j];
            j--;
            history.push({ arr: [...temp], highlight: [j+1, i], line: 3 });
        }
        temp[j+1] = key;
        history.push({ arr: [...temp], highlight: [j+1], line: 1 });
    }
}

// --- Core Engine ---
function render() {
    const container = document.getElementById('chart-container');
    const step = history[currentStep];
    container.innerHTML = '';

    step.arr.forEach((val, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'bar-wrapper';

        const label = document.createElement('span');
        label.className = 'bar-value';
        label.innerText = val;

        const bar = document.createElement('div');
        bar.className = 'bar' + (step.highlight.includes(idx) ? ' active' : '');
        bar.style.height = (val * 3) + "px"; // Scaled for visibility

        wrapper.appendChild(label);
        wrapper.appendChild(bar);
        container.appendChild(wrapper);
    });

    [1,2,3].forEach(l => document.getElementById('line-'+l).className = '');
    if(step.line > 0) document.getElementById('line-'+step.line).className = 'line-highlight';
}

function next() {
    if (currentStep < history.length - 1) {
        currentStep++;
        render();
        if(audioCtx) playTone(250 + (history[currentStep].arr[0] * 3));
    }
}

function prev() {
    if (currentStep > 0) {
        currentStep--;
        render();
    }
}

function toggleAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const btn = document.getElementById('audio-btn');
    if (btn.innerText.includes('OFF')) {
        btn.innerText = '🔊 Audio: ON';
    } else {
        audioCtx.suspend();
        btn.innerText = '🔈 Audio: OFF';
    }
}

function playTone(freq) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

window.onload = init;