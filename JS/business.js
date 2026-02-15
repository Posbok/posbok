import config from '../config';
import './script.js';
import {
  fetchBusinessDetails,
  getBusinessSettings,
  setManualFee,
  setManualPosCharges,
  setTransferFee,
  updateBusiness,
} from './apiServices/business/businessResource';
import {
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { closeModal, showToast } from './script';

const userData = config.userData;
let parsedUserData = null;
parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';

document.addEventListener('DOMContentLoaded', async function () {
  if (isAdmin) {
    await renderBusinessDetails();
    //  await renderBusinessSettings();

    // Update Business Settings

    // Attach listeners - Manual Fee Toggle
    const manualPosCharges = document.querySelector(
      '.pos_manual_charge_toggle input',
    );

    if (manualPosCharges)
      manualPosCharges.addEventListener('change', async (e) => {
        const newValue = e.target.checked;

        const updateManualPosChargesData = {
          enabled: newValue,
        };

        try {
          const response = await setManualPosCharges(
            updateManualPosChargesData,
          );
          if (response && response.success) {
            showToast('success', `✅ ${response.message}`);
          }

          //  console.log('Update success:', response);
        } catch (err) {
          console.error('Update failed:', err);
          e.target.checked = !newValue; // rollback if request fails
        } finally {
          hideGlobalLoader();
        }
      });

    // Attach listeners - Manual Fee Toggle
    const manualMachineFee = document.querySelector('.manual-fee_toggle input');

    if (manualMachineFee)
      manualMachineFee.addEventListener('change', async (e) => {
        const newValue = e.target.checked;

        const updateManualFeeData = {
          enabled: newValue,
        };

        try {
          const response = await setManualFee(updateManualFeeData);
          if (response && response.success) {
            showToast('success', `✅ ${response.message}`);
          }

          //  console.log('Update success:', response);
        } catch (err) {
          console.error('Update failed:', err);
          e.target.checked = !newValue; // rollback if request fails
        } finally {
          hideGlobalLoader();
        }
      });

    // Attach listeners - Transfer Fee Toggle
    const transferFee = document.querySelector('.transfer-fee_toggle input');

    if (transferFee)
      transferFee.addEventListener('change', async (e) => {
        const newValue = e.target.checked;

        const updateTransferFeeData = {
          enabled: newValue,
        };
        //   console.log(updateTransferFeeData, newValue);

        try {
          const response = await setTransferFee(updateTransferFeeData);
          if (response && response.success) {
            showToast('success', `✅ ${response.message}`);
          }

          //  console.log('Update success:', response);
        } catch (err) {
          console.error('Update failed:', err);
          e.target.checked = !newValue; // rollback if request fails
        } finally {
          hideGlobalLoader();
        }
      });
  }
});

export async function renderBusinessDetails() {
  showGlobalLoader();

  const businessData = await fetchBusinessDetails();

  if (!businessData?.data) {
    console.error('Failed to fetch business details');
    hideGlobalLoader();
    return;
  }

  const data = businessData.data;

  if (!data) {
    console.error('No business data available');
    hideGlobalLoader();
    return;
  }

  const viewBusinessName = document.getElementById('viewBusinessName');
  if (viewBusinessName) viewBusinessName.innerText = data.business_name || '—';

  const viewBusinessAddress = document.getElementById('viewBusinessAddress');
  if (viewBusinessAddress) viewBusinessAddress.innerText = data.address || '—';

  const viewBusinessPhone = document.getElementById('viewBusinessPhone');
  if (viewBusinessPhone) viewBusinessPhone.innerText = data.phone_number || '—';

  const viewBusinessState = document.getElementById('viewBusinessState');
  if (viewBusinessState)
    viewBusinessState.innerText = data.state_of_operation || '—';

  const viewBusinessCac = document.getElementById('viewBusinessCac');
  if (viewBusinessCac) viewBusinessCac.innerText = data.cac_reg_no || '—';

  const viewBusinessTax = document.getElementById('viewBusinessTax');
  if (viewBusinessTax) viewBusinessTax.innerText = data.tax_id || '—';

  const viewBusinessNin = document.getElementById('viewBusinessNin');
  if (viewBusinessNin) viewBusinessNin.innerText = data.nin || '—';

  const viewBusinessType = document.getElementById('viewBusinessType');
  if (viewBusinessType)
    viewBusinessType.innerText =
      data.business_type === 'BOTH' ? 'POS & SALES' : data.business_type || '—';

  const viewBusinessStaffSize = document.getElementById(
    'viewBusinessStaffSize',
  );
  if (viewBusinessStaffSize)
    viewBusinessStaffSize.innerText = data.staff_size || '—';

  const viewBusinessVersion = document.getElementById('viewBusinessVersion');
  if (viewBusinessVersion)
    viewBusinessVersion.innerText = data.version_preference || '—';

  hideGlobalLoader();
}

// View and View Business Details Modal
document
  .querySelector('#openViewBusinessModalBtn')
  ?.addEventListener('click', async () => {
    const businessData = await fetchBusinessDetails();

    console.log(businessData);

    if (!businessData) {
      //  showToast('error', ' ⛔ Failed to fetch business details');
      console.error('Failed to fetch business details');
      hideGlobalLoader();
      return;
    }

    showGlobalLoader();

    const adminViewBusinessDataContainer = document.querySelector(
      '.adminViewBusinessData',
    );

    if (adminViewBusinessDataContainer) {
      if (businessData?.data) {
        hideGlobalLoader();
        openViewBusinessModal();
        setupViewBusinessForm(businessData.data);
      }
    } else {
      hideGlobalLoader();
      showToast('fail', '❌ Failed to fetch Business details.');
    }

    // openViewBusinessModal
  });

document
  .querySelector('#openUpdateBusinessModalBtn')
  ?.addEventListener('click', async () => {
    const businessData = await fetchBusinessDetails();

    if (!businessData) {
      //  showToast('error', ' ⛔ Failed to fetch business details');
      console.error('Failed to fetch business details');
      hideGlobalLoader();
      return;
    }

    showGlobalLoader();

    const adminUpdateBusinessDataContainer = document.querySelector(
      '.adminUpdateBusinessData',
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

// export async function renderBusinessSettings() {
//   const businessSettings = await getBusinessSettings();
//   const businessSettingsData = businessSettings?.data;
//   showGlobalLoader();

//   console.log('code got here');

//   if (!businessSettings) {
//     //  showToast('error', ' ⛔ Failed to fetch business Settings');
//     console.error('Failed to fetch business Settings');
//     hideGlobalLoader();
//     return;
//   }

//   showGlobalLoader();
//   //   console.log('businessSettingsData', businessSettingsData);

//   // Update the UI buttons based on fetched settings
//   const manualPosCharge = document.getElementById('pos_manual_charge');
//   const manualMachineFee = document.getElementById('manual_machine_fee_mode');
//   const transferFee = document.getElementById('transfer_fee_for_incoming');

//   if (manualPosCharge)
//     manualPosCharge.checked = businessSettingsData.pos_manual_charge;

//   if (manualMachineFee)
//     manualMachineFee.checked = businessSettingsData.manual_machine_fee_mode;

//   if (transferFee)
//     transferFee.checked = businessSettingsData.transfer_fee_for_incoming;

//   hideGlobalLoader();
// }

// View and Update Business Details Modal Functions
export function openViewBusinessModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const adminViewBusinessDataContainer = document.querySelector(
    '.adminViewBusinessData',
  );

  if (adminViewBusinessDataContainer)
    adminViewBusinessDataContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function setupViewBusinessForm(businessData) {
  const form = document.querySelector('.adminViewBusinessDataModal');
  if (!form) return;

  // Save businessData.id in the form for later use
  form.dataset.businessid = businessData.id;
}

//Update Business Modal Functions

export function openUpdateBusinessModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const adminUpdateBusinessDataContainer = document.querySelector(
    '.adminUpdateBusinessData',
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
      'updateBusinessAddress',
    ).value;
    const updateBusinessPhoneNumber = document.getElementById(
      'updateBusinessPhoneNumber',
    ).value;
    const updateBusinessStateOfOperation = document.getElementById(
      'updateBusinessStateOfOperation',
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
