import config from '../../../config.js';
import { closeModal, showToast } from '../../script.js';
import { populateShopsTable } from '../../shops.js';
import { populateShopDropdown } from '../../staff.js';
import { fetchBusinessDetails } from '../business/businessResource.js';
import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

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
    const businessData = await fetchBusinessDetails();
    const businessId = businessData?.data?.id;

    if (!businessId) throw new Error('Business ID not found');

    const fetchedData = await safeFetch(`${baseUrl}/api/shop`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    //  console.log('fetchedData', fetchedData);

    if (fetchedData) {
      const userShops = fetchedData.data.filter(
        (shop) => shop.business_id === businessId
      );

      // Get staff data for each shop in parallel
      const enrichedShopData = await Promise.all(
        userShops.map(async (shop) => {
          const staffResponse = await safeFetch(
            `${baseUrl}/api/shop/${shop.id}/staff`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          const staffList = staffResponse?.data || [];
          const staffNames = staffList
            .map(
              (staff, i) => `${i + 1}. ${staff.first_name} ${staff.last_name}`
            )
            .join('<br>');

          return {
            ...shop,
            manager_name: staffNames || '—',
          };
        })
      );

      populateShopsTable(enrichedShopData);
      populateShopDropdown(enrichedShopData, Number(preselectedShopId));

      //  console.log('checkAndPromptCreateShop data', enrichedShopData);

      if (enrichedShopData.length === 0) {
        openCreateShopModal();
      }
    }

    return fetchedData;
  } catch (error) {
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
        createShop(shopDetails)
          .then((data) => {
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

export function setupModalCloseButtons() {
  const closeModalButtons = document.querySelectorAll('.closeModal');
  const createShopContainer = document.querySelector('.createShop');
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');

  closeModalButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (createShopContainer) createShopContainer.classList.remove('active');
      if (main) main.classList.remove('blur');
      if (sidebar) sidebar.classList.remove('blur');
    });
  });
}

// More Shop functions for shop functionality

export async function deleteShop(shopId) {
  try {
    console.log('Sending POST request...');

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

    console.log('Shop deleted successfully:', data);
    showToast('success', `✅ ${data.message}`);
    checkAndPromptCreateShop(); // Refresh list or update UI

    return data;
  } catch (error) {
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
