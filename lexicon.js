// lexicon.js - Original Languages & Lexicon Lookup Engine for Fred's Bible Reference

/**
 * Fetch Strong's Concordance and Lexicon definitions via public API
 * @param {string} strongsId - e.g. "G3056" (Greek Logos) or "H7250" (Hebrew)
 */
export async function getLexiconDefinition(strongsId) {
  if (!strongsId) return null;

  const cleanId = strongsId.trim().toUpperCase();
  const isGreek = cleanId.startsWith('G');
  
  try {
    // Open Bible / STEP Lexicon REST API endpoint
    const response = await fetch(`https://api.scripture.api.bible/v1/lexicon/${cleanId}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('Primary Lexicon API offline, falling back to local dictionary formatter:', err);
  }

  // Robust Fallback Dictionary for key biblical terms if offline/API unavailable
  return getFallbackLexiconData(cleanId);
}

/**
 * Common Strong's Fallback Lexicon Dictionary
 */
function getFallbackLexiconData(strongsId) {
  const dictionary = {
    'G3056': {
      strongs: 'G3056',
      word: 'λόγος (logos)',
      transliteration: 'logos',
      language: 'Greek',
      partOfSpeech: 'Noun, Masculine',
      definition: 'A word, speech, divine expression, or reasoning.',
      usage: 'Used of the divine Word, Jesus Christ (John 1:1), divine message, statement, discourse.'
    },
    'G26': {
      strongs: 'G26',
      word: 'ἀγάπη (agape)',
      transliteration: 'agape',
      language: 'Greek',
      partOfSpeech: 'Noun, Feminine',
      definition: 'Unconditional, benevolent, self-sacrificing love.',
      usage: 'Highest form of love; God’s divine love towards humanity and believers toward one another.'
    },
    'G4151': {
      strongs: 'G4151',
      word: 'πνεῦμα (pneuma)',
      transliteration: 'pneuma',
      language: 'Greek',
      partOfSpeech: 'Noun, Neuter',
      definition: 'Wind, breath, spirit.',
      usage: 'Refers to the Holy Spirit, human spirit, or spiritual beings.'
    },
    'H7225': {
      strongs: 'H7225',
      word: 'רֵאשִׁית (reshith)',
      transliteration: 'bere'shiyth',
      language: 'Hebrew',
      partOfSpeech: 'Noun, Feminine',
      definition: 'Beginning, chief, first fruits.',
      usage: 'Genesis 1:1 "In the beginning". First in time, place, or order.'
    },
    'H430': {
      strongs: 'H430',
      word: 'אֱלֹהִים (Elohim)',
      transliteration: 'elohim',
      language: 'Hebrew',
      partOfSpeech: 'Noun, Masculine Plural',
      definition: 'God, Supreme Deity, divine majesty.',
      usage: 'Plural form of intensity/majesty referring to the One Creator God of Israel.'
    }
  };

  return dictionary[strongsId] || {
    strongs: strongsId,
    word: 'Original Root',
    transliteration: strongsId,
    language: strongsId.startsWith('G') ? 'Greek' : 'Hebrew',
    partOfSpeech: 'Lexical Entry',
    definition: `Strong's Entry ${strongsId}`,
    usage: 'Grammatical details and usage notes available online via STEP Bible.'
  };
}