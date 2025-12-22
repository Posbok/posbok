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
import { fetchBusinessDetails } from '../business/businessResource.js';
import { checkAndPromptCreateShop } from '../shop/shopResource.js';
import { safeFetch } from '../utility/safeFetch.js';

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

    const fetchedData = await safeFetch(`${baseUrl}/storefront/settings`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    //  console.log('Response received...');
    console.log(fetchedData);
    hideGlobalLoader();

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
      `${baseUrl}/storefront/settings`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storefrontDetails),
      }
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
