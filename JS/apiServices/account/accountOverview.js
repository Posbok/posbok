import config from '../../../config';
import { getPosCapital } from '../pos/posResources';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

const shopId = parsedUserData?.shopId || dummyShopId;

export async function initAccountOverview() {
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
    showToast('error', '❌ Failed to load account overview data.');
  }
}

// Updates just the POS capital section
export function updateCapitalUI(posCapitalData) {
  const cashInMachine = document.getElementById('cashInMachine');
  const cashAtHand = document.getElementById('cashAtHand');
  const totalPosCapital = document.getElementById('totalPosCapital');

  //   console.log(posCapitalData);

  const posCapital = posCapitalData?.data?.totalCapital || 0;

  if (posCapitalData) {
    cashInMachine.value = posCapital;
    cashAtHand.textContent = posCapitalData.cashAtHand || 0;
    totalPosCapital.textContent = posCapital || 0;
  }
}
