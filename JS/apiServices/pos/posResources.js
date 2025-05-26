import config from '../../../config.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';
import {
  addMachineFeeForm,
  addPosChargeForm,
  populateMachineFeesTable,
  populatePosChargesTable,
} from '../../pos.js';
import { depositPosCapitalForm, showToast } from '../../script.js';
import { safeFetch } from '../utility/safeFetch.js';
// import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const shopId = parsedUserData?.shopId;

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

export async function addPosCapital(posCapitalDetails) {
  console.log(posCapitalDetails);
  try {
    console.log('Sending POST request...');

    const addPosCapitalData = await safeFetch(`${baseUrl}/api/pos/capital`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(posCapitalDetails),
    });

    console.log('Response received...');

    if (addPosCapitalData) {
      console.log('POS Capital added successfully:', addPosCapitalData);
      showToast('success', `✅ ${addPosCapitalData.message}`);
    }

    return addPosCapitalData;
  } catch (error) {
    console.error('Error Add POS Capital:', error);
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

    //  if (posCapital) {
    //  }

    return posCapital;
  } catch (error) {
    console.error('Error receiving POS Capital:', error);
    throw error;
  }
}

export function openDepositPosCapitalModal() {
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

export async function createPosTransaction(transactionDetail) {
  try {
    console.log('Sending POST request...');
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

    console.log('Response received...');

    if (posTransactionData) {
      console.log('POS transaction added successfully:', posTransactionData);
      showToast('success', `✅ ${posTransactionData.message}`);
      console.log(posTransactionData);
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

    const posMachineFeesData = await safeFetch(
      `${baseUrl}/api/pos/settings/fees`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posMachineFeesDetails),
      }
    );

    //  console.log('Response received...');

    if (posMachineFeesData) {
      // console.log(
      //   'POS MachineFees configured successfully:',
      //   posMachineFeesData
      // );
      showToast('success', `✅ ${posMachineFeesData.message}`);

      // Refresh the table list after successful configuration
      getPosMachineFeesettings();
    }

    return posMachineFeesData;
  } catch (error) {
    console.error('Error Configuring POS MachineFees:', error);
    throw error;
  }
}

export async function getPosMachineFeesettings() {
  const tbody = document.querySelector('.machineFee-table tbody');
  function showLoadingRow() {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Loading POS Machine Fees...</td>
    </tr>
  `;
  }

  showLoadingRow();

  try {
    //  console.log('Sending GET request...');

    const posMachineFeeSettingsData = await safeFetch(
      `${baseUrl}/api/pos/settings/fees`,
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
    populateMachineFeesTable(posMachineFeeSettingsData);

    return posMachineFeeSettingsData;
  } catch (error) {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Error Loading POS Machine Fees...</td>
    </tr>
  `;
    console.error('Error receiving POS COnfiguration settings:', error);
    throw error;
  }
}

// getPosChargeSettings();
// getPosMachineFeesettings();
