import config from '../../../config';
import { showToast } from '../../script';
import { getPosCapital } from '../pos/posResources';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const shopId = parsedUserData?.shopId;

const isStaff = parsedUserData?.accountType === 'STAFF';

export async function initAccountOverview() {
  if (!isStaff) return;
  try {
    const [posCapital, charges, goodsData] = await Promise.all([
      getPosCapital(shopId),
      //  getCharges(shopId),
      //  getGoodsStats(shopId)
    ]);

    updateCapitalUI(posCapital);
    //  updateChargesUI(charges);
    //  updateGoodsUI(goodsData);
  } catch (error) {
    console.error('Error loading account overview:', error);
    //  showToast('error', '❌ Failed to load account overview data.');
  }
}

// Updates just the POS capital section
export function updateCapitalUI(posCapitalData) {
  if (!isStaff) return;
  const cashInMachine = document.getElementById('cashInMachine');
  const cashAtHand = document.getElementById('cashAtHand');
  const totalPosCapital = document.getElementById('totalPosCapital');

  //   console.log(posCapitalData);

  const posCapital = posCapitalData?.data?.totalCapital || 0;

  if (posCapitalData) {
    if (cashInMachine) cashInMachine.value = posCapital;
    //  if (cashAtHand) cashAtHand.value = posCapitalData.cashAtHand || 0;
    if (totalPosCapital) totalPosCapital.value = posCapital;
  }
}
