import config from '../../../config.js';
import { closeModal, showToast } from '../../script.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

export async function createShop(shopDetails) {
  try {
    console.log('Sending POST request...');

    const response = await fetch(`${baseUrl}/api/shop`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopDetails),
    });

    console.log('Response received...');
    const data = await response.json();

    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      throw new Error(data.message || 'Something went wrong');
    }

    console.log('Shop created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating Admin:', error);
    throw error;
  }
}

export async function checkAndPromptCreateShop() {
  try {
    const response = await fetch(`${baseUrl}/api/shop`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();

    const userShops = data.data.filter(
      (shop) => shop.business_id === parsedUserData.businessId
    );

    console.log(userShops);

    if (userShops.length === 0) {
      openCreateShopModal();
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
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
        console.log('Creating shop with:', shopDetails);
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

// // Function to Check and prompt cretae shop
// export async function checkAndPromptCreateShop(shopDetails) {
//   try {
//     console.log('Sending POST request...');
//     const response = await fetch(`${baseUrl}/api/shop`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${userToken}`,
//         //   'Content-Type': 'application/json',
//       },
//     });

//     console.log('Response received...');
//     const data = await response.json();
//     console.log(data);

//     const userShops = data.data.filter(
//       (shop) => shop.business_id === parsedUserData.businessId
//     );

//     if (userShops.length === 0) {
//       const main = document.querySelector('.main');
//       const sidebar = document.querySelector('.sidebar');

//       // JS for create Shop Modal
//       document.addEventListener('DOMContentLoaded', function () {
//         const createShopModal = document.querySelector('.createShopModal');
//         const createShopContainer = document.querySelector('.createShop');

//         createShopContainer.classList.add('active');
//         main.classList.add('blur');
//         sidebar.classList.add('blur');

//         if (createShopModal) {
//           createShopModal.addEventListener('submit', function (e) {
//             e.preventDefault();

//             const shopName = document.querySelector('.shopName').value;
//             const shopAddress = document.querySelector('.shopName').value;

//             const serviceTypeCheckboxes = document.querySelectorAll(
//               'input[name="serviceType"]:checked'
//             );
//             const serviceType = Array.from(serviceTypeCheckboxes).map(
//               (cb) => cb.value
//             );
//             const serviceTypeValue = serviceType[0] || null;

//             const shopDetails = {
//               shopName,
//               shopAddress,
//               serviceType: serviceTypeValue,
//             };

//             checkAndPromptCreateShop(shopDetails);
//           });
//         }
//       });
//     }

//     console.log('User Shop:', userShops);
//     console.log(parsedUserData.businessId);

//     if (!response.ok) {
//       // throw new Error(`HTTP error! status: ${response.status}`);
//       throw new Error(data.message || 'Something went wrong');
//     }

//     //  console.log('detail added successfully:', data);
//     return data;
//   } catch (error) {
//     console.error('Error Adding detail:', data.message);
//     throw error;
//   }
// }

// const closeModalButton = document.querySelectorAll('.closeModal');

// closeModalButton.forEach((closeButton) => {
//   closeButton.addEventListener('click', function () {
//     closeModal();
//     console.log('object');
//   });
// });
