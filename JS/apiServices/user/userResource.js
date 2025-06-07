import config from '../../../config.js';
import {
  clearFormInputs,
  hideGlobalLoader,
  showGlobalLoader,
} from '../../helper/helper.js';
import { closeModal, showToast } from '../../script.js';
import { populateStaffTable } from '../../staff.js';
import { fetchBusinessDetails } from '../business/businessResource.js';
import { checkAndPromptCreateShop } from '../shop/shopResource.js';
import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

const params = new URLSearchParams(window.location.search);
const shopId = params.get('shopId');
const from = params.get('from');
const isStaffProfilePage = window.location.href.includes('staff-profile');

let enrichedShopData = [];

// window.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const shopData = await checkAndPromptCreateShop();

//     // Assign to outer variables

//     //  enrichedShopData = shopData.enrichedShopData;

//     //  await checkAndPromptCreateStaff();

//     //  console.log('Shops loaded:', userShops);
//     //  console.log('enrichedShopData loaded:', enrichedShopData);

//     // ✅ Now that data is available, call populateStaffTable here
//     //  populateStaffTable();

//     // Now you can safely call functions below that depend on them
//   } catch (err) {
//     console.error('Failed to load shop data:', err.message);
//   }
// });

export async function createStaff(staffDetails) {
  try {
    //  console.log('Sending POST request...');

    const createStaffData = await safeFetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffDetails),
    });

    //  console.log('Response received...');

    if (createStaffData) {
      // console.log('Staff created successfully:', createStaffData);
      showToast('success', `✅ ${createStaffData.message}`);
      checkAndPromptCreateStaff(); // Refresh the Staff list after creation
    }

    return createStaffData;
  } catch (error) {
    console.error('Error creating Admin:', error);
    throw error;
  }
}

export async function fetchProfileDetails() {
  try {
    showGlobalLoader();
    console.log('Fetching profile details for user');

    const fetchedData = await safeFetch(`${baseUrl}/api/users/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    console.log('Response received...');
    console.log(fetchedData);
    hideGlobalLoader();

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error Fetching Profile Info:', error.message);
    throw error;
  }
}

export async function fetchStaffDetail(staffId) {
  try {
    //  console.log('Sending POST request...');

    const receivedStaffDetail = await safeFetch(
      `${baseUrl}/api/users/${staffId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  console.log('Response received...');

    if (!receivedStaffDetail) {
      // showToast('fail', `✅ ${receivedStaffDetail.message}`);
      return;
    }

    //  console.log('Staff detail received successfully:', receivedStaffDetail);

    return receivedStaffDetail;
  } catch (error) {
    console.error('Error creating Admin:', error);
    throw error;
  }
}

// export async function fetchAndDisplayAllShopStaff() {
//   try {
//     const businessData = await fetchBusinessDetails();
//     const businessId = businessData?.data?.id;

//     if (!businessId) throw new Error('Business ID not found');

//     const fetchedShops = await safeFetch(`${baseUrl}/api/shop`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${userToken}`,
//       },
//     });

//     if (!fetchedShops || !fetchedShops.data) return;

//     const userShops = fetchedShops.data.filter(
//       (shop) => shop.business_id === businessId
//     );

//     // Fetch staff for each shop and attach shopId
//     const allStaffWithShopId = [];

//     for (const shop of userShops) {
//       const staffResponse = await safeFetch(
//         `${baseUrl}/api/shop/${shop.id}/staff`,
//         {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${userToken}`,
//           },
//         }
//       );

//       const staffList = staffResponse?.data || [];

//       const enrichedStaff = staffList.map((staff) => ({
//         ...staff,
//         shopId: shop.id,
//         shopName: shop.shop_name,
//       }));

//       allStaffWithShopId.push(...enrichedStaff);
//     }

//     console.log('allStaffWithShopId', allStaffWithShopId);

//     // Display the enriched staff list in the staff table
//     populateStaffTable(allStaffWithShopId);
//   } catch (error) {
//     console.error('Error fetching staff across shops:', error.message);
//     throw error;
//   }
// }

// fetchAndDisplayAllShopStaff();

// The functions below are used to check if the user has a Staff and prompt them to creat one if they don't - checkAndPromptCreateStaff, openCreateStaffModal, setupCreateStaffForm, and setupModalCloseButtons

export async function checkAndPromptCreateStaff() {
  function showLoadingRow() {
    const tbody = document.querySelector('.staff-table tbody');
    if (tbody)
      tbody.innerHTML = `
   <tr class="loading-row">
     <td colspan="6" class="table-error-text">Loading Staff...</td>
   </tr>
 `;
  }

  showLoadingRow();

  //   console.log('enrichedShopData', enrichedShopData);

  try {
    const { enrichedShopData: loadedShops } = await checkAndPromptCreateShop();
    enrichedShopData = loadedShops;

    const response = await fetch(`${baseUrl}/api/users?page=1&limit=10`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();
    const allStaffs = data.data.users || [];

    // Filter out admins
    const nonAdminStaff = allStaffs.filter(
      (staff) => staff.accountType !== 'ADMIN'
    );

    // If we’re on staff-profile and there is only one staff (admin)
    const onlyAdminExists =
      allStaffs.length === 1 && allStaffs[0].accountType === 'ADMIN';

    const shouldOpenModal =
      (onlyAdminExists && isStaffProfilePage) ||
      (from === 'shop-creation' && isStaffProfilePage);

    if (shouldOpenModal) {
      openCreateStaffModal();

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('from');
      window.history.replaceState({}, '', newUrl);
    }

    // Populate the table with all business staff
    //  console.log('allStaffs', allStaffs);
    //  console.log('enrichedShopData', enrichedShopData);

    populateStaffTable(allStaffs, enrichedShopData);

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('Error checking Staff:', error.message);
    throw error;
  }

  //   try {
  //     const response = await fetch(`${baseUrl}/api/users?page=1&limit=10`, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${userToken}`,
  //       },
  //     });

  //     const data = await response.json();
  //     console.log(data);

  //     const allStaffs = data.data.users || [];

  //     const businessStaffIsAdmin = data.data.users.filter(
  //       (staff) => staff.accountType === 'ADMIN'
  //     );

  //     // Show modal if:
  //     // (1) Only ADMIN exists, and we're on the staff-profile page
  //     // (2) Redirected from shop creation
  //     if (
  //       (allStaffs.length === 0 && businessStaffIsAdmin && isStaffProfilePage) ||
  //       (from === 'shop-creation' && isStaffProfilePage)
  //     ) {
  //       openCreateStaffModal();
  //     }

  //     // Populate the table with all business staff
  //     populateStaffTable(allStaffs);

  //     if (!response.ok) {
  //       throw new Error(data.message || 'Something went wrong');
  //     }

  //     return data;
  //   } catch (error) {
  //     console.error('Error checking Staff:', error.message);
  //     throw error;
  //   }
}

export function openCreateStaffModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const createStaffContainer = document.querySelector('.addUser');

  if (createStaffContainer) createStaffContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function openUpdateStaffModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateStaffContainer = document.querySelector('.adminUpdateUserData');

  if (updateStaffContainer) updateStaffContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function openManageStaffModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const ManageStaffContainer = document.querySelector('.staffManage');

  if (ManageStaffContainer) ManageStaffContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export async function deleteUser(user_id) {
  try {
    //  console.log('Sending POST request...');

    showGlobalLoader();

    const response = await fetch(`${baseUrl}/api/users/${user_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    if (data) {
      hideGlobalLoader();
    }

    //  console.log('Staff deleted successfully:', data);
    showToast('success', `✅ ${data.message}`);
    checkAndPromptCreateStaff(); // Refresh list or update UI

    return data;
  } catch (error) {
    hideGlobalLoader();
    //  console.error('Error deleting Staff', error);
    showToast('error', '❌ Failed to delete staff');
    throw error;
  }
}

export async function assignUserToShop(user_id, staffAssigningDetails) {
  try {
    //  console.log('Sending POST request...');

    const assignUserToShopData = await safeFetch(
      `${baseUrl}/api/users/${user_id}/shops`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffAssigningDetails),
      }
    );

    if (assignUserToShopData) {
      // console.log('Staff assigned to shop successfully:', assignUserToShopData);
      showToast('success', `✅ ${assignUserToShopData.message}`);
      checkAndPromptCreateStaff(); // Refresh list or update UI
    }

    return assignUserToShopData;
  } catch (error) {
    console.error('Error Assigning Staff', error);
    showToast('error', '❌ Failed to Assign staff');
    throw error;
  }
}

// CORS ISSUE WIH THIS ENDPOINT - NO ACCESS-CONTROL-ALLOW-ORIGIN HEADER
// export async function assignStaffToShop(shop_id, staffDetailsForAssigningShop) {
//   try {
//     //  console.log('Sending POST request...');

//     const assignStaffToShopData = await safeFetch(
//       `${baseUrl}/api/users/${shop_id}/shops`,
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(staffDetailsForAssigningShop),
//       }
//     );

//     if (assignStaffToShopData) {
//       // console.log('Staff assigned to shop successfully:', assignStaffToShopData);
//       showToast('success', `✅ ${assignStaffToShopData.message}`);
//       checkAndPromptCreateStaff(); // Refresh list or update UI
//     }

//     return assignStaffToShopData;
//   } catch (error) {
//     console.error('Error Assigning Staff', error);
//     showToast('error', '❌ Failed to Assign staff');
//     throw error;
//   }
// }

export async function updateUser(user_id, staffUpdatedDetails) {
  try {
    //  console.log('Sending POST request...');

    const updateStaffData = await safeFetch(`${baseUrl}/api/users/${user_id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffUpdatedDetails),
    });

    if (updateStaffData) {
      // console.log('Staff info Updated successfully:', updateStaffData);
      showToast('success', `✅ ${updateStaffData.message}`);
      checkAndPromptCreateStaff(); // Refresh list or update UI
    }

    return updateStaffData;
  } catch (error) {
    console.error('Error Updating Staff Info', error);
    showToast('error', '❌ Failed to Update staff info');
    throw error;
  }
}

export async function removeStaffFromShop(user_id, shop_id) {
  console.log(user_id, shop_id);
  try {
    console.log('Sending POST request...');

    const fetchedData = await safeFetch(
      `${baseUrl}/api/users/${user_id}/shops/${shop_id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (fetchedData) {
      console.log('Staff removed from shop successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);
      checkAndPromptCreateStaff(); // Refresh list or update UI
    } else {
      console.log('Failed to remove staff from shop:', fetchedData);
    }

    return fetchedData;
  } catch (error) {
    console.error('Error removing Staff from shop', error);
    showToast('error', '❌ Failed to remove Staff from shop');
    throw error;
  }
}
