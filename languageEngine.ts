import { LANGUAGES_99, LanguageInfo } from '../data/languages';
import { TRANSLATIONS, TranslationDictionary } from '../data/translations';

const STORAGE_KEY = 'tixa_selected_language';

// Expanded translations for high-demand language codes
const EXTENDED_TRANSLATIONS: Record<string, Partial<TranslationDictionary>> = {
  pt: {
    nav_home: 'Início',
    nav_markets: 'Mercados',
    nav_trading: 'Negociação',
    nav_wallet: 'Carteira',
    nav_explorer: 'Blockchain',
    nav_transactions: 'Transações',
    nav_holdings: 'Top 100 & Metas 2050',
    nav_developer: 'Ferramentas Dev',
    nav_admin: 'Painel Admin',
    nav_dashboard: 'Meu Painel',
    nav_profile: 'Segurança & Perfil',
    nav_tokens: 'Tokens',
    btn_login: 'Entrar',
    btn_signup: 'Cadastrar',
    btn_logout: 'Sair',
    btn_connect_wallet: 'Conectar Cofre',
    btn_buy: 'Comprar',
    btn_sell: 'Vender',
    btn_deposit: 'Depositar',
    btn_withdraw: 'Sacar',
    btn_transfer: 'Transferir',
    btn_send: 'Enviar',
    btn_receive: 'Receber',
    btn_swap: 'Troca Instantânea',
    btn_stake: 'Staking & Ganhos',
    btn_confirm: 'Confirmar',
    btn_cancel: 'Cancelar',
    btn_close: 'Fechar',
    btn_copy: 'Copiar',
    btn_copied: 'Copiado!',
    btn_refresh: 'Atualizar',
    btn_search: 'Pesquisar...',
    btn_view_all: 'Ver Todos',
    btn_trade_now: 'Negociar Agora',
    btn_explore: 'Explorar',
    btn_select_language: 'Idioma',
    btn_save_changes: 'Salvar Alterações',
    dash_total_balance: 'Saldo Total do Cofre',
    dash_net_worth: 'Patrimônio Estimado',
    auth_signin_title: 'Entrar no Cofre TIXA',
    auth_signup_title: 'Criar Cofre Não-Custodial',
    settings_language: 'Idioma da Interface',
    settings_select_lang_title: 'Selecionar Idioma (99 Países)',
    settings_saved_success: 'Preferência de idioma salva com sucesso!'
  },
  tr: {
    nav_home: 'Ana Sayfa',
    nav_markets: 'Piyasalar',
    nav_trading: 'Ticaret',
    nav_wallet: 'Cüzdan',
    nav_explorer: 'Blokzincir',
    nav_transactions: 'İşlem Geçmişi',
    nav_holdings: 'İlk 100 ve 2050 Hedefleri',
    nav_developer: 'Geliştirici Araçları',
    nav_admin: 'Yönetici Paneli',
    nav_dashboard: 'Kontrol Paneli',
    nav_profile: 'Güvenlik & Profil',
    nav_tokens: 'Tokenlar',
    btn_login: 'Giriş Yap',
    btn_signup: 'Kayıt Ol',
    btn_logout: 'Çıkış Yap',
    btn_connect_wallet: 'Kasaya Bağlan',
    btn_buy: 'Satın Al',
    btn_sell: 'Sat',
    btn_deposit: 'Yatır',
    btn_withdraw: 'Çek',
    btn_transfer: 'Transfer',
    btn_send: 'Gönder',
    btn_receive: 'Al',
    btn_swap: 'Anında Takas',
    btn_stake: 'Staking ve Kazanç',
    btn_confirm: 'Onayla',
    btn_cancel: 'İptal',
    btn_close: 'Kapat',
    btn_copy: 'Kopyala',
    btn_copied: 'Kopyalandı!',
    btn_refresh: 'Yenile',
    btn_search: 'Ara...',
    btn_view_all: 'Hepsini Gör',
    btn_trade_now: 'Şimdi Al-Sat',
    btn_explore: 'Keşfet',
    btn_select_language: 'Dil (Language)',
    btn_save_changes: 'Değişiklikleri Kaydet',
    dash_total_balance: 'Toplam Kasa Bakiyesi',
    dash_net_worth: 'Tahmini Net Değer',
    auth_signin_title: 'TIXA Kasasına Giriş',
    auth_signup_title: 'Gözetimsiz Kasa Oluştur',
    settings_language: 'Arayüz Dili',
    settings_select_lang_title: 'Dil Seçin (99 Ülke Desteği)',
    settings_saved_success: 'Dil tercihi başarıyla kaydedildi!'
  },
  vi: {
    nav_home: 'Trang Chủ',
    nav_markets: 'Thị Trường',
    nav_trading: 'Giao Dịch',
    nav_wallet: 'Ví Tài Sản',
    nav_explorer: 'Blockchain',
    nav_transactions: 'Lịch Sử Giao Dịch',
    nav_holdings: 'Top 100 & Mục Tiêu 2050',
    nav_developer: 'Công Cụ Dev',
    nav_admin: 'Bảng Quản Trị',
    nav_dashboard: 'Bảng Điều Khiển',
    nav_profile: 'Bảo Mật & Hồ Sơ',
    nav_tokens: 'Danh Sách Token',
    btn_login: 'Đăng Nhập',
    btn_signup: 'Đăng Ký',
    btn_logout: 'Đăng Xuất',
    btn_connect_wallet: 'Kết Nối Két Sắt',
    btn_buy: 'Mua',
    btn_sell: 'Bán',
    btn_deposit: 'Nạp Tiền',
    btn_withdraw: 'Rút Tiền',
    btn_transfer: 'Chuyển Khoản',
    btn_send: 'Gửi',
    btn_receive: 'Nhận',
    btn_swap: 'Hoán Đổi Nhanh',
    btn_stake: 'Staking & Kiếm Lời',
    btn_confirm: 'Xác Nhận',
    btn_cancel: 'Hủy Bỏ',
    btn_close: 'Đóng',
    btn_copy: 'Sao Chép',
    btn_copied: 'Đã Sao Chép!',
    btn_refresh: 'Làm Mới',
    btn_search: 'Tìm Kiếm...',
    btn_view_all: 'Xem Tất Cả',
    btn_trade_now: 'Giao Dịch Ngay',
    btn_explore: 'Khám Phá',
    btn_select_language: 'Ngôn Ngữ',
    btn_save_changes: 'Lưu Thay Đổi',
    dash_total_balance: 'Tổng Số Dư Két Sắt',
    dash_net_worth: 'Giá Trị Tài Sản Ròng',
    auth_signin_title: 'Đăng Nhập Két Sắt TIXA',
    auth_signup_title: 'Tạo Két Sắt Phi Tập Trung',
    settings_language: 'Ngôn Ngữ Giao Diện',
    settings_select_lang_title: 'Chọn Ngôn Ngữ (Hỗ Trợ 99 Quốc Gia)',
    settings_saved_success: 'Đã lưu tùy chọn ngôn ngữ thành công!'
  },
  ko: {
    nav_home: '홈',
    nav_markets: '시장 시세',
    nav_trading: '거래',
    nav_wallet: '지갑',
    nav_explorer: '블록체인',
    nav_transactions: '거래 내역',
    nav_holdings: 'Top 100 및 2050 목표',
    nav_developer: '개발자 도구',
    nav_admin: '관리자 패널',
    nav_dashboard: '대시보드',
    nav_profile: '보안 및 프로필',
    nav_tokens: '토큰 목록',
    btn_login: '로그인',
    btn_signup: '회원가입',
    btn_logout: '로그아웃',
    btn_connect_wallet: '금고 연결',
    btn_buy: '매수',
    btn_sell: '매도',
    btn_deposit: '입금',
    btn_withdraw: '출금',
    btn_transfer: '이체',
    btn_send: '보내기',
    btn_receive: '받기',
    btn_swap: '즉시 스왑',
    btn_stake: '스테이킹 수익',
    btn_confirm: '확인',
    btn_cancel: '취소',
    btn_close: '닫기',
    btn_copy: '복사',
    btn_copied: '복사 완료!',
    btn_refresh: '새로고침',
    btn_search: '검색...',
    btn_view_all: '전체 보기',
    btn_trade_now: '지금 거래',
    btn_explore: '탐색',
    btn_select_language: '언어 설정',
    btn_save_changes: '변경사항 저장',
    dash_total_balance: '금고 총 잔액',
    dash_net_worth: '추정 순자산 가치',
    auth_signin_title: 'TIXA 금고 로그인',
    auth_signup_title: '비수탁형 금고 생성',
    settings_language: '인터페이스 언어',
    settings_select_lang_title: '언어 선택 (99개국 지원)',
    settings_saved_success: '언어 설정이 성공적으로 저장되었습니다!'
  },
  it: {
    nav_home: 'Home',
    nav_markets: 'Mercati',
    nav_trading: 'Trading',
    nav_wallet: 'Portafoglio',
    nav_explorer: 'Blockchain',
    nav_transactions: 'Transazioni',
    nav_holdings: 'Top 100 & Obiettivi 2050',
    nav_developer: 'Strumenti Dev',
    nav_admin: 'Pannello Admin',
    nav_dashboard: 'Dashboard',
    nav_profile: 'Sicurezza & Profilo',
    nav_tokens: 'Tokens',
    btn_login: 'Accedi',
    btn_signup: 'Registrati',
    btn_logout: 'Esci',
    btn_connect_wallet: 'Connetti Cassaforte',
    btn_buy: 'Acquista',
    btn_sell: 'Vendi',
    btn_deposit: 'Deposita',
    btn_withdraw: 'Preleva',
    btn_transfer: 'Trasferisci',
    btn_send: 'Invia',
    btn_receive: 'Ricevi',
    btn_swap: 'Scambio Istantaneo',
    btn_stake: 'Staking & Guadagni',
    btn_confirm: 'Conferma',
    btn_cancel: 'Annulla',
    btn_close: 'Chiudi',
    btn_copy: 'Copia',
    btn_copied: 'Copiato!',
    btn_refresh: 'Aggiorna',
    btn_search: 'Cerca...',
    btn_view_all: 'Mostra Tutto',
    btn_trade_now: 'Fai Trading Ora',
    btn_explore: 'Esplora',
    btn_select_language: 'Lingua',
    btn_save_changes: 'Salva Modifiche',
    dash_total_balance: 'Saldo Totale Cassaforte',
    dash_net_worth: 'Patrimonio Netto Stimato',
    auth_signin_title: 'Accedi alla Cassaforte TIXA',
    auth_signup_title: 'Crea Cassaforte Non-Custodial',
    settings_language: 'Lingua dell’Interfaccia',
    settings_select_lang_title: 'Seleziona Lingua (99 Paesi Supportati)',
    settings_saved_success: 'Preferenza di lingua salvata con successo!'
  },
  id: {
    nav_home: 'Beranda',
    nav_markets: 'Pasar',
    nav_trading: 'Perdagangan',
    nav_wallet: 'Dompet',
    nav_explorer: 'Blockchain',
    nav_transactions: 'Riwayat Transaksi',
    nav_holdings: 'Top 100 & Target 2050',
    nav_developer: 'Alat Pengembang',
    nav_admin: 'Panel Admin',
    nav_dashboard: 'Dasbor Saya',
    nav_profile: 'Keamanan & Profil',
    nav_tokens: 'Daftar Token',
    btn_login: 'Masuk',
    btn_signup: 'Daftar',
    btn_logout: 'Keluar',
    btn_connect_wallet: 'Hubungkan Brankas',
    btn_buy: 'Beli',
    btn_sell: 'Jual',
    btn_deposit: 'Setor',
    btn_withdraw: 'Tarik',
    btn_transfer: 'Transfer',
    btn_send: 'Kirim',
    btn_receive: 'Terima',
    btn_swap: 'Tukar Instan',
    btn_stake: 'Stake & Hasilkan',
    btn_confirm: 'Konfirmasi',
    btn_cancel: 'Batal',
    btn_close: 'Tutup',
    btn_copy: 'Salin',
    btn_copied: 'Disalin!',
    btn_refresh: 'Segarkan',
    btn_search: 'Cari...',
    btn_view_all: 'Lihat Semua',
    btn_trade_now: 'Trading Sekarang',
    btn_explore: 'Jelajahi',
    btn_select_language: 'Bahasa',
    btn_save_changes: 'Simpan Perubahan',
    dash_total_balance: 'Total Saldo Brankas',
    dash_net_worth: 'Estimasi Nilai Bersih',
    auth_signin_title: 'Masuk ke Brankas TIXA',
    auth_signup_title: 'Buat Brankas Non-Kustodial',
    settings_language: 'Bahasa Antarmuka',
    settings_select_lang_title: 'Pilih Bahasa (Mendukung 99 Negara)',
    settings_saved_success: 'Preferensi bahasa berhasil disimpan!'
  }
};

class LanguageEngine {
  private currentLanguageCode: string;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Load from localStorage or default to 'en'
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && LANGUAGES_99.some(l => l.code === saved)) {
      this.currentLanguageCode = saved;
    } else {
      this.currentLanguageCode = 'en';
    }
  }

  public getLanguageCode(): string {
    return this.currentLanguageCode;
  }

  public getCurrentLanguage(): LanguageInfo {
    return (
      LANGUAGES_99.find(l => l.code === this.currentLanguageCode) ||
      LANGUAGES_99[0]
    );
  }

  public getAllLanguages(): LanguageInfo[] {
    return LANGUAGES_99;
  }

  public setLanguage(code: string): boolean {
    const found = LANGUAGES_99.find(l => l.code === code);
    if (!found) return false;

    this.currentLanguageCode = code;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, code);
        document.documentElement.lang = code;
        document.documentElement.dir = found.rtl ? 'rtl' : 'ltr';
      }
    } catch (e) {
      console.warn('Failed to save language to localStorage', e);
    }

    this.notify();
    return true;
  }

  public t(key: keyof TranslationDictionary, fallback?: string): string {
    // Check main translations
    const dict = TRANSLATIONS[this.currentLanguageCode] || EXTENDED_TRANSLATIONS[this.currentLanguageCode];
    if (dict && dict[key]) {
      return dict[key] as string;
    }

    // Fallback to English
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key] as string;
    }

    return fallback || key;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Error notifying language listener', err);
      }
    });
  }
}

export const languageEngine = new LanguageEngine();
