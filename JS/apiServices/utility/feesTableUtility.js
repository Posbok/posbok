import {
  formatAmountWithCommas,
  formatDateTimeReadable,
  formatFeeType,
  formatTransactionType,
  hideGlobalLoader,
  showGlobalLoader,
} from '../../helper/helper';
import {
  deleteFeeForm,
  openDeleteFeeModal,
  openUpdateFeeButton,
  updateFeeForm,
} from '../../pos';
import { showToast } from '../../script';

// export function populatePosChargesTable(posChargesData) {
//   const tbody = document.querySelector('.posCharge-table tbody');
//   const loadingRow = document.querySelector('.loading-row');

//   const posCharges = posChargesData.data;

//   //   console.log('posCharges', posCharges);

//   // Remove static rows and loading

//   if (tbody) tbody.innerHTML = '';

//   if (!posCharges.length) {
//     const emptyRow = document.createElement('tr');
//     emptyRow.innerHTML = `
//         <td colspan="6" class="table-error-text">No POS Charges Settings found.</td>
//       `;
//     if (tbody) tbody.appendChild(emptyRow);
//     return;
//   }

//   posCharges.forEach((charge, index) => {
//     const row = document.createElement('tr');
//     row.classList.add('table-body-row');

//     //  console.log('charge', charge);

//     const {
//       transaction_type,
//       min_amount,
//       max_amount,
//       charge_amount,
//       created_at,
//     } = charge;

//     formatDateTimeReadable(created_at);

//     if (row)
//       row.innerHTML = `

//       <td class="py-1 posChargeSerialNumber">${index + 1}</td>
//       <td class="py-1 posChargeType">${formatTransactionType(transaction_type)}
//       <td class="py-1 posChargeMinAmount">₦${formatAmountWithCommas(
//         min_amount
//       )}</td>
//       <td class="py-1 posChargeMaxAmount">₦${formatAmountWithCommas(
//         max_amount
//       )}</td>
//       <td class="py-1 posChargeAmount"><strong>₦${formatAmountWithCommas(
//         charge_amount
//       )}</td>
//       <td class="py-1 posChargeCreatedDate"> ${formatDateTimeReadable(
//         created_at
//       )}
//       </td>
//        `;

//     if (tbody) tbody.appendChild(row);
//   });
// }

// export function populateFeesTable(MachineFeesData) {
//   const tbody = document.querySelector('.machineFee-table tbody');
//   const loadingRow = document.querySelector('.loading-row');

//   const MachineFees = MachineFeesData.data;

//   // Remove static rows and loading

//   if (tbody) tbody.innerHTML = '';

//   if (!MachineFees.length) {
//     const emptyRow = document.createElement('tr');
//     emptyRow.innerHTML = `
//         <td colspan="6" class="table-error-text">No POS Machine Fee Settings found.</td>
//       `;
//     if (tbody) tbody.appendChild(emptyRow);
//     return;
//   }

//   MachineFees.forEach((charge, index) => {
//     const row = document.createElement('tr');
//     row.classList.add('table-body-row');

//     //  console.log('charge', charge);

//     const {
//       id: feeId,
//       amount_min,
//       amount_max,
//       is_percentage,
//       fee_amount,
//       fee_type,
//       percentage_rate,
//       created_at,
//     } = charge;

//     if (row)
//       row.innerHTML = `

//       <td class="py-1 MachineFeeSerialNumber">${index + 1}</td>
//       <td class="py-1 MachineFeeSerialNumber">${formatFeeType(fee_type)}</td>
//       <td class="py-1 MachineFeeMinAmount">₦${formatAmountWithCommas(
//         amount_min
//       )}</td>
//       <td class="py-1 MachineFeeMaxAmount">₦${formatAmountWithCommas(
//         amount_max
//       )}</td>
//       <td class="py-1 MachineFeeType">${
//         is_percentage === 'undefined'
//           ? 'N/A'
//           : is_percentage === 'true'
//           ? 'Percentage'
//           : 'N/A'
//       }</td>
//       <td class="py-1 MachineFeeCreatedDate"> ${
//         percentage_rate === 'undefined'
//           ? 'N/A'
//           : is_percentage === 'true'
//           ? 'Percentage'
//           : 'N/A'
//       }</td>
//       <td class="py-1 MachineFeeAmount"><strong>₦${fee_amount}</td>
//       </td>
//       <td class="py-1 MachineFeeAmount">${formatDateTimeReadable(
//         created_at
//       )}</td>
//       </td>
//        <td class="py-1 action-buttons" style="margin-top:1.1rem">
//                              <button
//                     class="hero-btn-outline openUpdateFeeBtn"
//                     id="openUpdateFeeBtn" data-fee-id="${feeId}"
//                   >
//                     <i class="fa-solid fa-pen-to-square"></i>
//                   </button>

//                   <button
//                     class="hero-btn-outline deleteFeeBtn"
//                     id="deleteFeeModalBtn" data-fee-id="${feeId}"
//                   >
//                     <i class="fa-solid fa-trash-can"></i>
//                   </button>
//                 </td>
//        `;

//     if (tbody) tbody.appendChild(row);

//     // Handle Delete Fees Logic
//     const deleteFeeModalBtn = row.querySelector(`#deleteFeeModalBtn`);

//     deleteFeeModalBtn?.addEventListener('click', async () => {
//       showGlobalLoader();
//       const feeId = deleteFeeModalBtn.dataset.feeId;

//       const deleteFeeContainer = document.querySelector('.deleteFeeContainer');

//       if (!feeId) return;

//       if (deleteFeeContainer) {
//         // Store feeId in modal container for reference
//         deleteFeeContainer.dataset.feeId = feeId;

//         hideGlobalLoader();
//         openDeleteFeeModal(); // Show modal after data is ready
//         deleteFeeForm(feeId);
//       } else {
//         hideGlobalLoader();
//         showToast('fail', '❌ Failed to fetch Delete Fee.');
//       }
//     });

//     // Update Fee Logic

//     const updateFeeBtn = row.querySelector('.openUpdateFeeBtn');

//     updateFeeBtn?.addEventListener('click', async () => {
//       showGlobalLoader();
//       const feeId = updateFeeBtn.dataset.feeId;
//       const updateFeeModalContainer = document.querySelector('.updateFeeModal');

//       if (updateFeeModalContainer) {
//         updateFeeModalContainer.dataset.feeId = feeId;

//         // Fetch fee detail
//         //   const feeDetails = await getFeeSettings();
//         const feeDetails = MachineFees;

//         if (feeDetails.length > 0) {
//           feeDetails.map((fee) => {
//             if (fee.id === Number(feeId)) {
//               openUpdateFeeButton();

//               updateFeeForm(fee);
//             }
//           });
//           hideGlobalLoader();
//         } else {
//           hideGlobalLoader();
//           showToast('fail', '❌ Failed to fetch Product details.');
//         }
//       }
//     });
//   });
// }
