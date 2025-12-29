# Learning Platform

Platforma edukacyjna z kursami tradingowymi, systemem płatności (PayPal, Stripe) i zabezpieczeniami DRM.

## Funkcjonalności

- ✅ Rejestracja i logowanie użytkowników
- ✅ System płatności: PayPal, BLIK, Apple Pay, Karty kredytowe (Stripe)
- ✅ Kursy z lekcjami video
- ✅ Zabezpieczony odtwarzacz video z:
  - Watermarkingiem (dynamiczne watermarki z ID użytkownika)
  - Wykrywaniem screen recording
  - Ochroną przed pobieraniem (token-based streaming)
  - Blokadą prawych przycisków myszy
  - Blokadą skrótów klawiszowych (DevTools, Print Screen)
- ✅ Dashboard użytkownika z postępem w kursach
- ✅ Panel administracyjny
- ✅ Rate limiting dla endpointów API

## Wymagania

- Node.js 18+
- PostgreSQL
- PayPal Developer Account (dla płatności PayPal)
- Stripe Account (dla płatności BLIK, Apple Pay, karty)

## Instalacja

1. Zainstaluj zależności:

```bash
npm install
```

2. Skonfiguruj zmienne środowiskowe:

```bash
cp .env.example .env
```

Edytuj `.env` i uzupełnij wszystkie wymagane wartości.

3. Uruchom migracje bazy danych:

```bash
npm run db:generate
npm run db:push
```

4. Wypełnij bazę danymi startowymi:

```bash
npm run db:seed
```

5. Uruchom serwer deweloperski:

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

## Konfiguracja płatności

### PayPal

1. Zarejestruj się w [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Utwórz aplikację i uzyskaj Client ID oraz Client Secret
3. Dla środowiska sandbox użyj testowych danych logowania
4. Skonfiguruj webhook URL w PayPal Dashboard: `https://twoja-domena.com/api/payments/webhook`
   - Event: `PAYMENT.CAPTURE.COMPLETED`

### Stripe (BLIK, Apple Pay, Karty)

1. Zarejestruj się w [Stripe Dashboard](https://dashboard.stripe.com/)
2. Uzyskaj API keys (Secret Key i Publishable Key) ze Stripe Dashboard
3. Włącz BLIK w Stripe Dashboard (Settings > Payment methods)
4. Skonfiguruj webhook w Stripe Dashboard:
   - URL: `https://twoja-domena.com/api/payments/stripe-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Skopiuj Webhook Signing Secret do `STRIPE_WEBHOOK_SECRET`

## Tworzenie konta administratora

Domyślnie użytkownicy mają rolę `USER`. Aby utworzyć konto administratora:

1. Zarejestruj się przez interfejs użytkownika
2. W bazie danych zmień rolę użytkownika:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'twoj@email.com';
```

## Struktura projektu

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Endpointy autoryzacji
│   │   ├── payments/      # Endpointy płatności
│   │   ├── courses/       # Endpointy kursów
│   │   ├── lessons/       # Endpointy lekcji
│   │   └── admin/         # Endpointy panelu admina
│   ├── login/             # Strona logowania
│   ├── register/          # Strona rejestracji
│   ├── dashboard/         # Dashboard użytkownika
│   ├── courses/           # Strony kursów
│   └── admin/             # Panel administracyjny
├── components/            # Komponenty React
│   ├── VideoPlayer.tsx   # Zabezpieczony odtwarzacz video
│   ├── CourseCard.tsx    # Karta kursu
│   └── ProtectedRoute.tsx # Wrapper dla chronionych stron
├── lib/                   # Biblioteki pomocnicze
│   ├── auth.ts           # Funkcje autoryzacji
│   ├── paypal.ts         # Integracja PayPal
│   ├── stripe.ts         # Integracja Stripe
│   ├── video-security.ts # Zabezpieczenia video
│   └── rate-limit.ts     # Rate limiting
└── prisma/               # Prisma ORM
    ├── schema.prisma     # Schema bazy danych
    └── seed.ts           # Seed data
```

## Zabezpieczenia video

Platforma implementuje wielowarstwowe zabezpieczenia:

1. **Token-based streaming**: Każde żądanie video wymaga ważnego tokena JWT
2. **Watermarking**: Dynamiczne watermarki z ID użytkownika (zmiana pozycji co 5 sekund)
3. **Screen capture detection**: Wykrywanie ukrycia strony i utraty focusu
4. **Blokada skrótów**: F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Print Screen
5. **Blokada prawego przycisku**: Context menu wyłączone
6. **Rate limiting**: 10 żądań tokena video na minutę na IP

**Uwaga**: Te zabezpieczenia nie są 100% skuteczne. Dla maksymalnej ochrony zaleca się użycie:
- Profesjonalnego systemu DRM (Widevine, PlayReady)
- Hostingu video w dedykowanym serwisie (Cloudflare Stream, AWS MediaConvert)
- Dodatkowych zabezpieczeń po stronie serwera

## Licencja

Prywatny projekt

