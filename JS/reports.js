import config from '../config';
import {
  deleteAllTransactions,
  getPosTransactions,
} from './apiServices/pos/posResources';
import {
  checkAndPromptCreateShop,
  fetchShopDetail,
} from './apiServices/shop/shopResource';
import {
  clearReceiptDiv,
  formatAmountWithCommas,
  formatSaleStatus,
  formatTransactionType,
  hideBtnLoader,
  populateBusinessStaffDropdown,
  showBtnLoader,
} from './helper/helper';
import { hideGlobalLoader, showGlobalLoader } from '../JS/helper/helper';
import {
  getAllSales,
  getDailySalesSummary,
  getMonthlySalesSummary,
  getSaleById,
  getSalesByProduct,
  getSalesByStaff,
} from './apiServices/sales/salesResources';
import { closeModal, showToast } from './script';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import {
  getProductCategories,
  getProductInventory,
} from './apiServices/inventory/inventoryResources';
import { getPosAndSalesReportAccordion } from './posAndSalesReportAccordion';
import { checkAndPromptCreateStaff } from './apiServices/user/userResource';
import {
  displayAllCategories,
  displayAllProducts,
  fetchAllCategories,
  fetchAllProducts,
  updateDailySalesData,
  updateMonthlySalesData,
  updateSalesReceipt,
  updateStaffSalesData,
  updateTotalSalesAmounts,
} from './apiServices/utility/salesReportUtility';
import { updateTotalPosAmounts } from './apiServices/utility/posReportUtility';

const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const staffShopId = parsedUserData?.shopId;
const staffUserId = parsedUserData?.id;
const shopKey = `shop_${staffUserId}`;

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

// Monthly Filter Function

function getMonthlySummaryFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  const formattedMonth = new Date().getMonth() + 1;
  const formattedYear = new Date().getFullYear();

  return {
    monthlySummaryMonth:
      document.getElementById(`monthSelect_${suffix}`)?.value ||
      Number(formattedMonth),

    monthlySummaryYear:
      document.getElementById(`yearSelect_${suffix}`)?.value || formattedYear,
  };
}

function resetMonthlySummaryFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  document.getElementById(`monthlySummaryDateFilter_${suffix}`).value = '';
}

// Daily Filter Function

function getDailySummaryFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"

  return {
    dailySummaryDate:
      document.getElementById(`dailySummaryDateFilter_${suffix}`)?.value ||
      formattedDate,
  };
}

function resetDailySummaryFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  document.getElementById(`dailySummaryDateFilter_${suffix}`).value = '';
}

function resetFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  document.getElementById(`startDateFilter_${suffix}`).value = '';
  document.getElementById(`endDateFilter_${suffix}`).value = '';
  document.getElementById(`typeFilter_${suffix}`).value = '';
  document.getElementById(`statusFilter_${suffix}`).value = '';
}

function getSalesFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  return {
    startDate:
      document.getElementById(`salesStartDateFilter_${suffix}`)?.value || '',
    endDate:
      document.getElementById(`salesEndDateFilter_${suffix}`)?.value || '',
    paymentMethod:
      document.getElementById(`salesPaymentMethod_${suffix}`)?.value || '',
    status: document.getElementById(`salesStatusFilter_${suffix}`)?.value || '',
  };
}

function resetSalesFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  document.getElementById(`salesStartDateFilter_${suffix}`).value = '';
  document.getElementById(`salesEndDateFilter_${suffix}`).value = '';
  document.getElementById(`salesPaymentMethod_${suffix}`).value = '';
  document.getElementById(`salesStatusFilter_${suffix}`).value = '';
}

let allProducts = [];
let allCategories = [];
let activeCategoryId = null; // null means "All"
let selectedProduct = null;
let totalCartAmount = 0;

if (isAdmin) {
  showGlobalLoader();

  let enrichedShopData = [];
  const currentFiltersByShop = {};
  const currentSalesFiltersByShop = {};
  const currentDailySalesFiltersByShop = {};
  const currentMonthlySalesFiltersByShop = {};

  const container = document.getElementById('accordionShops');
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
    accordion.innerHTML = getPosAndSalesReportAccordion(shop);

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

    // Admin Sales Filter
    document
      .getElementById(`applySalesFiltersBtn_admin_${shop.id}`)
      ?.addEventListener('click', () => {
        const filters = getSalesFilters('admin', shop.id);
        currentSalesFiltersByShop[shop.id] = filters;

        renderSalesTable({
          page: currentPage,
          limit,
          filters,
          shopId,
          tableBodyId: `#sale-tbody-${shop.id}`,
          loadMoreButton: document.getElementById(
            `loadMoreSaleButton_admin_${shop.id}`
          ),
        });
        //   console.log('filters:', filters);
      });

    document
      .getElementById(`resetSalesFiltersBtn_${shop.id}`)
      ?.addEventListener('click', () => {
        const role = 'admin';
        resetSalesFilters(role, shop.id);
        const filters = getSalesFilters(role, shop.id);
        currentSalesFiltersByShop[shop.id] = filters;
        const tableSelector = '.posTableDisplay_staff tbody';

        renderSalesTable({
          page: currentPage,
          limit,
          filters,
          shopId,
          tableBodyId: `#sale-tbody-${shop.id}`,
          loadMoreButton: document.getElementById(
            `loadMoreSaleButton_admin_${shop.id}`
          ),
        });
      });

    // Admin Daily Sales Simmary

    document
      .getElementById(`applyDailySummaryDateFiltersBtn_admin_${shop.id}`)
      ?.addEventListener('click', () => {
        const dailyFilters = getDailySummaryFilters('admin', shop.id);
        currentDailySalesFiltersByShop[shop.id] = dailyFilters;

        const { dailySummaryDate } = dailyFilters;

        renderDailySummary(shopId, dailySummaryDate);
      });

    document
      .getElementById(`resetFiltersBtn_admin_${shop.id}`)
      ?.addEventListener('click', () => {
        const role = 'admin';

        resetDailySummaryFilters(role, shop.id);

        const dailyFilters = getDailySummaryFilters(role, shop.id);
        currentDailySalesFiltersByShop[shop.id] = dailyFilters;

        const { dailySummaryDate } = dailyFilters;

        renderDailySummary(shopId, dailySummaryDate);
      });

    // Admin Monthly Sales Simmary

    document
      .getElementById(`applyMonthlySummaryDateFiltersBtn_admin_${shop.id}`)
      ?.addEventListener('click', () => {
        const monthlyFilters = getMonthlySummaryFilters('admin', shop.id);
        currentDailySalesFiltersByShop[shop.id] = monthlyFilters;
        const { monthlySummaryMonth, monthlySummaryYear } = monthlyFilters;

        let month = monthlySummaryMonth;
        let year = monthlySummaryYear;

        renderMonthlySummary(year, month, shopId);
      });

    document
      .getElementById(`resetMonthlySummaryFiltersBtn_admin_${shop.id}`)
      ?.addEventListener('click', () => {
        const role = 'admin';

        resetMonthlySummaryFilters(role, shop.id);

        const monthlyFilters = getMonthlySummaryFilters(role, shop.id);
        currentMonthlySalesFiltersByShop[shop.id] = monthlyFilters;
        const { monthlySummaryMonth, monthlySummaryYear } = monthlyFilters;

        let month = monthlySummaryMonth;
        let year = monthlySummaryYear;

        renderMonthlySummary(year, month, shopId);
      });

    // Populate months
    const monthSelect = document.getElementById(`monthSelect_admin_${shop.id}`);

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    monthNames.forEach((month, index) => {
      const option = document.createElement('option');
      option.value = index + 1;
      option.textContent = month;
      monthSelect.appendChild(option);
    });

    // Populate years (2020–2030 for example)
    const yearSelect = document.getElementById(`yearSelect_admin_${shop.id}`);

    for (let year = 2030; year >= 2020; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }

    // Admin Sales
    const loadMoreSalesButton = document.getElementById(
      `loadMoreSaleButton_admin_${shop.id}`
    );

    loadMoreSalesButton.style.display = 'none';

    loadMoreSalesButton.addEventListener('click', () => {
      const role = 'admin';
      const nextPage = ++shopPageTracker[shop.id];
      const filters = currentSalesFiltersByShop[shop.id] || {};

      //  const tableBodyId = '.posTableDisplay_staff tbody';

      renderSalesTable({
        page: nextPage,
        limit,
        filters,
        shopId,
        tableBodyId: `#sale-tbody-${shop.id}`,
        loadMoreButton: document.getElementById(
          `loadMoreSaleButton_admin_${shop.id}`
        ),
      });
    });

    //  Admin POS
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
    const salesFilters = getSalesFilters('admin', shop.id);

    currentFiltersByShop[shop.id] = filters;
    currentSalesFiltersByShop[shop.id] = salesFilters;

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
          row.innerHTML = `
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

  async function renderSalesTable({
    page = 1,
    limit,
    filters,
    shopId,
    tableBodyId,
    loadMoreButton,
  }) {
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
        loadingRow.className = 'leoading-row';
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

      // console.log(allSalesReport);

      allSalesReport.forEach((sl) => {
        const dateObj = new Date(sl.business_day);

        const dateKey = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }); // "May 11, 2025"

        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(sl);
      });

      //  console.log(groupedByDate);

      let serialNumber = 1;

      Object.entries(groupedByDate).forEach(([date, sales]) => {
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
          } = salesTransaction;

          const { first_name, last_name } = salesTransaction.Account;

          const row = document.createElement('tr');
          row.classList.add('table-body-row');

          row.dataset.saleId = id; // Store sale ID for detail view
          row.innerHTML = `
                <td class="py-1">${serialNumber++}.</td>
               <td class="py-1 soldItemReceiptReport">${receipt_number}</td>
               <td class="py-1 soldItemCustomerNameReport">${
                 customer_name === '' ? '-' : customer_name
               }</td>
                <td class="py-1 soldItemCustomerNameReport">${first_name} ${last_name}</td>
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

  async function renderDailySummary(shopId, dailySummaryDate) {
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

  async function renderMonthlySummary(year, month, shopId) {
    console.log(year, month, shopId);
    const response = await getMonthlySalesSummary(year, month, shopId);

    console.log(response);

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
    const shopSalesTransactiionSection = document.getElementById(
      `shopSales-report-${shopId}`
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

    if (
      shopSalesTransactiionSection &&
      shopSalesTransactiionSection.dataset.loaded !== 'true'
    ) {
      await renderSalesTable({
        page: shopPageTracker[shopId],
        limit,
        filters,
        shopId,
        tableBodyId: `#sale-tbody-${shopId}`,
        loadMoreButton: document.getElementById(
          `loadMoreSaleButton_admin_${shopId}`
        ),
      });
      shopSalesTransactiionSection.dataset.loaded = 'true';
    }

    // Render Daily sales Summary
    const dailyFilters = getDailySummaryFilters('admin', shopId);
    currentDailySalesFiltersByShop[shopId] = dailyFilters;

    const { dailySummaryDate } = dailyFilters;

    await renderDailySummary(shopId, dailySummaryDate);

    // Render Monthly sales Summary
    const monthlyFilters = getMonthlySummaryFilters('admin', shopId);
    currentMonthlySalesFiltersByShop[shopId] = monthlyFilters;

    console.log(monthlyFilters);

    const { monthlySummaryMonth, monthlySummaryYear } = monthlyFilters;
    let month = monthlySummaryMonth;
    let year = monthlySummaryYear;

    await renderMonthlySummary(year, month, shopId);

    //  const searchSellProdutItem = document.getElementById(
    //    isAdmin ? `adminSearchSellProdutItem_${shopId}` : 'searchSellProdutItem'
    //  );

    //  const sellProductCategorySection = document.querySelector(
    //    isAdmin
    //      ? '.adminSellProductCategory-section'
    //      : '.sellProductCategory-section'
    //  );

    const sellProductCategorySection = document.querySelector(
      '.adminSellProductCategory-section'
    );

    const sellProductName = document.querySelector(
      isAdmin ? '.adminSellProductName' : '.sellProductName'
    );

    const autocompleteList = document.getElementById(
      isAdmin ? 'adminAutocompleteList' : 'autocompleteList'
    );

    const productBoughtPrice = document.getElementById(
      isAdmin ? 'adminProductBoughtPrice' : 'productBoughtPrice'
    );
    const itemSellingprice = document.getElementById(
      isAdmin ? 'adminItemSellingPrice' : 'itemSellingPrice'
    );
    const itemQuantityAvailable = document.getElementById(
      isAdmin ? 'adminItemQuantityAvailable' : 'itemQuantityAvailable'
    );

    // Re-fetch products and categories
    displayAllProducts(shopId);
    displayAllCategories(shopId);

    const adminSellProductSearchSection = document.querySelector(
      '.adminSellProductSearch-section'
    );
    const adminSellProductCategorySection = document.querySelector(
      '.adminSellProductCategory-section'
    );
    const adminSellProductName = document.querySelector(
      '.adminSellProductName'
    );
    const adminAutocompleteList = document.getElementById(
      'adminAutocompleteList'
    );

    document.addEventListener('DOMContentLoaded', () => {
      if (adminSellProductSearchSection)
        adminSellProductSearchSection.style.display = 'none';
      if (adminSellProductCategorySection)
        adminSellProductCategorySection.style.display = 'none';
      if (adminSellProductName) adminSellProductName.style.display = 'none';
      if (adminAutocompleteList) adminAutocompleteList.style.display = 'none';
    });

    await fetchAllCategories(shopId);
    await fetchAllProducts(shopId);

    // JS for Tabs and Charts
    const tabs = document.querySelectorAll(`.tab-btn_${shopId}`);
    const contents = document.querySelectorAll(`.tab-content_${shopId}`);

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabs.forEach((b) => b.classList.remove('active'));
        contents.forEach((c) => c.classList.remove('active'));

        btn.classList.add('active');
        //   document.getElementById(btn.dataset.tab).classList.add('active');

        const targetId = btn.dataset.tab;
        const targetContent = document.getElementById(targetId);

        if (targetContent) {
          targetContent.classList.add('active');
        } else {
          console.warn(`Tab content with ID "${targetId}" not found.`);
        }
      });
    });

    const reportStaffDropdown = document.getElementById(
      `reportStaffDropdown_admin_${shopId}`
    );

    // Update Staff Sales Report

    async function loadStaffDropdown() {
      try {
        showGlobalLoader();
        const staffData = await checkAndPromptCreateStaff();
        //  console.log('Staff Data', staffData);
        const staffDataList = staffData?.data.users;

        console.log(staffData);

        populateBusinessStaffDropdown(
          staffDataList,
          `reportStaffDropdown_admin_${shopId}`
        );
        hideGlobalLoader();
      } catch (err) {
        hideGlobalLoader();
        console.error('Failed to load dropdown:', err.message);
      }
    }

    loadStaffDropdown();

    reportStaffDropdown.addEventListener('change', async () => {
      const staffId = reportStaffDropdown.value;

      const staffSalesResponse = await getSalesByStaff(staffId);

      if (!staffSalesResponse) {
        hideGlobalLoader();
        console.error('Error receiveing Staff Sales Data');
        showToast('fail', `❎ ${staffSalesResponse.message}`);
        return;
      }

      const staffSalesDetails = staffSalesResponse.data;
      const staffSalesList = staffSalesDetails.sales;
      const staffSalesSummary = staffSalesDetails.summary;

      //  Staff Overview / Staff Performance

      updateStaffSalesData(staffSalesList, staffSalesSummary, shopId);
    });
  });
}

// Open Sale Detail Modal
export function openSaleDetailsModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const saleDetailsContainer = document.querySelector('.saleDetails');

  if (saleDetailsContainer) saleDetailsContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  saleDetailModalForm();
}

export function saleDetailModalForm() {
  //   const form = document.querySelector('.soldDetailModal');
  const form = isAdmin
    ? document.querySelector('.adminSoldDetailModal')
    : document.querySelector('.soldDetailModal');
  if (!form) return;
}

document.addEventListener('DOMContentLoaded', () => {
  renderSaleDetailById(); // Only once
});

export function renderSaleDetailById() {
  //   const form = document.querySelector('.soldDetailModal');
  const form = isAdmin
    ? document.querySelector('.adminSoldDetailModal')
    : document.querySelector('.soldDetailModal');

  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
    });
  }
}

// Update the autocomplete list with provided products
const autocompleteList = document.getElementById(
  isAdmin ? 'adminAutocompleteList' : 'autocompleteList'
);

const productBoughtPrice = document.getElementById(
  isAdmin ? 'adminProductBoughtPrice' : 'productBoughtPrice'
);
const itemSellingprice = document.getElementById(
  isAdmin ? 'adminItemSellingPrice' : 'itemSellingPrice'
);
const itemQuantityAvailable = document.getElementById(
  isAdmin ? 'adminItemQuantityAvailable' : 'itemQuantityAvailable'
);

if (isStaff) {
  const shopId = parsedUserData?.shopId;

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

  //Sales Filter
  document
    .getElementById('applySalesFiltersBtn_staff')
    ?.addEventListener('click', () => {
      const filters = getSalesFilters('staff');
      renderSalesTable(1, pageSize, filters, 'staff');
      // console.log('filters:', filters);
    });

  document
    .getElementById('resetSalesFiltersBtn_staff')
    ?.addEventListener('click', () => {
      const role = 'staff';
      resetSalesFilters(role);
      const filters = getSalesFilters(role);
      const tableSelector = '.posTableDisplay_staff tbody';
      renderSalesTable(1, pageSize, filters, 'staff');
    });

  // Sales
  const loadMoreSalesButton = document.getElementById(
    'loadMoreSalesButton_staff'
  );

  loadMoreSalesButton.style.display = 'none';

  loadMoreSalesButton.addEventListener('click', () => {
    const role = 'staff';
    currentPage += 1;
    const filters = getSalesFilters(role);

    //  const tableBodyId = '.posTableDisplay_staff tbody';

    renderSalesTable(currentPage, pageSize, filters, role);
  });

  // POS
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

  async function renderSalesTable(
    page = 1,
    pageSize,
    filters = {},
    role = 'staff'
  ) {
    //  console.log('🧪 Applied Filters:', filters);

    const salesTableBody = document.querySelector(
      `.soldTableDisplay_${role} tbody`
    );

    if (!salesTableBody) {
      console.error('Error: Table body not found');
      return;
    }

    try {
      let loadingRow = document.querySelector('.loading-row');
      if (!loadingRow) {
        loadingRow = document.createElement('tr');
        loadingRow.className = 'loading-row';
        loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading transactions...</td>`;
        salesTableBody.appendChild(loadingRow);
      }

      loadMoreButton.style.display = 'none';

      // Build query with filters
      // const queryParams = new URLSearchParams({
      //   shopId: shopId,
      //   page,
      //   limit: pageSize,
      // });

      // if (filters.startDate) queryParams.append('startDate', filters.startDate);
      // if (filters.endDate) queryParams.append('endDate', filters.endDate);
      // if (filters.paymentMethod)
      //   queryParams.append('paymentMethod', filters.paymentMethod);
      // if (filters.status) queryParams.append('status', filters.status);

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

      allSalesReport.forEach((sl) => {
        const dateObj = new Date(sl.business_day);

        const dateKey = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }); // "May 11, 2025"

        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(sl);
      });

      //  console.log(groupedByDate);

      let serialNumber = 1;

      Object.entries(groupedByDate).forEach(([date, sales]) => {
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
          } = salesTransaction;

          const { first_name, last_name } = salesTransaction.Account;

          const row = document.createElement('tr');
          row.classList.add('table-body-row');

          row.dataset.saleId = id; // Store sale ID for detail view
          row.innerHTML = `
                <td class="py-1">${serialNumber++}.</td>
               <td class="py-1 soldItemReceiptReport">${receipt_number}</td>
               <td class="py-1 soldItemCustomerNameReport">${customer_name}</td>
                <td class="py-1 soldItemCustomerNameReport">${first_name} ${last_name}</td>
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

          row.addEventListener('click', async (e) => {
            e.preventDefault();
            showGlobalLoader();
            // Finally open the modal
            openSaleDetailsModal();
            const saleId = row.dataset.saleId;
            // console.log(`Open details for Sale ID: ${saleId}`);

            // Get Sales by ID
            try {
              showGlobalLoader();
              const saleDetails = await getSaleById(saleId);
              const shopDetails =
                JSON.parse(localStorage.getItem(shopKey)) || [];

              //   console.log('shopDetails', shopDetails);
              //   console.log('saleDetails', saleDetails);

              if (!shopDetails) {
                console.log('No shopDetails');
                showToast('error', '❎ Cannot get Shop Details');
                closeModal();
                return;
              }

              if (!saleDetails || !saleDetails.data) {
                console.log('No saleDetails');
                showToast('error', '❎  Cannot get Sale Details');
                closeModal();
                clearReceiptDiv();
                return;
              }

              const {
                Account,
                SaleItems,
                Shop,
                receipt_number,
                customer_name,
                customer_phone,
                payment_method,

                total_amount,
                amount_paid,
                balance,
                status,
                business_day,
                sale_time,
              } = saleDetails.data;

              // Populate sale summary

              // Top Part Below
              document.getElementById('soldDetailShop').textContent =
                Shop?.shop_name || 'N/A';
              document.getElementById('soldDetailShopAddress').textContent =
                shopDetails?.data?.location || 'N/A';

              document.getElementById('soldDetailReceiptNumber').textContent =
                receipt_number;
              document.getElementById('soldDetailCustomerName').textContent =
                `${customer_name} - ${customer_phone}` || 'N/A';
              document.getElementById('soldDetailStaffName').textContent =
                `${Account?.first_name} ${Account?.last_name}` || 'N/A';
              document.getElementById('soldDetailDate').textContent = new Date(
                sale_time
              ).toLocaleString();

              // Bottom Part Below

              document.getElementById('soldDetailPaymentMethod').textContent =
                payment_method || 'N/A';

              document.getElementById(
                'soldDetailTotalAmount'
              ).textContent = `₦${formatAmountWithCommas(total_amount)}`;
              document.getElementById(
                'soldDetailPaidAmount'
              ).textContent = `₦${formatAmountWithCommas(amount_paid)}`;
              document.getElementById(
                'soldDetailBalanceAmount'
              ).textContent = `₦${formatAmountWithCommas(balance)}`;

              document.getElementById('soldDetailStatus').textContent =
                formatSaleStatus(status);

              // Sales Items - Middle Part Below
              const itemsTableBody =
                document.querySelector('.itemsTable tbody');
              itemsTableBody.innerHTML = ''; // clear previous rows

              SaleItems.forEach((item, index) => {
                const itemRow = document.createElement('tr');
                itemRow.classList.add('table-body-row');
                itemRow.innerHTML = `
             <td class="py-1">${item.Product.name}</td>
                           <td class="py-1">${item.quantity}</td>
                           <td class="py-1">₦${formatAmountWithCommas(
                             item.selling_price
                           )}</td>
                           <td class="py-1">${formatAmountWithCommas(
                             item.quantity * item.selling_price
                           )}</td>
             
                     `;
                itemsTableBody.appendChild(itemRow);
              });

              // Print & Download - Staff

              //   Print
              //   const printReceiptBtn =
              //     document.querySelector('.printReceiptBtn');

              //Keep this earlier Print Logic

              //            printReceiptBtn.addEventListener('click', () => {
              //              showBtnLoader(printReceiptBtn);
              //              const receiptContent =
              //                document.querySelector('.pdfHere').innerHTML;

              //              const printWindow = window.open('', '', 'width=300,height=500');
              //              printWindow.document.write(`
              //  <html>
              //    <head>
              //      <title>Print Receipt</title>
              //      <style>
              //        body { font-family: monospace; width: 58mm; font-size: 8px; padding: 5px; }
              //        .center { text-align: center; }
              //        .bold { font-weight: bold; }
              //        .line { border-top: 1px dashed #000; margin: 4px 0; }
              //        table { width: 100%; font-size: 12px; border-collapse: collapse; }
              //        td { padding: 2px 5px; }
              //        .footer { text-align: center; margin-top: 10px; }
              //      </style>
              //    </head>
              //    <body>${receiptContent}</body>
              //  </html>`);
              //              printWindow.document.close();
              //              printWindow.focus();
              //              printWindow.print();
              //              // printWindow.close();
              //              hideBtnLoader(printReceiptBtn);
              //            });

              const printReceiptBtn =
                document.querySelector('.printReceiptBtn');

              printReceiptBtn.onclick = () => {
                const container = document.getElementById('receiptPrintPDF');

                container.innerHTML = renderReceiptPrintHTML(
                  saleDetails.data,
                  shopDetails.data
                );

                container.style.display = 'block'; // temporarily show

                // const receiptHeightPx = container.scrollHeight;
                const receiptHeightPx =
                  container.getBoundingClientRect().height;
                const heightInMM = receiptHeightPx * 0.264583;
                // const adjustedHeight = Math.floor(heightInMM) - 4;

                // console.log(adjustedHeight);

                const opt = {
                  margin: 0,
                  filename: `receipt-${Date.now()}.pdf`,
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2 },
                  pagebreak: { avoid: 'tr', mode: ['css', 'legacy'] },
                  jsPDF: {
                    unit: 'mm',
                    format: [58, heightInMM], // height can be adjusted dynamically if needed
                    orientation: 'portrait',
                  },
                };

                html2pdf()
                  .set(opt)
                  .from(container)
                  .save()
                  .then(() => {
                    container.style.display = 'none';
                  });
              };

              //   Download;

              const generatePdfBtn = document.querySelector('.generatePdfBtn');
              generatePdfBtn?.addEventListener('click', () => {
                showBtnLoader(generatePdfBtn);
                const receiptElement = document.querySelector('.pdfHere');
                if (!receiptElement) {
                  showToast('fail', '❎ Receipt content not found.');
                  return;
                }

                const opt = {
                  margin: 10,
                  filename: `receipt-${Date.now()}.pdf`,
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2 },
                  jsPDF: {
                    unit: 'mm',
                    format: 'a4', // adjust height based on content
                    orientation: 'portrait',
                  },
                };

                html2pdf().set(opt).from(receiptElement).save();
                hideBtnLoader(generatePdfBtn);
              });

              hideGlobalLoader();
              //   openSaleDetailsModal();
            } catch (err) {
              hideGlobalLoader();
              console.error('Error fetching sale details:', err.message);
              showToast('fail', `❎ Failed to load sale details`);
              closeModal();
              clearReceiptDiv();
            }
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
        loadMoreSalesButton.style.display = 'none';
      } else {
        loadMoreSalesButton.style.display = 'block';
      }
    } catch (error) {
      console.error('Error rendering transactions:', error);
      salesTableBody.innerHTML =
        '<tr><td colspan="6" class="table-error-text">Error loading transactions.</td></tr>';
    }
  }

  renderSalesTable();
  renderPosTable();
}

// JS for modal
const main = document.querySelector('.main');
const sidebar = document.querySelector('.sidebar');

const closeModalButton = document.querySelectorAll('.closeModal');
const closeImageModalBtn = document.querySelectorAll('.closeImageModal');

closeModalButton.forEach((closeButton) => {
  closeButton.addEventListener('click', function () {
    closeModal();
    clearReceiptDiv();
  });
});

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
