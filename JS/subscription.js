import config from '../config.js';
import './script.js';

import { safeFetch } from './apiServices/utility/safeFetch.js';
import {
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper.js';
import { redirectWithDelay, showToast } from './script.js';
import { loginUser } from './apiServices/authentication/loginResource.js';
import {
  getActiveSubscriptionPlans,
  getSubscriptionPlans,
  showLiveQuote,
  initializeSubscriptionPayment,
  verifyPayment,
} from './apiServices/subscription/subscriptionResource.js';

const PAYSTACK_PUBLIC_KEY = config.PAYSTACK_PUBLIC_KEY;

const userData = config.userData;
let parsedUserData = null;
parsedUserData = userData ? JSON.parse(userData) : null;

const adminEmail = parsedUserData?.email;

console.log(adminEmail);

const selectedServices = new Set();
let billingCycle = 'monthly';

const serviceCheckboxes = document.querySelectorAll(
  ".service-option input[type='checkbox']",
);
const billingRadios = document.querySelectorAll("input[name='billingCycle']");

const quoteSummary = document.querySelector('.quote-summary');
const payButton = document.querySelector('.pay-button');

function formatCurrency(amount) {
  return '₦' + Number(amount).toLocaleString();
}

function buildQuotePayload() {
  return {
    services: Array.from(selectedServices),
    billing_cycle: billingCycle,
  };
}

export async function updateQuote() {
  showGlobalLoader();
  try {
    if (selectedServices.size === 0) {
      quoteSummary.innerHTML = `<p class="heading-minitext">Select a service to see pricing</p>
         <div class="discount-note ">
                  Choose more services to Enjoy massive discount per service
               </div>`;
      hideGlobalLoader();
      return;
    }

    const payload = buildQuotePayload();

    const quoteData = await showLiveQuote(payload);

    if (!quoteData || !quoteData.data) return;
    hideGlobalLoader();

    renderQuoteSummary(quoteData.data);
  } catch (error) {
    hideGlobalLoader();
    console.error('Quote update failed:', error);
  }
}

function renderQuoteSummary(quote) {
  let servicesHTML = '';

  quote.services.forEach((service) => {
    servicesHTML += `
      <div class="quote-item">
        <span class="heading-minitext">${service.name}</span>
        <span class="heading-minitext">${formatCurrency(service.final_price)}</span>
      </div>
    `;
  });

  const discountHTML = quote.discount_rule
    ? `<div class="discount-note">${quote.discount_rule}</div>`
    : '';

  const totalHTML = `
    <div class="quote-total mt-2">
      <span class="heading-minitext">Total</span>
      <span class="heading-minitext">
         <span class="discount-amount-note">Enjoy  <span class="discount-amount"> ${formatCurrency(quote.total_discount)}</span> off</span> 
      ${formatCurrency(quote.total_price)}
   
     </span>
    </div>
  `;

  const payHTML = `
          <div class="center-button">
                  <button class="hero-btn-dark btn mb-2 has-spinner payNowBtn" id="payNowBtn" type="submit">
                     <span class="btn-text">Pay ${formatCurrency(quote.total_price)} with Paystack</span>
                     <span class="btn-spinner hidden"></span>
                  </button>
               
               </div>
    `;

  quoteSummary.innerHTML = `
      ${servicesHTML}
      ${discountHTML}
      ${totalHTML}
      ${payHTML}
  `;
}

serviceCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const serviceCode = checkbox.value;

    if (checkbox.checked) {
      selectedServices.add(serviceCode);
    } else {
      selectedServices.delete(serviceCode);
    }

    updateQuote();
  });
});

billingRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    billingCycle = radio.value;

    updateQuote();
  });
});

async function startPayment() {
  try {
    if (selectedServices.size === 0) {
      showToast('error', 'Please select at least one service.');
      return;
    }

    const paymentPayload = {
      services: Array.from(selectedServices),
      billing_cycle: billingCycle,
      email: adminEmail,
    };

    const payBtn = document.getElementById('payNowBtn');
    showBtnLoader(payBtn);

    const paymentData = await initializeSubscriptionPayment(paymentPayload);

    console.log('Payment Data', paymentData);

    if (!paymentData || !paymentData.success) {
      throw new Error(paymentData.message || 'Payment initialization failed');
    }

    const { access_code, reference, quote } = paymentData.data;

    const amount = quote.total_price * 100; // convert to kobo

    localStorage.setItem('paystack_ref', reference);

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: adminEmail,
      amount: amount, // ✅ REQUIRED
      ref: reference,
      currency: 'NGN',

      // callback: function (response) {
      //   console.log('Payment complete:', response);
      //   verifyPayment(response.reference);
      // },

      callback: function (response) {
        console.log('Payment complete:', response);

        const savedRef =
          localStorage.getItem('paystack_ref') || response.reference;

        verifyPayment(savedRef);
      },

      onClose: function () {
        showToast('info', 'Payment cancelled');
        hideBtnLoader(payBtn);
      },
    });

    handler.openIframe();
  } catch (error) {
    console.error('Payment start error:', error);
    showToast('error', error.message || 'Payment initialization failed');
  }
}

// document.addEventListener('click', function (event) {
//   if (event.target && event.target.id === 'payNowBtn') {
//     console.log('object');
//     startPayment();
//   }
// });

// document.addEventListener('click', function (event) {
//   const payBtn = event.target.closest('#payNowBtn');
//   if (payBtn) {
//     startPayment();
//   }
// });

const subscriptionForm = document.querySelector('#subscriptionForm');
subscriptionForm.addEventListener('submit', (e) => {
  e.preventDefault(); // stop page reload
  startPayment();
});

// document.querySelector('#payNowBtn')?.addEventListener('click', async () => {
//   console.log('object');
//   startPayment();
// });

export function resetSubscriptionUI() {
  // Clear selected services and billing cycle
  selectedServices.clear();
  billingCycle = 'monthly';

  // Reset checkboxes and radios
  const subscriptionServiceCard = document.querySelector(
    '.subscriptionServiceCard',
  );
  if (subscriptionServiceCard) {
    subscriptionServiceCard
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    subscriptionServiceCard
      .querySelectorAll('input[type="radio"]')
      .forEach((rb) => (rb.checked = rb.value === 'monthly'));
  }

  // Clear quote summary
  quoteSummary.innerHTML = `<p class="heading-minitext">Select a service to see pricing</p>
    <div class="discount-note">
      Choose more services to Enjoy massive discount per service
    </div>`;
}

// getActiveSubscriptionPlans();
// getSubscriptionPlans();
// updateQuote();
