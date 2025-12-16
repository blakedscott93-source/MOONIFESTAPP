/**
 * Affirmation Categories & Library
 *
 * 365+ professionally curated affirmations organized by category
 * Each affirmation is unique, powerful, and designed for deep impact
 */

export interface AffirmationCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  affirmations: string[];
}

export const AFFIRMATION_CATEGORIES: AffirmationCategory[] = [
  {
    id: 'wealth',
    name: 'Wealth & Abundance',
    icon: 'cash-outline',
    color: '#FFD700',
    description: 'Attract financial prosperity and abundance',
    affirmations: [
      // Core abundance mindset
      'I am a powerful money magnet and prosperity flows to me from multiple sources.',
      'My wealth grows exponentially as I align with the frequency of abundance.',
      'I release all limiting beliefs about money and embrace my natural state of prosperity.',
      'Financial freedom is my birthright and I claim it with confidence and gratitude.',
      'I attract lucrative opportunities that align perfectly with my purpose and passions.',
      'Money comes to me in expected and unexpected ways, easily and effortlessly.',
      'I am worthy of wealth beyond my current imagination and I receive it graciously.',
      'My income increases consistently and I always have more than enough.',
      'I invest wisely in assets that generate passive income and long-term wealth.',
      'The universe conspires to bring me financial blessings in miraculous ways.',

      // Wealth consciousness
      'I think, speak, and act like the wealthy person I am becoming.',
      'I am surrounded by abundance and I recognize prosperity in all its forms.',
      'My relationship with money is healthy, balanced, and empowering.',
      'I make smart financial decisions that create lasting wealth for generations.',
      'Every dollar I spend comes back to me multiplied in divine timing.',
      'I am building an empire of abundance that serves my highest good and others.',
      'My net worth increases daily as I take inspired action toward my goals.',
      'I deserve to live luxuriously while maintaining my values and integrity.',
      'Financial success flows naturally when I follow my authentic path.',
      'I transform my skills and talents into profitable ventures with ease.',

      // Entrepreneurship & career
      'I am a successful entrepreneur who creates value and generates wealth.',
      'My business thrives and grows beyond my expectations in perfect divine timing.',
      'I attract ideal clients and customers who love what I offer and pay premium prices.',
      'My career brings me both financial abundance and deep personal fulfillment.',
      'I negotiate confidently and always receive fair compensation for my contributions.',
      'I create multiple streams of income that support my desired lifestyle.',
      'My innovative ideas generate substantial revenue and positive impact.',
      'I am recognized and rewarded for my unique talents and expertise.',
      'Promotions, raises, and bonuses come to me naturally and frequently.',
      'I build systems that create wealth while I sleep and enjoy life.',

      // Gratitude & receiving
      'I am deeply grateful for the abundance that flows into my life daily.',
      'I celebrate every financial win, knowing more prosperity is on its way.',
      'I receive money from known and unknown sources with joy and appreciation.',
      'My bank account grows larger each month and I feel secure and blessed.',
      'I am comfortable with wealth and I manage it with wisdom and grace.',
      'Abundance is my natural state and I allow myself to receive without guilt.',
      'I attract mentors and opportunities that accelerate my path to wealth.',
      'My prosperity blesses not only me but also my family and community.',
      'I am a generous giver because I know abundance never runs out.',
      'I live in a constant state of financial overflow and share my blessings freely.',

      // Mindset & energy
      'My positive money mindset attracts unlimited opportunities for prosperity.',
      'I release all fear, doubt, and scarcity thinking around money forever.',
      'I am confident in my ability to create, attract, and multiply wealth.',
      'Financial miracles happen to me regularly and I expect them daily.',
      'I vibrate at the frequency of wealth and abundance in every moment.',
      'My thoughts and actions are aligned with becoming financially free.',
      'I trust the universe to provide for me abundantly in all circumstances.',
      'I am patient with the process and persistent in pursuing my financial goals.',
      'Money is a positive force that allows me to live my purpose fully.',
      'I am the creator of my financial reality and I choose prosperity now.',
    ],
  },
  {
    id: 'health',
    name: 'Health & Vitality',
    icon: 'heart-outline',
    color: '#FF6B6B',
    description: 'Nurture your body, mind, and spirit',
    affirmations: [
      // Physical health
      'Every cell in my body radiates perfect health, vitality, and youthful energy.',
      'My body is a temple and I honor it with nourishing food, movement, and rest.',
      'I am healing, growing stronger, and becoming healthier with each passing day.',
      'My immune system is powerful and protects me from all illness and disease.',
      'I breathe deeply and fully, bringing life-giving oxygen to every part of my being.',
      'My heart beats strong and steady, pumping vitality through my entire body.',
      'I sleep peacefully and deeply, waking refreshed and energized each morning.',
      'My body knows exactly how to heal itself and I trust its innate wisdom.',
      'I am free from pain and discomfort, feeling vibrant and alive in my body.',
      'I have abundant energy to accomplish everything I desire with ease and joy.',

      // Mental health & clarity
      'My mind is clear, focused, and operating at its highest potential.',
      'I release all stress and tension, choosing peace and tranquility instead.',
      'I am mentally strong, emotionally balanced, and spiritually aligned.',
      'Positive thoughts flow through my mind, creating a peaceful inner environment.',
      'I let go of worry and anxiety, trusting that everything is working out perfectly.',
      'My brain functions optimally and my memory is sharp and reliable.',
      'I am calm, centered, and grounded in every situation I encounter.',
      'I process emotions in healthy ways and release what no longer serves me.',
      'My mental health is a priority and I invest time in practices that support it.',
      'I am resilient, adaptable, and capable of handling life\'s challenges with grace.',

      // Nutrition & habits
      'I crave foods that nourish my body and support my optimal health.',
      'I make healthy choices naturally because I love and respect my body.',
      'Drinking water is a joy and I hydrate my body fully throughout the day.',
      'I eat mindfully, savoring each bite and feeling grateful for nutritious food.',
      'My metabolism functions perfectly, maintaining my ideal healthy weight effortlessly.',
      'I release all cravings for foods that do not serve my highest good.',
      'Exercise is a gift I give myself and I move my body with pleasure daily.',
      'I listen to my body\'s signals and give it exactly what it needs.',
      'Healthy habits come naturally to me and I maintain them consistently.',
      'I am in tune with my body and honor its needs with love and care.',

      // Healing & recovery
      'Healing energy flows through me, restoring me to perfect health now.',
      'I release all illness and disease, choosing vibrant health instead.',
      'My body regenerates healthy cells and eliminates toxins efficiently.',
      'I recover quickly from any challenge because my body is resilient and strong.',
      'Every breath I take fills me with healing light and renewed vitality.',
      'I forgive myself and others, releasing the emotional roots of physical illness.',
      'My body responds positively to all treatments and therapies I choose.',
      'I am patient and gentle with myself during my healing journey.',
      'Divine healing energy surrounds and penetrates every part of my being.',
      'I visualize myself in perfect health and my body responds accordingly.',

      // Energy & vitality
      'I wake up each morning feeling energized, motivated, and ready to thrive.',
      'My energy levels remain high and consistent throughout the entire day.',
      'I radiate vitality and my positive energy uplifts everyone around me.',
      'I recharge easily and quickly, always having energy for what matters most.',
      'My body moves with ease, flexibility, and strength in all activities.',
      'I age gracefully and maintain youthful energy regardless of my chronological age.',
      'I am vibrant, alive, and fully present in my healthy, strong body.',
      'My endurance increases daily and I accomplish more with less effort.',
      'I feel amazing in my body and celebrate its strength and capabilities.',
      'Perfect health is my natural state and I embody it completely now.',
    ],
  },
  {
    id: 'love',
    name: 'Love & Relationships',
    icon: 'heart',
    color: '#FF69B4',
    description: 'Manifest deep connections and authentic love',
    affirmations: [
      // Self-love foundation
      'I love and accept myself completely, exactly as I am in this moment.',
      'I am worthy of deep, unconditional love simply because I exist.',
      'I treat myself with the same kindness and compassion I offer to others.',
      'My heart is open to giving and receiving love in all its beautiful forms.',
      'I honor my needs, boundaries, and desires in all my relationships.',
      'I am enough, I have always been enough, and I will always be enough.',
      'I forgive myself for past mistakes and embrace my journey with love.',
      'I speak to myself with words of encouragement, love, and gentle support.',
      'I celebrate my uniqueness and love myself for all that makes me different.',
      'My self-love radiates outward and attracts loving people into my life.',

      // Romantic love
      'I am magnetic to my perfect partner who loves and cherishes me completely.',
      'My soulmate is seeking me just as I am seeking them, and we will find each other.',
      'I deserve a relationship built on trust, respect, passion, and mutual growth.',
      'Love flows to me effortlessly and I am ready to receive it fully.',
      'My ideal partner complements me perfectly and we bring out the best in each other.',
      'I attract a loving relationship that honors my authentic self and supports my dreams.',
      'I am worthy of being pursued, adored, and treated like the treasure I am.',
      'My heart is healed and ready to experience deep, lasting romantic love.',
      'I release all past relationship pain and open myself to new love possibilities.',
      'The universe is orchestrating the perfect meeting with my life partner now.',

      // Healthy relationships
      'I communicate my needs clearly, lovingly, and without fear of rejection.',
      'I attract relationships that are balanced, healthy, and mutually supportive.',
      'I set boundaries with love and people respect them because I respect myself.',
      'I choose partners and friends who celebrate me and encourage my growth.',
      'I release toxic relationships easily, making space for healthy connections.',
      'My relationships are filled with laughter, joy, deep connection, and genuine love.',
      'I am a great partner because I show up authentically and love wholeheartedly.',
      'I trust my intuition about people and honor the guidance it provides.',
      'I give love freely while maintaining my independence and sense of self.',
      'Conflict resolution comes naturally to me and strengthens my relationships.',

      // Family & friendship
      'My family relationships are healing and becoming more loving each day.',
      'I attract friends who are loyal, supportive, and genuinely happy for my success.',
      'I am surrounded by people who love me for who I truly am.',
      'My inner circle consists of positive, uplifting souls who inspire me.',
      'I easily forgive family members and choose peace over being right.',
      'I create beautiful memories with the people I love and treasure every moment.',
      'My children/parents/siblings and I share a bond of unconditional love and respect.',
      'I attract community and belonging wherever I go in the world.',
      'I am a loyal friend who shows up consistently and loves without judgment.',
      'My social life is vibrant and filled with meaningful, joyful connections.',

      // Intimacy & connection
      'I am comfortable with intimacy and allow myself to be fully seen and known.',
      'I express my emotions honestly and vulnerably, deepening my connections.',
      'Physical affection comes naturally to me and I enjoy giving and receiving it.',
      'I am present and attentive in my relationships, making others feel valued.',
      'My capacity to love grows deeper and more expansive every single day.',
      'I create safe space for others to be their authentic selves around me.',
      'I listen deeply and understand the unspoken needs of those I love.',
      'I celebrate my partner\'s victories as enthusiastically as my own.',
      'Romance and passion thrive in my relationship through conscious attention.',
      'I am grateful for the love in my life and I express that gratitude daily.',
    ],
  },
  {
    id: 'success',
    name: 'Success & Achievement',
    icon: 'trophy-outline',
    color: '#9B59B6',
    description: 'Unlock your potential and achieve your goals',
    affirmations: [
      // Achievement mindset
      'I am capable of achieving anything I set my mind to with focus and determination.',
      'Success is my natural state and I expect great outcomes in all my endeavors.',
      'I turn my dreams into goals and my goals into accomplished realities.',
      'Every day I take inspired action that moves me closer to my biggest aspirations.',
      'I am unstoppable when I combine my vision with consistent, strategic effort.',
      'My potential is limitless and I tap into more of it with each passing day.',
      'I celebrate every milestone on my journey, knowing each step matters.',
      'I am disciplined, focused, and committed to becoming the best version of myself.',
      'Success comes easily to me because I align my actions with my highest purpose.',
      'I am creating a legacy of achievement that will inspire generations.',

      // Confidence & capability
      'I trust in my abilities and know I have everything I need to succeed.',
      'I am confident in my decisions because I listen to my intuition and wisdom.',
      'Challenges are opportunities for me to prove my strength and expand my capabilities.',
      'I face obstacles with courage, creativity, and unwavering determination.',
      'I am a powerful creator of my reality and I choose success in all areas.',
      'My past achievements prove my capability and future success is inevitable.',
      'I believe in myself completely and that belief fuels my extraordinary results.',
      'I am worthy of every success I desire and I claim it without apology.',
      'I learn from failures quickly and use lessons to accelerate my success.',
      'I am becoming more skilled, knowledgeable, and capable every single day.',

      // Goal manifestation
      'I set clear, compelling goals and achieve them with ease and joy.',
      'My vision board is manifesting into reality faster than I ever imagined.',
      'I take massive action toward my goals and the universe meets me halfway.',
      'I am laser-focused on my priorities and I eliminate all distractions.',
      'My goals excite and motivate me, pulling me forward into my best life.',
      'I break down big dreams into actionable steps and execute them flawlessly.',
      'I am patient with the process while being persistent in pursuing my goals.',
      'I visualize my success daily and feel the emotions of already achieving it.',
      'The universe delivers opportunities that align perfectly with my aspirations.',
      'I am magnetic to the resources, people, and circumstances needed for my success.',

      // Leadership & influence
      'I am a natural leader who inspires others to reach their highest potential.',
      'My influence creates positive change in my community and beyond.',
      'I lead by example, demonstrating integrity, wisdom, and compassionate strength.',
      'People trust my vision and follow me because I empower them to succeed.',
      'I make decisions confidently and take full responsibility for outcomes.',
      'I am building something meaningful that will outlast my lifetime.',
      'My voice matters and my message reaches the people who need to hear it.',
      'I delegate effectively and build strong teams that accomplish remarkable things.',
      'I am recognized as an authority in my field and my expertise is valued.',
      'I use my success and platform to lift others and create opportunities.',

      // Excellence & mastery
      'I commit to excellence in everything I do, from small tasks to major projects.',
      'I am constantly improving my skills and becoming a master of my craft.',
      'I show up consistently, knowing that daily effort compounds into greatness.',
      'Quality is my standard and I refuse to settle for mediocrity in any area.',
      'I am dedicated to continuous learning and personal development.',
      'I innovate, create, and bring fresh perspectives to everything I touch.',
      'My work ethic is exceptional and I am known for delivering outstanding results.',
      'I find joy in the process of becoming excellent at what I do.',
      'I invest in myself through courses, mentors, and experiences that expand me.',
      'I am achieving success while maintaining balance, health, and inner peace.',
    ],
  },
  {
    id: 'confidence',
    name: 'Confidence & Self-Worth',
    icon: 'star-outline',
    color: '#F39C12',
    description: 'Build unshakeable self-confidence',
    affirmations: [
      // Core confidence
      'I am confident, capable, and worthy of all the good things life offers.',
      'I believe in myself completely and that belief empowers everything I do.',
      'I walk into every room knowing my presence adds value and brings light.',
      'I speak my truth clearly and confidently without needing anyone\'s approval.',
      'I trust my decisions because I have wisdom, intuition, and good judgment.',
      'I am comfortable being the center of attention and owning my spotlight.',
      'My confidence grows stronger every day as I step outside my comfort zone.',
      'I release all self-doubt and embrace my power with grace and humility.',
      'I am proud of who I am, how far I\'ve come, and where I\'m heading.',
      'I radiate self-assurance and people naturally trust and respect me.',

      // Self-worth
      'My worth is inherent and has nothing to do with achievements or approval.',
      'I deserve respect, kindness, and consideration in all my interactions.',
      'I am valuable simply because I exist, not because of what I produce.',
      'I refuse to dim my light to make others comfortable with their darkness.',
      'I am worthy of taking up space, being heard, and having my needs met.',
      'I don\'t need to prove my worth to anyone, including myself.',
      'I honor my own standards and don\'t compromise my values for acceptance.',
      'I deserve success, happiness, and fulfillment just as much as anyone else.',
      'I am enough exactly as I am, and I embrace my perfectly imperfect self.',
      'I treat myself as the valuable, worthy person I am in every moment.',

      // Authenticity & uniqueness
      'I celebrate what makes me different and I express my authentic self boldly.',
      'I am unapologetically myself and the right people love me for it.',
      'My uniqueness is my greatest strength and I leverage it powerfully.',
      'I don\'t need to fit in because I was born to stand out and shine.',
      'I express my opinions freely, knowing not everyone will agree and that\'s okay.',
      'I am creative, original, and bring a fresh perspective to everything I do.',
      'I embrace my quirks, flaws, and eccentricities with love and humor.',
      'I trust my instincts and follow my own path, regardless of others\' expectations.',
      'I am fascinating, interesting, and people are drawn to my authentic energy.',
      'I show up as my real self in all situations and that attracts my tribe.',

      // Social confidence
      'I am charismatic and engaging, making others feel comfortable around me.',
      'I start conversations easily and connect with people from all walks of life.',
      'I am an excellent communicator who expresses ideas clearly and persuasively.',
      'I handle rejection gracefully, knowing it redirects me to better opportunities.',
      'I am comfortable with silence and don\'t need to fill every moment with words.',
      'I make strong first impressions because I am genuine, warm, and confident.',
      'I am a great listener who makes people feel heard, valued, and understood.',
      'I contribute meaningfully to conversations and others appreciate my insights.',
      'I am confident in both leading and following, depending on what serves best.',
      'I attract positive, inspiring people who celebrate and encourage me.',

      // Body confidence
      'I love and appreciate my body exactly as it is right now.',
      'I am comfortable in my own skin and I move through the world with ease.',
      'I dress in ways that make me feel powerful, beautiful, and confident.',
      'I take up space unapologetically and I own my physical presence.',
      'My body is strong, capable, and deserving of love and respect.',
      'I refuse to criticize my appearance and speak kindly about my body.',
      'I am attractive, appealing, and magnetic in my own unique way.',
      'I focus on how my body feels rather than how it looks to others.',
      'I am grateful for all my body does for me and I treat it with care.',
      'I radiate confidence that has nothing to do with physical appearance.',
    ],
  },
  {
    id: 'peace',
    name: 'Peace & Calm',
    icon: 'leaf-outline',
    color: '#00D9A3',
    description: 'Find inner peace and tranquility',
    affirmations: [
      // Inner peace
      'I am calm, centered, and at peace with myself and the world around me.',
      'Peace flows through me like a gentle river, washing away all tension.',
      'I choose serenity over stress in every situation I encounter today.',
      'I am grounded in the present moment, free from worry about past or future.',
      'My inner peace is my superpower and nothing external can disturb it.',
      'I release the need to control outcomes and trust the flow of life.',
      'I breathe deeply and with each exhale, I release more stress and tension.',
      'Calmness is my natural state and I return to it easily throughout the day.',
      'I am safe, protected, and held by the universe in every moment.',
      'I cultivate inner stillness even when the world around me is chaotic.',

      // Letting go
      'I release all worry, knowing that everything is working out for my highest good.',
      'I let go of what I cannot control and focus my energy on what I can influence.',
      'I surrender my need to know how things will unfold and trust divine timing.',
      'I forgive easily and release resentment that weighs down my peace.',
      'I detach from outcomes and find peace in the process and the journey.',
      'I let go of perfectionism and embrace the beauty of imperfection.',
      'I release toxic people, situations, and thoughts that disturb my inner peace.',
      'I am free from the burden of others\' expectations and opinions.',
      'I let go of the past with love and step fully into the peaceful present.',
      'I release the need to have all the answers right now.',

      // Stress management
      'I handle stress with grace, remaining calm under pressure.',
      'I transform challenges into opportunities for growth and learning.',
      'I respond to difficulties with wisdom and patience, not reactive emotion.',
      'I take breaks when needed and honor my need for rest and restoration.',
      'I create boundaries that protect my peace and preserve my energy.',
      'I say no to commitments that compromise my well-being without guilt.',
      'I solve problems from a place of calm clarity rather than anxious panic.',
      'I am resilient and I bounce back quickly from setbacks and disappointments.',
      'I choose my battles wisely and let go of what doesn\'t truly matter.',
      'I find peace in simplicity and declutter my life regularly.',

      // Mindfulness & presence
      'I am fully present in this moment, experiencing life as it unfolds now.',
      'I notice beauty, joy, and blessings in the simple moments of daily life.',
      'I am aware of my thoughts and I gently redirect them toward peace.',
      'I practice mindfulness in everything I do, from eating to working to resting.',
      'I listen deeply without judgment, creating space for understanding.',
      'I am patient with myself and others, knowing we are all doing our best.',
      'I find joy in stillness and silence, not needing constant stimulation.',
      'I am grateful for this breath, this heartbeat, this precious moment of life.',
      'I slow down and savor experiences rather than rushing through them.',
      'I am present with my loved ones, giving them my full attention.',

      // Acceptance & trust
      'I accept what is, knowing resistance creates suffering while acceptance creates peace.',
      'I trust that the universe has a plan far greater than anything I can imagine.',
      'I am at peace with uncertainty, knowing life unfolds in perfect timing.',
      'I accept myself fully, flaws and all, and treat myself with compassion.',
      'I trust the process of life, even when I don\'t understand the path.',
      'I am content with what I have while working toward what I want.',
      'I find peace in knowing I am exactly where I need to be right now.',
      'I accept that some things are beyond my control and I find freedom in that.',
      'I trust my journey, even the difficult parts that are teaching me lessons.',
      'I am at peace with my past, excited about my future, and present in now.',
    ],
  },
  {
    id: 'career',
    name: 'Career & Purpose',
    icon: 'briefcase-outline',
    color: '#3498DB',
    description: 'Align with your purpose and career success',
    affirmations: [
      // Purpose alignment
      'I am aligned with my true purpose and my work is an extension of my soul.',
      'I have unique gifts to share with the world and I express them boldly.',
      'My career path unfolds perfectly as I follow my passion and intuition.',
      'I make a meaningful difference through my work and touch many lives.',
      'I am in the right place at the right time, doing exactly what I should be doing.',
      'My purpose becomes clearer every day as I listen to my inner guidance.',
      'I am building a career that honors my values and serves my highest vision.',
      'My work is fulfilling, purposeful, and brings me deep satisfaction.',
      'I wake up excited about my work because it aligns with who I truly am.',
      'I am creating a life of purpose, passion, and prosperity through my career.',

      // Professional success
      'I am successful, respected, and valued in my professional life.',
      'I attract career opportunities that exceed my expectations and dreams.',
      'Promotions and advancements come to me naturally and frequently.',
      'I am recognized as a leader and expert in my field.',
      'My skills are in high demand and I am compensated generously.',
      'I receive praise, recognition, and rewards for my excellent work.',
      'I am building a reputation for excellence, integrity, and innovation.',
      'My career grows and expands in exciting and unexpected ways.',
      'I am at the top of my field and I continue to rise higher.',
      'Success in my career flows easily because I am aligned with my purpose.',

      // Skills & growth
      'I am constantly learning, growing, and expanding my professional capabilities.',
      'I embrace new challenges as opportunities to develop new skills.',
      'I am coachable, adaptable, and open to feedback that helps me improve.',
      'I invest in my professional development through courses, books, and mentorship.',
      'I am becoming a master of my craft through dedicated practice and study.',
      'I bring innovation and fresh perspectives to my work consistently.',
      'I am tech-savvy and adapt quickly to new tools and technologies.',
      'I network effectively and build relationships that advance my career.',
      'I am a lifelong learner who stays current in my industry.',
      'I turn my ideas into action and create tangible results that matter.',

      // Work environment
      'I work in an environment that values me, supports my growth, and inspires me.',
      'My colleagues are talented, positive people who uplift and encourage me.',
      'I have excellent relationships with my supervisors and they champion my success.',
      'I am surrounded by a team that collaborates effectively toward shared goals.',
      'My workplace culture aligns with my values and brings out my best.',
      'I have the resources, support, and autonomy I need to excel in my role.',
      'I enjoy going to work and I feel energized by my professional environment.',
      'I am appreciated for my contributions and my voice is heard and respected.',
      'I attract mentors who guide me and see my potential clearly.',
      'I create positive energy wherever I work and others enjoy working with me.',

      // Impact & legacy
      'My work creates positive change and leaves the world better than I found it.',
      'I am building a professional legacy that will inspire future generations.',
      'I use my position and influence to open doors for others.',
      'My career success allows me to give back and support causes I care about.',
      'I am making a lasting impact in my industry and my community.',
      'I empower others through my leadership, mentorship, and example.',
      'My professional contributions solve real problems and improve people\'s lives.',
      'I am proud of the work I do and the difference I make every day.',
      'I am creating opportunities not just for myself but for others as well.',
      'I will be remembered for my integrity, excellence, and positive influence.',
    ],
  },
  {
    id: 'gratitude',
    name: 'Gratitude & Joy',
    icon: 'happy-outline',
    color: '#E74C3C',
    description: 'Cultivate appreciation and happiness',
    affirmations: [
      // Gratitude practice
      'I am deeply grateful for all the blessings, lessons, and love in my life.',
      'I find something to appreciate in every moment of every day.',
      'Gratitude is my superpower and it attracts even more blessings to me.',
      'I am thankful for my past, excited about my future, and present in now.',
      'I appreciate the simple pleasures that bring richness to everyday life.',
      'I express gratitude daily and watch my blessings multiply exponentially.',
      'I am grateful for challenges because they make me stronger and wiser.',
      'I thank the universe for what I have and what is on its way to me.',
      'My heart overflows with gratitude for the abundance surrounding me.',
      'I appreciate how far I\'ve come and trust the journey ahead of me.',

      // Joy & happiness
      'Joy is my natural state and I choose it consciously throughout each day.',
      'I am a magnet for happiness and positive experiences flow to me easily.',
      'I find joy in both ordinary moments and extraordinary celebrations.',
      'I laugh often, play freely, and give myself permission to have fun.',
      'Happiness is an inside job and I cultivate it through my thoughts and actions.',
      'I am joyful not because my life is perfect but because I choose to be.',
      'I spread joy wherever I go and my positive energy uplifts others.',
      'I celebrate life and all its beautiful, messy, magical moments.',
      'I deserve to be happy and I claim my right to joy without apology.',
      'I am grateful for every smile, every laugh, and every moment of bliss.',

      // Appreciation of others
      'I am surrounded by amazing people who love and support me beautifully.',
      'I appreciate my loved ones and I express my gratitude to them often.',
      'I see the good in everyone and I focus on their positive qualities.',
      'I am thankful for the teachers who have appeared in my life.',
      'I celebrate others\' successes as enthusiastically as my own.',
      'I am grateful for my family, friends, and all the connections I\'ve made.',
      'I appreciate people who challenge me because they help me grow.',
      'I thank those who have hurt me for teaching me valuable lessons.',
      'I am blessed with a community that celebrates and supports me.',
      'I express my appreciation openly and make others feel valued.',

      // Present moment appreciation
      'I am grateful for this breath, this heartbeat, this precious moment of life.',
      'I appreciate my health, my body, and my ability to experience this world.',
      'I am thankful for the roof over my head and the food on my table.',
      'I appreciate the beauty of nature and the miracles surrounding me daily.',
      'I am grateful for my senses that allow me to taste, touch, see, hear, and smell.',
      'I appreciate the freedom to make choices and create my own reality.',
      'I am thankful for modern conveniences that make life easier and more enjoyable.',
      'I appreciate the gift of another day to love, learn, and grow.',
      'I am grateful for clean water, fresh air, and the abundance of Earth.',
      'I appreciate music, art, books, and all the beauty humanity creates.',

      // Abundance consciousness
      'I am grateful for the abundance that flows into my life from all directions.',
      'I appreciate every dollar I earn and every dollar I spend with gratitude.',
      'I am thankful for unexpected blessings and pleasant surprises.',
      'I appreciate the opportunities available to me and I seize them with joy.',
      'I am grateful for both what I have and what I am becoming.',
      'I appreciate the universe\'s perfect timing in delivering my desires.',
      'I am thankful for the lessons, the growth, and the journey itself.',
      'I appreciate my progress even when I\'m not yet where I want to be.',
      'I am grateful for the ability to dream, hope, and manifest my desires.',
      'I appreciate life in all its fullness and I embrace it with open arms.',
    ],
  },
];

/**
 * Get affirmations by category
 */
export function getAffirmationsByCategory(categoryId: string): string[] {
  const category = AFFIRMATION_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.affirmations || [];
}

/**
 * Get random affirmation from a category
 */
export function getRandomAffirmation(categoryId: string): string {
  const affirmations = getAffirmationsByCategory(categoryId);
  return affirmations[Math.floor(Math.random() * affirmations.length)] || '';
}

/**
 * Get random affirmation from any category
 */
export function getRandomAffirmationFromAll(): string {
  const allAffirmations = AFFIRMATION_CATEGORIES.flatMap(cat => cat.affirmations);
  return allAffirmations[Math.floor(Math.random() * allAffirmations.length)] || '';
}

/**
 * Search affirmations by keyword
 */
export function searchAffirmations(query: string): Array<{ category: string; affirmation: string }> {
  const results: Array<{ category: string; affirmation: string }> = [];
  const searchTerm = query.toLowerCase();

  AFFIRMATION_CATEGORIES.forEach(category => {
    category.affirmations.forEach(affirmation => {
      if (affirmation.toLowerCase().includes(searchTerm)) {
        results.push({
          category: category.name,
          affirmation,
        });
      }
    });
  });

  return results;
}

/**
 * Get total affirmation count
 */
export function getTotalAffirmationCount(): number {
  return AFFIRMATION_CATEGORIES.reduce((sum, cat) => sum + cat.affirmations.length, 0);
}
