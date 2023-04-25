const ZMIENNIA_WARTOSC_PROCENT = 15.75;
const UBEZPIECZENIE_PROCENT = 0.17;
const VAT_PROCENT = 23;

const PALETA_TYPE_EURO = {
  Do_400_kilo: 160,
  Do_800_kilo: 190,
  Do_1000_kilo: 218.75,
};

const PALETA_TYPE_PRZEMYSLOWA = {
  Do_400_kilo: 190,
  Do_800_kilo: 218.75,
  Do_1000_kilo: 241.25,
};

const PALETA_TYPE_PRZEMYSLOWA_PLUS = {
  Do_400_kilo: 190,
  Do_800_kilo: 218.75,
  Do_1000_kilo: 241.25,
};

const PALETA_TYPE_POLPALETA = {
  Do_200_kilo: 145,
};

export function calculateShippingPrice(type: number, qty: number, weight: number, insurance: number): number {
  let totalBasePrice = 0;

  const typeEuroQty = type === 1 ? qty : 0;
  const typePolpaletaQty = type === 2 ? qty : 0;
  const typePrzemyslowaQty = type === 3 ? qty : 0;
  const typePrzemyslowaPlusQty = type === 4 ? qty : 0;

  const typeEuroWeight = type === 1 ? weight : 0;
  const typePrzemyslowaWeight = type === 3 ? weight : 0;
  const typePrzemyslowaPlusWeight = type === 4 ? weight : 0;
  const typePolpaletaWeight = type === 2 ? weight : 0;

  if (!type || !qty || !weight) {
    return 0;
  }

  // Calculate base price for Pallet Type 1
  if (typeEuroQty > 0) {
    if (typeEuroWeight <= 400) {
      totalBasePrice += typeEuroQty * PALETA_TYPE_EURO['Do_400_kilo'];
    } else if (typeEuroWeight <= 800) {
      totalBasePrice += typeEuroQty * PALETA_TYPE_EURO['Do_800_kilo'];
    } else if (typeEuroWeight <= 1000) {
      totalBasePrice += typeEuroQty * PALETA_TYPE_EURO['Do_1000_kilo'];
    }
  }

  // Calculate base price for Pallet Type 2
  if (typePrzemyslowaQty > 0) {
    if (typePrzemyslowaWeight <= 400) {
      totalBasePrice += typePrzemyslowaQty * PALETA_TYPE_PRZEMYSLOWA['Do_400_kilo'];
    } else if (typePrzemyslowaWeight <= 800) {
      totalBasePrice += typePrzemyslowaQty * PALETA_TYPE_PRZEMYSLOWA['Do_800_kilo'];
    } else if (typePrzemyslowaWeight <= 1000) {
      totalBasePrice += typePrzemyslowaQty * PALETA_TYPE_PRZEMYSLOWA['Do_1000_kilo'];
    }
  }

  // Calculate base price for Pallet Type 3
  if (typePrzemyslowaPlusQty > 0) {
    if (typePrzemyslowaPlusWeight <= 400) {
      totalBasePrice += typePrzemyslowaPlusQty * PALETA_TYPE_PRZEMYSLOWA_PLUS['Do_400_kilo'];
    } else if (typePrzemyslowaPlusWeight <= 800) {
      totalBasePrice += typePrzemyslowaPlusQty * PALETA_TYPE_PRZEMYSLOWA_PLUS['Do_800_kilo'];
    } else if (typePrzemyslowaPlusWeight <= 1000) {
      totalBasePrice += typePrzemyslowaPlusQty * PALETA_TYPE_PRZEMYSLOWA_PLUS['Do_1000_kilo'];
    }
  }

  // Calculate base price for Pallet Type 4
  if (typePolpaletaQty > 0) {
    if (typePolpaletaWeight <= 200) {
      totalBasePrice += typePolpaletaQty * PALETA_TYPE_POLPALETA['Do_200_kilo'];
    }
  }

  // Calculate total net price
  insurance = (insurance || 0) < 3000 ? 3000 : insurance;
  const insuranceCost = insurance * (UBEZPIECZENIE_PROCENT / 100);
  const totalNetPrice = (totalBasePrice + insuranceCost) * ((100 + ZMIENNIA_WARTOSC_PROCENT) / 100);
  const totalPrice = totalNetPrice * ((100 + VAT_PROCENT) / 100);

  return totalPrice;
}
