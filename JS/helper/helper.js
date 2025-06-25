// isUserLoggedIn() - Used to make sure that a user is loggedin before running functions that needs to run automatically so that they don rn on Authenyication pages

import { getCurrentBusinessDay } from '../apiServices/pos/posResources';
import { showToast } from '../script';

export function isUserLoggedIn() {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('userData');
  return Boolean(token && user);
}

// export function isUserLoggedIn() {
//    return !!localStorage.getItem('accessToken') && !!localStorage.getItem('userData');
//  }

export function clearFormInputs() {
  // Select the form element and reset its inputs
  const createShopForm = document.querySelector('.createShopModal');
  const createStaffForm = document.querySelector('.createStaffModal');
  const updateStaffForm = document.querySelector('.adminUpdateUserDataModal');
  const updateShopForm = document.querySelector('.adminUpdateShopDataModal');
  const staffManageForm = document.querySelector('.staffManageModal');
  const depositPosCapitalForm = document.querySelector(
    '.depositPosCapitalModal'
  );
  const createPosTransactionForm = document.querySelector('.pos-method-form');
  const addPosChargeForm = document.querySelector('.addPosChargeModal');
  const addMachineFeesForm = document.querySelector('.addMachineFeesModal');
  const addProductForm = document.querySelector('.addProductModal');
  const addCategoryForm = document.querySelector('.addCategoryModal');
  const updateProductForm = document.querySelector('.updateProductModal');
  const openBusinessDayForm = document.querySelector('.openBusinessDayModal');
  const checkoutForm = document.querySelector('.checkout-form');

  //   Clear Search Input
  const searchProductInput = document.querySelector('.searchProductInput');
  if (searchProductInput) searchProductInput.value = '';

  //   if (createStaffForm || updateStaffForm) {
  //     if (createStaffForm) createStaffForm.reset();
  //     if (updateStaffForm) updateStaffForm.reset();
  //   }

  // Clear Create Staff Form Inputs
  if (createStaffForm) {
    createStaffForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });
  }

  // Clear Create Shop Form Inputs
  if (createShopForm) {
    createShopForm.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = '';
      }
    });

    delete createShopForm.dataset.bound;
  }

  // Clear Update Staff Form Inputs
  if (updateStaffForm) {
    updateStaffForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete updateStaffForm.dataset.bound;
  }

  // Clear Update SHop Form Inputs
  if (updateShopForm) {
    updateShopForm.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = '';
      }
    });

    delete updateShopForm.dataset.bound;
  }

  // Clear Create Shop Form Inputs
  if (depositPosCapitalForm) {
    depositPosCapitalForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete depositPosCapitalForm.dataset.bound;
  }

  // Clear Create Shop Form Inputs
  if (staffManageForm) {
    staffManageForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete staffManageForm.dataset.staffId;

    // Optional: reset text labels like staff name or current shop
    const nameLabel = staffManageForm.querySelector('#staffManage-name');
    if (nameLabel) nameLabel.innerText = '';

    const currentShopDisplay = staffManageForm.querySelector(
      '#currentAssignedShop'
    );
    if (currentShopDisplay) currentShopDisplay.innerText = 'No Shop Assigned';

    delete staffManageForm.dataset.bound;
  }

  // Clear POS Transaction Form Inputs
  if (createPosTransactionForm) {
    createPosTransactionForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete createPosTransactionForm.dataset.staffId;
  }

  // Clear POS Charges Form Inputs
  if (addPosChargeForm) {
    addPosChargeForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete addPosChargeForm.dataset.staffId;
  }

  // Clear POS Machine Fee Form Inputs
  if (addMachineFeesForm) {
    addMachineFeesForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete addMachineFeesForm.dataset.staffId;
  }

  // Clear Add Product Form Inputs
  if (addProductForm) {
    addProductForm.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = '';
      }
    });

    delete addProductForm.dataset.staffId;
  }

  // Clear Add Categoty Form Inputs
  if (addCategoryForm) {
    addCategoryForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete addCategoryForm.dataset.staffId;
  }

  // Clear Update Product Form Inputs
  if (updateProductForm) {
    updateProductForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete updateProductForm.dataset.staffId;
  }

  // Clear Open Business Day  Inputs
  if (openBusinessDayForm) {
    openBusinessDayForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete openBusinessDayForm.dataset.staffId;
  }

  // Clear Checkout Form Inputs
  if (checkoutForm) {
    checkoutForm.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = '';
      }
    });

    //  delete checkoutForm.dataset.staffId;
  }
}

// function to format amounts with commas
export function formatAmountWithCommas(amount) {
  if (amount === null || amount === undefined) {
    return amount; // return an empty string if amount is null or undefined
  }

  const amountString = amount.toString();
  return amountString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Function to handle input formatting and remove commas when submitting
export function formatAmountWithCommasOnInput(input) {
  //   console.log('formatAmountWithCommasOnInput() Reached');

  let value = input.value;
  value = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  input.value = formatAmountWithCommas(value);
}

// Format transaction type
export function formatTransactionType(value) {
  switch (value.toLowerCase()) {
    case 'withdrawal':
      return 'Withdrawal';
    case 'withdrawal_transfer':
      return 'Withdrawal & Transfer';
    case 'bill_payment':
      return 'Bill Payment';
    case 'deposit':
      return 'Deposit';
    default:
      return value;
  }
}

// Format Sale Status
export function formatSaleStatus(value) {
  switch (value.toLowerCase()) {
    case 'completed_full_payment':
      return 'Completed Payment';
    case 'partial_payment':
      return 'Partial Payment';
    default:
      return value;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const posCapitalAmountInput = document.getElementById('posCapitalAmount');
  const posTransactionAmountInput = document.getElementById(
    'posTransactionAmount'
  );
  const adminPosTransactionAmountInput = document.getElementById(
    'adminPosTransactionAmount'
  );
  const addPosChargeMinAmountInput = document.getElementById(
    'addPosChargeMinAmount'
  );
  const addPosChargeMaxAmountInput = document.getElementById(
    'addPosChargeMaxAmount'
  );
  const addPosChargeAmountInput = document.getElementById('addPosChargeAmount');
  const addProductBoughtPriceInput = document.getElementById(
    'addProductBoughtPrice'
  );
  const addProductSellingPriceInput = document.getElementById(
    'addProductSellingPrice'
  );
  const addMachineFeesMinAmountInput = document.getElementById(
    'addMachineFeesMinAmount'
  );
  const addMachineFeesMaxAmountInput = document.getElementById(
    'addMachineFeesMaxAmount'
  );
  const openPosCapitalAmountInput = document.getElementById(
    'openPosCapitalAmount'
  );
  const openCashAmountInput = document.getElementById('openCashAmount');
  const adminOpenPosCapitalAmount = document.getElementById(
    'adminOpenPosCapitalAmount'
  );
  const adminOpenCashAmount = document.getElementById('adminOpenCashAmount');
  const closingCashAmountInput = document.getElementById('closingCashAmount');
  const adminClosingCashAmountInput = document.getElementById(
    'adminClosingCashAmount'
  );
  const adminPosCapitalAmount = document.getElementById(
    'adminPosCapitalAmount'
  );
  const adminSoldProductPrice = document.getElementById(
    'adminSoldProductPrice'
  );
  const soldProductPrice = document.getElementById('soldProductPrice');
  const amountPaid = document.getElementById('amount-paid');
  const productBalancePrice = document.getElementById('productBalancePrice');

  if (posCapitalAmountInput)
    posCapitalAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(posCapitalAmountInput);
    });

  if (posTransactionAmountInput)
    posTransactionAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(posTransactionAmountInput);
    });

  if (adminPosTransactionAmountInput)
    adminPosTransactionAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminPosTransactionAmountInput);
    });

  if (addPosChargeMinAmountInput)
    addPosChargeMinAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(addPosChargeMinAmountInput);
    });

  if (addPosChargeMaxAmountInput)
    addPosChargeMaxAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(addPosChargeMaxAmountInput);
    });

  if (addPosChargeAmountInput)
    addPosChargeAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(addPosChargeAmountInput);
    });

  if (addProductSellingPriceInput)
    addProductSellingPriceInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(addProductSellingPriceInput);
    });

  if (addProductBoughtPriceInput)
    addProductBoughtPriceInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(addProductBoughtPriceInput);
    });

  if (addMachineFeesMinAmountInput)
    addMachineFeesMinAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(addMachineFeesMinAmountInput);
    });

  if (addMachineFeesMaxAmountInput)
    addMachineFeesMaxAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(addMachineFeesMaxAmountInput);
    });

  if (openCashAmountInput)
    openCashAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(openCashAmountInput);
    });

  if (openPosCapitalAmountInput)
    openPosCapitalAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(openPosCapitalAmountInput);
    });

  if (adminOpenCashAmount)
    adminOpenCashAmount.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminOpenCashAmount);
    });

  if (adminOpenPosCapitalAmount)
    adminOpenPosCapitalAmount.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminOpenPosCapitalAmount);
    });

  if (adminPosCapitalAmount)
    adminPosCapitalAmount.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminPosCapitalAmount);
    });

  if (adminSoldProductPrice)
    adminSoldProductPrice.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminSoldProductPrice);
    });

  if (soldProductPrice)
    soldProductPrice.addEventListener('input', function () {
      formatAmountWithCommasOnInput(soldProductPrice);
    });

  if (productBalancePrice)
    productBalancePrice.addEventListener('input', function () {
      formatAmountWithCommasOnInput(productBalancePrice);
    });

  if (amountPaid)
    amountPaid.addEventListener('input', function () {
      formatAmountWithCommasOnInput(amountPaid);
    });
  if (adminClosingCashAmountInput)
    adminClosingCashAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminClosingCashAmountInput);
    });
  if (closingCashAmountInput)
    closingCashAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(closingCashAmountInput);
    });
});

// Make the function globally available
window.formatAmountWithCommasOnInput = formatAmountWithCommasOnInput;

// When submitting, remove commas from the value before processing
// export function getAmountForSubmission(input) {
//   console.log('This is the input received from call', input);
//   return input.value.replace(/,/g, ''); // Remove commas for backend submission
// }

export function getAmountForSubmission(inputOrString) {
  const rawValue =
    typeof inputOrString === 'string'
      ? inputOrString
      : inputOrString?.value || '';

  return rawValue.replace(/,/g, '');
}

// Turns ISO Date formats like "2025-05-14T10:46:04.164Z" into: 14 May, 2025 10:46AM

export function formatDateTimeReadable(isoString) {
  const date = new Date(isoString);
  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  // e.g., "14 May 2025, 10:46 AM"
  const formatted = date.toLocaleString('en-US', options);

  // Optional tweak to remove the comma between day and year
  const parts = formatted.split(', ');
  return `${parts[0]} ${parts[1]}`;
}

// Global UI Spinner
export function showGlobalLoader() {
  document.getElementById('global-loader').classList.remove('hidden');
}

export function hideGlobalLoader() {
  document.getElementById('global-loader').classList.add('hidden');
}

// Button UI spinner
export function showBtnLoader(button) {
  const text = button.querySelector('.btn-text');
  const spinner = button.querySelector('.btn-spinner');
  text.style.opacity = '0.5';
  spinner.classList.remove('hidden');
  button.classList.add('loading');
  button.disabled = true;
}

export function hideBtnLoader(button) {
  const text = button.querySelector('.btn-text');
  const spinner = button.querySelector('.btn-spinner');
  text.style.opacity = '1';
  spinner.classList.add('hidden');
  button.classList.remove('loading');
  button.disabled = false;
}

export function generateBarcode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alphanumerics = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const prefix = letters.charAt(Math.floor(Math.random() * letters.length));

  let body = '';
  for (let i = 0; i < 9; i++) {
    body += alphanumerics.charAt(
      Math.floor(Math.random() * alphanumerics.length)
    );
  }

  return prefix + body;
}

export function populateBusinessShopDropdown(
  shopList = [],
  dropdownId = 'inventoryShopDropdown'
) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  dropdown.innerHTML = `<option value="">Select a shop</option>`;

  shopList.forEach((shop) => {
    const option = document.createElement('option');
    option.value = shop.id;
    option.textContent = `${shop.shop_name} - ${shop.location}`;
    dropdown.appendChild(option);
  });
}

export function populateBusinessStaffDropdown(
  staffList = [],
  dropdownId = 'staffDropdown'
) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  //   console.log(staffList);

  dropdown.innerHTML = `<option value="">Select a Staff</option>`;

  staffList.forEach((staff) => {
    const option = document.createElement('option');
    option.value = staff.id;
    option.textContent = `${staff.firstName} ${staff.lastName}`;
    dropdown.appendChild(option);
  });
}

// export async function ensureBusinessDayOpen(shopId) {
//   const day = await getCurrentBusinessDay(shopId);
//   console.log(shopId, day);
//   if (!day || !day.is_open) {
//     showToast('warning', '⛔ Please open a business day to continue.');
//     return false;
//   }
//   return true;
// }

export async function ensureBusinessDayOpen(shopId) {
  const response = await getCurrentBusinessDay(shopId);
  console.log(shopId, response);

  // Make sure response and response.data exist
  //   if (!response?.success || !response.data) {
  //     showToast('warning', '⛔ Could not verify business day. Try again.');
  //     return false;
  //   }

  const day = response.data;

  if (day === null) {
    showToast('warning', '⛔ Please open a business day to continue.');
    return false;
  }

  return true;
}

export function clearReceiptDiv() {
  // Top Part Below
  document.getElementById('soldDetailShop').textContent = '';
  document.getElementById('soldDetailShopAddress').textContent = '';

  document.getElementById('soldDetailReceiptNumber').textContent = '';
  document.getElementById('soldDetailCustomerName').textContent = '';
  document.getElementById('soldDetailStaffName').textContent = '';
  document.getElementById('soldDetailDate').textContent = '';

  // Bottom Part Below

  document.getElementById('soldDetailPaymentMethod').textContent = '';

  document.getElementById('soldDetailTotalAmount').textContent = '';
  document.getElementById('soldDetailPaidAmount').textContent = '';
  document.getElementById('soldDetailBalanceAmount').textContent = '';

  document.getElementById('soldDetailStatus').textContent = '';

  // Sales Items - Middle Part Below
  const itemsTableBody = document.querySelector('.itemsTable tbody');
  itemsTableBody.innerHTML = ''; // clear previous rows
}
