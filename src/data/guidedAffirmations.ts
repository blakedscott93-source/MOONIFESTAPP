export interface AffirmationCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string[];
  illustration: string; // Description for illustration
}

export interface GuidedAffirmationSession {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  duration: number; // in seconds (120 = 2 minutes)
  affirmationCount: number;
  locked: boolean;
  illustration: string; // Description for the card illustration
  affirmations: string[]; // List of affirmations in the session
  script?: string; // Full voiceover script (optional for now)
  introDuration?: number; // Duration of intro in seconds before affirmations start
  affirmationStartTimes?: number[]; // Start time of each affirmation in seconds
  recommendedTime?: 'morning' | 'midday' | 'evening' | 'any';
}

export const AFFIRMATION_CATEGORIES: AffirmationCategory[] = [
  {
    id: 'balance',
    name: 'Gain Balance',
    icon: 'scale',
    color: '#C7B8EA',
    gradient: ['#E8DFF5', '#C7B8EA'],
    illustration: 'Person in striped dress with flowing hair, calm pose',
  },
  {
    id: 'fulfilled',
    name: 'Feel Fulfilled',
    icon: 'heart',
    color: '#F5E6D3',
    gradient: ['#FFF8E7', '#F5E6D3'],
    illustration: 'Person in meditation pose, peaceful expression',
  },
  {
    id: 'harmony',
    name: 'Team Harmony',
    icon: 'people',
    color: '#EED3D9',
    gradient: ['#FAE9ED', '#EED3D9'],
    illustration: 'Person with headwrap holding heart, gentle smile',
  },
  {
    id: 'stress',
    name: 'Reduce Stress',
    icon: 'cloud',
    color: '#F9F3D0',
    gradient: ['#FFFCE8', '#F9F3D0'],
    illustration: 'Person with hair up, relaxing on clouds',
  },
  {
    id: 'wealth',
    name: 'Attract Wealth',
    icon: 'cash',
    color: '#FFD700',
    gradient: ['#FFF4CC', '#FFD700'],
    illustration: 'Person with confident stance, abundance energy',
  },
  {
    id: 'love',
    name: 'Attract Love',
    icon: 'rose',
    color: '#FFB6C1',
    gradient: ['#FFE4E9', '#FFB6C1'],
    illustration: 'Person with open heart, loving energy',
  },
  {
    id: 'confidence',
    name: 'Build Confidence',
    icon: 'star',
    color: '#FF6B35',
    gradient: ['#FFE0D6', '#FF6B35'],
    illustration: 'Person standing tall, powerful pose',
  },
  {
    id: 'healing',
    name: 'Emotional Healing',
    icon: 'sparkles',
    color: '#9D4EDD',
    gradient: ['#E5CFFF', '#9D4EDD'],
    illustration: 'Person with gentle energy, healing aura',
  },
];

export const GUIDED_SESSIONS: GuidedAffirmationSession[] = [
  // Gain Balance
  {
    id: 'balance-1',
    categoryId: 'balance',
    title: 'Morning Balance', // Micro Invitation
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: false,
    illustration: 'Person in striped dress',
    introDuration: 15, // Increased intro buffer
    recommendedTime: 'morning',
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141], // Slower pacing (+14s)
    affirmations: [
      'I am perfectly balanced in mind, body, and spirit',
      'I create harmony in all areas of my life',
      'I release chaos and embrace peace',
      'My life flows with ease and grace',
      'I am centered and grounded in this moment',
      'Balance comes naturally to me',
      'I prioritize what truly matters',
      'I am in control of my time and energy',
      'Peace flows through me with every breath',
      'I am balanced, calm, and whole',
    ],
  },

  // Feel Fulfilled
  {
    id: 'fulfilled-1',
    categoryId: 'fulfilled',
    title: 'Midday Fulfillment',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: false,
    illustration: 'Person in meditation',
    recommendedTime: 'midday',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I am living a life of purpose and meaning',
      'Deep fulfillment flows through every area of my life',
      'I am grateful for all that I have and all that I am',
      'My soul is nourished and satisfied',
      'I am exactly where I need to be',
      'Contentment fills my heart',
      'I celebrate my journey and my growth',
      'My life is rich with blessings',
      'I am fulfilled by the simple joys of life',
      'I radiate satisfaction and peace',
    ],
  },

  // Team Harmony
  {
    id: 'harmony-1',
    categoryId: 'harmony',
    title: 'Work Harmony',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Person with heart',
    recommendedTime: 'any',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I work in perfect harmony with my team',
      'Communication flows easily between us',
      'We support and uplift each other',
      'I am a valuable member of this team',
      'Together we achieve amazing results',
      'Respect and understanding guide our interactions',
      'I contribute my unique gifts to the collective',
      'Our team operates as one unified force',
      'I attract collaborative and positive people',
      'Harmony defines all my professional relationships',
    ],
  },

  // Reduce Stress
  {
    id: 'stress-1',
    categoryId: 'stress',
    title: 'Instant Stress Relief',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Person on clouds',
    recommendedTime: 'any',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I release all tension from my body and mind',
      'Calm washes over me like a gentle wave',
      'I breathe in peace, I breathe out stress',
      'My mind is clear and tranquil',
      'I am safe, I am supported, I am at ease',
      'Stress melts away with each passing moment',
      'I choose peace over worry',
      'My body is relaxed and my mind is still',
      'I trust that everything will work out',
      'I am calm, centered, and stress-free',
    ],
  },

  // Attract Wealth
  {
    id: 'wealth-1',
    categoryId: 'wealth',
    title: 'Wealth Magnet',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Abundant energy',
    recommendedTime: 'any',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I am a magnet for money and abundance',
      'Wealth flows to me from multiple sources',
      'I am worthy of financial prosperity',
      'Money comes to me easily and effortlessly',
      'I am open to receiving unlimited abundance',
      'My income is constantly increasing',
      'I attract lucrative opportunities',
      'Financial freedom is my birthright',
      'I am wealthy in all areas of my life',
      'Prosperity is my natural state of being',
    ],
  },

  // Attract Love
  {
    id: 'love-1',
    categoryId: 'love',
    title: 'Love Attraction',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Open heart',
    recommendedTime: 'any',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I am worthy of deep, passionate love',
      'My soulmate is being drawn to me now',
      'I radiate love and attract loving relationships',
      'I am open to giving and receiving love',
      'Love finds me wherever I go',
      'I am loved, cherished, and adored',
      'My heart is ready for true love',
      'I attract a partner who complements me perfectly',
      'Love flows freely in my life',
      'I am a magnet for healthy, loving relationships',
    ],
  },

  // Build Confidence
  {
    id: 'confidence-1',
    categoryId: 'confidence',
    title: 'Unshakeable Confidence',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Powerful stance',
    recommendedTime: 'any',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I am confident, capable, and powerful',
      'I believe in myself completely',
      'I trust my decisions and intuition',
      'I am worthy of success and respect',
      'My confidence grows stronger every day',
      'I speak my truth with courage',
      'I am unstoppable in pursuing my goals',
      'I radiate self-assurance',
      'I am proud of who I am becoming',
      'Confidence is my natural state',
    ],
  },

  // Emotional Healing (Evening/Any)
  {
    id: 'healing-1',
    categoryId: 'healing',
    title: 'Deep Emotional Healing',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Healing aura',
    recommendedTime: 'evening',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I release past hurts and embrace healing',
      'My heart is mending and growing stronger',
      'I forgive myself and others with compassion',
      'Healing energy flows through every cell',
      'I am worthy of love and peace',
      'I let go of what no longer serves me',
      'My emotional wounds are transforming into wisdom',
      'I am gentle with myself as I heal',
      'Every day I become more whole',
      'I am healed, healthy, and complete',
    ],
  },

  // --- NEW REAL AUDIO SESSIONS ---

  // Balance - Evening (balance-2)
  {
    id: 'balance-2',
    categoryId: 'balance',
    title: 'Evening Balance',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Moon reflection on water',
    recommendedTime: 'evening',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I release the day with gratitude and peace',
      'My mind is calm, clear, and balanced',
      'I am restoring my energy for tomorrow',
      'Balance is my natural state of being',
      'I let go of what I cannot control',
      'I am at peace with my journey',
      'Rest allows me to find my center',
      'I honor my need for stillness',
      'I am grounded in this present moment',
      'I drift into sleep with a balanced heart',
    ],
  },

  // Creative Flow (creative-1) - Mapped to confidence for now
  {
    id: 'creative-1',
    categoryId: 'confidence',
    title: 'Creative Flow Activation',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: false,
    illustration: 'Abstract colors',
    recommendedTime: 'any',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'Creative energy flows through me effortlessly',
      'I am a vessel for divine inspiration',
      'My unique ideas are valuable and needed',
      'I express myself with confidence and joy',
      'I trust my creative intuition completely',
      'I am open to new possibilities',
      'Creation comes naturally to me',
      'I release judgment and embrace play',
      'My creativity is a limitless resource',
      'I am the artist of my own life',
    ],
  },

  // Joy in the Present (joy-1) - Mapped to fulfilled
  {
    id: 'joy-1',
    categoryId: 'fulfilled',
    title: 'Joy in the Present',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: false,
    illustration: 'Sunflowers',
    recommendedTime: 'morning',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I choose joy in this very moment',
      'Happiness is available to me right now',
      'I notice the beauty surrounding me',
      'I am grateful for this breath',
      'My heart is open to simple pleasures',
      'I smile and the world smiles back',
      'Joy is my natural state of being',
      'I release the need for things to be different',
      'I am content with what is',
      'Every moment is a gift I cherish',
    ],
  },

  // Inner Freedom (growth-1) - Mapped to healing
  {
    id: 'growth-1',
    categoryId: 'healing',
    title: 'Inner Freedom',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Bird flying',
    recommendedTime: 'any',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I am free to be my authentic self',
      'I release all chains of the past',
      'My spirit is unbound and limitless',
      'I choose freedom in every moment',
      'I liberate myself from fear and doubt',
      'I am the master of my own destiny',
      'Freedom flows through my thoughts',
      'I allow others to be free as well',
      'My potential has no ceiling',
      'I soar above all limitations',
    ],
  },

  // Emotional Healing Space (healing-2)
  {
    id: 'healing-2',
    categoryId: 'healing',
    title: 'Emotional Healing Space',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Soft pink light',
    recommendedTime: 'evening',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'I create a safe space for my emotions',
      'It is safe for me to feel fully',
      'I honor my feelings with compassion',
      'Healing happens in the stillness',
      'I hold myself with gentle kindness',
      'I release emotional weight with every breath',
      'My heart is a safe harbor',
      'I am healing deeper every day',
      'I accept all parts of myself',
      'Peace fills the space where pain once was',
    ],
  },

  // Quiet Confidence (confidence-2)
  {
    id: 'confidence-2',
    categoryId: 'confidence',
    title: 'Quiet Confidence',
    subtitle: 'Guided Affirmation',
    duration: 120,
    affirmationCount: 10,
    locked: true,
    illustration: 'Mountain peak',
    recommendedTime: 'any',
    introDuration: 15,
    affirmationStartTimes: [15, 29, 43, 57, 71, 85, 99, 113, 127, 141],
    affirmations: [
      'My confidence comes from within',
      'I trust my inner wisdom',
      'I do not need to be loud to be strong',
      'My presence is powerful and calm',
      'I believe in myself quietly and deeply',
      'I stand firm in my truth',
      'I radiate self-assurance effortlessly',
      'I validate myself',
      'I am steady, grounded, and sure',
      'My quiet strength moves mountains',
    ],
  },
];

// Helper function to get sessions by category
export const getSessionsByCategory = (categoryId: string): GuidedAffirmationSession[] => {
  return GUIDED_SESSIONS.filter(session => session.categoryId === categoryId);
};

// Helper function to get unlocked sessions
export const getUnlockedSessions = (): GuidedAffirmationSession[] => {
  return GUIDED_SESSIONS.filter(session => !session.locked);
};
