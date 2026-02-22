# Déploiement Piggyback

## Apache – fallback SPA (éviter 404 sur /piggyback/app)

Si le `.htaccess` ne est pas pris en compte (tu as toujours 404 après une ligne cassée), configurer Apache directement.

### Chemin physique

- Si ton site est servi depuis la **racine** du vhost et que les fichiers sont dans un sous-dossier, le chemin physique est du type :  
  `DocumentRoot/piggyback` → ex. `/var/www/html/piggyback` ou `/var/www/haythi.mg/public_html/piggyback`.
- Si tu utilises un **Alias** du type `Alias /piggyback /home/ubuntu/pback`, le chemin physique est `/home/ubuntu/pback`.

### Étapes

1. Éditer le VirtualHost (souvent `/etc/apache2/sites-available/000-default.conf` ou un fichier pour `haythi.mg`).
2. À l’intérieur du `<VirtualHost>`, ajouter le bloc `<Directory>` du fichier `apache-piggyback.conf`, en adaptant le chemin dans `<Directory ...>` au chemin physique réel (voir ci-dessus).
3. Vérifier la config :  
   `sudo apache2ctl configtest`
4. Recharger Apache :  
   `sudo systemctl reload apache2`

Ensuite, ouvrir ou recharger `https://haythi.mg/piggyback/app` : la page doit s’afficher au lieu du 404.
