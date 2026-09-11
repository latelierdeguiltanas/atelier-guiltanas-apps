# GitHub Pages — activation requise

## État

- Repository : `latelierdeguiltanas/atelier-guiltanas-apps`
- Branche : `main`
- Commit préparé : `e575432b27ac74afd31beeb6e97c50d87aa28d0f`
- Product Master SHA-256 : `565cc873e6429ce524fcea371d0a3fe11fe5ab96e6757e4177d4f7d8433b5559`
- Workflow : `.github/workflows/pages.yml`
- Statut du premier déploiement : échec pendant `Configure Pages`
- Cause GitHub : `Resource not accessible by integration`

## Action manuelle strictement nécessaire

Dans GitHub :

1. Ouvrir **Settings** du repository.
2. Ouvrir **Pages**.
3. Dans **Build and deployment**, sélectionner **GitHub Actions** comme source.
4. Enregistrer si GitHub affiche un bouton de validation.

Après cette activation, relancer le workflow **Deploy GitHub Pages** ou pousser un nouveau commit sans modification fonctionnelle.

## Limite

Cette activation est un réglage d’administration du repository. Le connecteur GitHub autorisé peut écrire le code et les workflows, mais ne possède pas l’autorisation d’administration Pages nécessaire pour créer le site Pages.
