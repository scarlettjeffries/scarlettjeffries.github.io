document.addEventListener("DOMContentLoaded", () => {
    const homeText = document.querySelector(".home-text");
    const homePhoto = document.querySelector(".home-photo");

    requestAnimationFrame(() => {
        homeText.classList.add("slide-in");
        homePhoto.classList.add("slide-in");
    });

    // Scroll reveal for sections/cards
    const revealElements = document.querySelectorAll(
        ".about-bio-card, .about-skills, .experience-card, .project-link, .contact"
    );
    revealElements.forEach(el => el.classList.add("reveal"));

    const titleElements = document.querySelectorAll(
        ".about-inner h2, .experience h2, .projects h2, .contact h2"
    );
    titleElements.forEach(el => el.classList.add("reveal-title"));

    // Skill pills stagger animation
    const pills = document.querySelectorAll(".skill-pill");
    pills.forEach(pill => pill.classList.add("reveal-pill"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");

                    if (entry.target.classList.contains("about-skills")) {
                        const childPills = entry.target.querySelectorAll(".skill-pill");
                        childPills.forEach((pill, i) => {
                            setTimeout(() => pill.classList.add("visible"), i * 40);
                        });
                    }
                }
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach(el => observer.observe(el));
    titleElements.forEach(el => observer.observe(el));

    // --- Swishy navbar gradient ---
    const canvas = document.getElementById("navbar-canvas");
    const navbar = document.querySelector(".navbar");
    if (!canvas || !navbar) return;

    const ctx = canvas.getContext("2d");

    const gradientColors = [
        { pos: 0,    r: 247, g: 200, b: 215 },
        { pos: 0.5,  r: 204, g: 229, b: 196 },
        { pos: 1,    r: 20,  g: 83,  b: 45  }
    ];

    function sampleGradient(t) {
        t = Math.max(0, Math.min(1, t));
        for (let i = 0; i < gradientColors.length - 1; i++) {
            const a = gradientColors[i];
            const b = gradientColors[i + 1];
            if (t >= a.pos && t <= b.pos) {
                const f = (t - a.pos) / (b.pos - a.pos);
                return {
                    r: a.r + (b.r - a.r) * f,
                    g: a.g + (b.g - a.g) * f,
                    b: a.b + (b.b - a.b) * f
                };
            }
        }
        const last = gradientColors[gradientColors.length - 1];
        return { r: last.r, g: last.g, b: last.b };
    }

    const FIELD_SIZE = 200;
    const field = new Float32Array(FIELD_SIZE);
    const fieldVel = new Float32Array(FIELD_SIZE);

    let mouseNormX = -1;
    let prevMouseX = -1;
    let mouseSpeed = 0;

    function resize() {
        const rect = navbar.getBoundingClientRect();
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
    }

    function updateField() {
        if (mouseNormX >= 0) {
            const mouseBucket = mouseNormX * FIELD_SIZE;
            const radius = 30;
            const force = mouseSpeed * 8;
            for (let i = 0; i < FIELD_SIZE; i++) {
                const dist = (i - mouseBucket) / radius;
                const influence = Math.exp(-0.5 * dist * dist);
                fieldVel[i] += force * influence;
            }
        }

        for (let i = 0; i < FIELD_SIZE; i++) {
            fieldVel[i] += -field[i] * 0.03;
            fieldVel[i] *= 0.92;
            field[i] += fieldVel[i];
        }

        const tmp = new Float32Array(FIELD_SIZE);
        for (let i = 0; i < FIELD_SIZE; i++) {
            const left = i > 0 ? field[i - 1] : field[i];
            const right = i < FIELD_SIZE - 1 ? field[i + 1] : field[i];
            tmp[i] = field[i] * 0.6 + (left + right) * 0.2;
        }
        for (let i = 0; i < FIELD_SIZE; i++) field[i] = tmp[i];
    }

    function draw() {
        const w = canvas.width;
        const h = canvas.height;

        updateField();

        const imgData = ctx.createImageData(w, h);
        const pixels = imgData.data;

        for (let x = 0; x < w; x++) {
            const baseT = x / w;
            const fi = baseT * (FIELD_SIZE - 1);
            const lo = Math.floor(fi);
            const hi = Math.min(lo + 1, FIELD_SIZE - 1);
            const frac = fi - lo;
            const displacement = field[lo] * (1 - frac) + field[hi] * frac;

            const distortedT = baseT + displacement * 0.15;
            const color = sampleGradient(distortedT);

            for (let y = 0; y < h; y++) {
                const idx = (y * w + x) * 4;
                pixels[idx]     = color.r;
                pixels[idx + 1] = color.g;
                pixels[idx + 2] = color.b;
                pixels[idx + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
        requestAnimationFrame(draw);
    }

    navbar.addEventListener("mouseleave", () => {
        mouseNormX = -1;
        prevMouseX = -1;
        mouseSpeed = 0;
    });

    navbar.addEventListener("mousemove", (e) => {
        const rect = navbar.getBoundingClientRect();
        const newX = (e.clientX - rect.left) / rect.width;

        if (prevMouseX >= 0) {
            mouseSpeed = newX - prevMouseX;
        }
        prevMouseX = newX;
        mouseNormX = newX;
    });

    window.addEventListener("resize", resize);
    resize();
    draw();
});
