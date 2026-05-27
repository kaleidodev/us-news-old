import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, User, ChevronDown, ChevronUp, Calculator, Home, Percent, Building2,
  TrendingDown, BadgeCheck, RefreshCw, Award, Info, ArrowRight, HelpCircle,
  Facebook, Twitter, Linkedin, Youtube, MapPin, Menu,
} from "lucide-react";

import heroRates from "@/assets/hero-rates.jpg";
import exploreHero from "@/assets/explore-mortgage-hero.jpg";
import thumb1 from "@/assets/thumb-1.jpg";
import thumb2 from "@/assets/thumb-2.jpg";
import thumb3 from "@/assets/thumb-3.jpg";
import thumb4 from "@/assets/thumb-4.jpg";
import thumb5 from "@/assets/thumb-5.jpg";
import logoSummit from "@/assets/logo-summit.png";
import logoHeartland from "@/assets/logo-heartland.png";
import logoNorthstar from "@/assets/logo-northstar.png";
import logoMariner from "@/assets/logo-mariner.png";
import logoFifth from "@/assets/logo-fifth-avenue.png";
import stateCA from "@/assets/state-ca.jpg";
import stateTX from "@/assets/state-tx.jpg";
import stateFL from "@/assets/state-fl.jpg";
import stateNY from "@/assets/state-ny.jpg";
import statePA from "@/assets/state-pa.jpg";
import stateIL from "@/assets/state-il.jpg";
import refi1 from "@/assets/refi-1.jpg";
import refi2 from "@/assets/refi-2.jpg";
import refi3 from "@/assets/refi-3.jpg";
import refi4 from "@/assets/refi-4.jpg";
import refi5 from "@/assets/refi-5.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Mortgages & Refinancing — Ledgerly" },
      { name: "description", content: "Compare today's mortgage rates, calculate monthly payments, and find top-rated lenders for your home loan or refinance." },
    ],
  }),
});

const NAV = ["Credit Cards", "Mortgage", "Student Loan", "Personal Loan", "Banking", "Investing", "Financial Advisor", "Retirement", "Personal Finance"];

const TILES = [
  { icon: TrendingDown, label: "Today's Mortgage Rates" },
  { icon: RefreshCw, label: "Mortgage Refinance Rates" },
  { icon: Percent, label: "30-Year Mortgage Rates" },
  { icon: Building2, label: "Best Mortgage Lenders" },
  { icon: BadgeCheck, label: "Best Mortgage Refinance Lenders" },
  { icon: Home, label: "First-Time Homebuyer Loans" },
];

const AWARDS = [
  { title: "Summit Mortgage Review", body: "Summit Mortgage, which claims to be one of the nation's fastest-growing digital lenders, is best known for its fully online application and rapid pre-approval workflow…", logo: logoSummit },
  { title: "Heartland Home Lending Review", body: "Heartland Home Lending is best known for its bundled insurance options, having served homebuyers across the Midwest for over four decades…", logo: logoHeartland },
  { title: "NorthStar Funding Mortgage Review", body: "NorthStar Funding is a mortgage lender offering a variety of home loan options to first-time buyers and seasoned homeowners alike…", logo: logoNorthstar },
  { title: "Mariner Credit Union Home Review", body: "Mariner Credit Union serves more than 9 million active-duty and retired members of the armed forces, veterans and their families…", logo: logoMariner },
  { title: "Fifth Avenue Bank Mortgage Review", body: "Based in Albany, New York, Fifth Avenue Bank has nearly 900 branches and $245 billion in assets — making it one of the largest regional…", logo: logoFifth },
];

const STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","Washington, D.C."];

const TOP_STATE_CARDS = [
  { label: "Best California Mortgage Lenders", img: stateCA },
  { label: "Best Texas Mortgage Lenders", img: stateTX },
  { label: "Best Florida Mortgage Lenders", img: stateFL },
  { label: "Best New York Mortgage Lenders", img: stateNY },
  { label: "Best Pennsylvania Mortgage Lenders", img: statePA },
  { label: "Best Illinois Mortgage Lenders", img: stateIL },
];

const REFI_ARTICLES = [
  { title: "How Soon Can You Refinance a Mortgage?", img: refi1 },
  { title: "Can You Refinance With Bad Credit?", img: refi2 },
  { title: "Cash-Out Refinance: How It Works", img: refi3 },
  { title: "When to Refinance Your Mortgage", img: refi4 },
  { title: "No-Closing-Cost Refinance Explained", img: refi5 },
];

const LATEST = [
  { title: "What Is the Family Opportunity Mortgage?", img: thumb1 },
  { title: "How AI Is Changing Mortgages", img: thumb2 },
  { title: "What Is a Loan Prepayment Penalty?", img: thumb3 },
  { title: "First-Time Homebuyers Aren't Doomed.", img: thumb4 },
  { title: "Navigating Mortgage Rate Buydowns", img: thumb5 },
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function Index() {
  const [price, setPrice] = useState(425000);
  const [down, setDown] = useState(85000);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(6.85);
  const [showOptional, setShowOptional] = useState(false);
  const [taxRate, setTaxRate] = useState(1.11); // % of home price / yr
  const [insMonthly, setInsMonthly] = useState(0);
  const [pmiMonthly, setPmiMonthly] = useState(0);
  const [hoaMonthly, setHoaMonthly] = useState(0);

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["loan-basics"]));
  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    function onPrefill(e: Event) {
      const d = (e as CustomEvent).detail as {
        price?: number; downPct?: number; years?: number; rate?: number;
      };
      if (typeof d.price === "number") setPrice(d.price);
      if (typeof d.years === "number") setYears(d.years);
      if (typeof d.rate === "number") setRate(d.rate);
      if (typeof d.downPct === "number") {
        const p = typeof d.price === "number" ? d.price : price;
        setDown(Math.round((d.downPct / 100) * p));
      }
      document.getElementById("mortgage-calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("mortgage-prefill", onPrefill as EventListener);
    return () => window.removeEventListener("mortgage-prefill", onPrefill as EventListener);
  }, [price]);

  const { principal, monthly, interest, taxes, insurance, pmi, hoa, total } = useMemo(() => {
    const p = Math.max(price - down, 0);
    const r = rate / 100 / 12;
    const n = years * 12;
    const m = r === 0 ? p / n : (p * r) / (1 - Math.pow(1 + r, -n));
    const tax = (price * (taxRate / 100)) / 12;
    const ins = insMonthly > 0 ? insMonthly : (price * 0.0035) / 12;
    const pmiVal = pmiMonthly > 0 ? pmiMonthly : (down / price < 0.2 ? (p * 0.0075) / 12 : 0);
    const hoaVal = hoaMonthly;
    return {
      principal: p,
      monthly: m,
      interest: m * 0.62,
      taxes: tax,
      insurance: ins,
      pmi: pmiVal,
      hoa: hoaVal,
      total: m + tax + ins + pmiVal + hoaVal,
    };
  }, [price, down, years, rate, taxRate, insMonthly, pmiMonthly, hoaMonthly]);

  return (
    <div className="min-h-screen bg-white font-serif-body">
      {/* Top dark navigation bar */}
      <div className="bg-[#0a0a0a] text-white">
        <div className="max-w-[1280px] mx-auto px-4 h-[56px] flex items-center gap-5">
          <span className="shrink-0 text-white font-bold text-[15px] tracking-wide">
            U.S. News Money <span className="text-gray-400 font-normal">»</span>
          </span>

          <nav className="flex items-center gap-4 flex-1 min-w-0">
            {NAV.map((n) => (
              <a
                key={n}
                className={`whitespace-nowrap text-[13px] font-semibold text-gray-200 hover:text-white h-[56px] flex items-center transition-colors cursor-pointer ${
                  n === "Mortgage" ? "text-white border-b-[2px] border-[#c8102e]" : ""
                }`}
              >
                {n}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Search size={18} className="cursor-pointer text-gray-300 hover:text-white" />
            <button className="border border-gray-500 rounded-full px-4 py-1 text-[13px] font-semibold text-gray-200 hover:bg-white hover:text-black hover:border-white transition">
              Sign In
            </button>
            <Menu size={20} className="cursor-pointer text-gray-300 hover:text-white" />
          </div>
        </div>
      </div>

      {/* HERO */}
      <header
        className="text-white relative overflow-hidden"
        style={{ background: "linear-gradient(115deg, #1e40af 0%, #2563eb 45%, #7e22ce 75%, #b91c1c 100%)" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 pt-6 pb-10 relative">
          <div className="flex items-start justify-between mb-4">
            <div className="text-[13px]">
              <a className="font-bold hover:underline">Home</a>
              <span className="mx-2 opacity-70">/</span>
              <a className="font-bold hover:underline">Money</a>
              <span className="mx-2 opacity-70">/</span>
              <a className="font-bold hover:underline">Mortgages</a>
            </div>
            <a className="text-[12px] italic opacity-90 hover:underline">Advertiser Disclosure</a>
          </div>

          <h1 className="font-sans text-[44px] leading-tight font-black mb-6">Mortgage and Refinancing</h1>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TILES.map((t) => (
              <a key={t.label} className="bg-white text-gray-900 rounded-md px-5 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
                <span className="w-12 h-12 rounded-full border-2 border-blue-700 text-blue-700 flex items-center justify-center shrink-0"><t.icon size={22} /></span>
                <span className="text-[17px] font-bold leading-tight">{t.label}</span>
              </a>
            ))}
          </div>

          <button className="mt-6 text-[13px] font-bold tracking-wider flex items-center gap-2">
            SHOW ALL MORTGAGE LOANS CATEGORIES <ChevronDown size={16} />
          </button>
        </div>
      </header>


      <main className="max-w-[1180px] mx-auto px-4">
        {/* Why trust us bar */}
        <div className="mt-6 rounded-sm border border-gray-200 bg-white border-t-[3px] border-t-blue-500">
          <div className="px-5 py-4 flex items-start gap-4">
            <div className="shrink-0 mt-0.5">
              <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                <path d="M14 1 L26 5 V15 C26 23 20 29 14 31 C8 29 2 23 2 15 V5 Z" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 15.5 L12.5 20 L20 11.5" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div className="flex-1 text-[13px] text-gray-700 leading-snug">
              <div className="font-bold text-gray-900 text-[15px] mb-0.5">Why Trust U.S. News Money</div>
              Your trust is important to us. To earn it, we conduct a rigorous, unbiased analysis with a transparent methodology, and maintain strict editorial standards and independence.
            </div>
            <button aria-label="Expand" className="shrink-0 text-gray-500 hover:text-gray-800 mt-1">
              <ChevronDown size={20} />
            </button>
          </div>
        </div>


        {/* CALCULATOR — traditional U.S. News style */}
        <section id="mortgage-calculator" className="mt-10">
          <div className="mb-4">
            <div className="w-10 h-0.5 bg-[#c8102e] mb-2" />
            <h2 className="font-serif text-[20px] font-extrabold tracking-wide uppercase text-gray-900">
              Mortgage Calculator
            </h2>
            <p className="text-[13px] text-gray-600 mt-2">
              Use the calculator below to estimate your monthly mortgage payment.
            </p>
          </div>

          <div className="border border-gray-400 bg-white">
            {/* Header bar */}
            <div className="bg-[#11294d] text-white px-4 py-2 text-[13px] font-bold uppercase tracking-wider border-b-2 border-[#c8102e]">
              Monthly Payment Calculator
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Inputs — long traditional form with many fields */}
              <form className="p-4 border-r border-gray-400 bg-[#e8f0f8] text-[12px] text-gray-900">
                {/* Section: Loan Basics — collapsible */}
                <div className="mb-3 border border-gray-400 bg-white">
                  <button type="button" onClick={() => toggleSection("loan-basics")} className="w-full flex items-center justify-between bg-[#c8ddf0] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#11294d] cursor-pointer">
                    <span>1. Loan Basics</span>
                    {openSections.has("loan-basics") ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openSections.has("loan-basics") && (
                    <div className="p-2">
                      <table className="w-full">
                        <tbody>
                          <tr><td className="py-1 pr-2 font-bold">Home Price ($)</td><td className="py-1"><input type="number" value={price} onChange={(e)=>setPrice(+e.target.value||0)} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Down Payment ($)</td><td className="py-1"><input type="number" value={down} onChange={(e)=>setDown(+e.target.value||0)} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Down Payment (%)</td><td className="py-1"><input type="number" defaultValue={20} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Loan Term</td><td className="py-1">
                            <select value={years} onChange={(e)=>setYears(+e.target.value)} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]">
                              {[10,15,20,25,30,40].map((y)=>(<option key={y} value={y}>{y} years (fixed)</option>))}
                            </select>
                          </td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Loan Type</td><td className="py-1">
                            <select className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]">
                              <option>Conventional</option><option>FHA</option><option>VA</option><option>USDA</option><option>Jumbo</option>
                            </select>
                          </td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Interest Rate (%)</td><td className="py-1"><input type="number" step="0.01" value={rate} onChange={(e)=>setRate(+e.target.value||0)} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Start Date</td><td className="py-1">
                            <div className="flex gap-1">
                              <select className="flex-1 border border-gray-500 bg-white h-7 px-1 text-[12px]"><option>May</option><option>Jun</option><option>Jul</option></select>
                              <select className="w-20 border border-gray-500 bg-white h-7 px-1 text-[12px]"><option>2026</option><option>2027</option></select>
                            </div>
                          </td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section: Property — collapsible */}
                <div className="mb-3 border border-gray-400 bg-white">
                  <button type="button" onClick={() => toggleSection("property")} className="w-full flex items-center justify-between bg-[#c8ddf0] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#11294d] cursor-pointer">
                    <span>2. Property Information</span>
                    {openSections.has("property") ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openSections.has("property") && (
                    <div className="p-2">
                      <table className="w-full">
                        <tbody>
                          <tr><td className="py-1 pr-2 font-bold">ZIP Code</td><td className="py-1"><input type="text" defaultValue="10001" className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Property Type</td><td className="py-1">
                            <select className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]">
                              <option>Single Family</option><option>Condo</option><option>Townhouse</option><option>Multi-Family</option>
                            </select>
                          </td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Property Use</td><td className="py-1">
                            <select className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]">
                              <option>Primary Residence</option><option>Secondary Home</option><option>Investment</option>
                            </select>
                          </td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Credit Score</td><td className="py-1">
                            <select className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]">
                              <option>Excellent (740+)</option><option>Good (700-739)</option><option>Fair (640-699)</option><option>Poor (&lt;640)</option>
                            </select>
                          </td></tr>
                          <tr><td className="py-1 pr-2 font-bold">First-time Buyer?</td><td className="py-1">
                            <label className="mr-3"><input type="radio" name="ftb" defaultChecked className="mr-1 align-middle" />Yes</label>
                            <label><input type="radio" name="ftb" className="mr-1 align-middle" />No</label>
                          </td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section: Taxes & Insurance — collapsible */}
                <div className="mb-3 border border-gray-400 bg-white">
                  <button type="button" onClick={() => toggleSection("taxes")} className="w-full flex items-center justify-between bg-[#c8ddf0] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#11294d] cursor-pointer">
                    <span>3. Taxes, Insurance &amp; Fees</span>
                    {openSections.has("taxes") ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openSections.has("taxes") && (
                    <div className="p-2">
                      <table className="w-full">
                        <tbody>
                          <tr><td className="py-1 pr-2 font-bold">Property Taxes ($/yr)</td><td className="py-1"><input type="number" defaultValue={3600} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Home Insurance ($/yr)</td><td className="py-1"><input type="number" defaultValue={1200} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">HOA Fees ($/mo)</td><td className="py-1"><input type="number" defaultValue={0} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">PMI ($/mo)</td><td className="py-1"><input type="number" defaultValue={0} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Include PMI?</td><td className="py-1">
                            <label><input type="checkbox" defaultChecked className="mr-1 align-middle" />Auto-calc when down payment &lt; 20%</label>
                          </td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section: Extra Payments — collapsible */}
                <div className="mb-3 border border-gray-400 bg-white">
                  <button type="button" onClick={() => toggleSection("extra")} className="w-full flex items-center justify-between bg-[#c8ddf0] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#11294d] cursor-pointer">
                    <span>4. Extra Payments (Optional)</span>
                    {openSections.has("extra") ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openSections.has("extra") && (
                    <div className="p-2">
                      <table className="w-full">
                        <tbody>
                          <tr><td className="py-1 pr-2 font-bold">Extra Monthly ($)</td><td className="py-1"><input type="number" defaultValue={0} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">Extra Yearly ($)</td><td className="py-1"><input type="number" defaultValue={0} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                          <tr><td className="py-1 pr-2 font-bold">One-time Payment ($)</td><td className="py-1"><input type="number" defaultValue={0} className="w-full border border-gray-500 bg-white h-7 px-1 text-[12px]" /></td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-400">
                  <button type="button" className="bg-[#c8102e] text-white text-[12px] font-bold uppercase tracking-wider px-4 py-2 border border-[#8a0a1f] hover:bg-[#a00d24]">
                    Calculate
                  </button>
                  <button type="reset" className="bg-gray-300 text-gray-800 text-[12px] font-bold uppercase tracking-wider px-4 py-2 border border-gray-500 hover:bg-gray-400">
                    Reset
                  </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-2 italic leading-tight">
                  * All fields above are required for an accurate estimate. Calculation does not constitute a loan offer.
                </p>
              </form>

              {/* Results table */}
              <div className="p-5">
                <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-300 pb-2">
                  Your Results
                </h3>
                <table className="w-full text-[13px] text-gray-800">
                  <tbody>
                    <tr className="border-b border-gray-200"><td className="py-2">Loan Amount</td><td className="py-2 text-right font-semibold">${fmt(principal)}</td></tr>
                    <tr className="border-b border-gray-200 bg-[#f7f7f7]"><td className="py-2 font-bold">Monthly Payment (P&amp;I)</td><td className="py-2 text-right font-bold text-[#11294d]">${fmt(monthly)}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2">+ Property Taxes</td><td className="py-2 text-right">$300</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2">+ Home Insurance</td><td className="py-2 text-right">$100</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2">+ HOA / PMI</td><td className="py-2 text-right">$0</td></tr>
                    <tr className="border-b border-gray-200 bg-[#fff3d6]"><td className="py-2 font-bold">Total Monthly Payment</td><td className="py-2 text-right font-bold text-[#c8102e]">${fmt(monthly + 400)}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2">Total Interest Paid</td><td className="py-2 text-right font-semibold">${fmt(monthly * years * 12 - principal)}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-2">Total Cost of Loan</td><td className="py-2 text-right font-semibold">${fmt(monthly * years * 12)}</td></tr>
                    <tr><td className="py-2">Loan Payoff Date</td><td className="py-2 text-right font-semibold">May {2026 + years}</td></tr>
                  </tbody>
                </table>
                <p className="text-[11px] text-gray-500 mt-3 italic">
                  Estimates are for illustrative purposes only and do not include taxes, insurance, or PMI unless specified above.
                </p>
                <a className="block mt-3 text-[12px] font-bold text-[#11294d] underline hover:text-[#c8102e] cursor-pointer">
                  See Today's Mortgage Rates &raquo;
                </a>
              </div>
            </div>
          </div>
        </section>




        {/* AWARDS */}
        <section className="mt-12">
          <div className="mb-4">
            <div className="w-10 h-0.5 bg-red-600 mb-2" />
            <h2 className="font-serif text-[20px] font-extrabold tracking-wide uppercase">Annual Mortgage Loan Award Winners</h2>
            <p className="text-[13px] text-gray-700 mt-3 mb-5">Ledgerly's loans experts reviewed and rated mortgage lending companies to make it easy for you to pick the best mortgage lender for your needs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {AWARDS.map((a) => (
              <AwardCard key={a.title} {...a} />
            ))}
          </div>
          <a className="inline-block mt-6 text-[12px] font-bold text-blue-700 tracking-wider">SEE ALL MORTGAGE REVIEWS &raquo;</a>
        </section>

        {/* TOP LENDERS BY STATE — gray panel */}
        <section className="mt-10 bg-gray-100 border border-gray-200 rounded-sm p-6">
          <h3 className="font-serif text-[16px] font-bold mb-4">Top Lenders by State</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {TOP_STATE_CARDS.map((s) => (
              <a key={s.label} className="flex items-center gap-3 bg-white border border-gray-200 rounded-sm p-3 hover:shadow-sm cursor-pointer">
                <img src={s.img} alt={s.label} loading="lazy" width={72} height={48} className="w-[72px] h-12 object-cover rounded-sm shrink-0" />
                <span className="text-[13px] font-semibold text-blue-800">{s.label} &rsaquo;</span>
              </a>
            ))}
          </div>
        </section>

        {/* STATE DIRECTORY */}
        <section id="compare-rates" className="mt-10">
          <div className="rounded-sm border border-gray-200 bg-white border-t-[3px] border-t-blue-500 px-6 py-6">
            <h2 className="font-sans text-[22px] font-extrabold text-gray-900 mb-5">State Loans Rate Pages</h2>
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-[14px] text-gray-800"
              style={{ gridAutoFlow: "row" }}
            >
              {[
                "Alabama","Alaska","Arizona","Arkansas",
                "California","Colorado","Connecticut","Delaware",
                "Florida","Georgia","Hawaii","Idaho",
                "Illinois","Indiana","Iowa","Kansas",
                "Kentucky","Louisiana","Maine","Maryland",
                "Massachusetts","Michigan","Minnesota","Mississippi",
                "Missouri","Montana","Nebraska","Nevada",
                "New Hampshire","New Jersey","New Mexico","New York",
                "North Carolina","North Dakota","Ohio","Oklahoma",
                "Oregon","Pennsylvania","Rhode Island","South Carolina",
                "South Dakota","Tennessee","Texas","Utah",
                "Vermont","Virginia","Washington","Washington D.C.",
                "West Virginia","Wisconsin","Wyoming",
              ].map((s) => (
                <a key={s} className="hover:text-blue-700 hover:underline cursor-pointer">{s}</a>
              ))}
            </div>
          </div>
          <a className="inline-block mt-4 text-[14px] text-blue-700 hover:underline cursor-pointer">See all State Rates Pages</a>
        </section>


        {/* FAQ / Editorial body */}
        <section className="mt-12 max-w-[820px]">
          
          {[
            { q: "What Is a Mortgage?", a: "A mortgage is a long-term loan used by buyers to finance a home or other real estate. The lender holds a claim on the property until the loan is repaid in full. Mortgages come in many shapes, sizes, and rate structures — choosing the right one depends on your finances, timeline, and how long you plan to stay in the home." },
            { q: "What Is a Good Interest Rate?", a: "Mortgage rates fluctuate constantly. A favorable rate is one that beats the average rates offered by other lenders to borrowers with similar credit profiles, loan amounts, and down payments. Compare offers from at least three lenders before committing." },
            { q: "What Impacts Average Mortgage Rates?", a: "Several factors influence mortgage rates, including the Federal Reserve's benchmark rate, inflation, the performance of mortgage-backed securities, and broader bond-market activity. Lender competition and the borrower's own credit profile, down payment, and loan term play a meaningful role as well." },
            { q: "What Are the Different Types of Mortgages?", a: "There are several common categories of mortgage loans, each with its own qualification rules and rate structure." },
            { q: "What Does It Mean to Refinance a Mortgage?", a: "Refinancing replaces your existing mortgage with a new one, often to secure a lower interest rate, shorten the term, switch from an adjustable to a fixed rate, or pull cash from the equity you've built." },
            { q: "Should I Get Preapproved?", a: "Preapproval signals to sellers that a lender has reviewed your finances and is prepared to back a loan up to a stated amount. It strengthens offers in competitive markets and clarifies your real budget before you shop." },
            { q: "How Do I Find a Mortgage Lender?", a: "Begin with the bank or credit union you already use, then compare quotes from at least two additional lenders. Look at the full picture: interest rate, lender fees, closing costs, customer service, and ease of the digital application." },
          ].map((f) => (
            <div key={f.q} className="mt-6">
              <h3 className="font-serif text-[20px] font-bold text-gray-900 mb-2">{f.q}</h3>
              <p className="text-[14px] text-gray-700 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </section>

        {/* REFI ARTICLES — gray panel */}
        <section className="mt-12 bg-gray-100 border border-gray-200 rounded-sm p-6">
          <h3 className="font-serif text-[16px] font-bold mb-4">Mortgage Refinancing</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {REFI_ARTICLES.map((a) => (
              <a key={a.title} className="flex items-center gap-3 bg-white border border-gray-200 rounded-sm p-3 hover:shadow-sm">
                <img src={a.img} alt="" loading="lazy" className="w-14 h-10 rounded-sm object-cover shrink-0" />
                <span className="text-[13px] font-semibold text-blue-800">{a.title} &rsaquo;</span>
              </a>
            ))}
          </div>
        </section>

        {/* EXPLORE / LATEST */}
        <section className="mt-12 mb-12">
          <div className="mb-5">
            <div className="w-10 h-0.5 bg-red-600 mb-2" />
            <h2 className="font-serif text-[20px] font-extrabold tracking-wide uppercase">Explore All Mortgage Advice</h2>
          </div>
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-10">
            {/* Featured card */}
            <div>
              <article className="group rounded-sm overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={exploreHero}
                    alt="Today's mortgage rates"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {/* gradient scrim for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  {/* tag */}
                  <div className="absolute top-4 left-4 inline-flex items-center">
                    <span className="bg-white/95 backdrop-blur text-[10px] font-bold tracking-[0.18em] text-[#0a2a5e] px-2.5 py-1 border-l-[3px] border-red-600 uppercase">
                      U.S. News Money
                    </span>
                  </div>
                  {/* headline + meta */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-white text-[28px] leading-[1.15] font-bold drop-shadow-sm max-w-[90%]">
                      Today's Mortgage Rates: May 26, 2026
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-white/90 text-[11px] tracking-wide">
                      <span className="uppercase">By <span className="font-bold">Erin Hollister</span></span>
                      <span className="w-1 h-1 rounded-full bg-white/60" />
                      <span>May 26, 2026</span>
                      <span className="w-1 h-1 rounded-full bg-white/60" />
                      <span>6 min read</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5 border-t border-gray-100">
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    The average interest rate on a 30-year fixed purchase mortgage is <span className="font-bold text-gray-900">6.683%</span> on May 26, 2026, just as the spring homebuying season shifts into high gear.
                  </p>
                  <a className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-blue-700 hover:text-blue-900 tracking-wider uppercase">
                    Read full report <span aria-hidden>›</span>
                  </a>
                </div>
              </article>
              <a className="inline-block mt-5 text-[12px] font-bold text-blue-700 tracking-wider hover:text-blue-900">SEE ALL MORTGAGE ADVICE &raquo;</a>
            </div>

            {/* Latest updates */}
            <div>
              <h4 className="font-serif text-[20px] font-bold mb-5 text-gray-900">Latest Updates</h4>
              <div className="space-y-5">
                {LATEST.map((l) => (
                  <a key={l.title} className="flex gap-4 group items-start">
                    <img src={l.img} alt="" loading="lazy" className="w-16 h-16 object-cover rounded-sm shrink-0" />
                    <div className="text-[14px] font-bold text-gray-900 group-hover:text-blue-700 leading-snug pt-1">{l.title}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* DARK FOOTER */}
      <footer className="bg-[#0e1a2b] text-gray-300">
        <div className="max-w-[1180px] mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-[12px]">
          {[
            { h: "Credit Cards", links: ["Best Credit Cards","Best Travel Cards","Best Cash-Back Cards","Best Balance Transfer","Best 0% APR Cards"] },
            { h: "Personal Loans", links: ["Best Personal Loans","Bad Credit Loans","Debt Consolidation","Home Improvement","Wedding Loans"] },
            { h: "Banking", links: ["Best Savings Accounts","Best Checking Accounts","Best CD Rates","Best Money Market","Online Banks"] },
            { h: "Mortgages", links: ["Today's Rates","Refinance Rates","Mortgage Calculator","First-Time Buyers","FHA Loans"] },
            { h: "Investing", links: ["Best Brokers","Best Robo-Advisors","Best IRA Accounts","Best 401(k) Plans","ETF Guides"] },
            { h: "Insurance", links: ["Auto Insurance","Life Insurance","Home Insurance","Renters Insurance","Pet Insurance"] },
            { h: "Retirement", links: ["Retirement Planning","Social Security","Annuities","401(k) Guides","IRA Basics"] },
            { h: "Personal Finance", links: ["Budgeting","Saving","Debt Management","Tax Guides","Financial Planning"] },
          ].map((c) => (
            <div key={c.h}>
              <div className="text-white font-bold tracking-wider text-[11px] mb-3">{c.h.toUpperCase()}</div>
              <ul className="space-y-1.5">
                {c.links.map((l) => <li key={l}><a className="hover:text-white">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-[1180px] mx-auto px-4 py-4 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">U.S. News Money</span>
              <span>© 2026 U.S. News Money. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Facebook size={14} /><Twitter size={14} /><Linkedin size={14} /><Youtube size={14} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="More info"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="text-gray-400 hover:text-gray-600"
      >
        <HelpCircle size={13} strokeWidth={2} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 w-[260px] bg-white border border-gray-200 border-l-[3px] border-l-red-500 rounded-sm shadow-[0_6px_20px_rgba(0,0,0,0.14)] px-3 py-2 text-[12px] font-normal text-gray-800 leading-snug normal-case tracking-normal"
        >
          {text}
        </span>
      )}
    </span>
  );
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 mb-1">
        <span>{label}</span>
        {tip && <Tip text={tip} />}
      </label>
      {children}
    </div>
  );
}

function Stat({ label, v, tip }: { label: string; v: string; tip?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-gray-500 text-[13px]">
        <span>{label}</span>
        {tip && <Tip text={tip} />}
      </div>
      <div className="text-[14px] font-bold text-gray-900 mt-0.5">{v}</div>
    </div>
  );
}

function AwardCard({ title, body, logo }: { title: string; body: string; logo: string }) {
  return (
    <div className="border border-gray-200 rounded-md p-5 bg-white flex flex-col">
      <div className="flex gap-4 flex-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-sans text-[15px] font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-[13px] text-gray-700 leading-relaxed">{body}</p>
        </div>
        <div className="w-[120px] shrink-0 flex items-center justify-center">
          <img src={logo} alt={title} loading="lazy" width={120} height={120} className="max-h-[110px] w-auto object-contain" />
        </div>
      </div>
      <a className="mt-4 text-[12px] font-bold text-blue-700 tracking-wider">READ MORE &raquo;</a>
    </div>
  );
}

function CalcTabs({ total, monthly, taxes, insurance, principal, rate, years }: {
  total: number; monthly: number; taxes: number; insurance: number; principal: number; rate: number; years: number;
}) {
  const [tab, setTab] = useState<"breakdown" | "amort" | "schedule">("breakdown");

  // Yearly amortization schedule
  const schedule = useMemo(() => {
    const r = rate / 100 / 12;
    let bal = principal;
    const rows: { year: number; principal: number; interest: number; balance: number; cumP: number; cumI: number }[] = [];
    let cumP = 0, cumI = 0;
    for (let y = 0; y < years; y++) {
      let pY = 0, iY = 0;
      for (let m = 0; m < 12; m++) {
        const i = bal * r;
        const p = monthly - i;
        bal = Math.max(bal - p, 0);
        pY += p; iY += i;
      }
      cumP += pY; cumI += iY;
      rows.push({ year: 2026 + y, principal: pY, interest: iY, balance: bal, cumP, cumI });
    }
    return rows;
  }, [principal, rate, years, monthly]);

  const tabs = [
    { id: "breakdown", label: "Payment Breakdown" },
    { id: "amort", label: "Amortization" },
    { id: "schedule", label: "Schedule" },
  ] as const;

  return (
    <div>
      <div className="flex">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-[13px] border border-gray-200 ${active
                ? "bg-white text-gray-900 font-semibold border-b-white border-t-2 border-t-red-600"
                : "bg-gray-100 text-gray-600 border-b-gray-200"}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="border-l border-r border-b border-gray-200 px-6 py-6 -mt-px">
        {tab === "breakdown" && <BreakdownView total={total} monthly={monthly} taxes={taxes} insurance={insurance} />}
        {tab === "amort" && <AmortView schedule={schedule} />}
        {tab === "schedule" && <ScheduleView schedule={schedule} />}
      </div>
    </div>
  );
}

function BreakdownView({ total, monthly, taxes, insurance }: { total: number; monthly: number; taxes: number; insurance: number }) {
  const segs = [
    { label: "Principal & Interest", val: monthly, color: "#22c55e", tip: "The portion of your monthly payment that goes toward repaying the loan balance and the interest charged by the lender." },
    { label: "Property Tax", val: taxes, color: "#15803d", tip: "Local taxes assessed by your city or county on the value of the property. Often collected monthly through an escrow account." },
    { label: "Homeowner's Insurance", val: insurance, color: "#052e16", tip: "Insurance that protects your home and belongings from damage or loss. Lenders typically require it for the life of the loan." },
    { label: "PMI", val: 0, color: "#bfdbfe", tip: "Private Mortgage Insurance is typically required when your down payment is less than 20%. It protects the lender if you stop making payments." },
    { label: "HOA", val: 0, color: "#2563eb", tip: "Monthly Homeowners Association fees, if your property is part of an HOA. These cover shared amenities and community maintenance." },
  ];
  const sum = segs.reduce((a, b) => a + b.val, 0) || 1;
  const C = 2 * Math.PI * 110;
  let acc = 0;
  return (
    <div>
      <div className="flex items-center gap-1 text-[18px] text-gray-900 mb-4">
        <span>Monthly Payment Breakdown</span>
        <Tip text="A breakdown of every component included in your estimated monthly housing payment." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
        <div className="relative w-[260px] h-[260px] mx-auto">
          <svg viewBox="0 0 260 260" className="w-full h-full -rotate-90">
            <circle cx="130" cy="130" r="110" fill="none" stroke="#e5e7eb" strokeWidth="18" />
            {segs.map((s) => {
              const len = (s.val / sum) * C;
              const el = (
                <circle key={s.label} cx="130" cy="130" r="110" fill="none" stroke={s.color} strokeWidth="18" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} />
              );
              acc += len;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-serif text-[34px] font-bold text-gray-900">${fmtFn(total)}</div>
            <div className="flex items-center gap-1 text-[13px] text-gray-600 mt-1">
              <span>Monthly Payment</span>
              <Tip text="Your total estimated monthly housing payment, including principal, interest, taxes and insurance." />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {segs.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-[13px] text-gray-800">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span>{s.label}</span>
                <Tip text={s.tip} />
              </div>
              <span className="font-semibold">${fmtFn(s.val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AmortView({ schedule }: { schedule: { year: number; cumP: number; cumI: number; balance: number }[] }) {
  const W = 500, H = 320, PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 30;
  const maxVal = Math.max(...schedule.map((r) => Math.max(r.cumP, r.cumI, r.balance)));
  const xs = (i: number) => PAD_L + (i / (schedule.length - 1)) * (W - PAD_L - PAD_R);
  const ys = (v: number) => PAD_T + (1 - v / maxVal) * (H - PAD_T - PAD_B);
  const path = (key: "cumP" | "cumI" | "balance") =>
    schedule.map((r, i) => `${i === 0 ? "M" : "L"} ${xs(i)} ${ys(r[key])}`).join(" ");
  const ticks = 5;
  return (
    <div>
      <div className="text-[18px] text-gray-900 mb-3">Amortization</div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {Array.from({ length: ticks + 1 }).map((_, i) => {
            const y = PAD_T + (i / ticks) * (H - PAD_T - PAD_B);
            const val = maxVal * (1 - i / ticks);
            return (
              <g key={i}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#e5e7eb" />
                <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#6b7280">${Math.round(val / 1000)}K</text>
              </g>
            );
          })}
          {[0, Math.floor(schedule.length / 3), Math.floor((2 * schedule.length) / 3), schedule.length - 1].map((i) => (
            <text key={i} x={xs(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#6b7280">{schedule[i]?.year}</text>
          ))}
          <path d={path("cumP")} fill="none" stroke="#1e3a8a" strokeWidth="2.5" />
          <path d={path("cumI")} fill="none" stroke="#22c55e" strokeWidth="2.5" />
          <path d={path("balance")} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        </svg>
        <div className="text-[13px]">
          <div className="font-semibold text-gray-900 mb-2">May {schedule[0]?.year}</div>
          {[
            { label: "Principal Paid", color: "#1e3a8a" },
            { label: "Interest Paid", color: "#22c55e" },
            { label: "Loan Balance", color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 mb-1.5 text-gray-800">
              <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleView({ schedule }: { schedule: { year: number; principal: number; interest: number; balance: number }[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[18px] text-gray-900">Schedule</div>
        <a className="text-[13px] text-blue-700 font-semibold">Export as CSV</a>
      </div>
      <div className="border-t border-gray-200">
        <div className="grid grid-cols-4 text-[11px] font-bold tracking-wider text-gray-900 py-3 border-b border-gray-200">
          <span>YEAR</span><span>PRINCIPAL</span><span>INTEREST</span><span>BALANCE</span>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {schedule.map((r) => (
            <div key={r.year} className="grid grid-cols-4 text-[13px] py-3 border-b border-gray-100 text-gray-700">
              <a className="text-blue-700 font-semibold">{r.year} +</a>
              <span>${r.principal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span>${r.interest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span>${r.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function fmtFn(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
