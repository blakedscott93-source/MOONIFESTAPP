import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
}

const CHATBOT_RESPONSES: { [key: string]: { text: string; options?: string[] } } = {
  welcome: {
    text: "✨ Welcome to your Moonifest Guide! I'm here to help you master manifestation and make the most of your 45 NOW journey.\n\nWhat would you like to know?",
    options: [
      'What is manifestation?',
      'How does the 369 method work?',
      'How do I use this app?',
      'Tips for staying consistent',
      'I need motivation',
    ],
  },
  'what is manifestation?': {
    text: "Manifestation is the practice of bringing your desires into reality through focused thought, belief, and action.\n\nThe key principles:\n• Your thoughts create your reality\n• Energy flows where attention goes\n• Align your vibration with your desires\n• Take inspired action\n• Trust the universe\n\nWhat else would you like to know?",
    options: [
      'How does the 369 method work?',
      'Why does visualization work?',
      'How long until I see results?',
      'Back to main menu',
    ],
  },
  'how does the 369 method work?': {
    text: "The 369 Method is a powerful manifestation technique!\n\n📝 Write your affirmation:\n• 3 times in the morning (sets intention)\n• 6 times in the afternoon (reinforces belief)\n• 9 times in the evening (locks it in)\n\n💡 Pro tips:\n• Write as if it's already true\n• Feel the emotions\n• Speak it aloud as you write\n• Be specific and positive\n• Stay consistent for 45 days\n\nExample: 'I am attracting $10,000 easily and effortlessly'\n\nWant to know more?",
    options: [
      'What should I write?',
      'Why these specific numbers?',
      'How to stay motivated?',
      'Back to main menu',
    ],
  },
  'how do i use this app?': {
    text: "Let me show you around! 🗺️\n\n🏠 Tasks Tab: Your daily overview\n⭐ 45 NOW Tab: Complete your daily requirements\n📖 Journal: Write gratitude entries\n📊 Progress: Track your journey\n🛠️ Tools: Extras like this chat!\n\nEach day, complete:\n1. Your 3 must-do tasks\n2. 369 affirmations (morning, afternoon, evening)\n3. Guided meditation\n4. Gratitude journaling\n\nMiss a day? You start over. That's what makes you mentally tough!\n\nWhat would you like to explore?",
    options: [
      'How to write good affirmations?',
      'What are must-do tasks?',
      'Why gratitude journaling?',
      'Back to main menu',
    ],
  },
  'tips for staying consistent': {
    text: "🎯 Staying Consistent - The Secret Sauce:\n\n1. Set Daily Reminders\n• Morning alarm for tasks\n• 3 reminders for affirmations\n• Evening reminder for review\n\n2. Stack Habits\n• Do affirmations with coffee\n• Meditate before bed\n• Journal right after waking\n\n3. Visual Cues\n• Set phone wallpaper as reminder\n• Post sticky notes\n• Use the app's notifications\n\n4. Accountability\n• Share progress with a friend\n• Post on social media\n• Join our community (coming soon!)\n\n5. Remember Your Why\n• Review your goals daily\n• Visualize the end result\n• Celebrate small wins\n\nYou've got this! 💪\n\nWhat else?",
    options: [
      'I need motivation',
      'What if I miss a day?',
      'How to write better affirmations?',
      'Back to main menu',
    ],
  },
  'i need motivation': {
    text: "🔥 YOU ARE POWERFUL BEYOND MEASURE!\n\nRemember:\n\n💫 Every successful person started where you are\n💫 You wouldn't have the desire if you couldn't achieve it\n💫 The universe is ALWAYS working in your favor\n💫 You're exactly where you need to be\n💫 Your breakthrough is closer than you think\n\n\"The only limits that exist are the ones you place on yourself.\"\n\nYour future self is already thanking you for showing up today. Keep going! ✨\n\nNeed more help?",
    options: [
      'How to overcome doubt?',
      'Success stories',
      'Daily affirmations',
      'Back to main menu',
    ],
  },
  'what should i write?': {
    text: "✍️ Powerful Affirmation Examples:\n\n💰 Money:\n• I am a money magnet\n• Money flows to me easily\n• I am worthy of abundance\n\n❤️ Love:\n• I attract loving relationships\n• I am deserving of love\n• My perfect partner is coming to me\n\n💼 Career:\n• Success comes naturally to me\n• I am living my dream life\n• Opportunities find me effortlessly\n\n🧘 Health:\n• My body is healthy and strong\n• I radiate vitality and energy\n• I am grateful for my wellness\n\n📝 Formula: 'I am [desired state] [positive action/feeling]'\n\nWhat resonates with you?",
    options: [
      'More examples',
      'How to make them more powerful?',
      'Back to 369 method',
      'Back to main menu',
    ],
  },
  'back to main menu': {
    text: "What would you like to know?",
    options: [
      'What is manifestation?',
      'How does the 369 method work?',
      'How do I use this app?',
      'Tips for staying consistent',
      'I need motivation',
    ],
  },
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: CHATBOT_RESPONSES.welcome.text,
      sender: 'bot',
      timestamp: new Date(),
      options: CHATBOT_RESPONSES.welcome.options,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleOptionPress = (option: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: option,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Get bot response
    setTimeout(() => {
      const responseKey = option.toLowerCase();
      const response = CHATBOT_RESPONSES[responseKey] || CHATBOT_RESPONSES['back to main menu'];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        options: response.options,
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simple keyword matching for custom input
    setTimeout(() => {
      let responseText = "I appreciate your question! For now, try selecting from the options below, or explore the main topics. More conversational AI coming soon! ✨";

      const input = inputText.toLowerCase();
      if (input.includes('369') || input.includes('method')) {
        responseText = CHATBOT_RESPONSES['how does the 369 method work?'].text;
      } else if (input.includes('manifest')) {
        responseText = CHATBOT_RESPONSES['what is manifestation?'].text;
      } else if (input.includes('motivat') || input.includes('help')) {
        responseText = CHATBOT_RESPONSES['i need motivation'].text;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        options: CHATBOT_RESPONSES['back to main menu'].options,
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="sparkles" size={24} color="#FFD700" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Moonifest Guide</Text>
          <Text style={styles.headerSubtitle}>Your manifestation assistant</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View key={message.id}>
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userText : styles.botText,
                ]}
              >
                {message.text}
              </Text>
            </View>

            {message.options && message.sender === 'bot' && (
              <View style={styles.optionsContainer}>
                {message.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => handleOptionPress(option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#8B7DD8" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0B1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderBottomWidth: 1,
    borderBottomColor: '#8B7DD8',
    gap: 15,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD70020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8B7DD8',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B7DD8',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F1B2F',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  botText: {
    color: '#FFF',
  },
  optionsContainer: {
    marginBottom: 20,
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1B2F',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B7DD8',
  },
  optionText: {
    color: '#FFF',
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1F1B2F',
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F0B1F',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B7DD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
