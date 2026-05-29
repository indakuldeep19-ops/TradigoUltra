/**
 * Tradigo Ultra Backend (Google Sheets API)
 * Tabs Required: Users, Wallets, Trades, Signals, Rooms, Buddies, News, Leaderboard, Reels
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  switch(action) {
    case 'signup': return handleSignup(data);
    case 'login': return handleLogin(data);
    case 'executeTrade': return handleTrade(data);
    case 'deposit': return handleDeposit(data);
    case 'getDashboard': return getDashboard(data);
    case 'buddyAction': return handleBuddy(data);
    default: return response({success: false, message: 'Invalid Action'});
  }
}

function handleSignup(d) {
  const sheet = SS.getSheetByName('Users');
  const uid = Utilities.getUuid();
  const passwordHash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, d.password));
  
  sheet.appendRow([uid, d.email, passwordHash, d.fullName, 'basic', d.currency || 'USD', new Date()]);
  SS.getSheetByName('Wallets').appendRow([uid, 1000, 0, 0, 0]); // Default 1000 USD Demo
  
  return response({success: true, uid: uid});
}

function handleTrade(d) {
  const walletSheet = SS.getSheetByName('Wallets');
  const tradeSheet = SS.getSheetByName('Trades');
  const users = SS.getSheetByName('Users').getDataRange().getValues();
  
  let commissionRate = 0.055; // 5.5%
  const user = users.find(r => r[0] === d.uid);
  if (user && user[4] === 'premium') commissionRate = 0.02;
  if (d.isBuddyTrade) commissionRate = 0.03;

  const totalCost = d.amount + (d.amount * commissionRate);
  // Logic to check balance and update Wallet sheet here...
  
  tradeSheet.appendRow([Utilities.getUuid(), d.uid, d.symbol, d.type, d.amount, commissionRate, new Date()]);
  return response({success: true, balance: 950}); // Simplified
}

function getDashboard(d) {
  const news = SS.getSheetByName('News').getDataRange().getValues().slice(1, 6);
  const signals = SS.getSheetByName('Signals').getDataRange().getValues().slice(1, 6);
  return response({success: true, news: news, signals: signals});
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// CRON JOB: Fetch News & Rates (Set a Time Trigger in GAS)
function fetchExternalData() {
  const newsRes = UrlFetchApp.fetch('https://cryptocurrency.cv/api/news');
  // Logic to parse and save to 'News' sheet...
}
