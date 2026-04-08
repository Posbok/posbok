import { hideBtnLoader, hideGlobalLoader } from '../../helper/helper';
import { handleLogout, showToast } from '../../script';

export async function safeFetch(url, options) {
  try {
    const response = await fetch(url, options);

    //  console.log(url, options, response);

    if (!response.ok) {
      const data = await response.json();
      if (data.message && data.message.includes("reading 'count'")) {
        console.warn("Silenced backend 'count' error.");
        // Return a neutral object so the calling code doesn't crash
        // trying to read properties of undefined
        return { data: null, status: 'silenced' };
      }
      // hideGlobalLoader();
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error during fetch:', error);
    //  hideGlobalLoader();

    if (
      error.message.includes(
        'You are not allowed to access the system at this time',
      )
    ) {
      await handleLogout(true); // auto-triggered logout
    }

    // Check for ECONNREFUSED specifically
    if (error.message.includes('ECONNREFUSED')) {
      showToast(
        'warning',
        'Server is down or unreachable. Please try again later.',
      );
      // hideGlobalLoader();
    } else {
      // hideGlobalLoader();
      showToast('error', `❌ ${error.message}`);
    }

    // Error during fetch: Error: Cannot read properties of undefined (reading 'count')

    //  if (
    //    error.message.includes(
    //      "Cannot read properties of undefined (reading 'count')",
    //    )
    //  ) {
    //    return;
    //  }

    if (e) throw error; // Return null in case of error
  }
}

// export async function safeFetch(url, options) {
//   try {
//     const response = await fetch(url, options);

//     if (!response.ok) {
//       const data = await response.json();
//       throw new Error(data.message || `HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error during fetch:', error);
//     showToast('error', `❌ ${error.message}`);
//     throw error; // Return null in case of error
//   }
// }

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
