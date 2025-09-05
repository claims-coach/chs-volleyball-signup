/**
 * Cascade Bruins Volleyball — Sign‑Up Backend (Google Apps Script)
 * Stores signups in a Google Sheet; enforces single slot; emails parent, coach, and organizer.
 */
const SHEET_NAME = 'Signups';
const ORGANIZER_EMAIL = 'organizer@example.com'; // TODO: set to your email
const COACH_EMAIL = 'coach@example.com'; // TODO: set to coach email

function getSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1,1,1,8).setValues([['date_id','label','name','email','phone','notes','timestamp','source']]);
  }
  return sh;
}

function buildListing_() {
  const sh = getSheet_();
  const rows = sh.getDataRange().getValues();
  const listing = {};
  for (let i=1; i<rows.length; i++) {
    const [id,label,name,email,phone,notes,ts] = rows[i];
    if (id) listing[id] = { name, email, phone, notes, ts };
  }
  return listing;
}

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const action = (params.action || '').toLowerCase();
  try { console.log('doGet params:', JSON.stringify(params)); } catch(_){ }
  if (action === 'list') {
    const listing = buildListing_();
    try { console.log('doGet action=list, items:', Object.keys(listing).length); } catch(_){ }
    return ContentService.createTextOutput(JSON.stringify(listing))
      .setMimeType(ContentService.MimeType.JSON);
  }
  try { console.log('doGet default'); } catch(_){ }
  return ContentService.createTextOutput(JSON.stringify({ok:true, hint:'Use ?action=list'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    try { console.log('doPost raw length:', e && e.postData && e.postData.contents ? String(e.postData.contents).length : 0); } catch(_){ }
    const body = (e && e.postData && e.postData.contents) ? JSON.parse(e.postData.contents) : {};
    const { id, name, email, phone, notes } = body;
    try { console.log('doPost body:', JSON.stringify({ id, name, email, phone, notesLen: (notes||'').length })); } catch(_){ }
    if (!id || !name || !email) throw new Error('Missing required fields');

    const lock = LockService.getScriptLock();
    lock.tryLock(30000);

    const sh = getSheet_();
    const data = sh.getDataRange().getValues();
    for (let i=1; i<data.length; i++) {
      if (data[i][0] === id) { lock.releaseLock(); return json_({ ok:false, error:'That date is already taken.' }); }
    }
    sh.appendRow([id,id,name,email,phone || '',notes,new Date(),'webapp']);
    try { console.log('doPost appended row for id:', id); } catch(_){ }

    try {
      
      const subject = `Cascade Bruins Volleyball: ${name} confirmed for ${id}`;
      const html = `
        <p>Thanks, ${safe_(name)} — you're confirmed for <b>${safe_(id)}</b>.</p>
        <p>Email: ${safe_(email)}</p>
        ${phone ? `<p>Phone: ${safe_(phone)}</p>` : ''}
        ${notes ? `<p>Notes: ${safe_(notes)}</p>` : ''}
        <p><b>Note on drinks:</b> Drinks are <i>not required</i>. If you choose to bring them, please stick to <b>water or sports drinks</b> — <b>no energy drinks or caffeinated beverages</b>.</p>
        
        <p><em>Reminder:</em> Drinks are not required. If you do bring them, please stick to <strong>water or sports drinks</strong> — no energy drinks or caffeinated beverages.</p>
        <p>Go Bruins!</p>`;
      const recipients = [email, COACH_EMAIL, ORGANIZER_EMAIL].filter(Boolean).join(',');
      try { console.log('doPost recipients:', recipients); } catch(_){ }
      MailApp.sendEmail({ to: recipients, subject, htmlBody: html });
    } catch(errMail){ try { console.error(errMail); } catch(_){ } }

    lock.releaseLock();
    return json_({ ok:true });
  } catch (err) {
    try { console.error(err); } catch(_){ }
    try { LockService.getScriptLock().releaseLock(); } catch(_){ }
    return json_({ ok:false, error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function safe_(s){ return String(s||'').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])); }
