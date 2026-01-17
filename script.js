// ดึงข้อมูลจาก LocalStorage
let users = JSON.parse(localStorage.getItem('app_users')) || {}; 
let currentUser = localStorage.getItem('current_session') || null;
let currentLang = 'th';

const textSource = {
    th: { 
        title: "🥬 Smart Food Tracker 🥕", 
        desc: "ลดขยะอาหารเพื่อโลก", 
        authTitle: "เข้าสู่ระบบ / สมัครสมาชิก",
        name: "ชื่ออาหาร/ของสด", 
        exp: "วันหมดอายุ", 
        warn: "เตือนล่วงหน้า (วัน)", 
        btn: "บันทึกข้อมูล", 
        left: "อีก", 
        day: "วัน", 
        expired: "หมดอายุแล้ว!", 
        urgent: "ใกล้หมดอายุ!", 
        delete: "ลบ",
        loginErr: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        fillErr: "กรุณากรอกข้อมูลให้ครบ"
    },
    en: { 
        title: "🥬 Smart Food Tracker 🥕", 
        desc: "Zero Food Waste", 
        authTitle: "Login / Register",
        name: "Food Name", 
        exp: "Expiry Date", 
        warn: "Alert Before (Days)", 
        btn: "Add to Fridge", 
        left: "", 
        day: "days left", 
        expired: "Expired!", 
        urgent: "Expiring soon!", 
        delete: "Delete",
        loginErr: "Invalid username or password",
        fillErr: "Please fill in all info"
    }
};

// --- ระบบจัดการภาษา (แก้ไขตรงนี้ให้ทำงานได้จริง) ---
function switchLang(lang) {
    currentLang = lang;
    const t = textSource[lang];

    // อัปเดตข้อความในหน้าเว็บทุกจุด
    document.getElementById('titleText').innerText = t.title;
    document.getElementById('descText').innerText = t.desc;
    document.getElementById('authTitle').innerText = t.authTitle;
    document.getElementById('labelName').innerText = t.name;
    document.getElementById('labelExp').innerText = t.exp;
    document.getElementById('labelWarn').innerText = t.warn;
    document.getElementById('btnAdd').innerText = t.btn;

    // สั่งให้วาดรายการอาหารใหม่เป็นภาษาที่เลือก
    if (currentUser) {
        render();
    }
}

// --- ระบบบัญชีผู้ใช้ ---
function handleRegister() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) return alert(textSource[currentLang].fillErr);
    if (users[user]) return alert(currentLang === 'th' ? "ชื่อนี้มีคนใช้แล้ว!" : "Username already exists!");

    users[user] = { password: pass, inventory: [] };
    localStorage.setItem('app_users', JSON.stringify(users));
    alert(currentLang === 'th' ? "สมัครสำเร็จ!" : "Registered successfully!");
}

function handleLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (users[user] && users[user].password === pass) {
        currentUser = user;
        localStorage.setItem('current_session', user);
        checkSession();
    } else {
        alert(textSource[currentLang].loginErr);
    }
}

function handleLogout() {
    localStorage.removeItem('current_session');
    currentUser = null;
    checkSession();
}

function checkSession() {
    if (currentUser) {
        document.getElementById('authArea').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userDisplay').innerText = `👤 ${currentUser}`;
        render();
    } else {
        document.getElementById('authArea').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
    }
}

// --- ระบบจัดการอาหาร ---
function addFood() {
    const name = document.getElementById('foodName').value;
    const date = document.getElementById('expDate').value;
    const warn = document.getElementById('warnDays').value;

    if (!name || !date) return alert(textSource[currentLang].fillErr);

    users[currentUser].inventory.push({
        id: Date.now(),
        name: name,
        expiry: date,
        warnDays: parseInt(warn)
    });

    saveData();
    document.getElementById('foodName').value = "";
    document.getElementById('expDate').value = "";
}

function deleteItem(id) {
    users[currentUser].inventory = users[currentUser].inventory.filter(item => item.id !== id);
    saveData();
}

function saveData() {
    localStorage.setItem('app_users', JSON.stringify(users));
    render();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

function render() {
    const area = document.getElementById('resultArea');
    area.innerHTML = "";
    const today = new Date();
    today.setHours(0,0,0,0);

    let list = users[currentUser].inventory;
    list.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    list.forEach(item => {
        const exp = new Date(item.expiry);
        const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        const t = textSource[currentLang];
        
        let status = "fresh";
        let msg = currentLang === 'th' ? `${t.left} ${diff} ${t.day}` : `${diff} ${t.day}`;

        if (diff <= 0) {
            status = "expired";
            msg = t.expired;
        } else if (diff <= item.warnDays) {
            status = "warning";
            msg = `${t.urgent} (${diff} ${t.day})`;
        }

        const card = document.createElement('div');
        card.className = `item-card ${status}`;
        card.innerHTML = `
            <div class="item-info">
                <b>${item.name}</b>
                <small>Exp: ${formatDate(item.expiry)}</small>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:0.85em; font-weight:bold;">${msg}</span>
                <button class="delete-btn" onclick="deleteItem(${item.id})">${t.delete}</button>
            </div>
        `;
        area.appendChild(card);
    });
}

// รันครั้งแรก
switchLang('th');
checkSession();