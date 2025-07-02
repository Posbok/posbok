import config from '../config';
import './script.js';
import { loginUser } from './apiServices/login';
import { safeFetch } from './apiServices/utility/safeFetch';
import { hideBtnLoader, showBtnLoader } from './helper/helper';
import { redirectWithDelay, showToast } from './script';

const loginForm = document.getElementById('loginForm');
const baseUrl = config.baseUrl;

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // stop page refresh

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userDetails = {
      email,
      password,
    };

    //  console.log('📦 User Details:', userDetails);

    const loginSubmitBtn = document.querySelector('.loginSubmitBtn');

    showBtnLoader(loginSubmitBtn);
    loginUser(userDetails)
      .then(async (data) => {
        const user = data.data.user;
        const token = data.data.accessToken;

        //   Stores the access token in local storage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userData', JSON.stringify(user));

        const today = new Date().toISOString().split('T')[0]; // e.g., "2025-05-04"
        localStorage.setItem('loginDate', today);

        // If staff, fetch and store their shop data
        console.log('🚨 Logged in user:', user);
        if (user.accountType === 'STAFF') {
          console.log('code got here');
          const shopKey = `shop_${user.id}`;
          const staffShopId = user.shopId;
          try {
            const shopResponse = await safeFetch(
              `${baseUrl}/api/shop/${staffShopId}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!shopResponse) {
              throw new Error(shopResponse.message || 'Failed to get shop');
            }

            localStorage.setItem(shopKey, JSON.stringify(shopResponse.data));
            console.log(`✅ Shop data stored under key: ${shopKey}`);
          } catch (err) {
            console.warn(`⚠️ Could not fetch staff shop: ${err.message}`);
          }
        }

        //   redirectWithDelay('Homepage', 'index.html', 500);
        window.location.href = 'index.html';
        hideBtnLoader(loginSubmitBtn);
      })
      .catch((data) => {
        hideBtnLoader(loginSubmitBtn);
        showToast('fail', `❎ ${data.message}`);
        console.error('❎ Failed to login:', data.message);
      });
  });
}

// // Dummy first login before full page
// localStorage.setItem('isLoggedIn', true);

// const signUpButton = document.getElementById('signUp');
// const signInButton = document.getElementById('signIn');
// const container = document.getElementById('container');

// if (container) {
//   signUpButton.addEventListener('click', () => {
//     container.classList.add('right-panel-active');
//   });

//   signInButton.addEventListener('click', () => {
//     container.classList.remove('right-panel-active');
//   });
// }
// function redirectToIndex() {
//   window.location.href = 'index.html';
// }
