import config from '../../../config';
import {
  formatAmountWithCommas,
  hideGlobalLoader,
  showGlobalLoader,
} from '../../helper/helper';
import { showToast } from '../../script';
import { getAdminDashboard, getPosCapital } from '../pos/posResources';

const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

const shopId = parsedUserData?.shopId;

const isStaff = parsedUserData?.accountType === 'STAFF';

export async function initAccountOverview() {
  showGlobalLoader();
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
  //   }
  //   if (!isStaff) return;
  try {
    const adminDashboardData = await getAdminDashboard(
      isStaff ? shopId : adminShopSelection
    );

    if (!adminDashboardData) {
      hideGlobalLoader();
      return;
    }

    console.log(adminDashboardData);

    const shopBalances = adminDashboardData.data?.shop_balances;
    const adminSummary = adminDashboardData.data?.admin_summary;

    updateAdminDashboardUi(shopBalances, adminSummary);
  } catch (error) {
    console.error('Error loading Admin Dashboard:', error);
    //  showToast('error', '❌ Failed to load account overview data.');
  }
  hideGlobalLoader();
}

// Updates just the Admin Dashboard section
export function updateAdminDashboardUi(shopBalances, adminSummary) {
  console.log(shopBalances, 'shopBalances');
  //   if (!isStaff) return;

  const {
    billpayment_cash,
    cash_at_hand,
    cash_in_machine,
    charges_cash,
    charges_machine,
    deposit,
    total_pos_capital,
    total_pos_charges,
    total_withdrawals,
  } = shopBalances;

  const {
    total_admin_withdrawals,
    admin_withdrawal_cash,
    admin_withdrawal_transfer,
  } = adminSummary;

  const totalPosCapital = document.getElementById(
    isStaff ? 'totalPosCapital' : 'adminTotalPosCapital'
  );

  const cashAtHand = document.getElementById(
    isStaff ? 'cashAtHand' : 'adminCashAtHand'
  );

  const cashInMachine = document.getElementById(
    isStaff ? 'cashInMachine' : 'adminCashInMachine'
  );

  const totalDeposits = document.getElementById(
    isStaff ? 'totalDeposit' : 'adminTotalDeposit'
  );

  const totalWithdrawals = document.getElementById(
    isStaff ? 'totalWithdrawals' : 'adminTotalWithdrawals'
  );

  const cashBillPayment = document.getElementById(
    isStaff ? 'cashBillPayment' : 'adminCashBillPayment'
  );

  const totalPosCharges = document.getElementById(
    isStaff ? 'totalPosCharges' : 'adminTotalPosCharges'
  );

  const cashCharges = document.getElementById(
    isStaff ? 'cashCharges' : 'adminCashCharges'
  );
  const machineCharges = document.getElementById(
    isStaff ? 'machineCharges' : 'adminMachineCharges'
  );
  const totalAdminWithdrawals = document.getElementById(
    isStaff ? 'totalAdminWithdrawals' : 'totalAdminWithdrawals_admin'
  );
  const adminWithdrawalsCash = document.getElementById(
    isStaff ? 'adminWithdrawalsCash' : 'adminWithdrawalsCash_admin'
  );
  const adminWithdrawalsTransfer = document.getElementById(
    isStaff ? 'adminWithdrawalsTransfer' : 'adminWithdrawalsTransfer_admin'
  );

  if (totalPosCapital)
    totalPosCapital.innerHTML = formatAmountWithCommas(total_pos_capital || 0);
  if (cashAtHand)
    cashAtHand.innerHTML = formatAmountWithCommas(cash_at_hand || 0);
  if (cashInMachine)
    cashInMachine.innerHTML = formatAmountWithCommas(cash_in_machine || 0);
  if (totalDeposits)
    totalDeposits.innerHTML = formatAmountWithCommas(deposit || 0);
  if (totalWithdrawals)
    totalWithdrawals.innerHTML = formatAmountWithCommas(total_withdrawals || 0);
  if (cashBillPayment)
    cashBillPayment.innerHTML = formatAmountWithCommas(billpayment_cash || 0);
  if (totalPosCharges)
    totalPosCharges.innerHTML = formatAmountWithCommas(total_pos_charges || 0);
  if (cashCharges)
    cashCharges.innerHTML = formatAmountWithCommas(charges_cash || 0);
  if (machineCharges)
    machineCharges.innerHTML = formatAmountWithCommas(charges_machine || 0);

  if (totalAdminWithdrawals)
    totalAdminWithdrawals.innerHTML = formatAmountWithCommas(
      total_admin_withdrawals || 0
    );

  if (adminWithdrawalsCash)
    adminWithdrawalsCash.innerHTML = formatAmountWithCommas(
      admin_withdrawal_cash || 0
    );

  if (adminWithdrawalsTransfer)
    adminWithdrawalsTransfer.innerHTML = formatAmountWithCommas(
      admin_withdrawal_transfer || 0
    );
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
