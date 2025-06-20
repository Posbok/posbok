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

const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

// const shopId = parsedUserData?.shopId || dummyShopId;

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

  const container = document.getElementById('accordionShops');
  //   console.log('report', container);
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
        console.log('filters:', filters);
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
      console.log('loading', loadingRow);
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

  async function renderSalesTable({
    page = 1,
    limit,
    filters,
    shopId,
    tableBodyId,
    loadMoreButton,
  }) {
    console.log('🧪 Applied Filters:', filters);

    const salesTableBody = document.querySelector(tableBodyId);
    console.log(salesTableBody);

    if (!salesTableBody) {
      console.error('Error: Table body not found');
      return;
    }

    try {
      let loadingRow = document.querySelector('.loading-row');
      console.log(loadingRow);
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

    console.log('shopPosTransactiionSection', shopPosTransactiionSection);

    console.log('shopSalesTransactiionSection', shopSalesTransactiionSection);

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

    const searchSellProdutItem = document.getElementById(
      isAdmin ? 'adminSearchSellProdutItem' : 'searchSellProdutItem'
    );

    //  const sellProductCategorySection = document.querySelector(
    //    isAdmin
    //      ? '.adminSellProductCategory-section'
    //      : '.sellProductCategory-section'
    //  );

    const sellProductCategorySection = document.querySelector(
      '.adminSellProductCategory-section'
    );

    console.log(sellProductCategorySection);

    const sellProductName = document.querySelector(
      isAdmin ? '.adminSellProductName' : '.sellProductName'
    );
    const productInput = document.getElementById(
      isAdmin ? `adminProductInput_${shopId}` : 'productInput'
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

    async function fetchAllProducts(shopId) {
      let products = [];

      //   console.log('Fetching products for shop:', shopId);

      try {
        const productInventoryData = await getProductInventory(shopId); // Fetch products

        if (productInventoryData) {
          // console.log(`Fetching product inventory:`, productInventoryData.data);
          products = products.concat(productInventoryData.data); // Add data to all products array
        }

        //  console.log('Products', products);
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log(products);
      return products;
    }

    async function fetchAllCategories(shopId) {
      let categories = [];

      try {
        const productCategoryData = await getProductCategories(shopId); // Fetch Categories

        if (productCategoryData) {
          // console.log(`Fetching product categories:`, productCategoryData.data);
          categories = categories.concat(productCategoryData.data); // Add data to all Categories array
        }

        //  console.log('Categories', categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log(categories);
      return categories;
    }

    // Re-fetch products and categories
    displayAllProducts();
    displayAllCategories();

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

    async function displayAllProducts() {
      try {
        showGlobalLoader();

        allProducts = await fetchAllProducts(shopId); // Fetch and store all products

        //  console.log(`Total products fetched:`, allProducts);

        updateAutocompleteList(allProducts); // Populate the autocomplete dropdown with all products

        // Autocomplete filter on input
        searchSellProdutItem.addEventListener('input', function () {
          const inputValue = searchSellProdutItem.value.toLowerCase();

          if (inputValue.value === '') {
            sellProductName.style.display = 'none';
            autocompleteList.style.display = 'none';
            return;
          } else if (inputValue.length > 0) {
            sellProductName.style.display = 'block';
            autocompleteList.style.display = 'block';

            let filteredProducts = allProducts;

            // Filter by selected category (if any)
            if (activeCategoryId !== null) {
              filteredProducts = filteredProducts.filter(
                (product) =>
                  product.Product.ProductCategory.id === activeCategoryId
              );
            }

            // Further filter by input value
            filteredProducts = filteredProducts.filter(
              (product) =>
                product.Product.name.toLowerCase().includes(inputValue) ||
                product.Product.description.toLowerCase().includes(inputValue)
            );

            updateAutocompleteList(filteredProducts);

            return;
          } else {
            sellProductName.style.display = 'none';
            autocompleteList.style.display = 'none';
            return;
          }
        });

        //  searchSellProdutItem.addEventListener('click', function () {
        //    autocompleteList.style.display = 'block';
        //  });
      } catch (error) {
        console.error('Error displaying products:', error);
      } finally {
        hideGlobalLoader();
      }
    }

    async function displayAllCategories() {
      try {
        showGlobalLoader();

        // Clear old category buttons
        sellProductCategorySection.innerHTML = '';
        activeCategoryId = null; // Reset category filter

        allCategories = await fetchAllCategories(); // Fetch and store all Categories

        //  console.log(`Total Categories fetched:`, allCategories);

        const allBtn = document.createElement('button');
        allBtn.classList.add('adminSellProductCategoryBtn');
        allBtn.type = 'button';
        allBtn.textContent = 'All';
        allBtn.dataset.categoryId = 'all';

        allBtn.addEventListener('click', function () {
          document
            .querySelectorAll('.adminSellProductCategoryBtn')
            .forEach((btn) => {
              btn.classList.remove('active');
            });

          allBtn.classList.add('active');
          activeCategoryId = null; // Reset filter to all

          sellProductName.style.display = 'block';
          autocompleteList.style.display = 'block';

          let filteredProducts = allProducts;

          const inputValue = searchSellProdutItem.value.toLowerCase().trim();
          if (inputValue.length > 0) {
            filteredProducts = filteredProducts.filter(
              (product) =>
                product.Product.name.toLowerCase().includes(inputValue) ||
                product.Product.description.toLowerCase().includes(inputValue)
            );
          }

          updateAutocompleteList(filteredProducts);
        });

        sellProductCategorySection.appendChild(allBtn);

        allCategories.forEach((category) => {
          const categoryBtn = document.createElement('button');
          categoryBtn.classList.add('adminSellProductCategoryBtn');
          categoryBtn.type = 'button';
          categoryBtn.textContent = category.name;
          categoryBtn.dataset.categoryId = category.id;

          categoryBtn.addEventListener('click', function () {
            // Remove active class from all other buttons
            document
              .querySelectorAll('.adminSellProductCategoryBtn')
              .forEach((btn) => {
                btn.classList.remove('active');
              });

            // Toggle current button as active
            categoryBtn.classList.add('active');
            activeCategoryId = parseInt(categoryBtn.dataset.categoryId);

            sellProductName.style.display = 'block';
            autocompleteList.style.display = 'block';

            const categoryId = parseInt(categoryBtn.dataset.categoryId);

            let filteredProducts = allProducts.filter(
              //  (product) => product.Product.ProductCategory.id === categoryId
              (product) =>
                product.Product.ProductCategory.id === activeCategoryId
            );

            const inputValue = searchSellProdutItem.value.toLowerCase().trim();

            if (inputValue.length > 0) {
              filteredProducts = filteredProducts.filter(
                (product) =>
                  product.Product.name.toLowerCase().includes(inputValue) ||
                  product.Product.description.toLowerCase().includes(inputValue)
              );
            }

            updateAutocompleteList(filteredProducts);
          });

          sellProductCategorySection.appendChild(categoryBtn);
        });
      } catch (error) {
        console.error('Error displaying products:', error);
      } finally {
        hideGlobalLoader();
      }
    }

    // Update the autocomplete list with provided products
    function updateAutocompleteList(products) {
      autocompleteList.innerHTML = '';

      if (products.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'Item Not Found';
        listItem.classList.add('autocomplete-list-item');
        autocompleteList.appendChild(listItem);
      } else {
        products.forEach((product) => {
          // console.log(product);
          const listItem = document.createElement('li');
          // listItem.textContent = product.Product.name;
          // listItem.classList.add('autocomplete-list-item');
          listItem.innerHTML = `         
         <li class="autocomplete-list-item">
            <p>${product.Product.name}</p>
            <small>${product.Product.description}</span>
         </li>
         `;

          listItem.addEventListener('click', async function () {
            selectedProduct = product.Product; // Store selected product to later get the product ID

            // console.log(selectedProduct);

            productInput.value = product.Product.name;

            autocompleteList.style.display = 'none';

            const productSalesResponse = await getSalesByProduct(
              selectedProduct.id
            );

            if (!productSalesResponse) {
              hideGlobalLoader();
              showToast(
                'fail',
                `❎ ${
                  productSalesResponse.message ||
                  'Error Getting Sales By Product'
                }`
              );
              return;
            }

            const productSalesData = productSalesResponse.data;
            const productSalesList = productSalesData.sales;
            const productSalesSummary = productSalesData.summary;

            updateProductData(productSalesList, productSalesSummary);
            console.log(productSalesData);
          });
          autocompleteList.appendChild(listItem);
        });
      }
    }

    await fetchAllCategories(shopId);
    await fetchAllProducts(shopId);

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

    const dummyHourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 5),
      amount: Math.floor(Math.random() * 1000),
    }));

    const dailyOptions = {
      //   chart: {
      //     type: 'line',
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
            reset: true, // ✅ Only this will show
          },
        },
        zoom: {
          enabled: true, // Must be true for reset to work
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
      },
      title: {
        text: 'Daily Summary of Sales',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#205329',
        },
      },
      //   gradientToColors: ['#ec1a23'],
      //   colors: ['#205329', '#ec1a23'],
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
      //   fill: {
      //     type: 'gradient',
      //     gradient: {
      //       shade: 'dark',
      //       type: 'horizontal',
      //       shadeIntensity: 0.5,
      //       gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
      //       inverseColors: true,
      //       opacityFrom: 1,
      //       opacityTo: 1,
      //       stops: [0, 50, 100],
      //       colorStops: [],
      //     },
      //   },
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
    const dummyMonthlyData = Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      count: Math.floor(Math.random() * 10),
      amount: Math.floor(Math.random() * 10000),
    }));

    const options = {
      //   chart: {
      //     type: 'line',
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
            reset: true, // ✅ Only this will show
          },
        },
        zoom: {
          enabled: true, // Must be true for reset to work
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
      },
      title: {
        text: 'Daily Summary of Sales',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#205329',
        },
      },
      //   gradientToColors: ['#ec1a23'],
      //   colors: ['#205329', '#ec1a23'],
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

    const chart = new ApexCharts(
      document.querySelector('#monthlyChart'),
      options
    );
    chart.render();

    //  Staff Overview / Staff Performance

    async function loadStaffDropdown() {
      try {
        showGlobalLoader();
        const staffData = await checkAndPromptCreateStaff();
        console.log('Staff Data', staffData);
        const staffDataList = staffData?.data.users;
        populateBusinessStaffDropdown(staffDataList, 'reportStaffDropdown');
        hideGlobalLoader();
      } catch (err) {
        hideGlobalLoader();
        console.error('Failed to load dropdown:', err.message);
      }
    }

    loadStaffDropdown();

    const reportStaffDropdown = document.getElementById('reportStaffDropdown');
    reportStaffDropdown.addEventListener('change', async () => {
      console.log(reportStaffDropdown.value);

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

      console.log(staffSalesDetails);

      updateStaffSalesData(staffSalesList, staffSalesSummary);
    });

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

    //        shopSalesTransactiionSection.dataset.loaded = 'true';
    //  }
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

      const adminDepositposCapitalShopDropdown = document.querySelector(
        '#adminDepositposCapitalShopDropdown'
      ).value;

      const posDepositAmount = isAdmin
        ? document.querySelector('#adminPosCapitalAmount')
        : document.querySelector('#posCapitalAmount');

      const posCapitalDetails = {
        shopId: isAdmin ? adminDepositposCapitalShopDropdown : shopId,
        amount: Number(getAmountForSubmission(posDepositAmount)),
      };

      // console.log('Sending POS Capital with:', posCapitalDetails);
      const submitPosCapital = document.querySelector('.submitPosCapital');

      try {
        showBtnLoader(submitPosCapital);
        showGlobalLoader();
        const addPosCapitalData = await addPosCapital(posCapitalDetails);

        if (addPosCapitalData) {
          //  initAccountOverview();
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
// Update Product Sales Report
function updateProductData(productSalesList, productSalesSummary) {
  const totalQty = document.getElementById('totalQty');
  const totalRev = document.getElementById('totalRev');
  const totalCostContainer = document.getElementById('totalCost');
  const totalProfitContainer = document.getElementById('totalProfit');
  const tableBody = document.querySelector('#productSalesTable tbody');

  if (!productSalesSummary) {
    console.error('productSalesSummary is undefined:', productSalesSummary);
    return;
  }

  // console.log(productSalesList);
  // console.log(productSalesSummary);
  const {
    productName,
    totalQuantitySold,
    totalRevenue,
    totalCost,
    totalProfit,
  } = productSalesSummary;

  totalQty.textContent = totalQuantitySold;
  totalRev.textContent = `₦${formatAmountWithCommas(totalRevenue)}`;
  totalCostContainer.textContent = `₦${formatAmountWithCommas(totalCost)}`;
  totalProfitContainer.textContent = `₦${formatAmountWithCommas(totalProfit)}`;

  if (tableBody) tableBody.innerHTML = '';

  console.log(!productSalesList.length);
  console.log(productSalesList.length);

  if (!productSalesList.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="11" class="table-error-text">No Sales on this Product.</td>
      `;
    if (tableBody) tableBody.appendChild(emptyRow);
    return;
  }

  productSalesList.forEach((sale, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    console.log('sale', sale);

    const { id, quantity, unit_price, selling_price, business_day } = sale;

    const staffName = `${sale.Sale.Account.first_name} - ${sale.Sale.Account._name} `;
    const shopName = sale.Sale.Shop.shop_name;
    const customerName = sale.Sale.customer_name;
    const customerPhone = sale.Sale.customer_phone;
    const totalAmount = sale.Sale.total_amount;
    const amountPaid = sale.Sale.amount_paid;
    const balance = sale.Sale.balance;

    row.dataset.saleId = id;
    if (row)
      row.innerHTML = `
      <tr  class="table-body-row">
        <td  class="py-1">${index + 1}</td>
        <td  class="py-1">${business_day}</td>
        <td  class="py-1">${shopName}</td>
        <td  class="py-1">${staffName}</td>
        <td  class="py-1">${customerName}</td>
        <td  class="py-1">${quantity}</td>
        <td class="py-1">₦${formatAmountWithCommas(unit_price)}</td>
        <td class="py-1">₦${formatAmountWithCommas(selling_price)}</td>
        <td class="py-1">₦${formatAmountWithCommas(totalAmount)}</td>
        <td class="py-1">₦${formatAmountWithCommas(amountPaid)}</td>
        <td class="py-1">₦${formatAmountWithCommas(balance)}</td>
               <td class="py-1 soldItemDetailReport" data-sale-id="${id}"><i class="fa fa-eye"></i></td>
      </tr>
    `;

    row.addEventListener('click', async (e) => {
      updateSalesReceipt(e, row);
      console.log('Row Clicked');
    });

    if (tableBody) tableBody.appendChild(row);
  });
}

// Update Staff Sales Report
function updateStaffSalesData(staffSalesList, staffSalesSummary) {
  const staffTotalSale = document.getElementById('staffTotal-sales');
  const staffTotalAmount = document.getElementById('staffTotal-amount');
  const staffTotalPaid = document.getElementById('staffTotal-paid');
  const staffTotalBalance = document.getElementById('staffTotal-balance');

  const tableBody = document.querySelector('#staffSalesTable tbody');

  console.log(staffSalesList);
  console.log(staffSalesSummary);

  if (!staffSalesSummary || !staffSalesList) {
    console.error('staffSalesSummary/staffSalesList is undefined:');
    return;
  }

  const { totalSales, totalAmount, totalPaid, totalBalance } =
    staffSalesSummary;

  staffTotalSale.textContent = totalSales;
  staffTotalAmount.textContent = `₦${formatAmountWithCommas(totalAmount)}`;
  staffTotalPaid.textContent = `₦${formatAmountWithCommas(totalPaid)}`;
  staffTotalBalance.textContent = `₦${formatAmountWithCommas(totalBalance)}`;

  if (tableBody) tableBody.innerHTML = '';

  console.log(!staffSalesList.length);
  console.log(staffSalesList.length);

  if (!staffSalesList.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="11" class="table-error-text">No Sales for this Staff.</td>
      `;
    if (tableBody) tableBody.appendChild(emptyRow);
    return;
  }

  staffSalesList.forEach((sale, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');
    row.dataset.saleId = sale.id;

    console.log('sale', sale);

    const {
      id,
      business_day,
      customer_name,
      total_amount,
      amount_paid,
      balance,
      status,
    } = sale;

    const shopName = sale.Shop.shop_name;
    const salesItems = sale.SalesItems;

    if (row)
      row.innerHTML = `
      <tr  class="table-body-row">
        <td  class="py-1">${index + 1}</td>
        <td  class="py-1">${business_day}</td>
        <td  class="py-1">${shopName}</td>
        <td  class="py-1">${customer_name}</td>
        <td class="py-1">₦${formatAmountWithCommas(total_amount)}</td>
        <td class="py-1">₦${formatAmountWithCommas(amount_paid)}</td>
        <td class="py-1">₦${formatAmountWithCommas(balance)}</td>
        <td class="py-1">${formatSaleStatus(status)}</td>
        <td class="py-1 soldItemDetailReport" data-sale-id="${id}"><i class="fa fa-eye"></i></td>
      </tr>
    `;

    row.addEventListener('click', async (e) => {
      updateSalesReceipt(e, row);
      console.log('Row Clicked');
    });

    if (tableBody) tableBody.appendChild(row);
  });
}

// Display individual Sales Report

async function updateSalesReceipt(e, row) {
  e.preventDefault();
  showGlobalLoader();
  // Finally open the modal
  openSaleDetailsModal();
  const saleId = row.dataset.saleId;
  console.log(`Open details for Sale ID: ${saleId}`);

  // Get Sales by ID
  try {
    showGlobalLoader();
    const saleDetails = await getSaleById(saleId);
    const shopDetails = JSON.parse(localStorage.getItem(shopKey)) || [];

    console.log('shopDetails', shopDetails);
    console.log('saleDetails', saleDetails);

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
      shopDetails?.location || 'N/A';

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
    const itemsTableBody = document.querySelector('.itemsTable tbody');
    itemsTableBody.innerHTML = ''; // clear previous rows

    SaleItems.forEach((item, index) => {
      const itemRow = document.createElement('tr');
      itemRow.classList.add('table-body-row');
      itemRow.innerHTML = `
             <td class="py-1">${item.Product.name}</td>
                           <td class="py-1">${item.quantity}</td>
                           <td class="py-1">₦${formatAmountWithCommas(
                             item.unit_price
                           )}</td>
                           <td class="py-1">${formatAmountWithCommas(
                             item.selling_price
                           )}</td>
             
                     `;
      itemsTableBody.appendChild(itemRow);
    });

    // Print & Download

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

    const printReceiptBtn = document.querySelector('.printReceiptBtn');

    printReceiptBtn.addEventListener('click', () => {
      showBtnLoader(printReceiptBtn);
      printReceiptBtn.disabled = true; // Disable the button

      const receiptContent = document.querySelector('.pdfHere').innerHTML;

      const printWindow = window.open('', '', 'width=300,height=500');
      printWindow?.document.write(`
                   <html>
                       <head>
                           <title>Print Receipt</title>
                           <style>
                               body { font-family: monospace; width: 58mm; font-size: 8px; padding: 5px; }
                               .center { text-align: center; }
                               .bold { font-weight: bold; }
                               .line { border-top: 1px dashed #000; margin: 4px 0; }
                               table { width: 100%; font-size: 12px; border-collapse: collapse; }
                               td { padding: 2px 5px; }
                               .footer { text-align: center; margin-top: 10px; }
                           </style>
                       </head>
                       <body onload="window.print()">
                           ${receiptContent}
                           <script>
                               window.onafterprint = () => {
                                   window.close();
                               };
                           </script>
                       </body>
                   </html>
               `);

      printWindow?.document.close();
      printWindow?.focus();

      const checkClosedInterval = setInterval(() => {
        if (printWindow?.closed) {
          clearInterval(checkClosedInterval);
          hideBtnLoader(printReceiptBtn);
          printReceiptBtn.disabled = false; // Re-enable the button
        }
      }, 500);
    });

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

      // console.log(opt);
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
  }
}

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
      console.log('filters:', filters);
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
            console.log(`Open details for Sale ID: ${saleId}`);

            // Get Sales by ID
            try {
              showGlobalLoader();
              const saleDetails = await getSaleById(saleId);
              const shopDetails =
                JSON.parse(localStorage.getItem(shopKey)) || [];

              console.log('shopDetails', shopDetails);
              console.log('saleDetails', saleDetails);

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
                shopDetails?.location || 'N/A';

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
                             item.unit_price
                           )}</td>
                           <td class="py-1">${formatAmountWithCommas(
                             item.selling_price
                           )}</td>
             
                     `;
                itemsTableBody.appendChild(itemRow);
              });

              // Print & Download

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

              printReceiptBtn.addEventListener('click', () => {
                showBtnLoader(printReceiptBtn);
                printReceiptBtn.disabled = true; // Disable the button

                const receiptContent =
                  document.querySelector('.pdfHere').innerHTML;

                const printWindow = window.open('', '', 'width=300,height=500');
                printWindow.document.write(`
                   <html>
                       <head>
                           <title>Print Receipt</title>
                           <style>
                               body { font-family: monospace; width: 58mm; font-size: 8px; padding: 5px; }
                               .center { text-align: center; }
                               .bold { font-weight: bold; }
                               .line { border-top: 1px dashed #000; margin: 4px 0; }
                               table { width: 100%; font-size: 12px; border-collapse: collapse; }
                               td { padding: 2px 5px; }
                               .footer { text-align: center; margin-top: 10px; }
                           </style>
                       </head>
                       <body onload="window.print()">
                           ${receiptContent}
                           <script>
                               window.onafterprint = () => {
                                   window.close();
                               };
                           </script>
                       </body>
                   </html>
               `);

                printWindow.document.close();
                printWindow.focus();

                const checkClosedInterval = setInterval(() => {
                  if (printWindow.closed) {
                    clearInterval(checkClosedInterval);
                    hideBtnLoader(printReceiptBtn);
                    printReceiptBtn.disabled = false; // Re-enable the button
                  }
                }, 500);
              });

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

                // console.log(opt);
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

// JS to give total Sold Amount
function updateTotalSalesAmounts(sales, totalSalesRow, date) {
  const totalSalesAmount = sales.reduce(
    (sum, item) => sum + Number(item.total_amount),
    0
  );

  const totalPaidAmount = sales.reduce(
    (sum, item) => sum + Number(item.amount_paid),
    0
  );

  const totalBalanceAmount = sales.reduce(
    (sum, item) => sum + Number(item.balance),
    0
  );

  totalSalesRow.innerHTML = `
     <td colspan="4" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>${date} SUMMARY:</strong>
     </td>
     <td colspan="2" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Sales Amount</strong> = ₦${formatAmountWithCommas(
         totalSalesAmount
       )}
     </td>
     <td colspan="2" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Paid Amount</strong> = ₦${formatAmountWithCommas(
         totalPaidAmount
       )}
     </td>
     <td colspan="2" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Balance Amount</strong> = ₦${formatAmountWithCommas(
         totalBalanceAmount
       )}
     </td>
        <td colspan="1" class="empty-header py-1 px-2 mt-1 mb-1">
       <strong></strong>
     </td>
     `;
}

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
