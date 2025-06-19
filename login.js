const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const emailInput = document.getElementById('email');
const otpInput = document.getElementById('otp');
const otpSection = document.getElementById('otp-section');
const messageDiv = document.getElementById('message');
const loadingScreen = document.getElementById('loading-screen');

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyESYuQ0ZhrPD7D62E7gMJNxgDYSE3q-hn3TvEsaiPSM1GHj0ZvCkbKclDsvpiFxUdeJA/exec'; // Replace with your Google Script URL

// Check if user is already logged in
window.onload = () => {
  const token = localStorage.getItem('loginToken');
  if (token) {
    messageDiv.style.color = 'green';
    messageDiv.textContent = 'You are already logged in.';
    // Optionally redirect or show logged-in state here
    disableForm();
  }
};

function disableForm() {
  emailInput.disabled = true;
  sendOtpBtn.disabled = true;
  otpInput.disabled = true;
  verifyOtpBtn.disabled = true;
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

sendOtpBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  if (!email) {
    showMessage('Please enter a valid email address.');
    return;
  }
  showMessage('Sending OTP...');
  loadingScreen.style.display = 'flex';
  // Send email to Google Script to send OTP
  fetch(`${GOOGLE_SCRIPT_URL}?action=sendOtp&email=${encodeURIComponent(email)}`)
    .then(response => response.json())
    .then(data => {
      loadingScreen.style.display = 'none';
      if (data.success) {
        showMessage('OTP sent to your email. Please check your inbox.', 'green');
        otpSection.style.display = 'block';
        sendOtpBtn.disabled = true;
        emailInput.disabled = true;
      } else {
        showMessage(data.message || 'Failed to send OTP.');
      }
    })
    .catch(() => {
      loadingScreen.style.display = 'none';
      showMessage('Error sending OTP. Please try again later.');
    });
});

verifyOtpBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const otp = otpInput.value.trim();
  if (!otp) {
    showMessage('Please enter the OTP.');
    return;
  }
  showMessage('Verifying OTP...');
  loadingScreen.style.display = 'flex';
  // Verify OTP via Google Script
  fetch(`${GOOGLE_SCRIPT_URL}?action=verifyOtp&email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)
    .then(response => response.json())
    .then(data => {
      loadingScreen.style.display = 'none';
      if (data.success) {
        showMessage('OTP verified. You are now logged in.', 'green');
        localStorage.setItem('loginToken', data.token || 'loggedIn');
        localStorage.setItem('userEmail', email); // Store email in localStorage
        disableForm();
        // Redirect to appropriate page after successful login
        const redirectUrl = getQueryParam('redirect') || 'account.html';
        alert('Please update your profile in the account page.');
        window.location.href = redirectUrl;
      } else {
        showMessage(data.message || 'Invalid OTP. Please try again.');
      }
    })
    .catch(() => {
      loadingScreen.style.display = 'none';
      showMessage('Error verifying OTP. Please try again later.');
    });
});

function showMessage(msg, color = 'red') {
  messageDiv.style.color = color;
  messageDiv.textContent = msg;
}
