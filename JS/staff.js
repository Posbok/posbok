import config from '../config';
import { setupModalCloseButtons } from './apiServices/shop/shopResource';
import {
  checkAndPromptCreateStaff,
  setupCreateStaffForm,
} from './apiServices/user/userResource';

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

  staffData.forEach((shop, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    if (row)
      row.innerHTML = `
        <td class="py-1 shopSerialNumber">${index + 1}</td>
        <td class="py-1 staffName">${shop.shop_name}</td>
        <td class="py-1 staffPhoneNumber">${shop.location}</td>
        <td class="py-1 staffGuarantorName">${shop.service_type}</td>
        <td class="py-1 staffGuarantorPhoneNumber">${
          shop.manager_name || '—'
        }</td>
        <td class="py-1 action-buttons">
          <button class="hero-btn-outline editShopButton" data-shop-id="${
            shop.id
          }">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="hero-btn-outline deleteShopButton" data-shop-id="${
            shop.id
          }">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

    if (tbody) tbody.appendChild(row);
  });
}

// JS to Check and prompt cretae Staff
document.addEventListener('DOMContentLoaded', () => {
  setupCreateStaffForm();
  setupModalCloseButtons();
  document
    .querySelector('#openStaffModalBtn')
    ?.addEventListener('click', openCreateStaffModal);

  if (userData) {
    checkAndPromptCreateStaff();
  }
});

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

function closeModal() {
  const addUserContainer = document.querySelector('.addUser');

  addUserContainer.classList.remove('active');

  main.classList.remove('blur');
  sidebar.classList.remove('blur');
  main.classList.remove('no-scroll');
}

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
