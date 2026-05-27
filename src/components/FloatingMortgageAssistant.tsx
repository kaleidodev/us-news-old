import { useEffect, useRef, useState } from "react";
import { ArrowUp, Minus, Maximize2, X, CornerDownRight, Sparkles, Zap, RotateCcw } from "lucide-react";

const STORAGE_KEY = "ledgerly:assistant-state:v1";

type Msg =
  | { role: "user"; text: string }
  | { role: "ai"; text: string; options?: string[]; onPick?: (v: string) => void }
  | { role: "summary"; data: SummaryData }
  | { role: "rates" }
  | { role: "offers" };

type SummaryData = {
  price: number;
  downPct: number;
  years: number;
  rate: number;
  low: number;
  high: number;
};

type Answers = {
  goal?: string;
  location?: string;
  price?: number;
  downPct?: number;
  years?: number;
  comfort?: string;
};

const STEPS = [
  {
    key: "goal",
    text: "Hi — I can help you estimate your mortgage payment in about 30 seconds. What are you trying to figure out?",
    options: ["Monthly payment", "How much home I can afford", "Refinance estimate", "I'm just exploring"],
  },
  {
    key: "location",
    text: "Where are you looking to buy or refinance? (ZIP code or state)",
    free: true,
  },
  {
    key: "price",
    text: "Do you already have a home price in mind?",
    options: ["Around $350,000", "Around $550,000", "Around $750,000", "No, help me estimate"],
  },
  {
    key: "downPct",
    text: "About how much would you put down?",
    options: ["3–5%", "10%", "20%", "Not sure"],
  },
  {
    key: "years",
    text: "What loan term should we use?",
    options: ["30 years", "15 years", "Not sure"],
  },
  {
    key: "comfort",
    text: "What monthly payment would feel comfortable?",
    options: ["Under $2,000", "$2,000–$3,000", "$3,000–$4,000", "$4,000+", "Not sure"],
  },
] as const;

function parsePrice(s: string, comfort?: string): number {
  const m = s.match(/\$?([\d,]+)/);
  if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  if (s.toLowerCase().includes("estimate")) {
    if (comfort?.includes("Under")) return 300000;
    if (comfort?.includes("2,000–$3,000")) return 425000;
    if (comfort?.includes("3,000–$4,000")) return 550000;
    if (comfort?.includes("4,000+")) return 750000;
    return 425000;
  }
  return 425000;
}
function parseDown(s: string): number {
  if (s.includes("3–5")) return 5;
  if (s.startsWith("10")) return 10;
  if (s.startsWith("20")) return 20;
  return 10;
}
function parseYears(s: string): number {
  if (s.startsWith("15")) return 15;
  return 30;
}
const TODAY_RATES = [
  { term: "30-Year Fixed", rate: 6.85, change: "+0.02" },
  { term: "15-Year Fixed", rate: 6.02, change: "-0.01" },
  { term: "5/1 ARM", rate: 6.41, change: "+0.04" },
  { term: "30-Year FHA", rate: 6.55, change: "+0.01" },
  { term: "30-Year VA", rate: 6.48, change: "0.00" },
];

const ADVERTISERS = [
  {
    name: "Rocket Mortgage",
    tag: "Today's Special",
    rate: "6.49%",
    apr: "6.72% APR",
    highlight: "$500 closing cost credit",
    note: "30-Yr Fixed · NMLS #3030",
    url: "https://www.rocketmortgage.com/",
    logo: "https://www.google.com/s2/favicons?domain=rocketmortgage.com&sz=128",
  },
  {
    name: "Better.com",
    tag: "Sponsored",
    rate: "6.55%",
    apr: "6.78% APR",
    highlight: "No lender fees · 3-min pre-approval",
    note: "30-Yr Fixed · NMLS #330511",
    url: "https://better.com/",
    logo: "https://www.google.com/s2/favicons?domain=better.com&sz=128",
  },
  {
    name: "Chase Home Lending",
    tag: "Featured",
    rate: "6.62%",
    apr: "6.84% APR",
    highlight: "Up to $5,000 grant for eligible buyers",
    note: "30-Yr Fixed · NMLS #399798",
    url: "https://www.chase.com/personal/mortgage",
    logo: "https://www.google.com/s2/favicons?domain=chase.com&sz=128",
  },
];

function SummaryActions({
  data,
  onCompareRates,
}: {
  data: SummaryData;
  onCompareRates: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    try {
      const key = "ledgerly:saved-estimates";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push({ ...data, savedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <button
        onClick={() =>
          document
            .getElementById("mortgage-calculator")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        className="text-[12px] font-semibold border border-blue-600 text-blue-700 rounded-full px-3 py-1 hover:bg-blue-50"
      >
        Adjust assumptions
      </button>
      <button
        onClick={onCompareRates}
        className="text-[12px] font-semibold bg-blue-600 text-white rounded-full px-3 py-1 hover:bg-blue-700"
      >
        Compare rates
      </button>
      <button
        onClick={handleSave}
        className="text-[12px] font-semibold border border-gray-300 text-gray-700 rounded-full px-3 py-1 hover:bg-gray-50"
      >
        {saved ? "✓ Saved" : "Save estimate"}
      </button>
    </div>
  );
}



export default function FloatingMortgageAssistant() {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [typing, setTyping] = useState(false);
  const [hintOpen, setHintOpen] = useState(true);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const PANEL_W = 450;
  const PANEL_H = 540;
  const BAR_W = 380;
  const BAR_H = 56;

  // Restore previous conversation on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.messages)) setMessages(s.messages);
        if (typeof s.step === "number") setStep(s.step);
        if (s.answers) setAnswers(s.answers);
        if (typeof s.done === "boolean") setDone(s.done);
        if (s.messages?.length) setHintDismissed(true);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist conversation (strip non-serializable onPick handlers)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const safeMessages = messages.map((m) =>
        m.role === "ai" && m.onPick ? { ...m, onPick: undefined } : m,
      );
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages: safeMessages, step, answers, done }),
      );
    } catch {}
  }, [messages, step, answers, done, hydrated]);

  useEffect(() => {
    if (expanded && !pos) {
      setPos({
        x: Math.max(8, (window.innerWidth - PANEL_W) / 2),
        y: Math.max(8, (window.innerHeight - PANEL_H) / 2),
      });
    }
  }, [expanded, pos]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function pushAiStep(stepIdx: number, base: Msg[]) {
    setTyping(true);
    setMessages(base);
    setTimeout(() => {
      const s = STEPS[stepIdx];
      setMessages([
        ...base,
        { role: "ai", text: s.text, options: "options" in s ? [...s.options] : undefined },
      ]);
      setTyping(false);
    }, 550);
  }

  function openAssistant(initialText?: string) {
    setExpanded(true);
    setHintDismissed(true);
    setHintOpen(false);
    // Resume existing conversation if present
    if (messages.length > 0 && !initialText) return;
    if (initialText && initialText.trim()) {
      setMessages((prev) => [...prev, { role: "user", text: initialText.trim() }]);
      return;
    }
    setStep(0);
    setAnswers({});
    setDone(false);
    pushAiStep(0, []);
  }

  function minimize() {
    setExpanded(false);
  }

  function skipAll() {
    const smart: Answers = {
      goal: "Monthly payment",
      location: "—",
      price: 425000,
      downPct: 10,
      years: 30,
      comfort: "$2,000–$3,000",
    };
    setAnswers(smart);
    const summary = buildSummary(smart);
    applyPrefill(summary);
    setDone(true);
    setMessages((m) => [
      ...m,
      { role: "user", text: "Use smart defaults" },
      {
        role: "ai",
        text: "Done — I used typical assumptions and pre-filled the calculator below. Adjust anything you like.",
      },
      { role: "summary", data: summary },
    ]);
  }

  function buildSummary(a: Answers): SummaryData {
    const price = a.price ?? 425000;
    const downPct = a.downPct ?? 10;
    const years = a.years ?? 30;
    const rate = 6.7;
    const principal = price * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    const pi = (principal * r) / (1 - Math.pow(1 + r, -n));
    const tax = (price * 0.0125) / 12;
    const ins = (price * 0.0035) / 12;
    const pmi = downPct < 20 ? (principal * 0.0075) / 12 : 0;
    const total = pi + tax + ins + pmi;
    return {
      price,
      downPct,
      years,
      rate,
      low: Math.round(total * 0.95 / 50) * 50,
      high: Math.round(total * 1.08 / 50) * 50,
    };
  }

  function applyPrefill(s: SummaryData) {
    window.dispatchEvent(
      new CustomEvent("mortgage-prefill", {
        detail: { price: s.price, downPct: s.downPct, years: s.years, rate: s.rate },
      }),
    );
  }

  function advance(answerText: string, currentStep: number, prevAnswers: Answers) {
    const key = STEPS[currentStep].key;
    const next: Answers = { ...prevAnswers };
    if (key === "goal") next.goal = answerText;
    else if (key === "location") next.location = answerText;
    else if (key === "price") next.price = parsePrice(answerText, prevAnswers.comfort);
    else if (key === "downPct") next.downPct = parseDown(answerText);
    else if (key === "years") next.years = parseYears(answerText);
    else if (key === "comfort") {
      next.comfort = answerText;
      if (!next.price || next.price === 425000) next.price = parsePrice("estimate", answerText);
    }
    setAnswers(next);

    setMessages((m) => {
      const withUser: Msg[] = [...m, { role: "user", text: answerText }];
      const nextStep = currentStep + 1;
      if (nextStep >= STEPS.length) {
        const summary = buildSummary(next);
        applyPrefill(summary);
        setDone(true);
        return [
          ...withUser,
          {
            role: "ai",
            text: "Great — I used your answers to pre-fill the calculator below. You can review and edit anything before calculating.",
          },
          { role: "summary", data: summary },
        ];
      }
      setStep(nextStep);
      pushAiStep(nextStep, withUser);
      return withUser;
    });
  }

  function submit() {
    const t = input.trim();
    if (!t) return;
    setInput("");
    if (!expanded) {
      openAssistant(t);
      return;
    }
    if (done) {
      setMessages((m) => [
        ...m,
        { role: "user", text: t },
        {
          role: "ai",
          text:
            "You can adjust the calculator fields directly, or tap an action below to keep going.",
        },
      ]);
      return;
    }
    advance(t, step, answers);
  }

  function pick(opt: string, msg?: Msg) {
    if (msg && msg.role === "ai" && msg.onPick) {
      msg.onPick(opt);
      return;
    }
    if (done) return;
    advance(opt, step, answers);
  }

  function reset() {
    setMessages([]);
    setInput("");
    setStep(0);
    setAnswers({});
    setDone(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    pushAiStep(0, []);
  }

  function closePanel() {
    // Close = minimize; keep conversation so user can resume
    setExpanded(false);
  }

  // dragging
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragRef.current) return;
      const x = Math.min(Math.max(8, e.clientX - dragRef.current.dx), window.innerWidth - PANEL_W - 8);
      const y = Math.min(Math.max(8, e.clientY - dragRef.current.dy), window.innerHeight - PANEL_H - 8);
      setPos({ x, y });
    }
    function onUp() {
      dragRef.current = null;
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function startDrag(e: React.MouseEvent) {
    if (!panelRef.current) return;
    const r = panelRef.current.getBoundingClientRect();
    dragRef.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    document.body.style.userSelect = "none";
  }

  // Collapsed
  if (!expanded) {
    const active = focused || input.length > 0;
    return (
      <div className="fixed left-1/2 -translate-x-1/2 z-[9999]" style={{ bottom: 24, width: BAR_W }}>
        {/* Attention hint */}
        {hintOpen && !hintDismissed && (
          <div
            className="relative mb-3 mx-auto bg-[#0a2a5e] text-white rounded-lg shadow-[0_10px_28px_rgba(0,0,0,0.25)] px-4 py-3 pr-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            <div className="flex items-start gap-2.5">
              <Sparkles size={18} className="text-yellow-300 shrink-0 mt-0.5" />
              <div className="text-[13px] leading-snug">
                <div className="font-bold mb-0.5">Try our Smart Mortgage Calculator</div>
                <div className="text-[12px] text-blue-100">
                  Answer a few quick questions and AI will pre-fill the calculator for you.
                </div>
                <button
                  onClick={() => {
                    setHintDismissed(true);
                    openAssistant();
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold bg-white text-[#0a2a5e] rounded-full px-3 py-1 hover:bg-blue-50"
                >
                  <Zap size={12} /> Start in 30 seconds
                </button>
              </div>
            </div>
            <button
              onClick={() => setHintDismissed(true)}
              aria-label="Dismiss"
              className="absolute top-1.5 right-1.5 text-blue-200 hover:text-white"
            >
              <X size={14} />
            </button>
            {/* arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0a2a5e] rotate-45" />
          </div>
        )}

        <div
          className={`flex items-center bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-colors ${
            active ? "border-2 border-blue-600" : "border border-gray-300"
          } ${hintOpen && !hintDismissed ? "ring-4 ring-blue-200/60" : ""}`}
          style={{ height: BAR_H, paddingLeft: 20, paddingRight: 6, fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          <Sparkles size={16} className="text-blue-600 shrink-0 mr-2" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => { setFocused(true); setHintDismissed(true); }}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={messages.length > 0 ? "Resume your chat or ask anything…" : "Ask AI — try our Smart Calculator"}
            className="flex-1 bg-transparent outline-none text-[15px] text-gray-800 placeholder-gray-500"
          />
          {messages.length > 0 && !input && (
            <button
              onClick={() => openAssistant()}
              className="mr-1 text-[12px] font-semibold text-blue-700 hover:text-blue-900 px-2 py-1 rounded-full hover:bg-blue-50 whitespace-nowrap"
              title="Resume previous chat"
            >
              Resume
            </button>
          )}
          <button
            onClick={submit}
            aria-label="Send"
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              active ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }


  // Expanded
  return (
    <div
      ref={panelRef}
      className="fixed z-[9999] bg-white rounded-md shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-gray-200 flex flex-col overflow-hidden"
      style={{
        width: PANEL_W,
        height: PANEL_H,
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 bg-[#e8f1fb] cursor-grab active:cursor-grabbing select-none"
        style={{ height: 48 }}
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-2 leading-none">
          <Sparkles size={16} className="text-blue-700" />
          <span className="font-serif text-[#0a2a5e] font-black text-[16px]">
            U.S. News Money <span className="font-semibold text-blue-700">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <button onClick={reset} aria-label="New chat" title="Start a new chat" className="hover:text-black">
            <RotateCcw size={15} />
          </button>
          <button onClick={minimize} aria-label="Minimize" title="Minimize" className="hover:text-black">
            <Minus size={18} />
          </button>
          <button onClick={closePanel} aria-label="Close" title="Close (keeps history)" className="hover:text-black">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => {
          if (m.role === "user") {
            return (
              <div
                key={i}
                className="border border-blue-300 bg-[#eaf3fc] rounded-md px-3 py-2 flex items-center gap-2 text-[14px] text-gray-900"
              >
                <CornerDownRight size={14} className="text-gray-500 shrink-0" />
                <span>{m.text}</span>
              </div>
            );
          }
          if (m.role === "summary") {
            const s = m.data;
            return (
              <div key={i} className="border border-gray-200 rounded-md p-3 bg-gray-50 text-[13px] text-gray-800 space-y-2">
                <div className="font-bold text-gray-900 text-[14px]">
                  Estimated monthly payment: ${s.low.toLocaleString()}–${s.high.toLocaleString()}
                </div>
                <div className="text-[12px] text-gray-700 leading-relaxed">
                  This assumes:
                  <ul className="list-disc ml-5 mt-1 space-y-0.5">
                    <li>Home price: ${s.price.toLocaleString()}</li>
                    <li>Down payment: {s.downPct}%</li>
                    <li>Loan term: {s.years} years</li>
                    <li>Mortgage rate: {s.rate}%</li>
                    <li>Property taxes &amp; insurance included as estimates</li>
                    {s.downPct < 20 && <li>PMI estimated (down payment below 20%)</li>}
                  </ul>
                </div>
                <div className="text-[11px] italic text-gray-500">
                  This is only an estimate, not a loan approval.
                </div>
                <SummaryActions
                  data={s}
                  onCompareRates={() => {
                    const followUp = (choice: string) => {
                      if (choice === "Show top lenders") {
                        setMessages((prev) => [
                          ...prev,
                          { role: "user", text: choice },
                          {
                            role: "ai",
                            text: `Based on a ${s.years}-year loan around $${s.price.toLocaleString()}, here are today's top-rated lenders. Tap "See offers" to view full details and apply.`,
                          },
                          { role: "offers" },
                        ]);
                        return;
                      }
                      const replies: Record<string, string> = {
                        "How to lower my rate?": "A few proven ways: raise your credit score above 740, put down 20% to drop PMI, buy discount points (each point ≈ 0.25% off), or consider a 15-year term for a lower rate.",
                        "Lock my rate?": "Rate locks typically last 30–60 days at no cost. Lock if rates are trending up or you're close to closing. If rates may drop, ask the lender about a float-down option.",
                        "Compare 15 vs 30 year": `At ${s.rate}%, a 30-year payment is lower but you pay much more interest. A 15-year often comes with a rate ~0.6–0.8% lower and saves tens of thousands. Want me to recalculate at 15 years?`,
                      };
                      setMessages((prev) => [
                        ...prev,
                        { role: "user", text: choice },
                        { role: "ai", text: replies[choice] ?? "Got it — let me know what else you'd like to explore." },
                      ]);
                    };
                    setMessages((prev) => [
                      ...prev,
                      { role: "user", text: "Compare rates" },
                      {
                        role: "ai",
                        text: `Here are today's average mortgage rates (May 26, 2026). At your ${s.years}-year term, the typical rate is around ${s.rate}%.`,
                      },
                      { role: "rates" },
                      {
                        role: "ai",
                        text: "And here are today's top lender offers matched to your profile — these are how you actually save money:",
                      },
                      { role: "offers" },
                      {
                        role: "ai",
                        text: "Want to dig in further?",
                        options: ["Show top lenders", "How to lower my rate?", "Lock my rate?", "Compare 15 vs 30 year"],
                        onPick: followUp,
                      },
                    ]);
                  }}
                />
              </div>
            );
          }
          if (m.role === "rates") {
            return (
              <div key={i} className="border border-gray-200 rounded-md bg-white overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-[12px] font-bold text-gray-800">
                  Today's Mortgage Rates · May 26, 2026
                </div>
                <table className="w-full text-[12px]">
                  <tbody>
                    {TODAY_RATES.map((r) => {
                      const up = r.change.startsWith("+");
                      const flat = r.change === "0.00";
                      return (
                        <tr key={r.term} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-800">{r.term}</td>
                          <td className="px-3 py-2 text-right font-bold text-gray-900">{r.rate}%</td>
                          <td
                            className={`px-3 py-2 text-right text-[11px] ${
                              flat ? "text-gray-500" : up ? "text-red-600" : "text-green-700"
                            }`}
                          >
                            {r.change}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-3 py-2 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() =>
                      document
                        .getElementById("compare-rates")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="text-[11px] font-semibold text-blue-700 hover:underline"
                  >
                    See rates by state →
                  </button>
                </div>
              </div>
            );
          }
          if (m.role === "offers") {
            return (
              <div key={i} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="text-[12px] font-bold text-gray-800 uppercase tracking-wide">
                    Today's Special Offers
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Ad Disclosure</span>
                </div>
                {ADVERTISERS.map((a) => (
                  <div
                    key={a.name}
                    className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header: logo + name + tag */}
                    <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
                      <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-100">
                        <img
                          src={a.logo}
                          alt={`${a.name} logo`}
                          className="w-7 h-7 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[14px] text-gray-900 leading-tight truncate">{a.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">30-Yr Fixed</div>
                      </div>
                      <span className="shrink-0 text-[9px] font-bold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {a.tag}
                      </span>
                    </div>

                    {/* Rate block */}
                    <div className="grid grid-cols-2 gap-px bg-gray-100 border-y border-gray-100">
                      <div className="bg-white px-3 py-2">
                        <div className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Rate</div>
                        <div className="font-bold text-[18px] text-gray-900 leading-tight">{a.rate}</div>
                      </div>
                      <div className="bg-white px-3 py-2">
                        <div className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">APR</div>
                        <div className="font-bold text-[18px] text-gray-900 leading-tight">{a.apr.replace(" APR", "")}</div>
                      </div>
                    </div>

                    {/* Highlight + CTA */}
                    <div className="px-3 py-2.5 flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[12px] text-green-700 font-semibold">
                          <span className="text-green-600">✓</span>
                          <span className="truncate">{a.highlight}</span>
                        </div>
                      </div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener sponsored"
                        className="shrink-0 inline-flex items-center bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold uppercase tracking-wide rounded-md px-4 py-2 whitespace-nowrap"
                      >
                        See offers
                      </a>
                    </div>
                  </div>
                ))}
                <div className="text-[10px] italic text-gray-500 px-1">
                  We may earn a commission when you click on our partners' offers.
                </div>
              </div>
            );
          }
          // ai
          const isLast = i === messages.length - 1;
          return (
            <div key={i} className="space-y-2">
              <div className="text-[14px] text-gray-800 leading-relaxed px-1">{m.text}</div>
              {isLast && "options" in m && m.options && (!done || m.onPick) && (
                <div className="flex flex-wrap gap-2">
                  {m.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => pick(o, m)}
                      className="text-[12px] border border-blue-500 text-blue-700 rounded-full px-3 py-1 hover:bg-blue-50"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {typing && (
          <div className="flex items-center gap-1 px-1 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "120ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "240ms" }} />
          </div>
        )}
        {!done && !typing && messages.length > 0 && (
          <button
            onClick={skipAll}
            className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-700 hover:underline"
          >
            <Zap size={12} /> Skip — use smart defaults
          </button>
        )}
      </div>


      {/* Input */}
      <div className="px-4 pt-2">
        <div className="flex items-center border-2 border-blue-500 rounded-full pl-4 pr-1 py-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask U.S. News AI"
            className="flex-1 bg-transparent outline-none text-[14px] py-2 placeholder-gray-500"
          />
          <button
            onClick={submit}
            aria-label="Send"
            className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 text-[11px] italic text-gray-500 leading-snug">
        AI-generated responses may contain errors. By using this chat, you agree to our{" "}
        <a className="underline text-blue-700">Privacy Policy</a> and{" "}
        <a className="underline text-blue-700">Terms</a>.
      </div>
    </div>
  );
}
