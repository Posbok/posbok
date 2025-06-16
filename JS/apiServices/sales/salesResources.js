import config from '../../../config';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper';
import { safeFetch } from '../utility/safeFetch';

const baseUrl = config.baseUrl;
const userToken = config.token;

export async function createSale(saleDetails) {
  try {
    console.log('Sending POST request...');
    const soldData = await safeFetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleDetails),
    });

    console.log('soldData received...');

    //  if (soldData) {
    //    // console.log('Sale added successfully:', soldData);
    //    showToast('success', `✅ ${soldData.message}`);
    //  }

    console.log('soldData:', soldData);
    return soldData;
  } catch (error) {
    console.error('Error Creating Sale:', error.message);
  }
}

export async function getAllSales({
  shopId,
  page = 1,
  limit = 10,
  filters = {},
}) {
  try {
    const queryParams = new URLSearchParams({
      shopId,
      page,
      limit,
    });

    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);

    showGlobalLoader();
    const salesData = await safeFetch(
      `${baseUrl}/api/sales?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (salesData) {
      hideGlobalLoader();
    }

    console.log('salesData received...');

    console.log('salesData:', salesData);

    return salesData;
  } catch (error) {
    console.error('Error fetching sales:', error.message);
  }
}

export async function getSaleById(saleId) {
  try {
    const selectedSaleData = await safeFetch(`${baseUrl}/api/sales/${saleId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    console.log('selectedSaleData received...');

    console.log('selectedSaleData:', selectedSaleData);

    return selectedSaleData;
  } catch (error) {
    console.error('Error fetching sales:', error.message);
  }
}
