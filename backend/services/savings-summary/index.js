function calculate(vendorTable) {
  const total = vendorTable.reduce(
    (sum, item) => sum + (Number(item.recommendedPrice) || 0),
    0,
  );

  const baseline = vendorTable.reduce(
    (sum, item) =>
      sum + (Number(item.highestComparablePrice) || Number(item.recommendedPrice) || 0),
    0,
  );

  return {
    total,
    baseline,
    savings: Math.max(baseline - total, 0),
  };
}

module.exports = { calculate };
