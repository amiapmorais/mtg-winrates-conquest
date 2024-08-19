const API = 'https://api2.moxfield.com/v2/decks/all/';

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

function fetchMoxfieldDeck(moxfieldId) {
  const url = API + moxfieldId
  var options = {
    'method': 'get',
    'contentType': 'application/json',
  };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

function saveCard(moxfieldId, deckId, card) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Moxfield');
  sheet.appendRow([moxfieldId, card.name, card.type_line, card.mana_cost, deckId]);
}
