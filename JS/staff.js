import config from '../config';
import { fetchBusinessDetails } from './apiServices/business/businessResource';
import { setupModalCloseButtons } from './apiServices/shop/shopResource';
import {
  checkAndPromptCreateStaff,
  createStaff,
  deleteUser,
  openCreateStaffModal,
  setupCreateStaffForm,
} from './apiServices/user/userResource';
import { closeModal, showToast } from './script';

const userData = config.userData;

export function populateStaffTable(staffData = []) {
  const tbody = document.querySelector('.staff-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  // Remove static rows and loading

  if (tbody) tbody.innerHTML = '';

  if (!staffData.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="6" class="table-error-text">No Staff found.</td>
      `;
    if (tbody) tbody.appendChild(emptyRow);
    return;
  }

  staffData.forEach((staff, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    if (row)
      row.innerHTML = `
        <td class="py-1 staffSerialNumber">${index + 1}</td>
        <td class="py-1 staffName">${staff.firstName} ${staff.lastName}</td>
        <td class="py-1 staffPhoneNumber">${staff.phoneNumber}</td>
        <td class="py-1 staffGuarantorName">${
          //  staff.guarantor.name ? staff.guarantor.name : '—'
          '-'
        }</td>
        <td class="py-1 staffGuarantorPhoneNumber">${
          //  staff.guarantor.phoneNumber ? staff.guarantor.phoneNumber : '—'
          '-'
        }</td>
        <td class="py-1 action-buttons">
          <button class="hero-btn-outline editStaffButton" data-staff-id="${
            staff.id
          }">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="hero-btn-outline deleteStaffButton" data-staff-id="${
            staff.id
          }">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

    if (tbody) tbody.appendChild(row);

    const deleteBtn = row.querySelector('.deleteStaffButton');
    deleteBtn.addEventListener('click', async () => {
      const staffId = deleteBtn.dataset.staffId;
      await deleteUser(staffId);
    });
  });
}

export function populateShopDropdown(shopList = [], preselectedShopId = '') {
  const dropdown = document.getElementById('shopDropdown');
  if (!dropdown) return;

  // Clear existing options except the default
  dropdown.innerHTML = `<option value="">Select a shop</option>`;

  shopList.forEach((shop) => {
    const option = document.createElement('option');
    option.value = shop.id;
    option.textContent = `${shop.shop_name} - ${shop.location}`; // or `${shop.shop_name} - ${shop.location}` if you want more details

    if (shop.id === preselectedShopId) {
      option.selected = true;
    }

    dropdown.appendChild(option);
  });
}

// JS to Check and prompt cretae Staff
// document.addEventListener('DOMContentLoaded', () => {
//   setupCreateStaffForm();
//   setupModalCloseButtons();
//   document
//     .querySelector('#openStaffModalBtn')
//     ?.addEventListener('click', openCreateStaffModal);

//   if (userData) {
//     checkAndPromptCreateStaff();
//   }
// });

// // Create Staff Registration Form
// const createStaffModal = document.getElementById('createStaffModal');

// if (createStaffModal) {
//   console.log('Form triggered');
//   // Password Validation
//   // Wait for input in the password and confirm password fields
//   document.getElementById('staffPassword').addEventListener('input', () => {
//     const passwordInput = document.getElementById('staffPassword');
//     const pass = passwordInput.value;
//     const lengthErrorText = document.getElementById('password-length');

//     // Check if password is at least 6 characters long
//     if (pass.length < 6) {
//       passwordInput.classList.add('input-mismatch');
//       lengthErrorText.textContent =
//         'Password must be at least 6 characters long.';
//       lengthErrorText.style.display = 'block';
//       lengthErrorText.style.textAlign = 'left';
//     } else {
//       // Hide the length error message when password length is valid
//       passwordInput.classList.remove('input-mismatch');
//       lengthErrorText.style.display = 'none';
//     }
//   });

//   document
//     .getElementById('staffConfirmPassword')
//     .addEventListener('input', () => {
//       const passwordInput = document.getElementById('staffPassword');
//       const confirmPasswordInput = document.getElementById(
//         'staffConfirmPassword'
//       );
//       const pass = passwordInput.value;
//       const confirmVal = confirmPasswordInput.value;

//       const mismatchErrorText = document.getElementById('password-mismatch');

//       // Reset mismatch error text and input styling
//       confirmPasswordInput.classList.remove('input-match', 'input-mismatch');
//       mismatchErrorText.style.display = 'none';

//       // If password length is sufficient, check if the passwords match
//       if (confirmVal && pass !== confirmVal) {
//         confirmPasswordInput.classList.add('input-mismatch');
//         mismatchErrorText.textContent = 'Passwords do not match.';
//         mismatchErrorText.style.display = 'block';
//         mismatchErrorText.style.textAlign = 'left';
//       } else if (confirmVal && pass === confirmVal) {
//         // If passwords match, remove the mismatch class and add the match class
//         confirmPasswordInput.classList.add('input-match');
//       }
//     });

//   const businessData = await fetchBusinessDetails();
//   const businessId = businessData.data.id;
//   const businessType = businessData.data.business_type;

//   createStaffModal.addEventListener('submit', function (e) {
//     e.preventDefault();

//     // Password Validation Ctnd
//     const pass = document.getElementById('staffPassword').value;
//     const confirmPassword = document.getElementById(
//       'staffConfirmPassword'
//     ).value;

//     if (pass !== confirmPassword) {
//       showToast('fail', '❎ Passwords do not match.');
//       return;
//     }

//     const staffLastName = document.getElementById('staffLastName').value;
//     const staffFirstName = document.getElementById('staffFirstName').value;
//     const staffAddress = document.getElementById('staffAddress').value;
//     const dateOfBirth = document.getElementById('dateOfBirth').value;
//     const staffStateOfOrigin =
//       document.getElementById('staffStateOfOrigin').value;
//     const staffLga = document.getElementById('staffLga').value;
//     const staffEmail = document.getElementById('staffEmail').value;
//     const staffPhoneNumber = document.getElementById('staffPhoneNumber').value;
//     const staffPassword = document.getElementById('staffPassword').value;
//     const staffGuarantorName =
//       document.getElementById('staffGuarantorName').value;
//     const staffGuarantorPhoneNumber = document.getElementById(
//       'staffGuarantorPhoneNumber'
//     ).value;
//     const staffGuarantorAddress = document.getElementById(
//       'staffGuarantorAddress'
//     ).value;

//     //  Access type checkboxes
//     const accessTypeCheckboxes = document.querySelectorAll(
//       'input[name="accessType"]:checked'
//     );
//     const accessType = Array.from(accessTypeCheckboxes).map((cb) => cb.value);
//     const accessTypeValue = accessType[0] || null;

//     const accessTimeStart = document.getElementById('start-time').value;
//     const accessTimeEnd = document.getElementById('end-time').value;

//     console.log(staffFirstName);
//     const staffDetails = {
//       businessId: Number(businessId),
//       firstName: staffFirstName,
//       lastName: staffLastName,
//       address: staffAddress,
//       dateOfBirth,
//       stateOfOrigin: staffStateOfOrigin,
//       lga: staffLga,
//       email: staffEmail,
//       phoneNumber: staffPhoneNumber,
//       password: staffPassword,
//       guarantor: {
//         name: staffGuarantorName,
//         phoneNumber: staffGuarantorPhoneNumber,
//         address: staffGuarantorAddress,
//       },
//       accountType: 'STAFF',
//       accessTimeStart,
//       accessTimeEnd,
//       servicePermission: accessTypeValue,
//     };

//     console.log('📦 Staff Details:', staffDetails);

//     if (!dateOfBirth) {
//       alert('Date of Birth is required.');
//       return; // Prevent form submission
//     }

//     createStaff(staffDetails)
//       .then((data) => {
//         console.log('✅ Registered Staff successfully:', data);
//         showToast('success', `✅ ${data.message}`);
//         closeModal();
//       })
//       .catch((data) => {
//         console.error('❎ Failed to register:', data.message);
//         showToast('fail', `❎ ${data.message}`);
//       });
//   });
// }

// JS for modal
const main = document.querySelector('.main');
const sidebar = document.querySelector('.sidebar');

const closeModalButton = document.querySelectorAll('.closeModal');
const closeImageModalBtn = document.querySelectorAll('.closeImageModal');

closeModalButton.forEach((closeButton) => {
  closeButton.addEventListener('click', function () {
    closeModal();
  });
});

// JS for Modal
document.addEventListener('DOMContentLoaded', function () {
  const addButton = document.querySelector('.add-user');
  const addUserContainer = document.querySelector('.addUser');

  if (addButton) {
    addButton.addEventListener('click', function () {
      addUserContainer.classList.add('active');
      main.classList.add('blur');
      sidebar.classList.add('blur');
      main.classList.add('no-scroll');
    });
  }
});
