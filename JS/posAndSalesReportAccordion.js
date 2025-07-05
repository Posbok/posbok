import config from '../config';
import { getPosTransactions } from './apiServices/pos/posResources';
import {
  getAllSales,
  getDailySalesSummary,
  getMonthlySalesSummary,
  getSaleById,
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
  formatSaleStatus,
  formatTransactionType,
  truncateProductNames,
} from './helper/helper';

const userData = config.userData;
const parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const staffShopId = parsedUserData?.shopId;
const staffUserId = parsedUserData?.id;
const shopKey = `shop_${staffUserId}`;
const servicePermission = parsedUserData?.servicePermission;

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
               </div>

                   <div class="reports-table-container">

                     <table id="staffSalesTable_admin_${shop.id}" class="reports-table">
                        <thead>
                           <tr class="table-header-row">
                              <th class="py-1">S/N</th>
                              <th class="py-1">Date</th>
                              <th class="py-1">Shop</th>
                              <th class="py-1">Product Name</th>
                              <th class="py-1">Total Amount</th>
                              <th class="py-1">Amount Paid</th>
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
    </div>
    </div>

      <!-- POS HTML Ends Here -->
   `;
}

export function getAdminPosTransactionList(
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
  machineFee,
  transactionCharges,
  transaction_fee,
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
                 transactionCharges
               )}</td>
               <td class="py-1 posMachineFeeReport">&#x20A6;${formatAmountWithCommas(
                 machineFee
               )}</td>
               <td class="py-1 posFeePaymentMethodReport">${fee_payment_type}</td>
               <td class="py-1 posPaymentMethodReport">${payment_method}</td>
               <td class="py-1 posPaymentMethodRemark">${remarks}</td>
               <td class="py-1 posPaymentMethodRemark">${receipt_id}</td>`;
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
  status,
  first_name,
  last_name,
  truncatedProductNames
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
                      <td class="py-1 soldItemStatusReport">${formatSaleStatus(
                        status
                      )}</td>
                       <td class="py-1 soldItemDetailReport" data-sale-id="${id}"><i class="fa fa-eye"></i></td>
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
      if (!append) {
        posTableBody.innerHTML = '';
      }
      posTableBody.innerHTML = '';

      // allPosTransactions.push(...posTransactions);

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

      Object.entries(groupedByDate).forEach(([date, transactions]) => {
        let serialNumber = 1;
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
          //  console.log(posTransaction);
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
          row.innerHTML = getAdminPosTransactionList(
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
            machineFee,
            transactionCharges,
            transaction_fee,
            serialNumber++
          );

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

      console.log(allSalesReport);

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
        const dateKey = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(sl);
      });
      // --- SALES ITEM FETCH & TRUNCATE: End ---

      //  console.log(groupedByDate);

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
            status,
            SaleItems,
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

          console.log(salesTransaction);

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
            status,
            first_name,
            last_name,
            truncatedProductNames
          );

          row.addEventListener('click', async (e) => {
            updateSalesReceipt(e, row);
          });

          salesTableBody.appendChild(row);
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

// MOD
// Stored Here.

// renderGoodsTable();

// // JS for Tabs and Charts
// const tabs = document.querySelectorAll('.tab-btn');
// const contents = document.querySelectorAll('.tab-content');

// tabs.forEach((btn) => {
//   btn.addEventListener('click', () => {
//     tabs.forEach((b) => b.classList.remove('active'));
//     contents.forEach((c) => c.classList.remove('active'));

//     btn.classList.add('active');
//     document.getElementById(btn.dataset.tab).classList.add('active');
//   });
// });

// // Dummy chart data For Daily and Monthly Sales
// const dailyCtx = document.getElementById('dailyChart');
// const monthlyCtx = document.getElementById('monthlyChart');

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

// const dummyHourlyData = Array.from({ length: 24 }, (_, hour) => ({
//   hour,
//   count: Math.floor(Math.random() * 5),
//   amount: Math.floor(Math.random() * 1000),
// }));

// const dailyOptions = {
//   //   chart: {
//   //     type: 'line',
//   //     height: 350,
//   //     toolbar: {
//   //       show: true,
//   //       tools: {
//   //         download: false,
//   //         selection: false,
//   //         zoom: false,
//   //         zoomin: false,
//   //         zoomout: false,
//   //         pan: false,
//   //         reset: true, // ✅ Only this will show
//   //       },
//   //     },
//   //     zoom: {
//   //       enabled: true, // Must be true for reset to work
//   //     },
//   //   },

//   chart: {
//     type: 'area',
//     stacked: false,
//     height: 350,
//     toolbar: {
//       show: true,
//       tools: {
//         download: false,
//         selection: false,
//         zoom: false,
//         zoomin: false,
//         zoomout: false,
//         pan: false,
//         reset: true, // ✅ Only this will show
//       },
//     },
//     zoom: {
//       enabled: true, // Must be true for reset to work
//     },
//   },
//   dataLabels: {
//     enabled: false,
//   },
//   markers: {
//     size: 0,
//   },
//   title: {
//     text: 'Daily Summary of Sales',
//     align: 'left',
//     style: {
//       fontSize: '16px',
//       fontWeight: 'bold',
//       color: '#205329',
//     },
//   },
//   //   gradientToColors: ['#ec1a23'],
//   //   colors: ['#205329', '#ec1a23'],
//   fill: {
//     type: 'gradient',
//     gradient: {
//       shadeIntensity: 1,
//       opacityFrom: 0.5,
//       opacityTo: 0,
//       stops: [0, 90, 100],
//     },
//   },
//   series: [
//     {
//       name: 'Hourly Revenue (₦)',
//       data: dummyHourlyData.map((h) => h.amount),
//     },
//   ],
//   xaxis: {
//     categories: dummyHourlyData.map((h) => `${h.hour}:00`),
//     title: { text: 'Hour of Day' },
//     labels: {
//       rotate: -45,
//       style: { fontSize: '11px' },
//     },
//   },
//   yaxis: {
//     title: { text: 'Amount (₦)' },
//   },
//   tooltip: {
//     y: {
//       formatter: (val) => `₦${val.toLocaleString()}`,
//     },
//   },
//   //   fill: {
//   //     type: 'gradient',
//   //     gradient: {
//   //       shade: 'dark',
//   //       type: 'horizontal',
//   //       shadeIntensity: 0.5,
//   //       gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
//   //       inverseColors: true,
//   //       opacityFrom: 1,
//   //       opacityTo: 1,
//   //       stops: [0, 50, 100],
//   //       colorStops: [],
//   //     },
//   //   },
//   responsive: [
//     {
//       breakpoint: 768,
//       options: {
//         chart: { height: 300 },
//         xaxis: {
//           labels: { rotate: -90 },
//         },
//       },
//     },
//   ],
// };

// const dailyChart = new ApexCharts(
//   document.querySelector('#dailyChart'),
//   dailyOptions
// );
// dailyChart.render();

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

// const dummyMonthlyData = Array.from({ length: 31 }, (_, i) => ({
//   day: i + 1,
//   count: Math.floor(Math.random() * 10),
//   amount: Math.floor(Math.random() * 10000),
// }));

// const options = {
//   //   chart: {
//   //     type: 'line',
//   //     height: 350,
//   //     toolbar: {
//   //       show: true,
//   //       tools: {
//   //         download: false,
//   //         selection: false,
//   //         zoom: false,
//   //         zoomin: false,
//   //         zoomout: false,
//   //         pan: false,
//   //         reset: true, // ✅ Only this will show
//   //       },
//   //     },
//   //     zoom: {
//   //       enabled: true, // Must be true for reset to work
//   //     },
//   //   },
//   chart: {
//     type: 'area',
//     stacked: false,
//     height: 350,
//     toolbar: {
//       show: true,
//       tools: {
//         download: false,
//         selection: false,
//         zoom: false,
//         zoomin: false,
//         zoomout: false,
//         pan: false,
//         reset: true, // ✅ Only this will show
//       },
//     },
//     zoom: {
//       enabled: true, // Must be true for reset to work
//     },
//   },
//   dataLabels: {
//     enabled: false,
//   },
//   markers: {
//     size: 0,
//   },
//   title: {
//     text: 'Daily Summary of Sales',
//     align: 'left',
//     style: {
//       fontSize: '16px',
//       fontWeight: 'bold',
//       color: '#205329',
//     },
//   },
//   //   gradientToColors: ['#ec1a23'],
//   //   colors: ['#205329', '#ec1a23'],
//   fill: {
//     type: 'gradient',
//     gradient: {
//       shadeIntensity: 1,
//       opacityFrom: 0.5,
//       opacityTo: 0,
//       stops: [0, 90, 100],
//     },
//   },
//   series: [
//     {
//       name: 'Daily Revenue (₦)',
//       data: dummyMonthlyData.map((d) => d.amount),
//     },
//   ],
//   xaxis: {
//     categories: dummyMonthlyData.map((d) => `Day ${d.day}`),
//     labels: {
//       rotate: -45,
//       style: { fontSize: '12px' },
//     },
//   },
//   yaxis: {
//     title: { text: 'Amount (₦)' },
//   },
//   tooltip: {
//     y: {
//       formatter: (val) => `₦${val.toLocaleString()}`,
//     },
//   },
//   responsive: [
//     {
//       breakpoint: 768,
//       options: {
//         chart: { height: 300 },
//         xaxis: {
//           labels: { rotate: -90 },
//         },
//       },
//     },
//   ],
// };

// const chart = new ApexCharts(document.querySelector('#monthlyChart'), options);
// chart.render();

// // Dummy product sales data
// const productData = {
//   Smartphone: {
//     summary: { quantity: 6, revenue: 270000, cost: 240000, profit: 30000 },
//     sales: [
//       {
//         customer: 'John Doe',
//         qty: 2,
//         unit: 45000,
//         total: 90000,
//         date: '2025-05-21',
//       },
//       {
//         customer: 'Jane Roe',
//         qty: 2,
//         unit: 45000,
//         total: 90000,
//         date: '2025-05-22',
//       },
//       {
//         customer: 'Mark Smith',
//         qty: 2,
//         unit: 45000,
//         total: 90000,
//         date: '2025-05-23',
//       },
//     ],
//   },
//   Tablet: {
//     summary: { quantity: 4, revenue: 140000, cost: 120000, profit: 20000 },
//     sales: [
//       {
//         customer: 'Ayo James',
//         qty: 2,
//         unit: 35000,
//         total: 70000,
//         date: '2025-05-20',
//       },
//       {
//         customer: 'Linda Blue',
//         qty: 2,
//         unit: 35000,
//         total: 70000,
//         date: '2025-05-21',
//       },
//     ],
//   },
//   Laptop: {
//     summary: { quantity: 3, revenue: 240000, cost: 210000, profit: 30000 },
//     sales: [
//       {
//         customer: 'Tunde Green',
//         qty: 1,
//         unit: 80000,
//         total: 80000,
//         date: '2025-05-19',
//       },
//       {
//         customer: 'Blessing B.',
//         qty: 2,
//         unit: 80000,
//         total: 160000,
//         date: '2025-05-20',
//       },
//     ],
//   },
// };

// const productSelect = document.getElementById('productSelect');
// const totalQty = document.getElementById('totalQty');
// const totalRev = document.getElementById('totalRev');
// const totalCostContainer = document.getElementById('totalCost');
// const totalProfitContainer = document.getElementById('totalProfit');
// const tableBody = document.querySelector('#productSalesTable tbody');

// function updateProductData(productSalesList, productSalesSummary) {

//      if (!productSalesSummary) {
//     console.error("productSalesSummary is undefined:", productSalesSummary);
//     return;
//   }

// console.log(productSalesList);
// console.log(productSalesSummary);
// const {
//  productName,
//     totalQuantitySold,
//     totalRevenue,
//     totalCost,
//     totalProfit,
//   } = productSalesSummary;

//   console.log(totalRevenue,  totalCost,    totalProfit);

//   const { name, data } = productSalesList;

//   totalQty.textContent = totalQuantitySold;
//   totalRev.textContent = `₦${formatAmountWithCommas(totalRevenue)}`;
//   totalCostContainer.textContent = `₦${formatAmountWithCommas(totalCost)}`;
//   totalProfitContainer.textContent = `₦${formatAmountWithCommas(totalProfit)}`;

//   tableBody.innerHTML = data.sales
//     .map(
//       (row) => `
//       <tr  class="table-body-row">
//         <td  class="py-1">${row.customer}</td>
//         <td  class="py-1">${row.qty}</td>
//         <td class="py-1">₦${formatAmountWithCommas(row.unit)}</td>
//         <td class="py-1">₦${formatAmountWithCommas(row.total)}</td>
//         <td class="py-1">${row.date}</td>
//       </tr>
//     `
//     )
//     .join('');
// }

// productSelect.addEventListener('change', (e) => {
// //   updateProductData(e.target.value);
// });

// Initialize with first product
// updateProductData('Smartphone');

/////////////////////////////////////////////////////

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
