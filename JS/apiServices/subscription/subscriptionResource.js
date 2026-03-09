import config from '../../../config.js';
import {
  clearFormInputs,
  hideGlobalLoader,
  populateBusinessStaffDropdown,
  showGlobalLoader,
} from '../../helper/helper.js';
import {
  closeModal,
  renderUserprofileDetails,
  showToast,
} from '../../script.js';
import { populateStaffTable } from '../../staff.js';
import {
  renderSubscriptions,
  resetSubscriptionUI,
  updateQuote,
} from '../../subscription.js';
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

export async function showLiveQuote(quoteDeti) {
  try {
    //  showGlobalLoader();
    //  console.log('Sending POST request...');

    const showLiveQuoteData = await safeFetch(
      `${baseUrl}/api/service-plans/quote`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteDeti),
      },
    );

    //  console.log('Response received...');

    if (showLiveQuoteData) {
      // hideGlobalLoader();
      // console.log('Quote received successfully:', showLiveQuoteData);
      // showToast('success', `✅ ${showLiveQuoteData.message}`);
    }

    return showLiveQuoteData;
  } catch (error) {
    //  hideGlobalLoader();
    console.error('Error receiving Quote:', error);
    throw error;
  }
}

export async function getSubscriptionPlans() {
  try {
    showGlobalLoader();
    //  console.log('Fetching subscription Plan Pricing for user');

    const fetchedData = await safeFetch(
      `${baseUrl}/api/service-plans/pricing`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    //  console.log('Response received...');
    console.log(fetchedData);
    hideGlobalLoader();

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    console.error(
      'Error Fetching Subscription Plans Pricing Info:',
      error.message,
    );
    throw error;
  }
}

export async function getActiveSubscriptionPlans() {
  try {
    showGlobalLoader();
    //  console.log('Fetching Active Subscription Plan Pricing for user');

    const fetchedData = await safeFetch(
      `${baseUrl}/api/service-plans/my-plans`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    //  console.log('Response received...');
    console.log(fetchedData);
    hideGlobalLoader();

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    console.error(
      'Error Fetching Active Subscription Plans Pricing Info:',
      error.message,
    );
    throw error;
  }
}

export async function initializeSubscriptionPayment(paymentDetails) {
  //   console.log(paymentDetails.billing_cycle);
  //   console.log(paymentDetails.services);
  console.log(JSON.stringify(paymentDetails));

  try {
    const response = await safeFetch(
      `${baseUrl}/api/service-plans/payment/initialize`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentDetails),
      },
    );

    return response;
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw error;
  }
}

export async function verifyPayment(reference) {
  //   const loader = document.getElementById('main-loader');
  //   const statusText = document.getElementById('status-text');

  //   // Start the timer immediately when verification starts
  //   const timer = setTimeout(() => {
  //     if (loader && loader.style.display !== 'none') {
  //       statusText.innerHTML += `<br><button class="hero-btn-dark mt-2" onclick="location.reload()">Re-check Payment</button>`;
  //     }
  //   }, 10000);

  try {
    showGlobalLoader();
    if (!reference) {
      showToast('error', 'No payment reference found');
      hideGlobalLoader();
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
      if (res.success && res.data.status === 'success') {
        localStorage.removeItem('paystack_ref');
        hideGlobalLoader();
        showToast('success', 'Payment successful. Subscription activated.');

        // Reset UI and state
        resetSubscriptionUI();

        // Refresh subscriptions and pricing
        await renderSubscriptions();
        await getSubscriptionPlans();
      }
    } else {
      hideGlobalLoader();
      showToast('error', `Payment ${res.data.status}`);
    }
    console.log(res);
  } catch (error) {
    console.error('Payment verification failed:', error);

    showToast('error', 'Payment verification failed');
    hideGlobalLoader();
  }
}
