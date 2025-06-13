import config from '../config';
import {
  deleteAllTransactions,
  getPosTransactions,
} from './apiServices/pos/posResources';
import { checkAndPromptCreateShop } from './apiServices/shop/shopResource';
import { formatAmountWithCommas, formatTransactionType } from './helper/helper';
import { hideGlobalLoader, showGlobalLoader } from '../JS/helper/helper';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

// const shopId = parsedUserData?.shopId || dummyShopId;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const adminAccordionContainer = document.querySelector(
  '.adminAccordionContainer'
);

const staffContainer = document.querySelector('.staffContainer');

if (isAdmin) {
  adminAccordionContainer.style.display = 'block';
  staffContainer.style.display = 'none';
} else {
  adminAccordionContainer.style.display = 'none';
  staffContainer.style.display = 'block';
}

// JS to Render saved POS from Database to help with Load More features of the transactions.
let allPosTransactions = [];

// Pagination control for load more
let currentPage;
let shopPageTracker = {};
let totalItems;
let totalPages;
let pageSize = 10;
let limit = pageSize;
let currentFilters = {};

function getFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  return {
    startDate:
      document.getElementById(`startDateFilter_${suffix}`)?.value || '',
    endDate: document.getElementById(`endDateFilter_${suffix}`)?.value || '',
    type: document.getElementById(`typeFilter_${suffix}`)?.value || '',
    status: document.getElementById(`statusFilter_${suffix}`)?.value || '',
  };
}

function resetFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  document.getElementById(`startDateFilter_${suffix}`).value = '';
  document.getElementById(`endDateFilter_${suffix}`).value = '';
  document.getElementById(`typeFilter_${suffix}`).value = '';
  document.getElementById(`statusFilter_${suffix}`).value = '';
}

if (isAdmin) {
  showGlobalLoader();

  let enrichedShopData = [];
  const currentFiltersByShop = {};

  const container = document.getElementById('accordionShops');
  console.log('report', container);
  const { enrichedShopData: loadedShops } = await checkAndPromptCreateShop();
  hideGlobalLoader();
  enrichedShopData = loadedShops;

  //   console.log('enrichedShopData', enrichedShopData);

  if (enrichedShopData.length === 0) {
    container.innerHTML = `<h1 class="heading-text">No shop Available for Reports Display</h1>`;
  }

  enrichedShopData.forEach((shop, index) => {
    //  console.log(shop.length);
    const accordion = document.createElement('section');
    shopPageTracker[shop.id] = 1;

    const shopId = shop.id;

    accordion.className = 'accordion-section';
    accordion.innerHTML = `        <button class="accordion-toggle card heading-text" data-shop-id="${shop.id}">
                  <h2 class="heading-subtext">
                     ${shop.shop_name}
                  </h2>

                  <i class="fa-solid icon fa-chevron-down"></i>
               </button>
               
                   <div class="accordion-content">
      <div id="shop-report-${shop.id}" class="reports card" data-loaded="false">
                 <div class="reports">
                     <div class="reports-method">
                        <h2 class="heading-text mb-2">
                           POS Reports
                        </h2>

                        <h2 class="filter-heading heading-subtext mb-2">Filter Transactions</h2>

                        <div class="filter-section mb-2">

                           <div class="pos-method-form_input">
                              <label for="startDateFilter_admin_${shop.id}">Start Date:</label>

                              <input type="date" id="startDateFilter_admin_${shop.id}">
                           </div>

                           <div class="pos-method-form_input">
                              <label for="endDateFilter_admin_${shop.id}">End Date:</label>

                              <input type="date" id="endDateFilter_admin_${shop.id}">
                           </div>

                           <div class="pos-method-form_input ">

                              <label for="typeFilter_admin_${shop.id}">Transaction Type:</label>

                              <select id="typeFilter_admin_${shop.id}" name="typeFilter_admin_${shop.id}">
                                 <option value="">All</option>
                                 <option value="DEPOSIT">Deposit</option>
                                 <option value="WITHDRAWAL">Withdrawal</option>
                                 <option value="WITHDRAWAL_TRANSFER">Withdrawal/Transfer</option>
                                 <option value="BILL_PAYMENT">Bill Payment</option>
                              </select>
                           </div>

                           <div class="pos-method-form_input ">

                              <label for="statusFilter_admin_${shop.id}">Status:</label>

                              <select id="statusFilter_admin_${shop.id}" name="statusFilter_admin_${shop.id}">
                                 <option value="">All</option>
                                 <option value="SUCCESSFUL">Successful</option>
                                 <option value="FAILED">Failed</option>
                                 <option value="PENDING">Pending</option>
                              </select>
                           </div>


                           <div class="filter-buttons">
                              <button id="applyFiltersBtn_admin_${shop.id}" class="hero-btn-dark">Apply Filters</button>
                              <button id="resetFiltersBtn_${shop.id}" class="hero-btn-outline">Reset</button>
                           </div>

                        </div>

                        <!-- <div id="transactionList" class="transaction-list mb-3"></div> -->

                        <div class="table-header">
                           <!-- <h2 class="heading-subtext"> POS </h2> -->
                        </div>

                        <div class="reports-table-container">

                           <table class="reports-table posTableDisplay_admin_${shop.id}">
                                     <thead>
                                 <tr class="table-header-row">
                                    <th class="py-1">S/N</th>
                                    <th class="py-1">Date</th>
                                    <th class="py-1">Transaction Type</th>
                                    <th class="py-1">Customer Info</th>
                                    <th class="py-1">Amount</th>
                                    <th class="py-1">Charges</th>
                                    <th class="py-1">Machine Fee</th>
                                    <th class="py-1">Charge Payment Method</th>
                                    <th class="py-1">Payment Method</th>
                                    <th class="py-1">Remarks</th>
                                    <th class="py-1">Receipt ID</th>
                                 </tr>
                              </thead>

                                <tbody  id="pos-tbody-${shop.id}">

                                       </tbody>

                                               <tfoot>
                                 <tr class="table-foot-row px-2">
                                    <td colspan="4"></td>
                                    <td id="totalPosAmount" class="py-1 px-2">
                                       <strong></strong>
                                    </td>

                                    <td id="totalPosFee" class="py-1 px-2">
                                       <strong></strong>
                                    </td>

                                    <td id="totalMachineFee" class="py-1 px-2">
                                       <strong></strong>
                                    </td>

                                    <td id="totalDepositAmount" class="py-1 px-2">
                                       <strong></strong>
                                    </td>

                                    <td id="totalWithdrawalAmount" class="py-1 px-2">
                                       <strong></strong>
                                    </td>

                                    <td id="totalWithdrawalTransferAmount" class="py-1 px-2">
                                       <strong></strong>
                                    </td>

                                    <td id="totalBillPaymentAmount" class="py-1 px-2">
                                       <strong></strong>
                                    </td>
                                    <!-- <td></td> -->
                                 </tr>
                              </tfoot>
                           </table>

                                     <div id="loadMoreButtonDiv_admin" class=" center-button mt-2">

                              <button id="loadMoreButton_admin_${shop.id}" class=" hero-btn-dark load-more-button">Load
                                 More</button>
                              <!-- <button id="loadMoreButton" class="">Load More</button> -->
                           </div>

                        </div>

      </div>
    </div>`;

    container.appendChild(accordion);
    container.dataset.shopId;

    document
      .getElementById(`applyFiltersBtn_admin_${shop.id}`)
      ?.addEventListener('click', () => {
        const filters = getFilters('admin', shop.id);
        currentFiltersByShop[shop.id] = filters;

        renderPosTable({
          page: currentPage,
          limit,
          filters,
          shopId,
          tableBodyId: `#pos-tbody-${shop.id}`,
          loadMoreButton: document.getElementById(
            `loadMoreButton_admin_${shop.id}`
          ),
        });
      });

    document
      .getElementById(`resetFiltersBtn_${shop.id}`)
      ?.addEventListener('click', () => {
        const role = 'admin';

        resetFilters(role, shop.id);

        const filters = getFilters(role, shop.id);
        currentFiltersByShop[shop.id] = filters;

        renderPosTable({
          page: 1,
          limit,
          filters,
          shopId,
          tableBodyId: `#pos-tbody-${shop.id}`,
          loadMoreButton: document.getElementById(
            `loadMoreButton_admin_${shop.id}`
          ),
        });
      });

    const loadMoreButton = document.getElementById(
      `loadMoreButton_admin_${shop.id}`
    );

    loadMoreButton.style.display = 'none';

    loadMoreButton.addEventListener('click', () => {
      const role = 'admin';
      const nextPage = ++shopPageTracker[shop.id];
      // const filters = getFilters(role, shop.Id);
      const filters = currentFiltersByShop[shop.id] || {};

      renderPosTable({
        page: nextPage,
        limit,
        filters,
        shopId,
        tableBodyId: `#pos-tbody-${shop.id}`,
        loadMoreButton: document.getElementById(
          `loadMoreButton_admin_${shop.id}`
        ),
        append: true,
      });
    });

    const filters = getFilters('admin', shop.id);
    currentFiltersByShop[shop.id] = filters;

    //  renderPosTable({
    //    page: currentPage,
    //    limit,
    //    filters,
    //    shopId,
    //    tableBodyId: `.posTableDisplay_admin_${shopId} tbody`,
    //    loadMoreButton: document.getElementById(`loadMoreButton_admin_${shopId}`),
    //  });
  });

  async function renderPosTable({
    page = 1,
    limit = pageSize,
    filters,
    shopId,
    tableBodyId,
    loadMoreButton,
  }) {
    const posTableBody = document.querySelector(tableBodyId);

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

      loadMoreButton.style.display = 'none';

      // Build query with filters
      const queryParams = new URLSearchParams({
        shopId: shopId,
        page,
        limit,
      });

      // console.log('queryParams', queryParams);

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

      // console.log(result);

      if (!result) throw new Error(result.message || 'Failed to fetch');

      const posTransactions = result.data.transactions;
      totalPages = result.data.totalPages;
      totalItems = result.data.totalItems;
      currentPage = result.data.currentPage;

      // Only reset array if starting from page 1
      if (page === 1) {
        allPosTransactions = [];
      }

      //  if (posTransactions.length === 0 && page === 1) {
      //    posTableBody.innerHTML =
      //      '<tr><td colspan="11" class="table-no-data">No transactions found.</td></tr>';
      //    return;
      //  }

      if (posTransactions.length === 0 && currentPage === 1) {
        posTableBody.innerHTML =
          '<tr class="loading-row"><td colspan="11" class="table-error-text ">No Transactions Available.</td></tr>';
        return;
      }

      posTransactions.forEach((transaction) => {
        if (!allPosTransactions.some((t) => t.id === transaction.id)) {
          allPosTransactions.push(transaction);
        }
      });

      // Clear the table body and render all accumulated transactions
      // if (!append) {
      posTableBody.innerHTML = '';
      // }

      const groupedByDate = {};

      allPosTransactions.forEach((tx) => {
        const dateObj = new Date(tx.business_day);
        const dateKey = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }); // "May 11, 2025"

        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(tx);
      });

      //  console.log(groupedByDate);

      let serialNumber = 1;

      Object.entries(groupedByDate).forEach(([date, transactions]) => {
        // Insert group row (header for the date)
        const groupRow = document.createElement('tr');
        groupRow.className = 'date-group-row table-body-row ';

        groupRow.innerHTML = `
    <td colspan="11" class="date-header py-1 mt-1 mb-1">
      <strong>${date}</strong>     </td>

   `;
        posTableBody.appendChild(groupRow);

        //       groupRow.innerHTML = `
        //     <td colspan="11" class="date-header py-1 mt-1 mb-1">
        //       <strong>${date}</strong> — Total: ₦${formatAmountWithCommas(dailyTotal)}
        //     </td>
        //   `;

        transactions.forEach((posTransaction) => {
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
          const transactionCharges = charges?.charge_amount || '-';

          const row = document.createElement('tr');
          row.classList.add('table-body-row');
          row.innerHTML = `
     <td class="py-1">${serialNumber++}.</td>
     <td class="py-1">${business_day}</td>
     <td class="py-1 posTransTypeReport">${formatTransactionType(
       transaction_type
     )}</td>
     <td class="py-1 posCustomerInfo">${`${customer_name} - ${customer_phone}`}</td>
     <td class="py-1 posAmountReport">&#x20A6;${formatAmountWithCommas(
       amount
     )}</td>
     <td class="py-1 posChargesReport">&#x20A6;${formatAmountWithCommas(
       transactionCharges
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

        // Insert total row (Footer for Daily Totals))
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row table-body-row ';

        // const dailyTotal = transactions.reduce(
        //   (sum, t) => sum + Number(t.amount),
        //   0
        // );

        // Update total amounts for each day startinf wth partial totals and ending the day with final Total.
        updateTotalPosAmounts(transactions, totalRow, date);

        posTableBody.appendChild(totalRow);
      });

      // Handle Load More button visibility
      if (currentPage >= totalPages) {
        loadMoreButton.style.display = 'none';
      } else {
        loadMoreButton.style.display = 'block';
      }
    } catch (error) {
      console.error('Error rendering transactions:', error);
      posTableBody.innerHTML =
        '<tr><td colspan="6" class="table-error-text">Error loading transactions.</td></tr>';
    }
  }

  container.addEventListener('click', async function (e) {
    const toggleBtn = e.target.closest('.accordion-toggle');
    if (!toggleBtn) return;

    const section = toggleBtn.closest('.accordion-section');
    const content = section.querySelector('.accordion-content');

    const shopId = toggleBtn.dataset.shopId;

    const isActive = section.classList.contains('active');

    // Close all accordion sections
    document.querySelectorAll('.accordion-section').forEach((sec) => {
      sec.classList.remove('active');
    });

    // Re-open only if it wasn't active before
    if (!isActive) {
      section.classList.add('active');
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    const filters = getFilters('admin', shopId);
    currentFiltersByShop[shopId] = filters;
    shopPageTracker[shopId] = 1;

    const shopPosTransactiionSection = document.getElementById(
      `shop-report-${shopId}`
    );
    if (
      shopPosTransactiionSection &&
      shopPosTransactiionSection.dataset.loaded !== 'true'
    ) {
      await renderPosTable({
        page: shopPageTracker[shopId],
        limit,
        filters,
        shopId,
        tableBodyId: `#pos-tbody-${shopId}`,
        loadMoreButton: document.getElementById(
          `loadMoreButton_admin_${shopId}`
        ),
      });
      shopPosTransactiionSection.dataset.loaded = 'true';
    }

    //  await renderPosTable({
    //    page: shopPageTracker[shopId],
    //    limit,
    //    filters,
    //    shopId,
    //    tableBodyId: `#pos-tbody-${shopId}`,
    //    loadMoreButton: document.getElementById(`loadMoreButton_admin_${shopId}`),
    //  });

    // Toggle accordion
    //  section.classList.toggle('active');
    //  if (section.classList.contains('active')) {
    //    icon.style.transform = 'rotate(180deg)';
    //  } else {
    //    icon.style.transform = 'rotate(0deg)';
    //  }
  });
}

if (isStaff) {
  const shopId = parsedUserData?.shopId || dummyShopId;

  document
    .getElementById('applyFiltersBtn_staff')
    ?.addEventListener('click', () => {
      const filters = getFilters('staff');
      renderPosTable(1, pageSize, filters, 'staff');
    });

  document
    .getElementById('resetFiltersBtn_staff')
    ?.addEventListener('click', () => {
      const role = 'staff';
      resetFilters(role);
      const filters = getFilters(role);
      const tableSelector = '.posTableDisplay_staff tbody';
      renderPosTable(1, pageSize, filters, 'staff');
    });

  const loadMoreButton = document.getElementById('loadMoreButton_staff');

  loadMoreButton.style.display = 'none';

  loadMoreButton.addEventListener('click', () => {
    const role = 'staff';
    currentPage += 1;
    const filters = getFilters(role);

    //  const tableBodyId = '.posTableDisplay_staff tbody';

    renderPosTable(currentPage, pageSize, filters, role);
  });

  //   loadMoreButton.addEventListener('click', () => {
  //     currentPage += 1;
  //     renderPosTable(currentPage, pageSize, currentFilters);
  //   });

  async function renderPosTable(
    page = 1,
    pageSize,
    filters = {},
    role = 'staff'
  ) {
    const posTableBody = document.querySelector(
      `.posTableDisplay_${role} tbody`
    );

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

      loadMoreButton.style.display = 'none';

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

      // console.log(result);

      if (!result) throw new Error(result.message || 'Failed to fetch');

      const posTransactions = result.data.transactions;
      totalPages = result.data.totalPages;
      totalItems = result.data.totalItems;
      currentPage = result.data.currentPage;

      // Only reset array if starting from page 1
      if (page === 1) {
        allPosTransactions = [];
      }

      if (posTransactions.length === 0 && currentPage === 1) {
        posTableBody.innerHTML =
          '<tr class="loading-row"><td colspan="11" class="table-error-text ">No Transactions Available.</td></tr>';
        return;
      }

      posTransactions.forEach((transaction) => {
        if (!allPosTransactions.some((t) => t.id === transaction.id)) {
          allPosTransactions.push(transaction);
        }
      });

      // Clear the table body and render all accumulated transactions
      posTableBody.innerHTML = '';

      const groupedByDate = {};

      allPosTransactions.forEach((tx) => {
        const dateObj = new Date(tx.business_day);
        const dateKey = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }); // "May 11, 2025"

        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(tx);
      });

      //  console.log(groupedByDate);

      let serialNumber = 1;

      Object.entries(groupedByDate).forEach(([date, transactions]) => {
        // Insert group row (header for the date)
        const groupRow = document.createElement('tr');
        groupRow.className = 'date-group-row table-body-row ';

        groupRow.innerHTML = `
      <td colspan="11" class="date-header py-1 mt-1 mb-1">
        <strong>${date}</strong>     </td>

     `;
        posTableBody.appendChild(groupRow);

        //       groupRow.innerHTML = `
        //     <td colspan="11" class="date-header py-1 mt-1 mb-1">
        //       <strong>${date}</strong> — Total: ₦${formatAmountWithCommas(dailyTotal)}
        //     </td>
        //   `;

        transactions.forEach((posTransaction) => {
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
          const transactionCharges = charges?.charge_amount || '-';

          const row = document.createElement('tr');
          row.classList.add('table-body-row');
          row.innerHTML = `
       <td class="py-1">${serialNumber++}.</td>
       <td class="py-1">${business_day}</td>
       <td class="py-1 posTransTypeReport">${formatTransactionType(
         transaction_type
       )}</td>
       <td class="py-1 posCustomerInfo">${`${customer_name} - ${customer_phone}`}</td>
       <td class="py-1 posAmountReport">&#x20A6;${formatAmountWithCommas(
         amount
       )}</td>
       <td class="py-1 posChargesReport">&#x20A6;${formatAmountWithCommas(
         transactionCharges
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

        // Insert total row (Footer for Daily Totals))
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row table-body-row ';

        // const dailyTotal = transactions.reduce(
        //   (sum, t) => sum + Number(t.amount),
        //   0
        // );

        // Update total amounts for each day startinf wth partial totals and ending the day with final Total.
        updateTotalPosAmounts(transactions, totalRow, date);

        posTableBody.appendChild(totalRow);
      });

      // Handle Load More button visibility
      if (currentPage >= totalPages) {
        loadMoreButton.style.display = 'none';
      } else {
        loadMoreButton.style.display = 'block';
      }
    } catch (error) {
      console.error('Error rendering transactions:', error);
      posTableBody.innerHTML =
        '<tr><td colspan="6" class="table-error-text">Error loading transactions.</td></tr>';
    }
  }

  renderPosTable();
}

function updateTotalPosAmounts(transactions, totalRow, date) {
  //   Deposit Amount Sum
  const depositTransactions = transactions.filter(
    (item) => item.transaction_type === 'DEPOSIT'
  );

  const depositAmount = depositTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //   console.log('object', depositTransactions);
  //   console.log('Total deposit amount:', depositAmount);

  //   Withdrawal Amount Sum
  const withdrawalTransactions = transactions.filter(
    (item) => item.transaction_type === 'WITHDRAWAL'
  );

  const withdrawalAmount = withdrawalTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //   console.log('object', withdrawalTransactions);
  //   console.log('Total withdrawal amount:', withdrawalAmount);

  //   Withdrawal_Transfer Amount Sum
  const withdrawalTransferTransactions = transactions.filter(
    (item) => item.transaction_type === 'WITHDRAWAL_TRANSFER'
  );

  const withdrawalTransferAmount = withdrawalTransferTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //   Bill Payment Amount Sum
  const billPaymentTransactions = transactions.filter(
    (item) => item.transaction_type === 'BILL_PAYMENT'
  );

  const billPaymentAmount = billPaymentTransactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  //   console.log('object', billPaymentTransactions);
  //   console.log('Total Bill Payment amount:', billPaymentAmount);

  //   POS charges Amount Sum
  const posChargesItems = transactions.filter(
    (item) => item.charges && item.charges.charge_amount
  );

  //   console.log('total pos Charge', posChargesItems);

  const posChargesAmount = posChargesItems.reduce(
    (sum, item) => sum + Number(item.charges.charge_amount),
    0
  );

  //   console.log('object', posCharges);
  //   console.log('Total POS Charges amount:', posChargesAmount);

  //   Total Machine
  const machineFeeItems = transactions.filter(
    (item) => item.fees && item.fees.fee_amount
  );

  const totalMachineFeeAmount = machineFeeItems.reduce(
    (sum, item) => sum + Number(item.fees.fee_amount),
    0
  );

  //   console.log('Total Machine fee:', totalMachineFeeAmount);

  //   total Amount Sum
  const totalAmount =
    depositAmount +
    withdrawalAmount +
    billPaymentAmount +
    withdrawalTransferAmount;

  totalRow.innerHTML = `
     <td colspan="4" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>${date} SUMMARY:</strong>
     </td>
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Amount</strong> = ₦${formatAmountWithCommas(totalAmount)}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total POS Charges </strong> = ₦${formatAmountWithCommas(
         posChargesAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Machine Fee </strong> = ₦${formatAmountWithCommas(
         totalMachineFeeAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Deposit</strong> = ₦${formatAmountWithCommas(
         depositAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Withdrawals</strong> = ₦${formatAmountWithCommas(
         withdrawalAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Withdrawals/Transfer</strong> = ₦${formatAmountWithCommas(
         withdrawalTransferAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Bill Paymen</strong> = ₦${formatAmountWithCommas(
         billPaymentAmount
       )}
     </td>
   `;
}

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

// renderGoodsTable();

// JS for Tabs and Charts
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((b) => b.classList.remove('active'));
    contents.forEach((c) => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Dummy chart data For Daily and Monthly Sales
const dailyCtx = document.getElementById('dailyChart');
const monthlyCtx = document.getElementById('monthlyChart');

// new Chart(dailyCtx, {
//   type: 'bar',
//   data: {
//     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
//     datasets: [
//       {
//         label: 'Daily Sales (₦)',
//         data: [1200, 1500, 1800, 900, 2000, 1700],
//         backgroundColor: 'rgba(75, 192, 192, 0.6)',
//       },
//     ],
//   },
// });

// new Chart(monthlyCtx, {
//   type: 'line',
//   data: {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
//     datasets: [
//       {
//         label: 'Monthly Revenue (₦)',
//         data: [10000, 12000, 9000, 14000, 16000],
//         borderColor: 'rgba(153, 102, 255, 1)',
//         fill: false,
//       },
//     ],
//   },
// });

// Chartjs Approach - Daily
// const dummyHourlyData = Array.from({ length: 24 }, (_, hour) => ({
//   hour,
//   count: Math.floor(Math.random() * 5),
//   amount: Math.floor(Math.random() * 2000),
// }));

// function renderDailyChart(hourlyData) {
//   const labels = hourlyData.map((entry) => `${entry.hour}:00`);
//   const amounts = hourlyData.map((entry) => entry.amount);

//   new Chart(dailyCtx, {
//     type: 'bar',
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: 'Hourly Sales (₦)',
//           data: amounts,
//           backgroundColor: 'rgba(75, 192, 192, 0.6)',
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       scales: {
//         y: {
//           beginAtZero: true,
//         },
//       },
//     },
//   });
// }

// renderDailyChart(dummyHourlyData);

const dummyHourlyData = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  count: Math.floor(Math.random() * 5),
  amount: Math.floor(Math.random() * 1000),
}));

const dailyOptions = {
  chart: {
    type: 'line',
    height: 550,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      borderRadiusApplication: 'end',
      horizontal: true,
    },
  },
  series: [
    {
      name: 'Hourly Revenue (₦)',
      data: dummyHourlyData.map((h) => h.amount),
    },
  ],
  xaxis: {
    categories: dummyHourlyData.map((h) => `${h.hour}:00`),
    title: { text: 'Hour of Day' },
    labels: {
      rotate: -45,
      style: { fontSize: '11px' },
    },
  },
  yaxis: {
    title: { text: 'Amount (₦)' },
  },
  tooltip: {
    y: {
      formatter: (val) => `₦${val.toLocaleString()}`,
    },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: { height: 300 },
        xaxis: {
          labels: { rotate: -90 },
        },
      },
    },
  ],
};

const dailyChart = new ApexCharts(
  document.querySelector('#dailyChart'),
  dailyOptions
);
dailyChart.render();

// Chartjs Approach - Monthly

// const dummyMonthlyData = Array.from({ length: 31 }, (_, i) => ({
//   day: i + 1,
//   count: Math.floor(Math.random() * 10),
//   amount: Math.floor(Math.random() * 10000),
// }));

// function renderMonthlyChart(dailyData) {
//   const labels = dailyData.map((entry) => `Day ${entry.day}`);
//   const amounts = dailyData.map((entry) => entry.amount);

//   new Chart(monthlyCtx, {
//     type: 'line',
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: 'Daily Revenue (₦)',
//           data: amounts,
//           borderColor: 'rgba(153, 102, 255, 1)',
//           fill: false,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       scales: {
//         y: {
//           beginAtZero: true,
//         },
//       },
//     },
//   });
// }

// renderMonthlyChart(dummyMonthlyData);

const dummyMonthlyData = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  count: Math.floor(Math.random() * 10),
  amount: Math.floor(Math.random() * 10000),
}));

const options = {
  chart: {
    type: 'line',
    height: 550,
    toolbar: { show: false },
  },
  series: [
    {
      name: 'Daily Revenue (₦)',
      data: dummyMonthlyData.map((d) => d.amount),
    },
  ],
  xaxis: {
    categories: dummyMonthlyData.map((d) => `Day ${d.day}`),
    labels: {
      rotate: -45,
      style: { fontSize: '12px' },
    },
  },
  yaxis: {
    title: { text: 'Amount (₦)' },
  },
  tooltip: {
    y: {
      formatter: (val) => `₦${val.toLocaleString()}`,
    },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: { height: 300 },
        xaxis: {
          labels: { rotate: -90 },
        },
      },
    },
  ],
};

const chart = new ApexCharts(document.querySelector('#monthlyChart'), options);
chart.render();

// Dummy product sales data
const productData = {
  Smartphone: {
    summary: { quantity: 6, revenue: 270000, cost: 240000, profit: 30000 },
    sales: [
      {
        customer: 'John Doe',
        qty: 2,
        unit: 45000,
        total: 90000,
        date: '2025-05-21',
      },
      {
        customer: 'Jane Roe',
        qty: 2,
        unit: 45000,
        total: 90000,
        date: '2025-05-22',
      },
      {
        customer: 'Mark Smith',
        qty: 2,
        unit: 45000,
        total: 90000,
        date: '2025-05-23',
      },
    ],
  },
  Tablet: {
    summary: { quantity: 4, revenue: 140000, cost: 120000, profit: 20000 },
    sales: [
      {
        customer: 'Ayo James',
        qty: 2,
        unit: 35000,
        total: 70000,
        date: '2025-05-20',
      },
      {
        customer: 'Linda Blue',
        qty: 2,
        unit: 35000,
        total: 70000,
        date: '2025-05-21',
      },
    ],
  },
  Laptop: {
    summary: { quantity: 3, revenue: 240000, cost: 210000, profit: 30000 },
    sales: [
      {
        customer: 'Tunde Green',
        qty: 1,
        unit: 80000,
        total: 80000,
        date: '2025-05-19',
      },
      {
        customer: 'Blessing B.',
        qty: 2,
        unit: 80000,
        total: 160000,
        date: '2025-05-20',
      },
    ],
  },
};

const productSelect = document.getElementById('productSelect');
const totalQty = document.getElementById('totalQty');
const totalRev = document.getElementById('totalRev');
const totalCost = document.getElementById('totalCost');
const totalProfit = document.getElementById('totalProfit');
const tableBody = document.querySelector('#productSalesTable tbody');

function updateProductData(product) {
  const data = productData[product];
  totalQty.textContent = data.summary.quantity;
  totalRev.textContent = `₦${formatAmountWithCommas(data.summary.revenue)}`;
  totalCost.textContent = `₦${formatAmountWithCommas(data.summary.cost)}`;
  totalProfit.textContent = `₦${formatAmountWithCommas(data.summary.profit)}`;

  tableBody.innerHTML = data.sales
    .map(
      (row) => `
      <tr  class="table-body-row">
        <td  class="py-1">${row.customer}</td>
        <td  class="py-1">${row.qty}</td>
        <td class="py-1">₦${formatAmountWithCommas(row.unit)}</td>
        <td class="py-1">₦${formatAmountWithCommas(row.total)}</td>
        <td class="py-1">${row.date}</td>
      </tr>
    `
    )
    .join('');
}

productSelect.addEventListener('change', (e) => {
  updateProductData(e.target.value);
});

// Initialize with first product
updateProductData('Smartphone');

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
//         '<tr class="loading-row"><td colspan="11" class="table-error-text ">No Transactions Available.</td></tr>';
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
