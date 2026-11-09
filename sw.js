/* Guardião Imagens — funcionamento offline
   Desenvolvido por Wendel Emílio de Souza Matias — oficial.respostas@gmail.com */
const CACHE = 'guardiao-imagens-v3.0.0';
const ARQUIVOS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.searchParams.has('hora')) return;
  e.respondWith((async () => {
    try {
      const rede = fetch(req);
      const limite = new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 5000));
      const resp = await Promise.race([rede, limite]);
      if (resp && resp.ok) {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return resp;
    } catch (err) {
      const salvo = await caches.match(req, { ignoreSearch: true });
      return salvo || caches.match('index.html');
    }
  })());
});
