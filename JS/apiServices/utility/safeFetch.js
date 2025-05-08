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
    showToast('error', `❌ ${error.message}`);
    throw error; // Return null in case of error
  }
}

// import { showToast } from '../../script';

// export async function safeFetch(url, options) {
//   try {
//     const response = await fetch(url, options);

//     if (!response.ok) {
//       let errorMessage = `HTTP error! status: ${response.status}`;
//       try {
//         const data = await response.json();
//         errorMessage = data.message || errorMessage;
//       } catch (_) {
//         // Failed to parse JSON, leave the default message
//       }
//       throw new Error(errorMessage);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error during fetch:', error);

//     // Show toast for both network and HTTP errors
//     showToast('error', `❌ ${error.message || 'Something went wrong'}`);

//     throw error;
//   }
// }
