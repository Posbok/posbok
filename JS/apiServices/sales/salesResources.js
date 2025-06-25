import config from '../../../config';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper';
import { safeFetch } from '../utility/safeFetch';

const baseUrl = config.baseUrl;
const userToken = config.token;

export async function createSale(saleDetails) {
  try {
    //  console.log('Sending POST request...');
    const soldData = await safeFetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleDetails),
    });

    //  console.log('soldData received...');

    //  if (soldData) {
    //    // console.log('Sale added successfully:', soldData);
    //    showToast('success', `✅ ${soldData.message}`);
    //  }

    //  console.log('soldData:', soldData);
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
    if (filters.paymentMethod)
      queryParams.append('paymentMethod', filters.paymentMethod);
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

    //  console.log(`/api/sales?${queryParams.toString()}`);
    //  console.log('🧾 Sales FILTERING:', filters);

    if (salesData) {
      hideGlobalLoader();
    }

    //  console.log('salesData received...');

    //  console.log('salesData:', salesData);

    return salesData;
  } catch (error) {
    console.error('Error fetching sales:', error.message);
  }
}

export async function getSaleById(saleId) {
  try {
    showGlobalLoader();
    const selectedSaleData = await safeFetch(`${baseUrl}/api/sales/${saleId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    //  console.log('selectedSaleData received...');

    //  console.log('selectedSaleData:', selectedSaleData);
    hideGlobalLoader();
    return selectedSaleData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching sales:', error.message);
  }
}

export async function getSalesByStaff(staffId) {
  try {
    showGlobalLoader();
    const selectedStaffData = await safeFetch(
      `${baseUrl}/api/sales/staff/${staffId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  console.log('selectedStaffData received...');

    //  console.log('selectedStaffData:', selectedStaffData);
    hideGlobalLoader();
    return selectedStaffData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching Staffs:', error.message);
  }
}

export async function getSalesByProduct(ProductId) {
  try {
    showGlobalLoader();
    const selectedProductData = await safeFetch(
      `${baseUrl}/api/sales/product/${ProductId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  console.log('selectedProductData received...');

    //  console.log('selectedProductData:', selectedProductData);
    hideGlobalLoader();
    return selectedProductData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching Products:', error.message);
  }
}

export async function getDailySalesSummary(shopId, date) {
  try {
    showGlobalLoader();
    const dailySalesSummaryData = await safeFetch(
      `${baseUrl}/api/sales/summary/daily?date=${date}&shopId=${shopId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    console.log(
      `${baseUrl}/api/sales/summary/daily?date=${date}&shopId=${shopId}`
    );

    //  console.log('dailySalesSummaryData received...');

    //  console.log('dailySalesSummaryData:', dailySalesSummaryData);
    hideGlobalLoader();
    return dailySalesSummaryData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching Products:', error.message);
  }
}

export async function getMonthlySalesSummary(year, month, shopId) {
  console.log(year, month, shopId);
  try {
    showGlobalLoader();
    const monthlySalesSummaryData = await safeFetch(
      `${baseUrl}/api/sales/summary/monthly?year=${year}&month=${month}&shopId=${shopId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    console.log(
      `${baseUrl}/api/sales/summary/monthly?year=${year}&month=${month}&shopId=${shopId}`
    );

    //  console.log('monthlySalesSummaryData received...');

    //  console.log('monthlySalesSummaryData:', monthlySalesSummaryData);
    hideGlobalLoader();
    return monthlySalesSummaryData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching Products:', error.message);
  }
}
