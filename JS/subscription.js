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
} from './apiServices/subscription/subscriptionResource.js';

const loginForm = document.getElementById('loginForm');
const baseUrl = config.baseUrl;

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

async function updateQuote() {
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
      <button class="pay-button hero-btn-dark" id="payNowBtn">
        Pay ${formatCurrency(quote.total_price)} with Paystack
      </button>
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

getActiveSubscriptionPlans();
getSubscriptionPlans();
updateQuote();
