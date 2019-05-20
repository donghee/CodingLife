const puppeteer = require('puppeteer');

async function getBiddingInfo(page, frame) {
  let biddingInfo = [];
  await frame.evaluate((page) => window.gotoPage(page, 'VIEW'), page);
  await frame.waitFor(3000);

  const biddingCount =  await frame.evaluate(async () => {
      let biddingCount = document.querySelectorAll('#table01 > tbody> tr').length;
      return biddingCount - 1;
  });

  for (let i = 0; i < biddingCount; i++) {
    const biddingTitle = await frame.$eval('#table01 > tbody >'
                                           + ` tr:nth-child(${i+2}) >`
                                           + ' td:nth-child(3)',
                                           element =>
                                           element.textContent.replace( /\s\s+/g, ' ' ));

    const startBidding = await frame.$eval('#table01 > tbody >'
                                           + ` tr:nth-child(${i+2}) >`
                                           + ' td:nth-child(5)',
                                           element =>
                                           element.textContent.trim());

    const endBidding = await frame.$eval('#table01 > tbody >'
                                         + ` tr:nth-child(${i+2}) >`
                                         + ' td:nth-child(6)',
                                         element =>
                                         element.textContent.trim());
    console.log(biddingTitle, startBidding, endBidding);
    biddingInfo.push({title:biddingTitle, startDate:startBidding, endDate:endBidding})
  }
  return biddingInfo;
};

async function getBiddingInfos() {
puppeteer.launch({headless: true, devtools: false, args: ['--no-sandbox', '--disable-setuid-sandbox']}).then(async browser => {
  const page = await browser.newPage();
  await page.emulate({
        'viewport': {
          'width': 1400,
          'height': 1000,
          'isMobile': false
        },
        'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
  })
  await page.goto('https://ebid.etri.re.kr/ebid/index.do', {waitUntil: 'networkidle2'});
  await page.waitFor(3000);

  await page.click('#header > div > ul > li:nth-child(1) > a');

  await page.waitFor(3000);

  const frame = await page.frames().find(frame => frame.name() ===
                                         'home_frm_right');

  await frame.evaluate(() => window.gotoPage(1, 'VIEW'));
  await frame.waitFor(3000);

  const firstPages =  await frame.evaluate(async () => {
      const pageCount = document.querySelectorAll('#divBody > form >'
                                                + ' table > tbody >'
                                                + ' tr:nth-child(2) >'
                                                + ' td > table >'
                                                + ' tbody > tr > td >'
                                                + ' div > span > table'
                                                + ' > tbody > tr >'
                                                + ' td > a').length;
      return pageCount;
    });

  await frame.evaluate(() => window.gotoPage(11, 'NEXT'));
  await frame.waitFor(3000);

  const nextPages =  await frame.evaluate(async () => {
      const pageCount = document.querySelectorAll('#divBody > form >'
                                                + ' table > tbody >'
                                                + ' tr:nth-child(2) >'
                                                + ' td > table >'
                                                + ' tbody > tr > td >'
                                                + ' div > span > table'
                                                + ' > tbody > tr >'
                                                + ' td > a').length;
      return pageCount+1;
    });


  console.log(firstPages);
  console.log(nextPages);

  let biddingInfos = [];
  try {
    for (let i=1; i <= firstPages+nextPages; i++) {
      biddingInfos = biddingInfos.concat(await getBiddingInfo(i, frame));
      console.log('.');
    }
  } catch (error) {
    console.log(error);
  }

  await browser.close();

  return biddingInfos;
}).then(async (biddingInfos) => {
  //console.log(biddingInfos);

  let subject = '[BIDDING] ETRI 입찰 목록 '+ new Date().toLocaleDateString().replace(/T/, ' ').replace(/\..+/, '').substr(0, 10)
  let body = 'https://ebid.etri.re.kr/ebid/index.do \n';
  biddingInfos.forEach(function(info) {
     body += `${info.title} ${info.startDate} ${info.endDate} \n`;
  });

  console.log(body);
  const mail = require('./send-mail');
  await mail.sendMail('dongheepark@gmail.com, donghee@subak.io, designersfinger@gmail.com', subject, body).catch(console.error);
});

}

getBiddingInfos();
