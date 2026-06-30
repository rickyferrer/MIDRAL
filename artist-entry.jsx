/* global React, PlayButton */
const { useState, useCallback } = React;

function ArtistEntry({ artist, side, featured, onVideo }) {
  const a = artist;
  const [copied, setCopied] = useState(false);
  const right = side === "right";
  const cls = [
  "entry",
  featured ? "entry--featured" : right ? "entry--right" : "entry--left"].
  join(" ");

  const initials = a.name.replace(/^The\s+/i, "").trim();

  const copyLink = useCallback(() => {
    const url = window.location.href.split("#")[0] + "#artist-" + a.rank;
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(fallback);
    } else {
      fallback();
    }
  }, [a.rank]);

  return (
    <section className={cls} id={"artist-" + a.rank} data-rank={a.rank}>
      {featured ?
      <div className="entry__bigname" aria-hidden="true">{initials}</div> :
      null}
      <div className="entry__inner">
        <div className="entry__media reveal">
          <div className={"entry__media-img" + (featured ? " on-dark" : "")} style={{ position: "relative" }}>
            {a.photo ?
            <img src={a.photo} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> :
            <div style={{ width: "100%", height: "100%", background: "rgba(26,10,4,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.3 }}>Photo coming soon</span>
            </div>}
            {a.hasVideo ?
            <PlayButton
              pulse
              onClick={() => onVideo({ kicker: "Watch \u00b7 No. " + a.rank, title: a.name, video: a.video })}
              label={"Play " + a.name + " video"} /> :
            null}
          </div>

        </div>

        <div className="entry__text">
          <div className="reveal">
            <div className="entry__rank">{a.rank}</div>
            <div className="entry__name-row">
              <h2 className="entry__name" style={{ fontWeight: "200" }}>{a.name}</h2>
              <button className={"entry__copylink" + (copied ? " copied" : "")} onClick={copyLink} aria-label={"Copy link to " + a.name}>
                {copied ?
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> :
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5a3.536 3.536 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5L7.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9.5 6.5a3.536 3.536 0 0 0-5 0l-2 2a3.536 3.536 0 0 0 5 5L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                <span className="entry__copylink-tooltip">{copied ? "Copied!" : "Copy link"}</span>
              </button>
            </div>
          </div>
          <div className="entry__meta reveal d1">
            <span className="tag solid">{a.genre}</span>
            <span className="tag">{a.place}</span>
            <span className="tag">{a.era}</span>
          </div>
          <div className="entry__body reveal d2">
            {a.body.map((p, i) => <p key={i}>{p}</p>)}
            <span className="entry__writer">{a.writer}</span>
          </div>
        </div>
      </div>
    </section>);

}

window.ArtistEntry = ArtistEntry;