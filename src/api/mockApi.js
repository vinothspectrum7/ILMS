export const createOrderReceipt = async (items, forceSuccess = true) => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (forceSuccess) {
    return {
      ok: true,
      message: `Order receipt created successfully for ${items.length} item(s).`,
    };
  } else {
    return {
      ok: false,
      message: 'Backend reported failure while creating order receipt.',
    };
  }
};
