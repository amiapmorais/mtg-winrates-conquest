function testFetchInvalidDeck() {
    const invalidId = 'WHTnMxR_Mk2F8PBXSLVrQw';
    const deckIds = [invalidId];
    const decks  = fetchPlayerDecks('amiaram').data;
    decks.forEach((deck) =>{
      deckIds.push(deck.publicId);
    });
    while(deckIds.length > 0) {
      const deck = fetchMoxfieldDeck(deckIds.pop());
      if(!deck) continue;
      console.log(deck.name);
    }
  }