import config from '../config';
import './script.js';
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
  truncateProductNames,
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
import {
  adminPosReportHtml,
  getAdminPosReportHtml,
  getAdminPosTransactionList,
  getAdminSalesReportHtml,
  getAdminSalesTransactionList,
  getPosAndSalesReportAccordion,
  renderDailySummary,
  renderMonthlySummary,
  renderPosTable,
  renderSalesTable,
} from './posAndSalesReportAccordion';
import { checkAndPromptCreateStaff } from './apiServices/user/userResource';
import {
  displayAllCategories,
  displayAllProducts,
  fetchAllCategories,
  fetchAllProducts,
  renderReceiptPrintHTML,
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
const servicePermission = parsedUserData?.servicePermission;

console.log(servicePermission);

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

  document.getElementById(`monthSelect_${suffix}`).value = '';

  document.getElementById(`yearSelect_${suffix}`).value = '';
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

function setupPosFilters({
  shopId,
  shopPageTracker,
  currentFiltersByShop,
  limit,
  renderPosTableFn,
}) {
  const applyBtn = document.getElementById(`applyFiltersBtn_admin_${shopId}`);
  const resetBtn = document.getElementById(`resetFiltersBtn_${shopId}`);
  const loadMoreBtn = document.getElementById(`loadMoreButton_admin_${shopId}`);

  if (!applyBtn || !resetBtn || !loadMoreBtn) return;

  // Apply Filters
  applyBtn.addEventListener('click', () => {
    const filters = getFilters('admin', shopId);
    currentFiltersByShop[shopId] = filters;

    shopPageTracker[shopId] = 1;
    allPosTransactions = [];

    renderPosTableFn({
      page: 1,
      limit,
      filters,
      shopId,
      tableBodyId: `#pos-tbody-${shopId}`,
      loadMoreButton: loadMoreBtn,
      append: false,
    });
  });

  // Reset Filters
  resetBtn.addEventListener('click', () => {
    const role = 'admin';

    resetFilters(role, shopId);
    const filters = getFilters(role, shopId);
    currentFiltersByShop[shopId] = filters;

    shopPageTracker[shopId] = 1;
    allPosTransactions = [];

    renderPosTableFn({
      page: 1,
      limit,
      filters,
      shopId,
      tableBodyId: `#pos-tbody-${shopId}`,
      loadMoreButton: loadMoreBtn,
      append: false,
    });
  });

  // Load More
  loadMoreBtn.addEventListener('click', () => {
    const nextPage = ++shopPageTracker[shopId];
    const filters = currentFiltersByShop[shopId] || {};

    renderPosTableFn({
      page: nextPage,
      limit,
      filters,
      shopId,
      tableBodyId: `#pos-tbody-${shopId}`,
      loadMoreButton: loadMoreBtn,
      append: true,
    });
  });
}

function setupSalesFilters({
  shopId,
  shopPageTracker,
  currentSalesFiltersByShop,
  currentDailySalesFiltersByShop,
  currentMonthlySalesFiltersByShop,
  limit,
  renderSalesTableFn,
  renderDailySummaryFn,
  renderMonthlySummaryFn,
}) {
  // Admin Sales Filter
  document
    .getElementById(`applySalesFiltersBtn_admin_${shopId}`)
    ?.addEventListener('click', () => {
      const filters = getSalesFilters('admin', shopId);
      currentSalesFiltersByShop[shopId] = filters;

      renderSalesTableFn({
        page: currentPage,
        limit,
        filters,
        shopId,
        tableBodyId: `#sale-tbody-${shopId}`,
        loadMoreButton: document.getElementById(
          `loadMoreSaleButton_admin_${shopId}`
        ),
      });
      //   console.log('filters:', filters);
    });

  document
    .getElementById(`resetSalesFiltersBtn_${shopId}`)
    ?.addEventListener('click', () => {
      const role = 'admin';
      resetSalesFilters(role, shopId);
      const filters = getSalesFilters(role, shopId);
      currentSalesFiltersByShop[shopId] = filters;
      const tableSelector = '.posTableDisplay_staff tbody';

      renderSalesTableFn({
        page: currentPage,
        limit,
        filters,
        shopId,
        tableBodyId: `#sale-tbody-${shopId}`,
        loadMoreButton: document.getElementById(
          `loadMoreSaleButton_admin_${shopId}`
        ),
      });
    });

  // Admin Daily Sales Simmary

  document
    .getElementById(`applyDailySummaryDateFiltersBtn_admin_${shopId}`)
    ?.addEventListener('click', () => {
      const dailyFilters = getDailySummaryFilters('admin', shopId);
      currentDailySalesFiltersByShop[shopId] = dailyFilters;

      const { dailySummaryDate } = dailyFilters;

      renderDailySummaryFn(shopId, dailySummaryDate);
    });

  document
    .getElementById(`resetFiltersBtn_admin_${shopId}`)
    ?.addEventListener('click', () => {
      const role = 'admin';

      resetDailySummaryFilters(role, shopId);

      const dailyFilters = getDailySummaryFilters(role, shopId);
      currentDailySalesFiltersByShop[shopId] = dailyFilters;

      const { dailySummaryDate } = dailyFilters;

      renderDailySummaryFn(shopId, dailySummaryDate);
    });

  // Admin Monthly Sales Simmary

  document
    .getElementById(`applyMonthlySummaryDateFiltersBtn_admin_${shopId}`)
    ?.addEventListener('click', () => {
      const monthlyFilters = getMonthlySummaryFilters('admin', shopId);
      currentDailySalesFiltersByShop[shopId] = monthlyFilters;
      const { monthlySummaryMonth, monthlySummaryYear } = monthlyFilters;

      let month = monthlySummaryMonth;
      let year = monthlySummaryYear;

      renderMonthlySummaryFn(year, month, shopId);
    });

  document
    .getElementById(`resetMonthlySummaryFiltersBtn_admin_${shopId}`)
    ?.addEventListener('click', () => {
      const role = 'admin';

      resetMonthlySummaryFilters(role, shopId);

      const monthlyFilters = getMonthlySummaryFilters(role, shopId);
      currentMonthlySalesFiltersByShop[shopId] = monthlyFilters;
      const { monthlySummaryMonth, monthlySummaryYear } = monthlyFilters;

      let month = monthlySummaryMonth;
      let year = monthlySummaryYear;

      renderMonthlySummaryFn(year, month, shopId);
    });

  // Populate months
  const monthSelect = document.getElementById(`monthSelect_admin_${shopId}`);

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
  const yearSelect = document.getElementById(`yearSelect_admin_${shopId}`);

  for (let year = 2030; year >= 2020; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  // Admin Sales
  const loadMoreSalesButton = document.getElementById(
    `loadMoreSaleButton_admin_${shopId}`
  );

  loadMoreSalesButton.style.display = 'none';

  loadMoreSalesButton.addEventListener('click', () => {
    const role = 'admin';
    const nextPage = ++shopPageTracker[shopId];
    const filters = currentSalesFiltersByShop[shopId] || {};

    //  const tableBodyId = '.posTableDisplay_staff tbody';

    renderSalesTableFn({
      page: nextPage,
      limit,
      filters,
      shopId,
      tableBodyId: `#sale-tbody-${shopId}`,
      loadMoreButton: document.getElementById(
        `loadMoreSaleButton_admin_${shopId}`
      ),
    });
  });
}

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
    //  accordion.innerHTML = getPosAndSalesReportAccordion(shop);
    accordion.innerHTML = `
        <button class="accordion-toggle card heading-text" data-shop-id="${
          shop.id
        }">
                  <h2 class="heading-subtext">
                     ${shop.shop_name}
                  </h2>

                  <i class="fa-solid icon fa-chevron-down"></i>
               </button>
               
                   <div class="accordion-content">

             
            
                   ${
                     servicePermission === 'POS_TRANSACTIONS' ||
                     servicePermission === 'BOTH'
                       ? getAdminPosReportHtml(shop)
                       : ''
                   }
                   ${
                     servicePermission === 'INVENTORY_SALES' ||
                     servicePermission === 'BOTH'
                       ? getAdminSalesReportHtml(shop)
                       : ''
                   }
                        </div>
    `;

    container.appendChild(accordion);
    container.dataset.shopId;

    // Admin POS Filter Logic Start

    if (
      servicePermission === 'POS_TRANSACTIONS' ||
      servicePermission === 'BOTH'
    ) {
      // Admin POS Filter Logic

      setupPosFilters({
        shopId: shop.id,
        shopPageTracker,
        currentFiltersByShop,
        limit,
        renderPosTableFn: renderPosTable,
      });
    }
    // Admin POS Filter Logic End

    if (
      servicePermission === 'INVENTORY_SALES' ||
      servicePermission === 'BOTH'
    ) {
      // Admin Sales Filter Logic

      setupSalesFilters({
        shopId: shop.id,
        shopPageTracker,
        currentSalesFiltersByShop,
        currentDailySalesFiltersByShop,
        currentMonthlySalesFiltersByShop,
        limit,
        renderSalesTableFn: renderSalesTable,
        renderDailySummaryFn: renderDailySummary,
        renderMonthlySummaryFn: renderMonthlySummary,
      });
    }

    const filters = getFilters('admin', shop.id);
    const salesFilters = getSalesFilters('admin', shop.id);

    currentFiltersByShop[shop.id] = filters;
    currentSalesFiltersByShop[shop.id] = salesFilters;
  });

  container.addEventListener('click', async function (e) {
    //  console.log('Container was clicked');
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

    // POS Transactions
    if (
      servicePermission === 'POS_TRANSACTIONS' ||
      servicePermission === 'BOTH'
    ) {
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
    }

    // Sales Transactions
    if (
      servicePermission === 'INVENTORY_SALES' ||
      servicePermission === 'BOTH'
    ) {
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

        // Render Daily sales Summary
        const dailyFilters = getDailySummaryFilters('admin', shopId);
        currentDailySalesFiltersByShop[shopId] = dailyFilters;

        const { dailySummaryDate } = dailyFilters;

        await renderDailySummary(shopId, dailySummaryDate);

        // Render Monthly sales Summary
        const monthlyFilters = getMonthlySummaryFilters('admin', shopId);
        currentMonthlySalesFiltersByShop[shopId] = monthlyFilters;

        //  console.log(monthlyFilters);

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
          if (adminAutocompleteList)
            adminAutocompleteList.style.display = 'none';
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

            //   console.log(staffData);

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
      }
    }
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

  // POS Loadmore Button
  const loadMoreButton = document.getElementById('loadMoreButton_staff');
  // Sales loadmore Button
  const loadMoreSalesButton = document.getElementById(
    'loadMoreSalesButton_staff'
  );

  // POS Transactions
  if (
    servicePermission === 'POS_TRANSACTIONS' ||
    servicePermission === 'BOTH'
  ) {
    const staffPosReportDiv = document.querySelector('.staffPosReportDiv');
    staffPosReportDiv.style.display = 'block';

    // Pos Filer Logic
    document
      .getElementById('applyFiltersBtn_staff')
      ?.addEventListener('click', () => {
        const filters = getFilters('staff');
        renderStaffPosTable(1, pageSize, filters, 'staff');
      });

    document
      .getElementById('resetFiltersBtn_staff')
      ?.addEventListener('click', () => {
        const role = 'staff';
        resetFilters(role);
        const filters = getFilters(role);
        const tableSelector = '.posTableDisplay_staff tbody';
        renderStaffPosTable(1, pageSize, filters, 'staff');
      });

    loadMoreButton.style.display = 'none';

    loadMoreButton.addEventListener('click', () => {
      const role = 'staff';
      currentPage += 1;
      const filters = getFilters(role);

      //  const tableBodyId = '.posTableDisplay_staff tbody';

      renderStaffPosTable(currentPage, pageSize, filters, role);
    });

    async function renderStaffPosTable(
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

        if (filters.startDate)
          queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.status) queryParams.append('status', filters.status);

        const result = await getPosTransactions({
          shopId,
          page,
          limit: pageSize,
          filters,
        });

        console.log(result);

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

    renderStaffPosTable();
  }

  // Sales Transactions
  if (servicePermission === 'INVENTORY_SALES' || servicePermission === 'BOTH') {
    const staffSalesReportDiv = document.querySelector('.staffSalesReportDiv');

    staffSalesReportDiv.style.display = 'block';

    //Sales Filter logic
    document
      .getElementById('applySalesFiltersBtn_staff')
      ?.addEventListener('click', () => {
        const filters = getSalesFilters('staff');
        renderStaffSalesTable(1, pageSize, filters, 'staff');
        console.log('filters:', filters);
      });

    document
      .getElementById('resetSalesFiltersBtn_staff')
      ?.addEventListener('click', () => {
        const role = 'staff';
        resetSalesFilters(role);
        const filters = getSalesFilters(role);
        const tableSelector = '.posTableDisplay_staff tbody';
        renderStaffSalesTable(1, pageSize, filters, 'staff');
      });

    loadMoreSalesButton.style.display = 'none';

    loadMoreSalesButton.addEventListener('click', () => {
      const role = 'staff';
      currentPage += 1;
      const filters = getSalesFilters(role);

      //  const tableBodyId = '.posTableDisplay_staff tbody';

      renderStaffSalesTable(currentPage, pageSize, filters, role);
    });

    async function renderStaffSalesTable(
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

        console.log(result);

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

            const row = document.createElement('tr');
            row.classList.add('table-body-row');

            row.dataset.saleId = id; // Store sale ID for detail view
            row.innerHTML = `
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

    renderStaffSalesTable();
  }

  //   loadMoreButton.addEventListener('click', () => {
  //     currentPage += 1;
  //     renderStaffPosTable(currentPage, pageSize, currentFilters);
  //   });
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
