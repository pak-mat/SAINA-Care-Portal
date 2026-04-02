// --- Global Data Store (Simulated Database) ---
let appointmentRequests = [];
let permissionRequests = [];

// --- Authentication State (Simulated) ---
let isAdminLoggedIn = false;
let isStudentLoggedIn = false; 
let currentStudent = null; 

// Using the accounts from the original script.js:
const ADMIN_ACCOUNTS = [
    { username: 'pakmat', password: 'pakmat123', name: 'Faris Arfan' },
    { username: 'muhammad', password: 'muhammad123', name: 'Muhammad Abdullah' },
    { username: 'haziq', password: 'haziq123', name: 'Haziq Yus' }
];

// UPDATED: Mock Student Accounts now includes a successfully registered account (ID 1003)
const STUDENT_ACCOUNTS = [
    { id: '1001', username: 'faris.firdaus', password: 'Saina@123', name: 'Mohamad Faris Bin Mohamad Firdaus' },
    { id: '1002', username: 'afif.shahronizan', password: 'Saina@123', name: 'Muhammad Afif Rifqi Bin Shahronizan' },
    { id: '1003', username: 'afiq.anuar', password: 'Saina@123', name: 'Muhammad Afiq Hakimy Bin Anuar' } // New Registered Account
];

// --- DOM Element Selection ---
const pageViews = document.querySelectorAll('.page-view');
const navLinks = document.querySelectorAll('.nav-link');
const defaultPage = 'home';
const adminNavSection = document.getElementById('adminNavSection');
const adminLoginButton = document.getElementById('adminLoginButton');
const studentAuthContainer = document.getElementById('studentAuthContainer'); 
const studentLoginButton = document.getElementById('studentLoginButton'); 
const studentLogoutButton = document.getElementById('studentLogoutButton'); 
const modal = document.getElementById('confirmationModal');
const modalContent = document.getElementById('modalContent');


/**
 * Updates the visibility and requirements of form fields based on student login status. (NEW)
 */
function updateFormFields() {
    const fields = document.querySelectorAll('.student-auth-field');
    fields.forEach(field => {
        const input = field.querySelector('input, select, textarea');
        if (isStudentLoggedIn) {
            field.classList.add('hidden');
            if (input) input.removeAttribute('required');
        } else {
            field.classList.remove('hidden');
            // Re-apply 'required' if the field originally had it (handled by HTML now, but safe check)
            if (input) input.setAttribute('required', 'required'); 
        }
    });
}


/**
 * Updates the visibility of the Admin and Student navigation sections based on login status. (CONSOLIDATED)
 */
function updateNavVisibility() {
    // --- Admin Logic ---
    if (isAdminLoggedIn) {
        adminNavSection.classList.remove('hidden');
        adminLoginButton.classList.add('hidden');
        studentAuthContainer.classList.add('hidden'); // Hide student auth when admin is logged in
    } else {
        adminNavSection.classList.add('hidden');
        adminLoginButton.classList.remove('hidden');
        studentAuthContainer.classList.remove('hidden'); // Show student auth when admin is logged out
    }

    // --- Student Logic ---
    if (isStudentLoggedIn) {
        studentLoginButton.classList.add('hidden');
        studentLogoutButton.classList.remove('hidden');
        studentLogoutButton.textContent = `Logout (${currentStudent.name.split(' ')[0]})`;
    } else {
        studentLoginButton.classList.remove('hidden');
        studentLogoutButton.classList.add('hidden');
    }

    // Update form fields based on login status (NEW)
    updateFormFields();
}


/**
 * Switches the active view (page) and updates the navigation highlight.
 * @param {string} pageId - The ID of the page to navigate to (e.g., 'home', 'appointments').
 */
function navigateTo(pageId) {
    // --- Admin Route Protection ---
    const isAdminRoute = pageId.startsWith('admin-') && pageId !== 'admin-login';
    if (isAdminRoute && !isAdminLoggedIn) {
        pageId = 'admin-login'; // Redirect to login page if trying to access protected route
        showModal('Access Denied', 'Please log in with administrator credentials to access the dashboard.');
    }

    // --- Student Route Protection (NEW) ---
    const isStudentProtected = ['appointments', 'permissions'].includes(pageId);
    if (isStudentProtected && !isStudentLoggedIn) {
        pageId = 'student-login'; // Redirect to student login page
        showModal('Access Required', 'Please log in with your student ID to access the Appointment and Permission forms.');
    }

    // Hide all pages
    pageViews.forEach(view => {
        view.classList.add('hidden');
    });

    // Show the requested page
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    // Update active navigation link
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    // For admin pages, highlight the relevant main navigation link (if any)
    const targetNav = document.getElementById('nav-' + pageId.replace('admin-', '').replace('student-', ''));
    if (targetNav) {
        targetNav.classList.add('active');
    } else if (pageId === 'home') {
        document.getElementById('nav-home').classList.add('active');
    }

    // Run specific setup functions for admin pages
    if (pageId === 'admin-appointments') {
        renderAppointmentRequests();
    } else if (pageId === 'admin-permissions') {
        renderPermissionRequests();
    }

    // Scroll to the top of the content
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateNavVisibility(); // Renamed and consolidated
    navigateTo(defaultPage);
});

// --- Modal Control Functions (UNCHANGED) ---

function showModal(title, message, isPermissionForm = false, uniqueId = null) {
    // IMPRESSIVE UPGRADE: Modal header style
    let contentHTML = `<h3 class="text-3xl font-bold text-primary-teal mb-4">${title}</h3>`;
    contentHTML += `<p class="text-gray-700">${message}</p>`;

    // Special content for the Permission form
    if (isPermissionForm) {
        const requestId = uniqueId || 'SCH-REQ-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        const shareLink = `https://schoolportal.edu/status?id=${requestId}`; 

        // IMPRESSIVE UPGRADE: Request ID box style
        contentHTML += `<div class="mt-6 bg-gray-50 p-5 rounded-xl border border-primary-teal/50">`;
        contentHTML += `<p class="font-bold text-sm text-gray-600 mb-2 border-b pb-1">Your Request ID:</p>`;
        contentHTML += `<p id="requestId" class="text-xl font-mono text-secondary-blue break-all tracking-wider">${requestId}</p>`;
        contentHTML += `<p class="font-bold text-sm text-gray-600 mt-4 mb-2 border-b pb-1">Shareable Status Link:</p>`;
        contentHTML += `<div class="flex">`;
        contentHTML += `<input type="text" id="statusLink" value="${shareLink}" readonly class="flex-grow p-3 text-sm border border-gray-300 rounded-l-xl bg-white focus:outline-none" />`;
        // IMPRESSIVE UPGRADE: Copy button style
        contentHTML += `<button onclick="copyLink('${shareLink}')" class="bg-secondary-blue text-white p-3 rounded-r-xl hover:bg-primary-teal transition duration-300 text-sm font-semibold">Copy Link</button>`;
        contentHTML += `</div></div>`;
    }

    modalContent.innerHTML = contentHTML;
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

function copyLink(textToCopy) {
    const tempInput = document.createElement('input');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    
    try {
        document.execCommand('copy');
        const copyBtn = document.querySelector('.flex button');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = originalText; }, 1500);

    } catch (err) {
        console.error('Could not copy text: ', err);
    } finally {
        document.body.removeChild(tempInput);
    }
}

// --- Admin Authentication Handlers ---

/**
 * Handles the submission of the Admin Login Form (Mocked).
 * @param {Event} event - The form submission event.
 */
function handleAdminLogin(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const username = data.get('username');
    const password = data.get('password');
    const loginMessage = document.getElementById('adminLoginMessage');
    const loginBtn = document.getElementById('loginBtn'); 
    
    loginMessage.classList.add('hidden');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';

    // Find a matching account in the array
    const matchedAccount = ADMIN_ACCOUNTS.find(account => 
        account.username === username && account.password === password
    );

    setTimeout(() => {
        if (matchedAccount) {
            isAdminLoggedIn = true;
            updateNavVisibility();
            navigateTo('admin-appointments'); // Redirect to the first admin page
            form.reset();
            showModal('Login Successful', `Welcome back, ${matchedAccount.name}. You now have access to the dashboard.`);
        } else {
            loginMessage.textContent = 'Invalid username or password.';
            loginMessage.classList.remove('hidden');
            isAdminLoggedIn = false;
        }

        loginBtn.disabled = false;
        loginBtn.textContent = 'Log In Securely';
    }, 1000); // 1 second delay
}

/**
 * Handles the Admin Logout action.
 * @param {Event} event - The click event.
 */
function handleAdminLogout(event) {
    event.preventDefault();
    isAdminLoggedIn = false;
    currentStudent = null; // Ensure student is also logged out for a clean slate
    isStudentLoggedIn = false;
    updateNavVisibility();
    navigateTo('home');
    showModal('Logout Successful', 'You have been securely logged out of the Admin dashboard.');
}


// --- Student Authentication Handlers (UPDATED with new Registration) ---

/**
 * Handles the submission of the Student Login Form (Mocked).
 * @param {Event} event - The form submission event.
 */
function handleStudentLogin(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const username = data.get('username');
    const password = data.get('password');
    const loginMessage = document.getElementById('studentLoginMessage');
    const loginBtn = document.getElementById('studentLoginBtn'); 
    
    loginMessage.classList.add('hidden');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';

    // Find a matching account in the array
    const matchedAccount = STUDENT_ACCOUNTS.find(account => 
        account.username === username && account.password === password
    );

    setTimeout(() => {
        if (matchedAccount) {
            isStudentLoggedIn = true;
            currentStudent = matchedAccount;
            updateNavVisibility();
            navigateTo('home'); // Redirect to the Home page after successful login
            form.reset();
            showModal('Welcome to Your Portal', `Hello, ${matchedAccount.name}! You can now access all student services (Appointments and Permissions).`);
        } else {
            loginMessage.textContent = 'Invalid username or password.';
            loginMessage.classList.remove('hidden');
            isStudentLoggedIn = false;
            currentStudent = null;
        }

        loginBtn.disabled = false;
        loginBtn.textContent = 'Access My Portal';
    }, 1000); // 1 second delay
}

/**
 * Handles the Student Logout action.
 * @param {Event} event - The click event.
 */
function handleStudentLogout(event) {
    event.preventDefault();
    isStudentLoggedIn = false;
    currentStudent = null;
    updateNavVisibility();
    navigateTo('home');
    showModal('Logged Out', 'You have been logged out of the student portal.');
}

/**
 * Handles the submission of the Student Registration Form (Mocked). (NEW)
 * @param {Event} event - The form submission event.
 */
function handleStudentRegistration(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    
    const id = data.get('id');
    const name = data.get('name');
    const username = data.get('username');
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');
    const regMessage = document.getElementById('regMessage');
    const registerBtn = document.getElementById('registerBtn');
    
    regMessage.classList.add('hidden');
    
    // Simple Client-Side Validation
    if (password !== confirmPassword) {
        regMessage.textContent = 'Error: Passwords do not match.';
        regMessage.classList.remove('hidden');
        return;
    }

    // Check if ID or Username already exists
    const idExists = STUDENT_ACCOUNTS.some(account => account.id === id);
    const usernameExists = STUDENT_ACCOUNTS.some(account => account.username === username);

    if (idExists) {
        regMessage.textContent = `Error: Student ID "${id}" is already registered.`;
        regMessage.classList.remove('hidden');
        return;
    }

    if (usernameExists) {
        regMessage.textContent = `Error: Username "${username}" is already taken. Please choose another.`;
        regMessage.classList.remove('hidden');
        return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating Account...';

    // Simulate Server Registration Delay
    setTimeout(() => {
        // Create new student object and add to mock database (Simulates persistence)
        const newStudent = { id, username, password, name };
        STUDENT_ACCOUNTS.push(newStudent);

        // This is the step that simulates "writing into code":
        // In a real application, this data would be saved to a database.
        // Here, we simply update the in-memory array and inform the user.

        // Reset and redirect
        form.reset();
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register Account';
        
        showModal('Registration Successful', 
            `Your account for **${name}** (ID: ${id}) has been created! You can now log in with your new username and password. The system has saved your credentials.`);
            
        navigateTo('student-login');

    }, 1500); // 1.5 second delay
}


// --- Form Submission Handlers (Student) ---

/**
 * Handles the submission of the Appointment Booking Form.
 * @param {Event} event - The form submission event.
 */
function handleAppointmentSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    
    // Automatically use the logged-in student's details if available
    const studentName = currentStudent ? currentStudent.name : data.get('studentName');
    const studentEmail = currentStudent ? `${currentStudent.username}@school.edu` : data.get('studentEmail');

    // Capture NEW form details
    const gradeLevel = currentStudent ? 'Logged In' : data.get('gradeLevel'); // Simplified for logged in student
    const specificGoals = data.get('specificGoals');

    const requestData = {
        id: 'APP-' + Date.now(),
        name: studentName,
        email: studentEmail,
        topic: data.get('sessionTopic'),
        gradeLevel: gradeLevel, // NEW
        specificGoals: specificGoals, // NEW
        slots: [data.get('slot1'), data.get('slot2'), data.get('slot3')].filter(s => s),
        status: 'Pending',
        submittedAt: new Date().toLocaleString()
    };
    appointmentRequests.push(requestData);

    const submitBtn = document.getElementById('appointmentBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    setTimeout(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Appointment Request';

        const message = `Thank you, ${studentName}! Your session request has been successfully submitted. We will review your 3 preferred slots and confirm the final time via email shortly.`;
        showModal('Appointment Requested', message);
        
    }, 1500); // 1.5 second delay
}

/**
 * Handles the submission of the School Change Permission Form.
 * @param {Event} event - The form submission event.
 */
function handlePermissionSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    const uniqueId = 'SCH-REQ-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const data = new FormData(form);
    // Automatically use the logged-in student's details if available
    const studentName = currentStudent ? currentStudent.name : data.get('permissionStudentName');

    // Capture NEW form details
    const parentContact = data.get('parentContact');
    const transferDate = data.get('transferDate');

    const requestData = {
        id: uniqueId,
        name: studentName,
        reason: data.get('transferReason'),
        destination: data.get('destinationSchool'),
        parentContact: parentContact, // NEW
        transferDate: transferDate, // NEW
        explanation: data.get('detailedExplanation'),
        status: 'Pending Review',
        submittedAt: new Date().toLocaleString()
    };
    permissionRequests.push(requestData);

    const submitBtn = document.getElementById('permissionBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    setTimeout(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Permission Request';

        const message = `Your request for school transfer permission has been filed. Please save your Request ID below for tracking purposes. The Administration will contact your parent/guardian.`;
        showModal('Request Submitted', message, true, uniqueId); 
    }, 1500); // 1.5 second delay
}

// --- Admin Rendering Functions (UNCHANGED) ---

/**
 * Renders the list of pending appointment requests in the admin view.
 */
function renderAppointmentRequests() {
    const listContainer = document.getElementById('appointmentList');
    const noMessage = document.getElementById('noAppointmentMessage');
    listContainer.innerHTML = ''; // Clear existing content

    if (appointmentRequests.length === 0) {
        noMessage.classList.remove('hidden');
        listContainer.appendChild(noMessage);
        return;
    }

    noMessage.classList.add('hidden');

    appointmentRequests.forEach((req, index) => {
        const item = document.createElement('div');
        const statusClass = req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                             req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                             'bg-yellow-100 text-yellow-700';

        // IMPRESSIVE UPGRADE: Admin List Item Style
        item.className = 'p-6 border-l-4 border-secondary-blue rounded-xl bg-white shadow-lg hover:shadow-xl transition duration-300';
        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-grow">
                    <p class="font-extrabold text-xl text-primary-teal">${req.name} <span class="text-sm font-normal text-gray-500">(${req.email})</span></p>
                    <p class="text-base text-gray-700 mt-2">Topic: <span class="font-medium">${req.topic}</span> | Grade: <span class="font-medium">${req.gradeLevel}</span></p>
                    <p class="text-xs text-gray-500 mt-1">Submitted: ${req.submittedAt}</p>
                    <div class="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p class="text-sm font-bold text-gray-800">Goals:</p>
                        <p class="text-sm italic text-gray-600">${req.specificGoals}</p>
                    </div>
                    <div class="mt-4 text-sm">
                        <span class="font-bold mr-2">Status:</span>
                        <span class="inline-block px-4 py-1 text-sm font-bold rounded-full ${statusClass}">${req.status}</span>
                    </div>
                    <div class="mt-3 text-sm border-t pt-3">
                        <span class="font-bold mr-2 text-gray-700">Preferred Slots:</span>
                        <div class="mt-2 flex flex-wrap gap-2">
                        ${req.slots.map(slot => `<span class="inline-block bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-xs font-semibold hover:bg-gray-300 transition">${new Date(slot).toLocaleString()}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="flex flex-col space-y-2 mt-1 flex-shrink-0">
                    <button onclick="updateAppointmentStatus(${index}, 'Approved')" class="text-white hover:bg-green-700 bg-green-600 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 shadow-md disabled:opacity-50" ${req.status !== 'Pending' ? 'disabled' : ''}>Approve</button>
                    <button onclick="updateAppointmentStatus(${index}, 'Rejected')" class="text-white hover:bg-red-700 bg-red-600 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 shadow-md disabled:opacity-50" ${req.status !== 'Pending' ? 'disabled' : ''}>Reject</button>
                </div>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

/**
 * Updates the status of an appointment request and re-renders the list.
 * @param {number} index - The index of the request in the array.
 * @param {string} newStatus - The new status ('Approved' or 'Rejected').
 */
function updateAppointmentStatus(index, newStatus) {
    if (appointmentRequests[index]) {
        appointmentRequests[index].status = newStatus;
        renderAppointmentRequests();
    }
}

/**
 * Renders the list of pending permission requests in the admin view.
 */
function renderPermissionRequests() {
    const listContainer = document.getElementById('permissionList');
    const noMessage = document.getElementById('noPermissionMessage');
    listContainer.innerHTML = ''; // Clear existing content

    if (permissionRequests.length === 0) {
        noMessage.classList.remove('hidden');
        listContainer.appendChild(noMessage);
        return;
    }

    noMessage.classList.add('hidden');

    permissionRequests.forEach((req, index) => {
        const item = document.createElement('div');
        const statusClass = req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                             req.status === 'Denied' ? 'bg-red-100 text-red-700' :
                             'bg-yellow-100 text-yellow-700';

        // IMPRESSIVE UPGRADE: Admin List Item Style
        item.className = 'p-6 border-l-4 border-primary-teal rounded-xl bg-white shadow-lg hover:shadow-xl transition duration-300';
        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-grow">
                    <p class="font-extrabold text-xl text-primary-teal mb-1">${req.name}</p>
                    <p class="text-sm text-secondary-blue mt-0 font-mono">Request ID: ${req.id}</p>
                    <div class="mt-3 flex items-center space-x-4 text-sm text-gray-700">
                        <span class="font-medium">Reason: <span class="font-semibold">${req.reason}</span></span> 
                        <span class="font-medium">Destination: <span class="font-semibold">${req.destination}</span></span>
                        <span class="font-medium">Proposed Date: <span class="font-semibold">${req.transferDate}</span></span>
                    </div>
                    <p class="text-sm text-gray-700 mt-1">Parent Contact: <span class="font-medium">${req.parentContact}</span></p>
                    <div class="mt-4 text-sm">
                        <span class="font-bold mr-2">Status:</span>
                        <span class="inline-block px-4 py-1 text-sm font-bold rounded-full ${statusClass}">${req.status}</span>
                        <span class="text-xs text-gray-500 ml-3">Submitted: ${req.submittedAt}</span>
                    </div>
                    <div class="mt-4 p-4 bg-gray-50 rounded-lg border-l-2 border-secondary-blue">
                        <p class="text-sm italic text-gray-800 font-medium">${req.explanation}</p>
                    </div>
                </div>
                <div class="flex flex-col space-y-2 mt-1 flex-shrink-0">
                    <button onclick="updatePermissionStatus(${index}, 'Approved')" class="text-white hover:bg-green-700 bg-green-600 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 shadow-md disabled:opacity-50" ${req.status !== 'Pending Review' ? 'disabled' : ''}>Approve</button>
                    <button onclick="updatePermissionStatus(${index}, 'Denied')" class="text-white hover:bg-red-700 bg-red-600 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 shadow-md disabled:opacity-50" ${req.status !== 'Pending Review' ? 'disabled' : ''}>Deny</button>
                </div>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

/**
 * Updates the status of a permission request and re-renders the list.
 * @param {number} index - The index of the request in the array.
 * @param {string} newStatus - The new status ('Approved' or 'Denied').
 */
function updatePermissionStatus(index, newStatus) {
    if (permissionRequests[index]) {
        permissionRequests[index].status = newStatus;
        renderPermissionRequests();
    }
}