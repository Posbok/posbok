import config from '../config.js';
import {
  formatDateTimeReadable,
  formatServicePermission,
  hideGlobalLoader,
  showGlobalLoader,
} from './helper/helper.js';
import './script.js';
import { closeModal, showToast } from './script.js';
import {
  getAllBusinesses,
  getBusinessDetailById,
} from './superAdmin/superAdminResources.js';

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

// Open Sale Detail Modal
export function openBusinessDetailsModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const businessDetailsContainer = document.querySelector('.businessDetails');

  if (businessDetailsContainer)
    businessDetailsContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  saleDetailModalForm();
}

export function saleDetailModalForm() {
  const form = document.querySelector('.businessDetails');
  if (!form) return;
}

document.addEventListener('DOMContentLoaded', () => {
  bindRenderBusinessDetailById(); // Only once
});

export function bindRenderBusinessDetailById() {
  const form = document.querySelector('.businessDetails');

  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
    });
  }
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
        id: businessId,
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
      row.dataset.businessId = businessId;

      if (row)
        row.innerHTML = `
        <td class="py-1 businessSerialNumber">${index + 1}</td>
        <td class="py-1 businessName">${business_name}</td>
         <td class="py-1 businessType">${formatServicePermission(
           business_type
         )}</td>
         <td class="py-1 businessSubscriptionStatus">${subscriptionStatus}</td>
          <td class="py-1 businessShopCount">${shop_count}</td>

          <td class="py-1 businessStaffSize">${staff_size}</td>

          <td class="py-1 businessPhoneNumber">${phone_number}</td>
          <td class="py-1 businessStateofOperation">${state_of_operation}</td>
          <td class="py-1 businessaddress">${address}</td>
          <td class="py-1 businessDateCreated">${formatDateTimeReadable(
            created_at
          )}</td>

                               <td class="py-1 action-buttons">
                        <button class="hero-btn-outline openBusinessDetailsButton" data-business-id="${businessId}" title="View Business">
                           <i class="fa-solid fa-eye"></i>
                        </button>

                        <button class="hero-btn-outline activateBusinessButton" data-business-id="${businessId}" title="Activate Subscription">
                           <i class="fa-solid fa-toggle-on"></i>
                        </button>

                        <button class="hero-btn-outline restrictBusinessButton" data-business-id="${businessId}" title="Restrict Account">
                           <i class="fa-solid fa-user-lock"></i>
                        </button>

                        <button class="hero-btn-outline messageBusinessButton" data-business-id="${businessId}" title="Send Message">
                           <i class="fa-solid fa-paper-plane"></i>
                        </button>

                        <button class="hero-btn-outline deleteBusinessButton" data-business-id="${businessId}" title="Delete Business">
                           <i class="fa-solid fa-trash"></i>
                        </button>
                     </td>
         `;

      row.addEventListener('click', async (e) => {
        renderBusinessDetailsById(e, row, businessId);
      });

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

export async function renderBusinessDetailsById(e, row) {
  e.preventDefault();
  showGlobalLoader();

  const businessId = row.dataset.businessId;

  // Get business by ID
  try {
    showGlobalLoader();
    const businessDetails = await getBusinessDetailById(businessId);
    //  console.log('businessDetails when Row', businessDetails);

    if (!businessDetails || !businessDetails.data) {
      console.log('No businessDetails');
      showToast('error', '❎  Cannot get business Details');
      closeModal();
      return;
    }

    console.log(businessDetails.data);

    const {
      id,
      business_name,
      address,
      phone_number,
      state_of_operation,
      cac_reg_no,
      tax_id,
      nin,
      business_type,
      staff_size,
      version_preference,
      is_active,
      created_at,
      updated_at,
      manager,
      shop_count,
      shops,
    } = businessDetails.data;

    const {
      status: subscriptionStatus,
      days_remaining,
      subscription_start,
      subscription_end,
      activated_by,
      last_updated,
    } = businessDetails.data.subscription;

    // Populate Business Detail to UI

    // Finally open the modal
    openBusinessDetailsModal();

    // Sales Items - Middle Part Below
    const itemsTableBody = document.querySelector('.itemsTable tbody');
    itemsTableBody.innerHTML = ''; // clear previous rows

    document.getElementById('businessDetailName').textContent = business_name;
    document.getElementById('businessDetailAddress').textContent = address;
    document.getElementById('businessDetailId').textContent = businessId;
    document.getElementById('businessDetailPhone').textContent = phone_number;
    document.getElementById('businessDetailState').textContent =
      state_of_operation;
    document.getElementById('businessDetailCac').textContent =
      cac_reg_no || '—';
    document.getElementById('businessDetailTin').textContent = tax_id || '—';
    document.getElementById('businessDetailNin').textContent = nin || '—';
    document.getElementById('businessDetailType').textContent = business_type;
    document.getElementById('businessDetailStaffSize').textContent = staff_size;
    document.getElementById('businessDetailVersion').textContent =
      version_preference;
    document.getElementById('businessDetailStatus').textContent = is_active
      ? 'Active'
      : 'Inactive';
    document.getElementById('businessDetailCreatedAt').textContent =
      formatDateTimeReadable(created_at);
    document.getElementById('businessDetailUpdatedAt').textContent =
      formatDateTimeReadable(updated_at);
    document.getElementById('businessDetailShopCount').textContent = shop_count
      ? shop_count
      : '-';

    // 🧾 Populate Subscription Info
    document.getElementById('businessDetailSubStatus').textContent =
      subscriptionStatus || 'none';
    document.getElementById('businessDetailSubDays').textContent =
      days_remaining ?? '—';
    document.getElementById('businessDetailSubStart').textContent =
      subscription_start ? formatDateTimeReadable(subscription_start) : '—';
    document.getElementById('businessDetailSubEnd').textContent =
      subscription_end ? formatDateTimeReadable(subscription_end) : '—';
    document.getElementById('businessDetailSubActivatedBy').textContent =
      activated_by || '—';

    // 🏪 Populate Shops Table
    const shopsTableBody = document.getElementById('businessDetailShopsBody');

    if (shops && shops.length > 0) {
      shopsTableBody.innerHTML = shops
        .map(
          (shop) => `
      <tr class="table-body-row">
        <td class="py-1">${shop.id}</td>
        <td class="py-1">${shop.name}</td>
        <td class="py-1">${shop.location}</td>
        <td class="py-1">${formatDateTimeReadable(shop.created_at)}</td>
      </tr>
    `
        )
        .join('');
    } else {
      shopsTableBody.innerHTML = `
    <tr  class="table-body-row">
      <td colspan="4" class="py-2 center-text">No shops registered</td>
    </tr>
  `;
    }

    hideGlobalLoader();
    //   openBusinessDetailsModal();
  } catch (err) {
    hideGlobalLoader();
    console.error('Error fetching sale details:', err.message);
    showToast('fail', `❎ Failed to load sale details`);
    closeModal();
  } finally {
    hideGlobalLoader();
  }
}
