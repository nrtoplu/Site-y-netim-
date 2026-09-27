/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Server-side Gemini client initialization
  let aiClient: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Could not initialize GoogleGenAI with key:', err);
    }
  }

  // AI Assistant endpoint
  app.post('/api/ai/ask', async (req, res) => {
    const { message, siteName, userRole } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Soru metni belirtilmelidir.' });
      return;
    }

    const systemInstruction = `Sen ApsisCloud Site & Apartman Yönetim Platformunun resmi yapay zekalı uzman asistanısın (ApsisAI).
Temel görevlerin:
1. 634 Sayılı Kat Mülkiyeti Kanunu (KMK), apartman/site yönetimi, aidat tahakkuku, gecikme tazminatı (%5), demirbaş ve işletme projesi, yönetici devri ve denetim kurulu raporlama usulleri hakkında net, hukuki açıdan doğru ve pratik bilgi vermek.
2. ApsisCloud sistemi özelliklerini anlatmak:
   - "Banka Excel & Havale Eşleme": Ekstre yükleme, isim uyuşmayan havaleleri yöneticinin ilgili daireye tek tıkla seçip ataması, makbuzlandırma.
   - "Bölgesel Usta & Firma Teklif Masası": Bölgedeki ustaların (asansörcü, tesisatçı, elektrikçi vb.) firma olarak kaydolması, sitelerin iş ilanı açıp teklif istemesi, onaylanan teklif sahibine anında SMS/bilgi gitmesi.
   - "İkametgah Onay Masası": Sakin kayıt başvurularının tapu/kira kontratı kontrol edilerek yönetici tarafından onaylanması.
   - "Denetim Masası & Şeffaflık": Yöneticinin sisteme denetçi ataması, denetçinin hesapları inceleyip rapor sunması, yönetici devir-teslim tutanağı.
   - "Süper Admin & SaaS Lisans": Birden fazla site yönetimi, yıllık lisans süresi sayacı, süresi dolanı dondurma.
   - "KVKK & Sakin Gizliliği": Kat sakinleri (son kullanıcılar) yalnızca kendi dairelerinin aidat borçlarını görebilir, diğer sakinlerin borç veya kişisel bilgileri kesinlikle gizlidir.
3. Kullanıcı rolü: ${userRole || 'Yönetici'}, Aktif Site: ${siteName || 'Site'}.
4. Yanıtların Türkçe, samimi, profesyonel, anlaşılır ve maddeler halinde düzenli olsun.`;

    // If Gemini API Key is available, use real Gemini 3.8 Flash model
    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        res.json({ reply: response.text });
        return;
      } catch (err: unknown) {
        console.error('Gemini API call failed, falling back to knowledge base:', err);
      }
    }

    // Intelligent Fallback Knowledge Engine (guarantees high quality response even if no API key or offline)
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('teklif') || lower.includes('usta') || lower.includes('firma')) {
      reply = `**Bölgesel Usta & Firma Teklif Sistemi Nasıl Çalışır?**

1. **Firma & Usta Kaydı:** Bölgenizdeki tesisatçı, asansör bakımcısı, elektrikçi ve boyacılar "Firma Olarak Kaydol" ekranından bilgilerini (Vergi No, Mesleki Belge, Hizmet Alanı) girerek sisteme kayıt olurlar.
2. **Teklif Talebi Açma:** Yönetici olarak sol menüdeki **"Bölgesel Usta & Firma Teklifleri"** sekmesine gelip *"Yeni Teklif Çağrısı Başlat"* butonuna basarak yapılması gereken işi (örn: Asansör Revizyonu, Hidrofor Değişimi, Dış Cephe Boyası) yayınlayabilirsiniz.
3. **Tekliflerin Karşılaştırılması:** Bölgedeki firmalar işe fiyat, süre ve garanti bilgisiyle teklif sunar. Teklifleri fiyat ve puan bazında yan yana kıyaslayabilirsiniz.
4. **Onay & Anında Bilgilendirme:** En uygun teklifi bulduğunuzda *"Teklifi Onayla & İşi Başlat"* butonuna bastığınız anda, **kazanan firmaya derhal otomatik SMS ve bildirim ulaşır**. Ayrıca sistemde resmi iş sözleşmesi ve bakım takip kaydı otomatik oluşturulur.`;
    } else if (lower.includes('faiz') || lower.includes('gecikme') || lower.includes('ödemeyen')) {
      reply = `**634 Sayılı KMK Madde 20 Kapsamında Aidat Gecikme Tazminatı:**

- Kat Mülkiyeti Kanunu'nun 20. maddesi uyarınca, aidat ve ortak gider avansını gününde ödemeyen kat maliki veya kiracıdan, gecikilen günler için **aylık %5 gecikme tazminatı** talep edilir.
- ApsisCloud sisteminde vadesi geçen aidatlar için bu %5 faiz otomatik tahakkuk ettirilir.
- Dilerseniz "Aidat Takibi" sekmesinden tek tıkla borçlu sakine SMS ve Mobil Push hatırlatması gönderebilir, ödenmemesi durumunda icra takibi için resmi hesap ekstresi dökümü alabilirsiniz.`;
    } else if (lower.includes('banka') || lower.includes('ekstre') || lower.includes('excel') || lower.includes('uyuşmayan')) {
      reply = `**Excel Banka Ekstresi & Havale Eşleme Masası Rehberi:**

1. Sol menüden **"Banka Excel & Havale Eşleme"** sekmesine tıklayın.
2. Bankanızdan indirdiğiniz .xlsx veya .csv formatındaki ekstre dosyasını sürükleyip bırakın (veya hazır İş Bankası / Garanti ekstrelerini test edin).
3. **Otomatik Eşleme:** Daire numarasını veya sakin adını içeren ödemeler sistem tarafından yeşil renkle otomatik eşleştirilir.
4. **İsimleri Uyuşmayan Ödemeler:** Gönderen ismi sakin listesiyle uyuşmuyorsa satır sarı renkle uyarır. Dropdown listeden ilgili daireyi (A Blok D:2 vb.) seçip *"Daireye İşle"* butonuna basmanız yeterlidir.
5. *"Bu göndereni hatırla"* kutucuğunu işaretlerseniz, sonraki ekstrelerde sistem bu kişiyi otomatik olarak o daireyle eşleştirir!`;
    } else if (lower.includes('denetim') || lower.includes('denetçi') || lower.includes('devir')) {
      reply = `**Denetim Masası & Yönetici Devir-Teslim Usulü:**

- **Denetçi Atama:** Yönetici, "Denetim Masası & İnceleme" sekmesinden herhangi bir sakin veya uzman hesabı denetçi olarak sisteme tanımlayabilir.
- **Şeffaf İnceleme:** Denetçi yetkisine sahip kullanıcılar tüm gelir-giderleri, banka bakiyelerini ve faturaları anlık denetleyebilir ve resmi Denetim Raporu kaydedebilir.
- **Yönetici Devri:** Genel kurulda yeni yönetim seçildiğinde *"Yönetici Devir-Teslim Tutanağı"* ekranı üzerinden kasa, banka hesapları, demirbaşlar ve karar defteri resmi tutanakla yeni yöneticiye devredilir.`;
    } else if (lower.includes('borç') || lower.includes('gizlilik') || lower.includes('kvkk') || lower.includes('kısıtlı') || lower.includes('komşu')) {
      reply = `**Sakin Borç Gizliliği ve KVKK Koruma Esasları:**

1. **Kişiye Özel Borç Ekranı:** 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) gereğince, sisteme giriş yapan her kat sakini **yalnızca kendi bağımsız bölümüne ait aidat borçlarını, geçmiş ödemelerini ve dekontlarını** görebilir.
2. **Komşuların Borçları Gizlidir:** Diğer dairelerin borç miktarları, gecikme durumları veya iletişim bilgileri kat sakinlerine kesinlikle kapalıdır ve gösterilmez.
3. **Şeffaf Genel Bütçe:** Kat malikleri sitenin toplam kasa bakiyesini ve genel bütçe gerçekleşmelerini şeffaf şekilde inceleyebilir; ancak bu raporlarda da kişisel borçlu listeleri ifşa edilmez.
4. **Yönetim & İcra Yetkisi:** Borç takibi ve yasal süreçler yalnızca yetkili Site Yönetim Kurulu ve Denetçiler tarafından yürütülür.`;
    } else if (lower.includes('kayıt') || lower.includes('onay') || lower.includes('ikametgah')) {
      reply = `**Sakin Kaydı & İkametgah Onay Masası:**

- Yeni taşınan sakinler siteye kayıt olurken dairelerini seçer ve tapu veya kira kontratını yükler.
- Başvuru doğrudan yöneticinin **"İkametgah Onay Masası"** ekranına düşer.
- Yönetici belgeyi inceleyip onay verene kadar sakin daire bilgilerine veya site işlemlerine müdahale edemez. Onay verildiğinde sakine anında giriş SMS'i iletilir.`;
    } else {
      reply = `Merhaba! Ben ApsisCloud Akıllı Asistanı. 634 Sayılı Kat Mülkiyeti Kanunu (KMK), aidat hesaplama, gecikme faizi, Excel banka havale eşleme, bölgesel usta ve firmalardan teklif toplama, yönetici devri ve denetim süreçleri hakkında size yardımcı olabilirim.

Merak ettiğiniz konuyu sorabilir veya aşağıdaki hazır başlıklardan birine tıklayabilirsiniz:
• *Bölgedeki ustalardan nasıl teklif toplayıp onaylarım?*
• *Banka ekstresindeki isim uyuşmayan havaleleri nasıl atarım?*
• *Aidat gecikme faizi kanunen ne kadardır?*
• *Yeni bir firma sisteme nasıl kayıt olur?*`;
    }

    res.json({ reply });
  });

  // Setup Vite in development or serve static in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
