/**
 * Motivational Quotes Collection
 * 
 * Curated collection for daily inspiration
 * Categories: manifestation, mindset, action, gratitude, self-love, success
 */

export interface Quote {
  text: string;
  author: string;
  category: QuoteCategory;
}

export type QuoteCategory = 
  | 'manifestation' 
  | 'mindset' 
  | 'action' 
  | 'gratitude' 
  | 'self-love' 
  | 'success'
  | 'morning'
  | 'evening';

export const QUOTES: Quote[] = [
  // Manifestation
  {
    text: "What you think, you become. What you feel, you attract. What you imagine, you create.",
    author: "Buddha",
    category: "manifestation",
  },
  {
    text: "Your thoughts are the architects of your destiny.",
    author: "David O. McKay",
    category: "manifestation",
  },
  {
    text: "The universe is not outside of you. Look inside yourself; everything that you want, you already are.",
    author: "Rumi",
    category: "manifestation",
  },
  {
    text: "See yourself living in abundance and you will attract it. It always works, it works every time with every person.",
    author: "Bob Proctor",
    category: "manifestation",
  },
  {
    text: "Your imagination is your preview of life's coming attractions.",
    author: "Albert Einstein",
    category: "manifestation",
  },
  {
    text: "Everything you want is out there waiting for you to ask. Everything you want also wants you.",
    author: "Jack Canfield",
    category: "manifestation",
  },
  {
    text: "You are a living magnet. What you attract into your life is in harmony with your dominant thoughts.",
    author: "Brian Tracy",
    category: "manifestation",
  },
  {
    text: "The law of attraction states that whatever you focus on, think about, read about, and talk about intensely, you're going to attract more of into your life.",
    author: "Jack Canfield",
    category: "manifestation",
  },
  {
    text: "Ask for what you want and be prepared to get it.",
    author: "Maya Angelou",
    category: "manifestation",
  },
  {
    text: "Thoughts become things. If you see it in your mind, you will hold it in your hand.",
    author: "Bob Proctor",
    category: "manifestation",
  },

  // Mindset
  {
    text: "Whether you think you can or you think you can't, you're right.",
    author: "Henry Ford",
    category: "mindset",
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    category: "mindset",
  },
  {
    text: "Your life does not get better by chance, it gets better by change.",
    author: "Jim Rohn",
    category: "mindset",
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
    category: "mindset",
  },
  {
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    category: "mindset",
  },
  {
    text: "You have power over your mind, not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "mindset",
  },
  {
    text: "A positive mindset brings positive things.",
    author: "Philipp Reiter",
    category: "mindset",
  },
  {
    text: "The greatest discovery of all time is that a person can change their future by merely changing their attitude.",
    author: "Oprah Winfrey",
    category: "mindset",
  },
  {
    text: "Change your thoughts and you change your world.",
    author: "Norman Vincent Peale",
    category: "mindset",
  },
  {
    text: "Your mindset is the lens through which you see your world.",
    author: "Unknown",
    category: "mindset",
  },

  // Action
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "action",
  },
  {
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
    category: "action",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    category: "action",
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "action",
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    category: "action",
  },
  {
    text: "Don't wait. The time will never be just right.",
    author: "Napoleon Hill",
    category: "action",
  },
  {
    text: "The distance between your dreams and reality is called action.",
    author: "Unknown",
    category: "action",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "action",
  },
  {
    text: "An inch of movement will bring you closer to your goals than a mile of intention.",
    author: "Steve Maraboli",
    category: "action",
  },
  {
    text: "Take the first step in faith. You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr.",
    category: "action",
  },

  // Gratitude
  {
    text: "Gratitude turns what we have into enough.",
    author: "Aesop",
    category: "gratitude",
  },
  {
    text: "When you are grateful, fear disappears and abundance appears.",
    author: "Tony Robbins",
    category: "gratitude",
  },
  {
    text: "The more grateful I am, the more beauty I see.",
    author: "Mary Davis",
    category: "gratitude",
  },
  {
    text: "Gratitude is the fairest blossom which springs from the soul.",
    author: "Henry Ward Beecher",
    category: "gratitude",
  },
  {
    text: "Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow.",
    author: "Melody Beattie",
    category: "gratitude",
  },
  {
    text: "Joy is the simplest form of gratitude.",
    author: "Karl Barth",
    category: "gratitude",
  },
  {
    text: "Gratitude is not only the greatest of virtues but the parent of all others.",
    author: "Cicero",
    category: "gratitude",
  },
  {
    text: "Be thankful for what you have; you'll end up having more.",
    author: "Oprah Winfrey",
    category: "gratitude",
  },
  {
    text: "Start each day with a grateful heart.",
    author: "Unknown",
    category: "gratitude",
  },
  {
    text: "Gratitude unlocks the fullness of life.",
    author: "Melody Beattie",
    category: "gratitude",
  },

  // Self-Love
  {
    text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
    author: "Buddha",
    category: "self-love",
  },
  {
    text: "To love oneself is the beginning of a lifelong romance.",
    author: "Oscar Wilde",
    category: "self-love",
  },
  {
    text: "You are enough just as you are.",
    author: "Meghan Markle",
    category: "self-love",
  },
  {
    text: "Self-love is not selfish; you cannot truly love another until you know how to love yourself.",
    author: "Unknown",
    category: "self-love",
  },
  {
    text: "Your relationship with yourself sets the tone for every other relationship you have.",
    author: "Jane Travis",
    category: "self-love",
  },
  {
    text: "Owning our story and loving ourselves through that process is the bravest thing we'll ever do.",
    author: "Brené Brown",
    category: "self-love",
  },
  {
    text: "The most powerful relationship you will ever have is the relationship with yourself.",
    author: "Steve Maraboli",
    category: "self-love",
  },
  {
    text: "Be yourself. Everyone else is already taken.",
    author: "Oscar Wilde",
    category: "self-love",
  },
  {
    text: "Love yourself first and everything else falls into line.",
    author: "Lucille Ball",
    category: "self-love",
  },
  {
    text: "You are worthy of love and belonging.",
    author: "Brené Brown",
    category: "self-love",
  },

  // Success
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "success",
  },
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
    category: "success",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "success",
  },
  {
    text: "Success usually comes to those who are too busy to be looking for it.",
    author: "Henry David Thoreau",
    category: "success",
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
    category: "success",
  },
  {
    text: "I find that the harder I work, the more luck I seem to have.",
    author: "Thomas Jefferson",
    category: "success",
  },
  {
    text: "Success is getting what you want. Happiness is wanting what you get.",
    author: "Dale Carnegie",
    category: "success",
  },
  {
    text: "The road to success and the road to failure are almost exactly the same.",
    author: "Colin R. Davis",
    category: "success",
  },
  {
    text: "Success is not in what you have, but who you are.",
    author: "Bo Bennett",
    category: "success",
  },
  {
    text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.",
    author: "Colin Powell",
    category: "success",
  },

  // Morning
  {
    text: "Every morning brings new potential, but if you dwell on the misfortunes of the day before, you tend to overlook tremendous opportunities.",
    author: "Harvey Mackay",
    category: "morning",
  },
  {
    text: "Rise up, start fresh, see the bright opportunity in each new day.",
    author: "Unknown",
    category: "morning",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "morning",
  },
  {
    text: "Today is a new day. Don't let your history interfere with your destiny.",
    author: "Steve Maraboli",
    category: "morning",
  },
  {
    text: "With the new day comes new strength and new thoughts.",
    author: "Eleanor Roosevelt",
    category: "morning",
  },
  {
    text: "Every morning is a chance at a new day.",
    author: "Marjorie Pay Hinckley",
    category: "morning",
  },
  {
    text: "Morning is an important time of day, because how you spend your morning can often tell you what kind of day you are going to have.",
    author: "Lemony Snicket",
    category: "morning",
  },
  {
    text: "Opportunities are like sunrises. If you wait too long, you miss them.",
    author: "William Arthur Ward",
    category: "morning",
  },
  {
    text: "The breeze at dawn has secrets to tell you. Don't go back to sleep.",
    author: "Rumi",
    category: "morning",
  },
  {
    text: "Each morning we are born again. What we do today matters most.",
    author: "Buddha",
    category: "morning",
  },

  // Evening
  {
    text: "Finish each day and be done with it. You have done what you could.",
    author: "Ralph Waldo Emerson",
    category: "evening",
  },
  {
    text: "The day is done, and the darkness falls from the wings of Night.",
    author: "Henry Wadsworth Longfellow",
    category: "evening",
  },
  {
    text: "Rest. Your soul needs rest, not just your body.",
    author: "Unknown",
    category: "evening",
  },
  {
    text: "As the day draws to a close, reflect on all the good that happened.",
    author: "Unknown",
    category: "evening",
  },
  {
    text: "Night is the wonderful opportunity to take rest, to forgive, to dream, to smile and to get ready for all the battles you have to fight tomorrow.",
    author: "Allen Ginsberg",
    category: "evening",
  },
  {
    text: "The night is more alive and more richly colored than the day.",
    author: "Vincent van Gogh",
    category: "evening",
  },
  {
    text: "Sleep is the best meditation.",
    author: "Dalai Lama",
    category: "evening",
  },
  {
    text: "Each night, when I go to sleep, I die. And the next morning, when I wake up, I am reborn.",
    author: "Mahatma Gandhi",
    category: "evening",
  },
  {
    text: "Let the evening take away your worries. Tomorrow is a fresh start.",
    author: "Unknown",
    category: "evening",
  },
  {
    text: "Be at peace with yourself. You've done enough for today.",
    author: "Unknown",
    category: "evening",
  },
];

/**
 * Get a random quote
 */
export function getRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

/**
 * Get a random quote from a specific category
 */
export function getQuoteByCategory(category: QuoteCategory): Quote {
  const categoryQuotes = QUOTES.filter(q => q.category === category);
  return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
}

/**
 * Get the quote of the day (consistent for the entire day)
 */
export function getQuoteOfTheDay(): Quote {
  const today = new Date();
  const dayIndex = today.getFullYear() * 400 + today.getMonth() * 32 + today.getDate();
  return QUOTES[dayIndex % QUOTES.length];
}

/**
 * Get a time-appropriate quote
 */
export function getTimeBasedQuote(): Quote {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    // Morning
    return getQuoteByCategory('morning');
  } else if (hour >= 18 || hour < 5) {
    // Evening
    return getQuoteByCategory('evening');
  } else {
    // Daytime - mix of categories
    const categories: QuoteCategory[] = ['manifestation', 'mindset', 'action', 'gratitude'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return getQuoteByCategory(randomCategory);
  }
}

/**
 * Get multiple unique quotes
 */
export function getMultipleQuotes(count: number): Quote[] {
  const shuffled = [...QUOTES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get quote by author
 */
export function getQuotesByAuthor(author: string): Quote[] {
  return QUOTES.filter(q => 
    q.author.toLowerCase().includes(author.toLowerCase())
  );
}



