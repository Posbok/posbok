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
  getAllStorefrontBusinesses,
  getBusinessDetailById,
  getExportBusinessesData,
  getPlatformStatistics,
  notifyBusiness,
  restrictBusiness,
  unRestrictBusiness,
  updateBusinessDetails,
} from './superAdmin/superAdminResources.js';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const isSuperAdmin = parsedUserData?.accountType === 'SUPER_ADMIN';
const superAdminStorefrontPage = document.body.classList.contains(
  'superAdminStorefrontPage'
);

const currentFilter = {};
if (isSuperAdmin && superAdminStorefrontPage) {
  document.addEventListener('DOMContentLoaded', async () => {
    //  setupAllBusinessesFilters({
    //    currentFilter,
    //    populateAllStorefrontTableFn: populateAllStorefrontTable,
    //  });

    //  loadPlatformStatisticsDashboard();
    await populateAllStorefrontTable({ page: 1, filters: currentFilter });
  });
}

let StorefrontArray = [];
let currentPage = 1;
let totalPages = 1;

export async function populateAllStorefrontTable({
  page = 1,
  //   limit = pageSize,
  filters,
  append = false,
}) {
  //   console.log(filters);
  const allStorefrontTableBody = document.querySelector(
    '.allStorefrontTableBody'
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
        allStorefrontData.message || 'Failed to fetch Business Data'
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

    if (!allStorefront.length && currentPage === 1) {
      allStorefrontTableBody.innerHTML = '';
      StorefrontArray = [];

      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="10" class="table-error-text">No Storefront Found.</td>
      `;

      if (allStorefrontTableBody) allStorefrontTableBody.appendChild(emptyRow);
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
                  
            <td class="sf-contact-phone">${storefront_phone_number}</td>                              
            <td class="sf-created-at">${formatDateTimeReadable(
              created_at
            )}</td>          

             <td class="py-1 action-buttons">
                                 <button
                  class="hero-btn-outline sf-view-storefront-btn"
                  data-storefront-id="${storefrontId}"
                  title="View Storefront Details"
               >
                  <i class="fa-solid fa-eye"></i>
               </button>

               <!-- Verify Storefront -->
               <button
                  class="hero-btn-outline sf-verify-storefront-btn"
                  data-storefront-id="${storefrontId}"
                  title="Verify Storefront"
            
               >
                 ${is_active ? 'Verified' : 'Unverified'}
               </button>

               <!-- Activate / Deactivate -->
               <button
                  class="hero-btn-outline sf-toggle-storefront-status-btn"
                  data-storefront-id="${storefrontId}"
                  data-current-status="${is_active}"
                  title="${
                    is_active ? 'Deactivate Storefront' : 'Activate Storefront'
                  }"
               >
                ${is_active ? 'Activated' : 'Unactivated'}
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

      if (allStorefrontTableBody) allStorefrontTableBody.appendChild(row);

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

      // Unrestrict Business
      const unrestrictBusinessButton = row.querySelector(
        '.unrestrictBusinessButton'
      );

      unrestrictBusinessButton?.addEventListener('click', async (e) => {
        e.stopPropagation();
        showGlobalLoader();

        const businessId = unrestrictBusinessButton.dataset.businessId;

        const unrestrictBusinessContainer = document.querySelector(
          '.unrestrictBusinessContainer'
        );

        if (unrestrictBusinessContainer) {
          // Store businessId in modal container for reference
          unrestrictBusinessContainer.dataset.businessId = businessId;

          // Fetch Shop detail
          const businessDetail = await getBusinessDetailById(businessId);

          // Call function to prefill modal inputs
          if (businessDetail?.data) {
            hideGlobalLoader();
            openUnrestrictBusinessModal(); // Show modal after data is ready
            unrestrictBusinessForm(businessDetail.data);
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

      // Update Business
      const updateBusinessButton = row.querySelector('.updateBusinessButton');

      updateBusinessButton?.addEventListener('click', async (e) => {
        e.stopPropagation();
        showGlobalLoader();

        const businessId = updateBusinessButton.dataset.businessId;

        const updateBusinessContainer = document.querySelector(
          '.updateBusinessDataContainer'
        );

        if (updateBusinessContainer) {
          // Store businessId in modal container for reference
          updateBusinessContainer.dataset.businessId = businessId;

          // Fetch Shop detail
          const businessDetail = await getBusinessDetailById(businessId);

          console.log('businessDetail', businessDetail);

          // Call function to prefill modal inputs
          if (businessDetail?.data) {
            hideGlobalLoader();
            openUpdateBusinessModal(); // Show modal after data is ready
            updateBusinessForm(businessDetail.data);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch Business details.');
          }
        }
      });
    });

    // Handle Load More button visibility
    if (currentPage >= totalPages) {
      loadMoreButton.style.display = 'none';
    } else {
      loadMoreButton.style.display = 'block';
    }
  } catch (error) {
    console.error('Error rendering All Businesses:', error);
    allStorefrontTableBody.innerHTML =
      '<tr><td colspan="12" class="table-error-text">Error loading All Businesses.</td></tr>';
  }
}
