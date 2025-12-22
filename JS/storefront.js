import './script.js';
import config from '../config';
import { fetchBusinessDetails } from './apiServices/business/businessResource';
import {
  checkAndPromptCreateShop,
  openDeleteShopModal,
} from './apiServices/shop/shopResource';
import {
  assignStaffToShop,
  assignUserToShop,
  checkAndPromptCreateStaff,
  createStaff,
  deleteUser,
  fetchStaffDetail,
  openCreateStaffModal,
  openDeleteStaffModal,
  openManageStaffModal,
  openUpdateStaffModal,
  removeStaffFromShop,
  updateUser,
} from './apiServices/user/userResource';
import { safeFetch } from './apiServices/utility/safeFetch';
import {
  clearFormInputs,
  formatServicePermission,
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { closeModal, showToast } from './script';

const userData = config.userData;
const baseUrl = config.baseUrl;
const parsedUserData = userData ? JSON.parse(userData) : null;
const servicePermission = parsedUserData?.servicePermission;

let userShops = [];
let enrichedShopData = [];
let businessId = null;

// JS for opening Create Storefront Modal
document.addEventListener('DOMContentLoaded', function () {
  const addButton = document.querySelector('.create-storefront');
  const createStorefrontContainer = document.querySelector('.createStorefront');

  if (addButton) {
    addButton.addEventListener('click', function () {
      createStorefrontContainer.classList.add('active');
      main.classList.add('blur');
      sidebar.classList.add('blur');
      main.classList.add('no-scroll');
    });
  }
});
