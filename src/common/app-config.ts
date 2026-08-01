export function getDefaultCookingPrice(): number {
  const value = process.env.DEFAULT_COOKING_PRICE;
  if (value === undefined || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
