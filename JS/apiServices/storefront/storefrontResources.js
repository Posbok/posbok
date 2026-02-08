import config from '../../../config.js';
import {
  clearFormInputs,
  hideGlobalLoader,
  populateBusinessStaffDropdown,
  showGlobalLoader,
} from '../../helper/helper.js';
import {
  closeModal,
  renderUserprofileDetails,
  showToast,
} from '../../script.js';
import { populateStaffTable } from '../../staff.js';
import { initializeStorefront, renderStorefront } from '../../storefront.js';
import { fetchBusinessDetails } from '../business/businessResource.js';
import { checkAndPromptCreateShop } from '../shop/shopResource.js';
import { safeFetch } from '../utility/safeFetch.js';
// import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

const params = new URLSearchParams(window.location.search);
const shopId = params.get('shopId');
const from = params.get('from');
const isStaffProfilePage = window.location.href.includes('staff-profile');

let enrichedShopData = [];

export async function fetchStorefrontStatus() {
  try {
    showGlobalLoader();
    //  console.log('Fetching storefront details for user');

    const fetchedData = await safeFetch(`${baseUrl}/api/storefront/settings`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    //  console.log('Response received...');
    console.log(fetchedData);
    hideGlobalLoader();

    if (fetchedData && fetchedData.data === null) {
      initializeStorefront();
      return;
    }

    renderStorefront(fetchedData.data);

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error Fetching Storefront Info:', error.message);
    throw error;
  }
}

export async function setupStorefront(storefrontDetails) {
  try {
    //  console.log('Sending POST request...');

    const setupStorefrontData = await safeFetch(
      `${baseUrl}/api/storefront/settings`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storefrontDetails),
      },
    );

    //  console.log('Response received...');

    if (setupStorefrontData) {
      // console.log('Staff created successfully:', setupStorefrontData);
      showToast('success', `✅ ${setupStorefrontData.message}`);

      // checkAndPromptCreateStaff(); // Refresh the Staff list after creation
    }

    return setupStorefrontData;
  } catch (error) {
    console.error('Error creating Storefront:', error);
    throw error;
  }
}

// Upload Storefront image

export async function uploadStorefrontImages(imageFormData) {
  try {
    //  console.log('Sending POST request...');

    const setupStorefrontData = await safeFetch(
      `${baseUrl}/api/storefront/upload-images`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'multipart/form-data',
        },
        body: imageFormData,
      },
    );

    //  console.log('Response received...');

    if (setupStorefrontData) {
      // console.log('Staff created successfully:', setupStorefrontData);
      showToast('success', `✅ ${setupStorefrontData.message}`);
      // checkAndPromptCreateStaff(); // Refresh the Staff list after creation
    }

    return setupStorefrontData;
  } catch (error) {
    console.error('Error uploading Storefront image:', error);
    throw error;
  }
}

export async function getStorefrontDetailById(businessId) {
  try {
    showGlobalLoader();
    const selectedSaleData = await safeFetch(
      `${baseUrl}/api/super-admin/businesses/${businessId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    //  console.log('selectedSaleData received...');

    //  console.log('selectedSaleData:', selectedSaleData);
    hideGlobalLoader();
    return selectedSaleData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching Business Detail:', error.message);
  }
}

//  Reviews

export async function getProductReviews(status = 'all', page = 1, limit = 50) {
  try {
    showGlobalLoader();

    const productReviewsData = await safeFetch(
      `${baseUrl}/api/reviews/all?status=${status}&page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    hideGlobalLoader();

    console.log(productReviewsData);
    return productReviewsData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching Reviews:', error.message);
  }
}

// export async function markAsReadApi(noticeId) {
//   try {
//     //  console.log('Sending POST request...');

//     showGlobalLoader();

//     const fetchedData = await safeFetch(
//       `${baseUrl}/api/super-admin/business-notices/${noticeId}/read`,
//       {
//         method: 'PATCH',
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//       },
//     );

//     if (fetchedData) {
//       // console.log('Notice deleted successfully:', fetchedData);
//       showToast('success', `✅ ${fetchedData.message}`);
//       // await renderProductInventoryTable(shopId); // Refresh list or update UI
//       hideGlobalLoader();
//     }

//     return fetchedData;
//   } catch (error) {
//     hideGlobalLoader();
//     //  console.error('Error deleting Notice', error);
//     showToast('error', '❌ Failed to Mark Notice As Read');
//     throw error;
//   }
// }

export async function moderateReview(reviewId, moderateReviewDetails) {
  try {
    //  console.log('Sending POST request...');

    showGlobalLoader();

    const fetchedData = await safeFetch(
      `${baseUrl}/api/reviews/${reviewId}/moderate`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moderateReviewDetails),
      },
    );

    if (fetchedData) {
      console.log('Review moderated successfully:', fetchedData);
      // showToast('success', `✅ ${fetchedData.message}`);
      // await renderProductInventoryTable(shopId); // Refresh list or update UI
      // await loadStorefrontReviews();
      hideGlobalLoader();
    }

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    //  console.error('Error deleting Notice', error);
    showToast('error', '❌ Failed to Mark Notice As Read');
    throw error;
  }
}
