import config from '../../../config.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';

const baseUrl = config.baseUrl;
const apiToken = config.token;

const createBusinessSubmitBtn = document.querySelector(
  '.createBusinessSubmitBtn'
);
const createAdminSubmitBtn = document.querySelector('.createAdminSubmitBtn');

// Function to register a Business - API
export async function registerBusiness(businessDetails) {
  try {
    showGlobalLoader();
    createBusinessSubmitBtn.disabled = true;
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
    hideGlobalLoader();
    return data;
  } catch (error) {
    hideGlobalLoader();
    createBusinessSubmitBtn.disabled = false;
    console.error('Error Adding detail:', error.message);
    throw error;
  }
}

// function to create a shop during Business registration

// Function to register an Admin - API
export async function registerAdmin(adminDetails) {
  try {
    showGlobalLoader();
    createAdminSubmitBtn.disabled = true;
    //  console.log('Sending POST request...');

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminDetails),
    });

    //  console.log('Response received...');
    const data = await response.json();

    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      throw new Error(data.message || 'Something went wrong');
    }

    //  console.log('Admin created successfully:', data);
    hideGlobalLoader();
    return data;
  } catch (error) {
    hideGlobalLoader();
    createAdminSubmitBtn.disabled = false;
    console.error('Error creating Admin:', error);
    throw error;
  }
}
