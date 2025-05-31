export async function getPosCapitalxxx(shopId) {
  //   console.log(shopId);
  try {
    //  console.log('Sending POST request...');

    const posCapital = await safeFetch(
      `${baseUrl}/api/pos/capital?shopId=${shopId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    //  if (posCapital) {
    //  }

    return posCapital;
  } catch (error) {
    console.error('Error receiving POS Capital:', error);
    throw error;
  }
}
