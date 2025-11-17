import config from '../../config.js';
import { safeFetch } from '../apiServices/utility/safeFetch.js';

import { hideGlobalLoader, showGlobalLoader } from '../helper/helper.js';
import { closeModal } from '../script.js';
import { populateAllBusinessesTable } from '../superAdmin.js';

const baseUrl = config.baseUrl;
const userToken = config.token;

export async function getAllBusinesses({ page, filters }) {
  const tbody = document.querySelector('.superAdmin-businesses-table tbody');
  //   function showLoadingRow() {
  //     if (tbody)
  //       tbody.innerHTML = `
  //     <tr class="loading-row">
  //       <td colspan="10" class="table-error-text">Loading All Businesses...</td>
  //     </tr>
  //   `;
  //   }

  //   showLoadingRow();

  try {
    const queryParams = new URLSearchParams({ page });

    if (filters.businessStatus)
      queryParams.append('filter', filters.businessStatus);

    showGlobalLoader();
    //  console.log('Sending getAllBusinesses request...');

    const allBusinessesData = await safeFetch(
      `${baseUrl}/api/super-admin/businesses?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (allBusinessesData) {
      // console.log(allBusinessesData);
      hideGlobalLoader();
    }

    //  populateAllBusinessesTable(allBusinessesData);

    return allBusinessesData;
  } catch (error) {
    hideGlobalLoader();
    //  console.log(tbody);
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="10" class="table-error-text">Error loading All Businesses...</td>
    </tr>
  `;
    console.error('Error receiving All Businesses:', error);
    throw error;
  }
}

export async function getPlatformStatistics() {
  try {
    showGlobalLoader();
    const selectedSaleData = await safeFetch(
      `${baseUrl}/api/super-admin/statistics`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
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

export async function getBusinessDetailById(businessId) {
  try {
    showGlobalLoader();
    const selectedSaleData = await safeFetch(
      `${baseUrl}/api/super-admin/businesses/${businessId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
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

export async function activateBusinessSubscription(
  businessSubscriptionDetails
) {
  try {
    //  showGlobalLoader();
    const activateBusinessData = await safeFetch(
      `${baseUrl}/api/super-admin/activate-subscription`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessSubscriptionDetails),
      }
    );

    if (activateBusinessData) {
      console.log(
        'Business Subscription Activated successfully:',
        activateBusinessData
      );
      // showToast('success', `✅ ${activateBusinessData.message}`);
      closeModal();
    }

    //  console.log('activateBusinessData received...');

    //  console.log('activateBusinessData:', activateBusinessData);
    //  hideGlobalLoader();
    return activateBusinessData;
  } catch (error) {
    //  hideGlobalLoader();
    console.error('Error Activating Business Subscription:', error.message);
    throw error;
  }
}

export async function restrictBusiness(businessRestrictionDetails) {
  try {
    //  showGlobalLoader();
    const restrictBusinessData = await safeFetch(
      `${baseUrl}/api/super-admin/restrict-business`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessRestrictionDetails),
      }
    );

    if (restrictBusinessData) {
      // console.log('Business Subscription restrictd successfully:', restrictBusinessData);
      // showToast('success', `✅ ${restrictBusinessData.message}`);
      closeModal();
    }

    //  console.log('restrictBusinessData received...');

    //  console.log('restrictBusinessData:', restrictBusinessData);
    //  hideGlobalLoader();
    return restrictBusinessData;
  } catch (error) {
    //  hideGlobalLoader();
    console.error('Error Restricting Business:', error.message);
    throw error;
  }
}

export async function notifyBusiness(businessNotificationDetails) {
  try {
    //  showGlobalLoader();
    const notifyBusinessData = await safeFetch(
      `${baseUrl}/api/super-admin/send-notice`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessNotificationDetails),
      }
    );

    if (notifyBusinessData) {
      // console.log('Business Subscription restrictd successfully:', notifyBusinessData);
      // showToast('success', `✅ ${notifyBusinessData.message}`);
      closeModal();
    }

    //  console.log('notifyBusinessData received...');

    //  console.log('notifyBusinessData:', notifyBusinessData);
    //  hideGlobalLoader();
    return notifyBusinessData;
  } catch (error) {
    //  hideGlobalLoader();
    console.error('Error Restricting Business:', error.message);
    throw error;
  }
}

export async function deleteBusiness(businessId) {
  try {
    //  showGlobalLoader();
    const deleteBusinessData = await safeFetch(
      `${baseUrl}/api/super-admin/businesses/${businessId}?permanent=true`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (deleteBusinessData) {
      // console.log('Business Subscription restrictd successfully:', deleteBusinessData);
      // showToast('success', `✅ ${deleteBusinessData.message}`);
      closeModal();
    }

    //  console.log('deleteBusinessData received...');

    //  console.log('deleteBusinessData:', deleteBusinessData);
    //  hideGlobalLoader();
    return deleteBusinessData;
  } catch (error) {
    //  hideGlobalLoader();
    console.error('Error Deleting Business:', error.message);
    throw error;
  }
}

export async function updateBusinessDetails(businessUpdateDetails, businessId) {
  try {
    //  showGlobalLoader();
    const updateBusinessData = await safeFetch(
      `${baseUrl}/api/super-admin/businesses/${businessId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessUpdateDetails),
      }
    );

    if (updateBusinessData) {
      // console.log('Business  Updated successfully:', updateBusinessData);
      // showToast('success', `✅ ${updateBusinessData.message}`);
      closeModal();
    }

    //  console.log('updateBusinessData received...');

    //  console.log('updateBusinessData:', updateBusinessData);
    //  hideGlobalLoader();
    return updateBusinessData;
  } catch (error) {
    //  hideGlobalLoader();
    console.error('Error Updating Business :', error.message);
    throw error;
  }
}

// Export Businesses Data

export async function getExportBusinessesData({ format }) {
  try {
    const queryParams = new URLSearchParams();
    if (format) queryParams.append('format', format);

    showGlobalLoader();

    const response = await fetch(
      `${baseUrl}/api/super-admin/export-businesses?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to export businesses');
    }

    // If JSON → return directly (no download)
    //  if (format === 'json') {
    //    const data = await response.json();
    //    hideGlobalLoader();
    //    return data;
    //  }

    if (format === 'json') {
      const data = await response.json();

      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      const url = window.URL.createObjectURL(jsonBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'businesses.json';
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      hideGlobalLoader();

      return {
        success: true,
        message: 'JSON file downloaded successfully',
      };
    }

    // Excel or CSV → handle BLOB download
    const blob = await response.blob();

    const fileExtension = format === 'csv' ? 'csv' : 'xlsx';
    const fileName = `businesses.${fileExtension}`;

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    hideGlobalLoader();

    return { success: true, message: 'Exported successfully' };
  } catch (err) {
    hideGlobalLoader();
    console.error('Export error:', err);
    throw err;
  }
}

// export async function getExportBusinessesData({ format }) {
//   console.log(format);
//   try {
//     const queryParams = new URLSearchParams({});

//     if (format) queryParams.append('format', format);

//     showGlobalLoader();
//     //  console.log('Sending getAllBusinesses request...');

//     const allBusinessesData = await safeFetch(
//       `${baseUrl}/api/super-admin/export-businesses?${queryParams.toString()}`,
//       {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//           //  'Content-Type': 'application/json',
//         },
//       }
//     );

//     //  console.log('Response received...');

//     if (allBusinessesData) {
//       // console.log(allBusinessesData);
//       hideGlobalLoader();
//     }

//     //  populateAllBusinessesTable(allBusinessesData);

//     return allBusinessesData;
//   } catch (error) {
//     hideGlobalLoader();

//     console.error('Error receiving All Businesses: Data for export', error);
//     throw error;
//   }
// }
