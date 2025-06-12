import {
  fetchBusinessDetails,
  updateBusiness,
} from './apiServices/business/businessResource';
import {
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { closeModal, showToast } from './script';

document.addEventListener('DOMContentLoaded', async function () {
  await renderBusinessDetails();
});

export async function renderBusinessDetails() {
  showGlobalLoader();
  const businessData = await fetchBusinessDetails();

  if (!businessData) {
    //  showToast('error', ' ⛔ Failed to fetch business details');
    console.error('Failed to fetch business details');
    hideGlobalLoader();
    return;
  }

  const businessName =
    businessData?.data.business_name || 'Business Name Not Available';
  const businessAddress =
    businessData?.data.address || 'Business Address Not Available';
  const businessPhoneNumber =
    businessData?.data.phone_number || 'Business Phone Number Not Available';
  const stateofOperation =
    businessData?.data.state_of_operation ||
    'Business State Of Operation Not Available';
  const cacRegNo =
    businessData?.data.cac_reg_no || 'Business CAC Reg No. Not Available';
  const taxId = businessData?.data.tax_id || 'Business Tax ID Not Available';
  const nin = businessData?.data.nin || 'Business NIN Not Available';
  const businessType =
    businessData?.data.business_type || 'Business Type Not Available';
  const staffSize =
    businessData?.data.staff_size || 'Business Staff Size Not Available';
  const versionPreference =
    businessData?.data.version_preference || 'Business Version Not Available';
  //   const isActive = businessData?.data.is_active || 'Business SUbscription Not Available';

  //   DOM Elements Input
  const businessNameInput = document.getElementById('businessName');
  const businessAddressInput = document.getElementById('businessAddress');
  const businessPhoneNumberInput = document.getElementById(
    'businessPhoneNumber'
  );
  const businessStateInput = document.getElementById('businessState');
  const businessCacRegNoInput = document.getElementById('businessCacRegNo');
  const businessTaxIdInput = document.getElementById('businessTaxId');
  const businessNinInput = document.getElementById('businessNin');
  const businessTypeInput = document.getElementById('businessType');
  const businessStaffSizeInput = document.getElementById('businessStaffSize');
  const businessVersionPreferenceInput = document.getElementById(
    'businessVersionPreference'
  );

  //   const BusinessIsActiveInput = document.getElementById('isActive');

  //   Set the values of the input fields
  if (businessNameInput) businessNameInput.value = businessName;
  if (businessAddressInput) businessAddressInput.value = businessAddress;
  if (businessPhoneNumberInput)
    businessPhoneNumberInput.value = businessPhoneNumber;
  if (businessStateInput) businessStateInput.value = stateofOperation;
  if (businessCacRegNoInput) businessCacRegNoInput.value = cacRegNo;
  if (businessTaxIdInput) businessTaxIdInput.value = taxId;
  if (businessNinInput) businessNinInput.value = nin;
  if (businessTypeInput)
    businessTypeInput.value =
      businessType === 'BOTH' ? 'POS & SALES' : businessType;
  if (businessStaffSizeInput) businessStaffSizeInput.value = staffSize;
  if (businessVersionPreferenceInput)
    businessVersionPreferenceInput.value = versionPreference;

  // Update Business Details

  document
    .querySelector('#openUpdateBusinessModalBtn')
    ?.addEventListener('click', async () => {
      showGlobalLoader();

      const adminUpdateBusinessDataContainer = document.querySelector(
        '.adminUpdateBusinessData'
      );

      if (adminUpdateBusinessDataContainer) {
        if (businessData?.data) {
          hideGlobalLoader();
          openUpdateBusinessModal();
          setupUpdateBusinessForm(businessData.data);
        }
      } else {
        hideGlobalLoader();
        showToast('fail', '❌ Failed to fetch Business details.');
      }

      // openUpdateBusinessModal
    });
  //   console.log(businessData);
}

export function openUpdateBusinessModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const adminUpdateBusinessDataContainer = document.querySelector(
    '.adminUpdateBusinessData'
  );

  if (adminUpdateBusinessDataContainer)
    adminUpdateBusinessDataContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function setupUpdateBusinessForm(businessData) {
  const form = document.querySelector('.adminUpdateBusinessDataModal');
  if (!form) return;

  // Save businessData.id in the form for later use
  form.dataset.businessid = businessData.id;

  // Fill form inputs
  document.getElementById('updateBusinessName').value =
    businessData.business_name || '';
  document.getElementById('updateBusinessAddress').value =
    businessData.address || '';
  document.getElementById('updateBusinessPhoneNumber').value =
    businessData.phone_number || '';
  document.getElementById('updateBusinessStateOfOperation').value =
    businessData.state_of_operation || '';
}

document.addEventListener('DOMContentLoaded', () => {
  bindUpdateBusinessFormListener(); // Only once
});

export function bindUpdateBusinessFormListener() {
  const form = document.querySelector('.adminUpdateBusinessDataModal');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const businessid = form.dataset.businessid; // ✅ Get user ID
    if (!businessid) {
      showToast('fail', '❎ No Business selected for update.');
      return;
    }

    const updateBusinessName =
      document.getElementById('updateBusinessName').value;
    const updateBusinessAddress = document.getElementById(
      'updateBusinessAddress'
    ).value;
    const updateBusinessPhoneNumber = document.getElementById(
      'updateBusinessPhoneNumber'
    ).value;
    const updateBusinessStateOfOperation = document.getElementById(
      'updateBusinessStateOfOperation'
    ).value;

    const businessUpdatedDetails = {
      businessName: updateBusinessName,
      address: updateBusinessAddress,
      phoneNumber: updateBusinessPhoneNumber,
      stateOfOperation: updateBusinessStateOfOperation,
    };

    //  console.log('📦 Business Update:', {
    //    businessid,
    //    ...businessUpdatedDetails,
    //  });

    const updateBusinessBtn = document.querySelector('.updateBusinessBtn');

    try {
      showBtnLoader(updateBusinessBtn);
      const data = await updateBusiness(businessid, businessUpdatedDetails);

      if (data) {
        hideBtnLoader(updateBusinessBtn);
        hideGlobalLoader();
        closeModal();
      }
    } catch (err) {
      hideBtnLoader(updateBusinessBtn);
      hideGlobalLoader();
      showToast('fail', `❎ ${err.message}`);
    }
  });
}
