export function clearFormInputs() {
  // Select the form element and reset its inputs
  const createShopForm = document.querySelector('.createShopModal');
  const createStaffForm = document.querySelector('.createStaffModal');
  const updateStaffForm = document.querySelector('.adminUpdateUserDataModal');
  const updateShopForm = document.querySelector('.adminUpdateShopDataModal');
  const staffManageForm = document.querySelector('.staffManageModal');

  const depositPosCapitalForm = document.querySelector(
    '.depositPosCapitalModal'
  );

  //   console.log('activated');

  //   if (createStaffForm || updateStaffForm) {
  //     if (createStaffForm) createStaffForm.reset();
  //     if (updateStaffForm) updateStaffForm.reset();
  //   }

  // Clear Create Staff Form Inputs
  if (createStaffForm) {
    createStaffForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });
  }

  // Clear Create Shop Form Inputs
  if (createShopForm) {
    createShopForm.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = '';
      }
    });

    delete createShopForm.dataset.bound;
  }

  // Clear Update Staff Form Inputs
  if (updateStaffForm) {
    updateStaffForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete updateStaffForm.dataset.bound;
  }

  // Clear Update SHop Form Inputs
  if (updateShopForm) {
    updateShopForm.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = '';
      }
    });

    delete updateShopForm.dataset.bound;
  }

  // Clear Create Shop Form Inputs
  if (depositPosCapitalForm) {
    depositPosCapitalForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete depositPosCapitalForm.dataset.bound;
  }

  // Clear Create Shop Form Inputs
  if (staffManageForm) {
    staffManageForm
      .querySelectorAll('input, textarea, select')
      .forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });

    delete staffManageForm.dataset.staffId;

    // Optional: reset text labels like staff name or current shop
    const nameLabel = staffManageForm.querySelector('#staffManage-name');
    if (nameLabel) nameLabel.innerText = '';

    const currentShopDisplay = staffManageForm.querySelector(
      '#currentAssignedShop'
    );
    if (currentShopDisplay) currentShopDisplay.innerText = 'No Shop Assigned';

    delete staffManageForm.dataset.bound;
  }
}

// function to format amounts with commas
export function formatAmountWithCommas(amount) {
  if (amount === null || amount === undefined) {
    return amount; // return an empty string if amount is null or undefined
  }

  const amountString = amount.toString();
  return amountString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Function to handle input formatting and remove commas when submitting
export function formatAmountWithCommasOnInput(input) {
  console.log('object');
  let value = input.value;
  value = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  input.value = formatAmountWithCommas(value);
}

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('posCapitalAmount');
  input.addEventListener('input', function () {
    formatAmountWithCommasOnInput(input);
  });
});

// Make the function globally available
window.formatAmountWithCommasOnInput = formatAmountWithCommasOnInput;

// When submitting, remove commas from the value before processing
export function getAmountForSubmission(input) {
  return input.value.replace(/,/g, ''); // Remove commas for backend submission
}
