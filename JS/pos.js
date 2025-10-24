import './script.js';
import {
  getPosTransactions,
  createPosTransaction,
  addPosCapital,
  openaddPosChargeModal,
  configurePosCharges,
  openAddMachineFeeModal,
  configurePosMachineFees,
  getPosChargeSettings,
  getFeeSettings,
  getCurrentBusinessDay,
  openDepositPosCapitalModal,
  openAdminDepositPosCapitalModal,
  deleteFeeSettings,
  updateFeeSetting,
  openAdminFundMachineModal,
  openFundMachineModal,
  addFundMachine,
  createAdminWithdrawal,
} from './apiServices/pos/posResources';
import { closeModal, setupModalCloseButtons, showToast } from './script';
import config from '../config.js';
import {
  clearFormInputs,
  ensureBusinessDayOpen,
  formatAmountWithCommas,
  formatAmountWithCommasOnInput,
  formatDateTimeReadable,
  formatFeeType,
  formatTransactionType,
  getAmountForSubmission,
  hideBtnLoader,
  hideGlobalLoader,
  populateBusinessShopDropdown,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper.js';
import { populateGoodsShopDropdown } from './goods.js';
import { checkAndPromptCreateShop } from './apiServices/shop/shopResource.js';
import {
  initAccountOverview,
  updateCashInMachineUI,
} from './apiServices/account/accountOverview.js';
import { getBusinessSettings } from './apiServices/business/businessResource.js';

const userData = config.userData;
const dummyShopId = config.dummyShopId;

const parsedUserData = userData ? JSON.parse(userData) : null;
const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const staffShopId = parsedUserData?.shopId;

if (isAdmin) {
  document.addEventListener('DOMContentLoaded', () => {
    getPosChargeSettings();
    getFeeSettings();
  });
}

const adminPosContainer = document.querySelector('.adminPosContainer');

const staffPosContainer = document.querySelector('.staffPosContainer');

// if ((isAdmin && adminPosContainer) || staffPosContainer) {
//   if (adminPosContainer) adminPosContainer.style.display = 'block';
//   if (staffPosContainer) staffPosContainer.style.display = 'none';

//   async function loadShopDropdown() {
//     try {
//       showGlobalLoader();
//       const { enrichedShopData } = await checkAndPromptCreateShop();
//       populateBusinessShopDropdown(enrichedShopData, 'posShopDropdown');
//       hideGlobalLoader();
//     } catch (err) {
//       hideGlobalLoader();
//       console.error('Failed to load dropdown:', err.message);
//     }
//   }

//   loadShopDropdown();
// } else {
//   if (adminPosContainer) adminPosContainer.style.display = 'none';
//   if (staffPosContainer) staffPosContainer.style.display = 'block';
// }

if (isAdmin && adminPosContainer) {
  if (adminPosContainer) adminPosContainer.style.display = 'block';
  if (staffPosContainer) staffPosContainer.innerHTML = '';
  if (staffPosContainer) staffPosContainer.style.display = 'none';

  async function loadShopDropdown() {
    try {
      showGlobalLoader();
      const { enrichedShopData } = await checkAndPromptCreateShop();
      populateBusinessShopDropdown(enrichedShopData, 'posShopDropdown');
      populateBusinessShopDropdown(enrichedShopData, 'posShopDropdown-2');
      hideGlobalLoader();
    } catch (err) {
      hideGlobalLoader();
      console.error('Failed to load dropdown:', err.message);
    }
  }

  loadShopDropdown();
} else {
  if (adminPosContainer) adminPosContainer.innerHTML = '';
  if (adminPosContainer) adminPosContainer.style.display = 'none';
  if (staffPosContainer) staffPosContainer.style.display = 'block';
}

// JavaScript for POS Form

// Function to deposit POS Capital - Added to script.js because of scope.

if (isAdmin) {
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
        'adminFundMachineShopDropdown'
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
        shopId: isAdmin ? adminDepositposCapitalShopDropdown : staffShopId,
        amount: Number(getAmountForSubmission(posDepositAmount)),
      };

      // console.log('Sending POS Capital with:', posCapitalDetails);
      const submitPosCapital = document.querySelector('.submitPosCapital');

      try {
        showBtnLoader(submitPosCapital);
        showGlobalLoader();
        const addPosCapitalData = await addPosCapital(posCapitalDetails);

        if (addPosCapitalData) {
          initAccountOverview();
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

export function bindFundMachineFormListener() {
  const form = isAdmin
    ? document.querySelector('.adminFundMachineModal')
    : document.querySelector('.staffFundMachineModal');

  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const adminFundMachineShopDropdown = document.querySelector(
        '#adminFundMachineShopDropdown'
      ).value;

      const fundMachineAmount = isAdmin
        ? document.querySelector('#adminFundMachineAmount')
        : document.querySelector('#fundMachineAmount');

      const fundMachineDetails = {
        shopId: isAdmin ? adminFundMachineShopDropdown : staffShopId,
        amount: Number(getAmountForSubmission(fundMachineAmount)),
      };

      // console.log('Sending POS Capital with:', fundMachineDetails);
      const submitFundMachine = document.querySelector('.submitFundMachine');

      try {
        showBtnLoader(submitFundMachine);
        showGlobalLoader();
        const addFundMachineData = await addFundMachine(fundMachineDetails);

        if (addFundMachineData) {
          //  initAccountOverview();
          showToast('success', `✅ ${addFundMachineData.message}`);
          closeModal();
        }

        // closeModal(); // close modal after success
      } catch (err) {
        console.error('Error adding POS Capital:', err.message);
        showToast('fail', `❎ ${err.message}`);
      } finally {
        hideBtnLoader(submitFundMachine);
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

export function fundMachineForm() {
  const form = isAdmin
    ? document.querySelector('.adminFundMachineModal')
    : document.querySelector('.staffFundMachineModal');

  if (!form) return;
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector('#depositPosCapitalBtn')
    ?.addEventListener(
      'click',
      isAdmin ? openAdminDepositPosCapitalModal : openDepositPosCapitalModal
    );

  const fundMachineBtn = document.querySelector('#fundMachineBtn');

  isAdmin ? fundMachineBtn?.classList.remove('hidden') : '';

  fundMachineBtn?.addEventListener(
    'click',
    isAdmin ? openAdminFundMachineModal : openFundMachineModal
  );

  bindDepositPosCapitalFormListener(); // Only once
  bindFundMachineFormListener(); // Only once
});

document.addEventListener('DOMContentLoaded', async () => {
  const businessSettings = await getBusinessSettings();
  const businessSettingsData = businessSettings?.data;

  if (!businessSettings) return;

  console.log(businessSettingsData);

  const posTransactionChargesDiv = document.querySelector(
    isAdmin ? '.adminPosTransactionChargesDiv' : '.posTransactionChargesDiv'
  );

  const posTransactionChargesInput = document.getElementById(
    isAdmin ? 'adminPosMachineFee' : 'posMachineFee'
  );

  const posMachineFeeDiv = document.querySelector(
    isAdmin ? '.adminPosMachineFeeDiv' : '.posMachineFeeDiv'
  );

  const posMachineFeeInput = document.getElementById(
    isAdmin ? 'adminPosMachineFee' : 'posMachineFee'
  );

  if (posTransactionChargesDiv) {
    if (businessSettingsData.pos_manual_charge === true) {
      posTransactionChargesDiv.classList.remove('hidden');
      posTransactionChargesInput.setAttribute('required', 'true');
    } else {
      posTransactionChargesDiv.classList.add('hidden');
      posTransactionChargesInput.removeAttribute('required');
      posTransactionChargesInput.value = '';
    }
  }

  if (posMachineFeeDiv) {
    if (businessSettingsData.manual_machine_fee_mode === true) {
      posMachineFeeDiv.classList.remove('hidden');
      posMachineFeeInput.setAttribute('required', 'true');
    } else {
      posMachineFeeDiv.classList.add('hidden');
      posMachineFeeInput.removeAttribute('required');
      posMachineFeeInput.value = '';
    }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  if (isStaff) {
    const businessDay = await getCurrentBusinessDay(staffShopId);
    const openingCash = businessDay?.data?.opening_cash || 0;

    if (
      businessDay.data === false ||
      businessDay.data === null ||
      businessDay.success === false
    ) {
      return;
    }
    updateCashInMachineUI(openingCash);
    initAccountOverview();
  }

  if (isAdmin) {
    //  document.querySelector('.pos-method-form').style.display = 'block';
    const posShopDropdown = document.getElementById('posShopDropdown');
    const posShopDropdownWithdrawal =
      document.getElementById('posShopDropdown-2');
    const posTransactionSummary = document.querySelector(
      '.posTransactions-summary'
    );
    if (posTransactionSummary) posTransactionSummary.style.display = 'none';

    if (posShopDropdown)
      posShopDropdown.addEventListener('change', async function (e) {
        const selectedShopId = e.target.value;
        clearPosSummaryDiv();
        posTransactionSummary.style.display = 'flex';

        if (!selectedShopId) {
          posTransactionSummary.style.display = 'none';
          return;
        }

        const businessDay = await getCurrentBusinessDay(selectedShopId);
        console.log('new Business Day:', businessDay.data);

        const openingCash = businessDay?.data?.opening_cash || 0;
        updateCashInMachineUI(openingCash);

        //   console.log('Selected Shop ID:', selectedShopId);

        try {
          //  console.log('we are here');
          initAccountOverview();
        } catch (error) {
          console.error('Error fetching POS Summary Details:', error.message);
          showToast(
            'fail',
            `❎ Error fetching POS Summary Details: ${error.message}`
          );
        }
      });

    if (posShopDropdownWithdrawal)
      posShopDropdownWithdrawal.addEventListener('change', async function (e) {
        const selectedShopId = e.target.value;

        //   console.log(selectedShopId);
        clearPosSummaryDiv();
        posTransactionSummary.style.display = 'flex';

        if (!selectedShopId) {
          posTransactionSummary.style.display = 'none';
          return;
        }

        const businessDay = await getCurrentBusinessDay(selectedShopId);
        console.log('new Business Day:', businessDay.data);

        const openingCash = businessDay?.data?.opening_cash || 0;
        updateCashInMachineUI(openingCash);

        //   console.log('Selected Shop ID:', selectedShopId);

        try {
          //  console.log('we are here 2');
          initAccountOverview();
        } catch (error) {
          console.error('Error fetching POS Summary Details:', error.message);
          showToast(
            'fail',
            `❎ Error fetching POS Summary Details: ${error.message}`
          );
        }
      });
  }

  function clearPosSummaryDiv() {
    document.getElementById('adminTotalPosCapital').innerHTML = 0;
    document.getElementById('adminCashInMachine').innerHTML = 0;
    document.getElementById('adminCashAtHand').innerHTML = 0;
    document.getElementById('adminTotalPosCharges').innerHTML = 0;
    document.getElementById('adminCashCharges').innerHTML = 0;
    document.getElementById('adminMachineCharges').innerHTML = 0;
    document.getElementById('adminMachineFee').innerHTML = 0;
  }
});

// POS Form submission
const transactionTypeSelect = document.getElementById(
  isAdmin ? 'adminTransactionType' : 'transactionType'
);

const numberOfWithdrawalsSelect = document.getElementById(
  isAdmin ? 'adminNumberOfWithdrawals' : 'numberOfWithdrawals'
);
const numberOfTransferSelect = document.getElementById(
  isAdmin ? 'adminNumberOfTransfer' : 'numberOfTransfer'
);

const numberOfWithdrawalsDiv = numberOfWithdrawalsSelect?.closest(
  '.pos-method-form_input'
);
const numberOfTransferDiv = numberOfTransferSelect?.closest(
  '.pos-method-form_input'
);

const defaultWithdrawalAmountInput = document.getElementById(
  isAdmin ? 'adminPosTransactionAmount' : 'posTransactionAmount'
);
const defaultTransferAmountInput = document.getElementById(
  isAdmin ? 'adminPosTransferAmount' : 'posTransferAmount'
);

const transactionAmountLabel = defaultWithdrawalAmountInput
  ?.closest('.pos-method-form_input')
  ?.querySelector('label');

//  Correct dynamic container placement
const withdrawalAmountContainer = defaultWithdrawalAmountInput?.closest(
  '.naira-input-container'
);
const transferAmountContainer = defaultTransferAmountInput?.closest(
  '.naira-input-container'
);

// Create and place dynamic input containers directly below their default amount
const dynamicWithdrawalContainer = document.createElement('div');
const dynamicTransferContainer = document.createElement('div');
dynamicWithdrawalContainer.id = 'dynamicAmountFields';
dynamicTransferContainer.id = 'dynamicTransferAmountFields';
dynamicWithdrawalContainer.style.marginTop = '1rem';
dynamicTransferContainer.style.marginTop = '1rem';

withdrawalAmountContainer?.parentNode.appendChild(dynamicWithdrawalContainer);
transferAmountContainer?.parentNode.appendChild(dynamicTransferContainer);

// ========== TOGGLE ==========
function toggleTransactionOptions() {
  const method = transactionTypeSelect?.value;
  const transferAmountDiv = defaultTransferAmountInput?.closest(
    '.pos-method-form_input'
  );

  if (method === 'withdrawal_transfer') {
    if (numberOfWithdrawalsDiv) numberOfWithdrawalsDiv.style.display = 'block';
    if (numberOfTransferDiv) numberOfTransferDiv.style.display = 'block';
    if (transferAmountDiv) transferAmountDiv.style.display = 'block';
    if (dynamicWithdrawalContainer)
      dynamicWithdrawalContainer.style.display = 'block';
    if (dynamicTransferContainer)
      dynamicTransferContainer.style.display = 'block';

    if (defaultWithdrawalAmountInput)
      defaultWithdrawalAmountInput.placeholder = 'Enter Withdrawal Amount 1';
    if (defaultTransferAmountInput)
      defaultTransferAmountInput.placeholder = 'Enter Transfer Amount 1';

    if (transactionAmountLabel) {
      transactionAmountLabel.textContent = 'Withdrawal Amount';
    }

    renderAmountInputs();
  } else {
    if (numberOfWithdrawalsDiv) numberOfWithdrawalsDiv.style.display = 'none';
    if (numberOfTransferDiv) numberOfTransferDiv.style.display = 'none';
    if (transferAmountDiv) transferAmountDiv.style.display = 'none';
    if (dynamicWithdrawalContainer)
      dynamicWithdrawalContainer.style.display = 'none';
    if (dynamicTransferContainer)
      dynamicTransferContainer.style.display = 'none';

    if (dynamicWithdrawalContainer) dynamicWithdrawalContainer.innerHTML = '';
    if (dynamicTransferContainer) dynamicTransferContainer.innerHTML = '';

    if (defaultWithdrawalAmountInput)
      defaultWithdrawalAmountInput.placeholder = 'Enter Amount';
    if (defaultTransferAmountInput)
      defaultTransferAmountInput.placeholder = 'Enter Amount';

    if (transactionAmountLabel) {
      transactionAmountLabel.textContent = 'Transaction Amount';
    }
  }
}

// ========== DYNAMIC INPUTS ==========
function renderAmountInputs() {
  const withdrawalCount = parseInt(numberOfWithdrawalsSelect?.value || '1');
  const transferCount = parseInt(numberOfTransferSelect?.value || '1');

  // Preserve and reuse filled values
  updateInputs(
    dynamicWithdrawalContainer,
    withdrawalCount,
    'Withdrawal Amount',
    'posWithdrawalAmount_'
  );
  updateInputs(
    dynamicTransferContainer,
    transferCount,
    'Transfer Amount',
    'posTransferAmount_'
  );
}

function updateInputs(container, count, labelPrefix, namePrefix) {
  const existingInputs = container.querySelectorAll('input');
  const existingCount = existingInputs.length;

  // Add new inputs if needed
  for (let i = existingCount + 2; i <= count; i++) {
    const inputWrapper = createInputWithLabel(
      `${labelPrefix} ${i}`,
      `${namePrefix}${i}`
    );
    container.appendChild(inputWrapper);
  }

  // Remove extra inputs if reduced
  for (let i = existingCount + 1; i > count; i--) {
    const inputToRemove = container.querySelector(`[name="${namePrefix}${i}"]`);
    inputToRemove?.parentNode?.remove();
  }
}

// ========== UTIL: Create Input ==========
function createInputWithLabel(placeholder, name) {
  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'naira-input-container mb-1';

  const input = document.createElement('input');
  input.type = 'text';
  input.name = name;
  input.placeholder = `Enter ${placeholder}`;
  input.classList.add('dynamic-amount-input');

  // Format on input
  input.addEventListener('input', () => formatAmountWithCommasOnInput(input));

  const nairaSpan = document.createElement('span');
  nairaSpan.className = 'naira';
  nairaSpan.innerHTML = '₦';

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(nairaSpan);

  return inputWrapper;
}

// ========== LISTENERS ==========
transactionTypeSelect?.addEventListener('change', toggleTransactionOptions);
numberOfWithdrawalsSelect?.addEventListener('change', renderAmountInputs);
numberOfTransferSelect?.addEventListener('change', renderAmountInputs);

toggleTransactionOptions(); // Initial state

// ========== GLOBAL FORMATTER ==========
document.addEventListener('input', function (e) {
  if (e.target.classList.contains('dynamic-amount-input')) {
    formatAmountWithCommasOnInput(e.target);
  }
});

export async function handlePosFormSubmit() {
  const posForm = document.querySelector('.pos-method-form');

  if (!posForm || posForm.dataset.bound === 'true') return;

  posForm.dataset.bound = 'true';

  if (posForm) {
    posForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const posShopDropdown = document.getElementById('posShopDropdown')?.value;
      const amount = document.getElementById(
        isAdmin ? 'adminPosTransactionAmount' : 'posTransactionAmount'
      ).value;
      // const customerName = document.getElementById(
      //   isAdmin ? 'adminPosCustomerName' : 'posCustomerName'
      // ).value;
      const customerPhone = document.getElementById(
        isAdmin ? 'adminPosCustomerPhone' : 'posCustomerPhone'
      ).value;
      const posFeePaymentType = document.getElementById(
        isAdmin ? 'adminPosFeePaymentType' : 'posFeePaymentType'
      ).value;
      const adminPosTransactionCharges = document.querySelector(
        isAdmin ? '#adminPosTransactionCharges' : '#posTransactionCharges'
      ).value;
      const transactionType = document.getElementById(
        isAdmin ? 'adminTransactionType' : 'transactionType'
      ).value;
      const paymentMethod = document.getElementById(
        isAdmin ? 'adminPaymentMethod' : 'paymentMethod'
      ).value;
      const posTransactionReference = document.getElementById(
        isAdmin ? 'adminPosTransactionReference' : 'posTransactionReference'
      ).value;
      const posTransactionRemark = document.getElementById(
        isAdmin ? 'adminPosTransactionRemark' : 'posTransactionRemark'
      ).value;

      // "transactionType" must be one of [WITHDRAWAL, DEPOSIT, WITHDRAWAL_TRANSFER, BILL_PAYMENT]
      const shopId = isAdmin ? Number(posShopDropdown) : Number(staffShopId);

      // const posFormData = {
      //   shopId,
      //   transactionType: transactionType.toUpperCase(),
      //   amount: Number(getAmountForSubmission(amount)),
      //   //   customerName: customerName,
      //   customerPhone: customerPhone,
      //   paymentMethod: paymentMethod.toUpperCase(),
      //   chargePaymentMethod: posFeePaymentType.toUpperCase(),
      //   remarks: posTransactionRemark,
      //   //   transaction_fee: Number(fee),
      //   //   machine_fee: Number(machineFeeInput),
      // };

      const posFormData = {
        shopId,
        transaction_type: transactionType.toLowerCase(),
        amount: Number(getAmountForSubmission(amount)),
        manual_charges: adminPosTransactionCharges
          ? Number(getAmountForSubmission(adminPosTransactionCharges))
          : null,
        //   customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentMethod.toUpperCase(),
        transaction_mode: posFeePaymentType.toLowerCase(),
        remarks: posTransactionRemark,
        transaction_reference: posTransactionReference,
        //   transaction_fee: Number(fee),
        //   machine_fee: Number(machineFeeInput),
      };

      const posSubmitButton = document.querySelector('.posSubmitButton');

      try {
        //   console.log('📦 POS Ttransaction Details:', posFormData);
        showBtnLoader(posSubmitButton);

        const isDayOpen = await ensureBusinessDayOpen(shopId);
        if (!isDayOpen) {
          hideBtnLoader(posSubmitButton);
          return;
        }

        const posTransactionCreated = await createPosTransaction(posFormData);

        console.log(posTransactionCreated);

        console.log(
          'POS transaction sent successfully:',
          posTransactionCreated
        );
        resetFormInputs();
        showToast('success', `✅ ${posTransactionCreated?.message}`);
        hideBtnLoader(posSubmitButton);
      } catch (err) {
        //   console.error('Error sending POS transaction:', error);
        hideBtnLoader(posSubmitButton);
        showToast('fail', `❎ POS transaction not created: ${err?.message} `);
        // reset form inputs
        resetFormInputs();
      }

      function resetFormInputs() {
        document.getElementById(
          isAdmin ? 'adminTransactionType' : 'transactionType'
        ).value = 'withdraw';
        document.getElementById(
          isAdmin ? 'adminPaymentMethod' : 'paymentMethod'
        ).value = 'card';
        document.getElementById(
          isAdmin ? 'adminPosFeePaymentType' : 'posFeePaymentType'
        ).value = 'card';
        document.getElementById(
          isAdmin ? 'adminPosTransactionAmount' : 'posTransactionAmount'
        ).value = '';
        //   document.getElementById(
        //     isAdmin ? 'adminPosCustomerName' : 'posCustomerName'
        //   ).value = '';
        document.getElementById(
          isAdmin ? 'adminPosTransactionCharges' : 'posTransactionCharges'
        ).value = '';
        document.getElementById(
          isAdmin ? 'adminPosTransactionReference' : 'posTransactionReference'
        ).value = '';
        document.getElementById(
          isAdmin ? 'adminPosCustomerPhone' : 'posCustomerPhone'
        ).value = '';
        document.getElementById(
          isAdmin ? 'adminPosTransactionRemark' : 'posTransactionRemark'
        ).value = '';

        // Hide the dynamic amount fields
        const numberOfWithdrawalsSelect = document.getElementById(
          isAdmin ? 'adminNumberOfWithdrawals' : 'numberOfWithdrawals'
        );
        const numberOfTransferSelect = document.getElementById(
          isAdmin ? 'adminNumberOfTransfer' : 'numberOfTransfer'
        );
        const numberOfWithdrawalsDiv = document
          .querySelector(
            isAdmin
              ? '[name="adminNumberOfWithdrawals"]'
              : '[name="numberOfWithdrawals"]'
          )
          .closest('.pos-method-form_input');
        const numberOfTransferDiv = document
          .querySelector(
            isAdmin
              ? '[name="adminNumberOfTransfer"]'
              : '[name="numberOfTransfer"]'
          )
          .closest('.pos-method-form_input');
        const dynamicAmountContainer = document.getElementById(
          'dynamicAmountFields'
        );

        // Withdrawal and transfer logic
        const defaultAmountInput = document.getElementById(
          isAdmin ? `adminPosTransactionAmount` : `posTransactionAmount`
        );
        const defaultTransferAmountInput = document.getElementById(
          isAdmin ? `adminPosTransferAmount` : `posTransferAmount`
        );

        numberOfWithdrawalsSelect.value = '1';
        numberOfTransferSelect.value = '1';

        defaultWithdrawalAmountInput.placeholder = 'Enter Amount';
        defaultTransferAmountInput.placeholder = 'Enter Amount';
        if (transactionAmountLabel) {
          transactionAmountLabel.textContent = 'Transaction Amount';
        }
        defaultTransferAmountInput.closest(
          '.pos-method-form_input'
        ).style.display = 'none';

        dynamicWithdrawalContainer.innerHTML = '';
        dynamicTransferContainer.innerHTML = '';
        dynamicWithdrawalContainer.style.display = 'none';
        dynamicTransferContainer.style.display = 'none';
        numberOfWithdrawalsDiv.style.display = 'none';
        numberOfTransferDiv.style.display = 'none';

        document.querySelector('.paymentMethodType').style.display = 'block';
        document.querySelector('.posRemarksDiv').style.display = 'block';

        //   document.getElementById('posTransactionFee').value = '';
        //   document.getElementById('posMachineFee').value = '';
        //   document.getElementById('posTransactionConfirmation').value = '';
        //   document.getElementById('posSuccessfulCheckbox').checked = false;
        //   document.getElementById('posPendingCheckbox').checked = false;
      }
    });
  }
}

handlePosFormSubmit();

// Admin Withdrawal
export async function handleAdminWithdrawalFormSubmit() {
  const adminWithdrawalForm = document.querySelector('#adminWithdrawalForm');

  if (!adminWithdrawalForm || adminWithdrawalForm.dataset.bound === 'true')
    return;

  adminWithdrawalForm.dataset.bound = 'true';

  if (adminWithdrawalForm) {
    adminWithdrawalForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const posShopDropdown =
        document.getElementById('posShopDropdown-2')?.value;

      const adminWithdrawalTransactionType = document.getElementById(
        'adminTransactionType-2'
      )?.value;

      const adminWithdrawalMethod = document.getElementById(
        'adminWithdrawalMethod'
      )?.value;

      const adminWithdrawalAmount = document.getElementById(
        'adminWithdrawalAmount'
      )?.value;

      //        "source": "cash_in_machine",
      //   "shopId": {{shop_id}},
      //   "amount": 20000.00

      const adminWithdrawalDetails = {
        shopId: posShopDropdown,
        source: adminWithdrawalTransactionType.toLowerCase(),
        amount: Number(getAmountForSubmission(adminWithdrawalAmount)),
        //   withdrawalMethod: adminWithdrawalMethod.toLowerCase(),
      };

      const adminWithdrawalSubmitButton = document.querySelector(
        '.adminWithdrawalSubmitButton'
      );

      try {
        console.log(
          '📦 Admin Withdrawal Transaction Details:',
          adminWithdrawalDetails
        );
        showBtnLoader(adminWithdrawalSubmitButton);

        const isDayOpen = await ensureBusinessDayOpen(posShopDropdown);
        if (!isDayOpen) {
          hideBtnLoader(adminWithdrawalSubmitButton);
          return;
        }

        const adminWithdrawalData = await createAdminWithdrawal(
          adminWithdrawalDetails
        );

        //   console.log(adminWithdrawalData);

        console.log(
          'Admin Withdrawal transaction sent successfully:',
          adminWithdrawalData
        );
        resetFormInputs();
        showToast('success', `✅ ${adminWithdrawalData?.message}`);
        hideBtnLoader(adminWithdrawalSubmitButton);
      } catch (err) {
        console.error('Error sending Admin Withdrawal transaction:', err);
        hideBtnLoader(adminWithdrawalSubmitButton);
        showToast(
          'fail',
          `❎ Admin Withdrawal transaction not created: ${err?.message} `
        );
        // reset form inputs
        resetFormInputs();
      }

      function resetFormInputs() {
        document.getElementById('posShopDropdown-2').value = posShopDropdown;

        document.getElementById('adminTransactionType-2').value =
          'cash_in_machine';

        document.getElementById('adminWithdrawalMethod').value = 'card';

        document.getElementById('adminWithdrawalAmount').value = '';
      }
    });
  }
}

handleAdminWithdrawalFormSubmit();

document.addEventListener('DOMContentLoaded', () => {
  // Setup for Opening Pos Charges Modal
  setupModalCloseButtons();

  document
    .querySelector('#openAddPosChargeModal')
    ?.addEventListener('click', openaddPosChargeModal);

  document
    .querySelector('#openAddMachineFeeModal')
    ?.addEventListener('click', openAddMachineFeeModal);
});

// Function to open Form to Confiure POS Charges .
export function addPosChargeForm() {
  const form = document.querySelector('.addPosChargeModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const posChargeTransactionType = document.querySelector(
        '#addPosChargeTransactionType'
      ).value;
      const posChargeMinAmount = document.querySelector(
        '#addPosChargeMinAmount'
      ).value;

      const posChargeMaxAmount = document.querySelector(
        '#addPosChargeMaxAmount'
      ).value;

      const posChargeAmount = document.querySelector(
        '#addPosChargeAmount'
      ).value;

      const addPosChargesDetails = {
        transactionType: posChargeTransactionType.toUpperCase(),
        minAmount: Number(getAmountForSubmission(posChargeMinAmount)),
        maxAmount: Number(getAmountForSubmission(posChargeMaxAmount)),
        chargeAmount: Number(getAmountForSubmission(posChargeAmount)),
      };

      // console.log('Configuring POS Charges with:', addPosChargesDetails);

      const addPosChargeBtn = document.querySelector('.addPosChargeBtn');

      try {
        showBtnLoader(addPosChargeBtn);
        const data = await configurePosCharges(addPosChargesDetails);
        if (data) {
          hideBtnLoader(addPosChargeBtn);
          closeModal();
        }
        //   closeModal(); // close modal after success
      } catch (err) {
        console.error('Error COnfiguring POS Charges:', err.message);
        hideBtnLoader(addPosChargeBtn);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function populatePosChargesTable(posChargesData) {
  const tbody = document.querySelector('.posCharge-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  const posCharges = posChargesData.data;

  //   console.log('posCharges', posCharges);

  // Remove static rows and loading

  if (tbody) tbody.innerHTML = '';

  if (!posCharges.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="6" class="table-error-text">No POS Charges Settings found.</td>
      `;
    if (tbody) tbody.appendChild(emptyRow);
    return;
  }

  posCharges.forEach((charge, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    //  console.log('charge', charge);

    const {
      transaction_type,
      min_amount,
      max_amount,
      charge_amount,
      created_at,
    } = charge;

    formatDateTimeReadable(created_at);

    if (row)
      row.innerHTML = `

      <td class="py-1 posChargeSerialNumber">${index + 1}</td>
      <td class="py-1 posChargeType">${formatTransactionType(transaction_type)}
      <td class="py-1 posChargeMinAmount">₦${formatAmountWithCommas(
        min_amount
      )}</td>
      <td class="py-1 posChargeMaxAmount">₦${formatAmountWithCommas(
        max_amount
      )}</td>
      <td class="py-1 posChargeAmount"><strong>₦${formatAmountWithCommas(
        charge_amount
      )}</td>
      <td class="py-1 posChargeCreatedDate"> ${formatDateTimeReadable(
        created_at
      )}
      </td>
       `;

    if (tbody) tbody.appendChild(row);
  });
}

// Function to open Form to Configure POS Machine Fees
export function addMachineFeeForm() {
  const form = document.querySelector('.addMachineFeesModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  const percentageTypeSelect = document.querySelector(
    '#addMachineFeesPercentageType'
  );
  const percentageRateDiv = document.querySelector('.percentageRateDiv');
  const machineFeesAmountDiv = document.querySelector('.machineFeesAmountDiv');

  const machineFeesPercentageRateInput = document.querySelector(
    '#addMachineFeesPercentageRate'
  );
  const machineFeesAmountInput = document.querySelector(
    '#addMachineFeesAmount'
  );

  // Default setup
  percentageTypeSelect.value = 'false';
  percentageRateDiv.style.display = 'none';
  machineFeesAmountDiv.style.display = '';

  machineFeesPercentageRateInput.value = '';
  //   machineFeesAmountInput.value = 0;

  // Ensure proper required attributes
  machineFeesPercentageRateInput.removeAttribute('required');
  machineFeesAmountInput.setAttribute('required', 'true');

  percentageTypeSelect.addEventListener('change', () => {
    const selected = percentageTypeSelect.value;
    console.log('Selected:', selected);

    if (selected === 'true') {
      // Show percentage input, hide fixed amount
      percentageRateDiv.style.display = '';
      machineFeesAmountDiv.style.display = 'none';

      machineFeesAmountInput.value = '';

      // Validation
      machineFeesPercentageRateInput.setAttribute('required', 'true');
      machineFeesAmountInput.removeAttribute('required');
    } else {
      // Show fixed amount input, hide percentage
      percentageRateDiv.style.display = 'none';
      machineFeesAmountDiv.style.display = '';

      machineFeesPercentageRateInput.value = '';

      // Validation
      machineFeesPercentageRateInput.removeAttribute('required');
      machineFeesAmountInput.setAttribute('required', 'true');
    }
  });

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Previously Declared
      // const percentageTypeSelect = document.querySelector(
      //    '#addMachineFeesPercentageType'
      //  );

      const feeType = document.querySelector('#addFeeType').value;
      const feeTransactionType = document.querySelector(
        '#addFeeTransactionType'
      ).value;
      const machineFeesMinAmount = document.querySelector(
        '#addMachineFeesMinAmount'
      ).value;
      const machineFeesMaxAmount = document.querySelector(
        '#addMachineFeesMaxAmount'
      ).value;

      const machineFeesPercentageRate = document.querySelector(
        '#addMachineFeesPercentageRate'
      ).value;

      const machineFeesAmount = document.querySelector(
        '#addMachineFeesAmount'
      ).value;

      const isPercentage = percentageTypeSelect.value === 'true';

      const addFeesDetails = {
        fee_type: feeType.toLowerCase(),
        //   transaction_type: feeTransactionType.toLowerCase(),
        amount_min: Number(getAmountForSubmission(machineFeesMinAmount)),
        amount_max: Number(getAmountForSubmission(machineFeesMaxAmount)),
        //   isPercentage,
        //   ...(isPercentage
        //     ? {
        //         percentageRate: Number(
        //           getAmountForSubmission(machineFeesPercentageRate)
        //         ),
        //       }
        //     : {
        //         fee_amount: Number(getAmountForSubmission(machineFeesAmount)),
        //       }),
        fee_amount: Number(getAmountForSubmission(machineFeesAmount)),
      };

      console.log('Configuring POS Charges with:', addFeesDetails);

      const addMachineFeeBtn = document.querySelector('.addMachineFeeBtn');

      try {
        showBtnLoader(addMachineFeeBtn);
        const data = await configurePosMachineFees(addFeesDetails);
        hideBtnLoader(addMachineFeeBtn);
        if (data) {
          closeModal();
        }
        closeModal(); // close modal after success
      } catch (err) {
        console.error('Error COnfiguring POS Charges:', err.message);
        hideBtnLoader(addMachineFeeBtn);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function populateFeesTable(MachineFeesData) {
  const tbody = document.querySelector('.machineFee-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  const MachineFees = MachineFeesData.data;

  // Remove static rows and loading

  if (tbody) tbody.innerHTML = '';

  if (!MachineFees.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="6" class="table-error-text">No POS Machine Fee Settings found.</td>
      `;
    if (tbody) tbody.appendChild(emptyRow);
    return;
  }

  MachineFees.forEach((charge, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    //  console.log('charge', charge);

    const {
      id: feeId,
      amount_min,
      amount_max,
      is_percentage,
      fee_amount,
      fee_type,
      percentage_rate,
      created_at,
    } = charge;

    if (row)
      row.innerHTML = `

      <td class="py-1 MachineFeeSerialNumber">${index + 1}</td>
      <td class="py-1 MachineFeeSerialNumber">${formatFeeType(fee_type)}</td>
      <td class="py-1 MachineFeeMinAmount">₦${formatAmountWithCommas(
        amount_min
      )}</td>
      <td class="py-1 MachineFeeMaxAmount">₦${formatAmountWithCommas(
        amount_max
      )}</td>
      <td class="py-1 MachineFeeType">${
        is_percentage === 'undefined'
          ? 'N/A'
          : is_percentage === 'true'
          ? 'Percentage'
          : 'N/A'
      }</td>
      <td class="py-1 MachineFeeCreatedDate"> ${
        percentage_rate === 'undefined'
          ? 'N/A'
          : is_percentage === 'true'
          ? 'Percentage'
          : 'N/A'
      }</td>
      <td class="py-1 MachineFeeAmount"><strong>₦${fee_amount}</td>
      </td>
      <td class="py-1 MachineFeeAmount">${formatDateTimeReadable(
        created_at
      )}</td>
      </td>
       <td class="py-1 action-buttons" style="margin-top:1.1rem">
                             <button
                    class="hero-btn-outline openUpdateFeeBtn"
                    id="openUpdateFeeBtn" data-fee-id="${feeId}"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>

                  <button
                    class="hero-btn-outline deleteFeeBtn"
                    id="deleteFeeModalBtn" data-fee-id="${feeId}"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
       `;

    if (tbody) tbody.appendChild(row);

    // Handle Delete Fees Logic
    const deleteFeeModalBtn = row.querySelector(`#deleteFeeModalBtn`);

    deleteFeeModalBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const feeId = deleteFeeModalBtn.dataset.feeId;

      const deleteFeeContainer = document.querySelector('.deleteFeeContainer');

      if (!feeId) return;

      if (deleteFeeContainer) {
        // Store feeId in modal container for reference
        deleteFeeContainer.dataset.feeId = feeId;

        hideGlobalLoader();
        openDeleteFeeModal(); // Show modal after data is ready
        deleteFeeForm(feeId);
      } else {
        hideGlobalLoader();
        showToast('fail', '❌ Failed to fetch Delete Fee.');
      }
    });

    // Update Fee Logic

    const updateFeeBtn = row.querySelector('.openUpdateFeeBtn');

    updateFeeBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const feeId = updateFeeBtn.dataset.feeId;
      const updateFeeModalContainer = document.querySelector('.updateFeeModal');

      if (updateFeeModalContainer) {
        updateFeeModalContainer.dataset.feeId = feeId;

        // Fetch fee detail
        //   const feeDetails = await getFeeSettings();
        const feeDetails = MachineFees;

        if (feeDetails.length > 0) {
          feeDetails.map((fee) => {
            if (fee.id === Number(feeId)) {
              openUpdateFeeButton();

              updateFeeForm(fee);
            }
          });
          hideGlobalLoader();
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch Product details.');
        }
      }
    });
  });
}

export function openDeleteFeeModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const deleteFeeContainer = document.querySelector('.deleteFeeContainer');

  if (deleteFeeContainer) deleteFeeContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

// Delete Fee
export function deleteFeeForm(feeId) {
  const form = document.querySelector('.deleteFeeContainerModal');
  if (!form) return;

  form.dataset.feeId = feeId;
}

export function bindDeleteFeeFormListener() {
  const form = document.querySelector('.deleteFeeContainerModal');
  if (!form) return;

  const deleteFeeButton = form.querySelector('.deleteFeeButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    deleteFeeButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const feeId = form.dataset.feeId;

      if (!feeId) {
        showToast('fail', '❎ No Fee ID found.');
        return;
      }

      try {
        showBtnLoader(deleteFeeButton);
        const deletedFeeData = await deleteFeeSettings(feeId);

        if (deletedFeeData) {
          showToast('success', `✅ ${deletedFeeData?.message}`);
          hideBtnLoader(deleteFeeButton);
          closeModal();
        }
      } catch (err) {
        hideBtnLoader(deleteFeeButton);
        showToast('fail', `❎ ${err.message}`);
      } finally {
        hideBtnLoader(deleteFeeButton);
      }
    });
  }
}

// Update Fee
export function openUpdateFeeButton() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateFeeContainer = document.querySelector('.updateFee');

  if (updateFeeContainer) updateFeeContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  //   updateFeeForm();
}

export function bindUpdateFeeFormListener() {
  const form = document.querySelector('.updateFeeModal');
  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const feeId = form.dataset.feeId;

      if (!feeId) {
        showToast('fail', '❎ No Product selected for update.');
        return;
      }

      const feeTransactionType = document.querySelector(
        '#updateFeeTransactionType'
      ).value;
      const machineFeesMinAmount = document.querySelector(
        '#updateMachineFeesMinAmount'
      ).value;
      const machineFeesMaxAmount = document.querySelector(
        '#updateMachineFeesMaxAmount'
      ).value;

      const machineFeesPercentageRate = document.querySelector(
        '#updateMachineFeesPercentageRate'
      ).value;

      const machineFeesAmount = document.querySelector(
        '#updateMachineFeesAmount'
      ).value;

      // const percentageTypeSelect = document.querySelector(
      //   '#updateMachineFeesPercentageType'
      // );

      // const isPercentage = percentageTypeSelect.value === 'true';

      const updateFeesDetails = {
        //   transaction_type: feeTransactionType.toLowerCase(),
        amount_min: Number(getAmountForSubmission(machineFeesMinAmount)),
        amount_max: Number(getAmountForSubmission(machineFeesMaxAmount)),
        //   isPercentage,
        //   ...(isPercentage
        //     ? {
        //         percentageRate: Number(
        //           getAmountForSubmission(machineFeesPercentageRate)
        //         ),
        //       }
        //     : {
        //         fee_amount: Number(getAmountForSubmission(machineFeesAmount)),
        //       }),
        fee_amount: Number(getAmountForSubmission(machineFeesAmount)),
      };

      const updateFeeModalBtn = document.querySelector('.updateFeeModalBtn');

      try {
        showBtnLoader(updateFeeModalBtn);
        const updatedFeeData = await updateFeeSetting(feeId, updateFeesDetails);

        if (!updatedFeeData) {
          console.error('fail', updatedFeeData.message);
          return;
        }

        hideBtnLoader(updateFeeModalBtn);
        hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(updateFeeModalBtn);

        console.error('Error Updating Fee:', err);
        showToast('fail', `❎ ${err.message}`);
        return;
      } finally {
        hideBtnLoader(updateFeeModalBtn);
        hideGlobalLoader();
        closeModal();
      }
    });
  }
}

export function updateFeeForm(feeDetail) {
  const {
    id: feeId,
    amount_min,
    amount_max,
    is_percentage,
    fee_amount,
    fee_type,
    percentage_rate,
    created_at,
  } = feeDetail;

  const form = document.querySelector('.updateFeeModal');
  if (!form) return;

  //   if (!form || form.dataset.bound === 'true') return;
  //   form.dataset.bound = 'true';
  form.dataset.feeId = feeId;

  //   document.querySelector('#updateFeeType').value = fee_type;
  //   document.querySelector('#updateFeeTransactionType').value = ;
  document.querySelector('#updateMachineFeesMinAmount').value =
    formatAmountWithCommas(amount_min);
  document.querySelector('#updateMachineFeesMaxAmount').value =
    formatAmountWithCommas(amount_max);

  document.querySelector('#updateMachineFeesPercentageRate').value = 0;

  document.querySelector('#updateMachineFeesAmount').value =
    formatAmountWithCommas(fee_amount);

  const percentageRateDiv = document.querySelector('.updatePercentageRateDiv');

  const percentageTypeSelect = document.querySelector(
    '#updateMachineFeesPercentageType'
  );

  const machineFeesAmountDiv = document.querySelector(
    '.updateMachineFeesAmountDiv'
  );

  const machineFeesPercentageRateInput = document.querySelector(
    '#updateMachineFeesPercentageRate'
  );

  const machineFeesAmountInput = document.querySelector(
    '#updateMachineFeesAmount'
  );

  //   const isPercentage = percentageTypeSelect.value === 'true';

  // Default setup
  percentageTypeSelect.value = 'false';
  percentageRateDiv.style.display = 'none';
  machineFeesAmountDiv.style.display = '';

  machineFeesPercentageRateInput.value = '';
  //   machineFeesAmountInput.value = 0;

  // Ensure proper required attributes
  machineFeesPercentageRateInput.removeAttribute('required');
  machineFeesAmountInput.setAttribute('required', 'true');

  percentageTypeSelect.addEventListener('change', () => {
    const selected = percentageTypeSelect.value;
    console.log('Selected:', selected);

    if (selected === 'true') {
      // Show percentage input, hide fixed amount
      percentageRateDiv.style.display = '';
      machineFeesAmountDiv.style.display = 'none';

      machineFeesAmountInput.value = '';

      // Validation
      machineFeesPercentageRateInput.setAttribute('required', 'true');
      machineFeesAmountInput.removeAttribute('required');
    } else {
      // Show fixed amount input, hide percentage
      percentageRateDiv.style.display = 'none';
      machineFeesAmountDiv.style.display = '';

      machineFeesPercentageRateInput.value = '';

      // Validation
      machineFeesPercentageRateInput.removeAttribute('required');
      machineFeesAmountInput.setAttribute('required', 'true');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindDeleteFeeFormListener();
  bindUpdateFeeFormListener();
});

// POS FORM MANIPUATION - LEAVE AS IT IS
// document.addEventListener('DOMContentLoaded', function () {
//   const posSuccessfulCheckbox = document.getElementById(
//     'posSuccessfulCheckbox'
//   );
//   const posPendingCheckbox = document.getElementById('posPendingCheckbox');
//   const posRemarksDiv = document.querySelector('.posRemarksDiv');
//   const posTransactionRemark = document.getElementById('posTransactionRemark');
//   const checkboxes = document.querySelectorAll('input[type="radio"]');

//   function updateStatus() {
//     if (posSuccessfulCheckbox?.checked) {
//       if (posRemarksDiv) posRemarksDiv.style.display = 'none';
//       if (posTransactionRemark) posTransactionRemark.value = 'Successful';
//       if (posTransactionRemark) posTransactionRemark.disabled = true;
//     } else {
//       if (posRemarksDiv) posRemarksDiv.style.display = 'block';
//       if (posTransactionRemark) posTransactionRemark.disabled = false;
//     }
//   }

//   updateStatus();

//   //   nOW USING RADIO BUTTONS BUT STILLL KEEPING THIS HERE
//   //   checkboxes.forEach((checkbox) => {
//   //     checkbox.addEventListener('change', function () {
//   //       checkboxes.forEach((otherCheckbox) => {
//   //         if (otherCheckbox !== checkbox) {
//   //           otherCheckbox.checked = false;
//   //           otherCheckbox.removeAttribute('required');
//   //         }
//   //       });

//   //       if (checkbox === posSuccessfulCheckbox) {
//   //         posPendingCheckbox.checked = !checkbox.checked;
//   //       } else {
//   //         posSuccessfulCheckbox.checked = !checkbox.checked;
//   //         posTransactionRemark.value = '';
//   //       }

//   //       //Backup
//   //       // if (checkbox === posSuccessfulCheckbox) {
//   //       //   posSuccessfulCheckbox.checked = true;
//   //       //   posRemarksDiv.style.display = 'none';
//   //       //   posTransactionRemark.disabled = true;
//   //       //   posTransactionRemark.value = 'Successful';
//   //       // } else {
//   //       //   posPendingCheckbox.checked = true;
//   //       //   posRemarksDiv.style.display = 'flex';
//   //       //   posTransactionRemark.disabled = false;
//   //       //   posTransactionRemark.value = '';
//   //       // }
//   //       updateStatus();
//   //     });
//   //   });

//   if (posTransactionRemark)
//     posTransactionRemark.addEventListener('input', function () {
//       const inputValue = posTransactionRemark.value.trim();

//       posPendingCheckbox.checked = inputValue !== '';
//       posSuccessfulCheckbox.checked = !posPendingCheckbox.checked;
//       posSuccessfulCheckbox.removeAttribute('required');

//       //Backup
//       //  if (inputValue !== '') {
//       //    posPendingCheckbox.checked = true;
//       //    posSuccessfulCheckbox.checked = false;
//       //    posSuccessfulCheckbox.removeAttribute('required');
//       //  } else {
//       //    posPendingCheckbox.checked = false;
//       //    return;
//       //  }

//       updateStatus();
//     });
// });

// Machine Fees
// amount.addEventListener('input', () => {
//   const value = amount.value.trim();

//   let machineFee = '';

//   if (!value || value <= 0) {
//     machineFee = '';
//     machineFeeContainer.style.display = 'none';
//   } else {
//     machineFeeContainer.style.display = 'block';

//     if (value <= 100) {
//       machineFee = 0.5;
//     } else if (value <= 200) {
//       machineFee = 1;
//     } else if (value <= 500) {
//       machineFee = 3;
//     } else if (value <= 1100) {
//       machineFee = 5;
//     } else if (value <= 1600) {
//       machineFee = 8;
//     } else if (value <= 2000) {
//       machineFee = 10;
//     } else if (value <= 2100) {
//       machineFee = 11;
//     } else if (value <= 3100) {
//       machineFee = 16;
//     } else if (value <= 5200) {
//       machineFee = 26;
//     } else if (value <= 10000) {
//       machineFee = 50;
//     } else if (value <= 12000) {
//       machineFee = 64;
//     } else if (value <= 20000 || value > 20000) {
//       machineFee = 100;
//     }
//   }

//   machineFeeInput.value = machineFee ? machineFee : '';
// });

// getPosTransactions();

// JavaScript to toggle withdrawal methods

// document.addEventListener('DOMContentLoaded', function () {
//   const Div = document.querySelector(
//     '.paymentMethodType'
//   );
//   const transactionType = document.getElementById('transactionType');
//   const paymentMethod = document.getElementById('paymentMethod');
//   const posFeePaymentType = document.getElementById('posFeePaymentType');
//   //   const posTransactionConfirmation = document.getElementById(
//   //     'posTransactionConfirmation'
//   //   );

//   if (transactionType) {
//     transactionType.addEventListener('change', function (e) {
//       const selectedType = e.target.value;

//       if (
//         selectedType === 'withdrawal' ||
//         selectedType === 'withdrawal/transfer' ||
//         selectedType === 'bill-Payment'
//       ) {
//         Div.style.display = 'block';
//         //   posTransactionConfirmation.style.display = 'block';
//       } else if (selectedType === 'deposit') {
//         paymentMethod.value = 'cash';
//         posFeePaymentType.value = 'cash';
//         posFeePaymentType.style.display = 'block';
//         Div.style.display = 'none';
//         //   posTransactionConfirmation.style.display = 'none';
//       }

//       //  if (selectedType === 'Deposit') {
//       //   paymentMethod.value = 'Cash';

//       //   const selectedOption =
//       //     paymentMethod.querySelector(`option[value='Cash']`);
//       //   if (selectedOption) {
//       //     selectedOption.selected = true;
//       //   }

//       //   console.log('Withdrawal Type set to Cash');
//       // }
//     });
//   }
// });
