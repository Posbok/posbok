import { showToast } from '../../script';

export async function safeFetch(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error during fetch:', error);
    //  showToast('error', `❌ ${error.message}`);
    throw error; // Return null in case of error
  }
}
