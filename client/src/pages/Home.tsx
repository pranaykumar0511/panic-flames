import { FormEvent, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  HeartCrack,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const FLAMES_LETTERS = ["F", "L", "A", "M", "E", "S"] as const;

const FLAMES_WORDS: Record<(typeof FLAMES_LETTERS)[number], string> = {
  F: "Friends",
  L: "Lovers",
  A: "Attraction",
  M: "Marriage",
  E: "Enemies",
  S: "Siblings",
};

const RELATIONSHIP_NOTES: Record<(typeof FLAMES_LETTERS)[number], string> = {
  F: "A warm, easy bond with room for shared stories.",
  L: "A little spark is definitely in the room.",
  A: "There is an unmistakable pull between you.",
  M: "A classic match with serious staying power.",
  E: "Keep the banter kind. This one has some heat.",
  S: "A familiar bond that knows all your chapters.",
};

type FlamesResult = {
  count: number;
  winner: (typeof FLAMES_LETTERS)[number];
  word: string;
};

function flamesLogic(firstName: string, secondName: string): FlamesResult {
  const first = firstName.toLowerCase().replace(/[^a-z]/g, "").split("");
  const second = secondName.toLowerCase().replace(/[^a-z]/g, "").split("");

  for (let index = 0; index < first.length; index += 1) {
    const matchIndex = second.indexOf(first[index]);
    if (matchIndex !== -1) {
      second.splice(matchIndex, 1);
      first.splice(index, 1);
      index -= 1;
    }
  }

  const count = first.length + second.length;
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

export default function Home() {
  const [nameOne, setNameOne] = useState("");
  const [nameTwo, setNameTwo] = useState("");
  const [result, setResult] = useState<FlamesResult | null>(null);
  const [error, setError] = useState("");
  const [panicMessage, setPanicMessage] = useState("");

  const calculate = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const cleanOne = nameOne.trim();
    const cleanTwo = nameTwo.trim();

    if (!cleanOne || !cleanTwo) {
      setError("Two names, please. The flames need a little fuel.");
      setResult(null);
      return;
    }

    setError("");
    setPanicMessage("");
    setResult(flamesLogic(cleanOne, cleanTwo));
  };

  const reset = () => {
    setNameOne("");
    setNameTwo("");
    setResult(null);
    setError("");
    setPanicMessage("Fresh page. No evidence left behind.");
  };

  const useExample = (first: string, second: string) => {
    setNameOne(first);
    setNameTwo(second);
    setResult(null);
    setError("");
    setPanicMessage("");
  };

  return (
    <main className="site-shell">
      <div className="paper-grain" aria-hidden="true" />
      <header className="site-header page-width">
        <a className="brand-mark" href="#top" aria-label="Panic home">
          <span className="brand-mark__dot" />
          <span>Panic</span>
        </a>
        <div className="header-note">
          <span className="header-note__rule" />
          <span>For the romantically curious</span>
        </div>
        <a className="header-link" href="#how-it-works">
          The little ritual <ArrowDown size={15} strokeWidth={1.8} />
        </a>
      </header>

      <section className="hero page-width" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={15} /> The original name game</p>
          <h1>
            Are we a <em>thing,</em>
            <br />
            or just <span>panicking?</span>
          </h1>
          <p className="hero-deck">
            Put two names on the line and let the old-school FLAMES ritual
            settle what your group chat refuses to.
          </p>
          <div className="hero-stamp" aria-label="A playful reminder">
            <span className="hero-stamp__number">01</span>
            <span>Enter names.<br />Trust the drama.</span>
          </div>
        </div>

        <div className="calculator-wrap">
          <div className="calculator-card">
            <div className="card-topline">
              <span>FLAMES / Vol. 01</span>
              <span>Est. forever</span>
            </div>

            <div className="calculator-heading">
              <div>
                <p className="section-kicker">The calculation</p>
                <h2>Names on paper.</h2>
              </div>
              <HeartCrack size={29} strokeWidth={1.35} aria-hidden="true" />
            </div>

            <form onSubmit={calculate} noValidate>
              <div className="name-fields">
                <label className="name-field">
                  <span>Name one</span>
                  <input
                    type="text"
                    value={nameOne}
                    onChange={(event) => setNameOne(event.target.value)}
                    placeholder="e.g. Romeo"
                    autoComplete="off"
                    aria-label="First name"
                  />
                </label>
                <span className="field-connector" aria-hidden="true">+</span>
                <label className="name-field">
                  <span>Name two</span>
                  <input
                    type="text"
                    value={nameTwo}
                    onChange={(event) => setNameTwo(event.target.value)}
                    placeholder="e.g. Juliet"
                    autoComplete="off"
                    aria-label="Second name"
                  />
                </label>
              </div>

              {error && <p className="form-message form-message--error">{error}</p>}
              {panicMessage && <p className="form-message form-message--success"><Check size={14} /> {panicMessage}</p>}

              <button className="calculate-button" type="submit">
                <span>Calculate the chemistry</span>
                <ArrowUpRight size={18} strokeWidth={1.8} />
              </button>
            </form>

            <div className="example-row">
              <span>Try a classic</span>
              <button type="button" onClick={() => useExample("Romeo", "Juliet")}>Romeo + Juliet</button>
              <button type="button" onClick={() => useExample("Taylor", "Travis")}>Taylor + Travis</button>
            </div>

            {result && (
              <section className="result-panel" aria-live="polite">
                <div className="result-panel__label">Your result is in</div>
                <div className="flames-row" aria-label={`FLAMES result: ${result.word}`}>
                  {FLAMES_LETTERS.map((letter) => (
                    <span key={letter} className={letter === result.winner ? "flames-letter flames-letter--active" : "flames-letter"}>
                      {letter}
                    </span>
                  ))}
                </div>
                <div className="result-main">
                  <span className="result-main__letter">{result.winner}</span>
                  <div>
                    <p className="result-main__word">{result.word}</p>
                    <p className="result-main__note">{RELATIONSHIP_NOTES[result.winner]}</p>
                  </div>
                </div>
                <div className="result-meta">
                  <span>Leftover count <strong>{result.count}</strong></span>
                  <span>Take it with a wink.</span>
                </div>
              </section>
            )}
          </div>
          <p className="card-caption">No algorithms were emotionally consulted in the making of this result.</p>
        </div>
      </section>

      <section className="ritual-strip page-width" id="how-it-works">
        <div className="ritual-strip__intro">
          <p className="section-kicker">How it works</p>
          <h2>A tiny ritual<br /><em>with big opinions.</em></h2>
        </div>
        <div className="ritual-step">
          <span className="ritual-step__number">01</span>
          <BookOpen size={21} strokeWidth={1.45} />
          <div>
            <h3>Cross out the common letters</h3>
            <p>We remove matching letters from both names and count what is left.</p>
          </div>
        </div>
        <div className="ritual-step">
          <span className="ritual-step__number">02</span>
          <RotateCcw size={21} strokeWidth={1.45} />
          <div>
            <h3>Let FLAMES take the wheel</h3>
            <p>The leftover count eliminates letters until one slightly dramatic answer remains.</p>
          </div>
        </div>
      </section>

      <footer className="site-footer page-width">
        <span>Made for the moment before you ask, “so… what are we?”</span>
        <span>© Panic, probably</span>
      </footer>

      <button className="panic-button" type="button" onClick={reset} aria-label="Panic and clear the calculator">
        <span className="panic-button__mark">×</span>
        <span>Panic</span>
      </button>
    </main>
  );
}
