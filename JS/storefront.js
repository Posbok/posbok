'./script.js';
import config from '../config';
import { fetchBusinessDetails } from './apiServices/business/businessResource';
import {
  checkAndPromptCreateShop,
  openDeleteShopModal,
} from './apiServices/shop/shopResource';
import {
  assignStaffToShop,
  assignUserToShop,
  checkAndPromptCreateStaff,
  createStaff,
  deleteUser,
  fetchStaffDetail,
  openCreateStaffModal,
  openDeleteStaffModal,
  openManageStaffModal,
  openUpdateStaffModal,
  removeStaffFromShop,
  updateUser,
} from './apiServices/user/userResource';
import { safeFetch } from './apiServices/utility/safeFetch';
import {
  clearFormInputs,
  formatServicePermission,
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { closeModal, showToast } from './script';
import {
  fetchStorefrontStatus,
  getProductReviews,
  moderateReview,
  setupStorefront,
  uploadStorefrontImages,
} from './apiServices/storefront/storefrontResources.js';

const userData = config.userData;
const baseUrl = config.baseUrl;
const parsedUserData = userData ? JSON.parse(userData) : null;
const servicePermission = parsedUserData?.servicePermission;

let userShops = [];
let enrichedShopData = [];
let businessId = null;

const adminStorefrontManagementPage = document.body.classList.contains(
  'adminStorefrontManagementPage',
);

if (adminStorefrontManagementPage) {
  fetchStorefrontStatus();
}

// JS for opening Create Storefront Modal
document.addEventListener('DOMContentLoaded', function () {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addButton = document.querySelector('.create-storefront');
  const createStorefrontContainer = document.querySelector('.createStorefront');

  if (addButton) {
    addButton.addEventListener('click', function () {
      createStorefrontContainer.classList.add('active');
      main.classList.add('blur');
      sidebar.classList.add('blur');
      main.classList.add('no-scroll');

      createStorefrontForm();
    });
  }
});

// JS for opening Update Storefront Modal
document.addEventListener('DOMContentLoaded', function () {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateStorefrontModalBtn = document.querySelector(
    '.updateStorefrontModalBtn',
  );
  const updateStorefrontDataContainer = document.querySelector(
    '.updateStorefrontDataContainer',
  );

  if (updateStorefrontModalBtn) {
    updateStorefrontModalBtn.addEventListener('click', async function () {
      updateStorefrontDataContainer.classList.add('active');
      main.classList.add('blur');
      sidebar.classList.add('blur');
      main.classList.add('no-scroll');

      const storefrontRes = await fetchStorefrontStatus();
      populateUpdateStorefrontForm(storefrontRes.data);

      updateStorefrontForm();
    });
  }
});

// This listens for ANY file change on the entire page
document.addEventListener('change', function (event) {
  // 1. Check if the element that changed is one of our image inputs
  const input = event.target;

  // We identify our inputs by their IDs or name
  const isImageInput = [
    'businessLogo',
    'storeFrontImage',
    'signBoardImage',
  ].includes(input.id);

  if (!isImageInput) return;

  // 2. Map the Input ID to its specific Preview ID
  const previewMap = {
    businessLogo: 'previewBusinessLogo_create',
    storeFrontImage: 'previewStoreFrontImage_create',
    signBoardImage: 'previewSignBoardImage_create',
  };

  const previewId = previewMap[input.id];
  const previewImg = document.getElementById(previewId);
  const file = input.files[0];

  if (file && previewImg) {
    // 3. Size Check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Max size: 5MB');
      input.value = '';
      previewImg.src = '/img/placeholder.png';
      return;
    }

    // 4. The "Magic": Use FileReader to convert image to a string the <img> can read
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// JS for using Geolocation in Storefront Creation
document.getElementById('useLocationBtn')?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      document.getElementById('storefrontLatitude').value =
        position.coords.latitude;
      document.getElementById('storefrontLongitude').value =
        position.coords.longitude;
    },
    () => {
      alert('Unable to retrieve location');
    },
  );
});

document.getElementById('useLocationBtn_2')?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      document.getElementById('storefrontLatitude').value =
        position.coords.latitude;
      document.getElementById('storefrontLongitude').value =
        position.coords.longitude;
    },
    () => {
      alert('Unable to retrieve location');
    },
  );
});

export function createStorefrontForm() {
  const form = document.querySelector('.createStoreFrontForm');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const storeData = {
        is_active: true,
        latitude: form.storefrontLatitude.value,
        longitude: form.storefrontLongitude.value,
        address: form.storefrontAddress.value,
        business_description: form.storefrontDescription.value,
        business_motto: form.storefrontMotto.value,
        contact_phone: form.storefrontPhoneNumber.value,
        contact_email: form.storefrontEmail.value,
        whatsapp_number: form.storefrontWhatsappPhoneNumber.value,
        cac_registration: form.storefrontCacNumber.value || 'N/A',
        offers_delivery: form.querySelector(
          'input[name="deliveryStatus"]:checked',
        )?.value,
        //   display_quantity_mode: form.querySelector(
        //     'input[name="displayQuantity"]:checked'
        //   )?.value,
      };

      console.log('Setting up Storefront with:', storeData);

      const createStorefrontModalBtn = document.querySelector(
        '.createStorefrontModalBtn',
      );

      try {
        showBtnLoader(createStorefrontModalBtn);
        const storefrontResData = await setupStorefront(storeData);

        //   console.log('storefrontResData received successfully:', storefrontResData);

        if (!storefrontResData) {
          showToast('fail', storefrontResData.message);
          return;
        }

        if (storefrontResData) {
          console.log(
            'storefrontResData received successfully:',
            storefrontResData,
          );

          const imageFormData = new FormData();

          imageFormData.append('business_logo', form.businessLogo.files[0]);
          imageFormData.append(
            'store_front_image',
            form.storeFrontImage.files[0],
          );
          imageFormData.append(
            'sign_board_image',
            form.signBoardImage.files[0],
          );

          const storefrontImageDetails =
            await uploadStorefrontImages(imageFormData);

          if (!storefrontImageDetails) {
            showToast('fail', storefrontImageDetails.message);
            return;
          }

          console.log(
            'storefrontImageResData received successfully:',
            storefrontImageDetails,
          );

          if (storefrontImageDetails) {
            showToast('success', `✅ ${storefrontResData.message}`);
          }

          fetchStorefrontStatus();

          closeModal();
          clearFormInputs();
          //  await renderProductInventoryTable(shopId);
          //  const filters = getInventoryLogFilters('admin', shopId);
          //  await renderInventoryLogTable({
          //    filters,
          //    shopId,
          //    tableBody: `#inventoryLogBody-${shopId}`,
          //  });
        }
      } catch (err) {
        hideBtnLoader(createStorefrontModalBtn);

        console.error('Error Creating Storefront:', err);
        showToast('fail', `❎ ${err.message}`);
      } finally {
        hideBtnLoader(createStorefrontModalBtn);
        hideGlobalLoader();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cacInput = document.getElementById('storefrontCacNumber');
  const deliveryYes = document.getElementById('storefrontDeliveryStatusTrue');
  const deliveryNo = document.getElementById('storefrontDeliveryStatusFalse');

  const updateCacInput = document.getElementById('updateStorefrontCacNumber');
  const updateDeliveryYes = document.getElementById(
    'updateStorefrontDeliveryStatusTrue',
  );
  const updateDeliveryNo = document.getElementById(
    'updateStorefrontDeliveryStatusFalse',
  );

  if (!cacInput || !deliveryYes || !deliveryNo) return;

  function toggleDeliveryOption() {
    const hasCAC = cacInput.value.trim().length > 0;

    deliveryYes.disabled = !hasCAC;

    // If CAC is removed while "Offers Delivery" is selected
    if (!hasCAC && deliveryYes.checked) {
      deliveryYes.checked = false;
      deliveryNo.checked = true;
    }
  }

  if (!updateCacInput || !updateDeliveryYes || !updateDeliveryNo) return;

  function toggleUpdateDeliveryOption() {
    const hasCAC = updateCacInput.value.trim().length > 0;

    updateDeliveryYes.disabled = !hasCAC;

    // If CAC is removed while "Offers Delivery" is selected
    if (!hasCAC && updateDeliveryYes.checked) {
      updateDeliveryYes.checked = false;
      updateDeliveryNo.checked = true;
    }
  }

  // Listen live
  cacInput.addEventListener('input', toggleDeliveryOption);
  updateCacInput.addEventListener('input', toggleUpdateDeliveryOption);

  // Run once on load (important for edit mode / modal reopen)
  toggleDeliveryOption();
  toggleUpdateDeliveryOption();
});

export function updateStorefrontForm() {
  const form = document.querySelector('.updateStorefrontDataModal');

  if (!form || form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const storeData = {
      is_active: true,
      latitude: form.updateStorefrontLatitude.value,
      longitude: form.updateStorefrontLongitude.value,
      address: form.updateStorefrontAddress.value,
      business_description: form.updateStorefrontDescription.value,
      business_motto: form.updateStorefrontMotto.value,
      contact_phone: form.updateStorefrontPhoneNumber.value,
      contact_email: form.updateStorefrontEmail.value,
      whatsapp_number: form.updateStorefrontWhatsappPhoneNumber.value,
      cac_registration: form.updateStorefrontCacNumber.value || 'N/A',
      offers_delivery: form.querySelector(
        'input[name="deliveryStatus"]:checked',
      )?.value,
      // display_quantity_mode: form.querySelector(
      //   'input[name="displayQuantity"]:checked'
      // )?.value,
    };

    const updateBtn = form.querySelector('.updateStorefrontModalBtn');

    try {
      showBtnLoader(updateBtn);

      // Update Storefront Settings
      const storefrontResData = await setupStorefront(storeData);

      if (!storefrontResData) {
        showToast('fail', 'Failed to update storefront settings.');
        return;
      }

      // Conditional Image Uploads
      const imageFormData = new FormData();

      if (form.updateBusinessLogo.files[0]) {
        imageFormData.append('business_logo', form.updateBusinessLogo.files[0]);
      }
      if (form.updateStoreFrontImage.files[0]) {
        imageFormData.append(
          'store_front_image',
          form.updateStoreFrontImage.files[0],
        );
      }
      if (form.updateSignBoardImage.files[0]) {
        imageFormData.append(
          'sign_board_image',
          form.updateSignBoardImage.files[0],
        );
      }

      if (
        imageFormData.has('business_logo') ||
        imageFormData.has('store_front_image') ||
        imageFormData.has('sign_board_image')
      ) {
        const imageRes = await uploadStorefrontImages(imageFormData);

        if (!imageRes) {
          showToast('fail', 'Failed to upload images.');
          return;
        }
      }

      showToast('success', `✅ ${storefrontResData.message}`);
      closeModal();
      fetchStorefrontStatus(); // Refresh storefront info on UI
    } catch (err) {
      console.error('Error updating storefront:', err);
      showToast('fail', `❎ ${err.message}`);
    } finally {
      hideBtnLoader(updateBtn);
      hideGlobalLoader();
    }
  });
}

let storefrontMap;

export function renderStorefront(storefront) {
  document.getElementById('noStorefrontInfo').classList.add('hidden');
  document.getElementById('availableStoreInfo').classList.remove('hidden');

  const imgFallback = '/img/placeholder.png';

  const baseStoreUrl = 'https://posbok-storefront.vercel.app/';

  const storeUrlEl = document.getElementById('storeUrl');
  const fullStoreUrl = `${baseStoreUrl}${storefront.store_slug}`;

  storeUrlEl.textContent = fullStoreUrl;
  storeUrlEl.href = fullStoreUrl;

  //
  //   document.getElementById('storeSlug').textContent = storefront.store_slug;
  document.getElementById('verificationStatus').textContent =
    storefront.verification_status.toUpperCase();

  const verificationStatusBadge = document.querySelector('.status-badge');
  if (verificationStatusBadge) {
    if (storefront.verification_status === 'verified') {
      verificationStatusBadge.className = 'status-badge verified';
    }
    if (storefront.verification_status === 'pending') {
      verificationStatusBadge.className = 'status-badge pending';
    }
    if (storefront.verification_status === 'rejected') {
      verificationStatusBadge.className = 'status-badge rejected';
    }
  }

  document.getElementById('businessName').textContent =
    storefront.Business.business_name;

  document.getElementById('businessMotto').textContent =
    storefront.business_motto;

  document.getElementById('isActive').textContent = storefront.is_active
    ? 'Yes'
    : 'No';

  document.getElementById('offersDelivery').textContent =
    storefront.offers_delivery ? 'Yes' : 'No';

  document.getElementById('deliveryVerified').textContent =
    storefront.delivery_verified ? 'Verified' : 'Unverified';

  //   document.getElementById('quantityMode').textContent =
  //     storefront.display_quantity_mode;

  document.getElementById('businessDescription').textContent =
    storefront.business_description;

  document.getElementById('storeAddress').textContent = storefront.address;

  document.getElementById('cacNumber').textContent =
    storefront.cac_registration;

  document.getElementById('contactPhone').textContent =
    storefront.contact_phone;

  document.getElementById('contactEmail').textContent =
    storefront.contact_email;

  document.getElementById('whatsappNumber').textContent =
    storefront.whatsapp_number;

  document.getElementById('latitude').textContent = storefront.latitude;

  document.getElementById('longitude').textContent = storefront.longitude;

  document.getElementById('businessLogo').src =
    storefront.business_logo || imgFallback;

  document.getElementById('storeFrontImage').src =
    storefront.store_front_image || imgFallback;

  document.getElementById('signBoardImage').src =
    storefront.sign_board_image || imgFallback;

  //   initMap(storefront.latitude, storefront.longitude);

  // Leaflet Map Initialization for Storefront Location
  if (storefrontMap) {
    storefrontMap.remove();
  }

  // Initialize new map
  storefrontMap = L.map('storefront-map').setView(
    [storefront.latitude, storefront.longitude],
    13,
  );
  var marker = L.marker([
    `${storefront.latitude}`,
    `${storefront.longitude}`,
  ]).addTo(storefrontMap);

  marker
    .bindPopup(
      `<b></b>${storefront.Business.business_name}<br>${storefront.address}`,
    )
    .openPopup();

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(storefrontMap);
}

function populateUpdateStorefrontForm(storefront) {
  document.getElementById('updateStorefrontLatitude').value =
    storefront.latitude;
  document.getElementById('updateStorefrontLongitude').value =
    storefront.longitude;
  document.getElementById('updateStorefrontAddress').value = storefront.address;
  document.getElementById('updateStorefrontDescription').value =
    storefront.business_description;
  document.getElementById('updateStorefrontMotto').value =
    storefront.business_motto;
  document.getElementById('updateStorefrontPhoneNumber').value =
    storefront.contact_phone;
  document.getElementById('updateStorefrontEmail').value =
    storefront.contact_email;
  document.getElementById('updateStorefrontWhatsappPhoneNumber').value =
    storefront.whatsapp_number;
  document.getElementById('updateStorefrontCacNumber').value =
    storefront.cac_registration === 'N/A' ? '' : storefront.cac_registration;

  // Delivery status radio
  if (storefront.offers_delivery) {
    document.getElementById('updateStorefrontDeliveryStatusTrue').checked =
      true;
  } else {
    document.getElementById('updateStorefrontDeliveryStatusFalse').checked =
      true;
  }

  // Display quantity mode
  //   switch (storefront.display_quantity_mode) {
  //     case 'exact':
  //       document.getElementById(
  //         'updateStorefrontDisplayQuantityExact'
  //       ).checked = true;
  //       break;
  //     case 'in_stock':
  //       document.getElementById(
  //         'updateStorefrontDisplayQuantityInStock'
  //       ).checked = true;
  //       break;
  //     case 'hidden':
  //       document.getElementById(
  //         'updateStorefrontDisplayQuantityHidden'
  //       ).checked = true;
  //       break;
  //   }

  // Usage after fetching storefront
  setImagePreview(
    'updateBusinessLogo',
    'previewBusinessLogo',
    storefront.business_logo,
  );
  setImagePreview(
    'updateStoreFrontImage',
    'previewStoreFrontImage',
    storefront.store_front_image,
  );
  setImagePreview(
    'updateSignBoardImage',
    'previewSignBoardImage',
    storefront.sign_board_image,
  );
}

// Function to handle image preview + max size check

function setImagePreview(inputId, previewId, currentUrl) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  preview.src = currentUrl || '/img/placeholder.png';

  input.addEventListener('change', function () {
    const file = input.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Max size: 5MB');
        input.value = '';
        return;
      }
      preview.src = URL.createObjectURL(file);
    } else {
      preview.src = currentUrl || '/img/placeholder.png';
    }
  });
}

export function initializeStorefront() {
  document.getElementById('noStorefrontInfo').classList.remove('hidden');
  document.getElementById('availableStoreInfo').classList.add('hidden');
}

// Fetch Storefront Info

let storefrontReviews = [];
let currentReviewFilter = 'all';
let currentReviewPage = 1;
let totalReviewPages = 1;

export async function loadStorefrontReviews(page = 1, append = false) {
  const response = await getProductReviews(currentReviewFilter, page, 50);

  if (!response?.data?.reviews) return;

  const reviews = response.data.reviews;
  const pagination = response.data.pagination;

  totalReviewPages = pagination.totalPages;
  currentReviewPage = pagination.currentPage;

  if (append) {
    storefrontReviews = [...storefrontReviews, ...reviews]; // append new reviews
  } else {
    storefrontReviews = reviews; // replace on first load or filter change
  }

  //   updatePendingBadge(storefrontReviews);
  fetchPendingReviewCount();
  renderReviews(storefrontReviews, currentReviewFilter);

  // Show/hide Load More button
  const loadMoreBtn = document.getElementById('reviewsLoadMoreButton');
  if (loadMoreBtn) {
    if (currentReviewPage < totalReviewPages) {
      loadMoreBtn.style.display = 'block';
      loadMoreBtn.onclick = () =>
        loadStorefrontReviews(currentReviewPage + 1, true);
    } else {
      loadMoreBtn.style.display = 'none';
      loadMoreBtn.onclick = null;
    }
  }
}

const isSuperAdmin = parsedUserData?.accountType === 'SUPER_ADMIN';
const superAdminStorefrontPage = document.body.classList.contains(
  'superAdminStorefrontPage',
);

if (!isSuperAdmin && !superAdminStorefrontPage) {
  document.addEventListener('DOMContentLoaded', () => loadStorefrontReviews());
}

function getReviewStatus(review) {
  if (review.is_approved === true) return 'approved';
  return 'pending'; // until backend adds rejected state
}

export function renderReviews(reviews, filter = 'all') {
  const container = document.getElementById('reviewsList');
  if (!container) return;

  container.innerHTML = '';

  let filtered = reviews;

  if (filter === 'pending') {
    filtered = reviews.filter((r) => !r.is_approved);
  }

  if (filter === 'approved') {
    filtered = reviews.filter((r) => r.is_approved);
  }

  if (!filtered.length) {
    container.innerHTML = `<p class="muted-text heading-minitext">No reviews found.</p>`;
    return;
  }

  filtered.forEach((review) => {
    const status = getReviewStatus(review);
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

    // 1️⃣ Create node
    const card = document.createElement('div');
    card.className = `review-card ${status}`;
    card.dataset.reviewId = review.id;

    // 2️⃣ Inject HTML
    card.innerHTML = `
      <div class="review-header">
        <h1 class="review-title heading-subtext">${review.review_title}</h1>

        <div class="review-header-right">
          <span class="review-rating heading-subtext">${stars}</span>
          <span class="review-status ${status}">
            ${status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      <h2 class="review-text heading-minitext">
        ${review.review_text}
      </h2>

      <div class="review-meta muted-text heading-minitext">
        <span>Product: ${review.Product?.name || 'N/A'}</span> ·
        <span>By: ${review.customer_name}</span> ·
        <span>${new Date(review.created_at).toLocaleDateString()}</span>
      </div>

      <div class="review-actions">
        <button
          class="openModerateModal hero-btn-dark_square"
          data-review-id="${review.id}"
          data-review-text="${review.review_text}">
          Moderate
        </button>
      </div>
    `;

    // 3️⃣ Append node
    container.appendChild(card);

    // 4️⃣ Bind button inside THIS card
    const moderateBtn = card.querySelector('.openModerateModal');

    moderateBtn.addEventListener('click', () => {
      const reviewId = moderateBtn.dataset.reviewId;
      const reviewText = moderateBtn.dataset.reviewText;

      const modal = document.querySelector('.moderateReviewModal');
      if (!modal) return;

      modal.dataset.reviewId = reviewId;

      openModerateReviewButton();
      moderateReviewForm(reviewText);
    });
  });
}

export function openModerateReviewButton() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const moderateReviewsContainer = document.querySelector('.moderateReview');

  if (moderateReviewsContainer)
    moderateReviewsContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function moderateReviewForm(categoryDetail) {
  //   console.log('Category Detail:', CategoryDetail);

  const form = document.querySelector('.moderateReviewModal');
  if (!form) return;

  //   form.dataset.categoryId = categoryId;

  //   if (!form || form.dataset.bound === 'true') return;
  //   form.dataset.bound = 'true';

  //   console.log(categoryDetail.data);

  //   const categories = categoryDetail.data;

  //   categories.forEach((category) => {
  //     //  console.log('category', category.id);
  //     //  console.log('dataset', form.dataset.categoryId);

  //     if (category.id === Number(form.dataset.categoryId)) {
  //       const categoryName = category.name;
  //       const categoryDescription = category.description;
  //       const categoryId = category.id;

  //       document.querySelector('#updateName').value = categoryName;
  //       document.querySelector('#updateCategoryDescription').value =
  //         categoryDescription;
  //     }
  //   });
}

export function bindModerateReviewFormListener() {
  const form = document.querySelector('.moderateReviewModal');
  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const reviewId = form.dataset.reviewId;

      if (!reviewId) {
        showToast('fail', '❎ No Review selected for Moderation.');
        return;
      }

      const selectedOption = document.querySelector(
        'input[name="moderateReview"]:checked',
      );

      if (!selectedOption) {
        showToast('fail', '❎ Please select Approve or Reject.');
        return;
      }

      const moderateAdminResponse = document
        .querySelector('#moderateAdminResponse')
        .value.trim();

      const moderateReviewDetails = {
        is_approved: selectedOption.value === 'true',
        admin_response: moderateAdminResponse,
      };

      console.log(
        'Updating Review Approval Detail with:',
        moderateReviewDetails,
        reviewId,
      );

      const moderateReviewModalBtn = document.querySelector(
        '.moderateReviewModalBtn',
      );

      try {
        showBtnLoader(moderateReviewModalBtn);
        const moderateReviewData = await moderateReview(
          reviewId,
          moderateReviewDetails,
        );

        if (!moderateReviewData) {
          console.error('fail', moderateReviewData.message);
          //  showToast('fail', `❎ ${moderateReviewData.message}`);
          return;
        }

        closeModal();
        showToast('success', `✅ ${moderateReviewData.message}`);
        hideBtnLoader(moderateReviewModalBtn);
        await loadStorefrontReviews(); // Refresh reviews list to reflect changes
        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(moderateReviewModalBtn);

        console.error('Error Moderating Reviews:', err);
        showToast('fail', `❎ ${err.message}`);
        return;
      } finally {
        hideBtnLoader(moderateReviewModalBtn);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindModerateReviewFormListener();
});

// Review badge
// function updatePendingBadge(reviews) {
//   const count = reviews.filter((r) => !r.is_approved).length;
//   document.getElementById('pendingReviewsCount').textContent = count;
// }

async function fetchPendingReviewCount() {
  // large limit JUST for counting
  const response = await getProductReviews('pending', 1, 1000);

  if (!response?.data?.reviews) return;

  //   const count = response.data.reviews.length;
  const count = response.data.reviews.filter((r) => !r.is_approved).length;
  const badge = document.getElementById('pendingReviewsCount');

  if (badge) badge.textContent = count;
}

// Storefront Tab Switching Logic
document.addEventListener('click', function (e) {
  const tabBtn = e.target.closest('.storefront-tab-btn');
  if (!tabBtn) return;

  const targetTab = tabBtn.dataset.tab;

  document
    .querySelectorAll('.storefront-tab-btn')
    .forEach((btn) => btn.classList.remove('active'));
  tabBtn.classList.add('active');

  document
    .querySelectorAll('.storefront-tab-content')
    .forEach((tab) => tab.classList.remove('active'));

  const activeTab = document.getElementById(targetTab);
  if (activeTab) activeTab.classList.add('active');

  if (targetTab === 'reviewsTab') {
    loadStorefrontReviews();
  }
});

document.addEventListener('click', function (e) {
  const filterBtn = e.target.closest('.review-filter-btn');
  if (!filterBtn) return;

  document
    .querySelectorAll('.review-filter-btn')
    .forEach((btn) => btn.classList.remove('active'));

  filterBtn.classList.add('active');

  currentReviewFilter = filterBtn.dataset.filter;
  currentReviewPage = 1; // reset page on filter change
  loadStorefrontReviews(1, false);
});

// Business Logo Size Check on Update Storefront Form
document
  .getElementById('updateBusinessLogo')
  ?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      // 5MB
      alert('File is too large. Max size: 5MB');
      e.target.value = ''; // reset input
    }
  });
