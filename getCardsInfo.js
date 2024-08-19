
const API = 'https://api2.moxfield.com/v2/decks/';
// List of endpoints
const allDecks = 'all/';
const search = 'search'

// Master sheet columns 
const ID = 1;
const MOXFIELD_ID = 14;

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Moxfield')
      .addItem('Import Cards', 'importCards')
      .addToUi();
}

function findRow(sheet, column, value) {
  const data = sheet.getDataRange().getValues();
  for(var i = 0; i<data.length;i++){
    if(data[i][column-1] === value){
      return i+1;
    }
  }
  return null;
}

function importCards(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master');
  let lastDeckId = getLastDeckId();
  let lastFetchedRow = findRow(sheet, ID, lastDeckId);
  if(!lastFetchedRow) {
    return null
  }
  lastFetchedRow++;
  let deckData = sheet.getSheetValues(lastFetchedRow, 1, 1, sheet.getLastColumn()).reduce((a, b) => { return a.concat(b) });
  while(deckData[ID - 1]){
    lastDeckId = deckData[0];
    const moxfieldId = deckData[MOXFIELD_ID - 1];
    if(moxfieldId) {
      const deck = fetchMoxfieldDeck(moxfieldId);
      if (!deck) continue;
      const commanders = deck.commanders;
      for (const value of Object.values(commanders)) {
        saveCard(moxfieldId, lastDeckId, value.card);
      }
      const mainboard = deck.mainboard;
      for (const value of Object.values(mainboard)) {
        saveCard(moxfieldId, lastDeckId, value.card);
      }
      break;
    }
    lastFetchedRow++;
    deckData = sheet.getSheetValues(lastFetchedRow, 1, 1, sheet.getLastColumn()).reduce((a, b) => { return a.concat(b) });
  }
}

function getLastDeckId(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Moxfield');
  const lastRow = sheet.getLastRow();
  const lastColunm = sheet.getLastColumn();
  return sheet.getRange(lastRow, lastColunm).getValue();
}

function getUrl(url) {
  let options = {
    'method': 'get',
    'contentType': 'application/json',
    'muteHttpExceptions': true,
  };
  let response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) return false;

  return JSON.parse(response.getContentText());
}

function fetchMoxfieldDeck(moxfieldId) {
  const url = API + allDecks + moxfieldId;
  return getUrl(url);
}

function fetchUserDecks(user) {
  const url = API + search + `?showIllegal=true&authorUserNames=${user}&pageNumber=1&pageSize=12&sortType=updated&sortDirection=descending&board=mainboard`;
  return getUrl(url);
}

function saveCard(moxfieldId, deckId, card) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Moxfield');
  sheet.appendRow([moxfieldId, card.name, card.type_line, card.mana_cost, deckId]);
}
