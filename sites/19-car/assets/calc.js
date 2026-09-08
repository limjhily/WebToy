// 자동차 세금·비용 계산 (rates.js 의존)
const R = window.RATES;
// 자동차세: 배기량·차령·연료로 연세액 계산
function carTax(cc, age, isEv){
  let base = isEv ? R.carTax.ev : 0;
  if(!isEv){ for(const [cap, per] of R.carTax.tiers){ if(cc <= cap){ base = cc * per; break; } } }
  // 차령 경감은 배기량 기준 차량에만 적용됩니다. 전기·수소차의 정액분은 경감 대상이 아닙니다.
  const relief = isEv ? 0 : Math.min(R.carTax.ageMax, Math.max(0, (age - (R.carTax.ageStart - 1)) * R.carTax.ageStep));
  const taxed = Math.floor(base * (1 - relief) / 10) * 10;
  const edu = Math.floor(taxed * R.carTax.eduRate / 10) * 10;
  const total = taxed + edu;
  return { base, relief, taxed, edu, total, prepay: Math.floor(total * (1 - R.carTax.prepay) / 10) * 10 };
}
// 취득세: 과세표준(부가세 제외) × 세율, 경차·전기차 감면 반영
function acqTax(price, type, vatIncluded){
  const A = R.acquisition;
  const taxBase = Math.floor((vatIncluded ? price / 1.1 : price));
  const rates = { car: A.car, light: A.light, vanTruck: A.vanTruck, business: A.business, ev: A.car };
  const rate = rates[type];
  const gross = Math.floor(taxBase * rate / 10) * 10;
  let exempt = 0;
  if(type === 'light') exempt = Math.min(gross, A.lightExempt);
  if(type === 'ev') exempt = Math.min(gross, A.evExempt);
  return { taxBase, rate, gross, exempt, total: gross - exempt };
}
// 연료비: 월 주행거리 ÷ 연비 × 단가
function fuelCost(kmPerMonth, efficiency, price){
  if(!efficiency) return { monthly: 0, yearly: 0, perKm: 0, liters: 0 };
  const liters = kmPerMonth / efficiency;
  const monthly = liters * price;
  return { liters, monthly, yearly: monthly * 12, perKm: kmPerMonth ? monthly / kmPerMonth : 0 };
}
// 할부: 원리금균등상환 월 납입금
function loanPayment(principal, annualRate, months){
  const r = annualRate / 100 / 12;
  const pay = r === 0 ? principal / months : principal * r / (1 - Math.pow(1 + r, -months));
  return { monthly: pay, total: pay * months, interest: pay * months - principal };
}
// 감가: 첫해 하락률 + 이후 연 하락률
function residual(newPrice, years, firstYear, perYear){
  if(years <= 0) return newPrice;
  let v = newPrice * (1 - firstYear / 100);
  for(let i = 1; i < years; i++) v *= (1 - perYear / 100);
  return v;
}
