import config from '../../../config.js';
import { populateGoodsShopDropdown } from '../../goods.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';
import { closeModal, showToast } from '../../script.js';
import { populateShopsTable } from '../../shops.js';
import { populateShopDropdown } from '../../staff.js';
import { fetchBusinessDetails } from '../business/businessResource.js';
import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

// const parsedUserData = userData ? JSON.parse(userData) : null;

const urlParams = new URLSearchParams(window.location.search);
const preselectedShopId = urlParams.get('shopId');

export async function createShop(shopDetails) {
  try {
    //  console.log('Sending POST request...');

    const fetchedData = await safeFetch(`${baseUrl}/api/shop`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopDetails),
    });

    if (fetchedData) {
      // console.log('Shop created successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);
      checkAndPromptCreateShop(); // Refresh the shop list after creation
    }

    //  //  console.log('Response received...');

    //  if (!response.ok) {
    //    // throw new Error(`HTTP error! status: ${response.status}`);
    //    throw new Error(data.message || 'Something went wrong');
    //  }

    //  //  console.log('Shop created successfully:', data);
    //  showToast('success', `✅ ${data.message}`);
    //  checkAndPromptCreateShop(); // Refresh the shop list after creation

    if (document.querySelector('#assignStaffCheckbox').checked) {
      setTimeout(() => {
        const proceed = confirm(
          'You chose to assign a staff to this shop. Would you like to do that now?'
        );
        if (proceed) {
          // Open staff creation modal or navigate to staff creation page

          window.location.href = `staff-profile.html?from=shop-creation&shopId=${fetchedData.data.id}`;
        }
      }, 600);
    }
    return fetchedData;
  } catch (error) {
    console.error('Error creating Shop:', error);
    throw error;
  }
}

export async function fetchShopDetail(shopId) {
  try {
    //  console.log('Sending POST request...');

    const receivedShopDetail = await safeFetch(
      `${baseUrl}/api/shop/${shopId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  console.log('Response received...');

    if (!receivedShopDetail) {
      console.log('Shop detail NOT received :', receivedShopDetail);
      // showToast('success', `✅ ${receivedShopDetail.message}`);
      return;
    }

    return receivedShopDetail;
  } catch (error) {
    console.error('Error creating Admin:', error);
    throw error;
  }
}

// The functions below are used to check if the user has a shop and prompt them to creat one if they don't - checkAndPromptCreateShop, openCreateShopModal, setupCreateShopForm, and setupModalCloseButtons

export async function checkAndPromptCreateShop() {
  const tbody = document.querySelector('.shops-table tbody');
  function showLoadingRow() {
    if (tbody)
      tbody.innerHTML = `
   <tr class="loading-row">
     <td colspan="6" class="table-error-text">Loading shops...</td>
   </tr>
 `;
  }

  showLoadingRow();

  try {
    // Get the business ID from user data

    //  showGlobalLoader();
    //  const businessData = await fetchBusinessDetails();
    //  const businessId = businessData?.data?.id;

    const userData = config.userData;

    const parsedUserData = userData ? JSON.parse(userData) : null;
    const businessId = parsedUserData
      ? parsedUserData.businessId || null
      : null;

    if (!businessId) {
      console.warn('⚠️ No businessId found — skipping fetchBusinessDetails.');
      return;
    }

    const fetchedData = await safeFetch(`${baseUrl}/api/shop`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    let userShops = [];
    let enrichedShopData = [];

    //  console.log('fetchedData', fetchedData);

    if (fetchedData) {
      // hideGlobalLoader();
      userShops = fetchedData.data.filter(
        (shop) => shop.business_id === businessId
      );

      // console.log(userShops);

      // Get staff data for each shop in parallel
      enrichedShopData = await Promise.all(
        userShops.map(async (shop) => {
          //  console.log('shop', shop);
          const staffResponse = await safeFetch(
            `${baseUrl}/api/shop/${shop.id}/staff`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          const staff = staffResponse?.data || [];
          //  const staffList = staffResponse?.data || [];

          //  console.log('staffList', staffList);
          //  console.log('staffList', staff);

          //  const staffNames = staffList
          //    .map(
          //      (staff, i) => `${i + 1}. ${staff.first_name} ${staff.last_name}`
          //    )
          //    .join('<br>');

          //  const staffId = staffList.map((staff) => staff.id);

          // Enrich staff with shopId
          const enrichedStaff = staff.map((staffMember) => ({
            ...staffMember,
            shopId: shop.id, // Add the shopId to each staff member
          }));

          return {
            ...shop,
            staff: enrichedStaff,
            // manager_name: staffNames || '—',
            // staffId: staffId,
          };
        })
      );

      // console.log('ShopResources.js enrichedShopData', enrichedShopData);

      populateShopsTable(enrichedShopData);
      populateShopDropdown(enrichedShopData, Number(preselectedShopId));
      populateGoodsShopDropdown(enrichedShopData);
      // populateUserShop(userShops);

      //  console.log('checkAndPromptCreateShop data', enrichedShopData);

      if (enrichedShopData.length === 0) {
        openCreateShopModal();
      }
    }
    hideGlobalLoader();
    return {
      fetchedData,
      userShops,
      enrichedShopData,
      businessId,
    };
  } catch (error) {
    hideGlobalLoader();
    console.error('Error checking shop:', error.message);
    throw error;
  }
}

export function openCreateShopModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const createShopContainer = document.querySelector('.createShop');

  if (createShopContainer) createShopContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function openUpdateShopModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateShopContainer = document.querySelector('.adminUpdateShopData');

  if (updateShopContainer) updateShopContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function setupCreateShopForm() {
  const form = document.querySelector('.createShopModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const shopNameInput = document.querySelector('#shopName');
      const shopAddressInput = document.querySelector('#shopAddress');

      const serviceTypeCheckboxes = document.querySelectorAll(
        'input[name="serviceType"]:checked'
      );
      const serviceType = Array.from(serviceTypeCheckboxes).map(
        (cb) => cb.value
      );
      const serviceTypeValue = serviceType[0] || null;

      const shopDetails = {
        shopName: shopNameInput.value,
        location: shopAddressInput.value,
        serviceType: serviceTypeValue,
      };

      try {
        showGlobalLoader();
        createShop(shopDetails)
          .then((data) => {
            hideGlobalLoader();
            closeModal();

            // Clear inputs and checkboxes
            shopNameInput.value = '';
            shopAddressInput.value = '';
            document
              .querySelectorAll('input[name="serviceType"]')
              .forEach((cb) => (cb.checked = false));
            // serviceTypeCheckboxes.forEach(
            //   (checkbox) => (checkbox.checked = false)
            // );

            //   redirectWithDelay('Homepage', 'manage.html', 500);
            // window.location.href = 'manage.html';
          })
          .catch((data) => {
            hideGlobalLoader();
            showToast('fail', `❎ ${data.message}`);
            console.error('❎ Failed to create shop:', data.message);
          });
        //   console.log('Creating shop with:', shopDetails);
        // closeModal(); // close modal after success
      } catch (err) {
        console.error('Error creating shop:', err.message);
      }
    });
  }
}

// More Shop functions for shop functionality

export async function deleteShop(shopId) {
  try {
    //  console.log('Sending POST request...');

    showGlobalLoader();

    const response = await fetch(`${baseUrl}/api/shop/${shopId}`, {
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

    //  console.log('Shop deleted successfully:', data);
    showToast('success', `✅ ${data.message}`);
    checkAndPromptCreateShop(); // Refresh list or update UI

    return data;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error deleting Shop', error);
    showToast('error', '❌ Failed to delete Shop');
    throw error;
  }
}

export async function getShopStaff(shopId) {
  // console.log('Fetching shop staff for shopId:', shopId);
  try {
    const fetchedData = await safeFetch(`${baseUrl}/api/shop/${shopId}/staff`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    // If data was fetched successfully, return it
    if (fetchedData) {
      return fetchedData.data;
    }
    return []; // If no data, return empty array
  } catch (error) {
    console.error('Error fetching shop staff:', error);
    return []; // Return empty array on error
  }
}

export async function updateShop(shop_id, shopUpdatedDetails) {
  try {
    console.log('Sending POST request...');

    showGlobalLoader();
    const updateShopData = await safeFetch(`${baseUrl}/api/shop/${shop_id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopUpdatedDetails),
    });

    if (updateShopData) {
      // console.log('Shop info Updated successfully:', updateShopData);
      hideGlobalLoader();
      showToast('success', `✅ ${updateShopData.message}`);
      checkAndPromptCreateShop(); // Refresh list or update UI
    }

    return updateShopData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error Updating Shop Info', error);
    showToast('error', '❌ Failed to Update Shop info');
    throw error;
  }
}
