// Global state variables for the signup form
let selectedIdType = 'aadhaar';
let phoneVerified = false;
let idVerified = false;

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Dashboard Section Navigation
function showDashboardSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId + '-section').classList.add('active');
    
    // Update active menu item
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Modal Controls
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// A generic function to show a message modal instead of alert()
function showMessageModal(title, message) {
    document.getElementById('message-modal-title').textContent = title;
    document.getElementById('message-modal-body').textContent = message;
    openModal('message-modal');
}

// Authentication Functions
function login() {
    const emailInput = document.getElementById('login-email');
    const email = emailInput.value;

    // A basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(email)) {
        // Simulate login process
        showPage('user-dashboard');
        showToast('Login successful!', 'success');
    } else {
        showMessageModal('Validation Error', 'Please enter a valid email address.');
    }
}


function logout() {
    showPage('home');
    showToast('You have been logged out.', 'success');
}

// Emergency Function
function triggerEmergency() {
    openModal('emergency-modal');
}

function confirmEmergency() {
    closeModal('emergency-modal');
    showToast('Emergency alert triggered! Help is on the way.', 'error');
    
    // In a real application, this would send a request to the backend
    console.log("Emergency alert sent to backend");
}

// Toast Notification
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    // Animate the toast in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

// Initialize Map
function initMap() {
    // Default coordinates (Central Park, New York)
    const map = L.map('map').setView([40.7812, -73.9665], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add a marker
    L.marker([40.7812, -73.9665])
        .addTo(map)
        .bindPopup('Your current location')
        .openPopup();
}

// Signup Form Logic
function selectIdType(type) {
    selectedIdType = type;
    document.querySelectorAll('.id-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    document.querySelector(`.id-option:nth-child(${type === 'aadhaar' ? 1 : 2})`).classList.add('selected');
    
    const idLabel = document.getElementById('id-label');
    const idInput = document.getElementById('id-number');
    
    if (type === 'aadhaar') {
        idLabel.textContent = 'Aadhaar Number *';
        idInput.placeholder = 'Enter your Aadhaar number';
    } else {
        idLabel.textContent = 'Passport Number *';
        idInput.placeholder = 'Enter your passport number';
    }
    
    // Reset verification status
    document.getElementById('id-verification-status').style.display = 'none';
    idVerified = false;
}

function verifyPhone() {
    const statusDiv = document.getElementById('phone-verification-status');
    
    if (!iti.isValidNumber()) {
        statusDiv.textContent = 'Please enter a valid phone number';
        statusDiv.className = 'verification-status verification-error';
        statusDiv.style.display = 'block';
        phoneVerified = false;
        return;
    }
    
    // Simulate verification process
    statusDiv.textContent = 'Sending verification code...';
    statusDiv.className = 'verification-status';
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.textContent = 'Verification code sent to your phone';
        statusDiv.className = 'verification-status verification-success';
        phoneVerified = true;
        
        // Show OTP container
        document.getElementById('otp-container').style.display = 'block';
    }, 1500);
}

function verifyId() {
    const idInput = document.getElementById('id-number');
    const statusDiv = document.getElementById('id-verification-status');
    
    if (selectedIdType === 'aadhaar') {
        if (!idInput.value || idInput.value.length !== 12 || isNaN(idInput.value)) {
            statusDiv.textContent = 'Please enter a valid 12-digit Aadhaar number';
            statusDiv.className = 'verification-status verification-error';
            statusDiv.style.display = 'block';
            idVerified = false;
            return;
        }
    } else {
        if (!idInput.value || idInput.value.length < 8) {
            statusDiv.textContent = 'Please enter a valid passport number';
            statusDiv.className = 'verification-status verification-error';
            statusDiv.style.display = 'block';
            idVerified = false;
            return;
        }
    }
    
    // Simulate verification process
    statusDiv.textContent = 'Verifying your ID...';
    statusDiv.className = 'verification-status';
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.textContent = selectedIdType === 'aadhaar' 
            ? 'Aadhaar number verified successfully' 
            : 'Passport number verified successfully';
        statusDiv.className = 'verification-status verification-success';
        idVerified = true;
    }, 2000);
}

function moveToNext(input) {
    if (input.value.length === 1) {
        const next = input.nextElementSibling;
        if (next && next.tagName === "INPUT") {
            next.focus();
        }
    }
}

document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!phoneVerified) {
        showMessageModal('Validation Error', 'Please verify your phone number first.');
        return;
    }
    
    if (!emergencyIti.isValidNumber()) {
        showMessageModal('Validation Error', 'Please enter a valid emergency contact phone number.');
        return;
    }
    
    if (!idVerified) {
        showMessageModal('Validation Error', 'Please verify your ID first.');
        return;
    }
    
    // Collect all form data
    const formData = {
        fullName: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        phone: iti.getNumber(),
        countryCode: iti.getSelectedCountryData().iso2,
        idType: selectedIdType,
        idNumber: document.getElementById('id-number').value,
        emergencyContact: {
            name: document.getElementById('emergency-name').value,
            relationship: document.getElementById('emergency-relationship').value,
            phone: emergencyIti.getNumber(),
            email: document.getElementById('emergency-email').value
        },
        termsAccepted: document.getElementById('terms').checked,
        signupDate: new Date().toISOString()
    };
    
    // Simulate form submission to MongoDB
    const statusDiv = document.getElementById('phone-verification-status');
    statusDiv.textContent = 'Saving your data to secure database...';
    statusDiv.className = 'verification-status';
    statusDiv.style.display = 'block';
    
    try {
        // In a real application, you would send the data to your backend
        // which would then store it in MongoDB
        const response = await simulateMongoDBSave(formData);
        
        if (response.success) {
            statusDiv.textContent = 'Registration successful! Data stored securely.';
            statusDiv.className = 'verification-status verification-success';
            
            // Show success message and redirect
            showMessageModal('Registration Success', 'Account created successfully! You will be redirected to the login page.');
            
            // In a real application: window.location.href = '/login';
        } else {
            throw new Error('Database error');
        }
    } catch (error) {
        statusDiv.textContent = 'Error saving data. Please try again.';
        statusDiv.className = 'verification-status verification-error';
        console.error('Error:', error);
    }
});

// Simulate MongoDB save function
async function simulateMongoDBSave(data) {
    // In a real application, this would be a fetch or axios call to your backend API
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate successful save
            console.log('Data to be saved to MongoDB:', data);
            resolve({ success: true, id: '1234567890abcdef' });
        }, 2000);
    });
}


// Initialize the application
window.onload = function() {
    initMap();
    
    // Check if user is logged in (simulated)
    const isLoggedIn = false; // This would come from your authentication system
    
    if (isLoggedIn) {
        showPage('user-dashboard');
    } else {
        showPage('home');
    }
    
    // Initialize international telephone inputs
    const phoneInput = document.querySelector("#phone");
    const emergencyPhoneInput = document.querySelector("#emergency-phone");
    
    window.iti = window.intlTelInput(phoneInput, {
        initialCountry: "in",
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });
    
    window.emergencyIti = window.intlTelInput(emergencyPhoneInput, {
        initialCountry: "in",
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });
    
    // Auto-validate phone numbers as user types
    phoneInput.addEventListener('input', function() {
        const statusDiv = document.getElementById('phone-verification-status');
        if (iti.isValidNumber()) {
            statusDiv.textContent = 'Phone number format is valid';
            statusDiv.className = 'verification-status verification-success';
            statusDiv.style.display = 'block';
        } else {
            statusDiv.style.display = 'none';
        }
    });

    const loginButton = document.querySelector('.login-btn');
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }

};