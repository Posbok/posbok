import './script.js';
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
import { setupStorefront } from './apiServices/storefront/storefrontResources.js';

const userData = config.userData;
const baseUrl = config.baseUrl;
const parsedUserData = userData ? JSON.parse(userData) : null;
const servicePermission = parsedUserData?.servicePermission;

let userShops = [];
let enrichedShopData = [];
let businessId = null;

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

// JS for using Geolocation in Storefront Creation
document.getElementById('useLocationBtn').addEventListener('click', () => {
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
        cac_registration: form.storefrontCacNumber.value,
        offers_delivery: form.querySelector(
          'input[name="deliveryStatus"]:checked'
        )?.value,
        display_quantity_mode: form.querySelector(
          'input[name="displayQuantity"]:checked'
        )?.value,
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

          showToast('success', `✅ ${storefrontResData.message}`);

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
