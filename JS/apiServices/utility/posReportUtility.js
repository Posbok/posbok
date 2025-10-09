import { formatAmountWithCommas } from '../../helper/helper';

export function updateTotalPosAmounts(transactions, totalRow, date) {
  //   Deposit Amount Sum

  const isDeleted = (item) =>
    item.deleted_by != null || item.deleted_at != null;

  const depositTransactions = transactions.filter(
    (item) => item.transaction_type === 'DEPOSIT' && !isDeleted(item)
  );

  const depositAmount = depositTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //  console.log('object', depositTransactions);
  //   console.log('Total deposit amount:', depositAmount);

  //   Withdrawal Amount Sum
  const withdrawalTransactions = transactions.filter(
    (item) => item.transaction_type === 'WITHDRAWAL' && !isDeleted(item)
  );

  const withdrawalAmount = withdrawalTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //   console.log('object', withdrawalTransactions);
  //   console.log('Total withdrawal amount:', withdrawalAmount);

  //   Withdrawal_Transfer Amount Sum
  const withdrawalTransferTransactions = transactions.filter(
    (item) =>
      item.transaction_type === 'WITHDRAWAL_TRANSFER' && !isDeleted(item)
  );

  const withdrawalTransferAmount = withdrawalTransferTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  //   Bill Payment Amount Sum
  const billPaymentTransactions = transactions.filter(
    (item) => item.transaction_type === 'BILL_PAYMENT' && !isDeleted(item)
  );

  const billPaymentAmount = billPaymentTransactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  //   console.log('Total withdrawal amount:', billPaymentAmount);

  // Logic Two

  //   const posChargesItems = transactions.filter(
  //     (item) => item.manual_charges != null || item.charges != null
  //   );

  //   const posChargesAmount = posChargesItems.reduce((sum, item) => {
  //     const chargeValue = Number(item.manual_charges ?? item.charges) || 0;
  //     return sum + chargeValue;
  //   }, 0);

  //   console.log('total pos Charge', posChargesItems);

  // Logic Three - Final

  const posChargesAmount = transactions.reduce((sum, item) => {
    if (!isDeleted(item)) {
      const charge = item.manual_charges ?? item.charges;
      return sum + Number(charge || 0);
    }
    return sum;
  }, 0);

  //   console.log('object', posCharges);
  //   console.log('Total POS Charges amount:', posChargesAmount);

  //   Total Machine
  const machineFeeItems = transactions.filter(
    (item) => item.fees && !isDeleted(item)
  );

  const totalMachineFeeAmount = machineFeeItems.reduce(
    (sum, item) => sum + Number(item.fees || 0),
    0
  );

  //   console.log('Total Machine fee:', totalMachineFeeAmount);

  //   total Amount Sum
  const totalAmount =
    depositAmount +
    withdrawalAmount +
    billPaymentAmount +
    withdrawalTransferAmount;

  totalRow.innerHTML = `
     <td colspan="4" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>${date} SUMMARY:</strong>
     </td>
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Grand Amount</strong> = ₦${formatAmountWithCommas(totalAmount)}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total POS Charges </strong> = ₦${formatAmountWithCommas(
         posChargesAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Machine Fee </strong> = ₦${formatAmountWithCommas(
         totalMachineFeeAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Deposit</strong> = ₦${formatAmountWithCommas(
         depositAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Withdrawals</strong> = ₦${formatAmountWithCommas(
         withdrawalAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Withdrawals/Transfer</strong> = ₦${formatAmountWithCommas(
         withdrawalTransferAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Bill Payment</strong> = ₦${formatAmountWithCommas(
         billPaymentAmount
       )}
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong></strong>
     </td>
 
     <td  class="date-header py-1 px-2 mt-1 mb-1">
       <strong></strong>
     </td>
   `;
}
