# Project Memory — D Magazine Interactive Features

## Ad Integration Pattern (Google Publisher Tag / DFP)

Used to insert Miss Ellie Howard horizontal ads (970×250) between artist entries.

### 1. Load GPT in `<head>` of index.html — BEFORE any other scripts

```html
<!-- Load GPT library first -->
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>

<script>
  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function() {
    // Define one slot per ad placement — each needs a unique div id
    googletag.defineSlot('/23334079222/MissEllie_horizontal', [970, 250], 'ad-slot-5').addService(googletag.pubads());
    googletag.defineSlot('/23334079222/MissEllie_horizontal', [970, 250], 'ad-slot-10').addService(googletag.pubads());
    googletag.defineSlot('/23334079222/MissEllie_horizontal', [970, 250], 'ad-slot-15').addService(googletag.pubads());
    googletag.defineSlot('/23334079222/MissEllie_horizontal', [970, 250], 'ad-slot-20').addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();

    // Display all slots upfront (SRA mode)
    googletag.display('ad-slot-5');
    googletag.display('ad-slot-10');
    googletag.display('ad-slot-15');
    googletag.display('ad-slot-20');
  });
</script>
```

### 2. React component for the ad unit (in sections.jsx)

```jsx
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
```

### 3. Insert ads in the artist list (in app.jsx)

Place after specific ranked entries — here at ranks 5, 10, 15, 20:

```jsx
{list.map((a) => (
  <React.Fragment key={a.rank}>
    <ArtistEntry artist={a} side={side} featured={featured} onVideo={openVideo} />
    {a.rank === 3 && <NewsletterSignup />}
    {[5, 10, 15, 20].includes(a.rank) && <MissEllieHorizontal rank={a.rank} />}
  </React.Fragment>
))}
```

### Key notes
- Network path: `/23334079222/MissEllie_horizontal`
- Ad size: `[970, 250]`
- Each slot needs a **unique div id** (e.g. `ad-slot-5`, `ad-slot-10`)
- Use `enableSingleRequest()` so all slots fire in one network call
- The `React.useEffect` call to `googletag.display()` inside the component is a safety net in case the slot wasn't displayed upfront; it's mostly redundant with the head script but harmless

---

## HubSpot Newsletter Form Pattern

Used in the Contents overlay and inline newsletter section.

### Form component (in sections.jsx)

```jsx
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

  if (status === "ok") return <p style={{ margin: 0 }}>Thanks! You're subscribed.</p>;
  if (status === "err") return <p style={{ margin: 0, color: "#e9531e" }}>Something went wrong — please try again.</p>;

  return (
    <form onSubmit={submit} className={wrapClass || ""} style={{ display: "contents" }}>
      <input className={inputClass} type="email" placeholder={inputPlaceholder || "Your email address"}
        value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button className={btnClass} type="submit" disabled={status === "sending"}>
        {status === "sending" ? "…" : btnLabel || "Subscribe"}
      </button>
    </form>
  );
}
```

### HubSpot credentials
- **Portal ID:** `477347`
- **Form GUID:** `ba8642ce-a868-463d-8d20-c30e91cc5bee`
- **Newsletter:** Things To Do (DFW events, weekly)
