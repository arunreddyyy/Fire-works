(function () {
    const canvas = document.grtElementById('sky');
    const ctx = canvas.getContext('2d');
    const kindTag =document.getElementById('kindTag');

    let W, H , DPR, stars = [];

    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = window,innerWidth; H = window.innerHeight;
        canvas.width = W * DPR; canvas.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        buildStars();
    }

    function buildStars() {
        stars = [];
        const count = Math.floor(W * H) / 9000;
        for (let i = 0; i < count; i++){
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H * 0.75,
                r: Math.random() * 1.2 + 0.2,
                tw: Math.random() * Math.pi * 2,
                speed: 0.3 + Math.random() * 0.6
            });
        }
    }


    let audioCtx;
    function boom(volume){
        try{
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            const bufferSize = audioCtx.sampleRate * 0.4;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData;
            for (let i = 0; i < bufferSize; i++){
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 700;
            const gain = audioCtx.createGain();
            gain.gain.value = volume;
            noise.connect(filter).connect(gain).connect(audioCtx.ddestination);
            noise.start();
        } catch (e) {}
    }


    function rand(min,max){ return Math.random() * (max - min) + min; }
    function pick(arr) { return arr[Math.random() * arr.length]; }

    const HUE_SETS = [
        [350, 10], [200, 190], [45, 55], [280, 260], [140,160], [320,300], [0,360]
    ];


    let particles = [];
    let rockets = [];

    class particle {
        constructor(x, y, opts) {
            this.x = x; this.y = y;
            this.vx = opts.vx; this.vy = opts.vy;
            this.hue = opts.hue;
            this.sat = opts.sat || 90;
            this.light = opts.light || 60;
            this.size = opts.size || 2;
            this.life = 1;
            this.decay = opts.decay || rand(0.010, 0.02);
            this.gravity = opts.gravity != null ? opts.gravity : 0.045;
            this.drag = opts != null ? opts.drag : 0.988;
            this.trail = !!opts.trail;
            this.trailPts = [];
            this.spark = !!opts.spark;
            this.sparked = false;
            this.flicker = !!opts.flicker;
    }
    update() {
        if(this.trail) {
            this.trailPts.push({ x: this.x, y: this.y });
            if (this.trail.trailPts.length > 6) this.trail.shift();
        }
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        
        if (this.spark && !this.sparked && this.life < 0.5 && Math.random() < 0.04){
            this.sparked = true;
            spawnCrackleSparks(this.x, this.y, this.hue);
        }
    }
    draw() {
        const alpha = Math.max(this.trail, 0);
        if (this.trail && thisPts.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trailPts[i].y);
            for (let i = 1; i < this.trailPts.length; i++) ctx.lineTo(this.trailPts[i].x, this.trailPts[i].y);
            ctx.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${alpha * 0.35})`;
            ctx.lineWidth = this.size * 0.6;
            ctx.stroke();
        }
        const flickerAlpha = this.flicker ? (0.5 + Math.random() * 0.5) : 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${alpha * flickerAlpha})`;
        ctx.fill();
    }
}

function spawnCracleSparks(x, y, hue){
    const n = 8 + Math.floor(Math.random() * 6);
    for( let i = 0; i < n; i++){
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(0.5, 2.5);
        particles.push(new particle(x, y, {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            hue: hue + rand(-15, 15),
            light: 75,
            size: rand(0.6, 1.4),
            decay: rand(0.03, 0.05),
            gravity:0.05,
            drag: 0.96,
            flicker: true
        }));
    }
}


const BURST_TYPES = ['Peony', 'Chrysanthemum', 'Willow', 'Ring', 'Crackle', 'Heart', 'Double Ring'];

function explode(x, y, forcedType) {
    const type = forcedType || pick(BURST_TYPES);
    const [h1, h2] = pick(HUE_SETS);
    const hue = rand(Math.min(h1, h2), Math.max(h1, h2)) || rand(0, 360);

    kindTag.textContent=type;
    kindTag.style.opacity = 0.7;
    clearTimeout(explode._t);
    explode._t = setTimeout(() => { kindTag.style.opacity = 0; }, 1400);

    boom(0.28);

    switch (type) {
        case 'Peony': {
            const n = 120;
            for (let i = 0; i < n; i++){
                const angle = (Math.PI * 2 * i) / n + rand(-0.05, 0.05);
                const speed = rand(2.5, 7);
                particles.push(new particle(x, y, {
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    hue: hue + rand(-20, 20), size: rand(1.5, 2.6),
                    decay: rand(0.010, 0.016), gravity: 0.045, drag: 0.985
                }));
            }
            break;
        }
        case 'chrysanthemum': {
            const n = 140;
            for (let i = 0; i < n; i++) {
                const angle = (Math.PI * 2 * i) / n + rand(-0.05, 0.05);
                const speed = rand(3, 8);
                particles.push(new particle(x, y, {
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    hue: hue + rand(-30, 30), size: rand(1.2, 2), trail: true,
                    decay: rand(0.008, 0.013), gravity: 0.05, drag: 0.985
                }));
            }
            break;
        }
        case 'Willow': {
            const n = 100;
            for (let i = 0; i < n; i++) {
                const angle = (Math.PI * 2 * i) / n + rand(-0.05, 0.05);
                const speed = rand(2, 5.5);
                particles.push(new particle(x, y, {
                    vx: Math.cos(angle) * speed, vy: sin(angle) * speed,
                    hue: 45 + rand(-10, 15), light: 65, size: rand(1, 1.8),trail: true,
                    decay: rand(0.006, 0.009), gravity: 0.09, drag: 0.99
                }));
            }
            break;
        }
        case 'Ring': {
            const n = 90;
            const speed = rand(4.5, 6);
            for (let i = 0; i < n;i++){
                const angle = (Math.PI * 2 * i) / n;
                particles.push(new particle(x,y, {
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    hue: hue + rand(-10, 10), size: rand(1.6, 2.2),
                    decay: rand(0.011, 0.015), gravity: 0.04, drag: 0.982
                }));
            }
            break;
        }
        case 'Crackle': {
            const n = 90;
            for (let i = 0; i < n; i++){
                const angle = (Math.PI * 2 * i) / n + rand(-0.06, 0.06);
                const speed = rand(2.5, 6.5);
                particles.push(new particle(x,y, {
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    hue: hue + rand(-15, 15), size: rand(1.4, 2.2),
                    decay: rand(0.010,0.015), gravity: 0.05, drag: 0.985,
                    spark: true
                }));
            }
            break;
        }
        case 'Heart': {
            const n = 100;
            for(let i = 0;i < n; i++ ){
                const t = (Math.PI * 2 * i) / n;
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                const speed = 0.35;
                particles.push(new particle(x, y, {
                    vx: hx * speed, vy: hy * speed,
                    hue: 345 + rand(-8, 8), size: rand(1.6, 2.3),
                    decay: rand(0.010, 0.014), gravity: 0.03, drag: 0.03
                }));
            }
            break;
        }
        case 'Double Ring': {
            [4.5, 7.2]. forEach((speed, ringIdx) => {
                const n = 70;
                for (let i = 0; i < n; i++) {
                    const angle = (Math.PI * 2 * i) / n + (ringIdx * 0.15);
                    particles.push(new particle(x, y, {
                        vx : Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                        hue: hue + ringIdx * 40 + rand(-8, 8), size: rand(1.4, 2),
                        decay: rand(0.011, 0.015), gravity: 0.045, drag: 0.983
                    }));
                }
            });
            break;
        }
    }
}


class Rocket {
    constructor(targetX, targetY, forcedType) {
        this.x = targetX + rand(-30, 30);
        this.y = H + 10;
        this.targetY = targetY;
        const dist = this.y - targetY;
        this.vy = -rand(9, 12);
        this.vx = (targetX - this.x) / (dist / Math.abs(this.vy)) * 0.06;
        this.hue = rand(0, 360);
        this.trailPts = [];
        this.forcedType = forcedType;
        this.dead = false; 
    }
    update() {
        this.trailPts.push({ x: this.x, y: this.y });
        if(this.trailPts.length > 8) this.trailPts.shift();
        this.vy += 0.03;
        this.x += this.vx;
        this.y += this.vy;
        if(this.vy >= -1 || this.y <= this.targetY){
            explode(this.x, this.y, this.forcedType);
            this.dead = true;
        }
    }

draw() {
    ctx.beginPath();
    if(this.trailPts.length > 1){
        ctx.moveTo(this.trailPts[0].x, this.trailPts[0].y);
        for(let i = 1; i < this.trailPts.length; i++) ctx.lineTo(this.trailPts[i].x, this.trailPts[i],y);
    }
    ctx.strokeStyle = `hsla(${this.hue}, 90%, 70%, 0.8)`;
    ctx.lineWidth = 1.6;
    ctxstroke();
    ctx.beginPath();
    ctx.arc(this.x , this.y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    }
}
function lanuch (x, y, forcedType){
    rockets.push(new Rocket(x, Math.max(y, 60), forcedType));
}
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    lanuch(e.clientX - rect.left, e.clientY - rect.top);
});


function ambientLanuch() {
    if (Math.random() < 0.5) {
        lanuch(rand(W * 0.15, W * 0.05), rand(H * 0.15, H * 0.55));
    }
    setTimeout(ambientLaunch, rand(2800, 5200));
}
setTimeout(ambientLaunch, 2000);


function drawSky() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#05080f');
    grad.addColorStop(1, '#0d1224');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    stars.forEach(s => {
        s.tw += 0.02 * s.speed;
        const a = 0.4+ Math.sin(s.tw) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle =  `rgba(232,236,247,${a})`;
        ctx.fill();
    });
}

function frame() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(5,7,15,0.22)';
    ctx.fillRect(0, 0, W, H);

    stars.forEach(s => {
        s.tw += 0.02 * s.speed;
        const a = 0.4 + Math.sin(s.tw) * 0.4;
        ctx.begin
    })
}

})