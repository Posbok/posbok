import config from '../../../config';
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
