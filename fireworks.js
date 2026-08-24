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
    }
}
})