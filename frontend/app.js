const API_URL = 'http://localhost:4000/api';

const app = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),

    init() {
        this.setupEventListeners();
        this.updateAuthUI();
        this.showPage('home');
    },

    setupEventListeners() {
        // Navigation delegation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                this.showPage(link.dataset.page);
            }
        });

        // Forms
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('book-form').addEventListener('submit', (e) => this.handleBooking(e));
        document.getElementById('record-form').addEventListener('submit', (e) => this.handleNewRecord(e));
        document.getElementById('btn-signup').addEventListener('click', () => this.showPage('register'));
        document.getElementById('btn-login').addEventListener('click', () => this.showPage('login'));
        document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());
    },

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        const page = document.getElementById(pageId);
        if (page) {
            page.style.display = 'block';
            this.handlePageLoad(pageId);
        }
    },

    updateAuthUI() {
        const guestOnly = document.querySelectorAll('.guest-only');
        const authOnly = document.querySelectorAll('.auth-only');
        const patientOnly = document.querySelectorAll('.patient-only');
        const doctorOnly = document.querySelectorAll('.doctor-only');
        const adminOnly = document.querySelectorAll('.admin-only');

        const loggedIn = !!this.token;

        guestOnly.forEach(el => el.style.display = loggedIn ? 'none' : 'block');
        authOnly.forEach(el => el.style.display = loggedIn ? 'block' : 'none');

        document.getElementById('btn-signup').style.display = loggedIn ? 'none' : 'block';
        document.getElementById('btn-login').style.display = loggedIn ? 'none' : 'block';
        document.getElementById('btn-logout').style.display = loggedIn ? 'block' : 'none';

        if (loggedIn) {
            const role = this.user.role;
            patientOnly.forEach(el => el.style.display = role === 'patient' ? 'block' : 'none');
            doctorOnly.forEach(el => el.style.display = role === 'doctor' ? 'block' : 'none');
            adminOnly.forEach(el => el.style.display = role === 'admin' ? 'block' : 'none');
            document.getElementById('welcome-text').textContent = `Welcome back, ${this.user.name} (${role})`;
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if (res.ok) {
                alert('Registration successful! Please login.');
                this.showPage('login');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Registration Error Path:', `${API_URL}/auth/register`);
            console.error('Registration Error Details:', err);
            alert('Registration failed - Check console for details');
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const creds = Object.fromEntries(formData);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds)
            });
            const data = await res.json();
            if (res.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.updateAuthUI();
                this.showPage('dashboard');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Login Error Path:', `${API_URL}/auth/login`);
            console.error('Login Error Details:', err);
            alert('Security connection failed - Check console for details');
        }
    },

    handleLogout() {
        this.token = null;
        this.user = null;
        localStorage.clear();
        this.updateAuthUI();
        this.showPage('home');
    },

    async handlePageLoad(pageId) {
        if (pageId === 'dashboard') this.loadDashboard();
        if (pageId === 'book') this.loadDoctors();
        if (pageId === 'new-record') this.loadPatients();
        if (pageId === 'logs') this.loadLogs();
    },

    async loadDashboard() {
        const container = document.getElementById('dashboard-content');
        container.innerHTML = 'Loading secure data...';

        try {
            const endpoint = this.user.role === 'patient' ? 'appointments' : 'appointments'; // Simplified
            const res = await fetch(`${API_URL}/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const items = await res.json();

            if (items.length === 0) {
                container.innerHTML = '<div class="card glass">No active records found.</div>';
                return;
            }

            container.innerHTML = items.map(item => `
                <div class="card glass">
                    <h3>Appointment: ${new Date(item.date).toLocaleDateString()}</h3>
                    <p><strong>Time:</strong> ${item.time}</p>
                    <p><strong>${this.user.role === 'patient' ? 'Doctor' : 'Patient'}:</strong> ${this.user.role === 'patient' ? item.doctor.name : item.patient.name}</p>
                    <span class="badge badge-booked">${item.status}</span>
                </div>
            `).join('');
        } catch (err) {
            container.innerHTML = 'Failed to load dashboard.';
        }
    },

    async loadDoctors() {
        const select = document.getElementById('doctor-select');
        try {
            const res = await fetch(`${API_URL}/doctors`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const doctors = await res.json();
            select.innerHTML = doctors.map(d => `<option value="${d._id}">Dr. ${d.name}</option>`).join('');
        } catch (err) { console.error('Error loading doctors:', err); }
    },

    async loadPatients() {
        const select = document.getElementById('patient-select');
        try {
            const res = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const users = await res.json();
            const patients = users.filter(u => u.role === 'patient');
            select.innerHTML = patients.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
        } catch (err) { console.error(err); }
    },

    async handleBooking(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                alert('Appointment Booked!');
                this.showPage('dashboard');
            }
        } catch (err) { alert('Booking failed'); }
    },

    async handleNewRecord(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch(`${API_URL}/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                alert('Record Added!');
                this.showPage('dashboard');
            }
        } catch (err) { alert('Record save failed'); }
    },

    async loadLogs() {
        const tbody = document.querySelector('#logs-table tbody');
        tbody.innerHTML = '<tr><td colspan="3">Decrypting audit trail...</td></tr>';

        try {
            const res = await fetch(`${API_URL}/admin/audit-logs`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const logs = await res.json();
            tbody.innerHTML = logs.map(log => `
                <tr>
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                    <td>${log.user?.name || 'System'}</td>
                    <td>${log.action}</td>
                </tr>
            `).join('');
        } catch (err) { tbody.innerHTML = 'Log retrieval failed.'; }
    }
};

app.init();
