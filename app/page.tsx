"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { ElementIcon, OrbField } from "@/components/ElementOrb";
import { ELEMENTS, ELEMENT_ORDER, type ElementId } from "@/lib/elements";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ACCENTS: Record<ElementId, string> = {
  fire: "var(--accent-fire)",
  water: "var(--accent-water)",
  earth: "var(--accent-earth)",
  air: "var(--accent-air)",
};

function Selector({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: ElementId | null;
  onChange: (id: ElementId) => void;
}) {
  return (
    <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
      <legend style={{ padding: 0, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: 800,
            fontSize: 20,
            display: "block",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{hint}</span>
      </legend>

      <div className="pick-grid">
        {ELEMENT_ORDER.map((id) => {
          const element = ELEMENTS[id];
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              className="pick"
              data-active={active}
              aria-pressed={active}
              style={{ ["--pick-color" as string]: ACCENTS[id] }}
              onClick={() => onChange(id)}
            >
              <span style={{ color: ACCENTS[id] }}>
                <ElementIcon element={id} size={26} />
              </span>
              <span className="pick-name">{element.name}</span>
              <span className="pick-tag">{element.tagline}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<ElementId | null>(null);
  const [partner, setPartner] = useState<ElementId | null>(null);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const ready = Boolean(me && partner);
  const canSubmit = ready && emailValid;

  const preview = useMemo(() => {
    if (!me || !partner) return null;
    return `${ELEMENTS[me].name} и ${ELEMENTS[partner].name}`;
  }, [me, partner]);

  function submit() {
    setTouched(true);
    if (!canSubmit || !me || !partner) return;
    try {
      window.sessionStorage.setItem("el_email", email.trim());
    } catch {
      /* private mode — result page will ask for the e-mail again */
    }
    router.push(`/result?me=${me}&you=${partner}`);
  }

  return (
    <main className="shell" style={{ paddingTop: 40, paddingBottom: 20 }}>
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center" }}
      >
        <OrbField />
        <h1 style={{ fontSize: "clamp(30px, 6.4vw, 54px)", marginBottom: 14 }}>
          Огонь и Вода —
          <br />
          <span
            style={{
              background: "linear-gradient(96deg, var(--accent-fire), var(--accent-water))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            притяжение или война?
          </span>
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: 560,
            margin: "0 auto",
            fontSize: 16,
          }}
        >
          Знак зодиака говорит о характере. Стихия — о том, как вы двое проживаете
          близость, ссоры и молчание. Выберите две стихии и получите разбор бесплатно.
        </p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="card"
        style={{ marginTop: 38, padding: "26px 22px" }}
      >
        <div
          style={{
            display: "grid",
            gap: 30,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          <Selector
            label="Я"
            hint="Ваша стихия"
            value={me}
            onChange={setMe}
          />
          <Selector
            label="Мой человек"
            hint="Стихия партнёра"
            value={partner}
            onChange={setPartner}
          />
        </div>

        {preview ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: 26,
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg-primary)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
              }}
            >
              <Sparkles size={16} style={{ color: "var(--accent-air)", flexShrink: 0 }} aria-hidden="true" />
              <span>
                Пара выбрана: <strong>{preview}</strong>. Укажите e-mail — разбор придёт
                на почту и откроется на экране.
              </span>
            </div>
          </motion.div>
        ) : null}

        <div style={{ marginTop: 22 }}>
          <label htmlFor="email" style={{ display: "block", fontSize: 13, marginBottom: 8, color: "var(--text-secondary)" }}>
            E-mail для результата
          </label>
          <input
            id="email"
            className="field"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched(true)}
          />
          {touched && !emailValid ? (
            <p style={{ color: "var(--accent-fire)", fontSize: 13, margin: "8px 0 0" }}>
              Проверьте адрес — на него придёт разбор.
            </p>
          ) : null}
          {touched && !ready ? (
            <p style={{ color: "var(--accent-fire)", fontSize: 13, margin: "8px 0 0" }}>
              Выберите обе стихии.
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className="btn"
          style={{ marginTop: 18 }}
          disabled={!canSubmit}
          onClick={submit}
        >
          Узнать совместимость
          <ArrowRight size={18} aria-hidden="true" />
        </button>

        <p
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            margin: "14px 0 0",
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <Lock size={13} aria-hidden="true" />
          Результат бесплатно. Данные не передаём третьим лицам.
        </p>
      </motion.section>

      <section style={{ marginTop: 46 }}>
        <h2 style={{ fontSize: 22, marginBottom: 16, textAlign: "center" }}>
          Почему стихия точнее знака
        </h2>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          }}
        >
          {[
            {
              icon: <ShieldCheck size={20} aria-hidden="true" />,
              title: "Стихия — это темп",
              text: "Знаков двенадцать, стихий четыре. Именно стихия задаёт скорость, с которой человек чувствует, решает и отходит после ссоры.",
            },
            {
              icon: <Sparkles size={20} aria-hidden="true" />,
              title: "Совпадают не знаки, а ритмы",
              text: "Два Льва прекрасно ладят, пока не приходится уступать. Огонь и Воздух — разные знаки и один ритм. Это видно только через стихии.",
            },
            {
              icon: <Lock size={20} aria-hidden="true" />,
              title: "Работает без даты рождения",
              text: "Не нужно точное время и город. Достаточно знать свою стихию и стихию партнёра — расчёт мгновенный.",
            },
          ].map((item) => (
            <div key={item.title} className="card">
              <span style={{ color: "var(--accent-air)" }}>{item.icon}</span>
              <h3 style={{ fontSize: 16, margin: "10px 0 6px" }}>{item.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
