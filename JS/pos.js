import {
  getPosTransactions,
  createPosTransaction,
  addPosCapital,
} from './apiServices/pos/posResources';
import { closeModal, showToast } from './script';
import config from '../config.js';
import { clearFormInputs, getAmountForSubmission } from './helper/helper.js';

const userData = config.userData;
const dummyShopId = config.dummyShopId;

const shopId = userData?.shopId || dummyShopId;

export function setupCreateShopForm() {
  const form = document.querySelector('.createShopModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const shopNameInput = document.querySelector('#shopName');
      const shopAddressInput = document.querySelector('#shopAddress');

      const serviceTypeCheckboxes = document.querySelectorAll(
        'input[name="serviceType"]:checked'
      );
      const serviceType = Array.from(serviceTypeCheckboxes).map(
        (cb) => cb.value
      );
      const serviceTypeValue = serviceType[0] || null;

      const shopDetails = {
        shopName: shopNameInput.value,
        location: shopAddressInput.value,
        serviceType: serviceTypeValue,
      };

      try {
        createShop(shopDetails)
          .then((data) => {
            closeModal();

            // Clear inputs and checkboxes
            shopNameInput.value = '';
            shopAddressInput.value = '';
            document
              .querySelectorAll('input[name="serviceType"]')
              .forEach((cb) => (cb.checked = false));
            // serviceTypeCheckboxes.forEach(
            //   (checkbox) => (checkbox.checked = false)
            // );

            //   redirectWithDelay('Homepage', 'manage.html', 500);
            // window.location.href = 'manage.html';
          })
          .catch((data) => {
            showToast('fail', `❎ ${data.message}`);
            console.error('❎ Failed to create shop:', data.message);
          });
        //   console.log('Creating shop with:', shopDetails);
        // closeModal(); // close modal after success
      } catch (err) {
        console.error('Error creating shop:', err.message);
      }
    });
  }
}

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

// POS FORM MANIPUATION - LEAVE AS IT IS
document.addEventListener('DOMContentLoaded', function () {
  const posSuccessfulCheckbox = document.getElementById(
    'posSuccessfulCheckbox'
  );
  const posPendingCheckbox = document.getElementById('posPendingCheckbox');
  const posRemarksDiv = document.querySelector('.posRemarksDiv');
  const posTransactionRemark = document.getElementById('posTransactionRemark');
  const checkboxes = document.querySelectorAll('input[type="radio"]');

  function updateStatus() {
    if (posSuccessfulCheckbox?.checked) {
      if (posRemarksDiv) posRemarksDiv.style.display = 'none';
      if (posTransactionRemark) posTransactionRemark.value = 'Successful';
      if (posTransactionRemark) posTransactionRemark.disabled = true;
    } else {
      if (posRemarksDiv) posRemarksDiv.style.display = 'block';
      if (posTransactionRemark) posTransactionRemark.disabled = false;
    }
  }

  updateStatus();

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      checkboxes.forEach((otherCheckbox) => {
        if (otherCheckbox !== checkbox) {
          otherCheckbox.checked = false;
          otherCheckbox.removeAttribute('required');
        }
      });

      if (checkbox === posSuccessfulCheckbox) {
        posPendingCheckbox.checked = !checkbox.checked;
      } else {
        posSuccessfulCheckbox.checked = !checkbox.checked;
        posTransactionRemark.value = '';
      }

      //Backup
      // if (checkbox === posSuccessfulCheckbox) {
      //   posSuccessfulCheckbox.checked = true;
      //   posRemarksDiv.style.display = 'none';
      //   posTransactionRemark.disabled = true;
      //   posTransactionRemark.value = 'Successful';
      // } else {
      //   posPendingCheckbox.checked = true;
      //   posRemarksDiv.style.display = 'flex';
      //   posTransactionRemark.disabled = false;
      //   posTransactionRemark.value = '';
      // }
      updateStatus();
    });
  });

  posTransactionRemark.addEventListener('input', function () {
    const inputValue = posTransactionRemark.value.trim();

    posPendingCheckbox.checked = inputValue !== '';
    posSuccessfulCheckbox.checked = !posPendingCheckbox.checked;
    posSuccessfulCheckbox.removeAttribute('required');

    //Backup
    //  if (inputValue !== '') {
    //    posPendingCheckbox.checked = true;
    //    posSuccessfulCheckbox.checked = false;
    //    posSuccessfulCheckbox.removeAttribute('required');
    //  } else {
    //    posPendingCheckbox.checked = false;
    //    return;
    //  }

    updateStatus();
  });
});

// JavaScript for POS Form

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

// POS Form submission

export async function handlePosFormSubmit() {
  const posForm = document.querySelector('.pos-method-form');

  if (!posForm || posForm.dataset.bound === 'true') return;

  posForm.dataset.bound = 'true';

  if (posForm) {
    posForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const amount = document.getElementById('posTransactionAmount').value;
      const customerName = document.getElementById('posCustomerName').value;
      const customerPhone = document.getElementById('posCustomerPhone').value;
      const posFeePaymentType =
        document.getElementById('posFeePaymentType').value;
      const transactionType = document.getElementById('transactionType').value;
      const paymentMethod = document.getElementById('paymentMethod').value;
      const posTransactionRemark = document.getElementById(
        'posTransactionRemark'
      ).value;
      const posRemarksDiv = document.querySelector('.posRemarksDiv').value;
      const paymentMethodTypeDiv =
        document.querySelector('.paymentMethodType').value;
      // const fee = document.getElementById('posTransactionFee').value;
      // const machineFeeContainer = document.querySelector('.machine-fee').value;
      // const machineFeeInput = document.getElementById('posMachineFee').value;
      // const posMachineFee = document.getElementById('posMachineFee');
      // const posSuccessfulCheckbox = document.getElementById(
      //   'posSuccessfulCheckbox'
      // ).value;
      // const posPendingCheckbox =
      //   document.getElementById('posPendingCheckbox').value;
      // const posTransactionConfirmation = document.getElementById(
      //   'posTransactionConfirmation'
      // ).value;

      //   isSubmitting = true;

      // const transactionTypeValue = transactionType.trim().toLowerCase();

      // Create the form data with documentIds

      // "transactionType" must be one of [WITHDRAWAL, DEPOSIT, WITHDRAWAL_TRANSFER, BILL_PAYMENT]

      const posFormData = {
        shopId: shopId,
        transactionType: transactionType.toUpperCase(),
        amount: Number(getAmountForSubmission(amount)),
        customerName: customerName,
        customerPhone: customerPhone,
        paymentMethod: paymentMethod.toUpperCase(),
        chargePaymentMethod: posFeePaymentType.toUpperCase(),
        remarks: posTransactionRemark,
        //   transaction_fee: Number(fee),
        //   machine_fee: Number(machineFeeInput),
      };

      try {
        //   console.log('📦 POS Ttransaction Details:', posFormData);

        const posTransactionCreated = await createPosTransaction(posFormData);

        //   console.log(
        //     'POS transaction sent successfully:',
        //     posTransactionCreated
        //   );
        showToast('success', `✅ ${posTransactionCreated.message}`);
      } catch (error) {
        //   console.error('Error sending POS transaction:', error);
        showToast(
          'fail',
          `❎ ${posTransactionCreated.message} || ❎ POS transaction not created.`
        );
      } finally {
        // reset form inputs
        resetFormInputs();
      }

      function resetFormInputs() {
        document.getElementById('transactionType').value = 'withdrawal';
        document.getElementById('paymentMethod').value = 'card';
        document.getElementById('posFeePaymentType').value = 'card';
        document.getElementById('posTransactionAmount').value = '';
        document.getElementById('posTransactionRemark').value = '';
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

// let isSubmitting = true;

// async function handlePosFormSubmit(
//   e,
//   transactionType,
//   paymentMethod,
//   amount,
//   fee,
//   machineFeeInput,
//   posFeePaymentType,
//   posTransactionRemark,
//   posTransactionConfirmation
// ) {
//   isSubmitting = true;
//   e.preventDefault();

//   const transactionTypeValue = transactionType.value.trim().toLowerCase();

//   const transactionTypeId = transactionTypeMapping[transactionTypeValue];
//   const paymentMethod =
//     paymentMethodMapping[paymentMethod.value.toLowerCase()];

//   // Check if the mapping returned a valid ID
//   if (!transactionTypeId) {
//     console.error('Invalid transaction type:', transactionTypeValue);
//     showToast('fail', 'Invalid transaction type selected. ❎');
//     return; // Stop execution if invalid transaction type
//   }

//   // Create the form data with documentIds
//   const posFormData = {
//     transaction_type: transactionTypeId,
//     withdrawal_type: paymentMethod,
//     transaction_amount: Number(amount.value),
//     transaction_fee: Number(fee.value),
//     machine_fee: Number(machineFeeInput.value),
//     fee_payment_type: posFeePaymentType.value.toLowerCase(),
//     transaction_remark: posTransactionRemark.value,
//   };

//   try {
//     const response = await createPosTransaction({
//       data: {
//         ...posFormData,
//       },
//     });

//     if (response) {
//       isSubmitting = false;
//       // console.log('POS transaction sent successfully:', response);
//       showToast('success', 'POS transaction sent  successfully! ⭐');
//     } else {
//       showToast('fail', 'Failed to send POS transaction. ❎');
//       isSubmitting = false;
//     }
//   } catch (error) {
//     //  console.error('Error sending POS transaction:', error);
//     showToast('fail', 'POS transaction not sent. ❎');
//   } finally {
//     // reset form inputs
//     resetFormInputs();

//     //  addProductName.value = '';
//     //  addProductBoughtPrice.value = '';
//     //  addProductSellingPrice.value = '';
//     //  addProductQuantity.value = '';
//     //  closeModal();
//   }

//   console.log(posFormData);
//   console.log(machineFeeInput.value);

//   const storedData = JSON.parse(localStorage.getItem('posFormData')) || [];

//   const allData = [posFormData, ...storedData];

//   localStorage.setItem('posFormData', JSON.stringify(allData));

//   return posFormData;
// }
