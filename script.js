// --- CONFIGURATION ---
const RAZORPAY_TEST_KEY = "rzp_test_SmwqZWycWTCEU9"; 
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1472252413195849922/oyxGWQ2D1t0Bj-H8ZR8c4pFr99fxQlPerNEtj694ohjIi6H8hKIo8u4UX21CZQt-Sykg";
const APK_LINK = "https://github.com/VELOCITY6097/Fuel-Master-app/releases/download/V1.5/FuelMaster.apk";
//ng0vbYoinN8UflvdCNgnVhNZ
// --- CUSTOM MAGNETIC CURSOR ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Slight delay for the outline to follow smoothly
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Magnetic Buttons Logic
document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
        gsap.to(btn.querySelector('.btn-text'), { x: x * 0.1, y: y * 0.1, duration: 0.3 });
        
        // Expand cursor on hover
        cursorOutline.style.width = "60px";
        cursorOutline.style.height = "60px";
        cursorOutline.style.background = "rgba(255,255,255,0.1)";
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        gsap.to(btn.querySelector('.btn-text'), { x: 0, y: 0, duration: 0.5 });
        
        // Reset cursor
        cursorOutline.style.width = "40px";
        cursorOutline.style.height = "40px";
        cursorOutline.style.background = "transparent";
    });
});

// --- GSAP ANIMATIONS & PRELOADER ---
gsap.registerPlugin(ScrollTrigger);

window.addEventListener('load', () => {
    // Cinematic Preloader sequence
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if(progress > 100) progress = 100;
        document.querySelector('.loading-progress').style.width = `${progress}%`;
        document.querySelector('.loading-percentage').innerText = `${progress}%`;
        
        if(progress === 100) {
            clearInterval(interval);
            setTimeout(initSite, 500);
        }
    }, 100);
});

function initSite() {
    const tl = gsap.timeline();
    
    // Hide preloader
    tl.to(".preloader", { yPercent: -100, duration: 1, ease: "expo.inOut" })
      
      // Reveal Hero Text
      .from(".reveal-up", { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out" }, "-=0.5")
      
      // Reveal 3D Mockup
      .from(".reveal-scale", { scale: 0.8, opacity: 0, rotationX: 20, duration: 1.2, ease: "back.out(1.5)" }, "-=0.8");

    // Scroll Animations for Bento Grid items
    gsap.utils.toArray('.bento-item').forEach(item => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });
    });

    // 3D Tilt Effect on Bento Cards
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            gsap.to(card, { rotationX: rotateX, rotationY: rotateY, transformPerspective: 1000, ease: "power1.out", duration: 0.5 });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotationX: 0, rotationY: 0, ease: "power2.out", duration: 0.5 });
        });
    });

    // Live Tank Visualizer Animation (Dip feature)
    setInterval(() => {
        const height = 40 + Math.random() * 40; // Randomize liquid height between 40% to 80%
        document.getElementById('liveLiquid').style.height = `${height}%`;
        document.getElementById('klCounter').innerText = `${(height * 0.25).toFixed(1)} KL`;
    }, 3000);
}

// Glass Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.ultra-nav');
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
});

// --- UI LOGIC (Side Panels) ---
function openPanel(id) {
    document.getElementById(id).classList.add('open');
    document.getElementById(id + 'Overlay').classList.add('open');
    if(id === 'checkoutPanel' && document.getElementById('tankConfigArea').children.length === 0) {
        addTankUI('tankConfigArea');
    }
}

function closePanel(id) {
    document.getElementById(id).classList.remove('open');
    document.getElementById(id + 'Overlay').classList.remove('open');
}

function addTankUI(containerId) {
    const div = document.createElement('div');
    div.className = 'tank-row-ui';
    div.innerHTML = `
        <select class="glass-input" style="flex: 2; padding: 12px;">
            <option value="MS">MS</option>
            <option value="HSD">HSD</option>
            <option value="XP95">XP95</option>
        </select>
        <input type="number" class="glass-input" placeholder="KL" style="flex: 1; padding: 12px;">
        <button type="button" class="btn btn-outline" style="padding: 10px 15px;" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById(containerId).appendChild(div);
}

// --- PAYMENTS & WEBHOOK LOGIC ---
function initiateRazorpay(amount, purpose, callback) {
    var options = {
        "key": RAZORPAY_TEST_KEY,
        "amount": amount * 100, // Cost is represented in Paise
        "currency": "INR",
        "name": "FuelMaster Ultra",
        "description": purpose,
        "theme": { "color": "#2563eb" },
        "handler": function (response) { callback(response.razorpay_payment_id); }
    };
    new Razorpay(options).open();
}

async function sendDiscordWebhook(title, color, fields) {
    if(!DISCORD_WEBHOOK || DISCORD_WEBHOOK.includes('YOUR_WEBHOOK')) return;
    await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [{ title, color, fields, timestamp: new Date().toISOString() }] })
    }).catch(console.error);
}

function showCyberSuccess(token, paymentId) {
    document.getElementById('ticketDisplay').innerText = token;
    document.getElementById('paymentRefDisplay').querySelector('span').innerText = paymentId;
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
    gsap.from(modal.querySelector('.success-core'), { scale: 0.5, opacity: 0, duration: 0.8, ease: "back.out(1.5)" });
}

function handleRegistration(e) {
    e.preventDefault();
    closePanel('checkoutPanel');
    
    initiateRazorpay(99, "Enterprise App License", async (paymentId) => {
        const token = "#FM-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        let tanks = [];
        document.getElementById('tankConfigArea').querySelectorAll('.tank-row-ui').forEach(r => {
            tanks.push(`${r.querySelector('select').value}: ${r.querySelector('input').value}KL`);
        });

        await sendDiscordWebhook("🚀 New App License Downloaded", 2450411, [
            { name: "Station Name", value: document.getElementById('r_pump').value, inline: true },
            { name: "Brand", value: document.getElementById('r_brand').value, inline: true },
            { name: "Auth Mobile", value: document.getElementById('r_mobile').value },
            { name: "Tank Configuration", value: tanks.join(', ') || "None" },
            { name: "Secure Token", value: token, inline: true },
            { name: "Payment ID", value: paymentId, inline: true }
        ]);

        showCyberSuccess(token, paymentId);
        e.target.reset();
    });
}

function handleUpdate(e) {
    e.preventDefault();
    closePanel('updatePanel');
    
    initiateRazorpay(49, "Secure Station Update Request", async (paymentId) => {
        const token = "#UPD-" + Math.random().toString(36).substr(2, 6).toUpperCase();

        await sendDiscordWebhook("🔄 Station Update Requested", 15105570, [
            { name: "Station Name", value: document.getElementById('u_pump').value, inline: true },
            { name: "Auth Mobile", value: document.getElementById('u_mobile').value, inline: true },
            { name: "Requested Changes", value: document.getElementById('u_changes').value },
            { name: "Update Token", value: token, inline: true },
            { name: "Payment ID", value: paymentId, inline: true }
        ]);

        showCyberSuccess(token, paymentId);
        e.target.reset();
    });
}

// --- TAB SWITCHING LOGIC ---
function switchTab(tab) {
    const regSec = document.getElementById('registerSection');
    const logSec = document.getElementById('loginSection');
    const tabReg = document.getElementById('tabReg');
    const tabLog = document.getElementById('tabLog');

    if (tab === 'register') {
        regSec.style.display = 'block';
        logSec.style.display = 'none';
        tabReg.classList.add('active');
        tabLog.classList.remove('active');
    } else {
        regSec.style.display = 'none';
        logSec.style.display = 'block';
        tabLog.classList.add('active');
        tabReg.classList.remove('active');
    }
}

// --- LOGIN LOGIC (No Payment Required) ---
function handleLogin(e) {
    e.preventDefault();
    closePanel('checkoutPanel');
    
    // Generate a secure session token
    const token = "#SESSION-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Skip Razorpay, go straight to success
    document.getElementById('ticketDisplay').innerText = token;
    document.getElementById('paymentRefDisplay').innerHTML = 'STATUS: <span style="color:#10b981">AUTH SUCCESS</span>';
    
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
    gsap.from(modal.querySelector('.success-core'), { scale: 0.5, opacity: 0, duration: 0.8, ease: "back.out(1.5)" });
    
    e.target.reset();
}

// ... Keep your existing initiateRazorpay, handleRegistration, handleUpdate, and Discord logic below this! ...
function finishFlow() {
    window.location.href = APK_LINK;
}
