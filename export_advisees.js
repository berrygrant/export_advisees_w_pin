javascript:(function(){
      function stripEmail(s){
        var m=/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.exec(s||'');
        return m?m[0]:s;
      }

      function mapCollege(code){
        if(code === 'AR') return 'Arts';
        if(code === 'SC') return 'Sciences';
        if(code === 'GR') return 'Graduate';        
        return code || '';
      }

      function cleanRows(rows){
        return rows.map(function(r){
          var primary = (r.SGRADVR_ADVR_CODE === 'ACAD') ? 'YES' : 'NO';
          return {
            LAST_NAME: r.SPRIDEN_LAST_NAME || '',
            FIRST_NAME: r.SPRIDEN_FIRST_NAME || '',
            MIDDLE_NAME: r.SPRIDEN_MI || '',
            PREFERRED_NAME: r.PREF_NAME || '',
            EMAIL: stripEmail(r.EMAIL || ''),
            MAJOR: r.MAJR || '',
            PIN: r.SPRAPIN_PIN || '',
            REG_BEGIN_DATE: r.REG_BEGIN_DATE || '',
            REG_BEGIN_TIME: r.REG_BEGIN_TIME || '',
            COLLEGE: mapCollege(r.COLL),
            PRIMARY: primary
          };
        });
      }

      function toTSV(rows){
        if(!rows.length) return '';
        const headers = Object.keys(rows[0]);
        const lines = [headers.join('\t')];
        rows.forEach(r => {
          lines.push(headers.map(h => (r[h] || '').toString().replace(/\t|\n/g,' ')).join('\t'));
        });
        return lines.join('\n');
      }

      const entries = performance.getEntriesByType('resource').map(e => e.name).filter(u => u.includes('VUAdviseeListWithPinsSGRADVR'));
      if(!entries.length){
        alert('Could not find the advisee data request. Please select a term and choose Show 100 so the table loads.');
        return;
      }

      const apiUrl = entries[entries.length - 1];
      fetch(apiUrl)
        .then(r => r.json())
        .then(data => {
          let rows = Array.isArray(data) ? data : (data.items || data.data || data.rows || []);
          let cleaned = cleanRows(rows);
          if(!cleaned.length){
            alert('No advisees found. Make sure the advisee list is visible.');
            return;
          }
          let tsv = toTSV(cleaned);
          let blob = new Blob([tsv], { type: 'text/tab-separated-values' });
          let a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'my_advisees_w_pin.txt';
          a.click();
        })
        .catch(err => alert('Error fetching advisees: ' + err));
    })();