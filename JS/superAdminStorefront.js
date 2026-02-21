import config from '../config.js';
import { getStorefrontDetailById } from './apiServices/storefront/storefrontResources.js';
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
  getAllStorefrontBusinesses,
  getBusinessDetailById,
  getExportBusinessesData,
  getPlatformStatistics,
  notifyBusiness,
  restrictBusiness,
  toggleActivateStorefront,
  unRestrictBusiness,
  updateBusinessDetails,
  verifyStorefront,
} from './superAdmin/superAdminResources.js';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const isSuperAdmin = parsedUserData?.accountType === 'SUPER_ADMIN';
const superAdminStorefrontPage = document.body.classList.contains(
  'superAdminStorefrontPage',
);

const currentFilter = { limit: 1000 };
// TODO: Move search to backend query param when backend team implements it.
// Switch limit back to 50 and pass `search` param to API.
// Temporary 1000 limit works fine under ~500 storefront users.

if (isSuperAdmin && superAdminStorefrontPage) {
  document.addEventListener('DOMContentLoaded', async () => {
    setupAllBusinessesFilters({
      currentFilter,
      populateAllStorefrontTableFn: populateAllStorefrontTable,
    });

    //  loadPlatformStatisticsDashboard();
    await populateAllStorefrontTable({ page: 1, filters: currentFilter });
    initStorefrontSearch();
  });
}

function setupAllBusinessesFilters({
  currentFilter,
  populateAllStorefrontTableFn,
}) {
  //   const applyBtn = document.getElementById(
  //     `applyBusinessStatusFilter_superAdmin`
  //   );
  //   const resetBtn = document.getElementById(
  //     `resetBusinessStatusFilter_superAdmin`
  //   );
  const loadMoreBtn = document.getElementById(`loadMoreButton_superAdmin`);

  //   if (!applyBtn || !resetBtn || !loadMoreBtn) return;
  if (!loadMoreBtn) return;

  // Load More
  loadMoreBtn.addEventListener('click', () => {
    const filters = currentFilter || {};

    //  if (currentPage < totalPages)
    populateAllStorefrontTableFn({
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
  // Apply Filters
  //   applyBtn.addEventListener('click', () => {
  //     const filters = getBusinessStatusFilters();
  //     Object.assign(currentFilter, filters);

  //     businessesArray = [];

  //     populateAllBusinessesTableFn({
  //       page: 1,
  //       filters,
  //       append: false,
  //     });
  //   });

  // Reset Filters
  //   resetBtn.addEventListener('click', () => {
  //     const role = 'admin';

  //     resetBusinessStatusFilter();
  //     const filters = getBusinessStatusFilters();
  //     Object.assign(currentFilter, filters);
  //     businessesArray = [];

  //     populateAllBusinessesTableFn({
  //       page: 1,
  //       // limit,
  //       filters,
  //       append: false,
  //     });
  //   });
}

function openStorefrontDetailsModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const storefrontDetailContainer = document.querySelector(
    '.storefrontDetailContainer',
  );

  storefrontDetailContainer.classList.add('active');
  main.classList.add('blur');
  sidebar.classList.add('blur');
  main.classList.add('no-scroll');

  //  createStorefrontForm();
}

// Verify Storefront
export function openVerifyStorefrontModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const verifyStorefrontContainer = document.querySelector(
    '.verifyStorefrontContainer',
  );

  if (verifyStorefrontContainer)
    verifyStorefrontContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function verifyStorefrontForm(business, actionText) {
  const form = document.querySelector('.verifyStorefrontContainerModal');
  if (!form) return;

  form.dataset.businessId = business.id;

  form.querySelector('#confirmation-text').textContent = business.business_name;
  form.querySelector('#action-text').textContent = actionText;
}

export function bindVerifyStorefrontFormListener() {
  const form = document.querySelector('.verifyStorefrontContainerModal');
  if (!form) return;

  const verifyStorefrontButton = form.querySelector('.verifyStorefrontButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    //  verifyStorefrontButton?.addEventListener('click', async (e) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const businessId = form.dataset.businessId;

      if (!businessId) {
        showToast('fail', '❎ No Business ID found.');
        return;
      }

      const verifyStorefrontReason = document.getElementById(
        'verifyStorefrontReason',
      ).value;

      const verifyStorefrontStatusDropdown = document.getElementById(
        'verifyStorefrontStatusDropdown',
      ).value;

      const verifyStorefrontDetails = {
        status: verifyStorefrontStatusDropdown,
        notes: verifyStorefrontReason,
      };

      console.log(
        'Submitting Storefront Verification Details with:',
        verifyStorefrontDetails,
      );

      try {
        showBtnLoader(verifyStorefrontButton);
        const verifyStorefrontData = await verifyStorefront(
          businessId,
          verifyStorefrontDetails,
        );

        if (!verifyStorefrontData) {
          console.error('fail', verifyStorefrontData.message);
          return;
        }

        //   console.log(verifyStorefrontData);

        hideBtnLoader(verifyStorefrontButton);
        closeModal();
        clearFormInputs();
        await populateAllStorefrontTable({ page: 1, filters: currentFilter });
        initStorefrontSearch();
        showToast(
          'success',
          `✅ ${verifyStorefrontData.message}` ||
            '✅ Storefront verified successfully.',
        );
      } catch (err) {
        hideBtnLoader(verifyStorefrontButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// Activatge / Deactivate Storefront
export function openToggleActivateStorefrontModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const toggleActivateStorefrontContainer = document.querySelector(
    '.toggleActivateStorefrontContainer',
  );

  if (toggleActivateStorefrontContainer)
    toggleActivateStorefrontContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function toggleActivateStorefrontForm(business, actionText) {
  const form = document.querySelector(
    '.toggleActivateStorefrontContainerModal',
  );
  if (!form) return;

  form.dataset.businessId = business.id;

  form.querySelector('#confirmation-text').textContent = business.business_name;
  form.querySelector('#action-text').textContent = actionText;
}

export function bindToggleActivateStorefrontFormListener() {
  const form = document.querySelector(
    '.toggleActivateStorefrontContainerModal',
  );
  if (!form) return;

  const toggleActivateStorefrontButton = form.querySelector(
    '.toggleActivateStorefrontButton',
  );
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const businessId = form.dataset.businessId;

      if (!businessId) {
        showToast('fail', '❎ No Business ID found.');
        return;
      }

      const toggleActivateStorefrontReason = document.getElementById(
        'toggleActivateStorefrontReason',
      ).value;

      const toggleActivateStorefrontStatusDropdown = document.getElementById(
        'toggleActivateStorefrontStatusDropdown',
      ).value;

      const toggleActivateStorefrontDetails = {
        is_active: toggleActivateStorefrontStatusDropdown,
        reason: toggleActivateStorefrontReason,
      };

      console.log(
        'Submitting Storefront Activation/Deactivation Details with:',
        toggleActivateStorefrontDetails,
      );

      try {
        showBtnLoader(toggleActivateStorefrontButton);
        const toggleActivateStorefrontData = await toggleActivateStorefront(
          businessId,
          toggleActivateStorefrontDetails,
        );

        if (!toggleActivateStorefrontData) {
          console.error('fail', toggleActivateStorefrontData.message);
          return;
        }

        //   console.log(toggleActivateStorefrontData);

        hideBtnLoader(toggleActivateStorefrontButton);
        closeModal();
        clearFormInputs();
        await populateAllStorefrontTable({ page: 1, filters: currentFilter });
        initStorefrontSearch();
        showToast(
          'success',
          `✅ ${toggleActivateStorefrontData.message}` ||
            '✅ Storefront verified successfully.',
        );
      } catch (err) {
        hideBtnLoader(toggleActivateStorefrontButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindVerifyStorefrontFormListener();
  bindToggleActivateStorefrontFormListener();
});

let StorefrontArray = [];
let currentPage = 1;
let totalPages = 1;

export async function populateAllStorefrontTable({
  page = 1,
  //   limit = pageSize,
  filters,
  append = false,
}) {
  console.log(filters);
  const allStorefrontTableBody = document.querySelector(
    '.allStorefrontTableBody',
  );
  const loadMoreButton = document.getElementById('loadMoreButton_superAdmin');

  if (!allStorefrontTableBody) {
    console.error('Error: Table body not found');
    return;
  }

  try {
    let loadingRow = document.querySelector('.loading-row');
    // console.log('loading', loadingRow);
    if (!loadingRow) {
      loadingRow = document.createElement('tr');
      loadingRow.className = 'loading-row';
      loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading All Storefront...</td>`;
      allStorefrontTableBody.appendChild(loadingRow);
    }

    loadMoreButton.style.display = 'none';

    const allStorefrontData = await getAllStorefrontBusinesses({
      page,
      filters,
    });

    if (!allStorefrontData)
      throw new Error(
        allStorefrontData.message || 'Failed to fetch Business Data',
      );

    console.log('allStorefrontData', allStorefrontData);

    const allStorefront = allStorefrontData.data.storefronts;

    const itemsPerPage = allStorefrontData.data.pagination.itemsPerPage;
    const totalItems = allStorefrontData.data.pagination.totalItems;
    currentPage = allStorefrontData.data.pagination.currentPage;
    totalPages = allStorefrontData.data.pagination.totalPages;

    //  if (allStorefrontTableBody) allStorefrontTableBody.innerHTML = '';

    if (page === 1) {
      StorefrontArray = [];
    }

    //  if (!allStorefront.length && currentPage === 1) {
    //    allStorefrontTableBody.innerHTML = '';
    //    StorefrontArray = [];

    //    const emptyRow = document.createElement('tr');
    //    emptyRow.innerHTML = `
    //      <td colspan="10" class="table-error-text">No Storefront Found.</td>
    //    `;

    //    if (allStorefrontTableBody) allStorefrontTableBody.appendChild(emptyRow);
    //    return;
    //  }

    if (!allStorefront.length && currentPage === 1) {
      StorefrontArray = [];
      renderStorefrontRows([]); // handles empty state display
      loadMoreButton.style.display = 'none';
      return;
    }

    allStorefront.forEach((business) => {
      if (!StorefrontArray.some((bus) => bus.id === business.id)) {
        StorefrontArray.push(business);
      }
    });

    // Clear the table body and render all accumulated Storefront
    if (!append) {
      allStorefrontTableBody.innerHTML = '';
    }
    allStorefrontTableBody.innerHTML = '';

    StorefrontArray.forEach((storefrontData, index) => {
      const {
        id: storefrontId,
        business_id,
        is_active,
        store_slug,
        latitude,
        longitude,
        address,
        store_front_image,
        sign_board_image,
        offers_delivery,
        cac_registration,
        delivery_verified,
        business_description,
        display_quantity_mode,
        contact_phone: storefront_phone_number,
        contact_email,
        whatsapp_number,
        business_motto,
        business_logo,
        published_categories,
        verification_status,
        created_at,
        updated_at,
        Business,
      } = storefrontData;

      const {
        business_name,
        phone_number: business_phone_number,
        business_type,
      } = Business;

      const row = document.createElement('tr');
      row.classList.add('table-body-row');
      //  row.classList.add(
      //    item.quantity < 1
      //      ? 'finishedStockRow'
      //      : item.quantity >= 1 && item.quantity <= 10
      //      ? 'nearFinishedStockRow'
      //      : 'inStockRow'
      //  );
      row.dataset.businessId = business_id;
      row.dataset.storefrontId = storefrontId;

      if (row)
        row.innerHTML = `
            <td class="sf-serial-number">${
              index + 1
            }</td>                           
            <td class="sf-business-name">${
              Business.business_name
            }</td>                   
       <td class="sf-store-slug">
  <a
    href="https://posbok-storefront.vercel.app/${store_slug}"
    target="_blank"
    rel="noopener noreferrer"
    class="sf-storefront-link"
    title="Open storefront in new tab"
  >
    ${store_slug}
  </a>
</td>                          
            <td class="sf-store-status">${
              is_active ? 'Active' : 'Inactive'
            }</td>         
            <td class="sf-verification-status">${verification_status}</td>                 
            <td class="sf-offers-delivery">${
              offers_delivery ? 'Yes' : 'No'
            }</td>          
            <td class="sf-offers-delivery">${
              delivery_verified ? 'Yes' : 'No'
            }</td>          
                  
            <td class="sf-contact-phone">${storefront_phone_number}</td>                              
            <td class="sf-created-at">${formatDateTimeReadable(
              created_at,
            )}</td>          

             <td class="py-1 action-buttons">
                                 <button
                  class="hero-btn-outline view-storefront-btn"
                  data-storefront-id="${storefrontId}"
                  data-business-id="${business_id}"
                  title="View Storefront Details"
               >
                  <i class="fa-solid fa-eye"></i>
               </button>

               <!-- Verify Storefront -->
               <button
                  class="hero-btn-outline verify-storefront-btn"
                  data-storefront-id="${storefrontId}"
                  data-business-id="${business_id}"
                  title="${delivery_verified ? 'Unverify Storefront' : 'Verify Storefront'}"            
               >
                Delivery Status
               </button>

               <!-- Activate / Deactivate -->
               <button
                  class="hero-btn-outline toggle-storefront-status-btn"
                  data-storefront-id="${storefrontId}"
                  data-business-id="${business_id}"
                  data-current-status="${is_active}"
                  title="${
                    is_active ? 'Deactivate Storefront' : 'Activate Storefront'
                  }"
               >
               Activation Status
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

      // row.addEventListener('click', async (e) => {
      //   renderStorefrontDetailsById(e, row);
      // });

      row.addEventListener('click', (e) => {
        //   if (e.target.closest('.action-buttons')) return;
        renderStorefrontDetailsById(e, row);
      });

      if (allStorefrontTableBody) allStorefrontTableBody.appendChild(row);

      // Verify Storefront
      const verifyStorefrontBtn = row.querySelector('.verify-storefront-btn');

      verifyStorefrontBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        showGlobalLoader();

        const businessId = verifyStorefrontBtn.dataset.businessId;

        const verifyStorefrontContainer = document.querySelector(
          '.verifyStorefrontContainer',
        );

        if (verifyStorefrontContainer) {
          // Store businessId in modal container for reference
          verifyStorefrontContainer.dataset.businessId = businessId;

          // Fetch Shop detail
          const businessDetail = await getBusinessDetailById(businessId);

          // Call function to prefill modal inputs
          if (businessDetail?.data) {
            hideGlobalLoader();
            openVerifyStorefrontModal(); // Show modal after data is ready
            verifyStorefrontForm(
              businessDetail.data,
              is_active ? 'Unverify' : 'Verify',
            );
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch Business details.');
          }
        }
      });

      // Verify Storefront
      const toggleActivateStorefrontBtn = row.querySelector(
        '.toggle-storefront-status-btn',
      );

      toggleActivateStorefrontBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        showGlobalLoader();

        const businessId = toggleActivateStorefrontBtn.dataset.businessId;

        const toggleActivateStorefrontContainer = document.querySelector(
          '.toggleActivateStorefrontContainer',
        );

        if (toggleActivateStorefrontContainer) {
          // Store businessId in modal container for reference
          toggleActivateStorefrontContainer.dataset.businessId = businessId;

          // Fetch Shop detail
          const businessDetail = await getBusinessDetailById(businessId);

          // Call function to prefill modal inputs
          if (businessDetail?.data) {
            hideGlobalLoader();
            openToggleActivateStorefrontModal(); // Show modal after data is ready
            toggleActivateStorefrontForm(
              businessDetail.data,
              is_active ? 'Deactivate' : 'Activate',
            );
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch Business details.');
          }
        }
      });
    });

    renderStorefrontRows(
      searchQuery ? getFilteredStorefronts() : StorefrontArray,
    );

    // Handle Load More button visibility
    if (currentPage >= totalPages) {
      loadMoreButton.style.display = 'none';
    } else {
      loadMoreButton.style.display = 'block';
    }
  } catch (error) {
    console.error('Error rendering All Businesses:', error);
    allStorefrontTableBody.innerHTML =
      '<tr><td colspan="12" class="table-error-text">Error loading All Storefront.</td></tr>';
  }
}

// ─── Search State ───────────────────────────────────────────────────────────
let searchQuery = '';
let filteredStorefrontArray = [];

// ─── Search Handler Setup ────────────────────────────────────────────────────
export function initStorefrontSearch() {
  const searchInput = document.getElementById('storefrontSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderStorefrontRows(
      searchQuery ? getFilteredStorefronts() : StorefrontArray,
    );
  });
}

// ─── Filter Logic ────────────────────────────────────────────────────────────
function getFilteredStorefronts() {
  if (!searchQuery) return StorefrontArray;

  return StorefrontArray.filter((storefrontData) => {
    const { store_slug, contact_phone, verification_status, Business } =
      storefrontData;
    const businessName = Business?.business_name?.toLowerCase() || '';
    const slug = store_slug?.toLowerCase() || '';
    const phone = contact_phone?.toLowerCase() || '';
    const verStatus = verification_status?.toLowerCase() || '';

    return (
      businessName.includes(searchQuery) ||
      slug.includes(searchQuery) ||
      phone.includes(searchQuery) ||
      verStatus.includes(searchQuery)
    );
  });
}

// ─── Extract Row Rendering into its own function ─────────────────────────────
function renderStorefrontRows(dataArray) {
  const allStorefrontTableBody = document.querySelector(
    '.allStorefrontTableBody',
  );
  //   const searchCountEl = document.getElementById('storefrontSearchCount');
  const loadMoreButton = document.getElementById('loadMoreButton_superAdmin');
  if (!allStorefrontTableBody) return;

  allStorefrontTableBody.innerHTML = '';

  if (!dataArray.length) {
    allStorefrontTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="table-error-text">
          ${searchQuery ? `No results found for "${searchQuery}"` : 'No Storefront Found.'}
        </td>
      </tr>`;
    //  if (searchCountEl) searchCountEl.textContent = '';
    loadMoreButton.style.display = 'none';
    return;
  }

  // Show count when searching
  //   if (searchCountEl) {
  //     searchCountEl.textContent = searchQuery
  //       ? `Showing ${dataArray.length} of ${StorefrontArray.length} storefronts`
  //       : '';
  //   }

  dataArray.forEach((storefrontData, index) => {
    const {
      id: storefrontId,
      business_id,
      is_active,
      store_slug,
      offers_delivery,
      delivery_verified,
      contact_phone: storefront_phone_number,
      verification_status,
      created_at,
      Business,
    } = storefrontData;

    const row = document.createElement('tr');
    row.classList.add('table-body-row');
    row.dataset.businessId = business_id;
    row.dataset.storefrontId = storefrontId;

    row.innerHTML = `
      <td class="sf-serial-number">${index + 1}</td>
      <td class="sf-business-name">${Business.business_name}</td>
      <td class="sf-store-slug">
        <a href="https://posbok-storefront.vercel.app/${store_slug}" target="_blank" rel="noopener noreferrer" class="sf-storefront-link" title="Open storefront in new tab">
          ${store_slug}
        </a>
      </td>
      <td class="sf-store-status">${is_active ? 'Active' : 'Inactive'}</td>
      <td class="sf-verification-status">${verification_status}</td>
      <td class="sf-offers-delivery">${offers_delivery ? 'Yes' : 'No'}</td>
      <td class="sf-offers-delivery">${delivery_verified ? 'Yes' : 'No'}</td>
      <td class="sf-contact-phone">${storefront_phone_number}</td>
      <td class="sf-created-at">${formatDateTimeReadable(created_at)}</td>
      <td class="py-1 action-buttons">
        <button class="hero-btn-outline view-storefront-btn" data-storefront-id="${storefrontId}" data-business-id="${business_id}" title="View Storefront Details">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button class="hero-btn-outline verify-storefront-btn" data-storefront-id="${storefrontId}" data-business-id="${business_id}" title="${delivery_verified ? 'Unverify Storefront' : 'Verify Storefront'}">
          Delivery Status
        </button>
        <button class="hero-btn-outline toggle-storefront-status-btn" data-storefront-id="${storefrontId}" data-business-id="${business_id}" data-current-status="${is_active}" title="${is_active ? 'Deactivate Storefront' : 'Activate Storefront'}">
          Activation Status
        </button>
      </td>
    `;

    // ── Row click ──
    row.addEventListener('click', (e) => {
      renderStorefrontDetailsById(e, row);
    });

    // ── Verify btn ──
    const verifyStorefrontBtn = row.querySelector('.verify-storefront-btn');
    verifyStorefrontBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      showGlobalLoader();
      const businessId = verifyStorefrontBtn.dataset.businessId;
      const verifyStorefrontContainer = document.querySelector(
        '.verifyStorefrontContainer',
      );
      if (verifyStorefrontContainer) {
        verifyStorefrontContainer.dataset.businessId = businessId;
        const businessDetail = await getBusinessDetailById(businessId);
        if (businessDetail?.data) {
          hideGlobalLoader();
          openVerifyStorefrontModal();
          verifyStorefrontForm(
            businessDetail.data,
            is_active ? 'Unverify' : 'Verify',
          );
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch Business details.');
        }
      }
    });

    // ── Toggle activate btn ──
    const toggleActivateStorefrontBtn = row.querySelector(
      '.toggle-storefront-status-btn',
    );
    toggleActivateStorefrontBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      showGlobalLoader();
      const businessId = toggleActivateStorefrontBtn.dataset.businessId;
      const toggleActivateStorefrontContainer = document.querySelector(
        '.toggleActivateStorefrontContainer',
      );
      if (toggleActivateStorefrontContainer) {
        toggleActivateStorefrontContainer.dataset.businessId = businessId;
        const businessDetail = await getBusinessDetailById(businessId);
        if (businessDetail?.data) {
          hideGlobalLoader();
          openToggleActivateStorefrontModal();
          toggleActivateStorefrontForm(
            businessDetail.data,
            is_active ? 'Deactivate' : 'Activate',
          );
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch Business details.');
        }
      }
    });

    allStorefrontTableBody.appendChild(row);
  });
}

function getStorefrontFromCacheById(storefrontId) {
  return StorefrontArray.find((sf) => String(sf.id) === String(storefrontId));
}

export function renderStorefrontDetailsById(e, row) {
  e.preventDefault();
  showGlobalLoader();

  const storefrontId = row.dataset.storefrontId;

  const storefront = getStorefrontFromCacheById(storefrontId);

  if (!storefront) {
    hideGlobalLoader();
    showToast('fail', '❎ Storefront details not found');
    return;
  }

  populateStorefrontDetailsModal(storefront);
  hideGlobalLoader();
  openStorefrontDetailsModal();
}

function populateStorefrontDetailsModal(storefront) {
  const {
    store_slug,
    is_active,
    verification_status,
    offers_delivery,
    delivery_verified,
    cac_registration,
    business_description,
    display_quantity_mode,
    contact_phone,
    contact_email,
    whatsapp_number,
    business_motto,
    address,
    latitude,
    longitude,
    created_at,
    Business,
  } = storefront;

  document.getElementById('sfDetailBusinessName').textContent =
    Business.business_name;

  document.getElementById('sfDetailSlug').textContent = store_slug;
  document.getElementById('sfDetailStatus').textContent = is_active
    ? 'Active'
    : 'Inactive';

  document.getElementById('sfDetailVerification').textContent =
    verification_status;

  document.getElementById('sfDetailDelivery').textContent = offers_delivery
    ? 'Yes'
    : 'No';

  document.getElementById('sfDetailDeliveryVerified').textContent =
    delivery_verified ? 'Verified' : 'Not Verified';

  document.getElementById('sfDetailCac').textContent =
    cac_registration || 'N/A';

  document.getElementById('sfDetailPhone').textContent = contact_phone || '—';

  document.getElementById('sfDetailEmail').textContent = contact_email || '—';

  document.getElementById('sfDetailWhatsapp').textContent =
    whatsapp_number || '—';

  document.getElementById('sfDetailMotto').textContent = business_motto || '—';

  document.getElementById('sfDetailDescription').textContent =
    business_description || '—';

  document.getElementById('sfDetailStockMode').textContent =
    display_quantity_mode;

  document.getElementById('sfDetailAddress').textContent = address;

  document.getElementById('sfDetailCoordinates').textContent =
    latitude && longitude ? `${latitude}, ${longitude}` : '—';

  document.getElementById('sfDetailCreatedAt').textContent =
    formatDateTimeReadable(created_at);
}
