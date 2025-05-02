import config from '../../../config.js';
import { closeModal, showToast } from '../../script.js';
import { populateStaffTable } from '../../staff.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

const params = new URLSearchParams(window.location.search);
const shopId = params.get('shopId');
const from = params.get('from');

export async function createStaff(staffDetails) {
  try {
    //  console.log('Sending POST request...');

    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffDetails),
    });

    //  console.log('Response received...');
    const data = await response.json();

    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      throw new Error(data.message || 'Something went wrong');
    }

    //  console.log('Staff created successfully:', data);
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
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    const businessStaff = data.data.users?.filter(
      (staff) => staff.business_id === parsedUserData.businessId
    );

    if (businessStaff.length === 0 || from === 'shop-creation') {
      openCreateStaffModal();
    }

    populateStaffTable(businessStaff);

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

      const shopNameInput = document.querySelector('#shopName');
      const shopAddressInput = document.querySelector('#shopAddress');

      const serviceTypeCheckboxes = document.querySelectorAll(
        'input[name="serviceType"]:checked'
      );
      const serviceType = Array.from(serviceTypeCheckboxes).map(
        (cb) => cb.value
      );
      const serviceTypeValue = serviceType[0] || null;

      const staffDetails = {
        shopName: shopNameInput.value,
        location: shopAddressInput.value,
        serviceType: serviceTypeValue,
      };

      try {
        createStaff(staffDetails)
          .then((data) => {
            closeModal();

            // Clear inputs and checkboxes
            shopNameInput.value = '';
            shopAddressInput.value = '';
            document
              .querySelectorAll('input[name="serviceType"]')
              .forEach((cb) => (cb.checked = false));
            // serviceTypeCheckboxes.forEach(
            //   (checkbox) => (checkbox.checked = false)
            // );

            //   redirectWithDelay('Homepage', 'manage.html', 500);
            // window.location.href = 'manage.html';
          })
          .catch((data) => {
            showToast('fail', `❎ ${data.message}`);
            console.error('❎ Failed to create shop:', data.message);
          });
        //   console.log('Creating shop with:', staffDetails);
        // closeModal(); // close modal after success
      } catch (err) {
        console.error('Error creating Staff:', err.message);
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
