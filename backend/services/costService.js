function calculate(vendorTable) {
  let total = 0;

  vendorTable.forEach((item) => {
    total += item.recommendedPrice;
  });

  // naive savings (compare with Keells baseline)
  let keellsTotal = vendorTable.reduce(
    (sum, item) => sum + (item.prices.Keells || item.recommendedPrice || 0),
    0,
  );

  let savings = keellsTotal - total;

  return {
    total,
    savings,
  };
}

module.exports = { calculate };
