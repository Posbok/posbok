import config from '../config.js';
import flatpickr from 'flatpickr';
import './apiServices/product';
import { logoutUser } from './apiServices/login';
import {
  checkAndPromptCreateShop,
  openCreateShopModal,
  setupCreateShopForm,
} from './apiServices/shop/shopResource.js';
import { fetchBusinessDetails } from './apiServices/business/businessResource.js';
import {
  checkAndPromptCreateStaff,
  openCreateStaffModal,
  setupCreateStaffForm,
} from './apiServices/user/userResource.js';
import {
  clearFormInputs,
  getAmountForSubmission,
  hideGlobalLoader,
  isUserLoggedIn,
  showGlobalLoader,
} from './helper/helper.js';
import {
  addPosCapital,
  getPosChargeSettings,
  getPosMachineFeesettings,
  openDepositPosCapitalModal,
} from './apiServices/pos/posResources.js';
import { initAccountOverview } from './apiServices/account/accountOverview.js';

const userData = config.userData;
const dummyShopId = config.dummyShopId;

let parsedUserData = null;

parsedUserData = userData ? JSON.parse(userData) : null;
const shopId = parsedUserData?.shopId || dummyShopId;

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

  // Reset class to clear previous toast type
  toast.className = 'toast';

  // Add the appropriate type (success or fail)
  toast.classList.add(type);
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Function to deposit POS Capital - Added to script.js because of scope.
export function depositPosCapitalForm() {
  const form = document.querySelector('.depositPosCapitalModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const posDepositAmount = document.querySelector('#posCapitalAmount');

      const posCapitalDetails = {
        shopId: shopId,
        amount: Number(getAmountForSubmission(posDepositAmount)),
      };

      console.log('Sending POS Capital with:', posCapitalDetails);

      try {
        const data = addPosCapital(posCapitalDetails);
        if (data) {
          closeModal();
          initAccountOverview();
        }

        // closeModal(); // close modal after success
      } catch (err) {
        console.error('Error adding POS Capital:', err.message);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // isUserLoggedIN() is a conditional functions used for functions that needs to run automatically - it basically checks if the user is logged in before it fetchs. It is present in the helper.js file
  if (isUserLoggedIn()) {
    initAccountOverview();
  }
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
}

// If no token and user is on a protected page, redirect to login
// if (!token && !onAuthPage) {
//   window.location.href = 'login.html';
// }

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

  if (parsedUserData.accountType === 'ADMIN') {
    if (sellIndexTab) sellIndexTab.style.display = 'none';
    if (posIndexTab) posIndexTab.style.display = 'none';
    if (posNav) posNav.style.display = 'none';
    if (sellNav) sellNav.style.display = 'none';

    if (reportIndexTab) reportIndexTab.style.display = 'block';
    if (manageIndexTab) manageIndexTab.style.display = 'block';
    if (reportsNav) reportsNav.style.display = 'block';
    if (manageNav) manageNav.style.display = 'block';

    if (posDepositButton) posDepositButton.style.display = 'none';

    //  List of pages not open to admin
    const RestrictedAdminPage = ['pos', 'sell'];
    const isOnRestrictedAdminPage = RestrictedAdminPage.some((page) =>
      currentPage.includes(page)
    );

    // If admin is on a protected page, redirect to login
    if (isOnRestrictedAdminPage) {
      window.location.href = 'index.html';
    }
  }

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
    const restrictedStaffPage = ['manage', 'staff-profile'];
    const isOnRestrictedStaffPage = restrictedStaffPage.some((page) =>
      currentPage.includes(page)
    );

    // If Staff is on a protected page, redirect to login
    if (isOnRestrictedStaffPage) {
      window.location.href = 'index.html';
    }
  }
}

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';

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
    getPosChargeSettings();
    getPosMachineFeesettings();
  });
}

if (isStaff) {
  document.addEventListener('DOMContentLoaded', () => {
    // Setup for Opening Pos Deposit Capital Modal

    setupModalCloseButtons();
    document
      .querySelector('#depositPosCapitalBtn')
      ?.addEventListener('click', openDepositPosCapitalModal);
  });
}

export function setupModalCloseButtons() {
  const closeModalButtons = document.querySelectorAll('.closeModal');
  const createShopContainer = document.querySelector('.createShop');
  const updateShopContainer = document.querySelector('.adminUpdateShopData');
  const addPosChargeContainer = document.querySelector('.addPosCharge');
  const addMachineFeesContainer = document.querySelector('.addMachineFees');
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
