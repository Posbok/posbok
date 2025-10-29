import config from '../../config.js';
import { safeFetch } from '../apiServices/utility/safeFetch.js';

import { hideGlobalLoader, showGlobalLoader } from '../helper/helper.js';
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
