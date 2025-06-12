import config from '../../../config.js';
import { renderBusinessDetails } from '../../business.js';
import { showToast } from '../../script.js';
import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

const businessId = parsedUserData ? parsedUserData.businessId || null : null; // Get the business ID from user data

export async function fetchBusinessDetails() {
  if (!businessId) {
    console.warn('⚠️ No businessId found — skipping fetchBusinessDetails.');
    return;
  }

  try {
    const fetchedData = await safeFetch(
      `${baseUrl}/api/business/${businessId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  const data = await fetchedData.json();

    //  console.log(data);

    //  if (!fetchedData.ok) {
    //    throw new Error(fetchedData.message || 'Something went wrong');
    //  }

    //  console.log(fetchedData);

    return fetchedData;
  } catch (error) {
    console.error('Error checking shop:', error.message);
    throw error;
  }
}

export async function updateBusiness(businessid, businessUpdatedDetails) {
  try {
    console.log('Sending POST request...');

    const updateBusinessData = await safeFetch(
      `${baseUrl}/api/business/${businessid}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessUpdatedDetails),
      }
    );

    if (updateBusinessData) {
      console.log('Business info Updated successfully:', updateBusinessData);
      showToast('success', `✅ ${updateBusinessData.message}`);

      // Refresh list or update UI
      // fetchBusinessDetails();
      renderBusinessDetails();
    }

    return updateBusinessData;
  } catch (error) {
    console.error('Error Updating Business Info', error);
    showToast('error', '❌ Failed to Update Business info');
    throw error;
  }
}
