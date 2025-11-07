import config from '../../../config.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';
import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;
const apiToken = config.token;

export async function getResetTokens(getTokensBodyDetalils) {
  //   console.log(getTokensBodyDetalils);
  try {
    showGlobalLoader();
    //  console.log('Sending POST request...');

    const getResetTokensData = await safeFetch(
      `${baseUrl}/api/auth/request-reset`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getTokensBodyDetalils),
      }
    );

    //  console.log('Response received...');

    if (getResetTokensData) {
      // console.log('POS Capital added successfully:', getResetTokensData);
      // showToast('success', `✅ ${getResetTokensData.message}`);
      hideGlobalLoader();
    }

    return getResetTokensData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error Getting Password Reset Tokens:', error);
    throw error;
  }
}

export async function resetPassword(resetPasswordDetalils) {
  //   console.log(resetPasswordDetalils);
  try {
    showGlobalLoader();
    //  console.log('Sending POST request...');

    const resetPasswordData = await safeFetch(
      `${baseUrl}/api/auth/reset-password`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetPasswordDetalils),
      }
    );

    //  console.log('Response received...');

    if (resetPasswordData) {
      // console.log('POS Capital added successfully:', resetPasswordData);
      // showToast('success', `✅ ${resetPasswordData.message}`);
      hideGlobalLoader();
    }

    return resetPasswordData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error Resetting Password:', error);
    throw error;
  }
}
