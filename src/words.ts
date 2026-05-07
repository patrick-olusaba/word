// Easy: common, short, familiar words
export const EASY_WORDS: string[] = [
  'APPLE', 'BEACH', 'BREAD', 'CHAIR', 'CLOCK',
  'CLOUD', 'DANCE', 'DRINK', 'EARTH', 'FIELD',
  'FRUIT', 'GLASS', 'GRAPE', 'GREEN', 'HEART',
  'HOUSE', 'JUICE', 'LEMON', 'LIGHT', 'MUSIC',
  'NIGHT', 'OCEAN', 'PHONE', 'PIZZA', 'PLANT',
  'RADIO', 'RIVER', 'SHIRT', 'SHOES', 'SMILE',
  'SNAKE', 'SPACE', 'SPOON', 'STORM', 'TABLE',
  'TIGER', 'TOAST', 'TRAIN', 'TRUCK', 'VOICE',
  'WATCH', 'WATER', 'WHALE', 'WORLD', 'YOUTH',
];



// Medium: slightly less common
export const MEDIUM_WORDS: string[] = [
  'BRAIN', 'BRUSH', 'CHEST', 'CHORD', 'CLICK',
  'DIARY', 'DRIVE', 'FEAST', 'GUARD', 'PIANO',
  'PILOT', 'PLANE', 'ROBOT', 'TOUCH', 'WRITE',
  'BLAZE', 'CRISP', 'DWARF', 'FLAIR', 'GLOOM',
  'GROAN', 'HASTE', 'KNEEL', 'LODGE', 'MAPLE',
  'NERVE', 'ORBIT', 'PERCH', 'QUILT', 'RIDGE',
  'SCALP', 'SHRUG', 'SLUMP', 'SNARE', 'SPIRE',
  'STOMP', 'SWAMP', 'THORN', 'TROUT', 'VAULT',
  'WALTZ', 'WHIRL', 'WRATH', 'ZEBRA', 'ZONAL',
];

// Hard: uncommon or tricky words
export const HARD_WORDS: string[] = [
  'ABBEY', 'AXIOM', 'BLUNT', 'BYLAW', 'CHASM',
  'CINCH', 'CLEFT', 'CRYPT', 'CYNIC', 'DIRGE',
  'DROSS', 'EPOCH', 'EXPEL', 'EXTOL', 'FJORD',
  'FLECK', 'FROZE', 'GLYPH', 'GNASH', 'GRUFF',
  'GUILD', 'GUSTO', 'GYPSY', 'HAVOC', 'HELIX',
  'HIPPO', 'HOVEL', 'HYENA', 'IGLOO', 'INEPT',
  'IRONY', 'IVORY', 'JAZZY', 'JOUST', 'KNACK',
  'KNAVE', 'LYMPH', 'MAXIM', 'MELEE', 'MIRTH',
  'MOULT', 'MURKY', 'MYRRH', 'NYMPH', 'OCTET',
  'OFFAL', 'OPTIC', 'OVOID', 'OXIDE', 'PIXEL',
];

export const WORDS = [...EASY_WORDS, ...MEDIUM_WORDS, ...HARD_WORDS];
