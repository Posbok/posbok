import { registerAdmin, registerBusiness } from './apiServices/registration';
import {
  generateBusinessOwnerId,
  redirectWithDelay,
  showToast,
} from './script';

// Create Business Registration Form
const createBusinessForm = document.getElementById('createBusinessForm');
const businessId = localStorage.getItem('businessId');
console.log('📌 Retrieved Business ID:', businessId);

const generatedBusinessOwnerId = generateBusinessOwnerId();
// console.log(generatedBusinessOwnerId); // Only numeric ID

if (createBusinessForm) {
  createBusinessForm.addEventListener('submit', function (e) {
    e.preventDefault(); // stop page refresh

    const businessName = document.getElementById('businessName').value;
    const businessAddress = document.getElementById('businessAddress').value;
    const businessPhoneNumber = document.getElementById(
      'businessPhoneNumber'
    ).value;
    const businessState = document.getElementById('businessState').value;
    const cacRegNo = document.getElementById('cacRegNo').value;
    const taxId = document.getElementById('taxId').value;
    const nin = document.getElementById('nin').value;
    const businessStaffSize =
      document.getElementById('businessStaffSize').value;

    const businessTypeCheckboxes = document.querySelectorAll(
      'input[name="businessType"]:checked'
    );
    const businessType = Array.from(businessTypeCheckboxes).map(
      (cb) => cb.value
    );
    const businessTypeValue = businessType[0] || null;

    const versionPreferenceCheckboxes = document.querySelectorAll(
      'input[name="versionPreference"]:checked'
    );

    const versionPreference = Array.from(versionPreferenceCheckboxes).map(
      (cb) => cb.value
    );
    const versionPreferenceValue = versionPreference[0] || null;

    const businessDetails = {
      businessOwnerId: generatedBusinessOwnerId,
      businessName,
      address: businessAddress,
      phoneNumber: businessPhoneNumber,
      stateOfOperation: businessState,
      cacRegNo,
      taxId,
      nin,
      businessType: businessTypeValue,
      staffSize: businessStaffSize,
      versionPreference: versionPreferenceValue,
    };

    console.log('📦 Business Details:', businessDetails);

    registerBusiness(businessDetails)
      .then((data) => {
        const businessId = data.data.id; // the business ID returned from backend
        localStorage.setItem('businessId', businessId);
        showToast('success', `✅ ${data.message}`);

        redirectWithDelay('Admin Creation Page', 'signup.html', 3000);
      })
      .catch((data) => {
        showToast('fail', `❎ ${data.message}`);
        console.error('❎ Failed to register:', data);
      });
  });
}

// Create Admin Registration Form
const signupForm = document.getElementById('signupForm');

if (signupForm) {
  // Password Validation
  // Wait for input in the password and confirm password fields
  document.getElementById('password').addEventListener('input', () => {
    const passwordInput = document.getElementById('password');
    const pass = passwordInput.value;
    const lengthErrorText = document.getElementById('password-length');

    // Check if password is at least 6 characters long
    if (pass.length < 6) {
      passwordInput.classList.add('input-mismatch');
      lengthErrorText.textContent =
        'Password must be at least 6 characters long.';
      lengthErrorText.style.display = 'block';
      lengthErrorText.style.textAlign = 'left';
    } else {
      // Hide the length error message when password length is valid
      passwordInput.classList.remove('input-mismatch');
      lengthErrorText.style.display = 'none';
    }
  });

  document.getElementById('confirm-password').addEventListener('input', () => {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const pass = passwordInput.value;
    const confirmVal = confirmPasswordInput.value;

    const mismatchErrorText = document.getElementById('password-mismatch');

    // Reset mismatch error text and input styling
    confirmPasswordInput.classList.remove('input-match', 'input-mismatch');
    mismatchErrorText.style.display = 'none';

    // If password length is sufficient, check if the passwords match
    if (confirmVal && pass !== confirmVal) {
      confirmPasswordInput.classList.add('input-mismatch');
      mismatchErrorText.textContent = 'Passwords do not match.';
      mismatchErrorText.style.display = 'block';
      mismatchErrorText.style.textAlign = 'left';
    } else if (confirmVal && pass === confirmVal) {
      // If passwords match, remove the mismatch class and add the match class
      confirmPasswordInput.classList.add('input-match');
    }
  });

  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Password Validation Ctnd
    const pass = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (pass !== confirmPassword) {
      showToast('fail', '❎ Passwords do not match.');
      return;
    }

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const residentialAddress =
      document.getElementById('residentialAddress').value;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const stateOfOrigin = document.getElementById('stateOfOrigin').value;
    const lga = document.getElementById('lga').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const password = document.getElementById('password').value;
    const guarantorName = document.getElementById('phoneNumber').value;
    const guarantorPhoneNumber = document.getElementById(
      'guarantorPhoneNumber'
    ).value;
    const guarantorAddress = document.getElementById('guarantorAddress').value;

    const adminDetails = {
      businessId: Number(businessId),
      firstName,
      lastName,
      address: residentialAddress,
      dateOfBirth,
      stateOfOrigin,
      lga,
      email,
      phoneNumber,
      password,
      guarantor: {
        name: guarantorName,
        phoneNumber: guarantorPhoneNumber,
        address: guarantorAddress,
      },
      accountType: 'ADMIN',
      servicePermission: 'BOTH',
    };

    console.log('📦 Admin Details:', adminDetails);

    registerAdmin(adminDetails)
      .then((data) => {
        console.log('✅ Registered successfully:', data);
        showToast('success', `✅ ${data.message}`);

        redirectWithDelay('Login Page', 'login.html', 3000);
      })
      .catch((data) => {
        console.error('❎ Failed to register:', data.message);
        showToast('fail', `❎ ${data.message}`);
      });
  });
}
