import config from '../config.js';
import './script.js';

import { safeFetch } from './apiServices/utility/safeFetch.js';
import {
  formatSubscriptionChannel,
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
  getSubscriptionHistory,
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

async function renderSubscriptionUI() {
  const activeState = document.getElementById('activeState');
  const trialState = document.getElementById('trialState');
  const expiredState = document.getElementById('expiredState');
  const noneState = document.getElementById('noPlanState');

  const badge = document.getElementById('statusBadge');
  const servicesContainer = document.getElementById('servicesContainer');

  function hideAll() {
    activeState.classList.add('hidden');
    trialState.classList.add('hidden');
    expiredState.classList.add('hidden');
    noneState.classList.add('hidden');
  }

  const response = await getActiveSubscriptionPlans();

  hideAll();

  const plans = response.data;

  if (!plans || plans.length === 0) {
    badge.textContent = 'No Plan';
    badge.className = 'status-badge status-none';

    noneState.classList.remove('hidden');

    return;
  }

  badge.textContent = 'Active';
  badge.className = 'status-badge status-active';

  activeState.classList.remove('hidden');

  servicesContainer.innerHTML = '';

  plans.forEach((plan) => {
    const chip = document.createElement('div');
    chip.className = 'service-chip';
    chip.textContent = plan.service_name;

    servicesContainer.appendChild(chip);
  });

  document.getElementById('billingCycle').textContent = plans[0].billing_cycle;
}

export async function renderSubscriptions() {
  const container = document.getElementById('subscriptionsContainer');
  const emptyState = document.getElementById('noPlanState');

  const response = await getActiveSubscriptionPlans();
  const plans = response.data;

  container.innerHTML = '';

  if (!plans || plans.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  plans.forEach((plan) => {
    const card = document.createElement('div');

    card.className = 'service-subscription';

    card.innerHTML = `
      <div class="service-header">
        <h3>${plan.service_name}</h3>
        <span class="service-status ${plan.status}">${plan.status.toUpperCase() || 'N/A'}</span>
      </div>

      <div class="service-info">
        <span style="font-weight: 500;"><strong>Billing:</strong> ${plan.billing_cycle || 'N/A'}</span>
        <span style="font-weight: 500;"><strong>Next Billing:</strong> ${plan.end_date.toLocaleString() || '-'}</span>
        <span style="font-weight: 500;"><strong>Days Remaining:</strong> ${plan.days_remaining}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

let paymentCurrentPage = 1;
let paymentTotalPages = 1;

function formatAmount(amount) {
  return `₦${amount.toLocaleString()}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatServices(services) {
  return services.join(' + ');
}

function renderPaymentRow(payment, serialNumber) {
  const tbody = document.getElementById('paymentHistoryTableBody');

  //   tbody.innerHTML = ''; // Clear existing rows

  const date = payment.paid_at || payment.created_at;
  const services = formatServices(payment.services);
  const amount = formatAmount(payment.amount);
  const status = payment.status;
  const channel = formatSubscriptionChannel(payment.channel);

  const row = `
    <tr class="table-body-row">
      <td class="py-1 productSerialNumber">${serialNumber}.</td>
      <td class="py-1 productSerialNumber">${formatDate(date)}</td>
      <td class="py-1 productSerialNumber">${services}</td>
      <td class="py-1 productSerialNumber">${amount}</td>
      <td class="py-1 productSerialNumber">
        <span class="payment-status ${status}">
          ${status}
        </span>
      </td>
      <td class="py-1 productSerialNumber">${channel}</td>
    </tr>
  `;

  tbody.insertAdjacentHTML('beforeend', row);
}

async function loadPaymentHistory(page = 1) {
  const tbody = document.getElementById('paymentHistoryTableBody');
  const btn = document.getElementById('loadMorePaymentsBtn');

  // Only show loading state when fetching first page
  if (page === 1 && tbody) {
    tbody.innerHTML = `
      <tr class="loading-row">
        <td colspan="5" class="table-error-text">
          Loading Subscription History...
        </td>
      </tr>
    `;

    btn.style.display = 'none';
  }

  try {
    const paymentResponse = await getSubscriptionHistory(page);

    const payments = paymentResponse.data.payments;
    const pagination = paymentResponse.data.pagination;

    if (payments.length === 0 && page === 1) {
      document.getElementById('paymentHistoryTableBody').innerHTML =
        `<tr class="loading-row">
       <td colspan="5" class="table-error-text">
         No Transactions Available
       </td>
     </tr>`;
      return;
    }

    if (payments.length === 0) {
      showToast('info', 'No more transactions to load');
      return;
    }

    paymentCurrentPage = pagination.currentPage;
    paymentTotalPages = pagination.totalPages;

    if (page === 1) {
      tbody.innerHTML = '';
    }

    payments.forEach((payment, index) => {
      const serialNumber =
        (paymentCurrentPage - 1) * pagination.itemsPerPage + index + 1;

      renderPaymentRow(payment, serialNumber);
    });

    updateLoadMoreButton();
  } catch (error) {
    hideGlobalLoader();
    console.error('Error loading payment history:', error.message);
  }
}

function updateLoadMoreButton() {
  const btn = document.getElementById('loadMorePaymentsBtn');

  if (paymentCurrentPage >= paymentTotalPages) {
    btn.style.display = 'none';
  } else {
    btn.style.display = 'block';
  }
}

document.getElementById('loadMorePaymentsBtn').addEventListener('click', () => {
  const nextPage = paymentCurrentPage + 1;
  loadPaymentHistory(nextPage);
});

document.addEventListener('DOMContentLoaded', () => {
  // getActiveSubscriptionPlans();
  // renderSubscriptionUI();
  renderSubscriptions();
  getSubscriptionPlans();

  updateQuote();
  loadPaymentHistory(1);
});
