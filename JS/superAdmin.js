import config from '../config.js';
import {
  clearFormInputs,
  formatDateTimeReadable,
  formatServicePermission,
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper.js';
import './script.js';
import { closeModal, showToast } from './script.js';
import {
  activateBusinessSubscription,
  deleteBusiness,
  getAllBusinesses,
  getBusinessDetailById,
  getPlatformStatistics,
  notifyBusiness,
  restrictBusiness,
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

    loadPlatformStatisticsDashboard();
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

// Activate Business Subscription

export function openActivateBusinessSubscriptionModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const activateBusinessContainer = document.querySelector(
    '.activateBusinessContainer'
  );

  if (activateBusinessContainer)
    activateBusinessContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function activateBusinessForm(business) {
  const form = document.querySelector('.activateBusinessContainerModal');
  if (!form) return;

  form.dataset.businessId = business.id;

  document.querySelector('.business-name-text').textContent =
    business.business_name;
}

export function bindActivateBusinessFormListener() {
  const form = document.querySelector('.activateBusinessContainerModal');
  if (!form) return;

  const activateBusinessButton = form.querySelector('.activateBusinessButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    activateBusinessButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const businessId = form.dataset.businessId;

      const subscriptionDurationInput = form.querySelector(
        '#subscriptionDuration'
      );
      const durationDays = Number(subscriptionDurationInput.value);

      if (!businessId) {
        showToast('fail', '❎ No Business ID found.');
        return;
      }

      const businessSubscriptionDetails = {
        business_id: Number(businessId),
        duration_days: durationDays,
      };

      console.log(
        'Submitting Business Subscription Details with:',
        businessSubscriptionDetails
      );

      try {
        showBtnLoader(activateBusinessButton);
        const activateBusinessData = await activateBusinessSubscription(
          businessSubscriptionDetails
        );

        if (!activateBusinessData) {
          console.error('fail', activateBusinessData.message);
          return;
        }

        console.log(activateBusinessData);

        hideBtnLoader(activateBusinessButton);
        closeModal();
        clearFormInputs();
        showToast(
          'success',
          `${activateBusinessData.message}` ||
            '✅ Business Subscription Activated successfully.'
        );
      } catch (err) {
        hideBtnLoader(activateBusinessButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// Restrict Business
export function openRestrictBusinessModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const restrictBusinessContainer = document.querySelector(
    '.restrictBusinessContainer'
  );

  if (restrictBusinessContainer)
    restrictBusinessContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function restrictBusinessForm(business) {
  const form = document.querySelector('.restrictBusinessContainerModal');
  if (!form) return;

  form.dataset.businessId = business.id;

  form.querySelector('#confirmation-text-2').textContent =
    business.business_name;
}

export function bindRestrictBusinessFormListener() {
  const form = document.querySelector('.restrictBusinessContainerModal');
  if (!form) return;

  const restrictBusinessButton = form.querySelector('.restrictBusinessButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    restrictBusinessButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const businessId = form.dataset.businessId;

      if (!businessId) {
        showToast('fail', '❎ No Business ID found.');
        return;
      }

      const businessRestrictionDetails = {
        business_id: Number(businessId),
      };

      console.log(
        'Submitting Business Restriction Details with:',
        businessRestrictionDetails
      );

      try {
        showBtnLoader(restrictBusinessButton);
        const restrictBusinessData = await restrictBusiness(
          businessRestrictionDetails
        );

        if (!restrictBusinessData) {
          console.error('fail', restrictBusinessData.message);
          return;
        }

        console.log(restrictBusinessData);

        hideBtnLoader(restrictBusinessButton);
        closeModal();
        clearFormInputs();
        showToast(
          'success',
          `✅ ${restrictBusinessData.message}` ||
            '✅ Business Restricted successfully.'
        );
      } catch (err) {
        hideBtnLoader(restrictBusinessButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// Notify Business

export function openNotifyBusinessModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const notifyBusinessContainer = document.querySelector(
    '.notifyBusinessContainer'
  );

  if (notifyBusinessContainer) notifyBusinessContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function notifyBusinessForm(business) {
  const form = document.querySelector('.notifyBusinessContainerModal');
  if (!form) return;

  form.dataset.businessId = business.id;

  form.querySelector('.business-name-text').textContent =
    business.business_name;
}

export function bindNotifyBusinessFormListener() {
  const form = document.querySelector('.notifyBusinessContainerModal');
  if (!form) return;

  const notifyBusinessButton = form.querySelector('.notifyBusinessButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    notifyBusinessButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const businessId = form.dataset.businessId;

      const notificationMessageInput = form.querySelector(
        '#notificationMessage'
      );

      if (!businessId) {
        showToast('fail', '❎ No Business ID found.');
        return;
      }

      const businessNotificationDetails = {
        business_ids: [Number(businessId)],
        message: notificationMessageInput.value,
      };

      console.log(
        'Submitting Business Notification Details with:',
        businessNotificationDetails
      );

      try {
        showBtnLoader(notifyBusinessButton);
        const notifyBusinessData = await notifyBusiness(
          businessNotificationDetails
        );

        if (!notifyBusinessData) {
          console.error('fail', notifyBusinessData.message);
          return;
        }

        console.log(notifyBusinessData);

        hideBtnLoader(notifyBusinessButton);
        closeModal();
        clearFormInputs();
        showToast(
          'success',
          `${notifyBusinessData.message}` ||
            '✅ Business Notified successfully.'
        );
      } catch (err) {
        hideBtnLoader(notifyBusinessButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// Delete Business
export function openDeleteBusinessModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const deleteBusinessContainer = document.querySelector(
    '.deleteBusinessContainer'
  );

  if (deleteBusinessContainer) deleteBusinessContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function deleteBusinessForm(business) {
  const form = document.querySelector('.deleteBusinessContainerModal');
  if (!form) return;

  form.dataset.businessId = business.id;

  form.querySelector('#confirmation-text-2').textContent =
    business.business_name;
}

export function bindDeleteBusinessFormListener() {
  const form = document.querySelector('.deleteBusinessContainerModal');
  if (!form) return;

  const deleteBusinessButton = form.querySelector('.deleteBusinessButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    deleteBusinessButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const businessId = form.dataset.businessId;

      if (!businessId) {
        showToast('fail', '❎ No Business ID found.');
        return;
      }

      const businessDeletionDetails = {
        business_id: Number(businessId),
      };

      console.log(
        'Submitting Business Deletion Details with:',
        businessDeletionDetails
      );

      try {
        showBtnLoader(deleteBusinessButton);
        const deleteBusinessData = await deleteBusiness(businessId);

        if (!deleteBusinessData) {
          console.error('fail', deleteBusinessData.message);
          return;
        }

        console.log(deleteBusinessData);

        hideBtnLoader(deleteBusinessButton);
        closeModal();
        clearFormInputs();
        showToast(
          'success',
          `✅ ${deleteBusinessData.message}` ||
            '✅ Business Deleteed successfully.'
        );
      } catch (err) {
        hideBtnLoader(deleteBusinessButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function saleDetailModalForm() {
  const form = document.querySelector('.businessDetails');
  if (!form) return;
}

document.addEventListener('DOMContentLoaded', () => {
  bindRenderBusinessDetailById(); // Only once
  bindActivateBusinessFormListener();
  bindRestrictBusinessFormListener();
  bindNotifyBusinessFormListener();
  bindDeleteBusinessFormListener();
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
      allBusinessesTableBody.innerHTML = '';
      businessesArray = [];

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
         <td class="py-1 businessSubscriptionStatus">${
           is_active ? 'Active' : 'Not Active'
         }</td>
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

                        <button class="hero-btn-outline restrictBusinessButton" data-business-id="${businessId}" title="Restrict Business">
                           <i class="fa-solid fa-user-lock"></i>
                        </button>

                        <button class="hero-btn-outline notifyBusinessButton" data-business-id="${businessId}" title="Send Message">
                           <i class="fa-solid fa-paper-plane"></i>
                        </button>

                        <button class="hero-btn-outline updateBusinessButton" data-business-id="${businessId}" title="Update Business">
                           <i class="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button class="hero-btn-outline deleteBusinessButton" data-business-id="${businessId}" title="Delete Business">
                           <i class="fa-solid fa-trash"></i>
                        </button>
                     </td>
         `;

      //     <td class="py-1 itemStatus">${
      //    item.quantity === 0
      //      ? (item.status = 'Out of Stock')
      //      : item.quantity >= 1 && item.quantity <= 10
      //      ? 'Low Stock'
      //      : 'In Stock'
      //  }</td>

      row.addEventListener('click', async (e) => {
        renderBusinessDetailsById(e, row, businessId);
      });

      if (allBusinessesTableBody) allBusinessesTableBody.appendChild(row);

      // Activate Business Subscription
      const activateBusinessButton = row.querySelector(
        '.activateBusinessButton'
      );

      activateBusinessButton?.addEventListener('click', async (e) => {
        e.stopPropagation();
        showGlobalLoader();

        const businessId = activateBusinessButton.dataset.businessId;

        const activateBusinessContainer = document.querySelector(
          '.activateBusinessContainer'
        );

        if (activateBusinessContainer) {
          // Store businessId in modal container for reference
          activateBusinessContainer.dataset.businessId = businessId;

          // Fetch Shop detail
          const businessDetail = await getBusinessDetailById(businessId);

          //   console.log('productDetail', productDetail);

          // Call function to prefill modal inputs
          if (businessDetail?.data) {
            hideGlobalLoader();
            openActivateBusinessSubscriptionModal(); // Show modal after data is ready
            activateBusinessForm(businessDetail.data);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch Business details.');
          }
        }
      });

      // Restrict Business
      const restrictBusinessButton = row.querySelector(
        '.restrictBusinessButton'
      );

      restrictBusinessButton?.addEventListener('click', async (e) => {
        e.stopPropagation();
        showGlobalLoader();

        const businessId = restrictBusinessButton.dataset.businessId;

        const restrictBusinessContainer = document.querySelector(
          '.restrictBusinessContainer'
        );

        if (restrictBusinessContainer) {
          // Store businessId in modal container for reference
          restrictBusinessContainer.dataset.businessId = businessId;

          // Fetch Shop detail
          const businessDetail = await getBusinessDetailById(businessId);

          // Call function to prefill modal inputs
          if (businessDetail?.data) {
            hideGlobalLoader();
            openRestrictBusinessModal(); // Show modal after data is ready
            restrictBusinessForm(businessDetail.data);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch Business details.');
          }
        }
      });

      // Notify Business
      const notifyBusinessButton = row.querySelector('.notifyBusinessButton');

      notifyBusinessButton?.addEventListener('click', async (e) => {
        e.stopPropagation();
        showGlobalLoader();

        const businessId = notifyBusinessButton.dataset.businessId;

        const notifyBusinessContainer = document.querySelector(
          '.notifyBusinessContainer'
        );

        if (notifyBusinessContainer) {
          // Store businessId in modal container for reference
          notifyBusinessContainer.dataset.businessId = businessId;

          // Fetch Shop detail
          const businessDetail = await getBusinessDetailById(businessId);

          // Call function to prefill modal inputs
          if (businessDetail?.data) {
            hideGlobalLoader();
            openNotifyBusinessModal(); // Show modal after data is ready
            notifyBusinessForm(businessDetail.data);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch Business details.');
          }
        }
      });

      // Delete Business
      const deleteBusinessButton = row.querySelector('.deleteBusinessButton');

      deleteBusinessButton?.addEventListener('click', async (e) => {
        e.stopPropagation();
        showGlobalLoader();

        console.log('clicked');

        const businessId = deleteBusinessButton.dataset.businessId;

        const deleteBusinessContainer = document.querySelector(
          '.deleteBusinessContainer'
        );

        if (deleteBusinessContainer) {
          // Store businessId in modal container for reference
          deleteBusinessContainer.dataset.businessId = businessId;

          // Fetch Shop detail
          const businessDetail = await getBusinessDetailById(businessId);

          // Call function to prefill modal inputs
          if (businessDetail?.data) {
            hideGlobalLoader();
            openDeleteBusinessModal(); // Show modal after data is ready
            deleteBusinessForm(businessDetail.data);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch Business details.');
          }
        }
      });
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
    //  document.getElementById('businessDetailUpdatedAt').textContent =
    //    formatDateTimeReadable(updated_at);
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

export async function loadPlatformStatisticsDashboard() {
  try {
    showGlobalLoader();
    // Fetch once
    const platformStatisticsData = await getPlatformStatistics();

    //  console.log(platformStatisticsData);

    if (!platformStatisticsData)
      throw new Error(platformStatisticsData.message || 'Failed to fetch');

    const platformOverview = platformStatisticsData.data.overview;
    const businessTypes = platformStatisticsData.data.business_types;
    const monthlySignups = platformStatisticsData.data.trends.monthly_signups;

    hideGlobalLoader();

    renderPlatformStatisticsCards(platformOverview);
    renderPlatformBusinessType(businessTypes);
    renderPlatformMonthlySignups(monthlySignups);
  } catch (error) {
    hideGlobalLoader();
    console.error('Error loading report dashboard:', error);
  } finally {
    hideGlobalLoader();
  }
}

export async function renderPlatformStatisticsCards(platformOverview) {
  if (isSuperAdmin) {
    const {
      total_businesses,
      active_subscriptions,
      expired_subscriptions,
      restricted_businesses,
      registered_only,
      recent_registrations,
    } = platformOverview;

    // Update the UI Cards for Platfirm Overview
    const totalBusinessesEl = document.querySelector('#totalBusinesses');

    if (totalBusinessesEl) totalBusinessesEl.textContent = total_businesses;

    const activeSubscriptionsEl = document.getElementById(
      'activeSubscriptions'
    );

    if (activeSubscriptionsEl)
      activeSubscriptionsEl.textContent = active_subscriptions;

    const expiredSubscriptionsEl = document.getElementById(
      'expiredSubscriptions'
    );
    if (expiredSubscriptionsEl)
      expiredSubscriptionsEl.textContent = expired_subscriptions;

    const restrictedBusinessesEl = document.getElementById(
      'restrictedBusinesses'
    );
    if (restrictedBusinessesEl)
      restrictedBusinessesEl.textContent = restricted_businesses;

    const registeredOnlyEl = document.getElementById('registeredOnly');
    if (registeredOnlyEl) registeredOnlyEl.textContent = registered_only;

    const recentRegisterationsEl = document.getElementById(
      'recentRegisterations'
    );
    if (recentRegisterationsEl)
      recentRegisterationsEl.textContent = recent_registrations;

    // Area Chart - Trends

    hideGlobalLoader();
  }
}

let businessChart = null;
export async function renderPlatformBusinessType(businessTypes) {
  if (isSuperAdmin) {
    // Update PIE Chart - Business Types

    const sortedTypes = businessTypes.sort((a, b) => b.count - a.count);

    const labels = sortedTypes.map((t) => {
      if (t.type === 'BOTH') return 'POS + Inventory';
      if (t.type === 'POS_TRANSACTIONS') return 'POS Only';
      if (t.type === 'INVENTORY_SALES') return 'Inventory Only';
      return t.type;
    });
    const counts = sortedTypes.map((t) => t.count);

    const chartEl = document.querySelector('#businessTypeChart');

    if (chartEl) {
      chartEl.innerHTML = '';

      if (businessChart) {
        chartEl.innerHTML = '';
        businessChart.destroy();
      }
    }

    businessChart = new ApexCharts(chartEl, {
      chart: {
        type: 'donut',
        height: 300,
      },
      series: counts,
      labels: labels,
      colors: ['#007bff', '#51cf66', '#ff6b6b'], // customize as desired
      legend: {
        position: 'bottom',
      },
      dataLabels: {
        enabled: true,
        formatter: (val, opts) => `${opts.w.config.series[opts.seriesIndex]}`,
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} Businesses`,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: () => counts.reduce((sum, num) => sum + num, 0),
              },
            },
          },
        },
      },
    });

    businessChart.render();
  }
}

let monthlySignupChart = null;

export async function renderPlatformMonthlySignups(monthlySignups) {
  if (isSuperAdmin) {
    // Update Area Chart - Monthly Signups

    //  console.log(monthlySignups);

    // Convert "YYYY-MM" → "Mon YYYY"
    const formattedMonths = monthlySignups.map((item) => {
      const [year, month] = item.month.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
    });

    const chartContainer = document.querySelector(`#monthlySignupsChart`);
    chartContainer.innerHTML = '';

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
        text: `Monthly Signups`,
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
          name: 'Number Of Signup',
          data: monthlySignups.map((m) => m.count),
        },
      ],
      xaxis: {
        categories: formattedMonths,
        title: { text: 'Month' },
        labels: {
          rotate: -45,
          style: { fontSize: '11px' },
        },
      },
      yaxis: {
        title: { text: 'Number Of Signup' },
      },
      tooltip: {
        y: {
          formatter: (val) => `${val}`,
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

    monthlySignupChart = new ApexCharts(chartContainer, options);
    monthlySignupChart.render();
  }
}
