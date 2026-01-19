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
  'adminStorefrontManagementPage'
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
    '.updateStorefrontModalBtn'
  );
  const updateStorefrontDataContainer = document.querySelector(
    '.updateStorefrontDataContainer'
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
    }
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
    }
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
          'input[name="deliveryStatus"]:checked'
        )?.value,
        //   display_quantity_mode: form.querySelector(
        //     'input[name="displayQuantity"]:checked'
        //   )?.value,
      };

      console.log('Setting up Storefront with:', storeData);

      const createStorefrontModalBtn = document.querySelector(
        '.createStorefrontModalBtn'
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
            storefrontResData
          );

          const imageFormData = new FormData();

          imageFormData.append('business_logo', form.businessLogo.files[0]);
          imageFormData.append(
            'store_front_image',
            form.storeFrontImage.files[0]
          );
          imageFormData.append(
            'sign_board_image',
            form.signBoardImage.files[0]
          );

          const storefrontImageDetails = await uploadStorefrontImages(
            imageFormData
          );

          if (!storefrontImageDetails) {
            showToast('fail', storefrontImageDetails.message);
            return;
          }

          console.log(
            'storefrontImageResData received successfully:',
            storefrontImageDetails
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
    'updateStorefrontDeliveryStatusTrue'
  );
  const updateDeliveryNo = document.getElementById(
    'updateStorefrontDeliveryStatusFalse'
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
        'input[name="deliveryStatus"]:checked'
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
          form.updateStoreFrontImage.files[0]
        );
      }
      if (form.updateSignBoardImage.files[0]) {
        imageFormData.append(
          'sign_board_image',
          form.updateSignBoardImage.files[0]
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
    storefront.verification_status;

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
    13
  );
  var marker = L.marker([
    `${storefront.latitude}`,
    `${storefront.longitude}`,
  ]).addTo(storefrontMap);

  marker
    .bindPopup(
      `<b></b>${storefront.Business.business_name}<br>${storefront.address}`
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
    document.getElementById(
      'updateStorefrontDeliveryStatusTrue'
    ).checked = true;
  } else {
    document.getElementById(
      'updateStorefrontDeliveryStatusFalse'
    ).checked = true;
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

  // Usage after fetching Products
  //   setImagePreview(
  //     'updateProductImage_1',
  //     'updatePreviewupdateProductImage_1',
  //     storefront.business_logo
  //   );
  //   setImagePreview(
  //     'updateProductImage_2',
  //     'updatePreviewupdateProductImage_2',
  //     storefront.business_logo
  //   );
  //   setImagePreview(
  //     'updateProductImage_4',
  //     'updatePreviewupdateProductImage_4',
  //     storefront.business_logo
  //   );
  //   setImagePreview(
  //     'updateProductImage_4',
  //     'updatePreviewupdateProductImage_4',
  //     storefront.business_logo
  //   );
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
