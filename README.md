# Nail Art X

Lightbox digitale per nail artist: mostra un design **in scala reale** sullo schermo dello smartphone, così puoi appoggiare una tip e ricalcarlo.

## Funzionalità

- **Design**: carichi un'immagine dalla galleria e la regoli con gesture (1 dito sposta, 2 dita zoom e rotazione, doppio tap centra) o con controlli precisi: opacità, larghezza in mm, rotazione a step di 1°/15°, flip orizzontale e verticale.
- **Calibrazione con la tip**: inserisci la larghezza reale della tip (o scegli la taglia #0–#9), la appoggi sullo schermo e trascini o usi lo slider finché la sagoma combacia. Il risultato è un fattore `px/mm` salvato sul dispositivo. Lo puoi rifinire a mano (±0,5%, valore numerico) e verificare con un righello millimetrato a schermo.
- **Guida unghia**: sagoma vettoriale square, oval, coffin, almond o stiletto, con larghezza e lunghezza in mm, opacità, inclinazione e colore.
- **Blocco di sicurezza**: nasconde l'interfaccia e ignora ogni tocco. Si sblocca solo con uno *slide-to-unlock* deliberato. Attiva lo schermo sempre acceso (Wake Lock) e, dove supportato, il fullscreen.
- **Web app installabile (PWA)**: su Android/Chrome compare il pulsante "Installa l'app"; su iPhone si usa Condividi → *Aggiungi alla schermata Home*. Dopo la prima visita funziona anche offline.

## Modello di scala

Tutto ciò che è fisico (dimensioni del design, posizione, guida) è espresso in **millimetri** e convertito con un unico fattore `pxPerMm`. Se ricalibri, le misure reali restano invariate.
Prima della calibrazione, `pxPerMm` è stimato dal lato corto dello schermo diviso per una larghezza tipica del telefono (~68 mm).

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/deploy.yml` compila e pubblica l'app a ogni push su `main` (o a mano da *Actions → Deploy to GitHub Pages → Run workflow*).

Configurazione una tantum: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

L'app sarà su `https://<utente>.github.io/<repo>/`. Tutti i percorsi sono relativi (`base: './'`), quindi funziona in qualsiasi sotto-cartella.

## Sviluppo

```bash
npm install
npm run dev      # server su rete locale: aprilo dal telefono con l'IP del PC
npm run build    # build statica in dist/ (deploy su qualsiasi hosting statico)
```

Stack: Vite · React · TypeScript · Tailwind CSS v4 · Zustand · @use-gesture/react.

> Nota: il service worker (offline) e il Wake Lock richiedono HTTPS o `localhost`.
