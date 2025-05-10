import config from '../../../config.js';
import { depositPosCapitalForm, showToast } from '../../script.js';
import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const shopId = parsedUserData?.shopId || dummyShopId;

// console.log(shopId);

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

    if (posCapital) {
      // console.log('POS Capital received successfully:', posCapital);
      // showToast('success', `✅ ${posCapital.message}`);
      // checkAndPromptaddPosCapital(); // Refresh the Staff list after creation
    }

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
    }

    return posTransactionData;
  } catch (error) {
    console.error('Error posting product:', error);
  }
}

export async function getPosTransactions(shopId) {
  //   console.log(shopId);
  try {
    //  console.log('Sending POST request...');

    const posTransactionsData = await safeFetch(
      `${baseUrl}/api/pos/transactions?shopId=${shopId}&page=1&limit=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (posTransactionsData) {
      // console.log('POS Transactiion received successfully:', posTransactionsData);

      showToast('success', `✅ ${posTransactionsData.message}`);
    }

    return posTransactionsData;
  } catch (error) {
    console.error('Error receiving POS Transactiion:', error);
    throw error;
  }
}

// export async function getPosTransactions(page = 1, pageSize = 25) {
//   const todayISO = getCurrentDateISO();

//   try {
//     const response = await fetch(
//       `${baseUrl}/api/pos-transactions?filters[createdAt][$gte]=${todayISO}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true&populate[transaction_type]=*&populate[withdrawal_type]=*`,

//       // `${baseUrl}/api/pos-transactions?pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true&populate[transaction_type]=*&populate[withdrawal_type]=*`,

//       {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${apiToken}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data; // Return both transaction data and pagination metadata
//   } catch (error) {
//     console.error('Error fetching POS transactions:', error);
//     return { data: [], meta: { pagination: { pageCount: 1 } } };
//   }
// }

// export async function getPosTransactions() {
//   try {
//     //  console.log('Sending GET request...');
//     const response = await fetch(
//       `${baseUrl}/api/pos-transactions?populate[transaction_type]=*&populate[withdrawal_type]=*`,
//       {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${apiToken}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     //  console.log('Response received...');

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     //  console.log('PosTransactions:', data);

//     return data;
//   } catch (error) {
//     //  console.error('Error fetching PosTransactions:', error);
//     return [];
//   }
// }

export async function createPosTransactin(transactionDetail) {
  try {
    //  console.log('Sending POST request...');
    const response = await fetch(
      `${baseUrl}/api/pos-transactions?populate[transaction_type]=*&populate[withdrawal_type]=*`,
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    //  console.log('Product added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error posting product:', error);
  }
}

// export async function deleteAllTransactions() {
//   const apiUrl = '${baseUrl}/api/pos-transactions';

//   try {
//     const response = await fetch(apiUrl, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${apiToken}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Error: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('Pos transcation deleted successfully:', data);
//     return { success: true, data };
//   } catch (error) {
//     console.error('Error deleting all transactions:', error);
//     return { success: false, error };
//   }
// }
