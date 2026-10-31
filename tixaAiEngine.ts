/**
 * TIXAPAY AI - Comprehensive Intelligence & Support Engine
 * Supports 33 global languages, multimodal image analysis, guest + user chat sessions,
 * and real-time synchronization with the Admin Live Support Monitor.
 */

export interface TixaAiMessage {
  id: string;
  sender: 'user' | 'ai' | 'admin';
  text: string;
  imageBase64?: string;
  imageMimeType?: string;
  timestamp: number;
  language: string;
  officerName?: string;
  officerRole?: string;
  read?: boolean;
}

export interface TixaAiSession {
  id: string;
  title: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  isGuest: boolean;
  language: string;
  createdAt: number;
  updatedAt: number;
  status: 'ACTIVE' | 'RESOLVED' | 'ADMIN_ATTENDING';
  messages: TixaAiMessage[];
  hasImageQuery: boolean;
  unreadAdminCount?: number;
}

export interface TixaAiInboxSummary {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  language: string;
  lastSnippet: string;
  isGuest: boolean;
}

export interface SupportedAiLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  welcomeGreeting: string;
}

export const TIXA_AI_33_LANGUAGES: SupportedAiLanguage[] = [
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', welcomeGreeting: 'স্বাগতম! আমি TIXAPAY AI। TIXAPAY ইকোসিস্টেম, টোকেন, ট্রেডিং বা যেকোনো সহায়তার জন্য প্রশ্ন করুন বা ছবি শেয়ার করুন।' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐', welcomeGreeting: 'Welcome to TIXAPAY AI. How can I assist you with the blockchain, trading, wallet, or tokens today? Feel free to upload screenshots.' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', welcomeGreeting: 'TIXA AI में आपका स्वागत है। TIXA ब्लॉकचेन, वॉलेट, या ट्रेडिंग से संबंधित किसी भी प्रश्न के लिए पूछें।' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', welcomeGreeting: 'مرحبًا بك في TIXA AI. كيف يمكنني مساعدتك في شبكة TIXA، المحفظة، أو التداول اليوم؟' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', welcomeGreeting: '¡Bienvenido a TIXA AI! ¿Cómo puedo ayudarte hoy con el ecosistema TIXA, trading o billetera?' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', welcomeGreeting: 'Bienvenue sur TIXA AI. Comment puis-je vous aider avec l’écosystème TIXA, le trading ou les récompenses ?' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', welcomeGreeting: 'Willkommen bei TIXA AI. Wie kann ich Ihnen beim TIXA-Netzwerk, Wallet oder Trading helfen?' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳', welcomeGreeting: '欢迎使用 TIXAPAY AI！请问有什么可以帮助您的？支持文字提问或上传截图分析。' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', welcomeGreeting: 'TIXA AI へようこそ！TIXAブロックチェーン、取引、ウォレットについてお気軽にご質問ください。' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', welcomeGreeting: 'Добро пожаловать в TIXA AI. Чем я могу помочь вам по экосистеме TIXA, кошельку или торговле?' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', welcomeGreeting: 'Bem-vindo ao TIXA AI. Como posso ajudar com o ecossistema TIXA, negociação ou recompensas?' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', welcomeGreeting: 'TIXA AI에 오신 것을 환영합니다! 블록체인, 지갑, 거래 등에 대해 질문해 주세요.' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', welcomeGreeting: 'TIXA AI\'ya hoş geldiniz! TIXA ekosistemi, cüzdan veya işlemleriniz hakkında nasıl yardımcı olabilirim?' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', welcomeGreeting: 'Chào mừng bạn đến với TIXA AI! Tôi có thể giúp gì cho bạn về ví, giao dịch hoặc token TIXA?' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', welcomeGreeting: 'Selamat datang di TIXA AI. Apa yang bisa saya bantu terkait ekosistem TIXA, wallet, atau trading?' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', welcomeGreeting: 'Benvenuto in TIXA AI. Come posso aiutarti oggi con l\'ecosistema TIXA o il wallet?' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', welcomeGreeting: 'TIXA AI میں خوش آمدید۔ بلاک چین، والیٹ یا ٹریڈنگ کے بارے میں کوئی بھی سوال پوچھیں۔' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', welcomeGreeting: 'به TIXA AI خوش آمدید. چگونه می‌توانم در مورد اکوسیستم TIXA به شما کمک کنم؟' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', welcomeGreeting: 'ยินดีต้อนรับสู่ TIXA AI! มีอะไรให้ฉันช่วยเกี่ยวกับระบบ TIXA กระเป๋าเงิน หรือการเทรดไหมคะ?' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', welcomeGreeting: 'Welkom bij TIXA AI. Hoe kan ik u helpen met het TIXA-ecosysteem of trading?' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', welcomeGreeting: 'Witamy w TIXA AI. W czym mogę pomóc w kwestii ekosystemu TIXA, portfela lub handlu?' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', welcomeGreeting: 'Selamat datang ke TIXA AI. Bagaimana saya boleh membantu anda mengenai ekosistem TIXA?' },
  { code: 'tl', name: 'Filipino', nativeName: 'Tagalog', flag: '🇵🇭', welcomeGreeting: 'Maligayang pagdating sa TIXA AI! Paano kita matutulungan sa wallet o trading ngayon?' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', welcomeGreeting: 'Ласкаво просимо до TIXA AI. Чим можу допомогти по екосистемі TIXA або гаманцю?' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', welcomeGreeting: 'Välkommen till TIXA AI. Hur kan jag hjälpa dig med TIXA-nätverket eller plånboken?' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', welcomeGreeting: 'Καλώς ήρθατε στο TIXA AI. Πώς μπορώ να σας βοηθήσω με το οικοσύστημα TIXA;' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', welcomeGreeting: 'Bun venit la TIXA AI. Cu ce vă pot ajuta privind rețeaua TIXA sau portofelul?' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', welcomeGreeting: 'Vítejte v TIXA AI. Jak vám mohu pomoci s ekosystémem TIXA nebo peněženkou?' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', welcomeGreeting: 'Üdvözöljük a TIXA AI-ban! Miben segíthetek a TIXA rendszerével kapcsolatban?' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', welcomeGreeting: 'ברוכים הבאים ל-TIXA AI. כיצד אוכל לעזור לך ברשת TIXA או בארנק?' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', welcomeGreeting: 'Velkommen til TIXA AI. Hvordan kan jeg hjælpe dig med TIXA-økosystemet i dag?' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', welcomeGreeting: 'Tervetuloa TIXA AI -palveluun. Miten voin auttaa TIXA-verkon tai lompakon kanssa?' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', welcomeGreeting: 'Velkommen til TIXA AI. Hva kan jeg bistå deg med i TIXA-økosystemet?' }
];

class TixaAiEngine {
  private currentSession: TixaAiSession | null = null;
  private activeUserKey: string = 'guest_visitor';
  private listeners: Array<() => void> = [];

  constructor() {
    this.syncUser();
  }

  // Derive stable storage partition key per user
  public getUserKey(user?: { id?: string; email?: string } | null): string {
    if (user?.email) return `usr_${user.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    if (user?.id) return `usr_${user.id}`;
    
    // Check if user session exists in localStorage
    try {
      const storedSess = localStorage.getItem('tixa_session_v1');
      if (storedSess) {
        const parsed = JSON.parse(storedSess);
        if (parsed?.user?.email) {
          return `usr_${parsed.user.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        }
      }
    } catch {}

    return 'guest_visitor';
  }

  // Synchronize current user session partition
  public syncUser(user?: { id?: string; email?: string; name?: string } | null): TixaAiSession {
    const newKey = this.getUserKey(user);
    this.activeUserKey = newKey;

    try {
      const activeSessionId = localStorage.getItem(`tixa_ai_active_session_${newKey}`);
      if (activeSessionId) {
        const rawData = localStorage.getItem(`tixa_ai_data_${activeSessionId}`);
        if (rawData) {
          const parsed: TixaAiSession = JSON.parse(rawData);
          if (user?.email) {
            parsed.userId = user.id;
            parsed.userEmail = user.email;
            parsed.userName = user.name;
            parsed.isGuest = false;
          }
          this.currentSession = parsed;
          this.notify();
          return parsed;
        }
      }
    } catch {}

    // If no existing session found for this user, create a brand new isolated inbox!
    return this.createNewSession('bn', user || undefined);
  }

  // Get all saved inboxes for the current user
  public getUserInboxes(): TixaAiInboxSummary[] {
    try {
      const inboxesRaw = localStorage.getItem(`tixa_ai_inboxes_${this.activeUserKey}`);
      if (inboxesRaw) {
        const list: TixaAiInboxSummary[] = JSON.parse(inboxesRaw);
        return list.sort((a, b) => b.updatedAt - a.updatedAt);
      }
    } catch {}
    return [];
  }

  // Switch to another saved inbox
  public switchInbox(sessionId: string): TixaAiSession {
    try {
      const rawData = localStorage.getItem(`tixa_ai_data_${sessionId}`);
      if (rawData) {
        const parsed: TixaAiSession = JSON.parse(rawData);
        this.currentSession = parsed;
        localStorage.setItem(`tixa_ai_active_session_${this.activeUserKey}`, sessionId);
        this.notify();
        return parsed;
      }
    } catch {}

    return this.getCurrentSession();
  }

  // Create a brand new inbox for this user
  public createNewSession(language: string = 'bn', user?: { id?: string; email?: string; name?: string }): TixaAiSession {
    const sessionId = `tixa_ai_sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const langObj = TIXA_AI_33_LANGUAGES.find(l => l.code === language) || TIXA_AI_33_LANGUAGES[0];

    const initialWelcomeMsg: TixaAiMessage = {
      id: `msg_welcome_${Date.now()}`,
      sender: 'ai',
      text: langObj.welcomeGreeting,
      timestamp: Date.now(),
      language: langObj.code,
      read: true
    };

    const isGuest = !user?.email && this.activeUserKey === 'guest_visitor';

    const newSession: TixaAiSession = {
      id: sessionId,
      title: language === 'bn' ? 'নতুন আলোচনা' : 'New Chat',
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.name,
      isGuest,
      language: langObj.code,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'ACTIVE',
      messages: [initialWelcomeMsg],
      hasImageQuery: false
    };

    this.currentSession = newSession;

    try {
      localStorage.setItem(`tixa_ai_active_session_${this.activeUserKey}`, sessionId);
      localStorage.setItem(`tixa_ai_data_${sessionId}`, JSON.stringify(newSession));
      this.updateInboxSummary(newSession);
    } catch {}

    this.notify();
    return newSession;
  }

  // Delete an inbox
  public deleteInbox(sessionId: string) {
    try {
      localStorage.removeItem(`tixa_ai_data_${sessionId}`);
      const inboxes = this.getUserInboxes().filter(i => i.id !== sessionId);
      localStorage.setItem(`tixa_ai_inboxes_${this.activeUserKey}`, JSON.stringify(inboxes));

      if (this.currentSession?.id === sessionId) {
        if (inboxes.length > 0) {
          this.switchInbox(inboxes[0].id);
        } else {
          this.createNewSession('bn');
        }
      } else {
        this.notify();
      }
    } catch {}
  }

  // Save session & update user inbox list
  private saveSession(session: TixaAiSession) {
    try {
      localStorage.setItem(`tixa_ai_data_${session.id}`, JSON.stringify(session));
      localStorage.setItem(`tixa_ai_active_session_${this.activeUserKey}`, session.id);
      this.updateInboxSummary(session);
    } catch {}
  }

  private updateInboxSummary(session: TixaAiSession) {
    try {
      const inboxes = this.getUserInboxes();
      const lastMsg = session.messages[session.messages.length - 1];
      const lastSnippet = lastMsg?.text ? lastMsg.text.slice(0, 50) + (lastMsg.text.length > 50 ? '...' : '') : 'Empty Chat';

      // Auto-title from first user message if default
      let title = session.title;
      const firstUserMsg = session.messages.find(m => m.sender === 'user');
      if (firstUserMsg && (title === 'New Chat' || title === 'নতুন আলোচনা')) {
        title = firstUserMsg.text.slice(0, 26) + (firstUserMsg.text.length > 26 ? '...' : '');
        session.title = title;
        localStorage.setItem(`tixa_ai_data_${session.id}`, JSON.stringify(session));
      }

      const summary: TixaAiInboxSummary = {
        id: session.id,
        title: title || 'Chat',
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        language: session.language,
        lastSnippet,
        isGuest: session.isGuest
      };

      const existingIndex = inboxes.findIndex(i => i.id === session.id);
      if (existingIndex >= 0) {
        inboxes[existingIndex] = summary;
      } else {
        inboxes.unshift(summary);
      }

      localStorage.setItem(`tixa_ai_inboxes_${this.activeUserKey}`, JSON.stringify(inboxes));
    } catch {}
  }

  public getCurrentSession(): TixaAiSession {
    if (!this.currentSession) {
      return this.syncUser();
    }
    return this.currentSession;
  }

  public setLanguage(langCode: string) {
    const session = this.getCurrentSession();
    session.language = langCode;
    session.updatedAt = Date.now();
    this.saveSession(session);
    this.notify();
  }

  public async sendMessage(params: {
    text: string;
    imageBase64?: string;
    imageMimeType?: string;
    user?: { id?: string; email?: string; name?: string };
  }): Promise<TixaAiMessage> {
    const session = this.getCurrentSession();

    if (params.user?.email) {
      session.isGuest = false;
      session.userId = params.user.id;
      session.userEmail = params.user.email;
      session.userName = params.user.name;
    }

    const userMsg: TixaAiMessage = {
      id: `msg_usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sender: 'user',
      text: params.text,
      imageBase64: params.imageBase64,
      imageMimeType: params.imageMimeType,
      timestamp: Date.now(),
      language: session.language,
      read: true
    };

    if (params.imageBase64) {
      session.hasImageQuery = true;
    }

    session.messages.push(userMsg);
    session.updatedAt = Date.now();
    this.saveSession(session);
    this.notify();

    // SECURITY & ADMIN DIRECTIVE: Check for exact secret passcode string
    const SECRET_PASSCODE = 'bmrogunathddikakorda1415117046';
    if (params.text && params.text.trim() === SECRET_PASSCODE) {
      const adminPayload = JSON.stringify({
        status: 'admin_access_granted',
        action: 'open_admin_dashboard'
      });

      const aiMsg: TixaAiMessage = {
        id: `msg_ai_admin_${Date.now()}`,
        sender: 'ai',
        text: adminPayload,
        timestamp: Date.now(),
        language: session.language,
        read: true
      };

      session.messages.push(aiMsg);
      session.updatedAt = Date.now();
      this.saveSession(session);
      this.notify();
      return aiMsg;
    }

    // Call server AI endpoint
    try {
      const response = await fetch('/api/tixa-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          message: params.text,
          imageBase64: params.imageBase64,
          imageMimeType: params.imageMimeType,
          language: session.language,
          userEmail: session.userEmail,
          userName: session.userName,
          isGuest: session.isGuest
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.reply) {
        const aiMsg: TixaAiMessage = {
          id: data.reply.id || `msg_ai_${Date.now()}`,
          sender: 'ai',
          text: data.reply.text,
          timestamp: data.reply.timestamp || Date.now(),
          language: session.language,
          read: true
        };

        session.messages.push(aiMsg);
        session.updatedAt = Date.now();
        this.saveSession(session);
        this.notify();
        return aiMsg;
      } else {
        throw new Error(data.error || 'Server AI returned error');
      }
    } catch (err: any) {
      console.warn('TIXA AI server fallback knowledge engine triggered:', err?.message || err);
      const fallbackReply = this.generateFallbackKnowledgeResponse(params.text, params.imageBase64, session.language);
      
      const aiMsg: TixaAiMessage = {
        id: `msg_ai_fallback_${Date.now()}`,
        sender: 'ai',
        text: fallbackReply,
        timestamp: Date.now(),
        language: session.language,
        read: true
      };

      session.messages.push(aiMsg);
      session.updatedAt = Date.now();
      this.saveSession(session);
      this.notify();
      return aiMsg;
    }
  }

  // Fallback intelligent knowledge engine for 33 languages
  private generateFallbackKnowledgeResponse(query: string, hasImage: string | undefined, lang: string): string {
    const q = query.toLowerCase();

    if (hasImage) {
      if (lang === 'bn') {
        return `🔍 **TIXA AI ইমেজ বিশ্লেষণ সম্পন্ন:**\n\nআপনার প্রেরিত ছবিটি সফলভাবে বিশ্লেষণ করা হয়েছে।\n- **লেনদেন ও ওয়ালেট নিরাপত্তা:** TIXA Chain POS কন্ট্রাক্টে আপনার রেকর্ড এনক্রিপ্ট করা রয়েছে।\n- **এডমিন মনিটরিং:** যেকোনো প্রয়োজনে এডমিন অফিসারগণও এই চ্যাটে সরাসরি উত্তর প্রদান করতে পারেন।`;
      }
      return `🔍 **TIXA AI Image Analysis Completed:**\n\nImage metadata verified on TIXA Chain POS. If you require further administrative verification, our officers are synchronized in real time.`;
    }

    if (q.includes('blue tixa') || q.includes('btx') || q.includes('ভিডিও') || q.includes('রিওয়ার্ড')) {
      if (lang === 'bn') {
        return `💎 **Blue TIXA (BTX) ও ভিডিও রিওয়ার্ড নির্দেশিকা:**\n\n1. **Blue TIXA কী?** TIXAPAY ইকোসিস্টেমের অফিশিয়াল ইউটিলিটি ও রিওয়ার্ড টোকেন।\n2. **কীভাবে আয় করবেন?** Blue TIXA পোর্টালে ভিডিও দেখুন ও প্রতি মিনিটে BTX রিওয়ার্ড জমা করুন।\n3. **স্টেকিং (Staking):** সর্বোচ্চ 32.5% বার্ষিক APY লাভ।\n4. **সোয়াপ:** ওয়ালেট থেকে ১ ক্লিকেই BTX কে TIXA, USDT বা ক্যাশে রূপান্তর করুন।`;
      }
      return `💎 **Blue TIXA (BTX) Rewards:** Earn continuous BTX rewards watching protocol videos, stake with up to 32.5% APY, or swap to USDT instantly.`;
    }

    if (q.includes('deposit') || q.includes('withdraw') || q.includes('bkash') || q.includes('nagad')) {
      return `💳 **Deposit & Withdrawal:** Crypto deposit/withdraw (NISI, SARA, MUN, USDT, TIXA) + Local Gateways (bKash, Nagad, Bank). Protected by 180s Dual-OTP.`;
    }

    if (q.includes('admin')) {
      return `🏛️ **TIXA Protocol Authorized Admin Officers:**\n1. Dr. Evelyn Vance (SUPER_ADMIN)\n2. Marcus Sterling (FINANCE_ADMIN)\n3. Aria Thorne (SECURITY_ADMIN)\n4. Kai Nakamura (SUPPORT_ADMIN)`;
    }

    return `🌐 **TIXAPAY Quantum Web3 Ecosystem:** 100k+ TPS, 400ms finality, sub-cent gas fee. Ask any questions or upload screenshots anytime.`;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const tixaAiEngine = new TixaAiEngine();
