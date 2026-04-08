import config from '../../../config.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';

const baseUrl = config.baseUrl;
const apiToken = config.token;

// Function to Login a User - API
export async function loginUser(userDetails) {
  try {
    //  console.log('Sending POST request...');
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
      // mode: 'no-cors',
    });

    //  console.log('Response received...');
    const data = await response.json();

    if (!response.ok) {
      const data = await response.json();

      if (data.message && data.message.includes('ECONNREFUSED')) {
        console.warn("Silenced backend 'ECONNREFUSED' error.");
        showToast(
          'warning',
          'Server is down or unreachable. Please try again later.',
        );
        // Return a neutral object so the calling code doesn't crash
        // trying to read properties of undefined
        return { data: null, status: 'silenced' };
      }

      // throw new Error(`HTTP error! status: ${response.status}`);
      throw new Error(data.message || 'Something went wrong');
    }

    //  console.log('Logged in successfully:', data);
    return data;
  } catch (error) {
    console.error('Login Error detail:', error.message);
    throw error;
  }
}

// Function to Logout a User - API
export async function logoutUser() {
  try {
    showGlobalLoader();
    //  console.log('Sending POST request...');
    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    //  console.log('Response received...');
    const data = await response.json();

    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      throw new Error(data.message || 'Something went wrong');
    }

    hideGlobalLoader();
    //  console.log('Logout successfully:', data);
    return data;
  } catch (error) {
    hideGlobalLoader();
    console.error('Logout Error detail:', error.message);
    throw error;
  }
}
