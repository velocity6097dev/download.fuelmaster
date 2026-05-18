// --- FUELMASTER CONFIGURATION ---
const RAZORPAY_TEST_KEY = "rzp_test_SmwqZWycWTCEU9"; 
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1472252413195849922/oyxGWQ2D1t0Bj-H8ZR8c4pFr99fxQlPerNEtj694ohjIi6H8hKIo8u4UX21CZQt-Sykg";
const APK_LINK = "https://download1325.mediafire.com/3vm5tyb69yngm-hjQm8O1_9FF6RsqdbZLSxDnA1L5HyDQNiUqRr2HYPGYUXEITVhcXf59duXhxdAblNaVEEPlBn59MK_r4aTTSpolTY6AW8x0mCFoJMulUTUVvW7zfg-6UOG2z6SQhama0bVxP_ty4vFb9sqBRMsN5WQEuFW8j4xwQ/ok3kas5ir0fdz1a/FuelMaster.apk";

// --- BULLETPROOF SCROLL ANIMATIONS ---
document.addEventListener('DOMContentLoaded', () => {
    // Fallback: If JS is slow or errors out later, force everything visible after 1 second
    setTimeout(() => {
        document.querySelectorAll('.fade-in-scroll').forEach(el => el.classList.add('visible'));
    }, 1000);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.05 }); 

    document.querySelectorAll('.fade-in-scroll').forEach(el => observer.observe(el));
});

// --- MODAL / BOTTOM SHEET LOGIC ---
function openSheet(id) {
    document.getElementById('sheetOverlay').classList.add('active');
    document.getElementById(id).classList.add('active');
    
    // Prevent background scrolling on mobile
    if (window.innerWidth < 600) {
        document.body.style.overflow = 'hidden'; 
    }
}

function closeAllSheets() {
    document.getElementById('sheetOverlay').classList.remove('active');
    document.querySelectorAll('.bottom-sheet').forEach(sheet => {
        sheet.classList.remove('active');
    });
    // Restore scrolling
    document.body.style.overflow = ''; 
}

// --- PAYMENTS & WEBHOOKS ---
function initiateRazorpay(amount, purpose, callback) {
    if (typeof Razorpay === 'undefined') {
        alert("Payment gateway loading error. Please refresh the page (Ctrl+F5).");
        return;
    }

    var options = {
        "key": RAZORPAY_TEST_KEY,
        "amount": amount * 100, // Amount in Paise
        "currency": "INR",
        "name": "FuelMaster OS",
        "description": purpose,
        "theme": { "color": "#7c3aed" }, 
        "handler": function (response) { callback(response.razorpay_payment_id); }
    };
    new Razorpay(options).open();
}

async function sendDiscordWebhook(title, color, fields) {
    if(!DISCORD_WEBHOOK || DISCORD_WEBHOOK.includes('YOUR_WEBHOOK')) return;
    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [{ title, color, fields, timestamp: new Date().toISOString() }] })
        });
    } catch (e) {
        console.log("Webhook skipped");
    }
}

// --- DYNAMIC SUCCESS STATE ---
function showSuccessSheet(token, paymentId, actionType) {
    closeAllSheets(); 
    
    setTimeout(() => {
        openSheet('successSheet');
        
        document.getElementById('ticketDisplay').innerText = token;
        document.getElementById('paymentRefDisplay').innerText = paymentId;
        
        const title = document.getElementById('successTitle');
        const message = document.getElementById('successMessage');
        const actionBtn = document.getElementById('successActionBtn');

        if (actionType === 'download') {
            title.innerText = "App Authorized";
            message.innerText = "Payment verified. You can now download FuelMaster.";
            actionBtn.innerHTML = '<i class="fas fa-download"></i> Download APK';
            actionBtn.onclick = function() {
                window.location.href = APK_LINK;
            };
        } else if (actionType === 'update') {
            title.innerText = "Request Sent";
            message.innerText = "Payment verified. The support team will apply your station updates.";
            actionBtn.innerHTML = '<i class="fas fa-home"></i> Return to Home';
            actionBtn.onclick = function() {
                closeAllSheets(); 
            };
        }
    }, 400); 
}

// Handle Form: Download App (₹99)
function handleRegistration(e) {
    e.preventDefault();
    
    initiateRazorpay(99, "FuelMaster Lifetime License", async (paymentId) => {
        const token = "#FM-" + Math.random().toString(36).substr(2, 6).toUpperCase();

        await sendDiscordWebhook("🚀 Universal App Download", 8146164, [
            { name: "Station", value: document.getElementById('r_pump').value, inline: true },
            { name: "Brand", value: document.getElementById('r_brand').value, inline: true },
            { name: "Mobile", value: document.getElementById('r_mobile').value },
            { name: "Token", value: token, inline: true },
            { name: "Payment ID", value: paymentId, inline: true }
        ]);

        showSuccessSheet(token, paymentId, 'download');
        e.target.reset();
    });
}

// Handle Form: Update Request (₹49)
function handleUpdate(e) {
    e.preventDefault();
    
    initiateRazorpay(49, "Station Configuration Update", async (paymentId) => {
        const token = "#UPD-" + Math.random().toString(36).substr(2, 6).toUpperCase();

        await sendDiscordWebhook("🔄 Universal Update Requested", 15105570, [
            { name: "Station", value: document.getElementById('u_pump').value, inline: true },
            { name: "Mobile", value: document.getElementById('u_mobile').value, inline: true },
            { name: "Changes", value: document.getElementById('u_changes').value },
            { name: "Token", value: token, inline: true },
            { name: "Payment ID", value: paymentId, inline: true }
        ]);

        showSuccessSheet(token, paymentId, 'update');
        e.target.reset();
    });
}
