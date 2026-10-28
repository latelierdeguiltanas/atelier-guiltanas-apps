self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
// Aucune interception des requêtes ou des réponses privées ; accès réseau uniquement.
