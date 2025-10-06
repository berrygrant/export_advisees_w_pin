javascript:(function(){
  function stripEmail(s) {
    var m = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.exec(s||"");
    return m ? m[0] : s;
  }
  function formatDate(d) {
    if (!d) return "";
    // Expecting Banner’s YYYY-MM-DD or ISO string → return YYYY-MM-DD
    let m = d.match(/(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : d;
  }
  function formatTime(t) {
    if (!t) return "";
    // Expecting HHMM or HH:MM:SS → return HH:MM
    let m = t.match(/(\d{2}):?(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : t;
  }
  function cleanRows(rows) {
    return rows.map(r => ({
      LAST_NAME: r.SPRIDEN_LAST_NAME || "",
      FIRST_NAME: r.SPRIDEN_FIRST_NAME || "",
      MIDDLE_NAME: r.SPRIDEN_MI || "",
      PREFERRED_NAME: r.PREF_NAME || "",
      EMAIL: stripEmail(r.EMAIL || ""),
      MAJOR: r.MAJR || "",
      PIN: r.SPRAPIN_PIN || "",
      REG_BEGIN_DATE: formatDate(r.REG_BEGIN_DATE || ""),
      REG_BEGIN_TIME: formatTime(r.REG_BEGIN_TIME || "")
    }));
  }
  function toTSV(rows) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    return headers.join("\t") + "\n" + rows.map(r => headers.map(h => r[h]||"").join("\t")).join("\n");
  }

  // Look at recent network requests
  const entries = performance.getEntriesByType("resource")
                   .map(e=>e.name)
                   .filter(u=>u.includes("VUAdviseeListWithPinsSGRADVR"));
  if (!entries.length) {
    alert("Could not find the advisee data request. Please select a term and choose Show 100 so the table loads.");
    return;
  }
  const apiUrl = entries[entries.length-1];

  fetch(apiUrl).then(r=>r.json()).then(data=>{
    let rows = Array.isArray(data) ? data : (data.items||data.data||data.rows||[]);
    let cleaned = cleanRows(rows);
    if (!cleaned.length) {
      alert("No advisees found. Make sure the advisee list is visible.");
      return;
    }
    let tsv = toTSV(cleaned);
    let blob = new Blob([tsv], {type:"text/tab-separated-values"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "advisees_w_pin.txt";
    a.click();
  }).catch(err=>alert("Error fetching advisees: " + err));
})();