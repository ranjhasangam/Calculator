// Data + Rendering + Compute
const $ = (q)=>document.querySelector(q);
const $$ = (q)=>document.querySelectorAll(q);
const fmtMoney = (n, c='₹') => `${c}${Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}`;
const fmtNum = (n) => Number(n).toLocaleString(undefined,{maximumFractionDigits:2});
const pct = (x)=> x/100;

// Categories styled like the reference (using pastel swatches)
const CATS = [
  { key:'invest',  title:'Investments & Interest', color:'blue'   },
  { key:'retire',  title:'Retirement',             color:'purple' },
  { key:'tax',     title:'Tax & Salary',           color:'orange' },
  { key:'other',   title:'Loans & Tools',          color:'green'  },
];

// SVG outline icons (simple, white) – no emojis
const ICONS = {
  chart: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="7" width="3" height="11"/><rect x="17" y="10" width="3" height="8"/></svg>',
  piggy: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11c0-3 3-5 7-5s7 2 7 5v2h2v2h-3a7 7 0 01-12 0H3v-2h2v-2z"/><circle cx="16" cy="10" r="1"/></svg>',
  bank:  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-6 9 6"/><path d="M4 10h16v10H4z"/><path d="M7 15h2M11 15h2M15 15h2"/></svg>',
  card:  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  calc:  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h3M13 15h3"/></svg>',
};

// Calculator registry (name, icon, tag/category group, inputs, compute)
const CALCS = [
  // Investments & Interest
  {key:'sip', name:'SIP', icon:'chart', tag:'Investments', cat:'invest',
    inputs:[{n:'Monthly Investment',k:'p',t:'number'},{n:'Annual Return (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({p,r,t})=>{p=+p; r=pct(+r); t=+t; const i=r/12; const n=t*12; const fv=p*((Math.pow(1+i,n)-1)/i); const invested=p*n; const profit=fv-invested; return {main:`Future Value: ${fmtMoney(fv)}`, invested:fmtMoney(invested), profit:fmtMoney(profit), details:`Over ${n} months.`};}
  },
  {key:'swp', name:'SWP', icon:'piggy', tag:'Investments', cat:'invest',
    inputs:[{n:'Starting Corpus',k:'c',t:'number'},{n:'Monthly Withdrawal',k:'w',t:'number'},{n:'Annual Return (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({c,w,r,t})=>{c=+c;w=+w;r=pct(+r);t=+t; const i=r/12; const n=t*12; let bal=c, totalW=0; for(let k=0;k<n;k++){ bal = bal*(1+i) - w; totalW+=w; } const invested=c; const profit=(totalW + Math.max(bal,0)) - invested; return {main:`Final Balance: ${fmtMoney(bal)}`, invested:fmtMoney(invested), profit:fmtMoney(profit), details:`Withdrawn ${fmtMoney(totalW)}.`};}
  },
  {key:'simple', name:'Simple Interest', icon:'calc', tag:'Interest', cat:'invest',
    inputs:[{n:'Principal',k:'p',t:'number'},{n:'Rate (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({p,r,t})=>{p=+p;r=pct(+r);t=+t; const a=p*(1+r*t); const interest=a-p; return {main:`Amount: ${fmtMoney(a)}`, invested:fmtMoney(p), profit:fmtMoney(interest)};}
  },
  {key:'compound', name:'Compound Interest', icon:'calc', tag:'Interest', cat:'invest',
    inputs:[{n:'Principal',k:'p',t:'number'},{n:'Rate (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'},{n:'Compounds/Year',k:'n',t:'number'}],
    compute: ({p,r,t,n})=>{p=+p;r=pct(+r);t=+t;n=+n||1; const a=p*Math.pow(1+r/n,n*t); return {main:`Amount: ${fmtMoney(a)}`, invested:fmtMoney(p), profit:fmtMoney(a-p), details:`Compounded ${n}×/year.`};}
  },
  {key:'fd', name:'FD', icon:'bank', tag:'Deposits', cat:'invest',
    inputs:[{n:'Deposit',k:'p',t:'number'},{n:'Annual Rate (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'},{n:'Compounds/Year',k:'n',t:'number'}],
    compute: ({p,r,t,n})=>{p=+p;r=pct(+r);t=+t;n=+n||4; const m=p*Math.pow(1+r/n,n*t); return {main:`Maturity: ${fmtMoney(m)}`, invested:fmtMoney(p), profit:fmtMoney(m-p), details:`Compounded ${n}×/year.`};}
  },
  {key:'investment', name:'Investment Calculator', icon:'chart', tag:'Investments', cat:'invest',
    inputs:[{n:'Initial Amount',k:'p',t:'number'},{n:'Monthly Additions',k:'pm',t:'number'},{n:'Annual Return (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({p,pm,r,t})=>{p=+p;pm=+pm;r=pct(+r);t=+t; const i=r/12,n=t*12; const fvL=p*Math.pow(1+r,t); const fvS= pm*((Math.pow(1+i,n)-1)/i); const fv=fvL+fvS; const inv=p+pm*n; return {main:`Future Value: ${fmtMoney(fv)}`, invested:fmtMoney(inv), profit:fmtMoney(fv-inv)};}
  },
  {key:'rate', name:'Interest Rate', icon:'chart', tag:'Rates', cat:'invest',
    inputs:[{n:'Start Amount',k:'p',t:'number'},{n:'End Amount',k:'a',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({p,a,t})=>{p=+p;a=+a;t=+t; const r=(Math.pow(a/p,1/t)-1)*100; return {main:`Estimated Rate: ${fmtNum(r)}%`, invested:fmtMoney(p), profit:fmtMoney(a-p)};}
  },
  {key:'savings', name:'Savings Goal', icon:'piggy', tag:'Savings', cat:'invest',
    inputs:[{n:'Target Amount',k:'fv',t:'number'},{n:'Annual Return (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({fv,r,t})=>{fv=+fv;r=pct(+r);t=+t; const i=r/12,n=t*12; const pmt=fv*i/(Math.pow(1+i,n)-1); const invested=pmt*n; return {main:`Monthly Needed: ${fmtMoney(pmt)}`, invested:fmtMoney(invested), profit:fmtMoney(fv-invested)};}
  },
  {key:'cd', name:'CD', icon:'bank', tag:'Deposits', cat:'invest',
    inputs:[{n:'Deposit',k:'p',t:'number'},{n:'Annual Rate (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'},{n:'Compounds/Year',k:'n',t:'number'}],
    compute: ({p,r,t,n})=>{p=+p;r=pct(+r);t=+t;n=+n||12; const m=p*Math.pow(1+r/n,n*t); return {main:`Maturity: ${fmtMoney(m)}`, invested:fmtMoney(p), profit:fmtMoney(m-p)};}
  },
  {key:'bond', name:'Bond', icon:'bank', tag:'Bonds', cat:'invest',
    inputs:[{n:'Face Value',k:'fv',t:'number'},{n:'Coupon Rate (%)',k:'c',t:'number'},{n:'YTM (%)',k:'y',t:'number'},{n:'Years',k:'t',t:'number'},{n:'Payments/Year',k:'m',t:'number'}],
    compute: ({fv,c,y,t,m})=>{fv=+fv;c=pct(+c);y=pct(+y);t=+t;m=+m||2; const n=t*m; const i=y/m; const coupon=fv*c/m; let price=0; for(let k=1;k<=n;k++){ price+= coupon/Math.pow(1+i,k);} price+= fv/Math.pow(1+i,n); return {main:`Bond Price: ${fmtMoney(price)}`, invested:fmtMoney(price), profit:fmtMoney((coupon*m*t+fv)-price)};}
  },
  {key:'avgReturn', name:'Average Return', icon:'chart', tag:'Analytics', cat:'invest',
    inputs:[{n:'Returns % (comma separated)',k:'list',t:'text'}],
    compute: ({list})=>{ const arr=list.split(',').map(x=>parseFloat(x.trim())/100+1).filter(x=>!isNaN(x)); const gm=Math.pow(arr.reduce((a,b)=>a*b,1),1/arr.length)-1; return {main:`Geometric Avg: ${fmtNum(gm*100)}%`, invested:'—', profit:'—', details:`Based on ${arr.length} periods.`};}
  },
  {key:'irr', name:'IRR', icon:'chart', tag:'Analytics', cat:'invest',
    inputs:[{n:'Cash Flows (comma, start→end)',k:'flows',t:'text'}],
    compute: ({flows})=>{ const cf=flows.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x)); const irr=solveIRR(cf); return {main:`IRR: ${fmtNum(irr*100)}%`, invested:fmtMoney(-cf[0]||0), profit:'—', details:`Internal rate.`};}
  },
  {key:'roi', name:'ROI', icon:'chart', tag:'Analytics', cat:'invest',
    inputs:[{n:'Gain',k:'gain',t:'number'},{n:'Cost',k:'cost',t:'number'}],
    compute: ({gain,cost})=>{gain=+gain;cost=+cost; const roi=(gain-cost)/cost; return {main:`ROI: ${fmtNum(roi*100)}%`, invested:fmtMoney(cost), profit:fmtMoney(gain-cost)};}
  },
  {key:'payback', name:'Payback', icon:'calc', tag:'Analytics', cat:'invest',
    inputs:[{n:'Cash Flows (comma, start→end)',k:'flows',t:'text'}],
    compute: ({flows})=>{ const cf=flows.split(',').map(x=>parseFloat(x.trim())); let cum=0; let period=-1; for(let i=0;i<cf.length;i++){ cum+=cf[i]; if(cum>=0){ period=i; break; } } return {main:`Payback Period: ${period>=0? period + ' periods' : 'Not recovered'}`, invested:fmtMoney(-cf[0]||0), profit:'—'};}
  },
  {key:'pv', name:'Present Value', icon:'calc', tag:'Valuation', cat:'invest',
    inputs:[{n:'Future Amount',k:'fv',t:'number'},{n:'Annual Rate (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({fv,r,t})=>{fv=+fv;r=pct(+r);t=+t; const pv=fv/Math.pow(1+r,t); return {main:`Present Value: ${fmtMoney(pv)}`, invested:'—', profit:'—'};}
  },
  {key:'fv', name:'Future Value', icon:'chart', tag:'Valuation', cat:'invest',
    inputs:[{n:'Present Amount',k:'pv',t:'number'},{n:'Annual Rate (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({pv,r,t})=>{pv=+pv;r=pct(+r);t=+t; const fv=pv*Math.pow(1+r,t); return {main:`Future Value: ${fmtMoney(fv)}`, invested:fmtMoney(pv), profit:fmtMoney(fv-pv)};}
  },

  // Retirement
  {key:'retirement', name:'Retirement', icon:'piggy', tag:'Retirement', cat:'retire',
    inputs:[{n:'Current Age',k:'age',t:'number'},{n:'Retirement Age',k:'rage',t:'number'},{n:'Monthly Expense (today)',k:'exp',t:'number'},{n:'Inflation (%)',k:'inf',t:'number'},{n:'Post-Ret. Return (%)',k:'ret',t:'number'},{n:'Life Expectancy',k:'life',t:'number'}],
    compute: ({age,rage,exp,inf,ret,life})=>{age=+age;rage=+rage;exp=+exp;inf=pct(+inf);ret=pct(+ret);life=+life; const yearsToRet=rage-age; const yearsAfter=life-rage; const expAtRet=exp*Math.pow(1+inf,yearsToRet); const real=(1+ret)/(1+inf)-1; const n=yearsAfter*12; const i=real/12; const pmt=expAtRet; const corpus = pmt*((1-Math.pow(1+i,-n))/i); return {main:`Needed Corpus: ${fmtMoney(corpus)}`, invested:'—', profit:'—', details:`Covers ${yearsAfter} years.`};}
  },
  {key:'annuity', name:'Annuity', icon:'bank', tag:'Retirement', cat:'retire',
    inputs:[{n:'Corpus',k:'c',t:'number'},{n:'Annual Rate (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({c,r,t})=>{c=+c;r=pct(+r);t=+t; const i=r/12; const n=t*12; const pmt=c*i/(1-Math.pow(1+i,-n)); return {main:`Monthly Payout: ${fmtMoney(pmt)}`, invested:fmtMoney(c), profit:'—'};}
  },
  {key:'annuityPayout', name:'Annuity Payout', icon:'bank', tag:'Retirement', cat:'retire',
    inputs:[{n:'Monthly Payout Desired',k:'pmt',t:'number'},{n:'Annual Rate (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({pmt,r,t})=>{pmt=+pmt;r=pct(+r);t=+t; const i=r/12; const n=t*12; const corpus=pmt*(1-Math.pow(1+i,-n))/i; return {main:`Corpus Required: ${fmtMoney(corpus)}`, invested:fmtMoney(corpus), profit:'—'};}
  },
  {key:'pension', name:'Pension', icon:'bank', tag:'Retirement', cat:'retire',
    inputs:[{n:'Corpus',k:'c',t:'number'},{n:'Draw Rate (%/yr)',k:'d',t:'number'}],
    compute: ({c,d})=>{c=+c;d=pct(+d); const annual=c*d; return {main:`Annual Pension: ${fmtMoney(annual)}`, invested:fmtMoney(c), profit:'—'};}
  },
  {key:'ira', name:'IRA / 401k / Roth', icon:'bank', tag:'Retirement', cat:'retire',
    inputs:[{n:'Start Amount',k:'p',t:'number'},{n:'Monthly Contribution',k:'pm',t:'number'},{n:'Annual Return (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({p,pm,r,t})=>{p=+p;pm=+pm;r=pct(+r);t=+t; const i=r/12; const n=t*12; const fv=p*Math.pow(1+r,t)+pm*((Math.pow(1+i,n)-1)/i); const inv=p+pm*n; return {main:`Projected Balance: ${fmtMoney(fv)}`, invested:fmtMoney(inv), profit:fmtMoney(fv-inv)};}
  },

  // Tax & Salary
  {key:'incomeTax', name:'Income Tax', icon:'calc', tag:'Tax', cat:'tax',
    inputs:[{n:'Gross Income',k:'g',t:'number'},{n:'Tax Rate (%)',k:'rate',t:'number'}],
    compute: ({g,rate})=>{g=+g;rate=pct(+rate); const tax=g*rate; return {main:`Estimated Tax: ${fmtMoney(tax)}`, invested:fmtMoney(g), profit:fmtMoney(g-tax)};}
  },
  {key:'salary', name:'Salary (Take‑Home)', icon:'card', tag:'Paycheck', cat:'tax',
    inputs:[{n:'Gross Monthly Pay',k:'g',t:'number'},{n:'Deductions (%)',k:'d',t:'number'}],
    compute: ({g,d})=>{g=+g;d=pct(+d); const net=g*(1-d); return {main:`Take‑Home: ${fmtMoney(net)}`, invested:fmtMoney(g), profit:fmtMoney(net)};}
  },
  {key:'marriageTax', name:'Marriage Tax', icon:'calc', tag:'Tax', cat:'tax',
    inputs:[{n:'Partner A Income',k:'a',t:'number'},{n:'Partner B Income',k:'b',t:'number'},{n:'Joint Tax Rate (%)',k:'r',t:'number'}],
    compute: ({a,b,r})=>{a=+a;b=+b;r=pct(+r); const joint=(a+b)*r; return {main:`Joint Tax: ${fmtMoney(joint)}`, invested:fmtMoney(a+b), profit:fmtMoney(a+b-joint)};}
  },
  {key:'estate', name:'Estate Tax', icon:'calc', tag:'Tax', cat:'tax',
    inputs:[{n:'Estate Value',k:'v',t:'number'},{n:'Tax Rate (%)',k:'r',t:'number'}],
    compute: ({v,r})=>{v=+v;r=pct(+r); const tax=v*r; return {main:`Estimated Estate Tax: ${fmtMoney(tax)}`, invested:fmtMoney(v), profit:fmtMoney(v-tax)};}
  },
  {key:'paycheck', name:'Take‑Home Paycheck', icon:'card', tag:'Paycheck', cat:'tax',
    inputs:[{n:'Gross Pay',k:'g',t:'number'},{n:'Deductions (%)',k:'d',t:'number'}],
    compute: ({g,d})=>{g=+g;d=pct(+d); const net=g*(1-d); return {main:`Net Pay: ${fmtMoney(net)}`, invested:fmtMoney(g), profit:fmtMoney(net)};}
  },

  // Other (Loans & Tools)
  {key:'emi', name:'EMI (India)', icon:'card', tag:'Loans', cat:'other',
    inputs:[{n:'Loan Amount',k:'L',t:'number'},{n:'Annual Rate (%)',k:'r',t:'number'},{n:'Tenure (months)',k:'m',t:'number'}],
    compute: ({L,r,m})=>{L=+L;r=pct(+r)/12;m=+m; const emi=L*r*Math.pow(1+r,m)/(Math.pow(1+r,m)-1); const total=emi*m; const interest=total-L; return {main:`Monthly EMI: ${fmtMoney(emi)}`, invested:fmtMoney(L), profit:fmtMoney(interest), details:`Total payment ${fmtMoney(total)}.`};}
  },
  {key:'loan', name:'Loan', icon:'card', tag:'Loans', cat:'other',
    inputs:[{n:'Principal',k:'L',t:'number'},{n:'Annual Rate (%)',k:'r',t:'number'},{n:'Months',k:'m',t:'number'}],
    compute: ({L,r,m})=>{L=+L;r=pct(+r)/12;m=+m; const pmt=L*r*Math.pow(1+r,m)/(Math.pow(1+r,m)-1); const total=pmt*m; return {main:`Monthly Payment: ${fmtMoney(pmt)}`, invested:fmtMoney(L), profit:fmtMoney(total-L)};}
  },
  {key:'payment', name:'Payment', icon:'card', tag:'Loans', cat:'other',
    inputs:[{n:'Amount',k:'L',t:'number'},{n:'Annual Rate (%)',k:'r',t:'number'},{n:'Months',k:'m',t:'number'}],
    compute: ({L,r,m})=>{L=+L;r=pct(+r)/12;m=+m; const pmt=L*r*Math.pow(1+r,m)/(Math.pow(1+r,m)-1); const total=pmt*m; return {main:`Monthly Payment: ${fmtMoney(pmt)}`, invested:fmtMoney(L), profit:fmtMoney(total-L)};}
  },
  {key:'currency', name:'Currency (manual)', icon:'calc', tag:'Tools', cat:'other',
    inputs:[{n:'Amount',k:'amt',t:'number'},{n:'Rate (To per From)',k:'rate',t:'number'}],
    compute: ({amt,rate})=>{amt=+amt;rate=+rate; const out=amt*rate; return {main:`Converted: ${fmtNum(out)}`, invested:fmtNum(amt), profit:'—', details:'Manual rate'};}
  },
  {key:'inflation', name:'Inflation', icon:'calc', tag:'Prices', cat:'other',
    inputs:[{n:'Base Amount',k:'a',t:'number'},{n:'Inflation (%)',k:'r',t:'number'},{n:'Years',k:'t',t:'number'}],
    compute: ({a,r,t})=>{a=+a;r=pct(+r);t=+t; const fv=a*Math.pow(1+r,t); return {main:`Adjusted Amount: ${fmtMoney(fv,'')}`, invested:fmtMoney(a,''), profit:'—'};}
  },
  {key:'salesTax', name:'Sales Tax', icon:'calc', tag:'Prices', cat:'other',
    inputs:[{n:'Price',k:'p',t:'number'},{n:'Tax Rate (%)',k:'r',t:'number'}],
    compute: ({p,r})=>{p=+p;r=pct(+r); const tax=p*r; const total=p+tax; return {main:`Total Price: ${fmtMoney(total)}`, invested:fmtMoney(p), profit:fmtMoney(tax)};}
  },
  {key:'creditCard', name:'Credit Card', icon:'card', tag:'Debt', cat:'other',
    inputs:[{n:'Balance',k:'bal',t:'number'},{n:'APR (%)',k:'apr',t:'number'},{n:'Monthly Payment',k:'pmt',t:'number'}],
    compute: ({bal,apr,pmt})=>{bal=+bal;apr=pct(+apr)/12;pmt=+pmt; let months=0,interest=0; let b=bal; while(b>0 && months<1200){ const int=b*apr; b=b+int-pmt; if(pmt<=int){ months=Infinity; break; } interest+=int; months++; } return {main:`Months to Payoff: ${months===Infinity?'Never (payment too low)':months}`, invested:fmtMoney(bal), profit:fmtMoney(-interest), details:`Total interest ${fmtMoney(interest)}.`};}
  },
  {key:'ccPayoff', name:'CC Payoff (Min %)', icon:'card', tag:'Debt', cat:'other',
    inputs:[{n:'Balance',k:'bal',t:'number'},{n:'APR (%)',k:'apr',t:'number'},{n:'Min Payment (% bal)',k:'minp',t:'number'},{n:'Min Payment Floor',k:'minf',t:'number'}],
    compute: ({bal,apr,minp,minf})=>{bal=+bal;apr=pct(+apr)/12;minp=pct(+minp);minf=+minf||0; let months=0,interest=0; let b=bal; while(b>0 && months<1200){ const int=b*apr; let pay=Math.max(b*minp,minf); if(pay> b+int) pay=b+int; b=b+int-pay; interest+=int; months++; } return {main:`Months to Payoff: ${months}`, invested:fmtMoney(bal), profit:fmtMoney(-interest), details:`Interest ${fmtMoney(interest)}.`};}
  },
];

function solveIRR(cf){
  let r0=0.1, r1=0.2;
  const npv = (r)=> cf.reduce((acc, c, i)=> acc + c/Math.pow(1+r,i), 0);
  for(let k=0;k<80;k++){
    const f0=npv(r0), f1=npv(r1);
    const r2 = r1 - f1*(r1-r0)/(f1-f0);
    if(!isFinite(r2)) break;
    if(Math.abs(r2-r1)<1e-7) return r2;
    r0=r1; r1=r2;
  }
  return r1;
}

// Map calculators into their categories
const grouped = CATS.reduce((acc,c)=> (acc[c.key]=[], acc), {});
for(const c of CALCS){ if(grouped[c.cat]) grouped[c.cat].push(c); }

// Render
const container = $('#categories');
for(const cat of CATS){
  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML = `<h2 class="section-title">${cat.title}</h2>
    <div class="grid" id="grid-${cat.key}"></div>`;
  container.appendChild(section);

  const grid = section.querySelector('.grid');
  for(const calc of grouped[cat.key]){
    const card = document.createElement('button');
    card.className='card';
    card.innerHTML = `
      <div class="icon bg-${cat.color}">${ICONS[calc.icon]||ICONS.calc}</div>
      <div class="label">${calc.name}</div>
    `;
    card.addEventListener('click', ()=> openCalc(calc, cat));
    grid.appendChild(card);
  }
}

// Modal logic
const modal = $('#modal');
const closeModal = $('#closeModal');
const form = $('#calcForm');
const mainResult = $('#mainResult');
const invested = $('#invested');
const profit = $('#profit');
const resultBox = $('#result');
const moreDetails = $('#moreDetails');
const modalTitle = $('#modalTitle');
const modalIcon = $('#modalIcon');
const modalTag = $('#modalTag');

function openCalc(calc, cat){
  modal.classList.add('show');
  modalTitle.textContent = calc.name;
  modalIcon.innerHTML = `<div class="icon bg-${cat.color}">${ICONS[calc.icon]||ICONS.calc}</div>`;
  modalTag.textContent = cat.title;

  // Build form
  form.innerHTML='';
  for(const inp of calc.inputs){
    const label = document.createElement('label');
    label.textContent = inp.n;
    const input = document.createElement('input');
    input.type = inp.t || 'number'; input.name = inp.k; input.required = true;
    label.appendChild(input);
    form.appendChild(label);
  }
  const btn = document.createElement('button');
  btn.type='submit'; btn.textContent='Calculate';
  form.appendChild(btn);
  resultBox.classList.add('hidden');

  form.onsubmit = (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const out = calc.compute(data);
    mainResult.textContent = out.main || '';
    invested.textContent = out.invested || '';
    profit.textContent = out.profit || '';
    moreDetails.textContent = out.details || '';
    resultBox.classList.remove('hidden');
  };
}
closeModal.addEventListener('click', ()=> modal.classList.remove('show'));
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') modal.classList.remove('show'); });

// Search
$('#search').addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase();
  for(const card of $$('.card')){
    const name = card.textContent.toLowerCase();
    card.style.display = name.includes(q) ? 'flex' : 'none';
  }
});
