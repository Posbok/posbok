import {
  getResetTokens,
  resetPassword,
} from './apiServices/authentication/resetPasswordResources';
import {
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
} from './helper/helper';
import { redirectWithDelay, showToast } from './script';

// const loginForm = document.getElementById('loginForm');
const resetForm = document.getElementById('resetForm');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLogin = document.getElementById('backToLogin');

const resetStep1 = document.getElementById('resetStep1');
const resetStep2 = document.getElementById('resetStep2');
const resendCodeLink = document.getElementById('resendCodeLink');
const changeEmailLink = document.getElementById('changeEmailLink');

let currentEmail = '';

document
  .getElementById('sendResetCodeBtn')
  .addEventListener('click', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('resetEmail');

    // Force the browser’s validation
    if (!emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    const email = emailInput.value.trim();
    currentEmail = email;

    const getTokensBodyDetalils = {
      email: email,
    };

    //  console.log('📦 Get Token Details:', getTokensBodyDetalils);

    const sendResetCodeBtn = document.querySelector('.sendResetCodeBtn');

    showBtnLoader(sendResetCodeBtn);

    try {
      const getResetTokensData = await getResetTokens(getTokensBodyDetalils);

      if (!getResetTokensData) {
        hideBtnLoader(sendResetCodeBtn);

        showToast(
          'error',
          getResetTokensData.message || `An error occured, try again later`
        );
        return;
      }

      if (getResetTokensData) {
        showToast(
          'success',
          getResetTokensData.message ||
            `Reset code sent to ${email}, Check your Inbox or Spam`
        );
        hideBtnLoader(sendResetCodeBtn);
        hideGlobalLoader();

        console.log(getResetTokensData);

        resetStep1.classList.add('hidden');
        resetStep2.classList.remove('hidden');
      }
    } catch (error) {
      showToast('error', error.message || `An error occured, try again later`);
      hideBtnLoader(sendResetCodeBtn);
      hideGlobalLoader();

      console.log(error.message);
    }
  });

document
  .getElementById('confirmResetBtn')
  .addEventListener('click', async () => {
    const codeInput = document.getElementById('resetCode');
    const newPasswordInput = document.getElementById('newPassword');
    //   if (!code || !newPassword) return alert('Fill all fields');

    // Force the browser’s validation
    if (!codeInput.checkValidity()) {
      codeInput.reportValidity(); // show browser's native error message
      return;
    }
    if (!newPasswordInput.checkValidity()) {
      newPasswordInput.reportValidity(); // show browser's native error message
      return;
    }

    const code = codeInput.value.trim();
    const newPassword = newPasswordInput.value.trim();

    //       "token": "482985",
    //   "email": "amaiyo.praises@gmail.com",
    //   "newPassword": "NewSecurePassword123!"

    const resetPasswordDetalils = {
      email: currentEmail,
      token: code,
      newPassword: newPassword,
    };

    //  console.log('📦 Reset Password Details:', resetPasswordDetalils);

    const confirmResetBtn = document.querySelector('.confirmResetBtn');

    showBtnLoader(confirmResetBtn);

    try {
      const resetPasswordData = await resetPassword(resetPasswordDetalils);

      if (!resetPasswordData) {
        hideBtnLoader(confirmResetBtn);

        showToast(
          'error',
          resetPasswordData.message || `An error occured, try again later`
        );
        return;
      }

      if (resetPasswordData) {
        showToast(
          'success',
          `${resetPasswordData.message}, you can now login.` ||
            `Password reset successfully, you can now login.`
        );
        hideBtnLoader(confirmResetBtn);
        hideGlobalLoader();

        console.log(resetPasswordData);

        setTimeout(() => {
          redirectWithDelay('Login Page', 'index.html', 500);
        }, 3500);
      }
    } catch (error) {
      showToast('error', error.message || `An error occured, try again later`);
      hideBtnLoader(confirmResetBtn);
      hideGlobalLoader();

      console.log(error.message);
    }
  });

resendCodeLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (!currentEmail) {
    showToast('info', 'No Email...');
    return;
  }

  // TODO: API call to resend code
  showToast('info', `Resending code to  ${currentEmail}`);
});

changeEmailLink.addEventListener('click', (e) => {
  e.preventDefault();
  resetStep2.classList.add('hidden');
  resetStep1.classList.remove('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('newPassword');
  const togglePasswordIcon = document.getElementById('toggleNewPassword');

  togglePasswordIcon.addEventListener('click', () => {
    const isPasswordVisible = passwordInput.type === 'text';

    // Toggle the input type
    passwordInput.type = isPasswordVisible ? 'password' : 'text';

    // Toggle icon class
    togglePasswordIcon.classList.toggle('fa-eye');
    togglePasswordIcon.classList.toggle('fa-eye-slash');
  });
});
