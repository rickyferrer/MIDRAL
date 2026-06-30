/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakColor,
   TweakRadio, TweakSelect, TweakToggle, Hero, IntroEssay, Divider, NewsletterSignup, Studios,
   Judges, Footer, TopBar, ScrollProgress, Contents, VideoModal, ArtistEntry */
const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  "primary": "#e9531e",
  "accent": "#f2c200",
  "display": "Cinderblock",
  "order": "ranked",
  "genre": "All genres",
  "motion": true
} /*EDITMODE-END*/;

const DISPLAY_FONTS = {
  "Cinderblock": '"Cinderblock", "Anton", sans-serif',
  "Anton": '"Anton", "Arial Narrow", sans-serif',
  "Oswald": '"Oswald", "Arial Narrow", sans-serif',
  "Archivo Black": '"Archivo Black", system-ui, sans-serif',
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [video, setVideo] = useState(null);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const artists = window.ARTISTS;

  // ---- apply visual tweaks to :root ----
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--orange", t.primary);
    r.setProperty("--orange-deep", `color-mix(in srgb, ${t.primary} 80%, #000)`);
    r.setProperty("--blue", t.accent);
    r.setProperty("--display", DISPLAY_FONTS[t.display] || DISPLAY_FONTS.Anton);
    document.body.classList.toggle("no-motion", !t.motion);
  }, [t.primary, t.accent, t.display, t.motion]);

  // ---- build the display list (order + genre filter) ----
  let list = artists.slice();
  if (t.genre && t.genre !== "All genres") list = list.filter((a) => a.genre === t.genre);
  if (t.order === "countdown") list = list.slice().reverse();

  const listKey = t.order + "|" + t.genre;

  // ---- reveal + current-rank observers (re-run when list changes) ----
  useEffect(() => {
    const revs = Array.from(document.querySelectorAll(".reveal"));
    const ro = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revs.forEach((el) => ro.observe(el));

    const secs = Array.from(document.querySelectorAll("[data-rank]"));
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(Number(e.target.getAttribute("data-rank")));
        });
      },
      { threshold: 0.4 }
    );
    secs.forEach((el) => co.observe(el));

    return () => { ro.disconnect(); co.disconnect(); };
  }, [listKey]);

  const openVideo = (d) => setVideo(d);

  return (
    <>
      <ScrollProgress />
      <TopBar current={current} total={artists.length} onOpenContents={() => setContentsOpen(true)} />
      <Contents open={contentsOpen} onClose={() => setContentsOpen(false)} artists={artists} />

      <Hero onVideo={openVideo} />
      <IntroEssay onVideo={openVideo} />

      <Divider
        className="sec-ink"
        kicker="Our Final List"
        title={t.order === "countdown" ? "The Countdown" : "The Influential 25"}
        body={<>Ranked by 12 judges across a quarter century of North Texas sound. Wherever you see the{" "}<span style={{display:"inline-flex",alignItems:"center",verticalAlign:"middle",width:"22px",height:"22px",borderRadius:"50%",background:"var(--blue)",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.25)"}}><span style={{width:0,height:0,marginLeft:"3px",borderStyle:"solid",borderWidth:"5px 0 5px 8px",borderColor:"transparent transparent transparent #fff"}}></span></span>{" "}there’s a video to watch.</>}
        ghost={t.order === "countdown" ? "25" : "1"}
      />

      {list.length === 0 ? (
        <section className="divider sec-paper" style={{ minHeight: "40vh" }}>
          <p style={{ fontSize: 20 }}>No artists in that genre. Reset the filter in Tweaks.</p>
        </section>
      ) : (
        (() => {
          const ORANGE = [1, 6, 12, 18, 25];
          return list.map((a) => {
            const featured = ORANGE.includes(a.rank);
            const side = a.rank % 2 === 0 ? "right" : "left";
            return (
              <React.Fragment key={a.rank}>
                <ArtistEntry artist={a} side={side} featured={featured} onVideo={openVideo} />
                {a.rank === 3 && <NewsletterSignup />}
                {[5, 10, 15, 20].includes(a.rank) && <MissEllieHorizontal id={a.rank} />}
              </React.Fragment>
            );
          });
        })()
      )}

      <Studios />
      <Judges onVideo={openVideo} />
      <Footer />

      <VideoModal data={video} onClose={() => setVideo(null)} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Color" />
        <TweakColor
          label="Primary"
          value={t.primary}
          options={["#e9531e", "#d6332a", "#1c1c1c", "#1f6f4a", "#2f4b9b"]}
          onChange={(v) => setTweak("primary", v)}
        />
        <TweakColor
          label="Video accent"
          value={t.accent}
          options={["#16a3df", "#e9531e", "#f2c200", "#ff5e8a", "#1f1f1f"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSection label="Type" />
        <TweakRadio
          label="Display face"
          value={t.display}
          options={["Cinderblock", "Anton", "Oswald"]}
          onChange={(v) => setTweak("display", v)}
        />
        <TweakSection label="The list" />
        <TweakRadio
          label="Order"
          value={t.order}
          options={["ranked", "countdown"]}
          onChange={(v) => setTweak("order", v)}
        />
        <TweakSelect
          label="Filter by genre"
          value={t.genre}
          options={["All genres"].concat(window.GENRES)}
          onChange={(v) => setTweak("genre", v)}
        />
        <TweakSection label="Motion" />
        <TweakToggle label="Scroll reveals" value={t.motion} onChange={(v) => setTweak("motion", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
