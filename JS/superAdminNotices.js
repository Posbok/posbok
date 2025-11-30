import config from '../config.js';
import {
  clearFormInputs,
  hideBtnLoader,
  showBtnLoader,
} from './helper/helper.js';

import './script.js';
import { closeModal, showToast } from './script.js';
import {
  deleteNotice,
  getSuperAdminNotices,
  markAsReadApi,
  notifyBusiness,
} from './superAdmin/superAdminResources.js';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const isSuperAdmin = parsedUserData?.accountType === 'SUPER_ADMIN';
const isSuperAdminNoticePage = document.body.classList.contains(
  'superAdminNoticePage'
);

let allSuperAdminNotices = [];
let superAdminNoticesPageTracker = 1; // Start on page 1
const NOTICES_LIMIT_PER_PAGE = 2; // Use a constant for the limit

// DOM Selectors (Moved to where they are needed)
const superAdminNoticesContainer = document.querySelector('.chats'); // The container for the notices
const loadMoreBtn = document.getElementById('superAdminNoticesLoadMoreButton');

if (isSuperAdmin && isSuperAdminNoticePage) {
  loadSuperAdminNotices(superAdminNoticesPageTracker, NOTICES_LIMIT_PER_PAGE);

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      handleLoadMore();
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    document
      .querySelector('#notifyAllBusinessesModalBtn')
      ?.addEventListener('click', openNotifyAllBusinessModal_2);

    bindNotifyAllBusinessFormListener_2();
    bindDeleteNoticeFormListener();
    bindMarkAsReadFormListener();
  });
}

function handleLoadMore() {
  // Increment the tracker *before* calling the load function
  superAdminNoticesPageTracker++;
  //   console.log(
  //     'Clicked Load more. Requesting page:',
  //     superAdminNoticesPageTracker
  //   );

  superAdminNoticesContainer.innerHTML =
    '<p class="table-error-text">Loading notices...</p>';

  loadSuperAdminNotices(superAdminNoticesPageTracker, NOTICES_LIMIT_PER_PAGE, {
    append: true,
  });
}

// The primary function to fetch and render notices.
export async function loadSuperAdminNotices(
  page,
  limit,
  options = { append: false }
) {
  const { append } = options;
  if (!superAdminNoticesContainer) return;

  try {
    const result = await getSuperAdminNotices(page, limit);
    const { notices, pagination } = result.data;

    const totalPages = pagination.totalPages;

    // 1. Handle Initial Load (page 1)
    if (page === 1) {
      allSuperAdminNotices = []; // Clear old data
      superAdminNoticesContainer.innerHTML = ''; // Clear existing DOM (including dummy/initial HTML)
    }

    // 2. Accumulate New Notices
    notices.forEach((notice) => {
      // Check if the notice is already in the array (to prevent duplicates)
      if (!allSuperAdminNotices.some((n) => n.id === notice.id)) {
        allSuperAdminNotices.push(notice);
      }
    });

    // 3. Render All Accumulated Notices
    renderSuperAdminNotices(allSuperAdminNotices);

    // 4. Update Load More Button Visibility
    if (loadMoreBtn) {
      if (superAdminNoticesPageTracker >= totalPages) {
        loadMoreBtn.style.display = 'none'; // Hide the button
      } else {
        loadMoreBtn.style.display = 'block'; // Show the button
      }
    }
  } catch (error) {
    console.error('Error loading Super Admin Notices:', error);
    // Display an error message if loading page 1 failed
    if (page === 1) {
      superAdminNoticesContainer.innerHTML =
        '<p class="table-error-text">Error loading notices.</p>';
    }
  }
}

function renderSuperAdminNotices(notices) {
  if (!superAdminNoticesContainer) return;

  if (notices.length === 0) {
    superAdminNoticesContainer.innerHTML =
      '<p class="table-error-text">No Notices Available.</p>';
    return;
  }

  notices.forEach((notice) => {
    const {
      id,
      title,
      message,
      created_at,
      notice_type,
      business_id,
      SentBy,
      is_read,
    } = notice;
    const senderName = `${SentBy.first_name} ${SentBy.last_name}`;

    const noticeHTML = `
      <div class="message-card message-card_${id} ${
      is_read ? '' : 'unread'
    } "  data-notice-id="${id}" data-notice-title="${title}">
        <div class="user-inbox">
          <div class="user-inbox_header">
            <div>
              <h2 class="heading-subtext"><span class="user-inbox_tab-name">${senderName}</span></h2>
              <h4 class="heading-minitext"><span class="user-inbox_tab-title">${notice_type.toUpperCase()}: ${title}</span></h4>
            </div>
          </div>

          <div class="user-inbox_tab">
            <p class="heading-minitext user-inbox_tab-text">
              ${getFirst20Words(message)}
            </p>
          </div>

          <div class="user-inbox_info">
            <p class="user-inbox_info-time">${new Date(
              created_at
            ).toLocaleTimeString()}</p>
            <p class="user-inbox_info-date">${new Date(
              created_at
            ).toLocaleDateString()}</p>
          </div>

          <div class="user-inbox_actions">
       
            <button class="hero-btn-outline markAsReadBtn" data-notice-id="${id}"  title="Mark as Read">
             <i class="fa-solid fa-envelope-circle-check"></i>
            </button>
       
            <button class="hero-btn-outline deleteNoticeBtn" data-notice-id="${id}"  title="Delete Notice">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>

    
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = noticeHTML;
    const card = wrapper.firstElementChild;

    // **Attach the listener here**
    card.addEventListener('click', (e) => {
      if (e.target.closest('.hero-btn-outline')) return;

      const noticeId = card.dataset.noticeId;
      openNoticeFullMessageModal(noticeId);
    });

    const markAsReadBtn = card.querySelector('.markAsReadBtn');

    markAsReadBtn.addEventListener('click', async function (e) {
      e.stopPropagation();

      const noticeId = card.dataset.noticeId;
      const noticeTitle = card.dataset.noticeTitle;

      openMarkAsReadContainer(noticeTitle, noticeId);
    });

    const deleteNoticeBtn = card.querySelector('.deleteNoticeBtn');

    deleteNoticeBtn.addEventListener('click', async function (e) {
      e.stopPropagation();

      const noticeId = card.dataset.noticeId;
      const noticeTitle = card.dataset.noticeTitle;

      openDeleteNoticeContainer(noticeTitle, noticeId);
    });

    superAdminNoticesContainer.appendChild(card);
  });
}

// Notify All business

export function openNotifyAllBusinessModal_2() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const notifyAllBusinessContainer = document.querySelector(
    '.notifyAllBusinessContainer'
  );

  if (notifyAllBusinessContainer)
    notifyAllBusinessContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  notifyAllBusinessForm_2();
}

export function notifyAllBusinessForm_2() {
  const form = document.querySelector('.notifyAllBusinessContainerModal_2');
  if (!form) return;
}

// DIsplay Full Message
function openNoticeFullMessageModal(noticeId) {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const messageDisplayModalContainer = document.querySelector(
    '.messageDisplayModalContainer'
  );

  if (messageDisplayModalContainer)
    messageDisplayModalContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  displayfullNotice(noticeId);
}

export function displayfullNotice(noticeId) {
  const form = document.querySelector('.messageDisplayModalContainer');
  if (!form) return;

  const titleEl = document.querySelector('.open-inbox_tab-title');
  const senderEl = document.querySelector('.open-inbox_tab-name');
  const messageEl = document.querySelector('.open-inbox_tab-text--full');
  const timeEl = document.querySelector('.open-inbox_info-time');
  const dateEl = document.querySelector('.open-inbox_info-date');

  const selected = allSuperAdminNotices.find((n) => n.id == noticeId);

  console.log(selected);
  if (!selected) return;

  // Update modal content
  senderEl.textContent = `${selected.SentBy.first_name} ${selected.SentBy.last_name}`;
  titleEl.textContent = `${selected.notice_type.toUpperCase()}: ${
    selected.title
  }`;
  messageEl.textContent = selected.message;
  timeEl.textContent = new Date(selected.created_at).toLocaleTimeString();
  dateEl.textContent = new Date(selected.created_at).toLocaleDateString();
}

export function bindNotifyAllBusinessFormListener_2() {
  const form = document.querySelector('.notifyAllBusinessContainerModal_2');
  if (!form) return;

  const notifyAllBusinessButton = form.querySelector(
    '.notifyAllBusinessButton_2'
  );
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    notifyAllBusinessButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const generalNotificationTitleInput = form.querySelector(
        '#generalNotificationTitle'
      ).value;

      const generalNotificationMessageInput = form.querySelector(
        '#generalNotificationMessage'
      ).value;

      const generalNotificationType = form.querySelector(
        '#generalNotificationType'
      ).value;

      const generalNotificationExpiryInput = form.querySelector(
        '#generalNotificationExpiry'
      ).value;

      const GeneralBusinessNotificationDetails = {
        business_ids: null,
        title: generalNotificationTitleInput,
        message: generalNotificationMessageInput,
        notice_type: generalNotificationType,
        expires_at: generalNotificationExpiryInput,
      };

      console.log(
        'Submitting  General Businesses Notification Details with:',
        GeneralBusinessNotificationDetails
      );

      try {
        showBtnLoader(notifyAllBusinessButton);
        const generalNotifyBusinessData = await notifyBusiness(
          GeneralBusinessNotificationDetails
        );

        if (!generalNotifyBusinessData) {
          console.error('fail', generalNotifyBusinessData.message);
          return;
        }

        console.log(generalNotifyBusinessData);

        hideBtnLoader(notifyAllBusinessButton);
        closeModal();
        await loadSuperAdminNotices(
          superAdminNoticesPageTracker,
          NOTICES_LIMIT_PER_PAGE
        );

        clearFormInputs();
        showToast(
          'success',
          `${generalNotifyBusinessData.message}` ||
            '✅ Business Notified successfully.'
        );
      } catch (err) {
        hideBtnLoader(notifyAllBusinessButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// Delete Notice
function openDeleteNoticeContainer(noticeTitle, noticeId) {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const deleteNoticeContainer = document.querySelector(
    '.deleteNoticeContainer'
  );

  if (deleteNoticeContainer) deleteNoticeContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  deleteNoticeForm(noticeTitle, noticeId);
}

export function deleteNoticeForm(noticeTitle, noticeId) {
  const form = document.querySelector('.deleteNoticeContainerModal');
  if (!form) return;

  form.dataset.noticeId = noticeId;

  document.getElementById('confirmation-text-2').textContent =
    noticeTitle || '';
}

export function bindDeleteNoticeFormListener() {
  const form = document.querySelector('.deleteNoticeContainerModal');
  if (!form) return;

  const deleteNoticeButton = form.querySelector('.deleteNoticeButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    deleteNoticeButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const noticeId = form.dataset.noticeId;

      if (!noticeId) {
        showToast('fail', '❎ No Notice ID found.');
        return;
      }

      try {
        showBtnLoader(deleteNoticeButton);
        const returnedDeleteNotice = await deleteNotice(noticeId);

        hideBtnLoader(deleteNoticeButton);
        closeModal();

        showToast(
          'success',
          returnedDeleteNotice.message || '✅ Notice deleted successfully.'
        );
        await loadSuperAdminNotices(
          superAdminNoticesPageTracker,
          NOTICES_LIMIT_PER_PAGE
        );
      } catch (err) {
        hideBtnLoader(deleteNoticeButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// Mark as Read Notice
function openMarkAsReadContainer(noticeTitle, noticeId) {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const markAsReadContainer = document.querySelector('.markAsReadContainer');

  if (markAsReadContainer) markAsReadContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  markAsReadForm(noticeTitle, noticeId);
}

export function markAsReadForm(noticeTitle, noticeId) {
  const form = document.querySelector('.markAsReadContainerModal');
  if (!form) return;

  form.dataset.noticeId = noticeId;

  document.getElementById('confirmation-text-3').textContent =
    noticeTitle || '';
}

export function bindMarkAsReadFormListener() {
  const form = document.querySelector('.markAsReadContainerModal');
  if (!form) return;

  const markAsReadButton = form.querySelector('.markAsReadButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    markAsReadButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const noticeId = form.dataset.noticeId;

      if (!noticeId) {
        showToast('fail', '❎ No Notice ID found.');
        return;
      }

      try {
        showBtnLoader(markAsReadButton);
        const markAsReadResponse = await markAsReadApi(noticeId);
        console.log(markAsReadResponse);

        hideBtnLoader(markAsReadButton);
        closeModal();

        showToast(
          'success',
          markAsReadResponse.message || '✅ Notice Marked as Read successfully.'
        );
        await loadSuperAdminNotices(
          superAdminNoticesPageTracker,
          NOTICES_LIMIT_PER_PAGE
        );
      } catch (err) {
        hideBtnLoader(markAsReadButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// Function to extract the first 20 words from a text

export function getFirst20Words(text = '') {
  if (typeof text !== 'string') return '';

  // Normalize line breaks & multiple spaces
  const cleaned = text.replace(/\s+/g, ' ').trim();

  const words = cleaned.split(' ');
  if (words.length <= 20) return cleaned;

  return words.slice(0, 20).join(' ') + '...';
}

// function getFirst20Words(text) {
//   const words = text.split(' ');
//   const slicedWords = words.slice(0, 20).join(' ');

//   if (words.length > 20) {
//     return slicedWords + '...';
//   } else {
//     return text;
//   }
// }
