module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://boy721-cloud.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_ADMIN_USER_ID;
  if (!token || !userId) return res.status(500).json({ ok:false, error:'LINE environment variables missing' });

  const body = req.body || {};
  const name = String(body.name || '').trim().slice(0,60);
  const phone = String(body.phone || '').trim().slice(0,40);
  const location = String(body.location || '').trim().slice(0,120);
  const note = String(body.note || '').trim().replace(/\\n/g, '\n').slice(0,500);
  const source = String(body.source || '洗思特加盟網站').trim().slice(0,80);

  if (!name && !phone && !location && !note) {
    return res.status(400).json({ ok:false, error:'No inquiry data' });
  }

  const text = [
    '🔔 洗思特｜新加盟詢問',
    '',
    '👤 客戶資料',
    '姓名：' + (name || '未填'),
    '電話：' + (phone || '未填'),
    '地點：' + (location || '未填'),
    '',
    '📝 客戶需求',
    note || '無',
    '',
    '🌐 來源',
    source
  ].join('\n');

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type:'text', text:text.slice(0,5000) }]
      })
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('LINE push failed', response.status, detail);
      return res.status(502).json({ ok:false, error:'LINE push failed' });
    }
    return res.status(200).json({ ok:true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok:false, error:'Server error' });
  }
};