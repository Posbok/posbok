import config from '../../config.js';

const baseUrl = config.baseUrl;
const apiToken = config.token;

// Function to register a Business - API
export async function registerBusiness(businessDetails) {
  try {
    console.log('Sending POST request...');
    const response = await fetch(`${baseUrl}/api/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(businessDetails),
    });

    console.log('Response received...');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('detail added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error Adding detail:', error);
  }
}

// Function to register an Admin - API
export async function registerAdmin(adminDetails) {
  try {
    console.log('Sending POST request...');
    const response = await fetch(`${baseUrl}/api/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminDetails),
    });

    console.log('Response received...');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Admin created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error Adding Admin:', error);
  }
}
