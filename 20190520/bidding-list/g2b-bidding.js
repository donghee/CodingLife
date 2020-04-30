const puppeteer = require('puppeteer');

async function getBiddingInfo(page, frame) {
  let biddingInfo = [];
// const biddingCount =  10;

  const biddingCount =  await frame.evaluate(async () => {
    let biddingCount = document.querySelectorAll('#resultForm > div.results > table > tbody> tr').length;
    return biddingCount;
  });

  for (let i = 1; i < biddingCount+1; i++) {
    const biddingNumber = await frame.$eval('#resultForm > div.results > table > tbody >'
                                           + ` tr:nth-child(${i}) >`
                                           + ' td:nth-child(2)',
                                           element =>
                                           element.textContent.replace( /\s\s+/g, ' ' ));

 
    const biddingTitle = await frame.$eval('#resultForm > div.results > table > tbody >'
                                           + ` tr:nth-child(${i}) >`
                                           + ' td:nth-child(4)',
                                           element =>
                                           element.textContent.replace( /\s\s+/g, ' ' ));

    const startBidding = await frame.$eval('#resultForm > div.results > table > tbody >'
                                           + ` tr:nth-child(${i}) >`
                                           + ' td:nth-child(8) > div',
                                           element =>
                                           element.innerText.split('\n')[0]);

    const endBidding = await frame.$eval('#resultForm > div.results > table > tbody >'
                                         + ` tr:nth-child(${i}) >`
                                         + ' td:nth-child(8) > div > span',
                                         element =>
                                         element.textContent.trim());

    await frame.$eval('#resultForm > div.results > table > tbody >'
                      + ` tr:nth-child(${i}) >`
                      + ' td:nth-child(2) > div > a',
                      element =>
                      element.click());
    await frame.waitFor(2000);

  let estimatedPrice = '-원(미정)';
  try {
    const estimatedPriceElement = await frame.$x('//div[../../th/p="추정가격"]');
    estimatedPrice = await frame.evaluate(div => div.textContent.trim(), estimatedPriceElement[0]);
  } catch (error) {
    console.log(error);
    try {
      console.log('배정예산');
      const estimatedPriceElement = await frame.$x('//div[../../th/p="배정예산"]');
      estimatedPrice = await frame.evaluate(div => '배정:' + div.textContent.trim(), estimatedPriceElement[0]);
    } catch (e) {
    }
  }

    // go back
    await frame.evaluate(async () => window.history.back(1));
    await frame.waitFor(2000);

    console.log(biddingNumber, biddingTitle, estimatedPrice, startBidding, endBidding);
    biddingInfo.push({number: biddingNumber, title:biddingTitle, price:estimatedPrice, startDate:startBidding, endDate:endBidding})
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
  await page.goto('http://www.g2b.go.kr/pt/menu/selectSubFrame.do?framesrc=/pt/menu/frameTgong.do?url=http://www.g2b.go.kr:8101/ep/tbid/tbidList.do?taskClCds=&bidNm=%B5%E5%B7%D0&searchDtType=1&fromBidDt=2020/03/31&toBidDt=2020/04/30&fromOpenBidDt=&toOpenBidDt=&radOrgan=1&instNm=&area=&regYn=Y&bidSearchType=1&searchType=1', {waitUntil: 'networkidle2'});
  await page.waitFor(3000);

  const frame = await page.frames().find(frame => frame.name() === 'main');
  await frame.waitFor(2000);

  let biddingInfos = [];
  try {
// get latest 5 pages
    for (let i=1; i <= 5; i++) {
      biddingInfos = biddingInfos.concat(await getBiddingInfo(i, frame));
      await frame.evaluate(() => window.to_more(1));
      await frame.waitFor(5000);
    }
  } catch (error) {
    console.log(error);
  }

  await browser.close();

  return biddingInfos;
}).then(async (biddingInfos) => {

  let subject = '[BIDDING] 나라장터 입찰 목록 '+ new Date().toLocaleDateString().replace(/T/, ' ').replace(/\..+/, '').substr(0, 10)
  let body = '';
  biddingInfos.forEach(function(info) {
     body += `${info.number} ${info.title} ${info.price} ${info.startDate} ${info.endDate} \n`;
  });

  console.log(body);
  const mail = require('./send-mail');
  await mail.sendMail('dongheepark@gmail.com, donghee@subak.io, designersfinger@gmail.com', subject, body).catch(console.error);
});
}

getBiddingInfos();
