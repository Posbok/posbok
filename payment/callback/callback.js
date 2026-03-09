// import { showToast } from '../../JS/script';

import config from '../../config';
import { safeFetch } from '../../JS/apiServices/utility/safeFetch';
import { redirectWithDelay, showToast } from '../../JS/script';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

const params = new URLSearchParams(window.location.search);
const shopId = params.get('shopId');
const from = params.get('from');
const isStaffProfilePage = window.location.href.includes('staff-profile');

let enrichedShopData = [];

// import { redirectWithDelay } from '../../JS/script';

async function verifyPayment() {
  //   const loader = document.getElementById('main-loader');
  //   const statusText = document.getElementById('status-text');

  //   // Start the timer immediately when verification starts
  //   const timer = setTimeout(() => {
  //     if (loader && loader.style.display !== 'none') {
  //       statusText.innerHTML += `<br><button class="hero-btn-dark mt-2" onclick="location.reload()">Re-check Payment</button>`;
  //     }
  //   }, 10000);

  try {
    const params = new URLSearchParams(window.location.search);

    const reference =
      params.get('reference') || localStorage.getItem('paystack_ref');

    console.log(params, reference);

    if (!reference) {
      showToast('error', 'No payment reference found');
      return;
    }

    const res = await safeFetch(
      `${baseUrl}/api/service-plans/payment/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    if (res.success && res.data.status === 'success') {
      localStorage.removeItem('paystack_ref');

      showToast('success', 'Payment successful. Subscription activated.');

      redirectWithDelay('/dashboard', 2000);
    } else {
      showToast('error', `Payment ${res.data.status}`);
    }
  } catch (error) {
    console.error('Payment verification failed:', error);

    showToast('error', 'Payment verification failed');
  }
}

// Since this is now a module, we trigger it here
// document.addEventListener('DOMContentLoaded', verifyPayment);
verifyPayment();
