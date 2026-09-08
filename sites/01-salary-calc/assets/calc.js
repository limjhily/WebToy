// 세금·보험 계산 로직 (rates.js 의존)
const R = window.RATES;
function bracketCalc(x, table){for(const [cap,rate,fixed] of table){if(x<=cap)return x*rate+fixed;}return 0;}
// 근로소득공제
function earnedDeduction(gross){let prev=0,acc=0;for(const [cap,rate,base] of R.earnedDeduction){if(gross<=cap){acc=base+(gross-prev)*rate;break;}prev=cap;}return Math.min(acc,R.earnedDeductionMax);}
// 산출세액
function incomeTax(base){for(const [cap,rate,prog] of R.brackets){if(base<=cap)return Math.max(0,base*rate-prog);}return 0;}
// 근로소득세액공제
function earnedTaxCredit(tax,gross){let c=tax<=1300000?tax*0.55:715000+(tax-1300000)*0.30;let cap;if(gross<=33000000)cap=740000;else if(gross<=70000000)cap=Math.max(660000,740000-(gross-33000000)*0.008);else if(gross<=120000000)cap=Math.max(500000,660000-(gross-70000000)*0.005);else cap=Math.max(200000,500000-(gross-120000000)*0.005);return Math.min(c,cap);}
// 4대보험 (월 기준)
function insurance(monthly){
  const pBase=Math.min(Math.max(monthly,R.pension.minBase),R.pension.maxBase);
  const pension=Math.floor(pBase*R.pension.rate/10)*10;
  const health=Math.floor(monthly*R.health/10)*10;
  const longCare=Math.floor(health*R.longCare/10)*10;
  const employment=Math.floor(monthly*R.employment/10)*10;
  return {pension,health,longCare,employment,total:pension+health+longCare+employment};
}
// 연봉 실수령액 (연 단위 추정 → 월 환산). nonTax: 월 비과세(식대 등), family: 본인 포함 부양가족 수
function netSalary(annual, nonTaxMonthly, family){
  const taxableAnnual=Math.max(0,annual-nonTaxMonthly*12);
  const monthlyTaxable=taxableAnnual/12;
  const ins=insurance(monthlyTaxable);
  const insAnnual=ins.total*12;
  // 과세표준 = 총급여 - 근로소득공제 - 인적공제 - 보험료(국민연금·건강·고용 소득공제)
  const base=Math.max(0,taxableAnnual-earnedDeduction(taxableAnnual)-R.basicDeduction*family-insAnnual);
  const tax=incomeTax(base);
  const credit=earnedTaxCredit(tax,taxableAnnual);
  const yearTax=Math.max(0,tax-credit);
  const monthTax=Math.floor(yearTax/12/10)*10;
  const local=Math.floor(monthTax*R.localTax/10)*10;
  const gross=annual/12;
  const net=gross-ins.total-monthTax-local;
  return {gross,ins,tax:monthTax,local,net,nonTax:nonTaxMonthly};
}
