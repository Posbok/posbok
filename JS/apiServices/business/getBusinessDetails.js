import config from '../../../config.js';

const baseUrl = config.baseUrl;
const userToken = config.token;
const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

export async function fetchBusinessDetails() {
  try {
    const response = await fetch(
      `${baseUrl}/api/business/${parsedUserData.businessId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('Error checking shop:', error.message);
    throw error;
  }
}
