import config from '../../../config.js';
import {
  renderBusinessDetails,
  //   renderBusinessSettings,
} from '../../business.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';
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
    console.error('Error checking Business:', error.message);
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

// GEt Business Settings

export async function getBusinessSettings() {
  if (!businessId) {
    //   console.warn('⚠️ No businessId found — skipping fetchBusinessDetails.');
    return;
  }

  try {
    const fetchedData = await safeFetch(
      `${baseUrl}/api/fees/business-settings`,
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

// Enable/Disable Manual Fee
export async function setManualFee(updateManualFeeData) {
  showGlobalLoader();

  try {
    const updateManualFee = await safeFetch(`${baseUrl}/api/fees/manual-fee`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateManualFeeData),
    });

    if (updateManualFee) {
      // console.log('Manual Fee Updated successfully:', updateManualFee);
      hideGlobalLoader();
      showToast('success', `✅ ${updateManualFee.message}`);

      // Refresh list or update UI
      // fetchBusinessDetails();
      // renderBusinessSettings();
    }

    return updateManualFee;
  } catch (error) {
    console.error('Error Updating Manual Fee:', error.message);
    throw error;
  }
}

// Enable/Disable Manual Fee
export async function setManualPosCharges(updateManualPosChargesData) {
  showGlobalLoader();

  try {
    const updateManualPosChargesFee = await safeFetch(
      `${baseUrl}/api/fees/pos-manual-charge`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateManualPosChargesData),
      }
    );

    if (updateManualPosChargesFee) {
      // console.log(
      //   'Manual POS Charges Updated successfully:',
      //   updateManualPosChargesFee
      // );
      hideGlobalLoader();
      showToast('success', `✅ ${updateManualPosChargesFee.message}`);

      // Refresh list or update UI
      // fetchBusinessDetails();
      // renderBusinessSettings();
    }

    return updateManualPosChargesFee;
  } catch (error) {
    console.error('Error Updating Manual Fee:', error.message);
    throw error;
  }
}

// Enable/Disable Trandfer Fee
export async function setTransferFee(updateTransferFeeData) {
  showGlobalLoader();

  try {
    const updateTransferFee = await safeFetch(
      `${baseUrl}/api/fees/transfer-fee`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateTransferFeeData),
      }
    );

    if (updateTransferFee) {
      // console.log('Transfer Fee Updated successfully:', updateTransferFee);
      hideGlobalLoader();
      showToast('success', `✅ ${updateTransferFee.message}`);

      // Refresh list or update UI
      // renderBusinessSettings();
    }

    return updateTransferFee;
  } catch (error) {
    console.error('Error Updating Transfer Fee:', error.message);
    throw error;
  }
}

export async function getStaffOverview() {
  try {
    showGlobalLoader();
    const staffOverviewData = await safeFetch(
      `${baseUrl}/api/reports/staff-overview`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  console.log('staffOverviewData received...');

    //  console.log('staffOverviewData:', staffOverviewData);
    hideGlobalLoader();
    return staffOverviewData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching Staffs:', error.message);
  }
}

export async function getReportDashboard(filters) {
  //   console.log(filters);
  try {
    showGlobalLoader();
    const reportDashboardData = await safeFetch(
      `${baseUrl}/api/reports/dashboard?period=${filters.period}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  console.log('reportDashboardData received...');

    //  console.log('reportDashboardData:', reportDashboardData);
    hideGlobalLoader();
    return reportDashboardData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching Report Dashboard:', error.message);
  }
}

export async function getPosDailySummary(business_id) {
  //   console.log(filters);
  try {
    showGlobalLoader();
    const posDailySummaryData = await safeFetch(
      `${baseUrl}/api/business/${business_id}/shops`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  console.log('posDailySummaryData received...');

    //  console.log('posDailySummaryData:', posDailySummaryData);
    hideGlobalLoader();
    return posDailySummaryData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error fetching Report Dashboard:', error.message);
  }
}
