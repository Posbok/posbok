export function getPosAndSalesReportAccordion(shop) {
  return `        <button class="accordion-toggle card heading-text" data-shop-id="${shop.id}">
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
    </div>
    </div>

    <!-- Sales HTML starts Here -->

          <div  id="shopSales-report-${shop.id}"  class=" reports card" data-loaded="false" mt-4 mb-4 ">
           <div class="reports">
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
                        <th class="py-1">Customer</th>
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
            </div>

<div class="reports card">
            <div class="report-tabs mt-4 mb-4">

               <h2 class="heading-text mb-2">
                  Performance Overview
               </h2>

               <div class="tab-buttons">
                  <button class="tab-btn active" data-tab="daily">Daily Summary</button>
                  <button class="tab-btn" data-tab="monthly">Monthly Summary</button>
                  <button class="tab-btn " data-tab="product">Sales by Product</button>
               </div>

               <div class="tab-content active" id="daily">
                  <div id="dailyChart"></div>
               </div>

               <div class="tab-content" id="monthly">
                  <div id="monthlyChart"></div>
               </div>

               <!-- <div class="tab-content" id="monthly" style="overflow-x: auto;">
                     <canvas id="monthlyChart" style="min-width: 800px; height: max-content;"></canvas>
                  </div> -->

               <div class="tab-content " id="product">

               

            <div class="adminSellProductSearch-section mb-2">

               <div class="adminSellProduct-method-form_input ">
                  <div class="search-input-container">
                     <input type="search" id="adminSearchSellProdutItem" class="adminSearchSellProdutItem"
                        placeholder="Search Product Name or Description ">
                     <span class="searchIcon"><i class="fa-solid fa-magnifying-glass mr-2"></i></span>
                  </div>
               </div>
            </div>

            <!-- Category -->
            <div class="adminSellProductCategory-section mb-1">
               <!-- <button class="adminSellProductCategoryBtn active" type="button">
                  All
               </button> -->

            </div>

            <div class="adminSellProduct-method-form_input mb-2">

               <div class="input-container adminSellProductName">
                  <input type="text" id="adminProductInput" disabled required>
                  <i class="fa fa-times clear-icon" id="adminClearIcon" aria-hidden="true"></i>
               </div>

               <ul class="adminAutocomplete-list" id="adminAutocompleteList"></ul>
            </div>

             

                  <div class="productSales-summary mb-1">
                     <!-- Total Quantity -->
                     <div class="summary-card">
                        <h3>Total Quantity</h3>
                        <p class="amount" id="totalQty">₦0</p>
                     </div>

                     <!-- Total Revenue -->
                     <div class="summary-card">
                        <h3>Total Revenue</h3>
                        <p class="amount" id="totalRev">₦0</p>
                     </div>

                     <!-- Total Cost -->
                     <div class="summary-card">
                        <h3>Total Cost</h3>
                        <p class="amount" id="totalCost">₦0</p>
                     </div>

                     <!-- Total Profit -->
                     <div class="summary-card">
                        <h3>Total Profit</h3>
                        <p class="amount" id="totalProfit">₦0</p>
                     </div>
                  </div>

                  <div class="reports-table-container">

                     <table id="productSalesTable" class="reports-table">
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



               <div class="sales-summary">
                  <div class="summary-card">
                     <h3>Total Sales</h3>
                     <p class="amount" id="staffTotal-sales">₦0</p>
                  </div>
                  <div class="summary-card">
                     <h3>Total Amount</h3>
                     <p class="amount" id="staffTotal-Amount">₦0</p>
                  </div>
                  <div class="summary-card">
                     <h3>Total Paid</h3>
                     <p class="amount" id="staffTotal-paid">₦0</p>
                  </div>
                  <div class="summary-card">
                     <h3>Balance</h3>
                     <p class="amount" id="staffTotal-balance">₦0</p>
                  </div>
               </div>

            </div>
         </div>
      </div>

    
    `;
}

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
