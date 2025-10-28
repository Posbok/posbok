import config from '../config.js';
import {
  formatDateTimeReadable,
  formatServicePermission,
} from './helper/helper.js';
import './script.js';
import { getAllBusinesses } from './superAdmin/superAdminResources.js';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const isSuperAdmin = parsedUserData?.accountType === 'SUPER_ADMIN';

if (isSuperAdmin) {
  const currentFilter = {};

  document.addEventListener('DOMContentLoaded', async () => {
    setupAllBusinessesFilters({
      currentFilter,
      populateAllBusinessesTableFn: populateAllBusinessesTable,
    });

    await populateAllBusinessesTable({ page: 1, filters: currentFilter });
  });
}

function getBusinessStatusFilters() {
  return {
    businessStatus:
      document.getElementById('businessStatusFilter')?.value || '',
  };
}

function setupAllBusinessesFilters({
  currentFilter,
  populateAllBusinessesTableFn,
}) {
  const applyBtn = document.getElementById(
    `applyBusinessStatusFilter_superAdmin`
  );
  const resetBtn = document.getElementById(
    `resetBusinessStatusFilter_superAdmin`
  );
  const loadMoreBtn = document.getElementById(`loadMoreButtonDiv_superAdmin`);

  if (!applyBtn || !resetBtn || !loadMoreBtn) return;

  // Apply Filters
  applyBtn.addEventListener('click', () => {
    const filters = getBusinessStatusFilters();
    Object.assign(currentFilter, filters);

    businessesArray = [];

    populateAllBusinessesTableFn({
      page: 1,
      filters,
      append: false,
    });
  });

  // Reset Filters
  resetBtn.addEventListener('click', () => {
    const role = 'admin';

    resetBusinessStatusFilter();
    const filters = getBusinessStatusFilters();
    Object.assign(currentFilter, filters);
    businessesArray = [];

    populateAllBusinessesTableFn({
      page: 1,
      // limit,
      filters,
      append: false,
    });
  });

  // Load More
  loadMoreBtn.addEventListener('click', () => {
    const filters = currentFilter || {};

    //  if (currentPage < totalPages)
    populateAllBusinessesTableFn({
      page: currentPage + 1,
      // limit,
      filters,
      append: true,
    });

    //  const emptyRow = document.createElement('tr');
    //  emptyRow.innerHTML = `
    //      <td colspan="10" class="table-error-text">Loading More Businesses...</td>
    //    `;

    //  const allBusinessesTableBody = document.querySelector(
    //    '.allBusinessesTableBody'
    //  );

    //  if (allBusinessesTableBody) {
    //    allBusinessesTableBody.innerHTML = '';

    //    allBusinessesTableBody.appendChild(emptyRow);
    //  }
  });
}

function resetBusinessStatusFilter() {
  document.getElementById(`businessStatusFilter`).value = '';
}

let businessesArray = [];
let currentPage = 1;
let totalPages = 1;

export async function populateAllBusinessesTable({
  page = 1,
  //   limit = pageSize,
  filters,
  append = false,
}) {
  //   console.log(filters);
  const allBusinessesTableBody = document.querySelector(
    '.allBusinessesTableBody'
  );
  const loadMoreButton = document.getElementById('loadMoreButton_superAdmin');

  if (!allBusinessesTableBody) {
    console.error('Error: Table body not found');
    return;
  }

  try {
    let loadingRow = document.querySelector('.loading-row');
    // console.log('loading', loadingRow);
    if (!loadingRow) {
      loadingRow = document.createElement('tr');
      loadingRow.className = 'loading-row';
      loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading All Businesses...</td>`;
      allBusinessesTableBody.appendChild(loadingRow);
    }

    loadMoreButton.style.display = 'none';

    const allBusinessesData = await getAllBusinesses({ page, filters });

    if (!allBusinessesData)
      throw new Error(
        allBusinessesData.message || 'Failed to fetch Business Data'
      );

    console.log('allBusinessesData', allBusinessesData);

    const allBusinesses = allBusinessesData.data;
    const hasNextPage = allBusinessesData.pagination.hasNextPage;
    const hasPreviousPage = allBusinessesData.pagination.hasPreviousPage;
    const itemsPerPage = allBusinessesData.pagination.itemsPerPage;
    const totalItems = allBusinessesData.pagination.totalItems;
    currentPage = allBusinessesData.pagination.currentPage;
    totalPages = allBusinessesData.pagination.totalPages;

    //  if (allBusinessesTableBody) allBusinessesTableBody.innerHTML = '';

    if (page === 1) {
      businessesArray = [];

      console.log('Page is in page 1');
    }

    if (!allBusinesses.length && currentPage === 1) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="10" class="table-error-text">No Businesses Found.</td>
      `;

      if (allBusinessesTableBody) allBusinessesTableBody.appendChild(emptyRow);
      return;
    }

    allBusinesses.forEach((business) => {
      if (!businessesArray.some((bus) => bus.id === business.id)) {
        businessesArray.push(business);
      }
    });

    // Clear the table body and render all accumulated Businesses
    if (!append) {
      allBusinessesTableBody.innerHTML = '';
    }
    allBusinessesTableBody.innerHTML = '';

    businessesArray.forEach((businessData, index) => {
      const {
        address,
        business_name,
        business_type,
        created_at,
        is_active,
        manager,
        phone_number,
        shop_count,
        staff_size,
        state_of_operation,
        version_preference,
      } = businessData;

      //  const {
      //    created_at: shopCreationDate,
      //    id: shopId,
      //    location: shopLocation,
      //    name: shopName,
      //  } = businessData.shop.forEach();

      const {
        days_remaining,
        last_updated,
        status: subscriptionStatus,
        subscription_end,
      } = businessData.subscription;

      //  console.log(first_name, last_name);

      const row = document.createElement('tr');
      row.classList.add('table-body-row');
      //  row.classList.add(
      //    item.quantity < 1
      //      ? 'finishedStockRow'
      //      : item.quantity >= 1 && item.quantity <= 10
      //      ? 'nearFinishedStockRow'
      //      : 'inStockRow'
      //  );

      if (row)
        row.innerHTML = `
        <td class="py-1 itemSerialNumber">${index + 1}</td>
        <td class="py-1 itemName">${business_name}</td>
         <td class="py-1 itemQuantity">${formatServicePermission(
           business_type
         )}</td>
         <td class="py-1 itemPurchasePrice">${subscriptionStatus}</td>
          <td class="py-1 itemActionType">${shop_count}</td>

          <td class="py-1 itemDatePurchases">${staff_size}</td>

          <td class="py-1 itemDatePurchases">${phone_number}</td>
          <td class="py-1 itemDatePurchases">${state_of_operation}</td>
          <td class="py-1 itemDatePurchases">${address}</td>
          <td class="py-1 itemDatePurchases">${formatDateTimeReadable(
            created_at
          )}</td>
          <td class="py-1 itemDatePurchases"></td>

      `;

      //     <td class="py-1 itemStatus">${
      //    item.quantity === 0
      //      ? (item.status = 'Out of Stock')
      //      : item.quantity >= 1 && item.quantity <= 10
      //      ? 'Low Stock'
      //      : 'In Stock'
      //  }</td>

      if (allBusinessesTableBody) allBusinessesTableBody.appendChild(row);
    });

    // Handle Load More button visibility
    if (currentPage >= totalPages && hasNextPage) {
      loadMoreButton.style.display = 'none';
    } else {
      loadMoreButton.style.display = 'block';
    }

    if (!hasNextPage) {
      loadMoreButton.style.display = 'none';
    }
  } catch (error) {
    console.error('Error rendering All Businesses:', error);
    allBusinessesTableBody.innerHTML =
      '<tr><td colspan="12" class="table-error-text">Error loading All Businesses.</td></tr>';
  }
}
