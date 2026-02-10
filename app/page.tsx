"use client"
import React, { useState, useMemo, ReactNode } from 'react';

// Types
interface PowerUserModule {
  enabled: boolean;
  powerUsers: number;
}

interface IAnalyzeModule {
  enabled: boolean;
  spendMn: number;
  refreshRate: RefreshRate;
}

interface ContractModule {
  enabled: boolean;
  annualContracts: number;
}

interface SupplierModule {
  enabled: boolean;
  criticalSuppliers: number;
}

interface UserModule {
  enabled: boolean;
  users: number;
}

interface InvoiceModule {
  enabled: boolean;
  invoices: number;
}

interface TailspendModule {
  enabled: boolean;
  tailspend: number;
}

interface ModulesState {
  iAnalyze: IAnalyzeModule;
  iSource: PowerUserModule;
  iSupplier: PowerUserModule;
  iRisk: PowerUserModule;
  iContract: PowerUserModule;
  iSave: PowerUserModule;
  iManage: PowerUserModule;
  merlinCLM: ContractModule;
  merlinRiskRadar: SupplierModule;
  eProcurement: UserModule;
  merlinIntake: UserModule;
  eInvoicing: InvoiceModule;
  ana: TailspendModule;
}

type ModuleName = keyof ModulesState;
type RefreshRate = 'Quarterly' | 'Monthly' | 'Fortnightly' | 'Weekly';
type Region = 'USA' | 'EU' | 'ANZ' | 'MEA' | 'SEA' | 'India';
type Revenue = 'Above $1Bn' | 'Below $1Bn';
type Industry = 'Manufacturing' | 'Energy / Mining' | 'Pharma / Life Sciences' | 'Financial Services' | 'Public Sector';

interface PriceResult {
  moduleBreakdown: Record<string, number>;
  listPrice: number;
  accountBasedPrice: number;
  discount: number;
  industryMultiplier: number;
  arrPerBillionPrice: number;
  accumulatedWeightage: number;
}

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface SelectFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: (string | number)[];
}

interface ModuleCardProps {
  name: string;
  displayName: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: ReactNode;
  price?: number;
}

// iSource/iSupplier/iContract Power User pricing table
const powerUserTable: Record<number, number> = {
  5: 36125, 6: 39100, 7: 42075, 8: 45050, 9: 48025, 10: 51000,
  11: 52700, 12: 54400, 13: 56100, 14: 57800, 15: 59500,
  16: 61200, 17: 62900, 18: 64600, 19: 66300, 20: 68000,
  21: 69290, 22: 70560, 23: 71810, 24: 73040, 25: 74250,
  26: 75440, 27: 76610, 28: 77760, 29: 78890, 30: 80000,
  31: 81200, 32: 82400, 33: 83600, 34: 84800, 35: 86000,
  36: 87200, 37: 88400, 38: 89600, 39: 90800, 40: 92000,
  41: 93200, 42: 94400, 43: 95600, 44: 96800, 45: 98000,
  46: 99200, 47: 100400, 48: 101600, 49: 102800, 50: 104000,
  51: 104640, 52: 105280, 53: 105920, 54: 106560, 55: 107200,
  56: 107840, 57: 108480, 58: 109120, 59: 109760, 60: 110400,
  61: 111040, 62: 111680, 63: 112320, 64: 112960, 65: 113600,
  66: 114240, 67: 114880, 68: 115520, 69: 116160, 70: 116800,
  71: 117440, 72: 118080, 73: 118720, 74: 119360, 75: 120000,
  76: 120640, 77: 121280, 78: 121920, 79: 122560, 80: 123200,
  81: 123840, 82: 124480, 83: 125120, 84: 125760, 85: 126400,
  86: 127040, 87: 127680, 88: 128320, 89: 128960, 90: 129600,
  91: 130240, 92: 130880, 93: 131520, 94: 132160, 95: 132800,
  96: 133440, 97: 134080, 98: 134720, 99: 135360, 100: 136000,
  101: 136480, 102: 136960, 103: 137440, 104: 137920, 105: 138400,
  106: 138880, 107: 139360, 108: 139840, 109: 140320, 110: 140800,
  111: 141280, 112: 141760, 113: 142240, 114: 142720, 115: 143200,
  116: 143680, 117: 144160, 118: 144640, 119: 145120, 120: 145600,
  121: 146080, 122: 146560, 123: 147040, 124: 147520, 125: 148000,
  126: 148480, 127: 148960, 128: 149440, 129: 149920, 130: 150400,
  131: 150880, 132: 151360, 133: 151840, 134: 152320, 135: 152800,
  136: 153280, 137: 153760, 138: 154240, 139: 154720, 140: 155200,
  141: 155680, 142: 156160, 143: 156640, 144: 157120, 145: 157600,
  146: 158080, 147: 158560, 148: 159040, 149: 159520, 150: 160000,
  151: 160400, 152: 160800, 153: 161200, 154: 161600, 155: 162000,
  156: 162400, 157: 162800, 158: 163200, 159: 163600, 160: 164000,
  161: 164400, 162: 164800, 163: 165200, 164: 165600, 165: 166000,
  166: 166400, 167: 166800, 168: 167200, 169: 167600, 170: 168000,
  171: 168400, 172: 168800, 173: 169200, 174: 169600, 175: 170000,
  176: 170400, 177: 170800, 178: 171200, 179: 171600, 180: 172000,
  181: 172400, 182: 172800, 183: 173200, 184: 173600, 185: 174000,
  186: 174400, 187: 174800, 188: 175200, 189: 175600, 190: 176000,
  191: 176400, 192: 176800, 193: 177200, 194: 177600, 195: 178000,
  196: 178400, 197: 178800, 198: 179200, 199: 179600, 200: 180000,
  201: 180240, 202: 180480, 203: 180720, 204: 180960, 205: 181200,
  206: 181440, 207: 181680, 208: 181920, 209: 182160, 210: 182400,
  211: 182640, 212: 182880, 213: 183120, 214: 183360, 215: 183600,
  216: 183840, 217: 184080, 218: 184320, 219: 184560, 220: 184800,
  221: 185040, 222: 185280, 223: 185520, 224: 185760, 225: 186000,
  226: 186240, 227: 186480, 228: 186720, 229: 186960, 230: 187200,
  231: 187440, 232: 187680, 233: 187920, 234: 188160, 235: 188400,
  236: 188640, 237: 188880, 238: 189120, 239: 189360, 240: 189600,
  241: 189840, 242: 190080, 243: 190320, 244: 190560, 245: 190800,
  246: 191040, 247: 191280, 248: 191520, 249: 191760, 250: 192000,
  251: 192240, 252: 192480, 253: 192720, 254: 192960, 255: 193200,
  256: 193440, 257: 193680, 258: 193920, 259: 194160, 260: 194400,
  261: 194640, 262: 194880, 263: 195120, 264: 195360, 265: 195600,
  266: 195840, 267: 196080, 268: 196320, 269: 196560, 270: 196800,
  271: 197040, 272: 197280, 273: 197520, 274: 197760, 275: 198000,
  276: 198240, 277: 198480, 278: 198720, 279: 198960, 280: 199200,
  281: 199440, 282: 199680, 283: 199920, 284: 200160, 285: 200400,
  286: 200640, 287: 200880, 288: 201120, 289: 201360, 290: 201600,
  291: 201840, 292: 202080, 293: 202320, 294: 202560, 295: 202800,
  296: 203040, 297: 203280, 298: 203520, 299: 203760, 300: 204000
};

// iAnalyze spend tier table
const iAnalyzeSpendTable: Record<number, number> = {
  250: 70000, 500: 80000, 750: 85000, 1000: 91000, 2000: 113000,
  3000: 133000, 4000: 154000, 5000: 175000, 6000: 196000, 7000: 217000,
  8000: 239000, 9000: 260000, 10000: 283000, 12000: 324000, 15000: 385000
};

const refreshRateMultipliers: Record<RefreshRate, number> = {
  'Quarterly': 0.85,
  'Monthly': 1,
  'Fortnightly': 1.2,
  'Weekly': 1.4
};

// Region + Revenue discount matrix
const regionRevenueDiscount: Record<Region, Record<Revenue, number>> = {
  'USA': { 'Above $1Bn': 0, 'Below $1Bn': 0.25 },
  'EU': { 'Above $1Bn': 0, 'Below $1Bn': 0.25 },
  'ANZ': { 'Above $1Bn': 0, 'Below $1Bn': 0.25 },
  'MEA': { 'Above $1Bn': 0.30, 'Below $1Bn': 0.35 },
  'SEA': { 'Above $1Bn': 0.30, 'Below $1Bn': 0.35 },
  'India': { 'Above $1Bn': 0.30, 'Below $1Bn': 0.35 }
};

// Industry multipliers
const industryMultipliers: Record<Industry, number> = {
  'Manufacturing': 1.0,
  'Energy / Mining': 1.2,
  'Pharma / Life Sciences': 1.3,
  'Financial Services': 1.4,
  'Public Sector': 0.7
};

// ARR per Billion Spend weightages
const ARR_PER_BILLION = 350000;
const moduleWeightages: Record<string, number> = {
  iAnalyze: 0.08,
  iSource: 0.10,
  iSupplier: 0.10,
  iRisk: 0.08,
  iContract: 0.12,
  iSave: 0.06,
  iManage: 0.03,
  merlinIntake: 0.08,
  merlinCLM: 0.05,
  merlinRiskRadar: 0.05,
  eProcurement: 0.20,
  eInvoicing: 0.20,
  ana: 0.15
};

// Helper functions
const getPowerUserPrice = (users: number): number => {
  if (users < 5) return 0;
  if (users > 300) users = 300;
  return powerUserTable[users] || 0;
};

const getIAnalyzePrice = (spendMn: number, refreshRate: RefreshRate): number => {
  const spendTiers = [250, 500, 750, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000, 15000];
  let tierPrice = 0;
  for (let i = spendTiers.length - 1; i >= 0; i--) {
    if (spendMn >= spendTiers[i]) {
      tierPrice = iAnalyzeSpendTable[spendTiers[i]];
      break;
    }
  }
  return tierPrice * refreshRateMultipliers[refreshRate];
};

const getISavePrice = (users: number): number => {
  if (users < 10) users = 10;
  const slabs = [
    { min: 1, max: 10, rate: 1500 },
    { min: 11, max: 20, rate: 1000 },
    { min: 21, max: 30, rate: 850 },
    { min: 31, max: 50, rate: 600 },
    { min: 51, max: 100, rate: 500 },
    { min: 101, max: 150, rate: 400 },
    { min: 151, max: 200, rate: 250 },
    { min: 201, max: 300, rate: 200 }
  ];
  let total = 20000;
  let remaining = users;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const usersInSlab = Math.min(remaining, slab.max - slab.min + 1);
    total += usersInSlab * slab.rate;
    remaining -= usersInSlab;
  }
  return total;
};

const getIManagePrice = (users: number): number => {
  if (users < 10) users = 10;
  const slabs = [
    { min: 1, max: 10, rate: 1000 },
    { min: 11, max: 20, rate: 500 },
    { min: 21, max: 30, rate: 500 },
    { min: 31, max: 50, rate: 200 },
    { min: 51, max: 100, rate: 100 },
    { min: 101, max: 150, rate: 100 },
    { min: 151, max: 200, rate: 60 },
    { min: 201, max: 300, rate: 50 }
  ];
  let total = 10000;
  let remaining = users;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const usersInSlab = Math.min(remaining, slab.max - slab.min + 1);
    total += usersInSlab * slab.rate;
    remaining -= usersInSlab;
  }
  return total;
};

const getMerlinCLMPrice = (annualContracts: number): number => {
  const powerUsers = Math.ceil(annualContracts / 50);
  const tiers = [
    { max: 10, rate: 2000 },
    { max: 25, rate: 1000 },
    { max: 50, rate: 800 },
    { max: 75, rate: 500 },
    { max: 100, rate: 400 },
    { max: 150, rate: 380 },
    { max: 200, rate: 350 },
    { max: 250, rate: 300 },
    { max: 300, rate: 250 }
  ];
  for (const tier of tiers) {
    if (powerUsers <= tier.max) {
      return powerUsers * tier.rate;
    }
  }
  return powerUsers * 250;
};

const getMerlinRiskRadarPrice = (criticalSuppliers: number): number => {
  const powerUsers = Math.ceil(criticalSuppliers / 100);
  const iRiskPrice = getPowerUserPrice(powerUsers) * 0.8;
  return iRiskPrice / 2;
};

const getEProcurementPrice = (users: number): number => {
  const slabs = [
    { min: 1, max: 500, rate: 100 },
    { min: 501, max: 1000, rate: 80.16 },
    { min: 1001, max: 2500, rate: 80.10 },
    { min: 2501, max: 5000, rate: 78 },
    { min: 5001, max: 7500, rate: 78 },
    { min: 7501, max: 10000, rate: 70 },
    { min: 10001, max: 15000, rate: 65 },
    { min: 15001, max: 20000, rate: 60 },
    { min: 20001, max: 25000, rate: 45 },
    { min: 25001, max: 30000, rate: 45 }
  ];
  let total = 0;
  let remaining = users;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const slabSize = slab.max - slab.min + 1;
    const usersInSlab = Math.min(remaining, slabSize);
    total += usersInSlab * slab.rate;
    remaining -= usersInSlab;
  }
  return total;
};

const getMerlinIntakePrice = (users: number): number => {
  const slabs = [
    { min: 1, max: 500, rate: 40 },
    { min: 501, max: 1000, rate: 35 },
    { min: 1001, max: 2500, rate: 30 },
    { min: 2501, max: 5000, rate: 24 },
    { min: 5001, max: 10000, rate: 18 },
    { min: 10001, max: 20000, rate: 15 },
    { min: 20001, max: 100000, rate: 13 }
  ];
  let total = 0;
  let remaining = users;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const slabSize = slab.max - slab.min + 1;
    const usersInSlab = Math.min(remaining, slabSize);
    total += usersInSlab * slab.rate;
    remaining -= usersInSlab;
  }
  return total;
};

const getEInvoicingPrice = (invoices: number): number => {
  const tiers = [
    { max: 20000, rate: 2.00 },
    { max: 50000, rate: 1.88 },
    { max: 100000, rate: 1.49 },
    { max: 150000, rate: 1.29 },
    { max: 250000, rate: 1.10 },
    { max: 500000, rate: 0.87 },
    { max: 750000, rate: 0.75 },
    { max: 1000000, rate: 0.67 },
    { max: 2500000, rate: 0.48 }
  ];
  for (const tier of tiers) {
    if (invoices <= tier.max) {
      return invoices * tier.rate;
    }
  }
  return invoices * 0.48;
};

const getANAPrice = (tailspend: number): number => {
  const slabs = [
    { min: 1, max: 5000000, rate: 0.009 },
    { min: 5000001, max: 10000000, rate: 0.004 },
    { min: 10000001, max: 25000000, rate: 0.00347 },
    { min: 25000001, max: 50000000, rate: 0.00264 },
    { min: 50000001, max: 100000000, rate: 0.0023 },
    { min: 100000001, max: 250000000, rate: 0.00135 },
    { min: 250000001, max: 500000000, rate: 0.001 }
  ];
  let total = 0;
  let remaining = tailspend;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const slabSize = slab.max - slab.min + 1;
    const amountInSlab = Math.min(remaining, slabSize);
    total += amountInSlab * slab.rate;
    remaining -= amountInSlab;
  }
  return total;
};

export default function ZycusPricingCalculator(): React.ReactElement {
  const [modules, setModules] = useState<ModulesState>({
    iAnalyze: { enabled: false, spendMn: 1000, refreshRate: 'Monthly' },
    iSource: { enabled: false, powerUsers: 10 },
    iSupplier: { enabled: false, powerUsers: 10 },
    iRisk: { enabled: false, powerUsers: 10 },
    iContract: { enabled: false, powerUsers: 10 },
    iSave: { enabled: false, powerUsers: 10 },
    iManage: { enabled: false, powerUsers: 10 },
    merlinCLM: { enabled: false, annualContracts: 500 },
    merlinRiskRadar: { enabled: false, criticalSuppliers: 1000 },
    eProcurement: { enabled: false, users: 500 },
    merlinIntake: { enabled: false, users: 500 },
    eInvoicing: { enabled: false, invoices: 50000 },
    ana: { enabled: false, tailspend: 50000000 }
  });

  const [region, setRegion] = useState<Region>('USA');
  const [revenue, setRevenue] = useState<Revenue>('Above $1Bn');
  const [industry, setIndustry] = useState<Industry>('Manufacturing');
  const [spendBillions, setSpendBillions] = useState<number>(1);

  const updateModule = <K extends ModuleName>(
    moduleName: K,
    field: keyof ModulesState[K],
    value: ModulesState[K][keyof ModulesState[K]]
  ): void => {
    setModules(prev => ({
      ...prev,
      [moduleName]: { ...prev[moduleName], [field]: value }
    }));
  };

  const prices = useMemo<PriceResult>(() => {
    const moduleBreakdown: Record<string, number> = {};
    
    if (modules.iAnalyze.enabled) {
      moduleBreakdown.iAnalyze = getIAnalyzePrice(modules.iAnalyze.spendMn, modules.iAnalyze.refreshRate);
    }
    if (modules.iSource.enabled) {
      moduleBreakdown.iSource = getPowerUserPrice(modules.iSource.powerUsers);
    }
    if (modules.iSupplier.enabled) {
      moduleBreakdown.iSupplier = getPowerUserPrice(modules.iSupplier.powerUsers);
    }
    if (modules.iRisk.enabled) {
      moduleBreakdown.iRisk = getPowerUserPrice(modules.iRisk.powerUsers) * 0.8;
    }
    if (modules.iContract.enabled) {
      moduleBreakdown.iContract = getPowerUserPrice(modules.iContract.powerUsers);
    }
    if (modules.iSave.enabled) {
      moduleBreakdown.iSave = getISavePrice(modules.iSave.powerUsers);
    }
    if (modules.iManage.enabled) {
      moduleBreakdown.iManage = getIManagePrice(modules.iManage.powerUsers);
    }
    if (modules.merlinCLM.enabled) {
      moduleBreakdown.merlinCLM = getMerlinCLMPrice(modules.merlinCLM.annualContracts);
    }
    if (modules.merlinRiskRadar.enabled) {
      moduleBreakdown.merlinRiskRadar = getMerlinRiskRadarPrice(modules.merlinRiskRadar.criticalSuppliers);
    }
    if (modules.eProcurement.enabled) {
      moduleBreakdown.eProcurement = getEProcurementPrice(modules.eProcurement.users);
    }
    if (modules.merlinIntake.enabled) {
      moduleBreakdown.merlinIntake = getMerlinIntakePrice(modules.merlinIntake.users);
    }
    if (modules.eInvoicing.enabled) {
      moduleBreakdown.eInvoicing = getEInvoicingPrice(modules.eInvoicing.invoices);
    }
    if (modules.ana.enabled) {
      moduleBreakdown.ana = getANAPrice(modules.ana.tailspend);
    }

    const listPrice = Object.values(moduleBreakdown).reduce((sum, price) => sum + price, 0);
    
    const discount = regionRevenueDiscount[region][revenue];
    const afterDiscount = listPrice * (1 - discount);
    const accountBasedPrice = afterDiscount * industryMultipliers[industry];

    let accumulatedWeightage = 0;
    (Object.keys(modules) as ModuleName[]).forEach(moduleName => {
      if (modules[moduleName].enabled && moduleWeightages[moduleName]) {
        accumulatedWeightage += moduleWeightages[moduleName];
      }
    });
    const arrPerBillionPrice = spendBillions * ARR_PER_BILLION * accumulatedWeightage;

    return { 
      moduleBreakdown, 
      listPrice, 
      accountBasedPrice, 
      discount, 
      industryMultiplier: industryMultipliers[industry], 
      arrPerBillionPrice, 
      accumulatedWeightage 
    };
  }, [modules, region, revenue, industry, spendBillions]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, min, max, step }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
      />
    </div>
  );

  const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
      >
        {options.map(opt => (
          <option key={String(opt)} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  const ModuleCard: React.FC<ModuleCardProps> = ({ displayName, enabled, onToggle, children, price }) => (
    <div className={`rounded-xl border transition-all duration-300 ${enabled ? 'bg-slate-800/80 border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'bg-slate-900/50 border-slate-700/50'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggle(!enabled)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all duration-300 ${enabled ? 'left-6' : 'left-0.5'}`} />
            </button>
            <span className="font-semibold text-white">{displayName}</span>
          </div>
          {enabled && price !== undefined && price > 0 && (
            <span className="text-emerald-400 font-mono text-sm">{formatCurrency(price)}</span>
          )}
        </div>
        {enabled && (
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700/50">
            {children}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Zycus SaaS Pricing Calculator
          </h1>
          <p className="text-slate-400">Configure modules and account parameters to calculate pricing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-slate-400 text-sm uppercase tracking-wide">List Price</span>
              </div>
              <div className="text-3xl font-bold font-mono text-white">
                {formatCurrency(prices.listPrice)}
              </div>
              <div className="text-slate-500 text-xs mt-2">Sum of all enabled modules</div>
            </div>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900/50 to-slate-900 border border-emerald-500/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-400 text-sm uppercase tracking-wide">Account Based Price</span>
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-400">
                {formatCurrency(prices.accountBasedPrice)}
              </div>
              <div className="text-slate-500 text-xs mt-2">
                {prices.discount > 0 && <span className="text-amber-400">-{(prices.discount * 100).toFixed(0)}% region</span>}
                {prices.discount > 0 && prices.industryMultiplier !== 1 && <span> • </span>}
                {prices.industryMultiplier !== 1 && <span className="text-cyan-400">{prices.industryMultiplier}x industry</span>}
                {prices.discount === 0 && prices.industryMultiplier === 1 && <span>No adjustments applied</span>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-violet-900/50 to-slate-900 border border-violet-500/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="text-slate-400 text-sm uppercase tracking-wide">ARR per Billion Spend</span>
              </div>
              <div className="text-3xl font-bold font-mono text-violet-400">
                {formatCurrency(prices.arrPerBillionPrice)}
              </div>
              <div className="text-slate-500 text-xs mt-2">
                <span className="text-violet-300">{(prices.accumulatedWeightage * 100).toFixed(0)}%</span> weightage × <span className="text-violet-300">{spendBillions}Bn</span> × $350K
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="text-xl font-semibold">Module Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModuleCard name="iAnalyze" displayName="iAnalyze" enabled={modules.iAnalyze.enabled} onToggle={(v) => updateModule('iAnalyze', 'enabled', v)} price={prices.moduleBreakdown.iAnalyze}>
                <SelectField label="Spend Volume (Mn)" value={modules.iAnalyze.spendMn} onChange={(v) => updateModule('iAnalyze', 'spendMn', Number(v))} options={[250, 500, 750, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000, 15000]} />
                <SelectField label="Refresh Rate" value={modules.iAnalyze.refreshRate} onChange={(v) => updateModule('iAnalyze', 'refreshRate', v as RefreshRate)} options={['Quarterly', 'Monthly', 'Fortnightly', 'Weekly']} />
              </ModuleCard>

              <ModuleCard name="iSource" displayName="iSource" enabled={modules.iSource.enabled} onToggle={(v) => updateModule('iSource', 'enabled', v)} price={prices.moduleBreakdown.iSource}>
                <InputField label="Power Users" value={modules.iSource.powerUsers} onChange={(v) => updateModule('iSource', 'powerUsers', v)} min={5} max={300} />
              </ModuleCard>

              <ModuleCard name="iSupplier" displayName="iSupplier" enabled={modules.iSupplier.enabled} onToggle={(v) => updateModule('iSupplier', 'enabled', v)} price={prices.moduleBreakdown.iSupplier}>
                <InputField label="Power Users" value={modules.iSupplier.powerUsers} onChange={(v) => updateModule('iSupplier', 'powerUsers', v)} min={5} max={300} />
              </ModuleCard>

              <ModuleCard name="iRisk" displayName="iRisk" enabled={modules.iRisk.enabled} onToggle={(v) => updateModule('iRisk', 'enabled', v)} price={prices.moduleBreakdown.iRisk}>
                <InputField label="Power Users" value={modules.iRisk.powerUsers} onChange={(v) => updateModule('iRisk', 'powerUsers', v)} min={5} max={300} />
              </ModuleCard>

              <ModuleCard name="iContract" displayName="iContract" enabled={modules.iContract.enabled} onToggle={(v) => updateModule('iContract', 'enabled', v)} price={prices.moduleBreakdown.iContract}>
                <InputField label="Power Users" value={modules.iContract.powerUsers} onChange={(v) => updateModule('iContract', 'powerUsers', v)} min={5} max={300} />
              </ModuleCard>

              <ModuleCard name="iSave" displayName="iSave" enabled={modules.iSave.enabled} onToggle={(v) => updateModule('iSave', 'enabled', v)} price={prices.moduleBreakdown.iSave}>
                <InputField label="Power Users" value={modules.iSave.powerUsers} onChange={(v) => updateModule('iSave', 'powerUsers', v)} min={10} max={300} />
              </ModuleCard>

              <ModuleCard name="iManage" displayName="iManage" enabled={modules.iManage.enabled} onToggle={(v) => updateModule('iManage', 'enabled', v)} price={prices.moduleBreakdown.iManage}>
                <InputField label="Power Users" value={modules.iManage.powerUsers} onChange={(v) => updateModule('iManage', 'powerUsers', v)} min={10} max={300} />
              </ModuleCard>

              <ModuleCard name="merlinCLM" displayName="Merlin for CLM" enabled={modules.merlinCLM.enabled} onToggle={(v) => updateModule('merlinCLM', 'enabled', v)} price={prices.moduleBreakdown.merlinCLM}>
                <InputField label="Annual Contracts" value={modules.merlinCLM.annualContracts} onChange={(v) => updateModule('merlinCLM', 'annualContracts', v)} min={50} step={50} />
              </ModuleCard>

              <ModuleCard name="merlinRiskRadar" displayName="Merlin Risk Radar" enabled={modules.merlinRiskRadar.enabled} onToggle={(v) => updateModule('merlinRiskRadar', 'enabled', v)} price={prices.moduleBreakdown.merlinRiskRadar}>
                <InputField label="Critical Suppliers" value={modules.merlinRiskRadar.criticalSuppliers} onChange={(v) => updateModule('merlinRiskRadar', 'criticalSuppliers', v)} min={100} step={100} />
              </ModuleCard>

              <ModuleCard name="eProcurement" displayName="eProcurement" enabled={modules.eProcurement.enabled} onToggle={(v) => updateModule('eProcurement', 'enabled', v)} price={prices.moduleBreakdown.eProcurement}>
                <InputField label="Users" value={modules.eProcurement.users} onChange={(v) => updateModule('eProcurement', 'users', v)} min={1} max={30000} />
              </ModuleCard>

              <ModuleCard name="merlinIntake" displayName="Merlin Intake" enabled={modules.merlinIntake.enabled} onToggle={(v) => updateModule('merlinIntake', 'enabled', v)} price={prices.moduleBreakdown.merlinIntake}>
                <InputField label="Users" value={modules.merlinIntake.users} onChange={(v) => updateModule('merlinIntake', 'users', v)} min={1} max={100000} />
              </ModuleCard>

              <ModuleCard name="eInvoicing" displayName="eInvoicing" enabled={modules.eInvoicing.enabled} onToggle={(v) => updateModule('eInvoicing', 'enabled', v)} price={prices.moduleBreakdown.eInvoicing}>
                <InputField label="Annual Invoices" value={modules.eInvoicing.invoices} onChange={(v) => updateModule('eInvoicing', 'invoices', v)} min={1000} step={1000} />
              </ModuleCard>

              <ModuleCard name="ana" displayName="ANA" enabled={modules.ana.enabled} onToggle={(v) => updateModule('ana', 'enabled', v)} price={prices.moduleBreakdown.ana}>
                <InputField label="Tailspend ($)" value={modules.ana.tailspend} onChange={(v) => updateModule('ana', 'tailspend', v)} min={1000000} step={1000000} />
              </ModuleCard>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-bold">2</div>
              <h2 className="text-xl font-semibold">Account Modifiers</h2>
            </div>

            <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  ARR per Billion Spend
                </h3>
                <InputField label="Spend Value (Billions)" value={spendBillions} onChange={setSpendBillions} min={0.1} step={0.1} />
                <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                  <div className="text-xs text-slate-400">Accumulated Weightage</div>
                  <div className="text-lg font-mono text-violet-400">{(prices.accumulatedWeightage * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Region & Revenue
                </h3>
                <div className="space-y-3">
                  <SelectField label="Region" value={region} onChange={(v) => setRegion(v as Region)} options={['USA', 'EU', 'ANZ', 'MEA', 'SEA', 'India']} />
                  <SelectField label="Revenue" value={revenue} onChange={(v) => setRevenue(v as Revenue)} options={['Above $1Bn', 'Below $1Bn']} />
                </div>
                <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                  <div className="text-xs text-slate-400">Discount Applied</div>
                  <div className="text-lg font-mono text-amber-400">{(prices.discount * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Industry
                </h3>
                <SelectField label="Industry" value={industry} onChange={(v) => setIndustry(v as Industry)} options={['Manufacturing', 'Energy / Mining', 'Pharma / Life Sciences', 'Financial Services', 'Public Sector']} />
                <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                  <div className="text-xs text-slate-400">Multiplier Applied</div>
                  <div className="text-lg font-mono text-cyan-400">{prices.industryMultiplier}x</div>
                </div>
              </div>
            </div>

            {Object.keys(prices.moduleBreakdown).length > 0 && (
              <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Module Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(prices.moduleBreakdown).map(([module, price]) => (
                    <div key={module} className="flex justify-between text-sm">
                      <span className="text-slate-400">{module}</span>
                      <span className="font-mono text-slate-200">{formatCurrency(price)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between font-semibold">
                    <span className="text-slate-300">Total List</span>
                    <span className="font-mono text-white">{formatCurrency(prices.listPrice)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}