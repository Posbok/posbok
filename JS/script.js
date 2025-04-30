import config from '../config.js';
import flatpickr from 'flatpickr';
import './apiServices/product';
import { logoutUser } from './apiServices/login';
import {
  checkAndPromptCreateShop,
  openCreateShopModal,
  setupCreateShopForm,
  setupModalCloseButtons,
} from './apiServices/shop/createShop';
import { fetchBusinessDetails } from './apiServices/business/getBusinessDetails.js';

const userData = config.userData;

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

// function to format amounts with commas
export function formatAmountWithCommas(amount) {
  if (amount === null || amount === undefined) {
    return amount; // return an empty string if amount is null or undefined
  }

  const amountString = amount.toString();
  return amountString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

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

  if (depositPosCapitalContainer) {
    depositPosCapitalContainer.classList.remove('active');
  }

  if (createShop) {
    createShop.classList.remove('active');
  }

  main.classList.remove('blur');
  if (sidebar) sidebar.classList.remove('blur');
  main.classList.remove('no-scroll');
}

// JS for Modal
document.addEventListener('DOMContentLoaded', function () {
  const depositButton = document.querySelector('.deposit-btn');
  const depositPosCapitalContainer =
    document.querySelector('.depositPosCapital');

  if (depositButton && depositPosCapitalContainer) {
    depositButton.addEventListener('click', function () {
      depositPosCapitalContainer.classList.add('active');
      main.classList.add('blur');
      // sidebar.classList.add('blur');
      main.classList.add('no-scroll');
    });
  }
});

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
    showToast('redirect', ` 👍Redirecting to ${message}...`);
    setTimeout(() => {
      window.location.href = `${redirectedPage}`;
    }, delay); // delay = 0000
  }, 3000); // 3 seconds delay before showing the toast message
}

// Functioin to check if user is logged in
const token = localStorage.getItem('accessToken');

// Normalize current page name from pathname
const currentPage = window.location.pathname.toLowerCase();

// Llist of all  public/auth pages & check if on auth page
const authPages = ['login', 'signup', 'createbusiness'];
const onAuthPage = authPages.some((page) => currentPage.includes(page));

// If token exists and user is on an auth page, redirect to index
if (token && onAuthPage) {
  window.location.href = 'index.html';
}

// If no token and user is on a protected page, redirect to login
if (!token && !onAuthPage) {
  window.location.href = 'login.html';
}

// Logout Function
const logoutButton = document.querySelector('.logoutButton');

if (logoutButton) {
  logoutButton.addEventListener('click', function () {
    logoutUser()
      .then((data) => {
        console.log(data);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');

        showToast('success', '✅ Logging Out...!');
        setTimeout(() => {
          window.location.href = 'login.html'; // Redirect to login page
        }, 1000);
      })
      .catch((data) => {
        showToast('fail', `❎ ${data.message}`);
        console.error('❎ Failed to login:', data.message);
      });
  });
}

//  JS for DOM Manioulation and Dynamic data e.g.
const userNameDisplay = document.querySelector('.user-name');
const businessNameDisplay = document.querySelector('.business-name');

const sellIndexTab = document.getElementById('sellIndexTab');
const posIndexTab = document.getElementById('posIndexTab');
const reportIndexTab = document.getElementById('reportIndexTab');
const manageIndexTab = document.getElementById('manageIndexTab');

if (userData) {
  const parsedUserData = JSON.parse(userData);

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
    if (reportIndexTab) reportIndexTab.style.display = 'block';
    if (manageIndexTab) manageIndexTab.style.display = 'block';

    // Normalize current page name from pathname
    const currentPage = window.location.pathname.toLowerCase();

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
    if (manageIndexTab) manageIndexTab.style.display = 'none';

    //  List of pages not open to Staff
    const restrictedStaffPage = ['manage'];
    const isOnRestrictedStaffPage = restrictedStaffPage.some((page) =>
      currentPage.includes(page)
    );

    // If Staff is on a protected page, redirect to login
    if (isOnRestrictedStaffPage) {
      window.location.href = 'index.html';
    }
  }
} else {
  //   console.log('No user data found in localStorage');
}

// JS to Check and prompt cretae shop
document.addEventListener('DOMContentLoaded', () => {
  setupCreateShopForm();
  setupModalCloseButtons();
  document
    .querySelector('#openShopModalBtn')
    ?.addEventListener('click', openCreateShopModal);

  if (userData) {
    checkAndPromptCreateShop();
  }
});

// function to Use business info to fill in the Create SHop Form
const useBusinessInfoCheckbox = document.querySelector('#useBusinessInfo');

if (useBusinessInfoCheckbox) {
  useBusinessInfoCheckbox.addEventListener('change', async function () {
    const shopNameInput = document.querySelector('#shopName');
    const shopAddressInput = document.querySelector('#shopAddress');
    const serviceTypeCheckboxes = document.querySelectorAll(
      'input[name="serviceType"]'
    );

    if (useBusinessInfoCheckbox.checked) {
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
    } else {
      // Clear inputs and checkboxes
      shopNameInput.value = '';
      shopAddressInput.value = '';
      serviceTypeCheckboxes.forEach((checkbox) => (checkbox.checked = false));
    }
  });
}
