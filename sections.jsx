/* global React */
const { useState, useEffect, useRef } = React;

/* -------------------------------------------------------------- PlayButton */
function PlayButton({ onClick, size, pulse, label }) {
  return (
    <button
      className={"play" + (size ? " " + size : "")}
      onClick={onClick}
      aria-label={label || "Play video"}
      type="button">
      
      {pulse ? <span className="pulse" /> : null}
    </button>);

}

/* --------------------------------------------------------------- HeroPhoto */
/* Cover image carousel — rotates through all 25 artist photos */
function HeroPhoto() {
  const artists = window.ARTISTS.filter((a) => a.photo);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (artists.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % artists.length);
    }, 3800);
    return () => clearInterval(t);
  }, [artists.length]);

  if (artists.length === 0) {
    return (
      <div className="hero__photo">
        <div className="hero__rot hero__rot--empty" style={{ width: "400px" }}>
          <div className="hero__coverhint">
            <div className="kicker">The Cover</div>
            <p>Drop a photo onto any artist below &mdash; the cover rotates through them at random.</p>
          </div>
        </div>
      </div>);
  }

  const cur = artists[idx];
  return (
    <div className="hero__photo">
      <div className="hero__rot">
        {artists.map((a, i) =>
        <img key={a.rank} src={a.photo} alt={a.name} className={"hero__rotimg" + (i === idx ? " on" : "")} />
        )}
      </div>
      <div className="hero__caption">
        <div className="kicker">No. {cur.rank}</div>
        <p>{cur.name}</p>
      </div>
    </div>);
}

/* --------------------------------------------------------------------- Hero */
function Hero({ onVideo }) {
  const F = window.FEATURE;
  return (
    <header className="hero" id="top">
      <div className="hero__ghost" aria-hidden="true">25</div>

      <div className="hero__left">
        <div className="hero__pageno">
          <span style={{ fontSize: "14px" }}>{F.issue}</span>
        </div>

        <div className="hero__title">
          <h1 style={{ margin: 0 }}>
            <span className="display line" style={{ fontWeight: "100" }}>THE <span className="num">25</span> MOST INFLUENTIAL</span>
            <span className="display line" style={{ fontWeight: "100" }}>DALLAS RECORDING ARTISTS</span>
            <span className="display line" style={{ fontWeight: "100" }}>OF THE LAST <span className="num">25</span> YEARS</span>
          </h1>
          <div className="hero__sub" style={{ fontWeight: "100" }}>A Love Letter to People in Our Ears</div>
        </div>

        <div className="hero__byline">
          <PlayButton size="sm" pulse onClick={() => onVideo({ kicker: "Watch the film", title: "The 25 Most Influential", video: F.heroVideo })} label="Play feature film" />
          <p>{F.byline}</p>
        </div>
        <p style={{ marginTop: "10px", marginBottom: 0, fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5 }}>Photo Illustrations by Mike Marshall</p>
      </div>

      <HeroPhoto />

      <div className="scrollcue">
        <span>Begin the countdown</span>
        <span>&darr;</span>
      </div>
    </header>);

}

/* ----------------------------------------------------------------- Divider */
function Divider({ kicker, title, body, ghost, className }) {
  return (
    <section className={"divider " + (className || "sec-orange")}>
      {ghost ? <div className="divider__ghost" aria-hidden="true">{ghost}</div> : null}
      <div className="kicker reveal" style={{ fontSize: "14px" }}>{kicker}</div>
      <h2 className="reveal d1" style={{ fontWeight: "200", letterSpacing: "1.5px" }}>{title}</h2>
      {body ? <p className="reveal d2">{body}</p> : null}
    </section>);

}

/* -------------------------------------------------------------- IntroEssay */
function IntroEssay({ onVideo }) {
  const I = window.INTRO;
  return (
    <section className="intro" id="intro">
      <div className="intro__wrap">
        <div className="intro__head reveal">
          <h2>Why does it matter where music comes from?</h2>
        </div>
        <div className="intro__body reveal d1">
          {I.body.map((p, i) => <p key={i}>{p}</p>)}
          <div className="intro__sig">&mdash; {I.byline}</div>
        </div>
      </div>
    </section>);

}

/* ------------------------------------------------------------- Studios map */
const STUDIO_LATLNG = [
[33.083, -97.302], // Electric Barryland — Justin
[32.725, -97.323], // Niles City Sound — Fort Worth
[33.121, -97.177], // The Echo Lab — Argyle
[32.782, -96.797], // Legacy Music Group — Dallas (Main St)
[32.960, -96.820], // Luminous Sound — Addison / Dallas Pkwy
[32.953, -96.890], // Empire Sound — Carrollton
[32.843, -96.723], // Crystal Clear Sound — Don Dr
[32.823, -96.703], // The Kitchen Studios — Garland Rd
[32.794, -96.810], // Modern Electric Sound — Dallas
[32.738, -96.833], // Furndware — W. Jefferson Blvd
[32.724, -97.318] // Alpha Omega — Fort Worth
];

function Studios() {
  const S = window.STUDIOS;
  const [sel, setSel] = useState(null);
  const [hover, setHover] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const active = sel != null ? sel : hover;

  // Initialise Leaflet map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [32.85, -97.05],
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors \u00a9 <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 18
      }
    ).addTo(map);

    S.list.forEach((studio, i) => {
      if (!STUDIO_LATLNG[i]) return;
      const marker = L.circleMarker(STUDIO_LATLNG[i], {
        radius: 7,
        fillColor: '#e9531e',
        color: '#1a0a04',
        weight: 1.5,
        fillOpacity: 1,
        interactive: true
      });
      marker.on('click', () => setSel((prev) => prev === i ? null : i));
      marker.on('mouseover', () => setHover(i));
      marker.on('mouseout', () => setHover(null));
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
    };
  }, []);

  // Sync marker styles — selected = yellow w/ orange ring
  useEffect(() => {
    markersRef.current.forEach((marker, i) => {
      const isSel = i === sel;
      const isHov = i === hover && sel === null;
      marker.setRadius(isSel ? 7 : isHov ? 9 : 7);
      marker.setStyle({
        fillColor: isSel ? '#f2c200' : '#e9531e',
        color: isSel ? '#e9531e' : '#1a0a04',
        weight: isSel ? 3 : 1.5,
        fillOpacity: 1
      });
      if (isSel || isHov) marker.bringToFront();
    });
  }, [sel, hover]);

  // Fly to selection
  useEffect(() => {


















    // no zoom on selection — view stays fixed unless user resets
  }, [sel]);return <section className="studiomap" id="studios">
      <div className="studiomap__head">
        <div className="kicker reveal">Where the Sound Comes From</div>
        <h2 className="reveal d1">The Studios of North Texas</h2>
        <p className="reveal d2">{S.intro}</p>
      </div>
      <div className="studiomap__grid">
        <div className="studiomap__mapwrap">
          <div ref={mapRef} className="studiomap__leaflet" />
          <button className="studiomap__reset" onClick={() => {setSel(null);setHover(null);if (mapInstanceRef.current) mapInstanceRef.current.flyTo([32.85, -97.05], 10, { duration: 0.8 });}}>
            Reset View
          </button>
        </div>
        <div className="studiomap__list">
          {S.list.map((st, i) => <button key={i} className={"studiomap__item" + (active === i ? " on" : "")} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setSel(i)}>
              <span className="kicker loc">{st.location}</span>
              <div className="studiomap__name">{st.name}</div>
              <div className="studiomap__sub">{st.artists}</div>
            </button>)}
        </div>
      </div>
    </section>;}

/* ------------------------------------------------------------------ Judges */
function Judges({ onVideo }) {
  const J = window.JUDGES;
  return (
    <section className="judges sec-orange" id="judges">
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto" }}>
        <div className="intro__head reveal" style={{ marginBottom: 8 }}>
          <h2 className="display" style={{ fontSize: "clamp(40px,7vw,104px)", margin: 0, lineHeight: 0.86, textTransform: "uppercase" }}>
            Meet Our Judges &amp; Writers
          </h2>
        </div>
        <div className="judges__grid">
          {J.map((j, i) =>
          <div className="judge reveal" key={i}>
              <div className="on-dark">
                <img src={j.photo || "uploads/judge-" + i + ".webp"} alt={j.first + " " + j.last} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div className="judge__name" style={{ fontSize: "36px" }}>
                {j.first} <b>{j.last}</b>
              </div>
              <div className="judge__rule" />
              <p className="judge__bio">{j.bio}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ------------------------------------------------------------------- Footer */
const PLAYLIST = [
{ song: "On & On", artist: "Erykah Badu" },
{ song: "Coming Home", artist: "Leon Bridges" },
{ song: "Possum Kingdom", artist: "Toadies" },
{ song: "Don’t Know Why", artist: "Norah Jones" },
{ song: "Stomp", artist: "Kirk Franklin & God’s Property" },
{ song: "The Boys of Summer", artist: "Don Henley" }];


function Footer() {
  return (
    <footer className="foot">
      <div className="foot__ghost" aria-hidden="true">25</div>
      <div className="foot__inner">
        <div className="playlist" id="playlist">
          <div className="playlist__head">
            <div>
              <div className="kicker">Listen Along</div>
              <h3>The Companion Playlist</h3>
            </div>
          </div>
          {PLAYLIST.map((tr, i) =>
          <div className="playlist__track" key={i}>
              <span className="playlist__num">{i + 1}</span>
              <div className="playlist__meta">
                <div className="playlist__song">{tr.song}</div>
                <div className="playlist__artist">{tr.artist}</div>
              </div>
              {i === 0 ? <div className="playlist__bars"><i /><i /><i /><i /></div> : null}
            </div>
          )}
          <p className="playlist__note">Placeholder — a full 25-track playlist (Spotify / Apple Music) drops in here.</p>
        </div>
        <div className="display">People in<br />Our Ears</div>
        <p>The 25 Most Influential Dallas Recording Artists of the Last 25 Years from the July 2026 Issue of D Magazine. Words by Mike Marshall, Bethany Erickson, Jeff “Skin” Wade, Pete Freedman, Bobby Sessions, Chris Holt, Josh Campbell, Kevin Turner, and Jason Janik.




        </p>
        <button className="foot__top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span>&uarr;</span> Back to the top
        </button>
      </div>
    </footer>);

}

/* ----------------------------------------------------------------- TopBar */
function TopBar({ current, total, onOpenContents }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={"topbar" + (show ? " show" : "")}>
      <div className="topbar__title" style={{ fontWeight: "100", letterSpacing: "1.5px" }}>THE <b style={{ fontWeight: "100", letterSpacing: "1.5px" }}>25</b> &middot; Most Influential Dallas Recording Artists</div>
      <div className="topbar__right">
        <span className="topbar__progress">{current ? "No. " + current + " / " + total : "Read the essay"}</span>
        <button className="btn-contents" onClick={onOpenContents}>
          <span className="bars"><i /><i /><i /></span> Contents
        </button>
      </div>
    </div>);

}

/* ------------------------------------------------------------- ScrollProg */
function ScrollProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setW(h > 0 ? window.scrollY / h * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scrollprog" style={{ width: w + "%" }} />;
}

/* ------------------------------------------------------------- Contents */
function Contents({ open, onClose, artists }) {
  const jump = (id) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 10, behavior: "smooth" });
    }, 180);
  };
  return (
    <div className={"contents" + (open ? " open" : "")}>
      <div className="contents__head">
        <div className="contents__head-title">
          <div className="display">The Countdown</div>
        </div>
        <div className="contents__head-right">
        <div className="contents__nl">
            <div className="contents__nl-eyebrow">
              <span className="contents__nl-kicker">Things To Do</span>
              <span className="contents__nl-pitch">DFW’s best events, every Thursday.</span>
            </div>
            <div className="contents__nl-form">
              <HubSpotForm
                inputClass="contents__nl-input"
                btnClass="contents__nl-btn"
                inputPlaceholder="Enter your email"
                btnLabel="Subscribe →" />
              
            </div>
          </div>
        </div>
        <button className="contents__close" onClick={onClose} aria-label="Close contents">&times;</button>
      </div>
      <div className="contents__seclabel">Sections</div>
      <div className="contents__sections">
        <button className="contents__seclink" onClick={() => jump("studios")}>Studios Map</button>
        <button className="contents__seclink" onClick={() => jump("judges")}>The Judges</button>
        <button className="contents__seclink" onClick={() => jump("playlist")}>Playlist</button>
        <a className="contents__seclink" href="https://www.dmagazine.com/arts-entertainment/2026/07/rising-dallas-musicians" target="_blank" rel="noreferrer">Who's Next? ↗</a>
        <a className="contents__seclink" href="https://www.dmagazine.com/assets/forms/peoples-choice-dallas-top-5-influential-music-artists/" target="_blank" rel="noreferrer">Show Us Your List ↗</a>
        <a className="contents__seclink" href="https://www.dmagazine.com/guides/dallas-concert-event-calendar/" target="_blank" rel="noreferrer">Concert Calendar ↗</a>
        <a className="contents__seclink" href="https://www.dmagazine.com/interactive/best-music-venues/" target="_blank" rel="noreferrer">Best Venues Voting ↗</a>
      </div>
      <div className="contents__seclabel">The 25, Ranked</div>
      <div className="contents__list">
        {artists.map((a) =>
        <a className="contents__item" key={a.rank} onClick={() => jump("artist-" + a.rank)}>
            <span className="r">{a.rank}</span>
            <span className="n">{a.name}</span>
            <span className="g">{a.genre}</span>
          </a>
        )}
      </div>
    </div>);

}

/* --------------------------------------------------------- MissEllieHorizontal */

function MissEllieHorizontal({ rank }) {
  React.useEffect(() => {
    if (window.googletag && window.googletag.apiReady) {
      window.googletag.display(`ad-slot-${rank}`);
    }
  }, [rank]);

  return (
    <div style={{ textAlign: "center", padding: "20px 0", background: "#fff" }} className="c-advertisement">
      <span className="o-eyebrow" style={{ fontSize: "14px", display: "block", paddingBottom: "10px" }}>Advertisement</span>
      <div className="c-advertisement__ad">
        <div
          id={`ad-slot-${rank}`}
          className="adunit"
          data-adunit="MissEllie_horizontal"
          data-mapping="mapping_horizontal">
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- HubSpotForm */
function HubSpotForm({ inputClass, btnClass, inputPlaceholder, btnLabel, wrapClass }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState(null); // null | 'sending' | 'ok' | 'err'

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      const res = await fetch(
        "https://api.hsforms.com/submissions/v3/integration/submit/477347/ba8642ce-a868-463d-8d20-c30e91cc5bee",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: [{ objectTypeId: "0-1", name: "email", value: email }],
            context: { pageUri: window.location.href, pageName: document.title }
          })
        }
      );
      setStatus(res.ok ? "ok" : "err");
    } catch (_) {
      setStatus("err");
    }
  };

  if (status === "ok") return <p style={{ margin: 0, fontFamily: "var(--sans)", fontSize: "13px", opacity: 0.8 }}>Thanks! You're subscribed.</p>;
  if (status === "err") return <p style={{ margin: 0, fontFamily: "var(--sans)", fontSize: "13px", color: "#e9531e" }}>Something went wrong — please try again.</p>;

  return (
    <form onSubmit={submit} className={wrapClass || ""} style={{ display: "contents" }}>
      <input
        className={inputClass}
        type="email"
        placeholder={inputPlaceholder || "Your email address"}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required />
      
      <button className={btnClass} type="submit" disabled={status === "sending"}>
        {status === "sending" ? "…" : btnLabel || "Subscribe"}
      </button>
    </form>);

}

/* --------------------------------------------------------- NewsletterSignup */
function NewsletterSignup() {
  return (
    <section className="newsletter" id="newsletter-signup">
      <div className="newsletter__inner">
        <div className="newsletter__text">
          <div className="kicker">Things To Do</div>
          <h3 className="newsletter__title" style={{ fontFamily: 'var(--display)', fontWeight: "200", fontSize: "clamp(34px, 5.2vw, 76px)", lineHeight: "0.9", textTransform: "uppercase" }}>STAY IN THE LOOP</h3>
          <p className="newsletter__body">Every week our editors hand-pick the best concerts and events happening across Dallas–Fort Worth.</p>
        </div>
        <div className="newsletter__form">
          <HubSpotForm
            inputClass="newsletter__input"
            btnClass="newsletter__btn"
            inputPlaceholder="Your email address"
            btnLabel="Subscribe"
            wrapClass="newsletter__placeholder" />
          
          <p className="newsletter__fine">By subscribing you agree to our privacy policy. Unsubscribe any time.</p>
        </div>
      </div>
    </section>);

}

/* --------------------------------------------------------------- VideoModal */
function VideoModal({ data, onClose }) {
  const open = !!data;
  useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const renderStage = () => {
    if (!data) return null;
    const v = data.video;
    if (!v) {
      return (
        <div className="modal__placeholder">
          <div className="display">&#9654;</div>
          <p>
            Video slot ready. Send a clip or a YouTube link and it drops in here.
            In <code>data.js</code>, set the entry&rsquo;s <code>video</code> to a YouTube ID
            or an <code>.mp4</code> path.
          </p>
        </div>);

    }
    if (/^[0-9a-f]{32}$/.test(v)) {
      return <iframe src={"https://iframe.cloudflarestream.com/" + v + "?autoplay=true"} title={data.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen style={{ border: "none" }} />;
    }
    if (/^[\w-]{6,15}$/.test(v)) {
      return <iframe src={"https://www.youtube.com/embed/" + v + "?autoplay=1&rel=0"} title={data.title} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />;
    }
    return <video src={v} controls autoPlay playsInline />;
  };

  return (
    <div className={"modal" + (open ? " open" : "")} onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <div className="kicker">{data ? data.kicker : ""}</div>
            <h3>{data ? data.title : ""}</h3>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close video">&times;</button>
        </div>
        <div className="modal__stage">{renderStage()}</div>
      </div>
    </div>);

}

Object.assign(window, {
  PlayButton, Hero, HeroPhoto, Divider, IntroEssay, Studios, Judges,
  Footer, TopBar, ScrollProgress, Contents, VideoModal, NewsletterSignup,
  MissEllieHorizontal
});