import config from '../../../config.js';
import { closeModal, showToast } from '../../script.js';
import { populateStaffTable } from '../../staff.js';
import { fetchBusinessDetails } from '../business/businessResource.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

const params = new URLSearchParams(window.location.search);
const shopId = params.get('shopId');
const from = params.get('from');

export async function createStaff(staffDetails) {
  try {
    console.log('Sending POST request...');

    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffDetails),
    });

    console.log('Response received...');
    const data = await response.json();

    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      throw new Error(data.message || 'Something went wrong');
    }

    console.log('Staff created successfully:', data);
    showToast('success', `✅ ${data.message}`);
    checkAndPromptCreateStaff(); // Refresh the Staff list after creation

    return data;
  } catch (error) {
    console.error('Error creating Admin:', error);
    throw error;
  }
}

// The functions below are used to check if the user has a Staff and prompt them to creat one if they don't - checkAndPromptCreateStaff, openCreateStaffModal, setupCreateStaffForm, and setupModalCloseButtons

export async function checkAndPromptCreateStaff() {
  function showLoadingRow() {
    const tbody = document.querySelector('.staff-table tbody');
    if (tbody)
      tbody.innerHTML = `
   <tr class="loading-row">
     <td colspan="6" class="table-error-text">Loading Staff...</td>
   </tr>
 `;
  }

  showLoadingRow();

  try {
    const response = await fetch(`${baseUrl}/api/users?page=1&limit=10`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();
    console.log(data);

    const allStaffs = data.data.users;

    const businessStaffIsAdmin = data.data.users.filter(
      (staff) => staff.accountType === 'ADMIN'
    );
    const isStaffProfilePage = window.location.href.includes('staff-profile');

    // Show modal if:
    // (1) Only ADMIN exists, and we're on the staff-profile page
    // (2) Redirected from shop creation
    if (
      (allStaffs.length === 1 && businessStaffIsAdmin && isStaffProfilePage) ||
      (from === 'shop-creation' && isStaffProfilePage)
    ) {
      openCreateStaffModal();
    }

    // Populate the table with all business staff
    populateStaffTable(allStaffs);

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('Error checking Staff:', error.message);
    throw error;
  }
}

export function openCreateStaffModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const createStaffContainer = document.querySelector('.addUser');

  if (createStaffContainer) createStaffContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function setupCreateStaffForm() {
  const form = document.querySelector('.createStaffModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const businessData = await fetchBusinessDetails();
      const businessId = businessData.data.id;
      const businessType = businessData.data.business_type;

      console.log('Form triggered');

      // Password Validation start
      // Wait for input in the password and confirm password fields
      document.getElementById('staffPassword').addEventListener('input', () => {
        const passwordInput = document.getElementById('staffPassword');
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

      document
        .getElementById('staffConfirmPassword')
        .addEventListener('input', () => {
          const passwordInput = document.getElementById('staffPassword');
          const confirmPasswordInput = document.getElementById(
            'staffConfirmPassword'
          );
          const pass = passwordInput.value;
          const confirmVal = confirmPasswordInput.value;

          const mismatchErrorText =
            document.getElementById('password-mismatch');

          // Reset mismatch error text and input styling
          confirmPasswordInput.classList.remove(
            'input-match',
            'input-mismatch'
          );
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

      // Password Validation Ctnd
      const pass = document.getElementById('staffPassword').value;
      const confirmPassword = document.getElementById(
        'staffConfirmPassword'
      ).value;

      if (pass !== confirmPassword) {
        showToast('fail', '❎ Passwords do not match.');
        return;
      }

      // Password Validation end

      const staffLastName = document.getElementById('staffLastName').value;
      const staffFirstName = document.getElementById('staffFirstName').value;
      const staffAddress = document.getElementById('staffAddress').value;
      const dateOfBirth = document.getElementById('dateOfBirth').value;
      const staffStateOfOrigin =
        document.getElementById('staffStateOfOrigin').value;
      const staffLga = document.getElementById('staffLga').value;
      const staffEmail = document.getElementById('staffEmail').value;
      const staffPhoneNumber =
        document.getElementById('staffPhoneNumber').value;
      const staffPassword = document.getElementById('staffPassword').value;
      const staffGuarantorName =
        document.getElementById('staffGuarantorName').value;
      const staffGuarantorPhoneNumber = document.getElementById(
        'staffGuarantorPhoneNumber'
      ).value;
      const staffGuarantorAddress = document.getElementById(
        'staffGuarantorAddress'
      ).value;

      //  Access type checkboxes
      const accessTypeCheckboxes = document.querySelectorAll(
        'input[name="accessType"]:checked'
      );
      const accessType = Array.from(accessTypeCheckboxes).map((cb) => cb.value);
      const accessTypeValue = accessType[0] || null;

      const accessTimeStart = document.getElementById('start-time').value;
      const accessTimeEnd = document.getElementById('end-time').value;

      const staffDetails = {
        businessId: Number(businessId),
        firstName: staffFirstName,
        lastName: staffLastName,
        address: staffAddress,
        dateOfBirth,
        stateOfOrigin: staffStateOfOrigin,
        lga: staffLga,
        email: staffEmail,
        phoneNumber: staffPhoneNumber,
        password: staffPassword,
        guarantor: {
          name: staffGuarantorName,
          phoneNumber: staffGuarantorPhoneNumber,
          address: staffGuarantorAddress,
        },
        accountType: 'STAFF',
        accessTimeStart,
        accessTimeEnd,
        servicePermission: accessTypeValue,
      };

      console.log('📦 Staff Details:', staffDetails);

      if (!dateOfBirth) {
        alert('Date of Birth is required.');
        return; // Prevent form submission
      }

      try {
        createStaff(staffDetails)
          .then((data) => {
            console.log('✅ Registered Staff successfully:', data);
            showToast('success', `✅ ${data.message}`);
            closeModal();
          })
          .catch((data) => {
            console.error('❎ Failed to register:', data.message);
            showToast('fail', `❎ ${data.message}`);
          });
      } catch (err) {
        console.error('Error creating shop:', err.message);
      }
    });
  }
}

export function setupModalCloseButtons() {
  const closeModalButtons = document.querySelectorAll('.closeModal');
  const createStaffContainer = document.querySelector('.createStaff');
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');

  closeModalButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (createStaffContainer) createStaffContainer.classList.remove('active');
      if (main) main.classList.remove('blur');
      if (sidebar) sidebar.classList.remove('blur');
    });
  });
}

export async function deleteUser(user_id) {
  try {
    console.log('Sending POST request...');

    const response = await fetch(`${baseUrl}/api/users/${user_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    console.log('Staff deleted successfully:', data);
    showToast('success', `✅ ${data.message}`);
    checkAndPromptCreateStaff(); // Refresh list or update UI

    return data;
  } catch (error) {
    console.error('Error deleting Staff', error);
    showToast('error', '❌ Failed to delete staff');
    throw error;
  }
}
