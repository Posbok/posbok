import config from '../../../config.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';
import {
  addMachineFeeForm,
  addPosChargeForm,
  depositPosCapitalForm,
  fundMachineForm,
  populateFeesTable,
  populatePosChargesTable,
} from '../../pos.js';
// import { renderPosTable } from '../../posAndSalesReportAccordion.js';
import {
  closeBusinessDayForm,
  //   depositPosCapitalForm,
  showToast,
} from '../../script.js';
import { initAccountOverview } from '../account/accountOverview.js';
import //   populateFeesTable,
//   populatePosChargesTable,
'../utility/feesTableUtility.js';
import { safeFetch } from '../utility/safeFetch.js';
// import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';

// const shopId = parsedUserData?.shopId;

// console.log(shopId);

function getCurrentDateISO() {
  const now = new Date();
  const localMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ); // Local midnight
  return localMidnight.toISOString();
}

// Deposit POS Capital Modal FOrm
export function openDepositPosCapitalModal() {
  if (isStaff) {
    console.log('object');
    return;
  }

  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const depositPosCapitalContainer =
    document.querySelector('.depositPosCapital');

  if (depositPosCapitalContainer)
    depositPosCapitalContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  depositPosCapitalForm();
}

export function openAdminDepositPosCapitalModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const adminDepositPosCapitalContainer = document.querySelector(
    '.adminDepositPosCapital'
  );

  if (adminDepositPosCapitalContainer)
    adminDepositPosCapitalContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  depositPosCapitalForm();
}

// Fund Machine FOrm
export function openFundMachineModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const fundMachineContainer = document.querySelector('.fundMachine');

  if (fundMachineContainer) fundMachineContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  fundMachineForm();
}

export function openAdminFundMachineModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const adminFundMachineContainer = document.querySelector('.adminFundMachine');

  if (adminFundMachineContainer)
    adminFundMachineContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  fundMachineForm();
}

export function openAClearDashboardFieldModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const adminFundMachineContainer = document.querySelector(
    '.adminClearDashboardFieldModal'
  );

  if (adminFundMachineContainer)
    adminFundMachineContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

// Close Business Modal FOrm
export function openCloseBusinessDayModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const closeBusinessDayContainer = document.querySelector('.closeBusinessDay');

  if (closeBusinessDayContainer)
    closeBusinessDayContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  closeBusinessDayForm();
}

export function openAdminCloseBusinessDayModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const adminCloseBusinessDayContainer = document.querySelector(
    '.adminCloseBusinessDay'
  );

  if (adminCloseBusinessDayContainer)
    adminCloseBusinessDayContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  closeBusinessDayForm();
}

export function openaddPosChargeModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addPosChargeContainer = document.querySelector('.addPosCharge');

  if (addPosChargeContainer) addPosChargeContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  //   console.log('object');

  addPosChargeForm();
}

export function openAddMachineFeeModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addMachineFeesContainer = document.querySelector('.addMachineFees');

  if (addMachineFeesContainer) addMachineFeesContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  //   console.log('object 1');

  addMachineFeeForm();
}

// API CALLS

export async function getCurrentBusinessDay(shopId) {
  try {
    //  console.log('Sending GET request...');

    const currentBusinessDayData = await safeFetch(
      `${baseUrl}/api/pos/business-day?shopId=${shopId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  console.log('Response received...');
    //  console.log('shopId sent to backend:', shopId);
    //  console.log(
    //    'shopId received in response:',
    //    currentBusinessDayData?.data?.shop_id
    //  );

    //  console.log('currentBusinessDayData', currentBusinessDayData);

    return currentBusinessDayData;
  } catch (err) {
    const message = err.message.toLowerCase();

    // Handle case where backend clearly tells us there's no open business day
    if (
      message.includes('no open business day') ||
      message.includes('no business day found') ||
      message.includes('404')
    ) {
      console.warn('No open business day found.');
      return false;
    }

    // Other unexpected or connection-level errors
    console.error('Failed to fetch current business day:', err.message);
    return null;
  }
}

export async function openBusinessDay(openBusinessDayDetails) {
  console.log(openBusinessDayDetails);
  try {
    //  showGlobalLoader();
    console.log('Sending POST request...');

    const openBusinessDayData = await safeFetch(
      // `${baseUrl}/api/business-day/open`,
      `${baseUrl}/api/pos/business-day/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openBusinessDayDetails),
      }
    );

    console.log('Response received...');

    if (openBusinessDayData) {
      console.log('Business Opened successfully:', openBusinessDayData);
      // showToast('success', `✅ ${openBusinessDayData.message}`);
      // hideGlobalLoader();
    }
    //  hideGlobalLoader();

    return openBusinessDayData;
  } catch (error) {
    //  hideGlobalLoader();
    console.error('Error Opening Business:', error);
    throw error;
  }
}

export async function closeBusinessDay(closeBusinessDayDetails) {
  console.log(closeBusinessDayDetails);
  try {
    showGlobalLoader();
    //  console.log('Sending POST request...');

    const closeBusinessDayData = await safeFetch(
      `${baseUrl}/api/pos/business-day/close`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(closeBusinessDayDetails),
      }
    );

    //  console.log('Response received...');

    if (closeBusinessDayData) {
      console.log('Business Closed successfully:', closeBusinessDayData);
      // showToast('success', `✅ ${closeBusinessDayData.message}`);
      hideGlobalLoader();
    }

    return closeBusinessDayData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error Closing Business:', error);
    throw error;
  }
}

export async function addPosCapital(posCapitalDetails) {
  //   console.log(posCapitalDetails);
  try {
    showGlobalLoader();
    //  console.log('Sending POST request...');

    const addPosCapitalData = await safeFetch(
      `${baseUrl}/api/pos/capital`,
      // `${baseUrl}/api/pos/admin/funding`,
      // `${baseUrl}/api/admin-management/fund-cash-in-machine`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posCapitalDetails),
      }
    );

    //  console.log('Response received...');

    if (addPosCapitalData) {
      // console.log('POS Capital added successfully:', addPosCapitalData);
      // showToast('success', `✅ ${addPosCapitalData.message}`);
      // hideGlobalLoader();
    }

    //  isStaff ? initAccountOverview() : '';
    //  initAccountOverview();

    return addPosCapitalData;
  } catch (error) {
    //  hideGlobalLoader();
    console.error('Error Add POS Capital:', error);
    throw error;
  }
}

export async function addFundMachine(fundMachineDetails) {
  //   console.log(posCapitalDetails);
  try {
    showGlobalLoader();
    //  console.log('Sending POST request...');

    const fundMachinelData = await safeFetch(
      //   `${baseUrl}/api/admin/fund-cash-in-machine`,
      `${baseUrl}/api/admin/fund-machine`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fundMachineDetails),
      }
    );

    //  console.log('Response received...');

    if (fundMachinelData) {
      // console.log('Machine Funded successfully:', fundMachinelData);
      // showToast('success', `✅ ${fundMachineDetails.message}`);
      // hideGlobalLoader();
    }

    //  isStaff ? initAccountOverview() : '';

    return fundMachinelData;
  } catch (error) {
    //  hideGlobalLoader();
    console.error('Error Funding Machine :', error);
    throw error;
  }
}

export async function getPosCapital(shopId) {
  //   console.log(shopId);
  try {
    //  console.log('Sending POST request...');

    const posCapital = await safeFetch(
      `${baseUrl}/api/pos/capital?shopId=${shopId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (!posCapital) {
      return;
    }

    return posCapital;
  } catch (error) {
    console.error('Error receiving POS Capital:', error);
    throw error;
  }
}

export async function createPosTransaction(transactionDetail) {
  try {
    //  console.log('Sending POST request...');
    const posTransactionData = await safeFetch(
      `${baseUrl}/api/pos/transactions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionDetail),
      }
    );

    //  console.log('Response received...');

    if (posTransactionData) {
      // console.log('POS transaction added successfully:', posTransactionData);
      showToast('success', `✅ ${posTransactionData.message}`);
      // console.log(posTransactionData);
    }

    return posTransactionData;
  } catch (error) {
    console.error('Error Creating POS Transaction:', error);
    throw error;
  }
}

export async function getPosTransactions({
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
    const posTransactionsData = await safeFetch(
      `${baseUrl}/api/pos/transactions?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (posTransactionsData) {
      // showToast('success', `✅ ${posTransactionsData.message}`);
      hideGlobalLoader();
    }

    return posTransactionsData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error receiving POS Transaction:', error);
    throw error;
  }
}

export async function getPosTransactionsById(transactionId) {
  try {
    showGlobalLoader();
    const posTransactionsData = await safeFetch(
      `${baseUrl}/api/pos/transactions/${transactionId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (posTransactionsData) {
      // showToast('success', `✅ ${posTransactionsData.message}`);
      // console.log('posTransactionsData', posTransactionsData);
      hideGlobalLoader();
    }

    return posTransactionsData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error receiving POS Transaction:', error);
    throw error;
  }
}

export async function deletePosTransaction(transactionId) {
  try {
    //  console.log('Sending POST request...');

    showGlobalLoader();

    const fetchedData = await safeFetch(
      `${baseUrl}/api/pos/transaction/${transactionId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (fetchedData) {
      console.log('POS Transaction deleted successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);
      // await renderPosTable();
      hideGlobalLoader();
    }

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error deleting POS Transaction', error);
    showToast('error', '❌ Failed to delete POS Transaction');
    throw error;
  }
}

export async function getAdminWithdrawals({ shopId, page = 1, filters = {} }) {
  try {
    const queryParams = new URLSearchParams({
      shopId: shopId,
      page,
    });

    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);
    if (filters.group_by) queryParams.append('group_by', filters.group_by);
    if (filters.transaction_type)
      queryParams.append('transaction_type', filters.transaction_type);

    console.log(queryParams.toString());

    console.log(`${baseUrl}/api/admin/withdrawals?${queryParams.toString()}`);

    showGlobalLoader();
    const adminWithdrawalsData = await safeFetch(
      `${baseUrl}/api/admin/withdrawals?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (adminWithdrawalsData) {
      // showToast('success', `✅ ${adminWithdrawalsData.message}`);
      hideGlobalLoader();
    }

    //  console.log('adminWithdrawalsData', adminWithdrawalsData);

    return adminWithdrawalsData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error receiving Admin Withdrawals:', error);
    throw error;
  }
}

export async function getPosAnalytics({ shopId, filters = {} }) {
  try {
    const queryParams = new URLSearchParams({
      shop_id: shopId,
    });

    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);
    if (filters.group_by) queryParams.append('group_by', filters.group_by);
    if (filters.transaction_type)
      queryParams.append('transaction_type', filters.transaction_type);

    //  console.log(queryParams.toString());

    showGlobalLoader();
    const posAnalyticsTransactionsData = await safeFetch(
      `${baseUrl}/api/reports/transaction-analytics?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (posAnalyticsTransactionsData) {
      // showToast('success', `✅ ${posAnalyticsTransactionsData.message}`);
      hideGlobalLoader();
    }

    //  console.log('posAnalyticsTransactionsData', posAnalyticsTransactionsData);

    return posAnalyticsTransactionsData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error receiving POS Transaction:', error);
    throw error;
  }
}

export async function getFinancialSummary({ shopId, filters = {} }) {
  try {
    const queryParams = new URLSearchParams({
      shop_id: shopId,
    });

    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);

    //  console.log(queryParams.toString());

    showGlobalLoader();
    const posFinancialSummaryData = await safeFetch(
      `${baseUrl}/api/reports/financial-summary?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (posFinancialSummaryData) {
      // showToast('success', `✅ ${posFinancialSummaryData.message}`);
      hideGlobalLoader();
    }

    //  console.log('posFinancialSummaryData', posFinancialSummaryData);

    return posFinancialSummaryData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error receiving Financial Summary:', error);
    throw error;
  }
}

export async function configurePosCharges(posChargesDetails) {
  console.log(posChargesDetails);
  try {
    //  console.log('Sending POST request...');

    const posChargesData = await safeFetch(
      `${baseUrl}/api/pos/settings/charges`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posChargesDetails),
      }
    );

    //  console.log('Response received...');

    if (posChargesData) {
      // console.log('POS Charges configured successfully:', posChargesData);
      showToast('success', `✅ ${posChargesData.message}`);

      // Refresh the table list after successful configuration
      getPosChargeSettings();
    }

    return posChargesData;
  } catch (error) {
    console.error('Error Configuring POS Charges:', error);
    throw error;
  }
}

export async function getPosChargeSettings() {
  const tbody = document.querySelector('.posCharge-table tbody');
  function showLoadingRow() {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Loading POS Charges...</td>
    </tr>
  `;
  }

  showLoadingRow();

  try {
    //  console.log('Sending POST request...');

    const posChargeSettingsData = await safeFetch(
      `${baseUrl}/api/pos/settings/charges`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    //  if (posChargeSettingsData) {
    //  }

    //  console.log(posChargeSettingsData);
    populatePosChargesTable(posChargeSettingsData);

    return posChargeSettingsData;
  } catch (error) {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Error Loading POS Charges...</td>
    </tr>
  `;
    console.error('Error receiving POS COnfiguration settings:', error);
    throw error;
  }
}

export async function configurePosMachineFees(posMachineFeesDetails) {
  //   console.log(posMachineFeesDetails);
  try {
    //  console.log('Sending POST request...');

    const posMachineFeesData = await safeFetch(`${baseUrl}/api/fees/settings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(posMachineFeesDetails),
    });

    //  console.log('Response received...');

    if (posMachineFeesData) {
      // console.log(
      //   'POS MachineFees configured successfully:',
      //   posMachineFeesData
      // );
      showToast('success', `✅ ${posMachineFeesData.message}`);

      // Refresh the table list after successful configuration
      getFeeSettings();
    }

    return posMachineFeesData;
  } catch (error) {
    console.error('Error Configuring POS MachineFees:', error);
    throw error;
  }
}

export async function getFeeSettings() {
  const tbody = document.querySelector('.machineFee-table tbody');
  function showLoadingRow() {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Loading Transaction Fees...</td>
    </tr>
  `;
  }

  showLoadingRow();

  try {
    //  console.log('Sending GET request...');

    const posMachineFeeSettingsData = await safeFetch(
      `${baseUrl}/api/fees/settings`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    //  if (posMachineFeeSettingsData) {
    //  }

    //  console.log(posMachineFeeSettingsData);
    populateFeesTable(posMachineFeeSettingsData);

    return posMachineFeeSettingsData;
  } catch (error) {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Error Loading Transaction Fees...</td>
    </tr>
  `;
    console.error('Error receiving POS COnfiguration settings:', error);
    throw error;
  }
}

export async function updateFeeSetting(feeId, updateFeesDetails) {
  const tbody = document.querySelector('.machineFee-table tbody');
  //
  try {
    showGlobalLoader();
    //  console.log('Sending Update request...');

    const fetchedData = await safeFetch(
      `${baseUrl}/api/fees/settings/${feeId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateFeesDetails),
      }
    );

    //  console.log('Response received...');

    if (fetchedData) {
      // console.log('Fee Setting Updated successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);
      await getFeeSettings();

      hideGlobalLoader();
    }

    //  console.log('fetchedData', fetchedData);

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    showToast('error', '❌ Failed to delete Setting');
    console.log(error);
    throw error;
  }
}

export async function deleteFeeSettings(feeId) {
  const tbody = document.querySelector('.machineFee-table tbody');
  //
  try {
    showGlobalLoader();
    //  console.log('Sending DELETE request...');

    const fetchedData = await safeFetch(
      `${baseUrl}/api/fees/settings/${feeId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (fetchedData) {
      // console.log('Staff deleted successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);
      await getFeeSettings();

      hideGlobalLoader();
    }

    //  console.log('fetchedData', fetchedData);

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    showToast('error', '❌ Failed to delete Setting');
    console.log(error);
    throw error;
  }
}

// Admin Withdrawals

export async function createAdminWithdrawal(adminWithdrawalDetails) {
  try {
    //  console.log('Sending POST request...');
    const adminWithdrawalData = await safeFetch(
      `${baseUrl}/api/pos/admin/withdrawal`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminWithdrawalDetails),
      }
    );

    //  console.log('Response received...');

    if (adminWithdrawalData) {
      // console.log('POS transaction added successfully:', adminWithdrawalData);
      showToast('success', `✅ ${adminWithdrawalData.message}`);
      // console.log(adminWithdrawalData);
    }

    return adminWithdrawalData;
  } catch (error) {
    console.error('Error Creating Admin Withdrawal Transaction:', error);
    throw error;
  }
}

// Get Admin dashboard

export async function getAdminDashboard() {
  try {
    //  console.log('Sending POST request...');

    const adminDashboardData = await safeFetch(
      `${baseUrl}/api/admin/dashboard`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (!adminDashboardData) {
      return;
    }

    return adminDashboardData;
  } catch (error) {
    console.error('Error receiving POS Capital:', error);
    throw error;
  }
}

export async function clearDashboardFieldApi(clearDashboardFieldDetails) {
  try {
    //  console.log('Sending POST request...');

    showGlobalLoader();

    const fetchedData = await safeFetch(`${baseUrl}/api/admin/clear-field`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clearDashboardFieldDetails),
    });

    if (fetchedData) {
      // console.log('POS Dashboard Summary cleared successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);
      // await renderPosTable();
      hideGlobalLoader();
    }

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error Clearing POS Dashboard Summary', error);
    showToast('error', '❌ Failed to Clear POS Dashboard Summary');
    throw error;
  }
}

export async function getBusinessDaySummaries({
  shopId,
  page = 1,
  limit = 1,
  filters = {},
}) {
  try {
    const queryParams = new URLSearchParams({
      shop_id: shopId,
      page,
      limit,
    });

    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);

    //  console.log(queryParams.toString());

    showGlobalLoader();
    const posFinancialSummaryData = await safeFetch(
      `${baseUrl}/api/pos/admin/business-day-summaries?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (posFinancialSummaryData) {
      // showToast('success', `✅ ${posFinancialSummaryData.message}`);
      hideGlobalLoader();
    }

    //  console.log('posFinancialSummaryData', posFinancialSummaryData);

    return posFinancialSummaryData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error receiving Financial Summary:', error);
    throw error;
  }
}
