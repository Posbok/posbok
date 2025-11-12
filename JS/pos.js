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

      const posCapitalDepositNotes = isAdmin
        ? document.querySelector('#adminPosCapitalDepositNotes')
        : document.querySelector('#posCapitalDepositNotes');

      const posCapitalDetails = {
        shop_id: isAdmin ? adminDepositposCapitalShopDropdown : staffShopId,
        amount: Number(getAmountForSubmission(posDepositAmount)),
        notes: posCapitalDepositNotes.value,
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
          console.log('POS Capital Funding', addPosCapitalData);
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
          initAccountOverview();
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
  const depositPosCapitalBtn = document.querySelector('#depositPosCapitalBtn');

  isAdmin ? fundMachineBtn?.classList.remove('hidden') : '';
  isAdmin ? depositPosCapitalBtn?.classList.remove('hidden') : '';

  fundMachineBtn?.addEventListener(
    'click',
    isAdmin ? openAdminFundMachineModal : openFundMachineModal
  );

  bindDepositPosCapitalFormListener(); // Only once
  bindFundMachineFormListener(); // Only once
});

// document.addEventListener('DOMContentLoaded', async () => {
//   if (document.body.classList.contains('pos-page')) {
//     const businessSettings = await getBusinessSettings();
//     const businessSettingsData = businessSettings?.data;

//     if (!businessSettings) return;

//     console.log(businessSettingsData);

//     const posTransactionChargesDiv = document.querySelector(
//       isAdmin ? '.adminPosTransactionChargesDiv' : '.posTransactionChargesDiv'
//     );

//     const posTransactionChargesInput = document.getElementById(
//       isAdmin ? 'adminPosMachineFee' : 'posMachineFee'
//     );

//     const posMachineFeeDiv = document.querySelector(
//       isAdmin ? '.adminPosMachineFeeDiv' : '.posMachineFeeDiv'
//     );

//     const posMachineFeeInput = document.getElementById(
//       isAdmin ? 'adminPosMachineFee' : 'posMachineFee'
//     );

//     if (posTransactionChargesDiv) {
//       if (businessSettingsData.pos_manual_charge === true) {
//         posTransactionChargesDiv.classList.remove('hidden');
//         posTransactionChargesInput.setAttribute('required', 'true');
//       } else {
//         posTransactionChargesDiv.classList.add('hidden');
//         posTransactionChargesInput.removeAttribute('required');
//         posTransactionChargesInput.value = '';
//       }
//     }

//     if (posMachineFeeDiv) {
//       if (businessSettingsData.manual_machine_fee_mode === true) {
//         posMachineFeeDiv.classList.remove('hidden');
//         posMachineFeeInput.setAttribute('required', 'true');
//       } else {
//         posMachineFeeDiv.classList.add('hidden');
//         posMachineFeeInput.removeAttribute('required');
//         posMachineFeeInput.value = '';
//       }
//     }
//   }
// });

document.addEventListener('DOMContentLoaded', async () => {
  if (isStaff) {
    //  const businessDay = await getCurrentBusinessDay(staffShopId);
    //  const openingCash = businessDay?.data?.opening_cash || 0;

    //  if (
    //    businessDay.data === false ||
    //    businessDay.data === null ||
    //    businessDay.success === false
    //  ) {
    //    return;
    //  }
    //  updateCashInMachineUI(openingCash);
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
        console.log('Current Business Day:', businessDay.data);

        //   const openingCash = businessDay?.data?.opening_cash || 0;
        //   updateCashInMachineUI(openingCash);

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

        //   const businessDay = await getCurrentBusinessDay(selectedShopId);
        //   console.log('new Business Day:', businessDay.data);

        //   const openingCash = businessDay?.data?.opening_cash || 0;
        //   updateCashInMachineUI(openingCash);

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
    console.log('clear the html');
    document.getElementById(
      isStaff ? 'totalPosCapital' : 'adminTotalPosCapital'
    ).innerHTML = 0;

    document.getElementById(
      isStaff ? 'cashAtHand' : 'adminCashAtHand'
    ).innerHTML = 0;

    document.getElementById(
      isStaff ? 'cashInMachine' : 'adminCashInMachine'
    ).innerHTML = 0;

    document.getElementById(
      isStaff ? 'totalDeposit' : 'adminTotalDeposit'
    ).innerHTML = 0;

    document.getElementById(
      isStaff ? 'totalWithdrawals' : 'adminTotalWithdrawals'
    ).innerHTML = 0;

    document.getElementById(
      isStaff ? 'cashBillPayment' : 'adminCashBillPayment'
    ).innerHTML = 0;

    document.getElementById(
      isStaff ? 'totalPosCharges' : 'adminTotalPosCharges'
    ).innerHTML = 0;

    document.getElementById(
      isStaff ? 'cashCharges' : 'adminCashCharges'
    ).innerHTML = 0;
    document.getElementById(
      isStaff ? 'machineCharges' : 'adminMachineCharges'
    ).innerHTML = 0;
  }
});

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
      const posTransactionCharges = document.querySelector(
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
      const posMachineFee = document.querySelector(
        isAdmin ? '#adminPosMachineFee' : '#posMachineFee'
      ).value;
      const posTaxFee = document.querySelector(
        isAdmin ? '#adminPosTaxFee' : '#posTaxFee'
      ).value;
      const posTransferFee = document.querySelector(
        isAdmin ? '#adminPosTransferFee' : '#posTransferFee'
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

      // {
      // "amount": 3000,
      // "posChargeAmount": 300,
      // "customerPhone": "08960697383",
      // "paymentMethod":"CARD",
      // "chargePaymentMethod":"TRANSFER",
      // "remarks": "Successful Transaction",
      // "transactionReference": "12366",
      // "transactionType": "WITHDRAWAL",
      // "machineFee": 100,
      // "taxFee": 50,
      // "transferFee" :0,
      // "shopId": 98
      // }

      const posFormData = {
        shopId,
        transactionType: transactionType.toUpperCase(),
        amount: Number(getAmountForSubmission(amount)),
        posChargeAmount: Number(getAmountForSubmission(posTransactionCharges)),
        customerPhone: customerPhone,
        paymentMethod: paymentMethod.toUpperCase(),
        chargePaymentMethod: posFeePaymentType.toUpperCase(),
        machineFee: Number(posMachineFee),
        taxFee: Number(posTaxFee),
        transferFee: Number(posTransferFee),
        remarks: posTransactionRemark,
        transactionReference: posTransactionReference,
        //   customer_name: customerName,
      };

      const posSubmitButton = document.querySelector('.posSubmitButton');

      try {
        console.log('📦 POS Ttransaction Details:', posFormData);
        showBtnLoader(posSubmitButton);

        const isDayOpen = await ensureBusinessDayOpen(shopId);
        if (!isDayOpen) {
          hideBtnLoader(posSubmitButton);
          return;
        }

        const posTransactionCreated = await createPosTransaction(posFormData);

        //   console.log(posTransactionCreated);

        console.log(
          'POS transaction sent successfully:',
          posTransactionCreated
        );
        initAccountOverview();
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
        ).value = 'withdrawal';
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
        document.getElementById(
          isAdmin ? 'adminPosMachineFee' : 'posMachineFee'
        ).value = '';
        document.getElementById(
          isAdmin ? 'adminPosTaxFee' : 'posTaxFee'
        ).value = '';
        document.getElementById(
          isAdmin ? 'adminPosTransferFee' : 'posTransferFee'
        ).value = '';

        document.querySelector('.paymentMethodType').style.display = 'block';
        document.querySelector('.posRemarksDiv').style.display = 'block';

        //   document.getElementById('posTransactionFee').value = '';
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

      // const adminWithdrawalMethod = document.getElementById(
      //   'adminWithdrawalMethod'
      // )?.value;

      const adminWithdrawalAmount = document.getElementById(
        'adminWithdrawalAmount'
      )?.value;

      //       {
      //     "shop_id": {{shop_id}},
      //   "withdrawal_source": "cash_in_machine",
      //   "notes": "Emergency Withdrawal",
      //   "amount": 100.00
      // }

      const adminWithdrawalDetails = {
        shop_id: posShopDropdown,
        withdrawal_source: adminWithdrawalTransactionType.toLowerCase(),
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
        initAccountOverview();
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
        <td colspan="6" class="table-error-text">No Transaction Fees added yet</td>
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

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('pos-page')) {
    const transactionSelect = document.querySelector(
      isAdmin ? '#adminTransactionType' : '#staffTransactionType'
    );

    const paymentSelect = document.querySelector(
      isAdmin ? '#adminPaymentMethod' : '#paymentMethod'
    );

    // === FEE FIELDS ===

    //   Regular Fee Fields
    const paymentMethodDiv = document.querySelector(
      isAdmin ? '.adminPaymentMethodDiv' : '.staffPaymentMethodDiv'
    );

    const transactionAmountDiv = document.querySelector(
      isAdmin ? '.adminTransactionAmountDiv' : '.staffTransactionAmountDiv'
    );

    const feePaymentTypeDiv = document.querySelector(
      isAdmin ? '.adminFeePaymentTypeDiv' : '.staffFeePaymentTypeDiv'
    );

    const posCustomerPhoneDiv = document.querySelector(
      isAdmin ? '.adminPosCustomerPhoneDiv' : '.staffPosCustomerPhoneDiv'
    );

    const posTransactionReferenceDiv = document.querySelector(
      isAdmin
        ? '.adminPosTransactionReferenceDiv'
        : '.staffPosTransactionReferenceDiv'
    );

    const posTransactionRemarkDiv = document.querySelector(
      isAdmin
        ? '.adminPosTransactionRemarkDiv'
        : '.staffPosTransactionRemarkDiv'
    );

    //   Dynamic Fee Fields

    const posChargesDiv = document.querySelector(
      isAdmin
        ? '.adminPosTransactionChargesDiv'
        : '.staffPosTransactionChargesDiv'
    );
    const machineFeeDiv = document.querySelector(
      isAdmin ? '.adminPosMachineFeeDiv' : '.staffPosMachineFeeDiv'
    );
    const taxFeeDiv = document.querySelector(
      isAdmin ? '.adminPosTaxFeeDiv' : '.staffPosTaxFeeDiv'
    );
    const transferFeeDiv = document.querySelector(
      isAdmin ? '.adminPosTransferFeeDiv' : '.staffPosTransferFeeDiv'
    );

    const posSubmitButton = document.querySelector('.posSubmitButton');

    // === Helper to toggle visibility and "required" ===
    const toggleFieldWithoutRequired = (div, shouldShow) => {
      if (!div) return;
      //  const input = div.querySelector(inputSelector);
      if (shouldShow) {
        div.classList.remove('hidden');
        // input.setAttribute('required', 'true');
      } else {
        div.classList.add('hidden');
        // input.removeAttribute('required');
        // input.value = '';
      }
    };

    const toggleField = (div, inputSelector, shouldShow) => {
      if (!div) return;
      const input = div.querySelector(inputSelector);
      if (shouldShow) {
        div.classList.remove('hidden');
        input.setAttribute('required', 'true');
      } else {
        div.classList.add('hidden');
        input.removeAttribute('required');
        input.value = '';
      }
    };

    // === Helper to set payment method options ===
    const updatePaymentMethodOptions = (allowedMethods) => {
      if (!paymentSelect) return;
      const allOptions = paymentSelect.querySelectorAll('option');

      allOptions.forEach((opt) => {
        if (allowedMethods.includes(opt.value)) {
          opt.classList.remove('hidden');
        } else {
          opt.classList.add('hidden');
        }
      });

      // reset selected option if not allowed
      if (!allowedMethods.includes(paymentSelect.value)) {
        paymentSelect.value = allowedMethods[0] || '';
      }
    };

    // === Main function ===
    function updateTransactionFields(type) {
      switch (type) {
        case 'withdrawal':
          // Submit Button
          posSubmitButton.removeAttribute('disabled');

          //   Regular Fee Fields
          toggleFieldWithoutRequired(paymentMethodDiv, true);
          toggleFieldWithoutRequired(feePaymentTypeDiv, true);
          toggleField(transactionAmountDiv, 'input', true);
          toggleField(posCustomerPhoneDiv, 'input', true);
          toggleField(posTransactionReferenceDiv, 'input', true);
          toggleField(posTransactionRemarkDiv, 'input', true);

          // Payment methods: Card, Transfer
          updatePaymentMethodOptions(['card', 'transfer']);

          //   Dynamic Fee Fields
          toggleField(posChargesDiv, 'input', true);
          toggleField(machineFeeDiv, 'input', true);
          toggleField(taxFeeDiv, 'input', true);
          toggleField(transferFeeDiv, 'input', false);
          break;

        case 'deposit':
          // Submit Button
          posSubmitButton.removeAttribute('disabled');

          //   Regular Fee Fields
          toggleFieldWithoutRequired(paymentMethodDiv, true);
          toggleFieldWithoutRequired(feePaymentTypeDiv, true);
          toggleField(transactionAmountDiv, 'input', true);
          toggleField(posCustomerPhoneDiv, 'input', true);
          toggleField(posTransactionReferenceDiv, 'input', true);
          toggleField(posTransactionRemarkDiv, 'input', true);

          // Payment methods: Cash
          updatePaymentMethodOptions(['cash']);

          //   Dynamic Fee Fields
          toggleField(posChargesDiv, 'input', true);
          toggleField(machineFeeDiv, 'input', false);
          toggleField(taxFeeDiv, 'input', false);
          toggleField(transferFeeDiv, 'input', true);
          break;

        case 'withdrawal_transfer':
          // Submit Button
          posSubmitButton.removeAttribute('disabled');

          //   Regular Fee Fields
          toggleFieldWithoutRequired(paymentMethodDiv, true);
          toggleFieldWithoutRequired(feePaymentTypeDiv, true);
          toggleField(transactionAmountDiv, 'input', true);
          toggleField(posCustomerPhoneDiv, 'input', true);
          toggleField(posTransactionReferenceDiv, 'input', true);
          toggleField(posTransactionRemarkDiv, 'input', true);

          // Payment methods: Card
          updatePaymentMethodOptions(['card']);

          //   Dynamic Fee Fields
          toggleField(posChargesDiv, 'input', true);
          toggleField(machineFeeDiv, 'input', true);
          toggleField(taxFeeDiv, 'input', true);
          toggleField(transferFeeDiv, 'input', true);
          break;

        case 'bill_payment':
          // Submit Button
          posSubmitButton.removeAttribute('disabled');

          //   Regular Fee Fields
          toggleFieldWithoutRequired(paymentMethodDiv, true);
          toggleFieldWithoutRequired(feePaymentTypeDiv, true);
          toggleField(transactionAmountDiv, 'input', true);
          toggleField(posCustomerPhoneDiv, 'input', true);
          toggleField(posTransactionReferenceDiv, 'input', true);
          toggleField(posTransactionRemarkDiv, 'input', true);

          // Payment methods: Card, Transfer, Cash
          updatePaymentMethodOptions(['card', 'transfer', 'cash']);

          //   Dynamic Fee Fields
          toggleField(posChargesDiv, 'input', true);
          toggleField(machineFeeDiv, 'input', true);
          toggleField(taxFeeDiv, 'input', true);
          toggleField(transferFeeDiv, 'input', false);
          break;

        case '':
          // Submit Button
          posSubmitButton.setAttribute('disabled', true);

          //   Regular Fee Fields
          toggleFieldWithoutRequired(paymentMethodDiv, false);
          toggleFieldWithoutRequired(feePaymentTypeDiv, false);
          toggleField(transactionAmountDiv, 'input', false);
          toggleField(posCustomerPhoneDiv, 'input', false);
          toggleField(posTransactionReferenceDiv, 'input', false);
          toggleField(posTransactionRemarkDiv, 'input', false);

          // Payment methods: Card, Transfer, Cash
          updatePaymentMethodOptions(['card', 'transfer', 'cash']);

          toggleField(posChargesDiv, 'input', false);
          toggleField(machineFeeDiv, 'input', false);
          toggleField(taxFeeDiv, 'input', false);
          toggleField(transferFeeDiv, 'input', false);
          break;

        default:
          console.warn('Unknown transaction type:', type);
      }
    }

    // === Event listener ===
    transactionSelect.addEventListener('change', (e) => {
      updateTransactionFields(e.target.value);
    });

    // === Set default (Withdrawal) on load ===
    updateTransactionFields('');
  }
});
