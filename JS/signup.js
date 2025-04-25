import { registerAdmin, registerBusiness } from './apiServices/registration';
import { showToast } from './script';

// Create Business Registration Form
const createBusinessForm = document.getElementById('createBusinessForm');

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
      businessOwnerId: 67,
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
        console.log('✅ Registered successfully:', data);
      })
      .catch((err) => {
        console.error('❌ Failed to register:', err);
      });
  });
}

// Create Admin Registration Form
const signupForm = document.getElementById('signupForm');

if (signupForm) {
  // Password Validation
  document.getElementById('confirm-password').addEventListener('input', () => {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    confirmPasswordInput.addEventListener('input', () => {
      const pass = passwordInput.value;
      const confirmVal = confirmPasswordInput.value;
      const errorText = document.getElementById('password-error');

      confirmPasswordInput.classList.remove('input-match', 'input-mismatch');

      if (confirmVal && pass !== confirmVal) {
        confirmPasswordInput.classList.add('input-mismatch');
      } else if (confirmVal && pass === confirmVal) {
        confirmPasswordInput.classList.add('input-match');
      }

      if (confirmVal && pass !== confirmVal) {
        confirmPasswordInput.classList.add('input-mismatch');
        errorText.style.display = 'block';
        errorText.style.textAlign = 'left';
      } else {
        confirmPasswordInput.classList.remove('input-mismatch');
        confirmPasswordInput.classList.add('input-match');
        errorText.style.display = 'none';
      }
    });
  });

  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Password Validation Ctnd
    const pass = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (pass !== confirmPassword) {
      showToast('fail', '❌ Passwords do not match.');
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
      firstName,
      lastName,
      residentialAddress,
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
      })
      .catch((err) => {
        console.error('❌ Failed to register:', err);
      });
  });
}
