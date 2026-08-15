"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CreditCard, Lock, ShieldCheck, TriangleAlert } from "lucide-react";
import { ElementIcon } from "@/components/ElementOrb";
import { ElementWheel } from "@/components/ElementWheel";
import {
  ELEMENTS,
  LOCKED_SECTIONS,
  getReading,
  getScore,
  getVerdict,
  isElementId,
  type ElementId,
} from "@/lib/elements";
import { PLANS, formatPrice, type PlanId } from "@/lib/plans";
import { startCheckout } from "@/lib/checkout";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PLAN_FEATURES: Record<PlanId, string[]> = {
  basic: [
    "Полный разбор вашей пары стихий",
    "Сценарий конфликта и как его прервать",
    "PDF на почту сразу после оплаты",
  ],
  full: [
    "Всё из тарифа «Базовый»",
    "Что чувствует ваш человек — разбор его стихии изнутри",
    "Инструкция на 30 дней: 4 конкретных шага",
    "Разбор денег и быта в вашей паре",
  ],
  premium: [
    "Всё из тарифа «Полный»",
    "Аудиоразбор вашей пары, 20 минут",
    "Сценарии на год: точки роста и точки риска",
    "Ответ на один личный вопрос по e-mail",
  ],
};

function ScoreRing({ score }: { score: number }) {
  const [progress, setProgress] = useState(0);
  const radius = 78;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto" }}>
      <svg viewBox="0 0 200 200" width="200" height="200" role="img" aria-label={`Совместимость ${score} из 100`}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-fire)" />
            <stop offset="50%" stopColor="var(--accent-air)" />
            <stop offset="100%" stopColor="var(--accent-water)" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--border)" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * progress) / 100}
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 52, fontWeight: 800, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
            ИЗ 100
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultInner() {
  const params = useSearchParams();
  const rawMe = params.get("me");
  const rawYou = params.get("you");

  const me: ElementId = isElementId(rawMe) ? rawMe : "fire";
  const you: ElementId = isElementId(rawYou) ? rawYou : "water";

  const score = getScore(me, you);
  const reading = getReading(me, you);
  const verdict = getVerdict(score);

  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem("el_email");
      if (saved) setEmail(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const handleLanded = useCallback((plan: PlanId) => {
    setSelectedPlan(plan);
  }, []);

  async function pay() {
    if (!selectedPlan) return;
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Укажите корректный e-mail — на него придёт разбор и чек.");
      return;
    }
    setPending(true);
    setError(null);
    const failure = await startCheckout(selectedPlan, trimmed);
    if (failure) {
      setError(failure);
      setPending(false);
    }
  }

  const plan = selectedPlan ? PLANS[selectedPlan] : null;

  return (
    <main className="shell" style={{ paddingTop: 34, paddingBottom: 20 }}>
      <Link href="/" className="legal-back">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Выбрать другие стихии</span>
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            marginBottom: 18,
          }}
        >
          {[me, you].map((element, index) => (
            <div key={`${element}-${index}`} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  border: `1px solid ${ELEMENTS[element].color}`,
                  background: "var(--bg-card)",
                  color: ELEMENTS[element].color,
                }}
              >
                <ElementIcon element={element} size={26} />
              </div>
              <div style={{ fontSize: 13, marginTop: 7, fontFamily: "var(--font-head)", fontWeight: 700 }}>
                {ELEMENTS[element].name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                {index === 0 ? "Вы" : "Партнёр"}
              </div>
            </div>
          ))}
        </div>

        <h1 style={{ fontSize: "clamp(26px, 5.4vw, 40px)", marginBottom: 8 }}>{reading.title}</h1>
        <p style={{ color: "var(--accent-air)", fontSize: 14, letterSpacing: "0.1em", margin: 0 }}>
          {verdict.toUpperCase()}
        </p>

        <div style={{ marginTop: 26 }}>
          <ScoreRing score={score} />
        </div>
      </motion.section>

      <section className="card" style={{ marginTop: 30 }}>
        <p style={{ margin: 0, fontSize: 16 }}>{reading.summary}</p>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            marginTop: 20,
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "var(--accent-earth)",
                fontSize: 12,
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              <ShieldCheck size={14} aria-hidden="true" />
              СИЛЬНАЯ СТОРОНА
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>{reading.strength}</p>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "var(--accent-fire)",
                fontSize: 12,
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              <TriangleAlert size={14} aria-hidden="true" />
              ЗОНА РИСКА
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>{reading.risk}</p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 34 }}>
        <h2 style={{ fontSize: 20, marginBottom: 14 }}>Закрытые разделы разбора</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {LOCKED_SECTIONS.map((section) => (
            <div key={section.title} className="card locked">
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <Lock size={15} style={{ color: "var(--accent-air)" }} aria-hidden="true" />
                <h3 style={{ fontSize: 16, margin: 0 }}>{section.title}</h3>
              </div>
              <p className="locked-body" style={{ margin: 0, fontSize: 14 }}>
                {section.teaser}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 42 }} id="pricing">
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>Колесо стихий выберет ваш тариф</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            Крутите колесо — оно остановится на рекомендованном варианте. Выбор всегда
            остаётся за вами.
          </p>
        </div>

        <ElementWheel onLanded={handleLanded} />

        {plan ? (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="card"
            style={{ marginTop: 26, borderColor: "var(--accent-air)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h3 style={{ fontSize: 22, margin: 0 }}>{plan.title}</h3>
              <div>
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    marginRight: 9,
                  }}
                >
                  {formatPrice(plan.oldPrice)}
                </span>
                <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 26 }}>
                  {formatPrice(plan.price)}
                </span>
              </div>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "6px 0 16px" }}>
              {plan.description}
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "grid", gap: 9 }}>
              {PLAN_FEATURES[plan.id].map((feature) => (
                <li key={feature} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14 }}>
                  <Check size={16} style={{ color: "var(--accent-earth)", flexShrink: 0, marginTop: 3 }} aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <label htmlFor="pay-email" style={{ display: "block", fontSize: 13, marginBottom: 8, color: "var(--text-secondary)" }}>
              E-mail для разбора и чека
            </label>
            <input
              id="pay-email"
              className="field"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            {error ? (
              <p style={{ color: "var(--accent-fire)", fontSize: 13, margin: "10px 0 0" }}>{error}</p>
            ) : null}

            <button type="button" className="btn" style={{ marginTop: 16 }} onClick={pay} disabled={pending}>
              <CreditCard size={18} aria-hidden="true" />
              {pending ? "Готовим оплату..." : `Оплатить ${formatPrice(plan.price)}`}
            </button>

            <p style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", margin: "12px 0 0" }}>
              Оплата через ЮKassa. Доступны все способы оплаты, подключённые к магазину.
              Нажимая кнопку, вы принимаете{" "}
              <Link href="/offer" style={{ color: "var(--accent-air)" }}>
                оферту
              </Link>{" "}
              и{" "}
              <Link href="/privacy" style={{ color: "var(--accent-air)" }}>
                политику конфиденциальности
              </Link>
              .
            </p>
          </motion.div>
        ) : (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 14, marginTop: 20 }}>
            Тариф появится здесь после остановки колеса.
          </p>
        )}
      </section>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="shell" style={{ paddingTop: 80, textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Считаем совместимость...</p>
        </main>
      }
    >
      <ResultInner />
    </Suspense>
  );
}
