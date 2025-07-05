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
  getPosMachineFeesettings,
  getCurrentBusinessDay,
  openDepositPosCapitalModal,
  openAdminDepositPosCapitalModal,
} from './apiServices/pos/posResources';
import { closeModal, setupModalCloseButtons, showToast } from './script';
import config from '../config.js';
import {
  clearFormInputs,
  ensureBusinessDayOpen,
  formatAmountWithCommas,
  formatDateTimeReadable,
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

const userData = config.userData;
const dummyShopId = config.dummyShopId;

const parsedUserData = userData ? JSON.parse(userData) : null;
const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const staffShopId = parsedUserData?.shopId;

if (isAdmin) {
  document.addEventListener('DOMContentLoaded', () => {
    getPosChargeSettings();
    getPosMachineFeesettings();
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

export function depositPosCapitalForm() {
  const form = isAdmin
    ? document.querySelector('.adminDepositPosCapitalModal')
    : document.querySelector('.staffDepositPosCapitalModal');

  if (!form) return;
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector('#depositPosCapitalBtn')
    ?.addEventListener(
      'click',
      isAdmin ? openAdminDepositPosCapitalModal : openDepositPosCapitalModal
    );

  bindDepositPosCapitalFormListener(); // Only once
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

        console.log('Selected Shop ID:', selectedShopId);

        try {
          console.log('we are here');
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
      const transactionType = document.getElementById(
        isAdmin ? 'adminTransactionType' : 'transactionType'
      ).value;
      const paymentMethod = document.getElementById(
        isAdmin ? 'adminPaymentMethod' : 'paymentMethod'
      ).value;
      const posTransactionRemark = document.getElementById(
        isAdmin ? 'adminPosTransactionRemark' : 'posTransactionRemark'
      ).value;

      // "transactionType" must be one of [WITHDRAWAL, DEPOSIT, WITHDRAWAL_TRANSFER, BILL_PAYMENT]
      const shopId = isAdmin ? Number(posShopDropdown) : Number(staffShopId);

      const posFormData = {
        shopId,
        transactionType: transactionType.toUpperCase(),
        amount: Number(getAmountForSubmission(amount)),
        //   customerName: customerName,
        customerPhone: customerPhone,
        paymentMethod: paymentMethod.toUpperCase(),
        chargePaymentMethod: posFeePaymentType.toUpperCase(),
        remarks: posTransactionRemark,
        //   transaction_fee: Number(fee),
        //   machine_fee: Number(machineFeeInput),
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

        console.log(posTransactionCreated);

        //   console.log(
        //     'POS transaction sent successfully:',
        //     posTransactionCreated
        //   );
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
        console.log('Reset fORM');
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
          isAdmin ? 'adminPosCustomerPhone' : 'posCustomerPhone'
        ).value = '';
        document.getElementById(
          isAdmin ? 'adminPosTransactionRemark' : 'posTransactionRemark'
        ).value = '';
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

      const addMachineFeesDetails = {
        isPercentage,
        minAmount: Number(getAmountForSubmission(machineFeesMinAmount)),
        maxAmount: Number(getAmountForSubmission(machineFeesMaxAmount)),
        ...(isPercentage
          ? {
              percentageRate: Number(
                getAmountForSubmission(machineFeesPercentageRate)
              ),
            }
          : {
              feeAmount: Number(getAmountForSubmission(machineFeesAmount)),
            }),
      };

      // console.log('Configuring POS Charges with:', addMachineFeesDetails);

      const addMachineFeeBtn = document.querySelector('.addMachineFeeBtn');

      try {
        showBtnLoader(addMachineFeeBtn);
        const data = await configurePosMachineFees(addMachineFeesDetails);
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

export function populateMachineFeesTable(MachineFeesData) {
  const tbody = document.querySelector('.machineFee-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  const MachineFees = MachineFeesData.data;

  //   console.log('MachineFees', MachineFees);

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
      min_amount,
      max_amount,
      is_percentage,
      fee_amount,
      percentage_rate,
    } = charge;

    if (row)
      row.innerHTML = `

      <td class="py-1 MachineFeeSerialNumber">${index + 1}</td>
      <td class="py-1 MachineFeeMinAmount">₦${formatAmountWithCommas(
        min_amount
      )}</td>
      <td class="py-1 MachineFeeMaxAmount">₦${formatAmountWithCommas(
        max_amount
      )}</td>
      <td class="py-1 MachineFeeType">${is_percentage}
      <td class="py-1 MachineFeeCreatedDate"> ${percentage_rate}
      <td class="py-1 MachineFeeAmount"><strong>₦${fee_amount}</td>
      </td>
       `;

    if (tbody) tbody.appendChild(row);
  });
}

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
