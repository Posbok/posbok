import './script.js';
import config from '../config';
import { fetchBusinessDetails } from './apiServices/business/businessResource';
import {
  checkAndPromptCreateShop,
  openDeleteShopModal,
} from './apiServices/shop/shopResource';
import {
  assignStaffToShop,
  assignUserToShop,
  checkAndPromptCreateStaff,
  createStaff,
  deleteUser,
  fetchStaffDetail,
  openCreateStaffModal,
  openDeleteStaffModal,
  openManageStaffModal,
  openUpdateStaffModal,
  removeStaffFromShop,
  updateUser,
} from './apiServices/user/userResource';
import { safeFetch } from './apiServices/utility/safeFetch';
import {
  clearFormInputs,
  formatServicePermission,
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { closeModal, showToast } from './script';
import { hasService, loadUserServices } from './subscription.js';

const userData = config.userData;
const baseUrl = config.baseUrl;
const parsedUserData = userData ? JSON.parse(userData) : null;
const servicePermission = parsedUserData?.servicePermission;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';

let userShops = [];
let enrichedShopData = [];
let businessId = null;

if (userData) {
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const data = await checkAndPromptCreateShop();

      // Assign to outer variables
      userShops = data?.userShops;
      enrichedShopData = data?.enrichedShopData;
      businessId = data?.businessId;

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
}

// const businessData = await fetchBusinessDetails();
// console.log(businessData);

export async function setupCreateStaffForm() {
  const form = document.querySelector('.createStaffModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  const businessServices = await loadUserServices();
  const services = businessServices.map((s) => s.service_code);

  console.log('services', services);

  const hasInventory = hasService('INVENTORY');
  const hasEcommerce = hasService('ECOMMERCE');
  const hasWarehouse = hasService('WAREHOUSE');
  const hasPos = hasService('POS');

  // 👇 Run once when modal opens to control which access types can be selected
  (async function applyAccessControlBasedOnBusinessPermission() {
    try {
      console.log('Inventory:', hasInventory, 'Ecommerce:', hasEcommerce);

      // if (!hasInventory && !hasEcommerce) {
      //   return;
      // }

      // const businessData = await fetchBusinessDetails();
      // const businessPermission = businessData.data.business_type;

      // Get radio buttons
      const posRadio = document.getElementById('staffPosCheckbox');
      const inventoryRadio = document.getElementById('staffInventoryCheckbox');
      const ecommerceRadio = document.getElementById('staffStorefrontCheckbox');
      const warehouseRadio = document.getElementById('staffWarehouseCheckbox');

      // Enable all first
      // Enable all first
      [posRadio, inventoryRadio, ecommerceRadio, warehouseRadio].forEach(
        (el) => {
          el.disabled = false;
        },
      );

      // Disable based on subscription
      if (!hasPos) posRadio.disabled = true;
      if (!hasInventory) inventoryRadio.disabled = true;
      if (!hasWarehouse) warehouseRadio.disabled = true;
      if (!hasEcommerce) ecommerceRadio.disabled = true;

      const accessTypeCheckboxes = document.querySelectorAll(
        'input[name="staffAccessType"]',
      );

      accessTypeCheckboxes.forEach((checkbox) => {
        const val = checkbox.value; // e.g., "STOREFRONT"

        let isAllowed = services.includes(val);

        // Manual Mapping: If this is the Storefront checkbox,
        // allow it if the user has the 'ECOMMERCE' service code.
        if (val === 'STOREFRONT' && services.includes('ECOMMERCE')) {
          isAllowed = true;
        }

        checkbox.disabled = !isAllowed;
      });
    } catch (err) {
      console.error('❌ Failed to load business permissions:', err);
    }
  })();

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
        'staffConfirmPassword',
      );
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

  if (form) {
    form.addEventListener('submit', async function (e) {
      showGlobalLoader();
      e.preventDefault();

      const businessData = await fetchBusinessDetails();
      const businessId = businessData.data.id;
      const businessType = businessData.data.business_type;

      // Password Validation Ctnd
      const pass = document.getElementById('staffPassword').value;
      const confirmPassword = document.getElementById(
        'staffConfirmPassword',
      ).value;

      if (pass !== confirmPassword) {
        showToast('fail', '❎ Passwords do not match.');
        return;
      }
      // Password Validation end

      const shopDropdown = document.getElementById('shopDropdown').value;
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
        'staffGuarantorPhoneNumber',
      ).value;
      const staffGuarantorAddress = document.getElementById(
        'staffGuarantorAddress',
      ).value;

      //  Access type checkboxes
      const accessTypeCheckboxes = document.querySelectorAll(
        'input[name="staffAccessType"]:checked',
      );

      const accessType = Array.from(accessTypeCheckboxes).map((cb) => cb.value);
      // const accessTypeValue = accessType[0] || null;

      const accessTimeStart = document.getElementById('start-time').value;
      const accessTimeEnd = document.getElementById('end-time').value;

      const errorEl = document.getElementById('accessTypeError');

      if (accessType.length === 0) {
        showToast('fail', '❎ Please select at least one access type.');
        errorEl.textContent = 'Please select at least one access type.';
        errorEl.style.display = 'block';
        hideGlobalLoader();
        return;
      } else {
        errorEl.style.display = 'none';
      }

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
        servicePermission: accessType,
      };

      const staffAssigningDetails = { shopId: Number(shopDropdown) };

      console.log('📦 Staff Details:', staffDetails);
      console.log('📦 Shop Details:', staffAssigningDetails);

      if (!dateOfBirth) {
        alert('Date of Birth is required.');
        return; // Prevent form submission
      }

      const addUserModalBtn = document.querySelector('.addUserModalBtn');

      try {
        showGlobalLoader();
        showBtnLoader(addUserModalBtn);
        const data = await createStaff(staffDetails);
        //   if (!data || !data.data || !data.data.user) {
        //     //  showToast('fail', `❎ Failed to register staff.`);
        //     return;
        //   }
        const userId = data.data.user.id;
        try {
          const assigned = await assignUserToShop(
            userId,
            staffAssigningDetails,
          );
          showToast('success', `✅ ${assigned.message}`);
          closeModal();
          clearFormInputs();
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('from');
          setTimeout(() => {
            location.reload();
          }, 1000);
        } catch (assignErr) {
          showToast(
            'fail',
            `❎ ${assignErr.message || 'Failed to assign user'}`,
          );
        }

        //   hideGlobalLoader();
      } catch (err) {
        // err.message will contain the "Email already in use"
        showToast('fail', `❎ ${err.message}`);
      } finally {
        hideGlobalLoader();
        hideBtnLoader(addUserModalBtn);
      }
    });
  }
}

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
          (staffMember) => staffMember.id === staffData.id,
        );
        if (staff) {
          staffShopName = `${shop.shop_name}`;
          staffData.shop_name = staffShopName; // Add shop name to staff data
        }
      } else {
        staffData.shop_name = 'No Shop Assigned'; // Default value if no shop found
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

    // Find the smallest ID in the current staff list
    const staffIds = staffData.map((s) => s.id);
    const ownerId = Math.min(...staffIds);

    // Dynamic Check: Is this the person with the lowest ID?
    const isOwner = staff.id === ownerId;

    //  console.log('staff', staff);

    //  if (row && staff.accountType === 'STAFF') {
    if (!isOwner) {
      row.innerHTML = `
        <td class="py-1 staffSerialNumber">${index + 1}</td>
        <td class="py-1 staffName">${staff.firstName} ${staff.lastName}</td>
        <td class="py-1 staffPhoneNumber">${staff.phoneNumber}</td>
        <td class="py-1 staffEmail">${staff.email}
          </td>
        <td class="py-1 staffAccountType">${staff.accountType}</td>
        <td class="py-1 staffServicePermission"> ${staff.servicePermission
          .map((service) => formatServicePermission(service))
          .join(', ')}</td>
        <td class="py-1 staffshop">${staff.shop_name || 'No Shop Assigned'}</td>
        <td class="py-1 action-buttons">
          <button class="hero-btn-outline editStaffButton" data-staff-id="${
            staff.id
          }"  title="Update Staff Details">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="hero-btn-outline deleteStaffButtonModal" data-staff-id="${
            staff.id
          }"  title="Delete Staff">
            <i class="fa-solid fa-trash-can"></i>
          </button>
            <button class="hero-btn-outline manageShopButton" data-staff-id="${
              staff.id
            }"  title="Assign or managing staff's shop assignment">
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

     <td class="py-1 staffServicePermission"> ${staff.servicePermission
       .map((service) => formatServicePermission(service))
       .join(', ')}</td>

        <td class="py-1 staffshop">All Shop Access</td>
     <td class="py-1 action-buttons">
       <button class="hero-btn-outline editStaffButton" data-staff-id="${
         staff.id
       }">
         <i class="fa-solid fa-pen-to-square"></i>
       </button>
       </td>
       `;
      // <button class="hero-btn-outline adminDeleteStaffButtonModal" data-staff-id="${
      //   staff.id
      // }">
      //   <i class="fa-solid fa-trash-can"></i>
      // </button>
      //   <button class="hero-btn-outline manageShopButton" data-staff-id="${
      //     staff.id
      //   }">
      //     <i class="fa-solid fa-shop"></i> <!-- Shop manage icon -->
      //   </button>
    }

    if (tbody) tbody.appendChild(row);

    const deleteBtnModal =
      staff.accountType === 'STAFF'
        ? row.querySelector('.deleteStaffButtonModal')
        : row.querySelector('.adminDeleteStaffButtonModal');

    //  console.log(deleteBtnModal);

    if (deleteBtnModal) {
      deleteBtnModal.addEventListener('click', async () => {
        showGlobalLoader();
        const staffId = deleteBtnModal.dataset.staffId;

        const deleteStaffContainer = document.querySelector(
          '.deleteStaffContainer',
        );

        if (deleteStaffContainer) {
          // Store staffId in modal container for reference
          deleteStaffContainer.dataset.staffId = staffId;

          // Fetch Staff detail
          const staffDetail = await fetchStaffDetail(staffId);

          //   console.log('staffDetail', staffDetail);

          // Call function to prefill modal inputs
          if (staffDetail?.data) {
            hideGlobalLoader();
            openDeleteStaffModal(); // Show modal after data is ready
            deleteStaffForm(staffDetail.data);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch Staff details.');
          }
        }
      });
    }

    const updateStaffBtn = row.querySelector('.editStaffButton');

    if (updateStaffBtn) {
      updateStaffBtn?.addEventListener('click', async () => {
        console.log('Clicked');
        showGlobalLoader();
        const staffId = updateStaffBtn.dataset.staffId;

        const adminUpdateUserDataContainer = document.querySelector(
          '.adminUpdateUserData',
        );

        if (adminUpdateUserDataContainer) {
          // Store staffId in modal container for reference
          adminUpdateUserDataContainer.dataset.staffId = staffId;

          // Fetch staff detail
          const staffDetail = await fetchStaffDetail(staffId);

          // Call function to prefill modal inputs
          if (staffDetail?.data?.user) {
            hideGlobalLoader();
            openUpdateStaffModal(); // Show modal after data is ready
            setupUpdateStaffForm(staffDetail.data.user);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch staff details.');
          }
        }
      });
    }

    const manageStaffBtn = row.querySelector('.manageShopButton');
    manageStaffBtn?.addEventListener('click', async () => {
      showGlobalLoader();
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
          hideGlobalLoader();
          openManageStaffModal(); // Show modal after data is ready
          setupManageStaffForm(staffDetail.data.user);
        } else {
          hideGlobalLoader();
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
    'staffManageShopDropdown',
  );

  //   console.log('Trying direct test append');
  //   const testOption = document.createElement('option');
  //   testOption.value = 'test';
  //   testOption.textContent = 'Test Shop';
  //   inventoryShopDropdown.appendChild(testOption);

  if (!dropdown || !staffManageShopDropdown) return;

  //   console.log(dropdown);

  dropdown.addEventListener('change', function () {
    const selectedShopId = dropdown.value;
    //  console.log('Selected shop ID:', selectedShopId);
    // Perform any action you want with the selected shop ID
    // already using another method already but i am still keeping this here.
  });

  // Clear existing options except the default
  dropdown.innerHTML = `<option value="">Select a shop</option>`;
  staffManageShopDropdown.innerHTML = `<option value="">Select a shop</option>`;

  //   console.log(dropdown);

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
  //     if (inventoryShopDropdown) inventoryShopDropdown.appendChild(option);
  //   });
}

// NEW VERSION OF UPDATING STAFF INFO - OLD VERSION UNDER THIS TWO FUNCTIONS.

export function bindUpdateStaffFormListener() {
  const form = document.querySelector('.adminUpdateUserDataModal');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userId = form.dataset.userId; // ✅ Get user ID
    if (!userId) {
      showToast('fail', '❎ No user selected for update.');
      return;
    }

    const staffRoleDropdown = document.getElementById('staffRoleDropdown');

    const updateStaffLastName = document.getElementById(
      'updateStaffLastName',
    ).value;
    const updateStaffFirstName = document.getElementById(
      'updateStaffFirstName',
    ).value;
    const updateStaffAddress =
      document.getElementById('updateStaffAddress').value;
    const updateStaffPhoneNumber = document.getElementById(
      'updateStaffPhoneNumber',
    ).value;

    // 2. Access type checkboxes (Collecting as an ARRAY to match Create Staff)
    const updateAccessTypeCheckboxes = document.querySelectorAll(
      'input[name="updateStaffAccessType"]:checked',
    );

    // We keep this as an array: e.g., ["POS", "STOREFRONT"]
    const updateAccessType = Array.from(updateAccessTypeCheckboxes).map(
      (cb) => cb.value,
    );

    // 3. Validation
    if (updateAccessType.length === 0) {
      showToast('fail', '❎ Please select at least one access type.');
      hideGlobalLoader();
      hideBtnLoader(updateUserDetailSubmitBtn);
      return;
    }

    //  const updateAccessTimeStart =
    //    document.getElementById('update-start-time').value;
    //  const updateAccessTimeEnd =
    //    document.getElementById('update-end-time').value;

    const staffUpdatedDetails = {
      firstName: updateStaffFirstName,
      lastName: updateStaffLastName,
      address: updateStaffAddress,
      phoneNumber: updateStaffPhoneNumber,
      // accountType: 'STAFF',
      accountType: staffRoleDropdown.value,
      // accessTimeStart: updateAccessTimeStart,
      // accessTimeEnd: updateAccessTimeEnd,
      servicePermission: updateAccessType,
    };

    console.log('📦 Staff Update:', { userId, ...staffUpdatedDetails });

    const updateUserDetailSubmitBtn = document.querySelector(
      '.updateUserDetailSubmitBtn',
    );

    try {
      showBtnLoader(updateUserDetailSubmitBtn);
      const data = await updateUser(userId, staffUpdatedDetails);

      if (data) {
        console.log('user updated with:', data);
        hideBtnLoader(updateUserDetailSubmitBtn);
        closeModal();
      }
    } catch (err) {
      hideBtnLoader(updateUserDetailSubmitBtn);
      showToast('fail', `❎ ${err.message}`);
    }
  });
}

export async function setupUpdateStaffForm(user) {
  const form = document.querySelector('.adminUpdateUserDataModal');
  if (!form) return;

  const staffRoleDropdown = document.getElementById('staffRoleDropdown');
  const staffOption = document.getElementById('roleOptionStaff');

  const businessServices = await loadUserServices();
  const services = businessServices.map((s) => s.service_code);

  console.log('services', services);

  const hasInventory = hasService('INVENTORY');
  const hasEcommerce = hasService('ECOMMERCE');
  const hasWarehouse = hasService('WAREHOUSE');
  const hasPos = hasService('POS');

  // 👇 Run once when modal opens to control which access types can be selected
  (async function applyAccessControlBasedOnBusinessPermission() {
    try {
      console.log('Inventory:', hasInventory, 'Ecommerce:', hasEcommerce);

      // if (!hasInventory && !hasEcommerce) {
      //   return;
      // }

      // const businessData = await fetchBusinessDetails();
      // const businessPermission = businessData.data.business_type;

      // Get radio buttons
      const posRadio = document.getElementById('updateStaffPosCheckbox');
      const inventoryRadio = document.getElementById(
        'updateStaffInventoryCheckbox',
      );
      const ecommerceRadio = document.getElementById(
        'updateStaffStorefrontCheckbox',
      );
      const warehouseRadio = document.getElementById(
        'updateStaffWarehouseCheckbox',
      );

      // Enable all first
      // Enable all first
      [posRadio, inventoryRadio, ecommerceRadio, warehouseRadio].forEach(
        (el) => {
          el.disabled = false;
        },
      );

      // Disable based on subscription
      if (!hasPos) posRadio.disabled = true;
      if (!hasInventory) inventoryRadio.disabled = true;
      if (!hasWarehouse) warehouseRadio.disabled = true;
      if (!hasEcommerce) ecommerceRadio.disabled = true;
    } catch (err) {
      console.error('❌ Failed to load business permissions:', err);
    }
  })();

  // Save user.id in the form for later use
  form.dataset.userId = user.id;

  console.log(user);

  // Fill form inputs
  document.getElementById('updateStaffFirstName').value = user.firstName || '';
  document.getElementById('updateStaffLastName').value = user.lastName || '';
  document.getElementById('updateStaffPhoneNumber').value =
    user.phoneNumber || '';
  document.getElementById('updateStaffAddress').value = user.address || '';

  const updateAccessTypeCheckboxes = document.querySelectorAll(
    'input[name="updateStaffAccessType"]',
  );

  if (user.accountType === 'ADMIN') {
    // If they are currently an Admin, hide the Staff option
    // and lock the dropdown to ADMIN
    //  staffOption.style.display = 'none';
    staffRoleDropdown.value = 'ADMIN';
  } else {
    // If they are currently Staff, show both options
    staffOption.style.display = 'block';
    staffRoleDropdown.value = 'STAFF';
  }

  //   updateAccessTypeCheckboxes.forEach((checkbox) => {
  //     checkbox.disabled = !services.includes(checkbox.value);
  //     checkbox.checked = services.includes(checkbox.value);
  //   });

  const staffPermissions = user.servicePermission || []; // ['POS', 'INVENTORY']

  updateAccessTypeCheckboxes.forEach((checkbox) => {
    const val = checkbox.value; // e.g., "STOREFRONT"

    // --- LOGIC 1: ENABLE/DISABLE (Based on what the Business paid for) ---
    // Enable if business has the service OR the 'ECOMMERCE' alias
    const businessHasService =
      services.includes(val) ||
      (val === 'STOREFRONT' && services.includes('ECOMMERCE'));

    checkbox.disabled = !businessHasService;

    // --- LOGIC 2: CHECK/UNCHECK (Based on what the Staff actually has) ---
    // Check if the staff already has this permission assigned
    // We also check the 'ECOMMERCE' alias here in case the staff record has that string
    const staffHasAccess =
      staffPermissions.includes(val) ||
      (val === 'STOREFRONT' && staffPermissions.includes('ECOMMERCE'));

    checkbox.checked = staffHasAccess;
  });

  //   document.getElementById('update-start-time').value =
  //     user.accessTimeStart || '';
  //   document.getElementById('update-end-time').value = user.accessTimeEnd || '';
}

export function bindDeleteStaffFormListener() {
  const form = document.querySelector('.deleteStaffContainerModal');
  if (!form) return;

  const deleteStaffButton = form.querySelector('.deleteStaffButton');
  const cancelButton = form.querySelector('.cancel-close');

  // Avoid multiple bindings by using a flag
  if (!form.dataset.bound) {
    // Mark as bound
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    deleteStaffButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const staffId = form.dataset.staffId;
      if (!staffId) {
        showToast('fail', '❎ No staff ID found.');
        return;
      }

      try {
        showBtnLoader(deleteStaffButton);
        await deleteUser(staffId);
        hideBtnLoader(deleteStaffButton);
        closeModal();
        showToast('success', '✅ Staff deleted successfully.');
      } catch (err) {
        hideBtnLoader(deleteStaffButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function deleteStaffForm(staff) {
  const form = document.querySelector('.deleteStaffContainerModal');
  if (!form) return;

  form.dataset.staffId = staff.user.id;

  document.getElementById('confirmation-text').textContent =
    ` ${staff.user.firstName} ${staff.user.lastName}`;
}

document.addEventListener('DOMContentLoaded', () => {
  bindUpdateStaffFormListener();
  bindDeleteStaffFormListener();
});

// ⚠️ Old version retained for comparison and reuse across other modals
// Was causing multiple event triggers on repeated use

// export function setupUpdateStaffForm(user) {
//   const form = document.querySelector('.adminUpdateUserDataModal');

//   //   console.log('Clicked user data passed to this function', user);

//   if (!form || form.dataset.bound === 'true') return;

//   form.dataset.bound = 'true';

//   document.getElementById('updateStaffFirstName').value = user.firstName || '';
//   document.getElementById('updateStaffLastName').value = user.lastName || '';
//   document.getElementById('updateStaffPhoneNumber').value =
//     user.phoneNumber || '';
//   document.getElementById('updateStaffAddress').value = user.address || '';

//   const updateAccessTypeCheckboxes = document.querySelectorAll(
//     'input[name="updateStaffAccessType"]'
//   );

//   if (updateAccessTypeCheckboxes)
//     updateAccessTypeCheckboxes.forEach(
//       (checkbox) => (checkbox.checked = false)
//     );

//   // Match and check the appropriate checkbox
//   const serviceType = user.servicePermission;
//   const matchedCheckbox = [...updateAccessTypeCheckboxes].find(
//     (checkbox) => checkbox.value === serviceType
//   );
//   if (matchedCheckbox) matchedCheckbox.checked = true;

//   if (form) {
//     form.addEventListener('submit', async function (e) {
//       e.preventDefault();

//       const updateStaffLastName = document.getElementById(
//         'updateStaffLastName'
//       ).value;
//       const updateStaffFirstName = document.getElementById(
//         'updateStaffFirstName'
//       ).value;
//       const updateStaffAddress =
//         document.getElementById('updateStaffAddress').value;
//       const updateStaffPhoneNumber = document.getElementById(
//         'updateStaffPhoneNumber'
//       ).value;

//       //  Access type checkboxes
//       const updateAccessTypeCheckboxes = document.querySelectorAll(
//         'input[name="updateStaffAccessType"]:checked'
//       );
//       const updateAccessType = Array.from(updateAccessTypeCheckboxes).map(
//         (cb) => cb.value
//       );
//       const updateAccessTypeValue = updateAccessType[0] || null;

//       const updateAccessTimeStart =
//         document.getElementById('update-start-time').value;
//       const updateAccessTimeEnd =
//         document.getElementById('update-end-time').value;

//       const staffUpdatedDetails = {
//         firstName: updateStaffFirstName,
//         lastName: updateStaffLastName,
//         address: updateStaffAddress,
//         phoneNumber: updateStaffPhoneNumber,
//         accountType: 'STAFF',
//         accessTimeStart: updateAccessTimeStart,
//         accessTimeEnd: updateAccessTimeEnd,
//         servicePermission: updateAccessTypeValue,
//       };

//       console.log('📦 Staff New Details:', staffUpdatedDetails);

//       try {
//         const data = await updateUser(user.id, staffUpdatedDetails);
//         if (data) {
//           closeModal();
//         }
//         closeModal();

//         //   if (!data || !data.data || !data.data.user) {
//         //     //  showToast('fail', `❎ Failed to register staff.`);
//         //     return;
//         //   }
//       } catch (err) {
//         // err.message will contain the "Email already in use"
//         showToast('fail', `❎ ${err.message}`);
//       }
//     });
//   }
// }

export async function setupManageStaffForm(user) {
  const form = document.querySelector('.staffManage');
  if (!form) return;
  showGlobalLoader();

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
    hideGlobalLoader();
  } catch (err) {
    hideGlobalLoader();
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
        staffMember.id === user.id && staffMember.shopId === shop.id,
    ),
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
              staffMember.id === userId && staffMember.shopId === shop.id,
          ),
        );

        //   console.log('userId =', userId, 'shopId =', currentShop?.id);

        try {
          showBtnLoader(removeShopButton);
          assignShopButton.disabled = true;

          const data = await removeStaffFromShop(userId, currentShop?.id);

          if (data) {
            hideBtnLoader(removeShopButton);
            closeModal();
          }
        } catch (err) {
          hideBtnLoader(removeShopButton);
          assignShopButton.disabled = false;
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
          '#staffManageShopDropdown',
        ).value;

        const staffDetailsForAssigningShop = {
          shopId: selectedShopId,
        };

        //   console.log(
        //     '📦 Staff Store Details:',
        //     staffDetailsForAssigningShop,
        //     'userId',
        //     userId
        //   );

        // Find the user's current shop (if any)
        const currentShop = enrichedShopData.find((shop) =>
          shop.staff.some(
            (staffMember) =>
              staffMember.id === userId && staffMember.shopId === shop.id,
          ),
        );

        // 💡 1. If user is already in the selected shop
        if (currentShop && currentShop.id == selectedShopId) {
          showToast('info', 'ℹ️ User is already assigned to this shop.');
          return;
        }

        //   console.log('userId =', userId, 'shopId =', selectedShopId);

        try {
          showBtnLoader(assignShopButton);
          removeShopButton.disabled = true;

          if (currentShop) {
            await removeStaffFromShop(staffId, currentShop.id);
          }

          const data = await assignUserToShop(
            userId,
            staffDetailsForAssigningShop,
          );
          if (data) {
            hideBtnLoader(assignShopButton);
            removeShopButton.disabled = false;
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
          hideBtnLoader(assignShopButton);
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
