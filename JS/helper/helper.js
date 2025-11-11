// isUserLoggedIn() - Used to make sure that a user is loggedin before running functions that needs to run automatically so that they don rn on Authenyication pages

import config from '../../config';
import { getCurrentBusinessDay } from '../apiServices/pos/posResources';
import { showToast } from '../script';

export function isUserLoggedIn() {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('userData');
  return Boolean(token && user);
}

const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;
const isAdmin = parsedUserData?.accountType === 'ADMIN';
const businessName = parsedUserData?.businessName;

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
  const addExistingProductForm = document.querySelector(
    '.addExistingProductModal'
  );
  const openBusinessDayForm = document.querySelector('.openBusinessDayModal');
  const checkoutForm = document.querySelector('.checkout-form');
  const updatePartialPaymentForm = document.querySelector(
    '.updatePartialPaymentForm'
  );
  const restockForm = document.querySelector('.restock');

  const activateBusinessContainerForm = document.querySelector(
    '.activateBusinessContainerModal'
  );

  const restrictBusinessContainerForm = document.querySelector(
    '.restrictBusinessContainerModal'
  );

  const notifyBusinessContainerForm = document.querySelector(
    '.notifyBusinessContainerModal'
  );

  const updateBusinessContainerForm = document.querySelector(
    '.updateBusinessDataContainerModal'
  );

  const moveStockModalForm = document.querySelector('.moveStockModal');

  //   Clear Search Input
  const searchProductInput = document.querySelector('.searchProductInput');
  if (searchProductInput) searchProductInput.value = '';

  const searchStockProdutItem = document.querySelector(
    '.searchStockProdutItem'
  );
  if (searchStockProdutItem) searchStockProdutItem.value = '';

  // Clear Form Implementations

  if (moveStockModalForm) {
    moveStockModalForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    const stockQuantittyAvailableDisplay = document.querySelector(
      '.stockQuantityAvailable'
    );

    if (stockQuantittyAvailableDisplay)
      stockQuantittyAvailableDisplay.innerText = '';
  }

  if (updateBusinessContainerForm) {
    updateBusinessContainerForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });
  }

  if (notifyBusinessContainerForm) {
    notifyBusinessContainerForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });
  }

  if (restrictBusinessContainerForm) {
    restrictBusinessContainerForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });
  }

  if (activateBusinessContainerForm) {
    activateBusinessContainerForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });
  }

  if (restockForm) {
    restockForm.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = '';
      }
    });

    const restockSearchSection = document.querySelector(
      '.restockSearch-section'
    );
    if (restockSearchSection) restockSearchSection.style.display = 'none';

    // const adminSellProductCategorySection = document.querySelector(
    //   '.addExistingSellProductCategory-section'
    // );
    //  if (adminSellProductCategorySection)
    //    adminSellProductCategorySection.style.display = 'none';

    const restockProductNameDiv = document.querySelector(
      '.restockProductNameDiv'
    );
    if (restockProductNameDiv) restockProductNameDiv.style.display = 'none';

    const restockAutocompleteList = document.getElementById(
      'restockAutocompleteList'
    );
    if (restockAutocompleteList) restockAutocompleteList.style.display = 'none';

    const prevStockQtyDisplay = document.querySelector(
      '.previousStockQuantityAvailable'
    );

    if (prevStockQtyDisplay) prevStockQtyDisplay.innerText = '';

    delete restockForm.dataset.shopId;
    delete restockForm.dataset.productId;
  }

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
  //   if (createPosTransactionForm) {
  //     createPosTransactionForm
  //       .querySelectorAll('input, textarea, select')
  //       .forEach((el) => {
  //         if (el.type === 'checkbox' || el.type === 'radio') {
  //           el.checked = false;
  //         } else {
  //           el.value = '';
  //         }
  //       });

  //     delete createPosTransactionForm.dataset.staffId;
  //   }

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

    delete updateProductForm.dataset.productId;
  }

  // Clear Add Existing  Product Form Inputs
  if (addExistingProductForm) {
    addExistingProductForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    const adminSellProductSearchSection = document.querySelector(
      '.addExistingSellProductSearch-section'
    );
    const adminSellProductCategorySection = document.querySelector(
      '.addExistingSellProductCategory-section'
    );
    const adminSellProductName = document.querySelector(
      '.addExistingSellProductName'
    );
    const adminAutocompleteList = document.getElementById(
      'addExistingAutocompleteList'
    );

    if (adminSellProductSearchSection)
      adminSellProductSearchSection.style.display = 'none';
    if (adminSellProductCategorySection)
      adminSellProductCategorySection.style.display = 'none';
    if (adminSellProductName) adminSellProductName.style.display = 'none';
    if (adminAutocompleteList) adminAutocompleteList.style.display = 'none';

    delete addExistingProductForm.dataset.shopId;
    delete addExistingProductForm.dataset.productId;
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

  // Clear Checkout Form Inputs
  if (updatePartialPaymentForm) {
    updatePartialPaymentForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else if (el.type === 'select-one') {
          el.value = 'CARD';
        } else {
          el.value = '';
        }
      });

    const partialPaymentStatusText = document.querySelector(
      '.partialPaymentStatusText'
    );
    if (partialPaymentStatusText)
      partialPaymentStatusText.textContent =
        'Partial Payment Status: ₦0 paid | ₦0 remaining';

    delete updatePartialPaymentForm.dataset.saleId;
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

// Format Fee type
export function formatFeeType(value) {
  switch (value.toLowerCase()) {
    case 'machine_fee':
      return 'Machine Fee';
    case 'transfer_fee':
      return 'Transfer Fee';
    case 'tax_fee':
      return 'Tax Fee';
    default:
      return value;
  }
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

// Format transaction type
export function formatTransactionBreakdown(value) {
  switch (value.toLowerCase()) {
    case 'total_withdrawals':
      return 'Total Withdrawals';
    case 'total_deposits':
      return 'Total Deposits';
    case 'total_bill_payments':
      return 'Total Bill Payment';
    case 'total_transfers':
      return 'Total Transfers';
    case 'total_transactions':
      return 'Total Transactions';
    default:
      return value;
  }
}

// Format Unit Type
export function formatUnitType(value) {
  switch (value.toLowerCase()) {
    case 'per_item':
      return 'Per Item';
    case 'dozen':
      return 'Dozen';
    case 'cartons':
      return 'Carton';
    case 'liters':
      return 'Liters';
    case 'yard':
      return 'Yard';
    case 'gram':
      return 'Gram';
    case 'kilogram':
      return 'Kilogram';
    default:
      return value;
  }
}

// Format Unit Type
export function formatActionType(value) {
  switch (value.toLowerCase()) {
    case 'added':
      return 'Added';
    case 'restocked':
      return 'Restocked';
    case 'moved':
      return 'Moved';
    case 'deleted':
      return 'Deleted';
    default:
      return value;
  }
}

// Format Service Permission
export function formatServicePermission(value) {
  switch (value.toLowerCase()) {
    case 'pos_transactions':
      return 'POS Transactions';
    case 'inventory_sales':
      return 'Sales & Inventory';
    case 'both':
      return 'POS & Sales';
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
  const fundMachineAmountInput = document.getElementById('fundMachineAmount');
  const posTransactionAmountInput = document.getElementById(
    'posTransactionAmount'
  );
  const posTransferAmountInput = document.getElementById('posTransferAmount');
  const adminPosTransactionAmountInput = document.getElementById(
    'adminPosTransactionAmount'
  );
  const adminPosTransferAmountInput = document.getElementById(
    'adminPosTransferAmount'
  );
  const adminWithdrawalAmountInput = document.getElementById(
    'adminWithdrawalAmount'
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
  const adminFundMachineAmount = document.getElementById(
    'adminFundMachineAmount'
  );
  const adminSoldProductPrice = document.getElementById(
    'adminSoldProductPrice'
  );
  const soldProductPrice = document.getElementById('soldProductPrice');
  const amountPaid = document.getElementById('amount-paid');
  const productBalancePrice = document.getElementById('productBalancePrice');
  const additionalSalePayment = document.getElementById(
    'additionalSalePayment'
  );
  const itemNewPurchasePrice = document.getElementById('itemNewPurchasePrice');
  const itemNewSellingPrice = document.getElementById('itemNewSellingPrice');

  const updateMachineFeesMinAmount = document.getElementById(
    'updateMachineFeesMinAmount'
  );

  const updateMachineFeesMaxAmount = document.getElementById(
    'updateMachineFeesMaxAmount'
  );

  const updateMachineFeesAmount = document.getElementById(
    'updateMachineFeesAmount'
  );

  const posTransactionCharges = document.getElementById(
    isAdmin ? 'adminPosTransactionCharges' : 'posTransactionFee'
  );

  const posMachineFee = document.getElementById(
    isAdmin ? 'adminPosMachineFee' : 'posMachineFee'
  );

  const moveStockSellingPrice = document.getElementById(
    'moveStockSellingPrice'
  );

  const posTaxFee = document.getElementById(
    isAdmin ? 'adminPosTaxFee' : 'posTaxFee'
  );

  const posTransferFee = document.getElementById(
    isAdmin ? 'adminPosTransferFee' : 'posTransferFee'
  );

  //  const unitPriceInput = document.querySelector('.unit-price-input');

  //  if (unitPriceInput)
  //    unitPriceInput.addEventListener('input', function () {
  //      console.log('object');
  //      formatAmountWithCommasOnInput(unitPriceInput);
  //    });

  if (posTransferFee)
    posTransferFee.addEventListener('input', function () {
      formatAmountWithCommasOnInput(posTransferFee);
    });

  if (posTaxFee)
    posTaxFee.addEventListener('input', function () {
      formatAmountWithCommasOnInput(posTaxFee);
    });

  if (moveStockSellingPrice)
    moveStockSellingPrice.addEventListener('input', function () {
      formatAmountWithCommasOnInput(moveStockSellingPrice);
    });

  if (posMachineFee)
    posMachineFee.addEventListener('input', function () {
      formatAmountWithCommasOnInput(posMachineFee);
    });

  if (posTransactionCharges)
    posTransactionCharges.addEventListener('input', function () {
      formatAmountWithCommasOnInput(posTransactionCharges);
    });

  if (updateMachineFeesAmount)
    updateMachineFeesAmount.addEventListener('input', function () {
      formatAmountWithCommasOnInput(updateMachineFeesAmount);
    });

  if (updateMachineFeesMaxAmount)
    updateMachineFeesMaxAmount.addEventListener('input', function () {
      formatAmountWithCommasOnInput(updateMachineFeesMaxAmount);
    });

  if (updateMachineFeesMinAmount)
    updateMachineFeesMinAmount.addEventListener('input', function () {
      formatAmountWithCommasOnInput(updateMachineFeesMinAmount);
    });

  if (itemNewSellingPrice)
    itemNewSellingPrice.addEventListener('input', function () {
      formatAmountWithCommasOnInput(itemNewSellingPrice);
    });

  if (itemNewPurchasePrice)
    itemNewPurchasePrice.addEventListener('input', function () {
      formatAmountWithCommasOnInput(itemNewPurchasePrice);
    });

  if (posCapitalAmountInput)
    posCapitalAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(posCapitalAmountInput);
    });

  if (fundMachineAmountInput)
    fundMachineAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(fundMachineAmountInput);
    });

  if (posTransactionAmountInput)
    posTransactionAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(posTransactionAmountInput);
    });

  if (posTransferAmountInput)
    posTransferAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(posTransferAmountInput);
    });

  if (adminPosTransactionAmountInput)
    adminPosTransactionAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminPosTransactionAmountInput);
    });

  if (adminPosTransferAmountInput)
    adminPosTransferAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminPosTransferAmountInput);
    });

  if (adminWithdrawalAmountInput)
    adminWithdrawalAmountInput.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminWithdrawalAmountInput);
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

  if (adminFundMachineAmount)
    adminFundMachineAmount.addEventListener('input', function () {
      formatAmountWithCommasOnInput(adminFundMachineAmount);
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

  if (additionalSalePayment)
    additionalSalePayment.addEventListener('input', function () {
      formatAmountWithCommasOnInput(additionalSalePayment);
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
  const formatted = date.toLocaleString('en-UK', options);

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

export function generateEAN13() {
  // Step 1: Generate first 12 random digits
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += Math.floor(Math.random() * 10); // 0–9
  }

  // Step 2: Calculate checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(code.charAt(i), 10);
    if (i % 2 === 0) {
      // odd position in EAN (index starts at 0)
      sum += digit;
    } else {
      // even position in EAN
      sum += digit * 3;
    }
  }
  const checksum = (10 - (sum % 10)) % 10;

  // Step 3: Append checksum to get full EAN-13
  return code + checksum;
}

export function generateSKU(businessName) {
  if (!businessName || typeof businessName !== 'string') {
    return 'GEN' + Math.floor(10000 + Math.random() * 99999);
  }

  // Step 1: Split the name into words
  const words = businessName.trim().split(/\s+/);

  // Step 2: Build acronym (up to 3 letters)
  let acronym = '';
  if (words.length === 1) {
    // Only one word → take up to 3 letters from it
    acronym = words[0].substring(0, 3);
  } else {
    // Take the first letter of the first 3 words
    acronym = words
      .slice(0, 3)
      .map((w) => w[0])
      .join('');
  }

  acronym = acronym.toUpperCase();

  // Step 3: Generate random 4-digit number
  const randomDigits = Math.floor(10000 + Math.random() * 99999);

  // Step 4: Combine with hyphen
  const sku = `${acronym}${randomDigits}`;

  console.log(sku);

  return sku;
}

export function getBarcodeFormat(barcode) {
  // If contains letters → must use CODE128
  if (/[a-zA-Z]/.test(barcode)) {
    return 'CODE128';
  }

  // If only digits
  if (/^\d+$/.test(barcode)) {
    if (barcode.length === 13) {
      return 'EAN13'; // ideal case
    }
    // Still numeric but not EAN13 length → fallback
    return 'CODE128';
  }

  // Default fallback
  return 'CODE128';
}

// export function generateBarcode() {
//   const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//   const alphanumerics = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

//   const prefix = letters.charAt(Math.floor(Math.random() * letters.length));

//   let body = '';
//   for (let i = 0; i < 9; i++) {
//     body += alphanumerics.charAt(
//       Math.floor(Math.random() * alphanumerics.length)
//     );
//   }

//   return prefix + body;
// }

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
  //   console.log(shopId, response);

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

export function truncateProductNames(namesArray, options) {
  const {
    maxItems = Infinity,
    maxLength = Infinity,
    separator = ', ',
  } = options;

  let resultNames = [];
  let currentLength = 0;
  let truncated = false;

  for (let i = 0; i < namesArray.length; i++) {
    const name = namesArray[i];
    const nameWithSeparatorLength =
      name.length + (i > 0 ? separator.length : 0);

    if (
      currentLength + nameWithSeparatorLength > maxLength &&
      resultNames.length > 0
    ) {
      truncated = true;
      break;
    }
    if (resultNames.length >= maxItems) {
      truncated = true;
      break;
    }

    resultNames.push(name);
    currentLength += nameWithSeparatorLength;
  }

  let finalString = resultNames.join(separator);

  if (finalString.length > maxLength && maxLength !== Infinity) {
    finalString = finalString.substring(0, maxLength).trim();
    truncated = true;
  }

  if (truncated && namesArray.length > resultNames.length) {
    return finalString + '...';
  } else if (
    truncated &&
    namesArray.length === resultNames.length &&
    finalString.length === maxLength
  ) {
    return finalString + '...';
  }

  return finalString;
}
export function truncateProductUnitPrice(priceArray, options) {
  const {
    maxItems = Infinity,
    maxLength = Infinity,
    separator = ', ',
  } = options;

  let resultPrices = [];
  let currentLength = 0;
  let truncated = false;

  for (let i = 0; i < priceArray.length; i++) {
    const price = priceArray[i];
    const priceWithSeparatorLength =
      price.length + (i > 0 ? separator.length : 0);

    if (
      currentLength + priceWithSeparatorLength > maxLength &&
      resultPrices.length > 0
    ) {
      truncated = true;
      break;
    }
    if (resultPrices.length >= maxItems) {
      truncated = true;
      break;
    }

    resultPrices.push(price);
    currentLength += priceWithSeparatorLength;
  }

  let finalString = resultPrices.join(separator);

  if (finalString.length > maxLength && maxLength !== Infinity) {
    finalString = finalString.substring(0, maxLength).trim();
    truncated = true;
  }

  if (truncated && priceArray.length > resultPrices.length) {
    return finalString + '...';
  } else if (
    truncated &&
    priceArray.length === resultPrices.length &&
    finalString.length === maxLength
  ) {
    return finalString + '...';
  }

  return finalString;
}

export function getFilterDates(timeframe, elements) {
  const { dayInput, weekInput, monthInput, customStart, customEnd } = elements;
  let startDate, endDate;

  switch (timeframe) {
    case 'daily':
      startDate = endDate = dayInput.value;
      break;

    case 'weekly':
      const [year, week] = weekInput.value.split('-W');
      if (year && week) {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const monday = new Date(simple);
        if (dow <= 4) monday.setDate(simple.getDate() - simple.getDay() + 1);
        else monday.setDate(simple.getDate() + 8 - simple.getDay());

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        startDate = monday.toISOString().split('T')[0];
        endDate = sunday.toISOString().split('T')[0];
      }
      break;

    case 'monthly':
      const [y, m] = monthInput.value.split('-');
      const first = new Date(y, m - 1, 1);
      const last = new Date(y, m, 0);
      startDate = first.toISOString().split('T')[0];
      endDate = last.toISOString().split('T')[0];
      break;

    case 'custom':
      startDate = customStart.value;
      endDate = customEnd.value;
      break;
  }

  return { startDate, endDate };
}

// Get Monday of a specific ISO week
function getDateOfISOWeek(week, year) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const day = simple.getDay();
  const ISOweekStart = simple;
  if (day <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatKey(str) {
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
