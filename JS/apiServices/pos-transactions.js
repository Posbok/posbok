import config from '../../config.js';

const baseUrl = config.baseUrl;
const userToken = localStorage.getItem('accessToken');

function getCurrentDateISO() {
  const now = new Date();
  const localMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ); // Local midnight
  return localMidnight.toISOString();
}

export async function createPosTransaction(transactionDetail) {
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
