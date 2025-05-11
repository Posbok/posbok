import config from '../config';
import {
  deleteAllTransactions,
  getPosTransactions,
} from './apiServices/pos/posResources';
import { formatAmountWithCommas } from './helper/helper';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const shopId = parsedUserData?.shopId || dummyShopId;

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTransactionType(value) {
  switch (value.toLowerCase()) {
    case 'withdrawal':
      return 'Withdrawal';
    case 'withdrawal/transfer':
      return 'Withdrawal & Transfer';
    case 'bill-payment':
      return 'Bill Payment';
    case 'deposit':
      return 'Deposit';
    default:
      return value;
  }
}

// JS to Render saved POS from Database to help with Load More features of the transactions.
let allPosTransactions = [];

// Pagination control for load more
let currentPage;
let totalItems;
let totalPages;
let pageSize = 10;

const loadMoreButton = document.getElementById('loadMoreButton');

let currentFilters = {};

document.getElementById('applyFiltersBtn').addEventListener('click', () => {
  currentFilters = {
    startDate: document.getElementById('startDateFilter').value,
    endDate: document.getElementById('endDateFilter').value,
    type: document.getElementById('typeFilter').value,
    status: document.getElementById('statusFilter').value,
  };

  currentPage = 1;
  renderPosTable(currentPage, pageSize, currentFilters);
});

loadMoreButton.addEventListener('click', () => {
  currentPage += 1;
  renderPosTable(currentPage, pageSize, currentFilters);
});

async function fetchAndDisplayTransactions(page = 1) {
  try {
    let startDate = document.getElementById('startDateFilter').value;
    let endDate = document.getElementById('endDateFilter').value;
    let type = document.getElementById('typeFilter').value;
    let status = document.getElementById('statusFilter').value;

    const queryParams = new URLSearchParams({
      shopId: shopId,
      page,
      limit: 10,
    });

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (type) queryParams.append('type', type);
    if (status) queryParams.append('status', status);

    const response = await fetch(`/transactions?${queryParams}`);
    const data = await response.json();

    if (!response.ok)
      throw new Error(data.message || 'Failed to fetch transactions');

    generateTransactionCards(data.transactions);
    updatePagination(data.totalPages, page);
  } catch (err) {
    console.error('Fetch error:', err.message);
    transactionList.innerHTML = `<div class="error">Error: ${err.message}</div>`;
  }
}

function generateTransactionCards(transactions) {
  const grouped = {};

  transactions.forEach((tx) => {
    const dateKey = new Date(tx.createdAt).toLocaleDateString(); // e.g. "5/10/2025"
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(tx);
  });

  transactionList.innerHTML = ''; // Clear existing

  Object.entries(grouped).forEach(([date, txs]) => {
    let total = txs.reduce((sum, t) => sum + t.amount, 0);

    // Day header with total
    const header = document.createElement('div');
    header.className = 'day-header';
    header.innerHTML = `
           <h4>${date}</h4>
           <p><strong>Total:</strong> ₦${total.toLocaleString()}</p>
       `;
    transactionList.appendChild(header);

    // Transactions for the day
    txs.forEach((tx) => {
      const card = document.createElement('div');
      card.className = `transaction-card ${tx.type.toLowerCase()}`;

      card.innerHTML = `
               <p><strong>${tx.type.toUpperCase()}</strong></p>
               <p>₦${tx.amount.toLocaleString()}</p>
               <p>${new Date(tx.createdAt).toLocaleTimeString()}</p>
               <p>Status: ${tx.status}</p>
           `;
      transactionList.appendChild(card);
    });
  });
}

async function renderPosTable(page = 1, pageSize, filters = {}) {
  const posTableBody = document.querySelector('.posTableDisplay tbody');
  const loadMoreButton = document.getElementById('loadMoreButton');

  if (!posTableBody) {
    console.error('Error: Table body not found');
    return;
  }

  try {
    let loadingRow = document.querySelector('.loading-row');
    if (!loadingRow) {
      loadingRow = document.createElement('tr');
      loadingRow.className = 'loading-row';
      loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading transactions...</td>`;
      posTableBody.appendChild(loadingRow);
    }

    // Build query with filters
    const queryParams = new URLSearchParams({
      shopId: shopId,
      page,
      limit: pageSize,
    });

    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);

    const result = await getPosTransactions({
      shopId,
      page,
      limit: pageSize,
      filters,
    });

    if (!result) throw new Error(result.message || 'Failed to fetch');

    const posTransactions = result.data.transactions;
    totalPages = result.data.totalPages;
    totalItems = result.data.totalItems;
    currentPage = result.data.currentPage;

    // Only reset array if starting from page 1
    if (page === 1) {
      allPosTransactions = [];
    }

    posTransactions.forEach((transaction) => {
      if (!allPosTransactions.some((t) => t.id === transaction.id)) {
        allPosTransactions.push(transaction);
      }
    });

    // Clear the table body and render all accumulated transactions
    posTableBody.innerHTML = '';
    allPosTransactions.forEach((posTransaction, index) => {
      const {
        transaction_type,
        amount,
        fee_payment_type,
        customer_name,
        customer_phone,
        payment_method,
        status,
        receipt_id,
        remarks,
        business_day,
        transaction_time,
        charges,
        fees,
        transaction_fee,
      } = posTransaction;

      const machineFee = fees?.fee_amount || '-';

      // console.log('Fee Amount:', machineFee);

      // const feePaymentType = toTitleCase(fee_payment_type || 'N/A');
      // const transactionType = transaction_type?.type || 'N/A';
      // const withdrawalType = toTitleCase(withdrawal_type?.type || 'N/A');

      const row = document.createElement('tr');
      row.classList.add('table-body-row');
      row.innerHTML = `
         <td class="py-1">${index + 1}.</td>
         <td class="py-1">${business_day}</td>
         <td class="py-1 posTransTypeReport">${transaction_type}</td>
         <td class="py-1 posCustomerInfo">${`${customer_name} - ${customer_phone}`}</td>
         <td class="py-1 posAmountReport">&#x20A6;${formatAmountWithCommas(
           amount
         )}</td>
         <td class="py-1 posChargesReport">&#x20A6;${formatAmountWithCommas(
           charges
         )}</td>
  
         <td class="py-1 posMachineFeeReport">&#x20A6;${formatAmountWithCommas(
           machineFee
         )}</td>
         <td class="py-1 posFeePaymentMethodReport">${fee_payment_type}</td>
         <td class="py-1 posPaymentMethodReport">${payment_method}</td>
         <td class="py-1 posPaymentMethodRemark">${remarks}</td>
         <td class="py-1 posPaymentMethodRemark">${receipt_id}</td>
       `;
      posTableBody.appendChild(row);
    });

    // Update total amounts
    updateTotalPosAmounts(allPosTransactions);

    // Handle Load More button visibility
    //  if (currentPage >= totalPages) {
    //    loadMoreButton.style.display = 'none';
    //  } else {
    //    loadMoreButton.style.display = 'block';
    //  }
  } catch (error) {
    console.error('Error rendering transactions:', error);
    posTableBody.innerHTML =
      '<tr><td colspan="6" class="table-error-text">Error loading transactions.</td></tr>';
  }
}

// document.getElementById('loadMoreButton').addEventListener('click', () => {
//   currentPage += 1;
//   renderPosTable();
// });

// Fetch all transactions in the background for totals calculation
// async function fetchAllTransactionsForTotals() {
//   try {
//     let page = 1;
//     let allTransactions = [];
//     while (true) {
//       const { data, meta } = await getPosTransactions(page, pageSize);

//       allTransactions = allTransactions.concat(data);

//       if (page >= meta.pagination.pageCount) break;
//       page++;
//     }
//     updateTotalPosAmounts(allTransactions);
//   } catch (error) {
//     console.error('Error fetching all transactions for totals:', error);
//   }
// }

// fetchAllTransactionsForTotals();

// Backup RenderTable logic.
// async function renderPosTable(page = 1, pageSize = 25) {
//   const posTableBody = document.querySelector('.posTableDisplay tbody');
//   const loadMoreButton = document.getElementById('loadMoreButton');

//   if (!posTableBody) {
//     console.error('Error: Table body not found');
//     return;
//   }

//   if (!loadMoreButton) {
//     console.warn('Warning: Load More button not found');
//     return;
//   }

//   // Check if the loading row already exists
//   let loadingRow = document.querySelector('.loading-row');
//   if (!loadingRow) {
//     // Create and add the loading row only if it doesn't exist
//     loadingRow = document.createElement('tr');
//     loadingRow.className = 'loading-row';
//     loadingRow.innerHTML = `<td colspan="6" class="table-loading-text">Loading transactions...</td>`;
//     posTableBody.appendChild(loadingRow);
//   }

//   try {
//     const posTransactionData = await getPosTransactions(page, pageSize);
//     const posTransactions = posTransactionData.data;
//     totalPages = posTransactionData.meta.pagination.pageCount;

//     // Remove the loading row if it exists
//     if (posTableBody.contains(loadingRow)) {
//       posTableBody.removeChild(loadingRow);
//     }

//     if (posTransactions.length === 0 && allPosTransactions.length === 0) {
//       posTableBody.innerHTML =
//         '<tr><td colspan="6" class="table-error-text">No Transactions Available.</td></tr>';
//       loadMoreButton.style.display = 'none';
//       return;
//     }

//     // Check for duplicates by transaction ID if available (replace 'id' with your unique key)
//     posTransactions.forEach((transaction) => {
//       if (!allPosTransactions.some((t) => t.id === transaction.id)) {
//         allPosTransactions.push(transaction);
//       }
//     });

//     // Only clear and re-render table on the first page
//     if (page === 1) {
//       posTableBody.innerHTML = '';
//     } else {
//       // Remove the loading row after loading
//       if (loadingRow) loadingRow.remove();
//     }

//     // Calculate the starting serial number based on existing transactions
//     const startingSerialNumber =
//       allPosTransactions.length - posTransactions.length;

//     // Render only the new transactions
//     posTransactions.forEach((posTransaction, index) => {
//       const {
//         fee_payment_type,
//         transaction_amount,
//         transaction_fee,
//         machine_fee,
//         transaction_remark,
//         transaction_type,
//         withdrawal_type,
//       } = posTransaction;

//       function toTitleCase(value) {
//         return value.charAt(0).toUpperCase() + value.slice(1);
//       }

//       function formatTransactionType(value) {
//         switch (value.toLowerCase()) {
//           case 'withdraw':
//             return 'Withdraw';
//           case 'withdrawal/transfer':
//             return 'Withdrawal & Transfer';
//           case 'bill-payment':
//             return 'Bill Payment';
//           case 'deposit':
//             return 'Deposit';
//           default:
//             return value;
//         }
//       }

//       const feePaymentType = toTitleCase(fee_payment_type || 'N/A');
//       const transactionType = transaction_type?.type || 'N/A';
//       const withdrawalType = toTitleCase(withdrawal_type?.type || 'N/A');

//       const row = document.createElement('tr');
//       row.classList.add('table-body-row');

//       row.innerHTML = `
//         <td class="py-1">${startingSerialNumber + index + 1}.</td>
//         <td class="py-1 posTransTypeReport">${formatTransactionType(
//           transactionType
//         )}</td>
//         <td class="py-1 posAmountReport">&#x20A6;${formatAmountWithCommas(
//           transaction_amount
//         )}</td>
//         <td class="py-1 posFeeReport">&#x20A6;${formatAmountWithCommas(
//           transaction_fee
//         )}</td>
//         <td class="py-1 posMachineFeeReport">&#x20A6;${formatAmountWithCommas(
//           machine_fee
//         )}</td>
//         <td class="py-1 posFeePaymentMethodReport">${feePaymentType}</td>
//         <td class="py-1 posPaymentMethodReport">${withdrawalType}</td>
//         <td class="py-1 posPaymentMethodRemark">${transaction_remark}</td>
//        `;

//       posTableBody.appendChild(row);
//     });

//     // Update total amounts using the accumulated transactions
//     //  allPosTransactions = [...allPosTransactions, ...posTransactions];
//     updateTotalPosAmounts(allPosTransactions);
//   } catch (error) {
//     console.error('Error rendering transactions:', error);

//     // Show an error message in case of failure
//     posTableBody.innerHTML =
//       '<tr  class="loading-row"><td colspan="6" class="table-error-text">Error loading transactions.</td></tr>';
//   } finally {
//     // Ensure the loading row is removed after loading completes
//     //  if (posTableBody.contains(loadingRow)) {
//     //    posTableBody.removeChild(loadingRow);
//     //    console.log('hello Load More 2');
//     //  }
//     //  console.log('hello Load More');

//     const loadingRowToRemove = posTableBody.querySelector('.loading-row');
//     if (loadingRowToRemove) loadingRowToRemove.remove();

//     // Show or hide the Load More button
//     if (currentPage >= totalPages) {
//       loadMoreButton.style.display = 'none';
//     } else {
//       loadMoreButton.style.display = 'block';
//     }
//   }
// }

// JS to give total POS Amount and Fees

function updateTotalPosAmounts(data) {
  const totalPosAmount = document.getElementById('totalPosAmount');
  const totalPosFee = document.getElementById('totalPosFee');
  const totalMachineFee = document.getElementById('totalMachineFee');
  const totalDepositAmount = document.getElementById('totalDepositAmount');
  const totalWithdrawalAmount = document.getElementById(
    'totalWithdrawalAmount'
  );
  const totalWithdrawalTransferAmount = document.getElementById(
    'totalWithdrawalTransferAmount'
  );
  const totalBillPaymentAmount = document.getElementById(
    'totalBillPaymentAmount'
  );

  //   console.log(data);

  if (!data || data.length === 0) {
    if (totalPosAmount) {
      totalPosAmount.innerHTML = `<strong>Total Amount = &nbsp;&#x20A6;0</strong>`;
    }
    if (totalPosFee) {
      totalPosFee.innerHTML = `<strong>Total Fees = &nbsp;&#x20A6;0</strong>`;
    }
    if (totalMachineFee) {
      totalMachineFee.innerHTML = `<strong>Machine Fees = &nbsp;&#x20A6;0</strong>`;
    }
    if (totalDepositAmount) {
      totalDepositAmount.innerHTML = `<strong>Total Deposit = &nbsp;&#x20A6;0</strong>`;
    }
    if (totalWithdrawalAmount) {
      totalWithdrawalAmount.innerHTML = `<strong>Total Withdrawal = &nbsp;&#x20A6;0</strong>`;
    }
    if (totalWithdrawalTransferAmount) {
      totalWithdrawalTransferAmount.innerHTML = `<strong>Total Withdrawal/Transfer = &nbsp;&#x20A6;0</strong>`;
    }
    if (totalBillPaymentAmount) {
      totalDepositAmount.innerHTML = `<strong>Total Bill Payment = &nbsp;&#x20A6;0</strong>`;
    }
    return;
  }

  //   Deposit Amount Sum
  const depositTransactions = data.filter(
    (item) => item.transaction_type === 'DEPOSIT'
  );

  const depositAmount = depositTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //   console.log('object', depositTransactions);
  console.log('Total deposit amount:', depositAmount);

  //   Withdrawal Amount Sum
  const withdrawalTransactions = data.filter(
    (item) => item.transaction_type === 'WITHDRAWAL'
  );

  const withdrawalAmount = withdrawalTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //   console.log('object', withdrawalTransactions);
  console.log('Total withdrawal amount:', withdrawalAmount);

  //   Withdrawal_Transfer Amount Sum
  const withdrawalTransferTransactions = data.filter(
    (item) => item.transaction_type === 'WITHDRAWAL_TRANSFER'
  );

  const withdrawalTransferAmount = withdrawalTransferTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //   Bill Payment Amount Sum
  const billPaymentTransactions = data.filter(
    (item) => item.transaction_type === 'BILL_PAYMENT'
  );

  const billPaymentAmount = billPaymentTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //   console.log('object', billPaymentTransactions);
  console.log('Total Bill Payment amount:', billPaymentAmount);

  //   POS charges Amount Sum
  const posCharges = data.filter((item) => item.charges);

  //   console.log('total pos Charge', posCharges);

  const posChargesAmount = posCharges.reduce(
    (sum, item) => sum + Number(item.charge),
    0
  );

  //   console.log('object', posCharges);
  console.log('Total POS Charges amount:', posChargesAmount);

  //   Total Machine
  const machineFeeItems = data.filter(
    (item) => item.fees && item.fees.fee_amount
  );

  const totalMachineFeeAmount = machineFeeItems.reduce(
    (sum, item) => sum + Number(item.fees.fee_amount),
    0
  );

  console.log('Total Machine fee:', totalMachineFeeAmount);

  //   total Amount Sum
  const totalAmount =
    depositAmount +
    withdrawalAmount +
    billPaymentAmount +
    withdrawalTransferAmount;

  //   Total Withdrawals and Bill Payment
  //   const filteredTransactions = data.filter(
  //     (item) =>
  //       item.transaction_type !== 'DEPOSIT' &&
  //       item.transaction_type !== 'WITHDRAWAL_TRANSFER'
  //   );

  //   const totalAmount = filteredTransactions.reduce(
  //     (sum, item) => sum + item.transaction_amount,
  //     0
  //   );

  //   Total Machine Fees
  //   const feeItems = data.filter((item) => item.fees && item.fees.fee_amount);

  //   const totalFee = feeItems.reduce(
  //     (sum, item) => sum + Number(item.fees.fee_amount),
  //     0
  //   );

  //   console.log('Total fee:', totalFee);

  if (totalPosAmount) {
    totalPosAmount.innerHTML = `<strong>Total Amount = &nbsp;&#x20A6;${formatAmountWithCommas(
      totalAmount
    )}</strong>`;
  }

  if (totalPosFee) {
    totalPosFee.innerHTML = `<strong>Total POS Charges = &nbsp;&#x20A6;${formatAmountWithCommas(
      posChargesAmount
    )}</strong>`;
  }

  if (totalMachineFee) {
    totalMachineFee.innerHTML = `<strong>Total Machine Fee = &nbsp;&#x20A6;${formatAmountWithCommas(
      totalMachineFeeAmount
    )}</strong>`;
  }

  if (totalDepositAmount) {
    totalDepositAmount.innerHTML = `<strong>Total Deposit = &nbsp;&#x20A6;${formatAmountWithCommas(
      depositAmount
    )}</strong>`;
  }

  if (totalWithdrawalAmount) {
    totalWithdrawalAmount.innerHTML = `<strong>Total Withdrawals = &nbsp;&#x20A6;${formatAmountWithCommas(
      withdrawalAmount
    )}</strong>`;
  }

  if (totalWithdrawalTransferAmount) {
    totalWithdrawalTransferAmount.innerHTML = `<strong>Total Withdrawals/Transfer = &nbsp;&#x20A6;${formatAmountWithCommas(
      withdrawalTransferAmount
    )}</strong>`;
  }

  if (totalBillPaymentAmount) {
    totalBillPaymentAmount.innerHTML = `<strong>Total Bill Payment = &nbsp;&#x20A6;${formatAmountWithCommas(
      billPaymentAmount
    )}</strong>`;
  }
}

renderPosTable();

// JS to Render Sold goods from LocalStorage
const storedSoldGoods =
  JSON.parse(localStorage.getItem('soldProductFormData')) || [];

function renderGoodsTable() {
  const goodsTableBody = document.querySelector('.soldTableDisplay tbody');

  if (goodsTableBody) {
    goodsTableBody.innerHTML = '';

    storedSoldGoods.forEach((data, index) => {
      const row = document.createElement('tr');
      row.classList.add('table-body-row');

      row.innerHTML = `
    <td class="py-1">${index + 1}.</td>
    <td class="py-1 soldItemNameReport">${data.soldProductNameInput}</td>
    <td class="py-1 soldItemPriceReport">${`&#x20A6; ${formatAmountWithCommas(
      data.soldProductPriceInput
    )}`}</td>
    <td class="py-1 soldItemStatusReport">${data.checkboxStatus}</td>
    <td class="py-1 soldItemBalanceReport">${
      data.productBalancePriceInput === '-'
        ? '-'
        : `&#x20A6; ${formatAmountWithCommas(data.productBalancePriceInput)}`
    }</td>
    <td class="py-1 soldItemRemarkReport ">${data.soldProductRemarkInput}</td>
      `;
      goodsTableBody.appendChild(row);
    });
  }

  updateTotalSoldAmounts(storedSoldGoods);
}

// JS to give total Sold Amount
function updateTotalSoldAmounts(data) {
  const totalSoldAmount = document.getElementById('totalSoldAmount');

  const totalAmount = data.reduce(
    (sum, item) => sum + item.soldProductPriceInput,
    0
  );

  if (totalSoldAmount) {
    totalSoldAmount.innerHTML = `<strong>Total Amount = &nbsp;&#x20A6;${formatAmountWithCommas(
      totalAmount
    )}</strong>`;
  }
}

renderGoodsTable();

//  Delete POS Transactiion Data

// document
//   .getElementById('deleteAllButton')
//   .addEventListener('click', async () => {
//     const confirmDelete = confirm(
//       'Are you sure you want to delete all transactions for the day? This action cannot be undone.'
//     );

//     if (confirmDelete) {
//       try {
//         const response = await deleteAllTransactions();
//         if (response.success) {
//           alert('All transactions have been successfully deleted.');
//           // Clear the table and update totals
//           allPosTransactions = [];
//           renderPosTable(); // Clear table display
//           updateTotalPosAmounts([]); // Reset totals to zero
//         } else {
//           alert('Failed to delete transactions. Please try again.');
//         }
//       } catch (error) {
//         console.error('Error deleting transactions:', error);
//         alert('An error occurred while trying to delete transactions.');
//       }
//     }
//   });

// JS for modal
const main = document.querySelector('.main');
const sidebar = document.querySelector('.sidebar');

const closeModalButton = document.querySelectorAll('.closeModal');
const closeImageModalBtn = document.querySelectorAll('.closeImageModal');

closeModalButton.forEach((closeButton) => {
  closeButton.addEventListener('click', function () {
    closeModal();
  });
});

function closeModal() {
  const addUserContainer = document.querySelector('.addUser');

  addUserContainer.classList.remove('active');

  main.classList.remove('blur');
  sidebar.classList.remove('blur');
  main.classList.remove('no-scroll');
}

// JS for Modal
document.addEventListener('DOMContentLoaded', function () {
  const addButton = document.querySelector('.add-user');
  const addUserContainer = document.querySelector('.addUser');

  if (addButton) {
    addButton.addEventListener('click', function () {
      addUserContainer.classList.add('active');
      main.classList.add('blur');
      sidebar.classList.add('blur');
      main.classList.add('no-scroll');
    });
  }
});

// BACKUP POS FORM DATA, I DONT WANT TO DELETE IT>

// async function renderPosTable() {
//   const posTableBody = document.querySelector('.posTableDisplay tbody');
//   const loadingRow = document.querySelector('.loading-row');
//   const loadMoreButton = document.querySelector('#loadMoreButton');

//   if (!posTableBody || !loadingRow) {
//     console.error('Table or loading row not found');
//     return;
//   }

//   try {
//     loadingRow.style.display = 'table-row';

//     const posTransactionData = await getPosTransactions(currentPage, pageSize);
//     const posTransactions = posTransactionData.data;

//     const pagination = posTransactionData.meta.pagination;

//     loadingRow.style.display = 'none';

//     if (posTransactions.length === 0 && currentPage === 1) {
//       posTableBody.innerHTML =
//         '<tr class="loading-row"><td colspan="7" class="table-error-text ">No Transactions Available.</td></tr>';
//       return;
//     }

//     posTransactions.forEach((posTransaction, index) => {
//       const {
//         fee_payment_type,
//         transaction_amount,
//         transaction_fee,
//         transaction_remark,
//         transaction_type,
//         withdrawal_type,
//       } = posTransaction;

//       function toTitleCase(value) {
//         return value.charAt(0).toUpperCase() + value.slice(1);
//       }

//       function formatTransactionType(value) {
//         switch (value.toLowerCase()) {
//           case 'withdraw':
//             return 'Withdraw';
//           case 'withdrawal/transfer':
//             return 'Withdrawal & Transfer';
//           case 'bill-payment':
//             return 'Bill Payment';
//           case 'deposit':
//             return 'Deposit';
//           default:
//             return value;
//         }
//       }

//       const feePaymentType = toTitleCase(fee_payment_type || 'N/A');
//       const transactionType = transaction_type?.type || 'N/A';
//       const withdrawalType = toTitleCase(withdrawal_type?.type || 'N/A');

//       const row = document.createElement('tr');
//       row.classList.add('table-body-row');

//       row.innerHTML = `
//        <td class="py-1">${index + 1 + (currentPage - 1) * pageSize}.</td>
//        <td class="py-1 posTransTypeReport">${formatTransactionType(
//          transactionType
//        )}</td>
//        <td class="py-1 posAmountReport">&#x20A6;${formatAmountWithCommas(
//          transaction_amount
//        )}</td>
//        <td class="py-1 posFeeReport">&#x20A6;${formatAmountWithCommas(
//          transaction_fee
//        )}</td>
//        <td class="py-1 posFeePaymentMethodReport">${feePaymentType}</td>
//        <td class="py-1 posPaymentMethodReport">${withdrawalType}</td>
//        <td class="py-1 posPaymentMethodRemark">${transaction_remark}</td>
//      `;

//       posTableBody.appendChild(row);
//     });

//     updateTotalPosAmounts(posTransactions);

//     // Show or hide the "Load More" button based on whether there are more pages
//     if (currentPage < pagination.pageCount) {
//       loadMoreButton.style.display = 'block';
//     } else {
//       loadMoreButton.style.display = 'none';
//     }
//   } catch (error) {
//     console.error('Error rendering POS transactions:', error);
//     posTableBody.innerHTML =
//       '<tr class="loading-row"><td colspan="7" class="table-error-text ">Error Loading Transactions.</td></tr>';
//   }

//   //   try {
//   //     loadingRow.style.display = 'table-row';

//   //     const posTransactionData = await getPosTransactions(currentPage, pageSize);
//   //     const posTransactions = posTransactionData.data;
//   //     const pagination = posTransactionData.meta.pagination;

//   //     posTableBody.innerHTML = '';

//   //     if (posTransactions.length === 0) {
//   //       posTableBody.innerHTML =
//   //         '<tr class="loading-row"><td colspan="6" class="table-error-text ">No Products Available.</td></tr>';
//   //     } else {
//   //       posTransactions.forEach((posTransaction, index) => {
//   //         const {
//   //           fee_payment_type,
//   //           transaction_amount,
//   //           transaction_fee,
//   //           transaction_remark,
//   //           transaction_type,
//   //           withdrawal_type,
//   //         } = posTransaction;

//   //         function toTitleCase(value) {
//   //           return value.charAt(0).toUpperCase() + value.slice(1);
//   //         }

//   //         function formatTransactionType(value) {
//   //           switch (value.toLowerCase()) {
//   //             case 'withdraw':
//   //               return 'Withdraw';
//   //             case 'withdrawal/transfer':
//   //               return 'Withdrawal & Transfer';
//   //             case 'bill-payment':
//   //               return 'Bill Payment';
//   //             case 'deposit':
//   //               return 'Deposit';
//   //             default:
//   //               return value;
//   //           }
//   //         }

//   //         const feePaymentType = toTitleCase(fee_payment_type || 'N/A');
//   //         const transactionType = transaction_type?.type || 'N/A';
//   //         const withdrawalType = toTitleCase(withdrawal_type?.type || 'N/A');

//   //         const row = document.createElement('tr');
//   //         row.classList.add('table-body-row');

//   //         row.innerHTML = `
//   //          <td class="py-1">${index + 1}.</td>
//   //          <td class="py-1 posTransTypeReport">${formatTransactionType(
//   //            transactionType
//   //          )}</td>
//   //          <td class="py-1 posAmountReport">&#x20A6;${formatAmountWithCommas(
//   //            transaction_amount
//   //          )}</td>
//   //            <td class="py-1 posFeeReport">&#x20A6;${formatAmountWithCommas(
//   //              transaction_fee
//   //            )}</td>
//   //            <td class="py-1 posFeePaymentMethodReport">${feePaymentType}</td>
//   //            <td class="py-1 posPaymentMethodReport">${withdrawalType}</td>
//   //            <td class="py-1 posPaymentMethodRemark">${transaction_remark}</td>
//   //               `;

//   //         posTableBody.appendChild(row);
//   //       });
//   //     }

//   //     updateTotalPosAmounts(posTransactions);
//   //   } catch (error) {
//   //     console.error('Error rendering products:', error);
//   //     goodsTableBody.innerHTML =
//   //       '<tr class="loading-row"><td colspan="6" class="table-error-text ">No Products Available.</td></tr>';
//   //   } finally {
//   //     loadingRow.style.display = 'none';
//   //   }
// }

// JavaScript to Load More

//  Disabled Sim Registration and Charging features
// // JS to Render saved Charged form data
// const storedChargedData =
//   JSON.parse(localStorage.getItem('chargeFormData')) || [];

// function renderChargingTable() {
//   const chargingTableBody = document.querySelector(
//     '.chargingTableDisplay tbody'
//   );

//   if (chargingTableBody) {
//     chargingTableBody.innerHTML = '';

//     storedChargedData.forEach((data, index) => {
//       const row = document.createElement('tr');
//       row.classList.add('table-body-row');

//       row.innerHTML = `
//     <td class="py-1">${index + 1}.</td>
//     <td class="py-1 chargedItemNameReport">${data.selectedDeviceType}</td>
//     <td class="py-1 chargedItemPriceReport">&#x20A6; ${
//       data.deviceChargeFeeInput
//     }</td>
//     <td class="py-1 chargedItemOwnerReport ">${data.deviceOwnerNameInput}</td>
//     <td class="py-1 chargedItemIdReport ">${data.deviceIdInput}</td>
//     <td class="py-1 chargedItemAltNumberReport ">${
//       data.alternativeNumberInput
//     }</td>
//     <td class="py-1 chargedItemStatusReport ">${data.selectedDeviceStatus}</td>
//       `;

//       chargingTableBody.appendChild(row);
//     });
//   }

//   updateTotalChargedAmounts(storedChargedData);
// }

// // JS to give total Charged Amount
// function updateTotalChargedAmounts(data) {
//   const totalChargedAmount = document.getElementById('totalChargedAmount');

//   const totalAmount = data.reduce(
//     (sum, item) => sum + item.deviceChargeFeeInput,
//     0
//   );

//   if (totalChargedAmount) {
//     totalChargedAmount.innerHTML = `<strong>Total Amount = &nbsp;&#x20A6;${formatAmountWithCommas(
//       totalAmount
//     )}</strong>`;
//   }
// }
// renderChargingTable();

// // JS to Render saved Sim Registration form data
// const storedSimRegData =
//   JSON.parse(localStorage.getItem('simRegFormData')) || [];

// function renderSimRegTable() {
//   const SimRegTableBody = document.querySelector('.simRegTableDisplay tbody');
//   if (SimRegTableBody) {
//     SimRegTableBody.innerHTML = '';

//     storedSimRegData.forEach((data, index) => {
//       const row = document.createElement('tr');
//       row.classList.add('table-body-row');

//       row.innerHTML = `
//     <td class="py-1">${index + 1}.</td>
//     <td class="py-1 simNameReport">${data.selectedSimName}</td>
//     <td class="py-1 simPriceReport">&#x20A6; ${data.simRegAmountInput}</td>
//     <td class="py-1 PhoneNumberReport">${data.phoneNumberInput}</td>
//     <td class="py-1 simStatusReport ">${data.checkboxStatus}</td>
//       `;

//       SimRegTableBody.appendChild(row);
//     });
//   }

//   updateTotalSimRegAmounts(storedSimRegData);
// }

// // JS to give total SIM Reg Amount
// function updateTotalSimRegAmounts(data) {
//   const totalSimRegAmount = document.getElementById('totalSimRegAmount');

//   const totalAmount = data.reduce(
//     (sum, item) => sum + item.simRegAmountInput,
//     0
//   );

//   if (totalSimRegAmount) {
//     totalSimRegAmount.innerHTML = `<strong>Total Amount = &nbsp;&#x20A6;${formatAmountWithCommas(
//       totalAmount
//     )}</strong>`;
//   }
// }

// renderSimRegTable();
