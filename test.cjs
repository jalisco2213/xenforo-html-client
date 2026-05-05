require('dotenv').config();
const xenforo = require('xenforo-html-client');

xenforo.configure({ baseUrl: process.env.XENFORO_BASE_URL });

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 OPR/86.0.4363.64';

async function main() {
    const antibot = await xenforo.bypassAntibot(userAgent);
    const antibotValue = antibot.cookie.split(';')[0];

    const cookie = antibotValue
      + '; xf_csrf=your_xf_csrf;'
      + '; xf_session=your_session;'
      + '; xf_tfa_trust=your_tfa_trust;'
      + '; xf_user=your_user;';

    console.log('All Ready!');
    console.log('Cookie:', cookie);
}

main().catch(console.error);
