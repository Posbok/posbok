import config from '../../../config';
import {
  formatAmountWithCommas,
  hideGlobalLoader,
  showGlobalLoader,
} from '../../helper/helper';
import { showToast } from '../../script';
import { getPosCapital } from '../pos/posResources';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const shopId = parsedUserData?.shopId;

const isStaff = parsedUserData?.accountType === 'STAFF';

export async function initAccountOverview() {
  const posShopDropdown = document.getElementById('posShopDropdown')?.value;
  const posShopDropdownwithdrawal =
    document.getElementById('posShopDropdown-2')?.value;

  const adminDepositposCapitalShopDropdown = document.querySelector(
    '#adminDepositposCapitalShopDropdown'
  )?.value;

  const adminShopSelection =
    posShopDropdown ||
    adminDepositposCapitalShopDropdown ||
    posShopDropdownwithdrawal;
  //   if (isStaff) {
  showGlobalLoader();
  //   }
  //   if (!isStaff) return;
  try {
    //  const [posCapitalData, charges, goodsData] = await Promise.all([
    //    getPosCapital(shopId),
    //    //  getCharges(shopId),
    //    //  getGoodsStats(shopId)
    //  ]);

    const posCapitalData = await getPosCapital(
      isStaff ? shopId : adminShopSelection
    );
    //  console.log(posCapitalData, 'posCapitalData');

    updatePosCapitalUI(posCapitalData);
  } catch (error) {
    console.error('Error loading account overview:', error);
    //  showToast('error', '❌ Failed to load account overview data.');
  }
  hideGlobalLoader();
}

// Updates just the POS capital section
export function updatePosCapitalUI(posCapitalData) {
  //   if (!isStaff) return;

  const totalPosCapital = document.getElementById(
    isStaff ? 'totalPosCapital' : 'adminTotalPosCapital'
  );

  const posCapital = posCapitalData?.data?.totalCapital || 0;

  if (totalPosCapital)
    totalPosCapital.innerHTML = formatAmountWithCommas(posCapital || 0);
}

export function updateCashInMachineUI(openingCash) {
  const cashInMachine = document.getElementById(
    isStaff ? 'cashInMachine' : 'adminCashInMachine'
  );

  if (cashInMachine)
    cashInMachine.innerHTML = formatAmountWithCommas(openingCash || 0);
}

// Later:
export function updateGoodsSummaryUI(goodsData) {}
export function updateChargesUI(chargesData) {}
