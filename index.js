let balance = 1000000000;
const year = 2;

console.log(`Saldo awal: ${balance}`);

console.log(`Saldo setelah ${year} tahun: ${total(year)}`);

function total(perYear) {
  const depositoBank = 350000000;
  const obligasiNegara = (30 / 100) * 650000000;
  const saham_A = (35 / 100) * 650000000;
  const saham_B = (35 / 100) * 650000000;

  let depositoBankProfit = (3.5 / 100) * depositoBank * perYear;
  let obligasiNegaraProfit = (13 / 100) * obligasiNegara * perYear;
  let saham_A_Profit = (14.5 / 100) * saham_A * perYear;
  let saham_B_Profit = (12.5 / 100) * saham_B * perYear;

  return balance + depositoBankProfit + obligasiNegaraProfit + saham_A_Profit + saham_B_Profit;
}

// 1 198 050 000
//1 099 025 000
