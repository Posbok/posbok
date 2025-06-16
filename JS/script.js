import config from '../config.js';
import flatpickr from 'flatpickr';
import './apiServices/sales/salesResources.js';
import { logoutUser } from './apiServices/login';
import {
  checkAndPromptCreateShop,
  openCreateShopModal,
  setupCreateShopForm,
} from './apiServices/shop/shopResource.js';
import { fetchBusinessDetails } from './apiServices/business/businessResource.js';
import {
  checkAndPromptCreateStaff,
  fetchProfileDetails,
  openCreateStaffModal,
  updateUserProfile,
  updateUserProfilePassword,
} from './apiServices/user/userResource.js';
import {
  clearFormInputs,
  getAmountForSubmission,
  hideBtnLoader,
  hideGlobalLoader,
  isUserLoggedIn,
  populateBusinessShopDropdown,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper.js';
import {
  addPosCapital,
  closeBusinessDay,
  getCurrentBusinessDay,
  getPosChargeSettings,
  getPosMachineFeesettings,
  openAdminCloseBusinessDayModal,
  openAdminDepositPosCapitalModal,
  openBusinessDay,
  openCloseBusinessDayModal,
  openDepositPosCapitalModal,
} from './apiServices/pos/posResources.js';
import {
  initAccountOverview,
  updateCapitalUI,
  updateCashInMachineUI,
} from './apiServices/account/accountOverview.js';
import { setupCreateStaffForm } from './staff.js';
import {
  getProductCategories,
  getProductInventory,
} from './apiServices/inventory/inventoryResources.js';

const userData = config.userData;
const dummyShopId = config.dummyShopId;

let parsedUserData = null;

parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const shopId = parsedUserData?.shopId;

// Normalize current page name from pathname
const currentPage = window.location.pathname.toLowerCase();

// Toggle the active class for sideNavs
const sideNavs = document.querySelectorAll('.side-nav_item');

sideNavs.forEach((nav) => {
  nav.addEventListener('click', () => {
    nav.classList.add('active');

    sideNavs.forEach((otherNav) => {
      if (otherNav !== nav) {
        otherNav.classList.remove('active');
      }
    });
  });
});

// Toast notification

// JavaScript to show toast

export function showToast(type, message) {
  const toast = document.getElementById('toast');

  if (!toast) {
    console.warn('⚠️ Toast element not found in DOM.');
    return;
  }

  toast.textContent = message;
  toast.className = 'toast'; // Reset classes
  toast.classList.add(type);
  toast.classList.add('show');

  // Hide after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');

    setTimeout(() => {
      toast.className = 'toast'; // Cleanup
      toast.textContent = '';
    }, 500); // Wait for transition to complete
  }, 5000);
}

//  Get & Update Profile

document.addEventListener('DOMContentLoaded', function () {
  const profileIcon = document.querySelector('.profileIconDiv');
  const profileSliderOverlay = document.querySelector(
    '.profile-slider-overlay'
  );
  const profileSlider = document.querySelector('.profile-slider-content');
  const closeProfileBtn = document.querySelector('.close-profile-btn');

  const sliderWrapper = document.querySelector('.slider-wrapper');

  //   profileIcon?.click();

  // OpenProfile Slider
  profileIcon?.addEventListener('click', async () => {
    showGlobalLoader();
    profileSlider.classList.add('open');
    profileSliderOverlay.classList.add('visible');
    sliderWrapper.style.transform = 'translateX(0%)'; // Always reset toprofile View
    renderUserprofileDetails();
    //  hideGlobalLoader();
  });

  // Close profile Slider
  closeProfileBtn?.addEventListener('click', () => {
    profileSlider?.classList.remove('open');
    profileSliderOverlay?.classList.remove('visible');
  });

  profileSliderOverlay?.addEventListener('click', () => {
    profileSlider?.classList.remove('open');
    profileSliderOverlay?.classList.remove('visible');
  });
});

export async function renderUserprofileDetails() {
  showGlobalLoader();

  const profileData = await fetchProfileDetails();

  const userData = profileData?.data?.user;

  const firstName = userData?.firstName || 'First Name Not Available';
  const lastName = userData?.lastName || 'Last Name Not Available';
  const address = userData?.address || 'Address Not Available';
  const phoneNumber = userData?.phoneNumber || 'Phone Number Not Available';
  const email = userData?.email || 'Email Not Available';
  const dateOfBirth = userData?.dateOfBirth || 'Date of Birth Not Available';
  const stateOfOrigin = userData?.stateOfOrigin || 'State Not Available';
  const lga = userData?.lga || 'LGA Not Available';
  const accountType = userData?.accountType || 'Account Type Not Available';
  const servicePermission =
    userData?.servicePermission || 'Permission Not Available';
  const businessName = userData?.businessName || 'Business Name Not Available';

  const updateProfileFormContainer = document.querySelector('#profile-form');
  const updatePasswordFormContainer = document.querySelector(
    '#updatePassword-form'
  );

  if (updateProfileFormContainer) {
    // Store userId in form container for reference
    updateProfileFormContainer.dataset.userId = userData.id;
  }

  if (updatePasswordFormContainer) {
    // Store userId in form container for reference
    updatePasswordFormContainer.dataset.userId = userData.id;
  }

  // DOM Elements
  document.getElementById('userProfileFirstName').value = firstName;
  document.getElementById('userProfileLastName').value = lastName;
  document.getElementById('userProfileAddress').value = address;
  document.getElementById('userProfilePhoneNumber').value = phoneNumber;
  document.getElementById('userProfileEmail').value = email;
  document.getElementById('userProfileDate Of Birth').value = dateOfBirth;
  document.getElementById('userProfileStateOfOrigin').value = stateOfOrigin;
  document.getElementById('userProfilelga').value = lga;
  document.getElementById('userProfileAccountType').value = accountType;
  document.getElementById('userProfileServicePermission').value =
    servicePermission === 'BOTH' ? 'POS & SALES' : servicePermission;
  document.getElementById('userProfileBusinessName').value = businessName;

  hideGlobalLoader();
  bindUpdateProfileFormListener();
  bindChangePasswordFormListener();
}

export function bindUpdateProfileFormListener() {
  const form = document.querySelector('#profile-form');
  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const userId = form.dataset.userId;

      if (!userId) {
        showToast('fail', '❎ No Profile selected for update.');
        return;
      }

      const userProfileFirstName = document.getElementById(
        'userProfileFirstName'
      ).value;
      const userProfileLastName = document.getElementById(
        'userProfileLastName'
      ).value;
      const userProfileAddress =
        document.getElementById('userProfileAddress').value;
      const userProfilePhoneNumber = document.getElementById(
        'userProfilePhoneNumber'
      ).value;

      const updateProfileDetails = {
        firstName: userProfileFirstName,
        lastName: userProfileLastName,
        address: userProfileAddress,
        phoneNumber: userProfilePhoneNumber,
      };

      // console.log(
      //   'Updating Profile Detail with:',
      //   updateProfileDetails,
      //   userId
      // );

      const updateProfileModalBtn = document.querySelector(
        '.updateProfileModalBtn'
      );

      try {
        showBtnLoader(updateProfileModalBtn);
        const updatedProfileData = await updateUserProfile(
          updateProfileDetails
        );

        //   Update LocalStorage
        const currentUser = JSON.parse(localStorage.getItem('userData'));

        const updatedUser = {
          ...currentUser,
          firstName: updatedProfileData.data.user.firstName,
          lastName: updatedProfileData.data.user.lastName,
          phoneNumber: updatedProfileData.data.user.phoneNumber,
          address: updatedProfileData.data.user.address,
        };

        localStorage.setItem('userData', JSON.stringify(updatedUser));

        // Immediately reflect name update in UI
        const userNameDisplay = document.querySelector('.user-name');

        if (userNameDisplay) {
          if (userNameDisplay)
            userNameDisplay.textContent = updatedUser.firstName;
        }

        if (!updatedProfileData) {
          console.error('fail', updatedProfileData.message);
          return;
        }

        closeModal();
        hideBtnLoader(updateProfileModalBtn);
        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(updateProfileModalBtn);

        console.error('Error Updating Profile:', err);
        showToast('fail', `❎ ${err.message}`);
        return;
      }
    });
  }
}

// Change Passeord (Profile) Logic

export function bindChangePasswordFormListener() {
  const form = document.querySelector('#updatePassword-form');
  if (!form) return;

  document.getElementById('newPassword').addEventListener('input', () => {
    const newPassword = document.getElementById('newPassword');
    const lengthError = document.getElementById('password-length');
    if (newPassword.value.length < 6) {
      lengthError.textContent = 'Password must be at least 6 characters.';
      lengthError.style.display = 'block';
    } else {
      lengthError.style.display = 'none';
    }
  });

  document
    .getElementById('confirmNewPassword')
    .addEventListener('input', () => {
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword =
        document.getElementById('confirmNewPassword').value;
      const mismatchError = document.getElementById('password-mismatch');

      if (confirmPassword && confirmPassword !== newPassword) {
        mismatchError.textContent = 'Passwords do not match.';
        mismatchError.style.display = 'block';
      } else {
        mismatchError.style.display = 'none';
      }
    });

  document.getElementById('newPassword').addEventListener('input', () => {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const samePassword = document.getElementById('same-password');

    if (current && current === newPass) {
      samePassword.textContent =
        ' New password cannot be the same as current password.';
      samePassword.style.display = 'block';
    } else {
      samePassword.style.display = 'none';
    }
  });

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const currentPassword = form
        .querySelector('#currentPassword')
        .value.trim();
      const newPassword = form.querySelector('#newPassword').value.trim();
      const confirmNewPassword = form
        .querySelector('#confirmNewPassword')
        .value.trim();

      // 🔁 FINAL VALIDATIONS
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        showToast('fail', '❎ Please fill in all password fields.');
        return;
      }

      if (newPassword.length < 6) {
        showToast('fail', '❎ New password must be at least 6 characters.');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        showToast('fail', '❎ New password and confirmation do not match.');
        return;
      }

      if (currentPassword === newPassword) {
        showToast(
          'fail',
          '❎ New password must be different from current password.'
        );
        return;
      }

      const userId = form.dataset.userId;

      if (!userId) {
        showToast('fail', '❎ No Profile selected for update.');
        return;
      }

      // Passed all checks — proceed
      const changePasswordDetails = {
        currentPassword,
        newPassword,
        confirmPassword: confirmNewPassword,
      };

      // console.log(
      //   'Changing Password Detail with:',
      //   changePasswordDetails,
      //   userId
      // );

      const updatePasswordSubmitBtn = document.querySelector(
        '.updatePasswordSubmitBtn'
      );

      try {
        showBtnLoader(updatePasswordSubmitBtn);
        const updatedProfilePasswordData = await updateUserProfilePassword(
          changePasswordDetails
        );

        if (!updatedProfilePasswordData) {
          console.error('fail', updatedProfilePasswordData.message);
          return;
        }

        closeModal();
        hideBtnLoader(updatePasswordSubmitBtn);
        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(updatePasswordSubmitBtn);

        console.error('Error Updating Profile:', err);
        showToast('fail', `❎ ${err.message}`);
        return;
      }
    });
  }
}

export function openStaffBusinessDayModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const openStaffBusinessDayContainer = document.querySelector(
    '.openStaffBusinessDay'
  );

  if (openStaffBusinessDayContainer)
    openStaffBusinessDayContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function openAdminBusinessDayModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const openAdminBusinessDayContainer = document.querySelector(
    '.openAdminBusinessDay'
  );

  if (openAdminBusinessDayContainer)
    openAdminBusinessDayContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

const adminBusinessDayContainer = document.querySelector(
  '.adminBusinessDayContainer'
);

if (isAdmin && adminBusinessDayContainer) {
  async function loadShopDropdown() {
    try {
      showGlobalLoader();
      const { enrichedShopData } = await checkAndPromptCreateShop();
      populateBusinessShopDropdown(enrichedShopData, 'businessDayShopDropdown');
      populateBusinessShopDropdown(
        enrichedShopData,
        'adminDepositposCapitalShopDropdown'
      );
      populateBusinessShopDropdown(
        enrichedShopData,
        'closeBusinessDayShopDropdown'
      );
      hideGlobalLoader();
    } catch (err) {
      hideGlobalLoader();
      console.error('Failed to load dropdown:', err.message);
    }
  }

  loadShopDropdown();
}

async function renderBusinessDayButtons() {
  const businessInitBtnDiv = document.querySelector('.businessInitBtnDiv');

  //   console.log(isStaff ? shopId : '');

  if (isStaff) {
    const businessDay = await getCurrentBusinessDay(isStaff ? shopId : '');

    //  console.log('new Business Day:', businessDay.data);

    if (!businessInitBtnDiv) return;

    businessInitBtnDiv.innerHTML = ''; // Clear current buttons

    if (
      businessDay.data === false ||
      businessDay.data === null ||
      businessDay.success === false
    ) {
      const openBusinessDayBtn = document.createElement('button');
      openBusinessDayBtn.classList.add('openBusinessDayBtn', 'businessInitBtn');
      openBusinessDayBtn.id = 'openBusinessDayBtn';
      openBusinessDayBtn.innerText = 'Open Business Day';
      businessInitBtnDiv.appendChild(openBusinessDayBtn);

      document
        .querySelector('#openBusinessDayBtn')
        ?.addEventListener('click', openStaffBusinessDayModal);

      openStaffBusinessDayModal();
    } else if (businessDay.success === null) {
      // fallback
      businessInitBtnDiv.innerHTML = `
    <p class="text-danger">⚠️ Failed to fetch business day status. Please refresh or try again later.</p>
  `;
    } else {
      businessInitBtnDiv.innerHTML = `
      <button class="hero-btn-danger closeBusinessDayModal mb-0" id="closeBusinessDayModal">Close Business Day</button>
      <button class="depositPosCapitalBtn businessInitBtn" id="depositPosCapitalBtn">Deposit POS Capital</button>
    `;

      setupModalCloseButtons();

      document
        .querySelector('#depositPosCapitalBtn')
        ?.addEventListener('click', openDepositPosCapitalModal);

      document
        .querySelector('#closeBusinessDayModal')
        ?.addEventListener('click', openCloseBusinessDayModal);

      initAccountOverview();
    }
    //   else if (businessDay.data.status === 'closed')
    //    businessInitBtnDiv.innerHTML = `
    //   <button class="viewSummaryBtn businessInitBtn" id="viewSummaryBtn">📊 View Business Day Summary</button>
    // `;

    //   }

    // Update Opening Cash Input - Cash in Machine
    const openingCash = businessDay?.data?.opening_cash || 0;
    updateCashInMachineUI(openingCash);
  }

  if (isAdmin) {
    if (!businessInitBtnDiv) return;

    businessInitBtnDiv.innerHTML = `
    <button class="businessInitBtn" id="openBusinessDayBtn">Open Business Day</button>

    <button class="businessInitBtn" id="depositPosCapitalBtn">Deposit POS Capital</button>

    <button class=" hero-btn-danger adminCloseBusinessDayModal  " id="adminCloseBusinessDayModal">Close Business Day</button>

  `;

    document
      .querySelector('#openBusinessDayBtn')
      ?.addEventListener('click', openAdminBusinessDayModal);
    document
      .querySelector('#adminCloseBusinessDayModal')
      ?.addEventListener('click', openAdminCloseBusinessDayModal);
    document
      .querySelector('#depositPosCapitalBtn')
      ?.addEventListener('click', openAdminDepositPosCapitalModal);

    setupModalCloseButtons();

    initAccountOverview();
  }
  //   else if (businessDay.data.status === 'closed')
  //    businessInitBtnDiv.innerHTML = `
  //   <button class="viewSummaryBtn businessInitBtn" id="viewSummaryBtn">📊 View Business Day Summary</button>
  // `;

  //   }
}

document.addEventListener('DOMContentLoaded', async () => {
  // isUserLoggedIN() is a conditional functions used for functions that needs to run automatically - it basically checks if the user is logged in before it fetchs. It is present in the helper.js file

  if (!isUserLoggedIn()) {
    console.log('User not logged in. Skipping business day check.');
    return;
  }

  if (isStaff || isAdmin) {
    await renderBusinessDayButtons();
  }
});

// Function to Open Business Day - Added to script.js because of scope.

export function bindOpenBusinessDayFormListener() {
  const form = isAdmin
    ? document.querySelector('.adminBusinessDayContainer')
    : document.querySelector('.staffBusinessDayContainer');

  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const businessDayShopDropdown = document.querySelector(
        '#businessDayShopDropdown'
      );
      const openingCashAmount = isAdmin
        ? document.querySelector('#adminOpenCashAmount')
        : document.querySelector('#openCashAmount');

      const openingNotes = isAdmin
        ? document.querySelector('#adminOpeningNotes').value
        : document.querySelector('#openingNotes').value;

      const openPosCapitalAmount = isAdmin
        ? document.querySelector('#adminOpenPosCapitalAmount')
        : document.querySelector('#openPosCapitalAmount');

      const openBusinessDayDetails = {
        shopId: isAdmin ? businessDayShopDropdown.value : shopId,
        openingCash: Number(getAmountForSubmission(openingCashAmount)),
        notes: openingNotes,
      };

      const posCapitalDetails = {
        shopId: isAdmin ? businessDayShopDropdown.value : shopId,
        amount: Number(getAmountForSubmission(openPosCapitalAmount)),
      };

      // console.log('Opening Business Day with:', openBusinessDayDetails);
      // console.log('Depositing POS Capital with:', posCapitalDetails);
      const submitPosCapital = document.querySelector('.submitPosCapital');

      try {
        showGlobalLoader();
        showBtnLoader(submitPosCapital);
        const openBusinessDayData = await openBusinessDay(
          openBusinessDayDetails
        );

        //   if (!openBusinessDayData) {
        //     showToast('fail', openBusinessDayData.message);
        //     return;
        //   }

        //   const shopId = Number(inventoryShopDropdown);

        if (!openBusinessDayData) {
          showToast('fail', openBusinessDayData.message);

          return;
        }

        //   console.log('Adding Products with:', addProductDetails);

        try {
          const posCapitalDepositData = await addPosCapital(posCapitalDetails);

          if (posCapitalDepositData) {
            showToast('success', `✅ ${posCapitalDepositData.message}`);
            closeModal();
            clearFormInputs();
            await getCurrentBusinessDay(shopId);
            await renderBusinessDayButtons();
            initAccountOverview();
          }
        } catch (posCapitalDepositDataErr) {
          showToast(
            'fail',
            `❎ ${
              posCapitalDepositDataErr.message ||
              'Failed to Add posCapitalDeposit'
            }`
          );
          console.error(
            'Error During posCapitalDeposit Adding:',
            posCapitalDepositDataErr.message
          );
        }
        showToast('success', `✅ ${openBusinessDayData.message}`);
        hideBtnLoader(submitPosCapital);
        hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(submitPosCapital);

        console.error('Error Creating product:', err);
        showToast('fail', `❎ ${err.message}`);
      } finally {
        hideBtnLoader(submitPosCapital);
        hideGlobalLoader();
        //   initAccountOverview();
        renderBusinessDayButtons();
      }
    });
  }
}

export function openBusinessDayForm() {
  const form = isAdmin
    ? document.querySelector('.adminBusinessDayContainer')
    : document.querySelector('.staffBusinessDayContainer');

  if (!form) return;
}

document.addEventListener('DOMContentLoaded', () => {
  bindOpenBusinessDayFormListener(); // Only once
});

// Function to deposit POS Capital - Added to script.js because of scope.

export function bindDepositPosCapitalFormListener() {
  const form = isAdmin
    ? document.querySelector('.adminDepositPosCapitalModal')
    : document.querySelector('.staffDepositPosCapitalModal');

  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const adminDepositposCapitalShopDropdown = document.querySelector(
        '#adminDepositposCapitalShopDropdown'
      ).value;

      const posDepositAmount = isAdmin
        ? document.querySelector('#adminPosCapitalAmount')
        : document.querySelector('#posCapitalAmount');

      const posCapitalDetails = {
        shopId: isAdmin ? adminDepositposCapitalShopDropdown : shopId,
        amount: Number(getAmountForSubmission(posDepositAmount)),
      };

      // console.log('Sending POS Capital with:', posCapitalDetails);
      const submitPosCapital = document.querySelector('.submitPosCapital');

      try {
        showBtnLoader(submitPosCapital);
        showGlobalLoader();
        const addPosCapitalData = await addPosCapital(posCapitalDetails);

        if (addPosCapitalData) {
          //  initAccountOverview();
          showToast('success', `✅ ${addPosCapitalData.message}`);
          closeModal();
        }

        // closeModal(); // close modal after success
      } catch (err) {
        console.error('Error adding POS Capital:', err.message);
        showToast('fail', `❎ ${err.message}`);
      } finally {
        hideBtnLoader(submitPosCapital);
        hideGlobalLoader();
      }
    });
  }
}

export function depositPosCapitalForm() {
  const form = isAdmin
    ? document.querySelector('.adminDepositPosCapitalModal')
    : document.querySelector('.staffDepositPosCapitalModal');

  if (!form) return;
}

document.addEventListener('DOMContentLoaded', () => {
  bindDepositPosCapitalFormListener(); // Only once
});

// Close Business Day

export function bindCloseBusinessDayFormListener() {
  const form = isAdmin
    ? document.querySelector('.adminCloseBusinessDayContainer')
    : document.querySelector('.staffCloseBusinessDayContainer');

  if (!form) return;

  const cancelCloseBusinessDayBtn = isAdmin
    ? document.querySelector('.adminCancel-close')
    : document.querySelector('.cancel-close');
  if (cancelCloseBusinessDayBtn)
    cancelCloseBusinessDayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const closingCashAmount = document.getElementById(
        isAdmin ? 'adminClosingCashAmount' : 'closingCashAmount'
      );

      const closeBusinessDayShopDropdown = document.getElementById(
        'closeBusinessDayShopDropdown'
      ).value;

      const closeBusinessDayDetails = {
        shopId: isAdmin ? closeBusinessDayShopDropdown : shopId,
        closingCash: Number(getAmountForSubmission(closingCashAmount)),
      };

      // console.log('Closing Business Day with:', closeBusinessDayDetails);
      const closeBusinessDayBtn = document.querySelector(
        '.closeBusinessDayBtn'
      );

      // console.log(closeBusinessDayBtn);

      try {
        showBtnLoader(closeBusinessDayBtn);
        showGlobalLoader();
        const closeBusinessDayData = await closeBusinessDay(
          closeBusinessDayDetails
        );

        if (closeBusinessDayData) {
          //  initAccountOverview();
          closeModal();
          hideBtnLoader(closeBusinessDayBtn);
          hideGlobalLoader();
        }

        closeModal(); // close modal after success
      } catch (err) {
        hideBtnLoader(closeBusinessDayBtn);
        hideGlobalLoader();
        console.error('Error Closing Business Day:', err.message);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function closeBusinessDayForm() {
  const form = isAdmin
    ? document.querySelector('.adminCloseBusinessDayContainer')
    : document.querySelector('.staffCloseBusinessDayContainer');

  if (!form) return;
}

document.addEventListener('DOMContentLoaded', () => {
  bindCloseBusinessDayFormListener(); // Only once
});

// JS For Modal

const main = document.querySelector('.main');
const sidebar = document.querySelector('.sidebar');
const closeModalButton = document.querySelectorAll('.closeModal');

closeModalButton.forEach((closeButton) => {
  closeButton.addEventListener('click', function () {
    closeModal();
  });
});

export function closeModal() {
  const depositPosCapitalContainer =
    document.querySelector('.depositPosCapital');
  const createShop = document.querySelector('.createShop');
  const addUser = document.querySelector('.addUser');
  const adminUpdateUserData = document.querySelector('.adminUpdateUserData');
  const adminUpdateShopData = document.querySelector('.adminUpdateShopData');
  const staffManage = document.querySelector('.staffManage');
  const addPosCharge = document.querySelector('.addPosCharge');
  const addMachineFee = document.querySelector('.addMachineFees');
  const addCategory = document.querySelector('.addCategory');
  const addProduct = document.querySelector('.addProduct');
  const updateProduct = document.querySelector('.updateProduct');
  const openAdminBusinessDay = document.querySelector('.openAdminBusinessDay');
  const openStaffBusinessDay = document.querySelector('.openStaffBusinessDay');
  const closeBusinessDay = document.querySelector('.closeBusinessDay');
  const adminCloseBusinessDay = document.querySelector(
    '.adminCloseBusinessDay'
  );
  const adminDepositPosCapital = document.querySelector(
    '.adminDepositPosCapital'
  );
  const adminUpdateBusinessData = document.querySelector(
    '.adminUpdateBusinessData'
  );
  const updateCategory = document.querySelector('.updateCategory');

  if (depositPosCapitalContainer) {
    depositPosCapitalContainer.classList.remove('active');
  }

  if (createShop) {
    createShop.classList.remove('active');
  }

  if (addUser) {
    addUser.classList.remove('active');
  }

  if (adminUpdateUserData) {
    adminUpdateUserData.classList.remove('active');
    delete adminUpdateUserData.dataset.staffId;
  }

  if (adminUpdateShopData) {
    adminUpdateShopData.classList.remove('active');
    delete adminUpdateShopData.dataset.staffId;
  }

  if (staffManage) {
    staffManage.classList.remove('active');
    delete staffManage.dataset.staffId;
  }

  if (addPosCharge) {
    addPosCharge.classList.remove('active');
    //  delete addPosCharge.dataset.staffId;
  }

  if (addMachineFee) {
    addMachineFee.classList.remove('active');
    //  delete addMachineFee.dataset.staffId;
  }

  if (addCategory) {
    addCategory.classList.remove('active');
    //  delete addCategory.dataset.staffId;
  }

  if (addProduct) {
    addProduct.classList.remove('active');
    //  delete addProduct.dataset.staffId;
  }

  if (updateProduct) {
    updateProduct.classList.remove('active');
    //  delete updateProduct.dataset.staffId;
  }

  if (openStaffBusinessDay) {
    openStaffBusinessDay.classList.remove('active');
    //  delete openStaffBusinessDay.dataset.staffId;
  }
  if (openAdminBusinessDay) {
    openAdminBusinessDay.classList.remove('active');
    //  delete openAdminBusinessDay.dataset.staffId;
  }

  if (closeBusinessDay) {
    closeBusinessDay.classList.remove('active');
    //  delete closeBusinessDay.dataset.staffId;
  }

  if (adminCloseBusinessDay) {
    adminCloseBusinessDay.classList.remove('active');
    //  delete adminCloseBusinessDay.dataset.staffId;
  }

  if (adminDepositPosCapital) {
    adminDepositPosCapital.classList.remove('active');
    //  delete adminDepositPosCapital.dataset.staffId;
  }

  if (adminUpdateBusinessData) {
    adminUpdateBusinessData.classList.remove('active');
  }

  if (updateCategory) {
    updateCategory.classList.remove('active');
  }

  clearFormInputs();

  main.classList.remove('blur');
  if (sidebar) sidebar.classList.remove('blur');
  main.classList.remove('no-scroll');
}

// JS for Date of Birth Input
document.addEventListener('DOMContentLoaded', () => {
  if (flatpickr) {
    flatpickr('#dateOfBirth', {
      dateFormat: 'Y-m-d',
      allowInput: true, // Enable input so validation works
      onReady: function (selectedDates, dateStr, instance) {
        const el = instance.element;

        // Prevent user typing but keep field focusable & validatable
        el.onkeydown =
          el.onkeypress =
          el.onkeyup =
            function (e) {
              e.preventDefault();
            };
        el.onpaste = function (e) {
          e.preventDefault();
        };

        el.style.caretColor = 'transparent'; // Hide text cursor
        el.style.cursor = 'pointer'; // UI/UX feedback
        el.style.backgroundColor = '#f7f7f7'; // Optional style
      },
    });
  }
});

// // JS for Business ID Generation
// export function generateBusinessId(length = 10) {
//   const chars =
//     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let id = '';
//   for (let i = 0; i < length; i++) {
//     id += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return id;
// }

// JS to generate numeric Business Owner ID (e.g., random number from 1000000000 to 9999999999)
export function generateBusinessOwnerId(length = 8) {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += Math.floor(Math.random() * 10); // Generates a digit (0-9)
  }
  return id;
}

// Redirect Helper function
export function redirectWithDelay(message, redirectedPage, delay) {
  setTimeout(() => {
    showToast('info', ` 👍Redirecting to ${message}...`);
    setTimeout(() => {
      window.location.href = `${redirectedPage}`;
    }, delay); // delay = 0000
  }, 3000); // 3 seconds delay before showing the toast message
}

// Functioin to check if user is logged in
const token = localStorage.getItem('accessToken');

// Normalize current page name from pathname
// const currentPage = window.location.pathname.toLowerCase();

// Llist of all  public/auth pages & check if on auth page
const authPages = ['login', 'signup', 'createbusiness'];
const onAuthPage = authPages.some((page) => currentPage.includes(page));

// If token exists and user is on an auth page, redirect to index
if (token && onAuthPage) {
  window.location.href = 'index.html';
  //   console.log('go to index.html because token exists and onAuthPage is true');
}

if (!token) {
  if (!onAuthPage) {
    window.location.href = 'login.html';
    //  console.log('!onAuthPage');
  } else {
    // If you're already on an auth page, don't redirect again
    //  console.log('On auth page, no token, staying put.');
  }
}

// Logout Function
const logoutButton = document.querySelector('.logoutButton');

if (logoutButton) {
  logoutButton.addEventListener('click', function () {
    logoutUser()
      .then((data) => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');

        showToast('success', '✅ Logging Out...!');
        setTimeout(() => {
          window.location.href = 'login.html'; // Redirect to login page
          //  console.log('Logout Button');
        }, 1000);
      })
      .catch((data) => {
        showToast('fail', `❎ ${data.message}`);
        console.error('❎ Failed to logout:', data.message);
      });
  });
}

function checkIfTokenExpiredDaily() {
  const savedDate = localStorage.getItem('loginDate');
  const today = new Date().toISOString().split('T')[0];

  //   console.log(today);

  //   console.log('checkIfTokenExpiredDaily is reached');

  if (savedDate && savedDate !== today) {
    logoutUser().finally(() => {
      localStorage.clear();
      window.location.href = 'login.html';

      console.log('savedDate && savedDate !== today');
    });
  }
}

checkIfTokenExpiredDaily();

//  JS for DOM Manioulation and Dynamic data e.g.
const userNameDisplay = document.querySelector('.user-name');
const businessNameDisplay = document.querySelector('.business-name');

const posDepositButton = document.querySelector('.depositPosCapitalBtn');

const sellIndexTab = document.getElementById('sellIndexTab');
const posIndexTab = document.getElementById('posIndexTab');
const reportIndexTab = document.getElementById('reportIndexTab');
const manageIndexTab = document.getElementById('manageIndexTab');

const sellNav = document.getElementById('sellNav');
const posNav = document.getElementById('posNav');
const reportsNav = document.getElementById('reportsNav');
const manageNav = document.getElementById('manageNav');

// Stop everything if no user is logged in
if (!userData) {
  //   console.log('❎❎❎❎ No user data found in localStorage');
} else {
  //    User Name
  if (userNameDisplay) {
    if (userNameDisplay) userNameDisplay.textContent = parsedUserData.firstName;
  }

  // Business Name display
  if (userNameDisplay) {
    if (businessNameDisplay)
      businessNameDisplay.textContent = parsedUserData.businessName;
  }

  // Account Type - services display

  // Extract only the current page name (without .html or parameters)
  const currentPath = window.location.pathname;
  const currentPageName = currentPath
    .substring(currentPath.lastIndexOf('/') + 1)
    .replace('.html', '')
    .split('?')[0];

  //   if (parsedUserData.accountType === 'ADMIN') {
  //     if (sellIndexTab) sellIndexTab.style.display = 'none';
  //     if (posIndexTab) posIndexTab.style.display = 'none';
  //     if (posNav) posNav.style.display = 'none';
  //     if (sellNav) sellNav.style.display = 'none';

  //     if (reportIndexTab) reportIndexTab.style.display = 'block';
  //     if (manageIndexTab) manageIndexTab.style.display = 'block';
  //     if (reportsNav) reportsNav.style.display = 'block';
  //     if (manageNav) manageNav.style.display = 'block';

  //     if (posDepositButton) posDepositButton.style.display = 'none';

  //     //  List of pages not open to admin
  //     const restrictedAdminPages = ['pos', 'sell'];

  //     if (restrictedAdminPages.includes(currentPageName)) {
  //       window.location.href = 'index.html';
  //     }

  //     //  const isOnRestrictedAdminPage = RestrictedAdminPage.some((page) =>
  //     //    currentPage.includes(page)
  //     //  );

  //     //  // If admin is on a protected page, redirect to login
  //     //  if (isOnRestrictedAdminPage) {
  //     //    window.location.href = 'index.html';
  //     //  }
  //   }

  if (parsedUserData.accountType === 'STAFF') {
    if (sellIndexTab) sellIndexTab.style.display = 'block';
    if (posIndexTab) posIndexTab.style.display = 'block';
    if (reportIndexTab) reportIndexTab.style.display = 'block';
    if (sellNav) sellNav.style.display = 'block';
    if (posNav) posNav.style.display = 'block';
    if (reportsNav) reportsNav.style.display = 'block';

    if (manageIndexTab) manageIndexTab.style.display = 'none';
    if (manageNav) manageNav.style.display = 'none';

    if (posDepositButton) posDepositButton.style.display = 'block';

    //  List of pages not open to Staff

    const restrictedStaffPages = [
      'manage',
      'staff-profile',
      'pos-management',
      'shop-management',
      'inventory',
    ];
    if (restrictedStaffPages.includes(currentPageName)) {
      window.location.href = 'index.html';
    }

    //  const isOnRestrictedStaffPage = restrictedStaffPage.some((page) =>
    //    currentPage.includes(page)
    //  );

    //  // If Staff is on a protected page, redirect to login
    //  if (isOnRestrictedStaffPage) {
    //    window.location.href = 'index.html';
    //  }
  }
}

if (isAdmin) {
  document.addEventListener('DOMContentLoaded', () => {
    // Setup for Shops
    setupCreateShopForm();
    setupModalCloseButtons();
    document
      .querySelector('#openShopModalBtn')
      ?.addEventListener('click', openCreateShopModal);

    if (userData) {
      checkAndPromptCreateShop();
    }

    // Setup for Staff
    setupCreateStaffForm();
    document
      .querySelector('#openStaffModalBtn')
      ?.addEventListener('click', openCreateStaffModal);

    if (userData) {
      checkAndPromptCreateStaff();
    }

    //Admin api calls
    //  getPosChargeSettings();
    //  getPosMachineFeesettings();
    //  getProductCategories();
    //  getProductInventory();
  });
}

export function setupModalCloseButtons() {
  const closeModalButtons = document.querySelectorAll('.closeModal');
  const createShopContainer = document.querySelector('.createShop');
  const updateShopContainer = document.querySelector('.adminUpdateShopData');
  const addPosChargeContainer = document.querySelector('.addPosCharge');
  const addMachineFeesContainer = document.querySelector('.addMachineFees');
  const addProductCategoryContainer = document.querySelector('.addCategory');
  const addProductContainer = document.querySelector('.addProduct');
  const updateProductContainer = document.querySelector('.updateProduct');
  const createStaffContainer = document.querySelector('.addUser');
  const updateStaffContainer = document.querySelector('.adminUpdateUserData');

  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');

  closeModalButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (createShopContainer) createShopContainer.classList.remove('active');
      if (updateShopContainer) updateShopContainer.classList.remove('active');
      if (addPosChargeContainer)
        addPosChargeContainer.classList.remove('active');
      if (addMachineFeesContainer)
        addMachineFeesContainer.classList.remove('active');
      if (addProductCategoryContainer)
        addProductCategoryContainer.classList.remove('active');
      if (addProductContainer) addProductContainer.classList.remove('active');
      if (updateProductContainer)
        updateProductContainer.classList.remove('active');

      if (createStaffContainer) createStaffContainer.classList.remove('active');
      if (updateStaffContainer) updateStaffContainer.classList.remove('active');

      if (main) main.classList.remove('blur');

      if (sidebar) sidebar.classList.remove('blur');
    });
  });
}

// function to Use business info to fill in the Create Shop Form
const useBusinessInfoCheckbox = document.querySelector('#useBusinessInfo');

if (useBusinessInfoCheckbox) {
  useBusinessInfoCheckbox.addEventListener('change', async function () {
    const shopNameInput = document.querySelector('#shopName');
    const shopAddressInput = document.querySelector('#shopAddress');
    const serviceTypeCheckboxes = document.querySelectorAll(
      'input[name="serviceType"]'
    );

    if (useBusinessInfoCheckbox.checked) {
      showGlobalLoader();
      const businessData = await fetchBusinessDetails();

      shopNameInput.value = businessData.data.business_name || '';
      shopAddressInput.value = businessData.data.address || '';

      // Clear all checkboxes first
      serviceTypeCheckboxes.forEach((checkbox) => (checkbox.checked = false));

      // Match and check the appropriate checkbox
      const serviceType = businessData.data.business_type;
      const matchedCheckbox = [...serviceTypeCheckboxes].find(
        (checkbox) => checkbox.value === serviceType
      );
      if (matchedCheckbox) matchedCheckbox.checked = true;

      hideGlobalLoader();
    } else {
      // Clear inputs and checkboxes
      shopNameInput.value = '';
      shopAddressInput.value = '';
      serviceTypeCheckboxes.forEach((checkbox) => (checkbox.checked = false));
    }
  });
}
