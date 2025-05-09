import config from '../config';
import { fetchBusinessDetails } from './apiServices/business/businessResource';
import { checkAndPromptCreateShop } from './apiServices/shop/shopResource';
import {
  assignStaffToShop,
  assignUserToShop,
  checkAndPromptCreateStaff,
  createStaff,
  deleteUser,
  fetchStaffDetail,
  openCreateStaffModal,
  openManageStaffModal,
  openUpdateStaffModal,
  removeStaffFromShop,
  setupCreateStaffForm,
  updateUser,
} from './apiServices/user/userResource';
import { safeFetch } from './apiServices/utility/safeFetch';
import { closeModal, showToast } from './script';

const userData = config.userData;
const baseUrl = config.baseUrl;

let userShops = [];
let enrichedShopData = [];
let businessId = null;

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await checkAndPromptCreateShop();

    // Assign to outer variables
    userShops = data.userShops;
    enrichedShopData = data.enrichedShopData;
    businessId = data.businessId;

    if (!userShops) {
      console.warn('⚠️ No businessId found — skipping fetchBusinessDetails.');
      return;
    }

    //  console.log('Shops loaded:', userShops);
    //  console.log('enrichedShopData loaded:', enrichedShopData);

    // ✅ Now that data is available, call populateStaffTable here
    //  populateStaffTable();

    // Now you can safely call functions below that depend on them
  } catch (err) {
    if (!userShops) {
      console.warn('⚠️ No businessId found — skipping fetchBusinessDetails.');
      return;
    }
    console.warn('Failed to load shop data:', err.message);
  }
});

export function populateStaffTable(staffData = [], enrichedShopData = []) {
  const tbody = document.querySelector('.staff-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  //   console.log('staffData loaded:', staffData);
  //   console.log('enrichedShopData loaded:', enrichedShopData);

  // Remove static rows and loading

  let staffShopName = 'Unassigned';

  enrichedShopData.forEach((shop) => {
    staffData.forEach((staffData) => {
      if (shop.staff) {
        const staff = shop.staff.find(
          (staffMember) => staffMember.id === staffData.id
        );
        if (staff) {
          staffShopName = `${shop.shop_name}`;
          staffData.shop_name = staffShopName; // Add shop name to staff data
        }
      } else {
        staffData.shop_name = 'No Shop ID'; // Default value if no shop found
      }
    });
  });

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
    //  console.log(staff);
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    if (row && staff.accountType === 'STAFF') {
      row.innerHTML = `
        <td class="py-1 staffSerialNumber">${index + 1}</td>
        <td class="py-1 staffName">${staff.firstName} ${staff.lastName}</td>
        <td class="py-1 staffPhoneNumber">${staff.phoneNumber}</td>
        <td class="py-1 staffEmail">${staff.email}
          </td>
        <td class="py-1 staffAccountType">${staff.accountType}</td>
        <td class="py-1 staffServicePermission">${staff.servicePermission}</td>
        <td class="py-1 staffshop">${staff.shop_name || 'No Shop ID'}</td>
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
            <button class="hero-btn-outline manageShopButton" data-staff-id="${
              staff.id
            }">
          <i class="fa-solid fa-shop"></i> <!-- Shop manage icon -->
        </button>
        </td>
      `;
    } else {
      row.innerHTML = `
    <td class="py-1 staffSerialNumber">${index + 1}</td>
    <td class="py-1 staffName">${staff.firstName} ${staff.lastName}</td>
    <td class="py-1 staffPhoneNumber">${staff.phoneNumber}</td>
    <td class="py-1 staffEmail">${staff.email}
      </td>
    <td class="py-1 staffAccountType">${staff.accountType}</td>
    <td class="py-1 staffServicePermission">${staff.servicePermission}</td>
       <td class="py-1 staffshop">ADMIN</td>
    <td class="py-1 action-buttons">
      <button class="hero-btn-outline editStaffButton" disabled data-staff-id="${
        staff.id
      }">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button class="hero-btn-outline deleteStaffButton" disabled data-staff-id="${
        staff.id
      }">
        <i class="fa-solid fa-trash-can"></i>
      </button>
        <button class="hero-btn-outline manageShopButton" disabled data-staff-id="${
          staff.id
        }">
          <i class="fa-solid fa-shop"></i> <!-- Shop manage icon -->
        </button>
    </td>
  `;
    }

    if (tbody) tbody.appendChild(row);

    const deleteBtn = row.querySelector('.deleteStaffButton');
    deleteBtn.addEventListener('click', async () => {
      const staffId = deleteBtn.dataset.staffId;
      await deleteUser(staffId);
    });

    const updateStaffBtn = row.querySelector('.editStaffButton');
    updateStaffBtn?.addEventListener('click', async () => {
      const staffId = updateStaffBtn.dataset.staffId;

      const adminUpdateUserDataContainer = document.querySelector(
        '.adminUpdateUserData'
      );

      if (adminUpdateUserDataContainer) {
        // Store staffId in modal container for reference
        adminUpdateUserDataContainer.dataset.staffId = staffId;

        // Fetch staff detail
        const staffDetail = await fetchStaffDetail(staffId);

        // Call function to prefill modal inputs
        if (staffDetail?.data?.user) {
          openUpdateStaffModal(); // Show modal after data is ready
          setupUpdateStaffForm(staffDetail.data.user);
        } else {
          showToast('fail', '❌ Failed to fetch staff details.');
        }
      }
    });

    const manageStaffBtn = row.querySelector('.manageShopButton');
    manageStaffBtn?.addEventListener('click', async () => {
      const staffId = manageStaffBtn.dataset.staffId;

      const staffManageContainer = document.querySelector('.staffManage');

      if (staffManageContainer) {
        // Store staffId in modal container for reference
        staffManageContainer.dataset.staffId = staffId;

        // Fetch staff detail
        const staffDetail = await fetchStaffDetail(staffId);

        //   console.log(staffDetail.data.user);

        // Call function to prefill modal inputs
        if (staffDetail?.data?.user) {
          openManageStaffModal(); // Show modal after data is ready
          setupManageStaffForm(staffDetail.data.user);
        } else {
          showToast('fail', '❌ Failed to fetch staff details.');
        }
      }
    });
  });
}

export function populateShopDropdown(shopList = [], preselectedShopId = '') {
  //   console.log('shopList', shopList);
  const dropdown = document.getElementById('shopDropdown');
  const staffManageShopDropdown = document.getElementById(
    'staffManageShopDropdown'
  );
  if (!dropdown || !staffManageShopDropdown) return;

  dropdown.addEventListener('change', function () {
    const selectedShopId = dropdown.value;
    //  console.log('Selected shop ID:', selectedShopId);
    // Perform any action you want with the selected shop ID
    // already using another method already but i am still keeping this here.
  });

  // Clear existing options except the default
  dropdown.innerHTML = `<option value="">Select a shop</option>`;
  staffManageShopDropdown.innerHTML = `<option value="">Select a shop</option>`;

  shopList.forEach((shop) => {
    const option1 = document.createElement('option');
    option1.value = shop.id;
    option1.textContent = `${shop.shop_name} - ${shop.location}`;
    if (shop.id === preselectedShopId) option1.selected = true;
    if (dropdown) dropdown.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = shop.id;
    option2.textContent = `${shop.shop_name} - ${shop.location}`;
    if (shop.id === preselectedShopId) option2.selected = true;
    if (staffManageShopDropdown) staffManageShopDropdown.appendChild(option2);
  });

  //   shopList.forEach((shop) => {
  //     const option = document.createElement('option');
  //     option.value = shop.id;
  //     option.textContent = `${shop.shop_name} - ${shop.location}`; // or `${shop.shop_name} - ${shop.location}` if you want more details

  //     if (shop.id === preselectedShopId) {
  //       option.selected = true;
  //     }

  //     if (dropdown) dropdown.appendChild(option);
  //     if (staffManageShopDropdown) staffManageShopDropdown.appendChild(option);
  //   });
}

export function setupUpdateStaffForm(user) {
  const form = document.querySelector('.adminUpdateUserDataModal');

  //   console.log('Clicked user data passed to this function', user);

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  document.getElementById('updateStaffFirstName').value = user.firstName || '';
  document.getElementById('updateStaffLastName').value = user.lastName || '';
  document.getElementById('updateStaffPhoneNumber').value =
    user.phoneNumber || '';
  document.getElementById('updateStaffAddress').value = user.address || '';

  const updateAccessTypeCheckboxes = document.querySelectorAll(
    'input[name="updateStaffAccessType"]'
  );

  if (updateAccessTypeCheckboxes)
    updateAccessTypeCheckboxes.forEach(
      (checkbox) => (checkbox.checked = false)
    );

  // Match and check the appropriate checkbox
  const serviceType = user.servicePermission;
  const matchedCheckbox = [...updateAccessTypeCheckboxes].find(
    (checkbox) => checkbox.value === serviceType
  );
  if (matchedCheckbox) matchedCheckbox.checked = true;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const updateStaffLastName = document.getElementById(
        'updateStaffLastName'
      ).value;
      const updateStaffFirstName = document.getElementById(
        'updateStaffFirstName'
      ).value;
      const updateStaffAddress =
        document.getElementById('updateStaffAddress').value;
      const updateStaffPhoneNumber = document.getElementById(
        'updateStaffPhoneNumber'
      ).value;

      //  Access type checkboxes
      const updateAccessTypeCheckboxes = document.querySelectorAll(
        'input[name="updateStaffAccessType"]:checked'
      );
      const updateAccessType = Array.from(updateAccessTypeCheckboxes).map(
        (cb) => cb.value
      );
      const updateAccessTypeValue = updateAccessType[0] || null;

      const updateAccessTimeStart =
        document.getElementById('update-start-time').value;
      const updateAccessTimeEnd =
        document.getElementById('update-end-time').value;

      const staffUpdatedDetails = {
        firstName: updateStaffFirstName,
        lastName: updateStaffLastName,
        address: updateStaffAddress,
        phoneNumber: updateStaffPhoneNumber,
        accountType: 'STAFF',
        accessTimeStart: updateAccessTimeStart,
        accessTimeEnd: updateAccessTimeEnd,
        servicePermission: updateAccessTypeValue,
      };

      // console.log('📦 Staff New Details:', staffUpdatedDetails);

      try {
        const data = await updateUser(user.id, staffUpdatedDetails);

        if (data) {
          closeModal();
        }

        //   if (!data || !data.data || !data.data.user) {
        //     //  showToast('fail', `❎ Failed to register staff.`);
        //     return;
        //   }
      } catch (err) {
        // err.message will contain the "Email already in use"
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export async function setupManageStaffForm(user) {
  const form = document.querySelector('.staffManage');
  if (!form) return;

  const nameElem = document.getElementById('staffManage-name');
  const currentAssignedShop = document.getElementById('currentAssignedShop');

  if (nameElem) nameElem.innerText = 'Loading...';
  if (currentAssignedShop) currentAssignedShop.innerText = 'Loading shop...';

  // ✅ Refetch latest data
  try {
    const data = await checkAndPromptCreateShop();
    enrichedShopData = data.enrichedShopData;
    userShops = data.userShops;
    businessId = data.businessId;
  } catch (err) {
    console.error('Failed to refresh data in modal:', err.message);
    showToast('fail', '❎ Failed to refresh staff-shop data.');
    return;
  }

  // Always set staff ID and update name
  form.dataset.staffId = user.id;

  document.getElementById('staffManage-name').innerText =
    ` ${user.firstName} ${user.lastName}` || '';

  //   const currentShop = enrichedShopData.find(
  //     (shop) => shop.id === shop.staff.shopId && user.id === shop.staff.id
  //   );

  // Find current assigned shop
  const currentShop = enrichedShopData.find((shop) =>
    shop.staff.some(
      (staffMember) =>
        staffMember.id === user.id && staffMember.shopId === shop.id
    )
  );

  if (currentAssignedShop) {
    currentAssignedShop.innerText = currentShop
      ? `${currentShop.shop_name} - ${currentShop.location}`
      : 'No Shop Assigned';
  }

  // Populate the shop dropdown (for reassignment)
  //   populateShopDropdown(enrichedShopData, user.shop_id);

  // Only bind event listener once
  if (form.dataset.listenerBound !== 'true') {
    form.dataset.listenerBound = 'true';
    const removeShopButton = document.getElementById('removeShopButton');
    const assignShopButton = document.getElementById('assignShopButton');

    if (removeShopButton) {
      removeShopButton.addEventListener('click', async function (e) {
        e.preventDefault();

        const staffId = form.dataset.staffId;
        const userId = parseInt(staffId);

        const currentShop = enrichedShopData.find((shop) =>
          shop.staff.some(
            (staffMember) =>
              staffMember.id === userId && staffMember.shopId === shop.id
          )
        );

        console.log('userId =', userId, 'shopId =', currentShop?.id);

        try {
          const data = await removeStaffFromShop(userId, currentShop?.id);
          if (data) {
            closeModal();
          }
        } catch (err) {
          // err.message will contain the "Email already in use"
          showToast('fail', `❎ ${err.message}`);
        }

        return;
      });
    }

    if (assignShopButton) {
      assignShopButton.addEventListener('click', async function (e) {
        e.preventDefault();

        const staffId = form.dataset.staffId;
        const userId = parseInt(staffId);

        const selectedShopId = document.querySelector(
          '#staffManageShopDropdown'
        ).value;

        const staffDetailsForAssigningShop = {
          shopId: selectedShopId,
        };

        console.log(
          '📦 Staff Store Details:',
          staffDetailsForAssigningShop,
          'userId',
          userId
        );

        // Find the user's current shop (if any)
        const currentShop = enrichedShopData.find((shop) =>
          shop.staff.some(
            (staffMember) =>
              staffMember.id === userId && staffMember.shopId === shop.id
          )
        );

        // 💡 1. If user is already in the selected shop
        if (currentShop && currentShop.id == selectedShopId) {
          showToast('info', 'ℹ️ User is already assigned to this shop.');
          return;
        }

        console.log('userId =', userId, 'shopId =', selectedShopId);
        try {
          if (currentShop) {
            await removeStaffFromShop(staffId, currentShop.id);
          }

          const data = await assignUserToShop(
            userId,
            staffDetailsForAssigningShop
          );
          if (data) {
            closeModal();
          }

          //  const data = await assignStaffToShop(userId, shopId);
          //  if (data) {
          //    closeModal();
          //  }
          //   if (!data || !data.data || !data.data.user) {
          //     //  showToast('fail', `❎ Failed to register staff.`);
          //     return;
          //   }
        } catch (err) {
          // err.message will contain the "Email already in use"
          showToast('fail', `❎ ${err.message}`);
        }

        return;
      });
    }
  }
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
// document.addEventListener('DOMContentLoaded', function () {
//   const addButton = document.querySelector('.add-user');
//   const addUserContainer = document.querySelector('.addUser');

//   if (addButton) {
//     addButton.addEventListener('click', function () {
//       addUserContainer.classList.add('active');
//       main.classList.add('blur');
//       sidebar.classList.add('blur');
//       main.classList.add('no-scroll');
//     });
//   }
// });
