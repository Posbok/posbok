import config from '../../../config';
import {
  formatAmountWithCommas,
  formatDateTimeReadable,
  hideGlobalLoader,
  showGlobalLoader,
} from '../../helper/helper';
import { showToast } from '../../script';
import { getPosDailySummary } from '../business/businessResource';
import { getAdminDashboard, getPosCapital } from '../pos/posResources';

const userData = config.userData;

const parsedUserData = userData ? JSON.parse(userData) : null;

const shopId = parsedUserData?.shopId;
const businessId = parsedUserData?.businessId;

const isStaff = parsedUserData?.accountType === 'STAFF';

export let shopBalancesGlobal = [];

export async function initAccountOverview() {
  showGlobalLoader();
  //   console.log('code got here');
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
    //  const adminDashboardData = await getAdminDashboard(
    //    isStaff ? shopId : adminShopSelection
    //  );
    const summaryShopId = isStaff ? shopId : adminShopSelection;

    const posDailySummaryData = await getPosDailySummary(businessId);
    //  const posDailySummaryData = await getPosDailySummary(summaryShopId);

    if (!posDailySummaryData) {
      hideGlobalLoader();
      return;
    }

    //  console.log(posDailySummaryData);

    const shopBalances = posDailySummaryData?.data;
    //  const adminSummary = posDailySummaryData.data?.admin_summary;

    //  updatePosSummaryDashboardUi(shopBalances, adminSummary);
    updatePosSummaryDashboardUi(shopBalances, adminShopSelection);
  } catch (error) {
    console.error('Error loading POS Summary Dashboard:', error);
    //  showToast('error', '❌ Failed to load account overview data.');
  }
  hideGlobalLoader();
}

// Updates just the Admin Dashboard section
// export function updatePosSummaryDashboardUi(shopBalances, adminSummary) {
export function updatePosSummaryDashboardUi(shopBalances, adminShopSelection) {
  //   console.log(shopBalances, 'shopBalances');

  const selectedShopId = isStaff ? shopId : adminShopSelection;

  const balancePerShop = shopBalances.find(
    (shop) => shop.id === Number(selectedShopId)
  );

  //   console.log('Selected Shop ID:', selectedShopId);
  console.log('Selected Shop Balance:', balancePerShop);

  shopBalancesGlobal = balancePerShop;

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
    total_cash_at_hand,
    total_machine_fee,
    total_tax_fee,
    total_transfer_fee,
    total_fees,
    current_business_day,
    total_admin_withdrawal_machine,
    total_admin_withdrawal_cash_at_hand,
  } = balancePerShop;

  //   const {
  //     total_admin_withdrawals,
  //     admin_withdrawal_cash,
  //     admin_withdrawal_transfer,
  //   } = adminSummary;

  const totalPosCapital = document.getElementById(
    isStaff ? 'totalPosCapital' : 'adminTotalPosCapital'
  );
  const totaCashAtHand = document.getElementById(
    isStaff ? 'totalCashAtHand' : 'adminTotalCashAtHand'
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
  const machineFee = document.getElementById(
    isStaff ? 'totalMachineFee' : 'adminTotalMachineFee'
  );
  const taxFee = document.getElementById(
    isStaff ? 'totalTaxFee' : 'adminTotalTaxFee'
  );
  const transferFe = document.getElementById(
    isStaff ? 'totalTransferFee' : 'adminTotalTransferFee'
  );
  const totalFees = document.getElementById(
    isStaff ? 'totalFees' : 'adminTotalFees'
  );
  const totalAdminWithdrawals = document.getElementById(
    isStaff ? 'totalAdminWithdrawals' : 'totalAdminWithdrawals_admin'
  );
  const totalAdminWithdrawalsFromCashInMachine = document.getElementById(
    isStaff
      ? 'totalAdminWithdrawalsFromCashInMachine'
      : 'totalAdminWithdrawalsFromCashInMachine_admin'
  );
  const totalAdminWithdrawalsFromCashAtHand = document.getElementById(
    isStaff
      ? 'totalAdminWithdrawalsFromCashAtHand'
      : 'totalAdminWithdrawalsFromCashAtHand_admin'
  );
  //   const adminWithdrawalsCash = document.getElementById(
  //     isStaff ? 'adminWithdrawalsCash' : 'adminWithdrawalsCash_admin'
  //   );
  //   const adminWithdrawalsTransfer = document.getElementById(
  //     isStaff ? 'adminWithdrawalsTransfer' : 'adminWithdrawalsTransfer_admin'
  //   );
  //   const currentBusinessDay = document.getElementById(
  //     isStaff ? 'currentBusinessDay' : 'adminCurrentBusinessDay'
  //   );

  if (totalPosCapital)
    totalPosCapital.innerHTML = formatAmountWithCommas(total_pos_capital || 0);
  if (totaCashAtHand)
    totaCashAtHand.innerHTML = formatAmountWithCommas(total_cash_at_hand || 0);
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
  if (machineFee)
    machineFee.innerHTML = formatAmountWithCommas(total_machine_fee || 0);
  if (taxFee) taxFee.innerHTML = formatAmountWithCommas(total_tax_fee || 0);
  if (transferFe)
    transferFe.innerHTML = formatAmountWithCommas(total_transfer_fee || 0);
  if (totalFees) totalFees.innerHTML = formatAmountWithCommas(total_fees || 0);
  //   if (currentBusinessDay) currentBusinessDay.innerHTML = current_business_day;

  if (totalAdminWithdrawals)
    totalAdminWithdrawals.innerHTML = formatAmountWithCommas(
      total_admin_withdrawal_machine + total_admin_withdrawal_cash_at_hand || 0
    );

  if (totalAdminWithdrawalsFromCashInMachine)
    totalAdminWithdrawalsFromCashInMachine.innerHTML = formatAmountWithCommas(
      total_admin_withdrawal_machine || 0
    );

  if (totalAdminWithdrawalsFromCashAtHand)
    totalAdminWithdrawalsFromCashAtHand.innerHTML = formatAmountWithCommas(
      total_admin_withdrawal_cash_at_hand || 0
    );

  //   if (adminWithdrawalsCash)
  //     adminWithdrawalsCash.innerHTML = formatAmountWithCommas(
  //       // admin_withdrawal_cash || 0
  //       0
  //     );

  //   if (adminWithdrawalsTransfer)
  //     adminWithdrawalsTransfer.innerHTML = formatAmountWithCommas(
  //       // admin_withdrawal_transfer || 0
  //       0
  //     );

  return shopBalances;
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
