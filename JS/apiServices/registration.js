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
    const data = await response.json();

    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      throw new Error(data.message || 'Something went wrong');
    }

    //  console.log('detail added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error Adding detail:', data.message);
    throw error;
  }
}

// function to create a shop during Business registration

// Function to register an Admin - API
export async function registerAdmin(adminDetails) {
  try {
    console.log('Sending POST request...');

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminDetails),
    });

    console.log('Response received...');
    const data = await response.json();

    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      throw new Error(data.message || 'Something went wrong');
    }

    //  console.log('Admin created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating Admin:', error);
    throw error;
  }
}
