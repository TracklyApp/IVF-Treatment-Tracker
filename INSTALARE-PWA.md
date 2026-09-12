# IVF Tracker — instalare PWA

## Publicare

Publică împreună, în același director pe un site HTTPS:

- `IVF-Fertility-Treatment-Tracker.html`
- `manifest.webmanifest`
- `pwa.js`
- `sw.js`
- directorul `icons/`, cu toate cele trei fișiere PNG

Deschide adresa completă către `IVF-Fertility-Treatment-Tracker.html`. Fișierul local (`file://`), trimiterea HTML-ului prin mesagerie și HTTP pe adresa IP din rețea nu permit instalarea PWA cu service worker. `localhost` este permis pentru dezvoltare pe același calculator.

Servește JavaScript ca `text/javascript`, manifestul ca `application/manifest+json` și PNG ca `image/png`. Nu redirecționa cererile pentru fișiere lipsă către HTML. Recomandare de antete HTTP: `Cache-Control: no-cache` pentru HTML, manifest, pwa.js și sw.js; `Cache-Control: public, max-age=86400` pentru iconițe. Nu utiliza `immutable` pentru aceste nume de fișiere reutilizate. Publică într-un director dedicat, fără un alt service worker cu același scope.

## Android

1. Deschide linkul HTTPS în Chrome, cu internet activ.
2. Apasă **Install App** și confirmă instalarea.
3. Dacă browserul nu oferă promptul, folosește meniul Chrome → **Install app / Add to Home screen**. Disponibilitatea și denumirea depind de browser.
4. Pornește aplicația din iconița **IVF Tracker** de pe Home Screen.
5. Așteaptă mesajul **Offline ready** înainte să dezactivezi internetul.

## iPhone

1. Deschide linkul HTTPS în Safari.
2. Apasă **Share** (din meniul More, dacă este cazul) → **Add to Home Screen**. Dacă opțiunea lipsește, verifică **Edit Actions**.
3. Activează **Open as Web App**, dacă apare, apoi apasă **Add**.
4. Deschide iconița **IVF Tracker** de pe Home Screen. Aplicația se deschide standalone, fără bara browserului.
5. Așteaptă mesajul **Offline ready** cu internet activ.

Butonul Install App afișează instrucțiunile când browserul nu oferă instalare programatică, inclusiv pe iPhone.

## Date și offline

Formularele, înregistrările salvate și funcțiile locale de backup sunt disponibile offline după prima încărcare completă. Descărcarea/distribuirea backupului poate folosi interfața sistemului telefonului. Datele rămân în localStorage; nu se sincronizează între dispozitive. Exportă un backup JSON din vechiul tracker și importă-l în aplicația instalată dacă treci de la fișier local la HTTPS ori schimbi browserul, dispozitivul sau domeniul. Verifică datele după import; păstrează separat codul de activare.

Cache-ul PWA stochează doar resursele statice. Actualizările nu modifică înregistrările sau activarea existente. Ștergerea datelor site-ului sau eliminarea lor de către sistem poate elimina datele și cache-ul: păstrează backupuri externe.

## Actualizări controlate

1. Modifică fișierele aplicației și crește `VERSION` din `sw.js` la fiecare versiune. Nu reutiliza o versiune de cache publicată.
2. Publică întregul set ca o versiune atomică pe hosting (ideal); dacă hostingul nu permite, încarcă `sw.js` ultimul. Evită schimbarea fișierelor pe parcursul unei descărcări de release.
3. Aplicația verifică actualizările la deschidere; utilizatorul poate apăsa și **Check for updates**.
4. Noua versiune este instalată numai dacă toate resursele necesare pot fi descărcate. Un eșec păstrează versiunea activă.
5. La mesajul **Update ready**, salvează formularele și închide toate ferestrele/taburile trackerului, inclusiv aplicația de pe telefon. Redeschide apoi aplicația. Nu se forțează reîncărcarea formularelor deschise.
6. Activarea șterge doar cache-urile vechi ale acestui tracker și scope. localStorage rămâne intact.

Pentru rollback, republică fișierele versiunii bune cu un număr VERSION nou. Nu modifica schema datelor fără o migrare separată și verificată.

## Verificare după publicare

- Verifică instalarea și iconița pe Android și iPhone reale.
- Pornește din Home Screen și confirmă lipsa barei browserului.
- După Offline ready, activează modul avion, închide/redeschide aplicația, salvează o înregistrare și verifică persistența după o nouă deschidere.
- Exportă și importă un backup de test.
- Publică o versiune nouă cu VERSION incrementat: cu un formular deschis, confirmă că nu se reîncarcă automat; salvează și închide toate ferestrele, apoi verifică noua versiune și datele păstrate.
- Simulează un fișier de release lipsă și verifică faptul că versiunea precedentă funcționează în continuare.

Surse: [ciclul de viață al service worker](https://web.dev/articles/service-worker-lifecycle), [instalarea pe iPhone](https://support.apple.com/en-kw/guide/iphone/iphea86e5236/ios).
