import config from '../../config.js';

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

    //  console.log('Logout successfully:', data);
    return data;
  } catch (error) {
    console.error('Logout Error detail:', error.message);
    throw error;
  }
}
