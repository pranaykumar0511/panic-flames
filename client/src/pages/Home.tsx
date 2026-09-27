import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  HeartCrack,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const FLAMES_LETTERS = ["F", "L", "A", "M", "E", "S"] as const;
type FlamesLetter = (typeof FLAMES_LETTERS)[number];
type Stage = "form" | "animating" | "result";

type FlamesResult = {
  count: number;
  winner: FlamesLetter;
  word: string;
};

type Reading = {
  quote: string;
  future: string;
  score: number;
};

const FLAMES_WORDS: Record<FlamesLetter, string> = {
  F: "Friends",
  L: "Love",
  A: "Affection",
  M: "Marriage",
  E: "Enemies",
  S: "Siblings",
};

const CATEGORY_READINGS: Record<FlamesLetter, string[]> = {
  F: [
    "The letters say friends — the kind of bond that doesn't need a label to matter.",
    "This one's friendship, and honestly, that's often the sturdiest thing two people can build.",
    "Friends is where this lands — no drama, just the steady kind of good.",
    "The reading points to friendship. Some of the best stories never need a plot twist.",
    "Friends — the category everyone underrates until they realize how rare a good one is.",
  ],
  L: [
    "The letters spell out love — and it looks like the kind that shows up first.",
    "This one's love, plain and simple. Enjoy the part where nothing's complicated yet.",
    "Love is where this lands. Let's see where the two of you take it.",
    "The reading says love — the early, electric kind that hasn't been tested yet.",
    "Love — the letters agree there's a spark here worth paying attention to.",
  ],
  A: [
    "The letters land on affection — warm, quiet, and easy to be around.",
    "This one's affection. Not fireworks, just the comfortable kind of caring.",
    "Affection is where this settles — the sort of closeness that doesn't need a name.",
    "The reading says affection: less butterflies, more genuine fondness.",
    "Affection — a gentler kind of bond, and not a lesser one for it.",
  ],
  M: [],
  E: [
    "The letters spell enemies — but every good rivalry has a story behind it.",
    "This one lands on enemies. Somewhere there's a reason, even if it's ancient history.",
    "Enemies, the letters say. Might be worth asking why, though.",
    "The reading points to enemies — dramatic, sure, but rarely permanent.",
    "Enemies — the letters can be dramatic like that. Take it with a grain of salt.",
  ],
  S: [
    "The letters land on siblings — the bond you don't choose but somehow always keep.",
    "This one's siblings. Built-in family, whether either of you asked for it or not.",
    "Siblings, the reading says — less romance, more 'I'd fight anyone for you.'",
    "The letters spell siblings: the kind of tie that outlasts most arguments.",
    "Siblings — not the outcome you were expecting, maybe, but a good one to have.",
  ],
};

const MARRIAGE_READINGS = [
  "The reading points to marriage — but the story doesn't end at 'I do.' Somewhere along the way, expect a sudden move that uproots the life you'd just settled into — but it's exactly the kind of test that tends to make people choose each other harder. Consider it the fine print on a happy ending.",
  "This one lands on marriage, and it comes with a plot twist worth hearing. Somewhere along the way, expect a stretch where work pulls the two of you in opposite directions — and how you talk it through will matter more than the problem itself. The good ones rarely are smooth.",
  "The letters settle on marriage — and every good marriage story has a middle chapter. Somewhere along the way, expect family expectations that take longer to align than either of you expects — though most couples who make it look back and call it the chapter that mattered most. That's just what real love looks like up close.",
  "Marriage is where this points, though the road there isn't a straight line. Somewhere along the way, expect an old habit to resurface right when things feel settled — and the version of you that gets through it is the one worth marrying. Every lasting story has a chapter like this.",
];

const FUTURE_READINGS: Record<FlamesLetter, { openers: string[]; mids: string[]; turns: string[]; closers: string[]; range: [number, number] }> = {
  F: {
    openers: ["Looking ahead, this friendship has room to grow.", "The road ahead for this one looks steady.", "If it keeps going the way it's headed,"],
    mids: ["expect a lot more inside jokes and fewer awkward silences", "the kind of trust that makes plans easy to make and easier to keep", "more shared adventures than either of you plan for"],
    turns: ["and that's the kind of friendship that quietly becomes one of the good ones", "which tends to be the sign of a friendship built to last", "and years from now it'll probably still feel this easy"],
    closers: ["Good sign all around.", "Nothing to worry about here.", "That's a solid one to hold onto."],
    range: [78, 96],
  },
  L: {
    openers: ["The outlook for this one is warm.", "If this keeps its current pace,", "Looking ahead, the spark seems to have some staying power."],
    mids: ["expect the early excitement to settle into something steadier", "there's a good chance the butterflies turn into something more dependable", "the connection has enough behind it to grow past the first-spark stage"],
    turns: ["and that's usually when people realize it's more than a passing thing", "which is often the part that actually decides where it goes", "and that shift tends to be a good sign, not a letdown"],
    closers: ["Worth seeing where it goes.", "Promising, overall.", "Keep an eye on this one."],
    range: [72, 95],
  },
  A: {
    openers: ["This one has a gentle trajectory ahead.", "Looking forward, the fondness here seems steady.", "If it continues as is,"],
    mids: ["expect the kind of comfort that doesn't need grand gestures to feel real", "the warmth here seems likely to deepen quietly over time", "small, steady moments look set to add up to something real"],
    turns: ["and that quiet consistency is often worth more than it gets credit for", "which is usually how the most durable bonds actually form", "and that's rarely a bad way for things to go"],
    closers: ["A calm, good sign.", "Nothing dramatic, just solid.", "That's a comfortable place to be."],
    range: [80, 97],
  },
  M: {
    openers: ["Looking further out, the long-term picture here has promise.", "The outlook past the wedding day looks workable.", "If this holds its course,"],
    mids: ["expect the partnership to get better at handling whatever comes up", "the two of you look likely to get sharper at navigating hard days together", "the day-to-day will probably matter more than the big milestones"],
    turns: ["and couples who build that skill tend to be the ones who go the distance", "which is usually the actual predictor of a marriage that lasts", "and that's a far better sign than a smooth start would be"],
    closers: ["Long-term, that's a good bet.", "The odds look decent from here.", "Worth betting on, long run."],
    range: [70, 94],
  },
  E: {
    openers: ["Even here, the outlook isn't fixed in stone.", "Looking ahead, rivalries like this don't always stay put.", "Give it time and"],
    mids: ["there's a reasonable chance the tension fades faster than expected", "the reasons behind it might matter less with a bit of distance", "old friction like this has a way of losing its heat"],
    turns: ["and plenty of rivalries end up cooling into something closer to respect", "which happens more often than people expect", "and that's usually a better ending than either side predicts"],
    closers: ["Not a lost cause.", "Could easily improve.", "Don't rule out a thaw."],
    range: [45, 72],
  },
  S: {
    openers: ["The outlook for this one is dependable.", "Looking ahead, this bond looks built to last.", "If it goes anything like it usually does,"],
    mids: ["expect the arguments to stay minor and the loyalty to stay major", "the bond looks likely to hold no matter how much time passes between check-ins", "distance and time probably won't change much here"],
    turns: ["and that kind of steadiness is exactly what makes it feel like family", "which is usually the whole point of a bond like this", "and that's about as reliable as these things get"],
    closers: ["Solid, long-term.", "That's a good one to have.", "Reliable, through and through."],
    range: [80, 97],
  },
};

function choose<T>(items: T[], key: string, history: Record<string, number>) {
  if (items.length === 1) return items[0];
  let index = Math.floor(Math.random() * items.length);
  while (index === history[key]) index = Math.floor(Math.random() * items.length);
  history[key] = index;
  return items[index];
}

function cleanLetters(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function flamesLogic(firstName: string, secondName: string): FlamesResult {
  const first = cleanLetters(firstName).split("");
  const second = cleanLetters(secondName).split("");

  for (let index = first.length - 1; index >= 0; index -= 1) {
    const matchIndex = second.indexOf(first[index]);
    if (matchIndex !== -1) {
      first.splice(index, 1);
      second.splice(matchIndex, 1);
    }
  }

  const count = Math.max(first.length + second.length, 1);
  let remaining = [...FLAMES_LETTERS];
  let start = 0;

  while (remaining.length > 1) {
    const index = (start + count - 1) % remaining.length;
    remaining.splice(index, 1);
    start = index % (remaining.length || 1);
  }

  const winner = remaining[0];
  return { count, winner, word: FLAMES_WORDS[winner] };
}

function outlookLabel(score: number) {
  if (score >= 85) return "very bright";
  if (score >= 70) return "promising";
  if (score >= 55) return "mixed, but workable";
  return "rocky, but not hopeless";
}

export default function Home() {
  const [nameOne, setNameOne] = useState("");
  const [nameTwo, setNameTwo] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [pending, setPending] = useState<FlamesResult | null>(null);
  const [result, setResult] = useState<FlamesResult | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [eliminated, setEliminated] = useState<FlamesLetter[]>([]);
  const [error, setError] = useState("");
  const [panicMessage, setPanicMessage] = useState("");
  const history = useRef<Record<string, number>>({});
  const lastResult = useRef<{ result: FlamesResult; nameOne: string; nameTwo: string } | null>(null);

  useEffect(() => {
    if (stage !== "animating" || !pending) return undefined;

    const removed = FLAMES_LETTERS.filter((letter) => letter !== pending.winner).sort(() => Math.random() - 0.5);
    let step = 0;
    const timer = window.setInterval(() => {
      if (step < removed.length) {
        setEliminated((letters) => [...letters, removed[step]]);
        step += 1;
        return;
      }

      window.clearInterval(timer);
      window.setTimeout(() => {
        const futureSet = FUTURE_READINGS[pending.winner];
        const futureScore = Math.floor(Math.random() * (futureSet.range[1] - futureSet.range[0] + 1)) + futureSet.range[0];
        const future = `${choose(futureSet.openers, `${pending.winner}-open`, history.current)} ${choose(futureSet.mids, `${pending.winner}-mid`, history.current)}, ${choose(futureSet.turns, `${pending.winner}-turn`, history.current)}. ${choose(futureSet.closers, `${pending.winner}-close`, history.current)}`;
        const quote = pending.winner === "M"
          ? choose(MARRIAGE_READINGS, "marriage", history.current)
          : choose(CATEGORY_READINGS[pending.winner], pending.winner, history.current);
        setReading({ quote, future, score: futureScore });
        setResult(pending);
        setStage("result");
      }, 350);
    }, 260);

    return () => window.clearInterval(timer);
  }, [pending, stage]);

  const calculate = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const cleanOne = nameOne.trim();
    const cleanTwo = nameTwo.trim();

    if (!cleanLetters(cleanOne).length || !cleanLetters(cleanTwo).length) {
      setError("Enter both names to get a reading.");
      setStage("form");
      setResult(null);
      return;
    }

    const computed = flamesLogic(cleanOne, cleanTwo);
    lastResult.current = { result: computed, nameOne: cleanOne, nameTwo: cleanTwo };
    setError("");
    setPanicMessage("");
    setPending(computed);
    setResult(null);
    setReading(null);
    setEliminated([]);
    setStage("animating");
  };

  const readAgain = () => {
    if (!lastResult.current) return;
    setPending(lastResult.current.result);
    setResult(null);
    setReading(null);
    setEliminated([]);
    setPanicMessage("");
    setStage("animating");
  };

  const restart = () => {
    setNameOne("");
    setNameTwo("");
    setPending(null);
    setResult(null);
    setReading(null);
    setEliminated([]);
    setError("");
    setPanicMessage("Fresh page. No evidence left behind.");
    setStage("form");
  };

  const useExample = (first: string, second: string) => {
    setNameOne(first);
    setNameTwo(second);
    setError("");
    setPanicMessage("");
    setStage("form");
  };

  const activeResult = result ?? pending;

  return (
    <main className="site-shell">
      <div className="paper-grain" aria-hidden="true" />
      <header className="site-header page-width">
        <a className="brand-mark" href="#top" aria-label="Panic home"><span className="brand-mark__dot" /><span>Panic</span></a>
        <div className="header-note"><span className="header-note__rule" /><span>For the romantically curious</span></div>
        <a className="header-link" href="#how-it-works">The little ritual <ArrowDown size={15} strokeWidth={1.8} /></a>
      </header>

      <section className="hero page-width" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={15} /> The original name game</p>
          <h1>Are we a <em>thing,</em><br />or just <span>panicking?</span></h1>
          <p className="hero-deck">Put two names on the line and let the old-school FLAMES ritual settle what your group chat refuses to.</p>
          <div className="hero-stamp" aria-label="A playful reminder"><span className="hero-stamp__number">01</span><span>Enter names.<br />Trust the drama.</span></div>
        </div>

        <div className="calculator-wrap">
          <div className="calculator-card">
            <div className="card-topline"><span>FLAMES / Vol. 01</span><span>Est. forever</span></div>

            {stage === "form" && (
              <>
                <div className="calculator-heading"><div><p className="section-kicker">The calculation</p><h2>Names on paper.</h2></div><HeartCrack size={29} strokeWidth={1.35} aria-hidden="true" /></div>
                <form onSubmit={calculate} noValidate>
                  <div className="name-fields">
                    <label className="name-field"><span>Name one</span><input type="text" value={nameOne} onChange={(event) => setNameOne(event.target.value)} placeholder="e.g. Romeo" autoComplete="off" aria-label="First name" /></label>
                    <span className="field-connector" aria-hidden="true">+</span>
                    <label className="name-field"><span>Name two</span><input type="text" value={nameTwo} onChange={(event) => setNameTwo(event.target.value)} placeholder="e.g. Juliet" autoComplete="off" aria-label="Second name" /></label>
                  </div>
                  {error && <p className="form-message form-message--error">{error}</p>}
                  {panicMessage && <p className="form-message form-message--success"><Check size={14} /> {panicMessage}</p>}
                  <button className="calculate-button" type="submit"><span>Read the letters</span><ArrowUpRight size={18} strokeWidth={1.8} /></button>
                </form>
                <div className="example-row"><span>Try a classic</span><button type="button" onClick={() => useExample("Romeo", "Juliet")}>Romeo + Juliet</button><button type="button" onClick={() => useExample("Taylor", "Travis")}>Taylor + Travis</button></div>
              </>
            )}

            {stage === "animating" && activeResult && (
              <section className="reading-animation" aria-live="polite">
                <p className="section-kicker">Reading the letters</p>
                <h2>Crossing out<br /><em>the obvious.</em></h2>
                <div className="animated-letters" aria-label="Letters being eliminated">
                  {FLAMES_LETTERS.map((letter) => <span key={letter} className={`animated-letter ${eliminated.includes(letter) ? "animated-letter--gone" : ""} ${letter === activeResult.winner && eliminated.length === 5 ? "animated-letter--win" : ""}`}>{letter}</span>)}
                </div>
                <p className="animation-caption">The letters are making a case for themselves.</p>
              </section>
            )}

            {stage === "result" && activeResult && reading && (
              <section className="rich-result" aria-live="polite">
                <div className="result-heading-row"><div><p className="section-kicker">Your reading</p><p className="pair-names">{nameOne} &amp; {nameTwo}</p><h2>{activeResult.word}</h2></div><span className="result-big-letter">{activeResult.winner}</span></div>
                <div className="divider" />
                <p className="result-quote">{reading.quote}</p>
                <div className="divider" />
                <p className="section-kicker">Looking ahead</p>
                <p className="future-text">{reading.future}</p>
                <div className="scorebar"><div className="scorefill" style={{ width: `${reading.score}%` }} /></div>
                <p className="scoreline"><strong>{reading.score} / 100</strong> — {outlookLabel(reading.score)}</p>
                <div className="result-actions"><button className="calculate-button" type="button" onClick={readAgain}><span>Read again</span><RotateCcw size={17} strokeWidth={1.8} /></button><button className="secondary-button" type="button" onClick={restart}><ArrowLeft size={15} /> Try different names</button></div>
              </section>
            )}
          </div>
          <p className="card-caption">No algorithms were emotionally consulted in the making of this result.</p>
        </div>
      </section>

      <section className="ritual-strip page-width" id="how-it-works">
        <div className="ritual-strip__intro"><p className="section-kicker">How it works</p><h2>A tiny ritual<br /><em>with big opinions.</em></h2></div>
        <div className="ritual-step"><span className="ritual-step__number">01</span><BookOpen size={21} strokeWidth={1.45} /><div><h3>Cross out the common letters</h3><p>We remove matching letters from both names and count what is left.</p></div></div>
        <div className="ritual-step"><span className="ritual-step__number">02</span><RotateCcw size={21} strokeWidth={1.45} /><div><h3>Let FLAMES take the wheel</h3><p>The leftover count eliminates letters until one slightly dramatic answer remains.</p></div></div>
      </section>

      <footer className="site-footer page-width"><span>Made for the moment before you ask, “so… what are we?”</span><span>© Panic, probably</span></footer>
      <button className="panic-button" type="button" onClick={restart} aria-label="Panic and clear the calculator"><span className="panic-button__mark">×</span><span>Panic</span></button>
    </main>
  );
}
