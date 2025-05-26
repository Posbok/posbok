import config from '../config';
import {
  addInventory,
  createProduct,
  createProductCategory,
  getProductInventory,
} from './apiServices/inventory/inventoryResources';

import { checkAndPromptCreateShop } from './apiServices/shop/shopResource';

import {
  clearFormInputs,
  generateBarcode,
  getAmountForSubmission,
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { addPosChargeForm } from './pos';
import { populateShopDropdown } from './staff';

const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require('./apiServices/product');
const {
  showToast,
  formatAmountWithCommas,
  setupModalCloseButtons,
  closeModal,
} = require('./script');

let isSubmitting = false;
const deleteProductButton = document.querySelector('.deleteProductButton');

// JS for Adding Products
const addProductName = document.getElementById('addProductName');
const addProductBoughtPrice = document.getElementById('addProductBoughtPrice');
const addProductSellingPrice = document.getElementById(
  'addProductSellingPrice'
);
const addProductQuantity = document.getElementById('addProductQuantity');

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

// const shopId = parsedUserData?.shopId || dummyShopId;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';

export function openAddCategoryModalBtn() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addProductCategoryContainer = document.querySelector('.addCategory');

  if (addProductCategoryContainer)
    addProductCategoryContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  addProductCategoryForm();
}

export function openAddProductModalBtn() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addProductContainer = document.querySelector('.addProduct');

  if (addProductContainer) addProductContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  createProductForm();
}

export function openUpdateProductButton() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateProductContainer = document.querySelector('.updateProduct');

  if (updateProductContainer) updateProductContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  addProductForm();
}

document.addEventListener('DOMContentLoaded', () => {
  // Setup for Opening Pos Charges Modal
  setupModalCloseButtons();

  document
    .querySelector('#openAddCategoryModalBtn')
    ?.addEventListener('click', openAddCategoryModalBtn);

  document
    .querySelector('#openAddProductModalBtn')
    ?.addEventListener('click', openAddProductModalBtn);

  document
    .querySelector('#openUpdateProductBtn')
    ?.addEventListener('click', openUpdateProductButton);
});

export function addProductCategoryForm() {
  const form = document.querySelector('.addCategoryModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const addCategoryName = document.querySelector('#addCategoryName').value;

      const addCategoryDescription = document.querySelector(
        '#addCategoryDescription'
      ).value;

      const addProductCategoryDetails = {
        name: addCategoryName,
        description: addCategoryDescription,
      };

      console.log('Add Category Details:', addProductCategoryDetails);

      const addCategorySubmitBtn = document.querySelector(
        '.addCategorySubmitBtn'
      );

      try {
        showBtnLoader(addCategorySubmitBtn);

        const data = await createProductCategory(addProductCategoryDetails);

        if (data) {
          hideBtnLoader(addCategorySubmitBtn);
          closeModal();
        }

        closeModal(); // close modal after success
      } catch (err) {
        console.error('Error Adding Product Category:', err.message);
        hideBtnLoader(addCategorySubmitBtn);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function populateCategoryTable(productCategoriesData) {
  const tbody = document.querySelector('.category-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  // Remove static rows and loading

  const categories = productCategoriesData.data;

  if (tbody) tbody.innerHTML = '';

  if (!categories.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="6" class="table-error-text">No Categories found.</td>
      `;
    if (tbody) tbody.appendChild(emptyRow);
    return;
  }

  categories.forEach((category, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    //  console.log('category', category);

    if (row)
      row.innerHTML = `
        <td class="py-1 categorySerialNumber">${index + 1}</td>
        <td class="py-1 categoryName">${category.name}</td>
         <td class="py-1 categoryDescription">${category.description}</td>

        <td class="py-1 action-buttons">
          <button class="hero-btn-outline editcategoryButton" data-category-id="${
            category.id
          }">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="hero-btn-outline deletecategoryButton" data-category-id="${
            category.id
          }">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

    if (tbody) tbody.appendChild(row);

    //  const deleteBtn = row.querySelector('.deleteShopButton');
    //  deleteBtn.addEventListener('click', async () => {
    //    const shopId = deleteBtn.dataset.shopId;
    //    await deleteShop(shopId);
    //  });

    //  const updateShopBtn = row.querySelector('.editShopButton');
    //  updateShopBtn?.addEventListener('click', async () => {
    //    showGlobalLoader();
    //    const shopId = updateShopBtn.dataset.shopId;

    //    const adminUpdateShopDataContainer = document.querySelector(
    //      '.adminUpdateShopData'
    //    );

    //    if (adminUpdateShopDataContainer) {
    //      // Store shopId in modal container for reference
    //      adminUpdateShopDataContainer.dataset.shopId = shopId;

    //      // Fetch Shop detail
    //      const shopDetail = await fetchShopDetail(shopId);

    //      //   console.log(shopDetail);

    //      // Call function to prefill modal inputs
    //      if (shopDetail?.data) {
    //        hideGlobalLoader();
    //        openUpdateShopModal(); // Show modal after data is ready
    //        setupUpdateShopForm(shopDetail.data);
    //      } else {
    //        hideGlobalLoader();
    //        showToast('fail', '❌ Failed to fetch shop details.');
    //      }
    //    }
    //  });
  });
}

export function populateGoodsShopDropdown(shopList = []) {
  const inventoryShopDropdown = document.getElementById(
    'inventoryShopDropdown'
  );
  if (!inventoryShopDropdown) return;

  inventoryShopDropdown.innerHTML = `<option value="">Select a shop</option>`;

  shopList.forEach((shop) => {
    const option = document.createElement('option');
    option.value = shop.id;
    option.textContent = `${shop.shop_name} - ${shop.location}`;
    inventoryShopDropdown.appendChild(option);
  });
}

export function populateCategoriesDropdown(categoriesData = []) {
  const categoryList = categoriesData.data;

  //   console.log('categoryList', categoryList);
  const addProductCategoryDropdown =
    document.getElementById('addProductCategory');
  const updateProductCategoryDropdown = document.getElementById(
    'updateProductCategory'
  );
  if (!addProductCategoryDropdown || !updateProductCategoryDropdown) return;

  // Clear existing options except the default
  addProductCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;
  updateProductCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;

  categoryList.forEach((category) => {
    const option1 = document.createElement('option');
    option1.value = category.id;
    option1.textContent = `${category.name}`;
    if (addProductCategoryDropdown)
      addProductCategoryDropdown.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = category.id;
    option2.textContent = `${category.category_name} - ${category.location}`;
    if (updateProductCategoryDropdown)
      updateProductCategoryDropdown.appendChild(option2);
  });
}

export function createProductForm() {
  const form = document.querySelector('.addProductModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const inventoryShopDropdown = document.querySelector(
        '#inventoryShopDropdown'
      ).value;
      const addProductCategory = document.querySelector(
        '#addProductCategory'
      ).value;
      const addProductName = document.querySelector('#addProductName').value;

      const addProductDescription = document.querySelector(
        '#addProductDescription'
      ).value;

      const addProductBoughtPrice = document.querySelector(
        '#addProductBoughtPrice'
      ).value;

      const addProductSellingPrice = document.querySelector(
        '#addProductSellingPrice'
      ).value;

      const addProductQuantity = document.querySelector(
        '#addProductQuantity'
      ).value;

      const addProductDetails = {
        categoryId: addProductCategory,
        name: addProductName,
        description: addProductDescription,
        purchasePrice: Number(getAmountForSubmission(addProductBoughtPrice)),
        sellingPrice: Number(getAmountForSubmission(addProductSellingPrice)),
        barcode: generateBarcode(),
      };

      const addInventoryDetails = {
        quantity: Number(addProductQuantity),
        productId: Number(addProductQuantity),
      };

      console.log('Adding Products with:', addProductDetails);

      const addProductModalBtn = document.querySelector('.addProductModalBtn');

      try {
        showBtnLoader(addProductModalBtn);
        const productData = await createProduct(addProductDetails);

        if (!productData) {
          showToast('fail', productData.message);
          return;
        }

        const productId = productData?.data.id;
        const shopId = Number(inventoryShopDropdown);

        const addInventoryDetails = {
          quantity: Number(addProductQuantity),
          productId: Number(productId),
        };

        console.log('Adding Products with:', addProductDetails);

        try {
          const inventoryData = await addInventory(addInventoryDetails, shopId);

          if (inventoryData) {
            showToast('success', `✅ ${inventoryData.message}`);
            closeModal();
            clearFormInputs();
          }
        } catch (inventoryDataErr) {
          showToast(
            'fail',
            `❎ ${inventoryDataErr.message || 'Failed to Add inventory'}`
          );
          console.error(
            'Error During Inventory Adding:',
            inventoryDataErr.message
          );
        }
        hideBtnLoader(addProductModalBtn);
        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(addProductModalBtn);

        console.error('Error Creating product:', err);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

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

// export async function populateProductInventoryTable(productInventoryData) {
// if (userData && isAdmin) {
document.addEventListener('DOMContentLoaded', async () => {
  //   console.log(productInventoryData);
  if (isAdmin) {
    showGlobalLoader();
    let enrichedShopData = [];
    const currentFiltersByShop = {};

    const container = document.getElementById('accordionProductInventory');
    const { enrichedShopData: loadedShops } = await checkAndPromptCreateShop();
    hideGlobalLoader();
    enrichedShopData = loadedShops;

    console.log('container', container);
    console.log('enrichedShopData', enrichedShopData);

    if (enrichedShopData.length === 0) {
      container.innerHTML = `<h1 class="heading-text">No shop to Available for Reports Display</h1>`;
    }

    enrichedShopData.forEach((shop, index) => {
      //  console.log(shop.length);
      const accordion = document.createElement('section');
      //  shopPageTracker[shop.id] = 1;

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
                    <div class="reports card">
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
                                 <label for="endDateFilter_admin_${shop.id}">Start Date:</label>
   
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
   
                                   <tbody  id="pos-tbody">
   
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
   
                           <div class="double-input">
                              <div class="amount-summary">
                                 <label for="AmountinMachine_admin_${shop.id}">AMOUNT IN MACHINE</label>
   
                                 <div class="naira-input-container">
                                    <input id="AmountinMachine_admin_${shop.id}" type="text" name="AmountinMachine_admin_${shop.id}"
                                       oninput="this.value=this.value.replace(/[^0-9]/g,'')" value="Unavailable" disabled>
                                    <span class="naira">&#x20A6;</span>
                                 </div>
                              </div>
   
                              <div class="amount-summary">
                                 <label for="cashAvailable_admin_${shop.id}">CASH AVAILABLE</label>
   
                                 <div class="naira-input-container">
                                    <input id="cashAvailable_admin_${shop.id}" type="text" name="cashAvailable_admin_${shop.id}"
                                       oninput="this.value=this.value.replace(/[^0-9]/g,'')" value="Unavailable" disabled>
                                    <span class="naira">&#x20A6;</span>
                                 </div>
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
            //  page: currentPage,
            //  limit,
            //  filters,
            //  shopId,
            //  tableBodyId: `#pos-tbody-${shop.id}`,
            //  loadMoreButton: document.getElementById(
            //    `loadMoreButton_admin_${shop.id}`
            //  ),
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
        // const nextPage = ++shopPageTracker[shop.id];
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

      renderPosTable({
        // page: currentPage,
        // limit,
        // filters,
        // shopId,
        // tableBodyId: `.posTableDisplay_admin_${shopId} tbody`,
        // loadMoreButton: document.getElementById(`loadMoreButton_admin_${shopId}`),
      });
    });

    async function renderPosTable({
      page = 1,
      //  limit = pageSize,
      filters,
      shopId,
      tableBodyId,
      loadMoreButton,
    }) {
      const posTableBody = document.querySelector(`#pos-tbody`);

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

        // loadMoreButton.style.display = 'none';

        // Build query with filters
        const queryParams = new URLSearchParams({
          shopId: shopId,
          page,
          //   limit,
        });

        // console.log('queryParams', queryParams);

        // if (filters.startDate) queryParams.append('startDate', filters.startDate);
        // if (filters.endDate) queryParams.append('endDate', filters.endDate);
        // if (filters.type) queryParams.append('type', filters.type);
        // if (filters.status) queryParams.append('status', filters.status);

        const result = await getProductInventory({
          shopId,
          page,
          //   limit: pageSize,
          filters,
        });

        // console.log(result);

        if (!result) throw new Error(result.message || 'Failed to fetch');

        const posTransactions = result.data.transactions;
        totalPages = result.data.totalPages;
        totalItems = result.data.totalItems;
        // currentPage = result.data.currentPage;

        // Only reset array if starting from page 1
        if (page === 1) {
          allPosTransactions = [];
        }

        //  if (posTransactions.length === 0 && page === 1) {
        //    posTableBody.innerHTML =
        //      '<tr><td colspan="11" class="table-no-data">No transactions found.</td></tr>';
        //    return;
        //  }

        if (posTransactions.length === 0) {
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

        // // Handle Load More button visibility
        // if (currentPage >= totalPages) {
        //   loadMoreButton.style.display = 'none';
        // } else {
        //   loadMoreButton.style.display = 'block';
        // }
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
      //  shopPageTracker[shopId] = 1;

      await renderPosTable({
        // page: shopPageTracker[shopId],
        // limit,
        // filters,
        // shopId,
        // tableBodyId: `#pos-tbody-${shopId}`,
        // loadMoreButton: document.getElementById(`loadMoreButton_admin_${shopId}`),
      });

      // Toggle accordion
      //  section.classList.toggle('active');
      //  if (section.classList.contains('active')) {
      //    icon.style.transform = 'rotate(180deg)';
      //  } else {
      //    icon.style.transform = 'rotate(0deg)';
      //  }
    });
  }
});

// export function populateProductInventoryTable(productInventoryData) {
//   const tbody = document.querySelector('.category-table tbody');
//   const loadingRow = document.querySelector('.loading-row');

//   // Remove static rows and loading

//   const productInventory = productInventoryData.data;

//   if (tbody) tbody.innerHTML = '';

//   if (!productInventory.length) {
//     const emptyRow = document.createElement('tr');
//     emptyRow.innerHTML = `
//         <td colspan="6" class="table-error-text">No Products found.</td>
//       `;
//     if (tbody) tbody.appendChild(emptyRow);
//     return;
//   }

//   productInventory.forEach((product, index) => {
//     const row = document.createElement('tr');
//     row.classList.add('table-body-row');

//     //  console.log('product', product);

//     if (row)
//       row.innerHTML = `
//         <td class="py-1 productSerialNumber">${index + 1}</td>
//         <td class="py-1 productName">${product.name}</td>
//          <td class="py-1 productDescription">${product.description}</td>

//         <td class="py-1 action-buttons">
//           <button class="hero-btn-outline editproductButton" data-product-id="${
//             product.id
//           }">
//             <i class="fa-solid fa-pen-to-square"></i>
//           </button>
//           <button class="hero-btn-outline deleteproductButton" data-product-id="${
//             product.id
//           }">
//             <i class="fa-solid fa-trash-can"></i>
//           </button>
//         </td>
//       `;

//     if (tbody) tbody.appendChild(row);

//     //  const deleteBtn = row.querySelector('.deleteShopButton');
//     //  deleteBtn.addEventListener('click', async () => {
//     //    const shopId = deleteBtn.dataset.shopId;
//     //    await deleteShop(shopId);
//     //  });

//     //  const updateShopBtn = row.querySelector('.editShopButton');
//     //  updateShopBtn?.addEventListener('click', async () => {
//     //    showGlobalLoader();
//     //    const shopId = updateShopBtn.dataset.shopId;

//     //    const adminUpdateShopDataContainer = document.querySelector(
//     //      '.adminUpdateShopData'
//     //    );

//     //    if (adminUpdateShopDataContainer) {
//     //      // Store shopId in modal container for reference
//     //      adminUpdateShopDataContainer.dataset.shopId = shopId;

//     //      // Fetch Shop detail
//     //      const shopDetail = await fetchShopDetail(shopId);

//     //      //   console.log(shopDetail);

//     //      // Call function to prefill modal inputs
//     //      if (shopDetail?.data) {
//     //        hideGlobalLoader();
//     //        openUpdateShopModal(); // Show modal after data is ready
//     //        setupUpdateShopForm(shopDetail.data);
//     //      } else {
//     //        hideGlobalLoader();
//     //        showToast('fail', '❌ Failed to fetch shop details.');
//     //      }
//     //    }
//     //  });
//   });
// }
