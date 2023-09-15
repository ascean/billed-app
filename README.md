
## L'architecture du projet :
Le projet frontend est connecté à un service API backend qui est également lancé en local.
Le projet backend se trouve à l'adresse suivante : https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back

## Organisation :
Cloner le projet backend dans un dossier bill-app :
```
$ git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git
```

Cloner le projet frontend dans le dossier bill-app :
```
$ git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front.git
```

## Lancement de  l'application en local

### étape 1 - Lancer le backend :

Suivre les indications dans le README du projet backend.

### étape 2 - Lancer le frontend :

Se rendre au repo cloné :
```
$ cd Billed-app-FR-Front
```

Installer les packages npm (décrits dans `package.json`) :
```
$ npm install
```

Installer live-server pour lancer un serveur local :
```
$ npm install -g live-server
```

Lancer l'application :
```
$ live-server
```

Puis se rendre à l'adresse : `http://127.0.0.1:8080/`


## Lancer tous les tests en local avec Jest

```
$ npm run test
```

## Lancer un seul test

Installez jest-cli :

```
$npm i -g jest-cli
$jest src/__tests__/your_test_file.js
```

## Visualiser la couverture de test

`http://127.0.0.1:8080/coverage/lcov-report/`

## Comptes et utilisateurs :

Connexion possible avec les comptes suivants :

### administrateur : 
```
utilisateur : admin@test.tld 
mot de passe : admin
```
### employé :
```
utilisateur : employee@test.tld
mot de passe : employee
```
