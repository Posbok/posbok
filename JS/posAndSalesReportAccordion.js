import config from '../config';
import {
  deletePosTransaction,
  getFinancialSummary,
  getPosAnalytics,
  getPosTransactions,
  getPosTransactionsById,
} from './apiServices/pos/posResources';
import {
  deleteSaleTransaction,
  getAllSales,
  getDailySalesSummary,
  getMonthlySalesSummary,
  getSaleById,
  updateSale,
} from './apiServices/sales/salesResources';
import { updateTotalPosAmounts } from './apiServices/utility/posReportUtility';
import {
  updateDailySalesData,
  updateMonthlySalesData,
  updateSalesReceipt,
  updateTotalSalesAmounts,
} from './apiServices/utility/salesReportUtility';
import {
  formatAmountWithCommas,
  formatDateTimeReadable,
  formatSaleStatus,
  formatTransactionType,
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
  truncateProductNames,
} from './helper/helper';
import { closeModal, showToast } from './script';

const userData = config.userData;
const parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const staffShopId = parsedUserData?.shopId;
const staffUserId = parsedUserData?.id;
const shopKey = `shop_${staffUserId}`;
const servicePermission = parsedUserData?.servicePermission;

export function openDeleteTransactionModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const deleteTransactionContainer = document.querySelector(
    '.deleteTransactionContainer'
  );

  if (deleteTransactionContainer)
    deleteTransactionContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function openDeleteSaleModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const deleteSaleContainer = document.querySelector('.deleteSaleContainer');

  if (deleteSaleContainer) deleteSaleContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function openUpdateSaleButton() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateSaleContainer = document.querySelector('.updateSale');

  if (updateSaleContainer) updateSaleContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function deleteTransactionForm(transaction, shop_id) {
  const form = document.querySelector('.deleteTransactionContainerModal');
  if (!form) return;

  //   console.log('transaction ', transaction);

  form.dataset.transactionId = transaction.id;
  form.dataset.shopId = shop_id;

  document.getElementById('confirmation-text').textContent =
    transaction.transaction_type;
}

export function deleteSaleForm(saleId, shop_id) {
  const form = document.querySelector('.deleteSaleContainerModal');
  if (!form) return;

  //   console.log('saleId ', saleId);

  form.dataset.saleId = saleId;
  form.dataset.shopId = shop_id;

  //   console.log(transaction);
  //   document.getElementById('confirmation-text').textContent =
  //     transaction.transaction_type;
}

export function updateSaleForm(saleDetail) {
  //   console.log('Sale Detail:', saleDetail);

  const form = document.querySelector('.updateSaleModal');
  if (!form) return;

  //   form.dataset.saleId = saleId;

  //   if (!form || form.dataset.bound === 'true') return;
  //   form.dataset.bound = 'true';

  //   console.log(saleDetail.data);

  const sale = saleDetail.data;

  const {
    customer_name,
    customer_phone,
    id: saleId,
    remarks,
    shop_id: shopId,
  } = sale;

  form.dataset.shopId = shopId;

  document.querySelector('#updateSaleCustomerName').value = customer_name;
  document.querySelector('#updateSaleCustomerPhone').value =
    Number(customer_phone) || '';
  document.querySelector('#updateSaleRemark').value = remarks;
}

export function bindDeleteTransactionFormListener() {
  const form = document.querySelector('.deleteTransactionContainerModal');
  if (!form) return;

  const deleteTransactionButton = form.querySelector(
    '.deleteTransactionButton'
  );
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    deleteTransactionButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const transactionId = form.dataset.transactionId;
      const shopId = form.dataset.shopId;

      if (!transactionId) {
        showToast('fail', '❎ No Transaction ID found.');
        return;
      }

      try {
        showBtnLoader(deleteTransactionButton);
        await deletePosTransaction(transactionId);
        hideBtnLoader(deleteTransactionButton);
        allPosTransactions = []; // reset to avoid duplication
        await renderPosTable({
          page: 1,
          limit: pageSize,
          filters: currentFilters, // reuse existing filters if available
          shopId,
          tableBodyId: `#pos-tbody-${shopId}`,
          loadMoreButton: document.getElementById(
            `loadMoreButton_admin_${shopId}`
          ),
          append: false,
        });
        closeModal();
        showToast('success', '✅ Transaction deleted successfully.');
      } catch (err) {
        hideBtnLoader(deleteTransactionButton);
        console.error(err);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function bindDeleteSaleFormListener() {
  const form = document.querySelector('.deleteSaleContainerModal');
  if (!form) return;

  const deleteSaleButton = form.querySelector('.deleteSaleButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    deleteSaleButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const saleId = form.dataset.saleId;
      const shopId = form.dataset.shopId;

      if (!saleId) {
        showToast('fail', '❎ No Sale ID found.');
        return;
      }

      try {
        showBtnLoader(deleteSaleButton);
        await deleteSaleTransaction(saleId);
        hideBtnLoader(deleteSaleButton);
        allSalesReport = []; // reset to avoid duplication
        await renderSalesTable({
          page: 1,
          limit: pageSize,
          filters: currentFilters, // reuse existing filters if available
          shopId,
          tableBodyId: `#sale-tbody-${shopId}`,
          loadMoreButton: document.getElementById(
            `loadMoreSaleButton_admin_${shopId}`
          ),
          // append: false,
        });
        closeModal();
        showToast('success', '✅ Sale Transaction deleted successfully.');
      } catch (err) {
        hideBtnLoader(deleteSaleButton);
        console.error(err);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function bindUpdateSaleFormListener() {
  const form = document.querySelector('.updateSaleModal');
  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const saleId = form.dataset.saleId;
      const shopId = form.dataset.shopId;

      if (!saleId) {
        showToast('fail', '❎ No sale selected for update.');
        return;
      }

      if (!shopId) {
        showToast('fail', '❎ No Shop selected for update.');
        return;
      }

      const updateSaleCustomerName = document.querySelector(
        '#updateSaleCustomerName'
      ).value;
      const updateSaleCustomerPhone = document.querySelector(
        '#updateSaleCustomerPhone'
      ).value;
      const updateSaleRemark =
        document.querySelector('#updateSaleRemark').value;

      const updateSaleDetails = {
        customerName: updateSaleCustomerName,
        customerPhone: updateSaleCustomerPhone,
        remarks: updateSaleRemark,
      };

      // console.log('Updating sale Detail with:', updateSaleDetails, saleId);

      const updateSaleModalBtn = document.querySelector('.updateSaleModalBtn');

      try {
        showBtnLoader(updateSaleModalBtn);
        const updatedSaleData = await updateSale(saleId, updateSaleDetails);

        if (!updatedSaleData) {
          console.error('fail', updatedSaleData.message);
          return;
        }

        showToast('success', `✅ ${updatedSaleData.message}`);
        closeModal();
        hideBtnLoader(updateSaleModalBtn);

        allSalesReport = []; // reset to avoid duplication
        await renderSalesTable({
          page: 1,
          limit: pageSize,
          filters: currentFilters, // reuse existing filters if available
          shopId,
          tableBodyId: `#sale-tbody-${shopId}`,
          loadMoreButton: document.getElementById(
            `loadMoreSaleButton_admin_${shopId}`
          ),
          // append: false,
        });
      } catch (err) {
        hideBtnLoader(updateSaleModalBtn);

        console.error('Error Updating Sale:', err);
        showToast('fail', `❎ ${err.message}`);
        return;
      } finally {
        closeModal();
        hideBtnLoader(updateSaleModalBtn);
        hideGlobalLoader();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindDeleteTransactionFormListener();
  bindDeleteSaleFormListener();
  bindUpdateSaleFormListener();
});

export function getAdminSalesReportHtml(shop) {
  //   console.log('Sales Report');
  return `    
    <!-- Sales HTML starts Here -->

          <div  id="shopSales-report-${shop.id}"  class=" reports " data-loaded="false" mt-4 mb-4 ">

           <div class="reports card">
         <div class="reports-method">
            <h2 class="heading-text mb-2">
               Sales Reports
            </h2>

            <h2 class="filter-heading heading-subtext mb-2">Filter Reports</h2>

            <div class="filter-section mb-2">

               <div class="pos-method-form_input">
                  <label for="salesStartDateFilter_admin_${shop.id}">Start Date:</label>

                  <input type="date" id="salesStartDateFilter_admin_${shop.id}">
               </div>

               <div class="pos-method-form_input">
                  <label for="salesEndDateFilter_admin_${shop.id}">End Date:</label>

                  <input type="date" id="salesEndDateFilter_admin_${shop.id}">
               </div>


               <div class="pos-method-form_input">

                  <label for="salesStatusFilter_admin_${shop.id}">Payment Status:</label>

                  <select id="salesStatusFilter_admin_${shop.id}" name="salesStatusFilter_admin_${shop.id}">
                     <option value="">All</option>
                     <option value="COMPLETED_FULL_PAYMENT">Completed</option>
                     <option value="PARTIAL_PAYMENT">Partial Payment</option>
                  </select>
               </div>

               <div class="pos-method-form_input">

                  <label for="salesPaymentMethod_admin_${shop.id}">Payment Method:</label>

                  <select id="salesPaymentMethod_admin_${shop.id}" name="salesPaymentMethod_admin_${shop.id}">
                     <option value="">All</option>
                     <option value="CASH">Cash</option>
                     <option value="CARD">Card</option>
                     <option value="TRANSFER">Transfer</option>
                  </select>
               </div>


               <div class="filter-buttons">
                  <button id="applySalesFiltersBtn_admin_${shop.id}" class="hero-btn-dark">Apply Filters</button>

                  <!-- <button id="generateReportBtn_admin" class="hero-btn-dark">Generate Report</button> -->

                  <button id="resetSalesFiltersBtn_${shop.id}" class="hero-btn-outline">Reset</button>
               </div>
            </div>

            <div class="table-header">
               <!-- <h2 class="heading-subtext"> SALES </h2> -->
            </div>

            <div class="reports-table-container">

               <table class="reports-table soldTableDisplay_admin">
                  <thead>
                     <tr class="table-header-row">
                        <th class="py-1">S/N</th>
                        <th class="py-1">Receipt #</th>
                        <th class="py-1">Product Name</th>
                        <th class="py-1">Staff</th>
                        <th class="py-1">Amount</th>
                        <th class="py-1">Paid</th>
                        <th class="py-1">Balance</th>
                        <th class="py-1">Payment Method</th>
                        <th class="py-1">Date</th>
                        <th class="py-1">Remarks</th>
                        <th class="py-1">Status</th>
                        <th class="py-1">▼</th>
                     </tr>
                  </thead>

                  <!-- <tbody id="sale-tbody-${shop.id}"> -->
                  <tbody id="sale-tbody-${shop.id}">
                     <tr class="table-body-row">
                     </tr>
                  </tbody>

                  <!-- <tbody>
                        <tr class="table-body-row">
                           <td class="py-1">1.</td>
                           <td class="py-1 soldItemReceiptReport">76-96-1749763485969</td>
                           <td class="py-1 soldItemCustomerNameReport">John Customer</td>
                           <td class="py-1 soldItemCustomerNameReport">Favour Amaka</td>
                           <td class="py-1 soldItemTotalAmountReport">&#x20A6;8,000</td>
                           <td class="py-1 soldItemPaidAmountReport">&#x20A6;8,000</td>
                           <td class="py-1 soldItemBalanceAmountReport">&#x20A6;0</td>
                           <td class="py-1 soldItemDateReport">2025-06-10</td>
                           <td class="py-1 soldItemStatusReport">Full Payment</td>
                           <td class="py-1 soldItemDetailReport ">[Expand]</td>
                        </tr>
                     </tbody>

                     <tbody>
                        <tr class="table-body-row">
                           <td class="py-1">1.</td>
                           <td class="py-1 soldItemReceiptReport">76-96-1749763485969</td>
                           <td class="py-1 soldItemCustomerNameReport">Wilson Customer</td>
                           <td class="py-1 soldItemCustomerNameReport">Favour Amaka</td>
                           <td class="py-1 soldItemTotalAmountReport">&#x20A6;12,000</td>
                           <td class="py-1 soldItemPaidAmountReport">&#x20A6;10,000</td>
                           <td class="py-1 soldItemBalanceAmountReport">&#x20A6;2,000</td>
                           <td class="py-1 soldItemDateReport">2025-06-10</td>
                           <td class="py-1 soldItemStatusReport">Partial Payment</td>
                           <td class="py-1 soldItemDetailReport ">[Expand]</td>
                        </tr>
                     </tbody>  -->

                  <tfoot>
                     <tr class="table-foot-row px-2">
                        <td colspan="4"></td>
                        <td id="totalSalesXXXPosAmount_admin" class="py-1 px-2">
                           <strong></strong>
                        </td>

                        <td id="totalSalesXXXPosFee_admin" class="py-1 px-2">
                           <strong></strong>
                        </td>

                        <td id="totalSalesXXXMachineFee_admin" class="py-1 px-2">
                           <strong></strong>
                        </td>

                        <td id="totalSalesXXXDepositAmount_admin" class="py-1 px-2">
                           <strong></strong>
                        </td>

                        <td id="totalSalesXXXWithdrawalAmount_admin" class="py-1 px-2">
                           <strong></strong>
                        </td>

                        <td id="totalSalesXXXWithdrawalTransferAmount_admin" class="py-1 px-2">
                           <strong></strong>
                        </td>

                        <td id="totalSalesXXXBillPaymentAmount_admin" class="py-1 px-2">
                           <strong></strong>
                        </td>
                        <!-- <td></td> -->
                     </tr>
                  </tfoot>
               </table>

               <div id="loadMoreSalesButtonDiv_admin" class=" center-button mt-2">

                  <button id="loadMoreSaleButton_admin_${shop.id}" class=" hero-btn-dark load-more-button">Load More
                     Sales</button>
                  <!-- <button id="loadMoreButton" class="">Load More</button> -->
               </div>
            </div>
            </div>

            <div class="profit-summary mt-4 mb-1">
            <h1 class="headin-text mb-2" >Profit Overview:</h1>
  <h2>Total Cost: <span id="totalCost"></span></h2>
  <h2>Total Sold: <span id="totalSold"></span></h2>
  <h2>Total Profit: <span id="totalProfit"></span></h2>
</div>

            </div>

<div class="reports card">
            <div class="report-tabs mt-4 mb-4">

               <h2 class="heading-text mb-2">
                  Performance Overview
               </h2>

               <div class="tab-buttons">
                  <button class="tab-btn tab-btn_${shop.id} active" data-tab="daily_${shop.id}">Daily Summary</button>
                  <button class="tab-btn tab-btn_${shop.id}" data-tab="monthly_${shop.id}">Monthly Summary</button>
                  <button class="tab-btn tab-btn_${shop.id} " data-tab="product_${shop.id}">Sales by Product</button>
               </div>

               <!-- Daily Summary Start -->
               <div class="tab-content tab-content_${shop.id} active" id="daily_${shop.id}">
               
               <h2 class="filter-heading heading-subtext mb-2">Filter Transactions</h2>

               <div class="filter-section mb-2">

                  <div class="pos-method-form_input">
                     <label for="dailySummaryDateFilter_admin_${shop.id}">Start Date:</label>

                     <input type="date" id="dailySummaryDateFilter_admin_${shop.id}">
                  </div>


                  <div class="filter-buttons">
                     <button id="applyDailySummaryDateFiltersBtn_admin_${shop.id}" class="hero-btn-dark">Apply Filters</button>

                     <button id="resetFiltersBtn_admin_${shop.id}" class="hero-btn-outline">Reset</button>
                  </div>
                  
               </div>

                            <div class="productSales-summary mb-1">
                     <!-- Total Sales -->
                     <div class="summary-card">
                        <h3>Total Sales</h3>
                        <p class="amount" id="totalDailySales_${shop.id}">₦0</p>
                     </div>

                     <!-- Total Amount -->
                     <div class="summary-card">
                        <h3>Total Amount</h3>
                        <p class="amount" id="totalDailyAmount_${shop.id}">₦0</p>
                     </div>

                     <!-- Total Paid -->
                     <div class="summary-card">
                        <h3>Total Paid</h3>
                        <p class="amount" id="totalDailyPaid_${shop.id}">₦0</p>
                     </div>

                     <!-- Total Balance -->
                     <div class="summary-card">
                        <h3>Total Balance</h3>
                        <p class="amount" id="totalDailyBalance_${shop.id}">₦0</p>
                     </div>
                  </div>


                  <div id="dailyChart_${shop.id}"></div>

                  <div class="chart-center">
                     <div id="paymentMethodChart_${shop.id}"></div>
                  </div>

               </div>

                <!-- Daily Summary End -->

                 <!-- Monthly Summary Start -->

               <div class="tab-content tab-content_${shop.id}" id="monthly_${shop.id}">

                           <h2 class="filter-heading heading-subtext mb-2">Filter Transactions</h2>

               <div class="filter-section mb-2">

                  <div class="pos-method-form_input">
                     <select id="monthSelect_admin_${shop.id}">
                          <option value="">Select Month</option>
                     </select>
                  </div>

                  <div class="pos-method-form_input">
                     <select id="yearSelect_admin_${shop.id}">
                          <option value="">Select Year</option>
                     </select>
                  </div>


                  <div class="filter-buttons">
                     <button id="applyMonthlySummaryDateFiltersBtn_admin_${shop.id}" class="hero-btn-dark">Apply Filters</button>

                     <button id="resetFiltersBtn_admin_${shop.id}" class="hero-btn-outline">Reset</button>
                  </div>
                  
               </div>

                            <div class="productSales-summary mb-1">
                     <!-- Total Sales -->
                     <div class="summary-card">
                        <h3>Total Sales</h3>
                        <p class="amount" id="totalMonthlySales_${shop.id}">₦0</p>
                     </div>

                     <!-- Total Amount -->
                     <div class="summary-card">
                        <h3>Total Amount</h3>
                        <p class="amount" id="totalMonthlyAmount_${shop.id}">₦0</p>
                     </div>

                     <!-- Total Paid -->
                     <div class="summary-card">
                        <h3>Total Paid</h3>
                        <p class="amount" id="totalMonthlyPaid_${shop.id}">₦0</p>
                     </div>

                     <!-- Total Balance -->
                     <div class="summary-card">
                        <h3>Total Balance</h3>
                        <p class="amount" id="totalMonthlyBalance_${shop.id}">₦0</p>
                     </div>
                  </div>

                  <div id="monthlyChart_${shop.id}"></div>

                           <div class="chart-center">
                     <div id="monthlyPaymentMethodChart_${shop.id}"></div>
                  </div>
               </div>

                  <!-- Monthly Summary end -->

               <!-- <div class="tab-content tab-content_${shop.id}" id="monthly_${shop.id}" style="overflow-x: auto;">
                     <canvas id="monthlyChart" style="min-width: 800px; height: max-content;"></canvas>
                  </div> -->

               <div class="tab-content tab-content_${shop.id} " id="product_${shop.id}">

               

            <div class="adminSellProductSearch-section mb-2">

               <div class="adminSellProduct-method-form_input ">
                  <div class="search-input-container">
                     <input type="search" id="adminSearchSellProdutItem_${shop.id}" class="adminSearchSellProdutItem"
                        placeholder="Search Product Name or Description ">
                     <span class="searchIcon"><i class="fa-solid fa-magnifying-glass mr-2"></i></span>
                  </div>
               </div>
            </div>

            <!-- Category -->
            <div class="adminSellProductCategory-section adminSellProductCategory-section_${shop.id} mb-1">
               <!-- <button class="adminSellProductCategoryBtn active" type="button">
                  All
               </button> -->

            </div>

            <div class="adminSellProduct-method-form_input mb-2">

               <div class="input-container adminSellProductName">
                  <input type="text" id="adminProductInput_${shop.id}" disabled required>
                  <i class="fa fa-times clear-icon" id="adminClearIcon" aria-hidden="true"></i>
               </div>

               <ul class="adminAutocomplete-list" id="adminAutocompleteList"></ul>
            </div>

             

                  <div class="productSales-summary mb-1">
                     <!-- Total Quantity -->
                     <div class="summary-card">
                        <h3>Total Quantity</h3>
                        <p class="amount" id="totalQty_${shop.id}">₦0</p>
                     </div>

                     <!-- Total Revenue -->
                     <div class="summary-card">
                        <h3>Total Revenue</h3>
                        <p class="amount" id="totalRev_${shop.id}">₦0</p>
                     </div>

                     <!-- Total Cost -->
                     <div class="summary-card">
                        <h3>Total Cost</h3>
                        <p class="amount" id="totalCost_${shop.id}">₦0</p>
                     </div>

                     <!-- Total Profit -->
                     <div class="summary-card">
                        <h3>Total Profit</h3>
                        <p class="amount" id="totalProfit_${shop.id}">₦0</p>
                     </div>
                  </div>

                  <div class="reports-table-container">

                     <table id="productSalesTable_${shop.id}" class="reports-table">
                        <thead>
                           <tr class="table-header-row">
                              <th class="py-1">S/N</th>
                              <th class="py-1">Date</th>
                              <th class="py-1">Shop</th>
                              <th class="py-1">Staff</th>
                              <th class="py-1">Customer</th>
                              <th class="py-1">Qty</th>
                              <th class="py-1">Unit Price</th>
                              <th class="py-1">Selling Price</th>
                              <th class="py-1">Total Amount</th>
                              <th class="py-1">Amount Paid</th>
                              <th class="py-1">Balance</th>
                           </tr>
                        </thead>
                        <tbody>
                          <td colspan="11" class="table-body-row center-text py-1">Select a Product to get Stats.</td></tbody>
                     </table>
                  </div>

               </div>
            </div>
            </div>


<div class="reports card">
            <div class="report-tabs mt-4 mb-4">

               <h2 class="heading-text mb-2">
                  Staff Overview
               </h2>


               <!-- Check Staff Performance -->
               <div class="pos-method-form_input">
                  <label for="reportStaffDropdown_admin_${shop.id}">Select Staff</label>

                  <select id="reportStaffDropdown_admin_${shop.id}" class="form-control" required>
                     <option value="">Select a Staff</option>
                     <!-- <option value="1">Loading Staffs...</option> -->

                     <!-- Add  Staffs dynamically -->
                  </select>
               </div>

               <!-- Check Duration Performance -->
               <div class="pos-method-form_input">
                  <label for="reportStaffTimeframeDropdown_admin_${shop.id}">Select Timeframe</label>

                  <select id="reportStaffTimeframeDropdown_admin_${shop.id}" class="form-control" required>
                     <option value="none">Select Timeframe</option>
                     <option value="daily">Daily</option>
                     <option value="weekly">Weekly</option>
                     <option value="monthly">Monthly</option>
                     <option value="custom">Custom</option>

                  </select>
               </div>

               <div class="timeframe-inputs" id="timeframeInputs_admin_${shop.id}">
  <!-- Daily -->
  <div class="timeframe-group daily-input hidden mt-2">
    <label>Select Date</label>
    <input type="date" class="form-control" id="dailyInput"/>
  </div>

  <!-- Weekly -->
  <div class="timeframe-group weekly-input hidden mt-2">
    <label>Select Week</label>
  <input type="week" class="form-control" id="weeklyInput" />
</div>

  <!-- Monthly -->
  <div class="timeframe-group monthly-input hidden mt-2">
    <label>Select Month/Year</label>
    <input type="month" class="form-control" id="monthlyInput"/>
  </div>

  <!-- Custom -->
  <div class="timeframe-group custom-input hidden mt-2">
    <label>Start Date</label>
    <input type="date" class="form-control" id="customStartInput" />

    <label>End Date</label>
    <input type="date" class="form-control" id="customEndInput"/>
  </div>
</div>

<div style="">
   <div class="timeframe-actions mt-2">
      <button id="applyFilterBtn_admin_${shop.id}" class="apply-filter hidden hero-btn-dark">Apply Filter</button>

      <button id="resetFilterBtn_admin_${shop.id}" class="reset-filter hidden hero-btn-outline" >Reset Filter</button>
   </div>

</div>

               <div class="sales-summary">
                  <div class="summary-card">
                     <h3>Total Sales</h3>
                     <p class="amount" id="staffTotal-sales_admin_${shop.id}">₦0</p>
                  </div>
                  <div class="summary-card">
                     <h3>Total Amount</h3>
                     <p class="amount" id="staffTotal-amount_admin_${shop.id}">₦0</p>
                  </div>
                  <div class="summary-card">
                     <h3>Total Paid</h3>
                     <p class="amount" id="staffTotal-paid_admin_${shop.id}">₦0</p>
                  </div>
                  <div class="summary-card">
                     <h3>Balance</h3>
                     <p class="amount" id="staffTotal-balance_admin_${shop.id}">₦0</p>
                  </div>
                  <div class="summary-card">
                     <h3>Total Cost</h3>
                     <p class="amount" id="staffTotal-cost_admin_${shop.id}">₦0</p>
                  </div>
                  <div class="summary-card">
                     <h3>Total Profit</h3>
                     <p class="amount" id="staffTotal-profit_admin_${shop.id}">₦0</p>
                  </div>
               </div>

                   <div class="reports-table-container">

                     <table id="staffSalesTable_admin_${shop.id}" class="reports-table">
                        <thead>
                           <tr class="table-header-row">
                              <th class="py-1">S/N</th>
                              <th class="py-1">Date</th>
                              <th class="py-1">Shop</th>
                              <th class="py-1">Product Name</th>
                              <th class="py-1">Unit Price</th>
                              <th class="py-1">Amount Paid</th>
                              <th class="py-1">Total Amount</th>
                              <th class="py-1">Balance</th>
                              <th class="py-1">Status</th>
                                  <th class="py-1">▼</th>
                           </tr>
                        </thead>
                        <tbody>
                          <td colspan="11" class="table-body-row center-text py-1">Select a Staff to get Stats.</td></tbody>
                     </table>
                  </div>

            </div>
         </div>
      </div>
            </div>

    
    `;
}

export function getAdminPosReportHtml(shop) {
  //   console.log('POS Report');
  return `
      <!-- POS HTML starts Here -->
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
                                    <th class="py-1">Customer Phone No.</th>
                                    <th class="py-1">Amount</th>
                                    <th class="py-1">Charges</th>
                                    <th class="py-1">Machine Fee</th>
                                    <th class="py-1">Charge Payment Method</th>
                                    <th class="py-1">Payment Method</th>
                                    <th class="py-1">Transaction Ref.</th>
                                    <th class="py-1">Remarks</th>
                                    <th class="py-1">Receipt ID</th>
                                    <th class="py-1">Actions</th>
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
    </div>
    </div>

      <!-- POS HTML Ends Here -->
   `;
}

export function getAdminAnalyticsHtml(shop) {
  //   console.log('Analytics Report');
  return `
     
         <!-- Analytics Table HTML starts Here -->
         <div id="shop-report-${shop.id}" class="reports card" data-loaded="false">

            <div class="reports">
               <div class="reports-method">
                  <h2 class="heading-text mb-2">
                     POS Transaction Analytics
                  </h2>

                  <h2 class="filter-heading heading-subtext mb-2">Filter POS Analytics</h2>

                  <div class="filter-section mb-2">

                     <div class="pos-method-form_input">
                        <label for="dateFrom_admin_${shop.id}">Start Date:</label>

                        <input type="date" id="dateFrom_admin_${shop.id}">
                     </div>

                     <div class="pos-method-form_input">
                        <label for="dateTo_admin_${shop.id}">End Date:</label>

                        <input type="date" id="dateTo_admin_${shop.id}">
                     </div>

                     <div class="pos-method-form_input ">

                        <label for="groupBy_admin_${shop.id}">Group By</label>

                        <select id="groupBy_admin_${shop.id}" name="groupBy_admin_${shop.id}">
                           <!-- <option value="">All</option> -->
                           <option value="day">Day</option>
                           <option value="hour">Hour</option>
                           <option value="week">Week</option>
                           <option value="month">Month</option>
                        </select>
                     </div>

                     <div class="pos-method-form_input ">

                        <label for="transactionType_admin_${shop.id}">Status:</label>

                        <select id="transactionType_admin_${shop.id}" name="transactionType_admin_${shop.id}">
                           <option value="">All</option>
                           <option value="DEPOSIT">Deposit</option>
                           <option value="WITHDRAWAL">Withdrawal</option>
                           <option value="WITHDRAWAL_TRANSFER">Withdrawal/Transfer</option>
                           <option value="BILL_PAYMENT">Bill Payment</option>
                        </select>
                     </div>


                     <div class="filter-buttons">
                        <button id="applyAnalyticsFiltersBtn_admin_${shop.id}" class="hero-btn-dark">Apply
                           Filters</button>
                        <button id="resetAnalyticsFiltersBtn_${shop.id}" class="hero-btn-outline">Reset</button>
                     </div>

                  </div>

                  <!-- <div id="transactionList" class="transaction-list mb-3"></div> -->

                  <div class="table-header">
                     <!-- <h2 class="heading-subtext"> POS </h2> -->
                  </div>

                  <div class="reports-table-container">

                     <table class="reports-table analyticsTable_admin_${shop.id}">
                        <thead>
                           <tr class="table-header-row">
                              <th class="py-1">Period</th>
                              <th class="py-1">Transaction Type</th>
                              <th class="py-1">Payment Method</th>
                              <th class="py-1">Count</th>
                              <th class="py-1">Total Amount</th>
                              <th class="py-1">Average</th>
                              <th class="py-1">Min Amount</th>
                              <th class="py-1">Max Amount</th>
                           </tr>
                        </thead>

                        <tbody id="analyticsTableBody-${shop.id}">

                        </tbody>

                     </table>

                  </div>

               </div>
            </div>
         </div>

         <!-- Analytics Table HTML Ends Here -->
   `;
}

export function getAdminFinancialSummaryHtml(shop) {
  //   console.log('Financial Summary Report');
  return `
     
         <!-- Financial Summary  Table HTML starts Here -->
         <div id="shop-report-${shop.id}" class="reports card" data-loaded="false">

            <div class="reports">
               <div class="reports-method">
                  <h2 class="heading-text mb-2">
                    Financial Summary 
                  </h2>

                  <h2 class="filter-heading heading-subtext mb-2">Filter  Financial Summary </h2>

                  <div class="filter-section mb-2">

                     <div class="pos-method-form_input">
                        <label for="financialSummaryDateFrom_admin_${shop.id}">Start Date:</label>

                        <input type="date" id="financialSummaryDateFrom_admin_${shop.id}">
                     </div>

                     <div class="pos-method-form_input">
                        <label for="financialSummaryDateTo_admin_${shop.id}">End Date:</label>

                        <input type="date" id="financialSummaryDateTo_admin_${shop.id}">
                     </div>

                     <div class="filter-buttons">
                        <button id="applyFinancialSummaryFiltersBtn_admin_${shop.id}" class="hero-btn-dark">Apply
                           Filters</button>
                        <button id="resetFinancialSummaryFiltersBtn_${shop.id}" class="hero-btn-outline">Reset</button>
                     </div>

                  </div>

                  <h2 class="heading-subtext">Period: <span id="financialSummaryPeriod"></span></h2> 

                     <div class="transaction-breakdown">
               <h3 class="heading-minitext mt-4 mb-2">Shop Financial Summary</h3>
               
               
            <div class="financial-summary">

                 <div class="summary-card">
                  <h3>Total Capital Deposits</h3>
                  <p class="value" id="totalFinCapitalDeposits">--</p>
               </div>

               <div class="summary-card">
                  <h3>Total Deposits</h3>
                  <p class="value" id="totalFinDeposits">--</p>
               </div>

               <div class="summary-card">
                  <h3>Total Withdrawals</h3>
                  <p class="value" id="totalWithdrawals">--</p>
               </div>

               <div class="summary-card">
                  <h3>Total W/Transafer</h3>
                  <p class="value" id="totalWithdrawalTransfer">--</p>
               </div>

               <div class="summary-card">
                  <h3>Total Bill Payment</h3>
                  <p class="value" id="totalBillPayment">--</p>
               </div>

               <div class="summary-card">
                  <h3>Total Transactions</h3>
                  <p class="value" id="totalTransactions">--</p>
               </div>
            </div>

               <div class="reports-table-container mt-4">
                     <table class="reports-table financialSummary_admin_${shop.id}">
                        <thead>
                           <tr class="table-header-row">
                             <th class="py-1">Type</th>
                           <th class="py-1">Count</th>
                           <th class="py-1">Amount (₦)</th>
                           </tr>
                        </thead>

                        <tbody id="financialSummaryBody-${shop.id}">

                        </tbody>

                     </table>
               </div>

               <h2 class="heading-subtext admin-withdrawals-note">
                  Admin Withdrawals: <span class="pending">Pending feature</span>
               </h2>
            </div>

                       </div>
            </div>
         </div>

         <!-- Analytics Table HTML Ends Here -->
   `;
}

export function getAdminPosTransactionList(
  transactionId,
  transaction_type,
  amount,
  transaction_mode,
  customer_name,
  customer_phone,
  payment_method,
  status,
  receipt_id,
  remarks,
  business_day,
  transaction_time,
  machineFee,
  //   transactionCharges,
  //   manual_charges,
  chargeToDisplay,
  transaction_fee,
  transaction_ref,
  deleted_at,
  deleted_by,
  shop_id,
  serialNumber
) {
  return `
    <td class="py-1">${serialNumber++}.</td>
               <td class="py-1">${business_day}</td>
               <td class="py-1 posTransTypeReport">${formatTransactionType(
                 transaction_type
               )}</td>
               <td class="py-1 posCustomerInfo">${`${
                 customer_phone === '' ? '-' : customer_phone
               }`}</td>
               <td class="py-1 posAmountReport">&#x20A6;${formatAmountWithCommas(
                 amount
               )}</td>
               <td class="py-1 posChargesReport">&#x20A6;${formatAmountWithCommas(
                 chargeToDisplay ? chargeToDisplay : 0
               )}</td>
               <td class="py-1 posMachineFeeReport">&#x20A6;${formatAmountWithCommas(
                 machineFee
               )}</td>
               <td class="py-1 posFeePaymentMethodReport">${
                 transaction_mode !== null
                   ? transaction_mode.toUpperCase()
                   : 'N/A'
               }</td>
               <td class="py-1 posPaymentMethodReport">${payment_method}</td>
               <td class="py-1 posPaymentMethodRef">${transaction_ref}</td> 
               <td class="py-1 posPaymentMethodRemark">${remarks}</td>
               <td class="py-1 posPaymentMethodReceiptId">${receipt_id}</td>
               <td class="py-1 action-buttons" style="margin-top:1.1rem">
                 ${
                   deleted_at || deleted_by
                     ? `  <h2 class="heading-minitext">
               ADMIN <br />
               ${formatDateTimeReadable(deleted_at)}</h2>
            </h2>`
                     : `                    
                         <button
                           class="hero-btn-outline deleteTransactionBtn"
                           id="deleteTransactionModalBtn" data-transaction-id="${transactionId}"
                         >
                           <i class="fa-solid fa-trash-can"></i>
                         </button>`
                 }
                       </td>
               
              `;
}

export function getAdminPosAnalyticsList(
  period,
  transaction_type,
  payment_method,
  count,
  total_amount,
  average_amount,
  min_amount,
  max_amount
) {
  return `
      <td class="py-1">${period}</td>
      <td class="py-1">${transaction_type}</td>
      <td class="py-1">${payment_method}</td>
      <td class="py-1">${count}</td>
      <td class="py-1">₦${formatAmountWithCommas(total_amount)}</td>
      <td class="py-1">₦${formatAmountWithCommas(
        average_amount.toFixed(2)
      )}</td>
      <td class="py-1">₦${formatAmountWithCommas(min_amount)}</td>
      <td class="py-1">₦${formatAmountWithCommas(max_amount)}</td>
               
   `;
}

export function getAdminSalesTransactionList(
  serialNumber,
  id,
  receipt_number,
  amount_paid,
  total_amount,
  balance,
  customer_name,
  customer_phone,
  payment_method,
  business_day,
  remarks,
  status,
  first_name,
  last_name,
  truncatedProductNames,
  shop_id
) {
  return `
    <td class="py-1">${serialNumber++}.</td>
                  <td class="py-1 soldItemReceiptReport">${receipt_number}</td>
                  <td class="py-1 soldItemNameReport">${truncatedProductNames}</td>
                   <td class="py-1 soldItemStaffNameReport">${first_name} ${last_name}</td>
                    <td class="py-1 soldItemTotalAmountReport">&#x20A6;${formatAmountWithCommas(
                      total_amount
                    )}</td>
                    <td class="py-1 soldItemPaidAmountReport">&#x20A6;${formatAmountWithCommas(
                      amount_paid
                    )}</td>
                     <td class="py-1 soldItemBalanceAmountReport">&#x20A6;${formatAmountWithCommas(
                       balance
                     )}</td>
                     <td class="py-1 soldItemDateReport">${payment_method}</td>
                     <td class="py-1 soldItemDateReport">${business_day}</td>
                     <td class="py-1 soldItemDateReport">${remarks}</td>
                      <td class="py-1 soldItemStatusReport">${formatSaleStatus(
                        status
                      )}</td>
                      <td class="py-1 action-buttons">
                      <button class="hero-btn-outline class=" soldItemDetailReport" data-sale-id="${id}" data-shop-id="${shop_id}"><i class="fa fa-eye"></i></button>
          <button class="hero-btn-outline editSaleButton" id="editSaleButton" data-sale-id="${id}" data-shop-id="${shop_id}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>

          <button class="hero-btn-outline deleteSaleModalBtn" id="deleteSaleModalBtn" data-sale-id="${id}" data-shop-id="${shop_id}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
                       
   `;
}

let allPosTransactions = [];
let allSalesReport = [];

// Pagination control for load more
let currentPage;
let shopPageTracker = {};
// let shopPageTracker = {};
let totalItems;
let totalPages;
let pageSize = 10;
let limit = pageSize;
let currentFilters = {};

export async function renderPosTable({
  page = 1,
  limit = pageSize,
  filters,
  shopId,
  tableBodyId,
  loadMoreButton,
  append = false,
}) {
  if (
    servicePermission === 'POS_TRANSACTIONS' ||
    servicePermission === 'BOTH'
  ) {
    const posTableBody = document.querySelector(tableBodyId);

    if (!posTableBody) {
      console.error('Error: Table body not found');
      return;
    }

    try {
      let loadingRow = document.querySelector('.loading-row');
      // console.log('loading', loadingRow);
      if (!loadingRow) {
        loadingRow = document.createElement('tr');
        loadingRow.className = 'loading-row';
        loadingRow.innerHTML = `<td colspan="12" class="table-loading-text">Loading transactions...</td>`;
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
          '<tr class="loading-row"><td colspan="12" class="table-error-text ">No Transactions Available.</td></tr>';
        return;
      }

      posTransactions.forEach((transaction) => {
        if (!allPosTransactions.some((t) => t.id === transaction.id)) {
          allPosTransactions.push(transaction);
        }
      });

      // Clear the table body and render all accumulated transactions
      if (!append) {
        posTableBody.innerHTML = '';
      }
      posTableBody.innerHTML = '';

      // allPosTransactions.push(...posTransactions);

      const groupedByDate = {};

      allPosTransactions.forEach((tx) => {
        const dateObj = new Date(tx.business_day);
        const dateKey = dateObj.toLocaleDateString('en-UK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }); // "May 11, 2025"

        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(tx);
      });

      //  console.log(groupedByDate);

      Object.entries(groupedByDate).forEach(([date, transactions]) => {
        let serialNumber = 1;
        // Insert group row (header for the date)
        const groupRow = document.createElement('tr');
        groupRow.className = 'date-group-row table-body-row ';

        groupRow.innerHTML = `
    <td colspan="13" class="date-header py-1 mt-1 mb-1">
      <strong>${date}</strong>     </td>

   `;
        posTableBody.appendChild(groupRow);

        //       groupRow.innerHTML = `
        //     <td colspan="11" class="date-header py-1 mt-1 mb-1">
        //       <strong>${date}</strong> — Total: ₦${formatAmountWithCommas(dailyTotal)}
        //     </td>
        //   `;

        transactions.forEach((posTransaction) => {
          //  console.log(posTransaction);
          const {
            id: transactionId,
            transaction_type,
            amount,
            transaction_mode,
            customer_name,
            customer_phone,
            payment_method,
            status,
            receipt_id,
            remarks,
            business_day,
            transaction_time,
            charges,
            manual_charges,
            fees,
            transaction_fee,
            transaction_ref,
            deleted_at,
            deleted_by,
            shop_id,
          } = posTransaction;

          const machineFee = fees || 0;
          //  const transactionCharges = charges?.charge_amount || '0';

          const chargeToDisplay = manual_charges ?? charges;

          const row = document.createElement('tr');
          row.classList.add(
            `${
              deleted_at || deleted_by
                ? 'deletedTransationRow'
                : 'posTransactionRow'
            }`
          );
          row.classList.add('table-body-row');
          row.innerHTML = getAdminPosTransactionList(
            transactionId,
            transaction_type,
            amount,
            transaction_mode,
            customer_name,
            customer_phone,
            payment_method,
            status,
            receipt_id,
            remarks,
            business_day,
            transaction_time,
            machineFee,
            // transactionCharges,
            // manual_charges,
            chargeToDisplay,
            transaction_fee,
            transaction_ref,
            deleted_at,
            deleted_by,
            shop_id,
            serialNumber++
          );

          posTableBody.appendChild(row);

          //  Handle Delete POS Transaction Logic
          const deleteTransactionModalBtn = row.querySelector(
            `#deleteTransactionModalBtn`
          );

          deleteTransactionModalBtn?.addEventListener('click', async () => {
            showGlobalLoader();
            const transactionId =
              deleteTransactionModalBtn.dataset.transactionId;

            const deleteTransactionContainer = document.querySelector(
              '.deleteTransactionContainer'
            );

            if (deleteTransactionContainer) {
              // Store transactionId in modal container for reference
              deleteTransactionContainer.dataset.transactionId = transactionId;

              // Fetch Shop detail
              const transactionDetail = await getPosTransactionsById(
                transactionId
              );

              console.log('transactionDetail', transactionDetail.data);

              // Call function to prefill modal inputs
              if (transactionDetail?.data) {
                hideGlobalLoader();
                openDeleteTransactionModal();
                deleteTransactionForm(transactionDetail.data, shop_id);
              } else {
                hideGlobalLoader();
                showToast('fail', '❌ Failed to fetch Transaction details.');
              }
            }
          });
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
        '<tr><td colspan="12" class="table-error-text">Error loading transactions.</td></tr>';
    }
  }
}

export async function renderPosAnalyticsTable({
  filters,
  shopId,
  tableBodyId,
  append = false,
}) {
  if (
    servicePermission === 'POS_TRANSACTIONS' ||
    servicePermission === 'BOTH'
  ) {
    const posAnalyticsTableBody = document.querySelector(tableBodyId);

    if (!posAnalyticsTableBody) {
      console.error('Error: POS Analytics Table body not found');
      return;
    }

    try {
      let loadingRow = document.querySelector('.loading-row');
      // console.log('loading', loadingRow);
      if (!loadingRow) {
        loadingRow = document.createElement('tr');
        loadingRow.className = 'loading-row';
        loadingRow.innerHTML = `<td colspan="12" class="table-loading-text">Loading POS Analytics Data...</td>`;
        posAnalyticsTableBody.appendChild(loadingRow);
      }

      // Build query with filters
      const queryParams = new URLSearchParams({
        shopId: shopId,
      });

      // console.log('queryParams', queryParams);

      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.group_by) queryParams.append('group_by', filters.group_by);
      if (filters.transaction_type)
        queryParams.append('transaction_type', filters.transaction_type);

      const result = await getPosAnalytics({
        shopId,
        filters,
      });

      // console.log(result);

      if (!result) throw new Error(result.message || 'Failed to fetch');

      const posAnalytics = result.data.analytics;

      if (posAnalytics.length === 0 && currentPage === 1) {
        posAnalyticsTableBody.innerHTML =
          '<tr class="loading-row"><td colspan="12" class="table-error-text ">No POS Analytics Data Available.</td></tr>';
        return;
      }

      // Clear the table body and render all accumulated transactions
      if (!append) {
        posAnalyticsTableBody.innerHTML = '';
      }
      posAnalyticsTableBody.innerHTML = '';

      // console.log('posAnalytics', posAnalytics);

      posAnalytics.forEach((posTransaction) => {
        //  console.log(posTransaction);
        const {
          period,
          transaction_type,
          payment_method,
          count,
          total_amount,
          average_amount,
          min_amount,
          max_amount,
        } = posTransaction;

        const row = document.createElement('tr');
        row.classList.add('table-body-row');

        row.innerHTML = getAdminPosAnalyticsList(
          period,
          transaction_type,
          payment_method,
          count,
          total_amount,
          average_amount,
          min_amount,
          max_amount
        );

        posAnalyticsTableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error rendering POS Analytics Data:', error);
      posAnalyticsTableBody.innerHTML =
        '<tr><td colspan="12" class="table-error-text">Error loading POS Analytics Data.</td></tr>';
    }
  }
}

export async function renderFinancialSummaryTable({
  filters,
  shopId,
  tableBodyId,
  append = false,
}) {
  if (
    servicePermission === 'POS_TRANSACTIONS' ||
    servicePermission === 'BOTH'
  ) {
    const financialSummaryTableBody = document.querySelector(tableBodyId);

    if (!financialSummaryTableBody) {
      console.error('Error: Financial Summary Table body not found');
      return;
    }

    try {
      let loadingRow = document.querySelector('.loading-row');
      // console.log('loading', loadingRow);
      if (!loadingRow) {
        loadingRow = document.createElement('tr');
        loadingRow.className = 'loading-row';
        loadingRow.innerHTML = `<td colspan="12" class="table-loading-text">Loading Financial Summary Data...</td>`;
        financialSummaryTableBody.appendChild(loadingRow);
      }

      // Build query with filters
      const queryParams = new URLSearchParams({
        shopId: shopId,
      });

      // console.log('queryParams', queryParams);

      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);

      const result = await getFinancialSummary({
        shopId,
        filters,
      });

      // console.log(result);

      if (!result) throw new Error(result.message || 'Failed to fetch');

      const adminWithdrawals = result.data.admin_withdrawals;
      const period = result.data.period;
      const shop = result.data.shops;
      const transactionSummary = result.data.transaction_summary;

      const { capital_deposits } = shop[0];

      const {
        total_deposits,
        total_withdrawals,
        total_transfers,
        total_bill_payments,
        total_transactions,
      } = transactionSummary.totals;

      const { date_from, date_to } = period;

      const periodText =
        date_from && date_to
          ? `${formatDateTimeReadable(date_from)} - ${formatDateTimeReadable(
              date_to
            )}`
          : 'All Time';

      const financialSummaryPeriod = document.querySelector(
        '#financialSummaryPeriod'
      );

      if (financialSummaryPeriod)
        financialSummaryPeriod.textContent = periodText;

      // Clear the table body and render all accumulated transactions
      if (!append) {
        financialSummaryTableBody.innerHTML = '';
      }
      financialSummaryTableBody.innerHTML = '';

      const totalFinCapitalDepositsEl = document.getElementById(
        'totalFinCapitalDeposits'
      );

      if (totalFinCapitalDepositsEl)
        totalFinCapitalDepositsEl.textContent = `₦${formatAmountWithCommas(
          capital_deposits
        )}`;

      const totalFinDepositsEl = document.getElementById('totalFinDeposits');
      if (totalFinDepositsEl)
        totalFinDepositsEl.textContent = `₦${formatAmountWithCommas(
          total_deposits
        )}`;

      const totalWithdrawalsEl = document.getElementById('totalWithdrawals');
      if (totalWithdrawalsEl)
        totalWithdrawalsEl.textContent = `₦${formatAmountWithCommas(
          total_withdrawals
        )}`;

      const totalWithdrawalTransferEl = document.getElementById(
        'totalWithdrawalTransfer'
      );
      if (totalWithdrawalTransferEl)
        totalWithdrawalTransferEl.textContent = `₦${formatAmountWithCommas(
          total_transfers
        )}`;

      const totalBillPaymentEl = document.getElementById('totalBillPayment');
      if (totalBillPaymentEl)
        totalBillPaymentEl.textContent = `₦${formatAmountWithCommas(
          total_bill_payments
        )}`;

      const totalTransactionsEl = document.getElementById('totalTransactions');
      if (totalTransactionsEl)
        totalTransactionsEl.textContent =
          formatAmountWithCommas(total_transactions);

      // ===== Populate the summary table =====
      const financialSummaryBody = document.getElementById(
        `financialSummaryBody-${shopId}`
      );

      if (financialSummaryBody) financialSummaryBody.innerHTML = '';

      const summaryRows = transactionSummary.by_type;

      if (summaryRows && summaryRows.length > 0) {
        summaryRows.forEach((item) => {
          const row = document.createElement('tr');
          row.className = 'table-body-row';
          row.innerHTML = `
      <td class="py-1">${formatTransactionType(item.transaction_type)}</td>
      <td class="py-1">${item.count ?? 0}</td>
      <td class="py-1">₦${formatAmountWithCommas(item.total_amount ?? 0)}</td>
    `;
          financialSummaryBody.appendChild(row);
        });
      } else {
        // No data case
        const row = document.createElement('tr');
        row.className = 'table-body-row';
        row.innerHTML = `
    <td colspan="3" class="table-error-text">No Financial Summary Data available</td>
  `;
        financialSummaryBody.appendChild(row);
      }

      // posAnalytics.forEach((posTransaction) => {
      //   //  console.log(posTransaction);
      //   const {
      //     period,
      //     transaction_type,
      //     payment_method,
      //     count,
      //     total_amount,
      //     average_amount,
      //     min_amount,
      //     max_amount,
      //   } = posTransaction;

      //   const row = document.createElement('tr');
      //   row.classList.add('table-body-row');

      //   row.innerHTML = getAdminPosAnalyticsList(
      //     period,
      //     transaction_type,
      //     payment_method,
      //     count,
      //     total_amount,
      //     average_amount,
      //     min_amount,
      //     max_amount
      //   );

      //   financialSummaryTableBody.appendChild(row);
      // });
    } catch (error) {
      console.error('Error rendering Financial Summary Data:', error);
      financialSummaryTableBody.innerHTML =
        '<tr><td colspan="12" class="table-error-text">Error loading Financial Summary Data.</td></tr>';
    }
  }
}

export async function renderSalesTable({
  page = 1,
  limit,
  filters,
  shopId,
  tableBodyId,
  loadMoreButton,
}) {
  if (servicePermission === 'INVENTORY_SALES' || servicePermission === 'BOTH') {
    //  console.log('🧪 Applied Filters:', filters);
    const salesTableBody = document.querySelector(tableBodyId);

    if (!salesTableBody) {
      console.error('Error: Table body not found');
      return;
    }

    try {
      let loadingRow = document.querySelector('.loading-row');

      if (!loadingRow) {
        loadingRow = document.createElement('tr');
        loadingRow.className = 'loading-row';
        loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading Sales Transactions...</td>`;
        salesTableBody.appendChild(loadingRow);
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
      if (filters.paymentMethod)
        queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters.status) queryParams.append('status', filters.status);

      const result = await getAllSales({
        shopId,
        page,
        limit: pageSize,
        filters,
      });

      // console.log(result);

      if (!result) throw new Error(result.message || 'Failed to fetch');

      const salesReports = result.data.sales;
      totalPages = result.data.totalPages;
      totalItems = result.data.totalItems;
      currentPage = result.data.currentPage;

      // Only reset array if starting from page 1
      if (page === 1) {
        allSalesReport = [];
      }

      if (salesReports.length === 0 && currentPage === 1) {
        salesTableBody.innerHTML =
          '<tr class="loading-row"><td colspan="11" class="table-error-text ">No Sales Report Available.</td></tr>';
        return;
      }

      salesReports.forEach((sale) => {
        if (!allSalesReport.some((s) => s.id === sale.id)) {
          allSalesReport.push(sale);
        }
      });

      // Clear the table body and render all accumulated sales
      salesTableBody.innerHTML = '';

      const groupedByDate = {};

      // console.log(allSalesReport);

      // --- SALES ITEM FETCH & TRUNCATE: Start ---
      // Prepare an array of promises for fetching sale details for *all* sales in allSalesReport
      const salesWithDetailsPromises = allSalesReport.map(
        async (saleSummary) => {
          try {
            const saleDetailsResult = await getSaleById(saleSummary.id);
            if (saleDetailsResult && saleDetailsResult.success) {
              return {
                ...saleSummary,
                SaleItems: saleDetailsResult.data.SaleItems,
              };
            }
            return { ...saleSummary, SaleItems: [] }; // Return summary with empty SaleItems if fetch fails
          } catch (detailError) {
            console.error(
              `Error fetching details for sale ID ${saleSummary.id}:`,
              detailError
            );
            return { ...saleSummary, SaleItems: [] }; // Handle error, return empty SaleItems
          }
        }
      );

      // Wait for all sale details to be fetched in parallel
      const enrichedSalesTransactions = await Promise.all(
        salesWithDetailsPromises
      );

      // Now, iterate over the enriched data to group by date and render
      enrichedSalesTransactions.forEach((sl) => {
        const dateObj = new Date(sl.business_day);
        const dateKey = dateObj.toLocaleDateString('en-UK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(sl);
      });
      // --- SALES ITEM FETCH & TRUNCATE: End ---

      //  console.log(groupedByDate);

      // ✅ Run ONCE for all transactions before loop
      const { totalCostPrice, totalSoldPrice, totalProfit } =
        calculateProfitMetrics(enrichedSalesTransactions);

      document.getElementById(
        'totalCost'
      ).textContent = `₦${formatAmountWithCommas(totalCostPrice)}`;
      document.getElementById(
        'totalSold'
      ).textContent = `₦${formatAmountWithCommas(totalSoldPrice)}`;
      document.getElementById(
        'totalProfit'
      ).textContent = `₦${formatAmountWithCommas(totalProfit)}`;

      Object.entries(groupedByDate).forEach(([date, sales]) => {
        let serialNumber = 1;
        // Insert group row (header for the date)
        const groupRow = document.createElement('tr');
        groupRow.className = 'date-group-row table-body-row ';

        groupRow.innerHTML = `
      <td colspan="11" class="date-header py-1 mt-1 mb-1">
        <strong>${date}</strong>     </td>

     `;
        salesTableBody.appendChild(groupRow);

        //       groupRow.innerHTML = `
        //     <td colspan="11" class="date-header py-1 mt-1 mb-1">
        //       <strong>${date}</strong> — Total: ₦${formatAmountWithCommas(dailyTotal)}
        //     </td>
        //   `;

        //   console.log('sales', sales);

        sales.forEach((salesTransaction) => {
          const {
            id,
            receipt_number,
            amount_paid,
            total_amount,
            balance,
            customer_name,
            customer_phone,
            payment_method,
            business_day,
            remarks,
            status,
            SaleItems,
            shop_id,
          } = salesTransaction;

          const { first_name, last_name } = salesTransaction.Account;

          // --- Truncate Item Names ---
          const productNames = SaleItems.map(
            (item) => item.Product?.name || 'Unknown Product'
          ); // Added null check for Product.name
          const truncatedProductNames = truncateProductNames(productNames, {
            maxItems: 3,
            maxLength: 50,
            separator: ', ',
          });

          //  console.log(salesTransaction);

          //  console.log(totalCostPrice, totalSoldPrice, totalProfit);

          // const saleDetails = await getSaleById(saleId);

          const row = document.createElement('tr');
          row.classList.add('table-body-row');

          row.dataset.saleId = id; // Store sale ID for detail view
          row.innerHTML = getAdminSalesTransactionList(
            serialNumber++,
            id,
            receipt_number,
            amount_paid,
            total_amount,
            balance,
            customer_name,
            customer_phone,
            payment_method,
            business_day,
            remarks,
            status,
            first_name,
            last_name,
            truncatedProductNames,
            shop_id
          );

          row.addEventListener('click', async (e) => {
            updateSalesReceipt(e, row);
            // console.log('Row Clicked');
          });

          salesTableBody.appendChild(row);

          //  Handle Delete Sale Transaction Logic
          const deleteSaleModalBtn = row.querySelector(`#deleteSaleModalBtn`);

          deleteSaleModalBtn?.addEventListener('click', async (e) => {
            e.stopPropagation();
            showGlobalLoader();
            const saleId = deleteSaleModalBtn.dataset.saleId;
            const shopId = deleteSaleModalBtn.dataset.shopId;

            // console.log('saleId', saleId);
            // console.log('shopId', shopId);

            const deleteSaleContainer = document.querySelector(
              '.deleteSaleContainer'
            );

            if (deleteSaleContainer) {
              // Store saleId in modal container for reference
              deleteSaleContainer.dataset.saleId = saleId;

              // Fetch Shop detail
              const transactionDetail = await getSaleById(saleId);

              //   console.log('transactionDetail', transactionDetail.data);

              // Call function to prefill modal inputs
              if (transactionDetail?.data) {
                hideGlobalLoader();
                openDeleteSaleModal();
                deleteSaleForm(saleId, shopId);
              } else {
                hideGlobalLoader();
                showToast('fail', '❌ Failed to fetch Transaction details.');
              }
            }
          });

          // Handle Update Sale Logic

          const updateSaleBtn = row.querySelector('#editSaleButton');

          updateSaleBtn?.addEventListener('click', async (e) => {
            e.stopPropagation();
            // console.log('Edit Button  Clicked');
            showGlobalLoader();
            const saleId = updateSaleBtn.dataset.saleId;

            const updateSaleModalContainer =
              document.querySelector('.updateSaleModal');

            if (updateSaleModalContainer) {
              // Store saleId in modal container for reference
              updateSaleModalContainer.dataset.saleId = saleId;

              //   console.log(updateSaleModalContainer.dataset.saleId);
              // Fetch staff detail
              const saleDetail = await getSaleById(saleId);

              //   console.log('Sale detail received successfully:', saleDetail);

              // Call function to prefill modal inputs
              if (saleDetail?.success === true) {
                hideGlobalLoader();
                openUpdateSaleButton(); // Show modal after data is ready

                updateSaleForm(saleDetail);
              } else {
                hideGlobalLoader();
                showToast('fail', '❌ Failed to fetch Sale details.');
              }
            }
          });
        });

        // Insert total row (Footer for Daily Totals))
        const totalSalesRow = document.createElement('tr');
        totalSalesRow.className = 'totalSales-row table-body-row ';

        // const dailyTotal = transactions.reduce(
        //   (sum, t) => sum + Number(t.amount),
        //   0
        // );

        // Update total amounts for each day startinf wth partial totals and ending the day with final Total.
        updateTotalSalesAmounts(sales, totalSalesRow, date);

        salesTableBody.appendChild(totalSalesRow);
      });

      // Handle Load More button visibility
      if (currentPage >= totalPages) {
        loadMoreButton.style.display = 'none';
      } else {
        loadMoreButton.style.display = 'block';
      }
    } catch (error) {
      console.error('Error rendering transactions:', error);
      salesTableBody.innerHTML =
        '<tr><td colspan="6" class="table-error-text">Error loading transactions.</td></tr>';
    }
  }
}

function calculateProfitMetrics(transactions) {
  let totalCostPrice = 0;
  let totalSoldPrice = 0;

  transactions.forEach((transaction) => {
    if (Array.isArray(transaction.SaleItems)) {
      transaction.SaleItems.forEach((item) => {
        const unitCost = Number(item.unit_price) || 0;
        const sellingPrice = Number(item.selling_price) || 0;
        const quantity = Number(item.quantity) || 0;

        totalCostPrice += unitCost * quantity;
        totalSoldPrice += sellingPrice * quantity;
      });
    }
  });

  const totalProfit = totalSoldPrice - totalCostPrice;

  //   console.log(
  //     '🧾 Total Cost Price: ₦' + formatAmountWithCommas(totalCostPrice)
  //   );
  //   console.log(
  //     '💰 Total Sold Price: ₦' + formatAmountWithCommas(totalSoldPrice)
  //   );
  //   console.log('📈 Total Profit: ₦' + formatAmountWithCommas(totalProfit));

  // Optionally return the values
  return {
    totalCostPrice,
    totalSoldPrice,
    totalProfit,
  };
}

export async function renderDailySummary(shopId, dailySummaryDate) {
  if (servicePermission === 'INVENTORY_SALES' || servicePermission === 'BOTH') {
    //  console.log(dailySummaryDate);
    const response = await getDailySalesSummary(shopId, dailySummaryDate);

    if (!response?.data?.hourlyData) {
      console.warn('No hourly data available');
      return;
    }

    const hourlyData = response.data.hourlyData;
    const paymentMethods = response.data.paymentMethods;
    const dailySalesData = response.data;

    //  console.log(paymentMethods);

    const methodLabels = Object.keys(paymentMethods);
    const methodValues = Object.values(paymentMethods);

    const options = {
      chart: {
        type: 'area',
        stacked: false,
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: false,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: true,
          },
        },
        zoom: {
          enabled: true,
        },
      },
      dataLabels: { enabled: false },
      markers: { size: 0 },
      title: {
        text: `Daily Summary of Sales - ${response.data.date}`,
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#15464C',
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      series: [
        {
          name: 'Hourly Revenue (₦)',
          data: hourlyData.map((h) => h.amount),
        },
      ],
      xaxis: {
        categories: hourlyData.map((h) => `${h.hour}:00`),
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

    const chartContainer = document.querySelector(`#dailyChart_${shopId}`);
    chartContainer.innerHTML = ''; // Clear old chart if necessary

    if (window[`dailyChartInstance_${shopId}`]) {
      window[`dailyChartInstance_${shopId}`].destroy();
    }

    const dailyChart = new ApexCharts(chartContainer, options);
    dailyChart.render();

    window[`dailyChartInstance_${shopId}`] = dailyChart;

    // Daily Transaction Summary
    updateDailySalesData(dailySalesData, shopId);

    // Daily Payment Method Summary

    const paymentMethodOptions = {
      series: methodValues,
      chart: {
        width: 380,
        type: 'donut',
      },
      labels: methodLabels,
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 270,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          return `${val.toFixed(1)}%`;
        },
      },
      // fill: {
      //   type: 'gradient',
      // },
      legend: {
        position: 'bottom',
        formatter: function (val, opts) {
          const amount = methodValues[opts.seriesIndex].toLocaleString();
          return `${val}: ₦${amount}`;
        },
      },
      title: {
        text: 'Sales by Payment Method',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#15464C',
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `₦${val.toLocaleString()}`,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 260,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };

    const chartEl = document.querySelector(`#paymentMethodChart_${shopId}`);
    if (window[`paymentMethodChartInstance_${shopId}`]) {
      window[`paymentMethodChartInstance_${shopId}`].destroy();
    }

    const paymentChart = new ApexCharts(chartEl, paymentMethodOptions);
    paymentChart.render();
    window[`paymentMethodChartInstance_${shopId}`] = paymentChart;
  }
}

export async function renderMonthlySummary(year, month, shopId) {
  if (servicePermission === 'INVENTORY_SALES' || servicePermission === 'BOTH') {
    const response = await getMonthlySalesSummary(year, month, shopId);

    //  console.log(response);

    if (!response) {
      console.warn('No Monthly data available');
      return;
    }

    const dailyData = response.data.dailyData;
    const paymentMethods = response.data.paymentMethods;
    const monthlySalesData = response.data;

    //  console.log(paymentMethods);

    const methodLabels = Object.keys(paymentMethods);
    const methodValues = Object.values(paymentMethods);

    const options = {
      chart: {
        type: 'area',
        stacked: false,
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: false,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: true,
          },
        },
        zoom: {
          enabled: true,
        },
      },
      dataLabels: { enabled: false },
      markers: { size: 0 },
      title: {
        text: `Monthly Summary of Sales - ${response.data.month}/${response.data.year}`,
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#15464C',
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      series: [
        {
          name: 'Daily Revenue (₦)',
          data: dailyData.map((d) => d.amount),
        },
      ],
      xaxis: {
        categories: dailyData.map((d) => `${d.day}`),
        title: { text: 'Day of Month' },
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

    const chartContainer = document.querySelector(`#monthlyChart_${shopId}`);
    chartContainer.innerHTML = ''; // Clear old chart if necessary

    if (window[`monthlyChartInstance_${shopId}`]) {
      window[`monthlyChartInstance_${shopId}`].destroy();
    }

    const monthlyChart = new ApexCharts(chartContainer, options);
    monthlyChart.render();

    window[`monthlyChartInstance_${shopId}`] = monthlyChart;

    // Monthly Transaction Summary
    updateMonthlySalesData(monthlySalesData, shopId);

    // Monthly Payment Method Summary

    const paymentMethodOptions = {
      series: methodValues,
      chart: {
        width: 380,
        type: 'donut',
      },
      labels: methodLabels,
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 270,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          return `${val.toFixed(1)}%`;
        },
      },
      // fill: {
      //   type: 'gradient',
      // },
      legend: {
        position: 'bottom',
        formatter: function (val, opts) {
          const amount = methodValues[opts.seriesIndex].toLocaleString();
          return `${val}: ₦${amount}`;
        },
      },
      title: {
        text: 'Monthly Sales by Payment Method',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#15464C',
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `₦${val.toLocaleString()}`,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 260,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };

    const chartEl = document.querySelector(
      `#monthlyPaymentMethodChart_${shopId}`
    );

    if (window[`monthlyPaymentMethodChartInstance_${shopId}`]) {
      window[`monthlyPaymentMethodChartInstance_${shopId}`].destroy();
    }

    const paymentChart = new ApexCharts(chartEl, paymentMethodOptions);
    paymentChart.render();
    window[`monthlyPaymentMethodChartInstance_${shopId}`] = paymentChart;
  }
}

//   "data": {
//         "id": 96,
//         "business_name": "Development Business Inc",
//         "address": "Development Business Inc. Address",
//         "phone_number": "08123874887",
//         "state_of_operation": "Delta",
//         "cac_reg_no": "RC39859",
//         "tax_id": "TIN3748696969",
//         "nin": "87396203534",
//         "business_type": "BOTH",
//         "staff_size": 5,
//         "version_preference": "WEB",
//         "is_active": true,
//         "created_at": "2025-05-07T17:32:21.000Z",
//         "updated_at": "2025-06-12T09:14:34.000Z",
//         "subscription": {
//             "status": "none",
//             "days_remaining": null,
//             "subscription_start": null,
//             "subscription_end": null,
//             "activated_by": null,
//             "last_updated": null,
//             "history": []
//         },
//         "manager": null,
//         "shops": [
//             {
//                 "id": 98,
//                 "name": "Development Business Inc.",
//                 "location": "No 17 Otevwe Ochuko Street, Okuokoko,",
//                 "created_at": "2025-05-23T02:24:55.000Z"
//             },
//             {
//                 "id": 123,
//                 "name": "Development Business Inc",
//                 "location": "Development Business Inc. Address",
//                 "created_at": "2025-08-27T23:01:33.000Z"
//             }
//         ],
//         "shop_count": 2
//     }
