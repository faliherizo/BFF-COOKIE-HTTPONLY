# Tutoriel complet : Pipeline CI/CD Azure DevOps — Projet Java/Maven

> **Auteur** : Anonyme  
> **Date** : 2026-02-13  
> **Projet** : Application Java multi-modules Maven (ex : MonProjet)

---

## Table des matières

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Prérequis](#2-prérequis)
3. [Structure des fichiers du pipeline](#3-structure-des-fichiers-du-pipeline)
4. [Fichier principal : azure-pipelines.yml](#4-fichier-principal--azure-pipelinesyml)
5. [Orchestrateur : ci.yml](#5-orchestrateur--ciyml)
6. [Templates en détail](#6-templates-en-détail)
   - [6.1 jdk-setup.yml — Configuration du JDK](#61-jdk-setupyml--configuration-du-jdk)
   - [6.2 quality.yml — Qualité, Tests unitaires et Couverture](#62-qualityyml--qualité-tests-unitaires-et-couverture)
   - [6.3 static-analysis.yml — Analyse statique SAST](#63-static-analysisyml--analyse-statique-sast)
   - [6.4 security.yml — Orchestrateur de sécurité](#64-securityyml--orchestrateur-de-sécurité)
   - [6.5 github-advanced-security.yml — CodeQL & Dependency Scanning](#65-github-advanced-securityyml--codeql--dependency-scanning)
   - [6.6 owasp-dependency-check.yml — Analyse des vulnérabilités SCA](#66-owasp-dependency-checkyml--analyse-des-vulnérabilités-sca)
   - [6.7 snyk.yml — Scan Snyk SCA & SAST](#67-snykyml--scan-snyk-sca--sast)
   - [6.8 owaspzap.yml — Tests DAST](#68-owaspzapyml--tests-dast)
   - [6.9 build.yml — Compilation et publication d'artefacts](#69-buildyml--compilation-et-publication-dartefacts)
7. [Partie CD : Continuous Delivery / Deployment](#7-partie-cd--continuous-delivery--deployment)
   - [7.1 Stratégie de déploiement multi-environnements](#71-stratégie-de-déploiement-multi-environnements)
   - [7.2 Stage Deploy_Dev — Déploiement automatique en DEV](#72-stage-deploy_dev--déploiement-automatique-en-dev)
   - [7.3 Stage Deploy_Prod — Déploiement avec approbation en PROD](#73-stage-deploy_prod--déploiement-avec-approbation-en-prod)
  - [7.4 Pipeline de release classique (release.yml)](#74-pipeline-de-release-classique-releaseyml)
   - [7.5 Configurer les environnements et approbations](#75-configurer-les-environnements-et-approbations)
8. [Variables du pipeline](#8-variables-du-pipeline)
9. [Flux d'exécution complet CI/CD](#9-flux-dexécution-complet-cicd)
10. [Comment personnaliser le pipeline](#10-comment-personnaliser-le-pipeline)
11. [Dépannage courant](#11-dépannage-courant)
12. [Profil CV — Compétences DevSecOps](#12-profil-cv--compétences-devsecops)

---

## 1. Vue d'ensemble de l'architecture

Le pipeline CI/CD est conçu selon une approche **modulaire par templates** avec 4 stages principaux exécutés séquentiellement :

```
azure-pipelines.yml        (Point d'entrée)
  └── azure-pipelines/ci.yml   (Orchestrateur des stages)
        ├── templates/quality.yml          ← Stage 1 : Qualité & Tests
        ├── templates/static-analysis.yml  ← Stage 2 : Analyse statique (SAST)
        ├── templates/security.yml         ← Stage 3 : Sécurité (SCA/DAST)
        │     ├── github-advanced-security.yml
        │     ├── owasp-dependency-check.yml
        │     ├── snyk.yml
        │     └── owaspzap.yml
        └── templates/build.yml            ← Stage 4 : Compilation & Artefacts
```

Chaque stage est **contrôlé par une variable booléenne** (`control.quality`, `control.security`, etc.) qui permet d'activer ou désactiver individuellement chaque étape.

### Diagramme de flux

```
┌─────────────────────┐
│  azure-pipelines.yml│  Déclencheur : push sur main/develop/feature/*
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│      ci.yml         │  Orchestre les 4 stages
└─────────┬───────────┘
          │
    ┌─────┼──────────────────────────────────┐
    ▼     ▼                                  ▼
┌────────┐ ┌──────────────┐           ┌──────────┐
│Quality │ │StaticAnalysis│           │ Security │
│ Check  │ │  (SAST)      │           │  Check   │
└───┬────┘ └──────┬───────┘           └────┬─────┘
    │             │                        │
    │      ┌──────┼───────┐          ┌─────┼──────────────┐
    │      ▼      ▼       │          ▼     ▼     ▼        ▼
    │  Semgrep  SpotBugs  │     GH-Adv  OWASP  Snyk   ZAP
    │                     │     Security  DC
    │                     │
    └──────────┬──────────┘
               ▼
        ┌────────────┐
        │   Build    │  Compilation Maven + Publication artefacts
        └────────────┘
```

> **Note** : `StaticAnalysis` et `Security` dépendent tous les deux de `QualityCheck` et peuvent s'exécuter en parallèle.

---

## 2. Prérequis

### Côté Azure DevOps

| Élément | Description |
|---------|-------------|
| **Groupe de variables** | `var-projet-pipeline` contenant toutes les variables du pipeline |
| **Pool d'agents** | `vmss-ado-agents-prod` (VM Scale Set) ou `ubuntu-latest` (Microsoft-hosted) |
| **Feeds Artifacts** | Exemples : `MonProjet-ARCHIVA`, `MonProjet-EXTERNE` (ou vos feeds Azure Artifacts) |
| **Service Connection** | `snyk` (pour l'intégration Snyk) |
| **Extension AdvancedSecurity** | GitHub Advanced Security pour Azure DevOps |

### Côté projet

| Élément | Description |
|---------|-------------|
| **JDK** | Oracle JDK stocké dans un Azure Blob Storage |
| **Maven** | Projet multi-modules (ex : `core`, `api`, `mvc`) |
| **Java** | Version 11 (configurée dans `maven-compiler-plugin`) |

---

## 3. Structure des fichiers du pipeline

```
monprojet/
├── azure-pipelines.yml                    # Point d'entrée principal
├── azure-pipelines/
│   ├── ci.yml                             # Orchestrateur des stages
│   └── templates/
│       ├── jdk-setup.yml                  # Configuration JDK (réutilisable)
│       ├── quality.yml                    # Tests unitaires + couverture + qualité
│       ├── static-analysis.yml            # Semgrep + SpotBugs
│       ├── security.yml                   # Orchestrateur des scans de sécurité
│       ├── github-advanced-security.yml   # CodeQL + Dependency Scanning
│       ├── owasp-dependency-check.yml     # OWASP Dependency Check
│       ├── snyk.yml                       # Snyk SCA + SAST
│       └── owaspzap.yml                   # OWASP ZAP (DAST)
└── build.yml                              # Compilation Maven + artefacts
```

---

## 4. Fichier principal : `azure-pipelines.yml`

C'est le **point d'entrée** du pipeline. Il définit la configuration globale.

```yaml
# Nom de la pipeline (format : AAAAMMJJ.revision)
name: $(Date:yyyyMMdd)$(Rev:.r)

# Variables globales  
variables:
- group: var-projet-pipeline         # Groupe de variables dans Azure DevOps
- name: rootFolder
  value: '$(System.DefaultWorkingDirectory)'
- name: tag
  value: '$(Build.BuildId)'
- name: SNYK_TOKEN
  value: $(snyk.token)

# Déclencheurs
trigger: 
  branches:
    include: 
      - main
      - master
      - develop
      - feature/*

pr:
- none                           # Pas de déclenchement sur Pull Request

# Pool d'agents
pool:
  vmImage: ubuntu-latest          # Agent Microsoft-hosted Ubuntu

# Appel de l'orchestrateur
stages:
- template: azure-pipelines/ci.yml
```

### Explication détaillée

| Section | Rôle |
|---------|------|
| `name` | Nomme chaque exécution selon le format `20260213.1`, `20260213.2`, etc. |
| `variables.group` | Charge le groupe de variables `var-projet-pipeline` défini dans Azure DevOps (Library). Il contient les secrets et variables partagées. |
| `trigger` | Déclenche automatiquement le pipeline lors d'un push sur `main`, `master`, `develop` ou toute branche `feature/*`. |
| `pr: none` | Désactive le déclenchement automatique sur les Pull Requests. |
| `pool` | Utilise un agent Ubuntu hébergé par Microsoft. En production, on utiliserait `vmss-ado-agents-prod`. |
| `stages` | Délègue toute l'orchestration au fichier `ci.yml`. |

### Comment configurer le groupe de variables

1. Allez dans **Azure DevOps** → **Pipelines** → **Library**
2. Cliquez sur **+ Variable group**
3. Nommez-le `var-projet-pipeline`
4. Ajoutez les variables nécessaires (voir [Section 7](#7-variables-du-pipeline))

---

## 5. Orchestrateur : `ci.yml`

Ce fichier organise l'ordre d'exécution des stages.

```yaml
stages:
  # Stage 1 : Qualité du code
  - template: templates/quality.yml

  # Stage 2 : Analyse statique (en parallèle avec Stage 3)
  - template: templates/static-analysis.yml

  # Stage 3 : Scans de sécurité (en parallèle avec Stage 2)
  - template: templates/security.yml

  # Stage 4 : Compilation (après que Quality ait réussi)
  - template: templates/build.yml
```

### Ordre d'exécution et dépendances

```
QualityCheck ──┬──→ StaticAnalysis (dependsOn: QualityCheck)
               ├──→ SecurityCheck  (dependsOn: QualityCheck)
               └──→ Build          (dependsOn: QualityCheck)
```

- **Stage 1** (`QualityCheck`) s'exécute en premier.
- **Stages 2 et 3** (`StaticAnalysis`, `SecurityCheck`) s'exécutent **en parallèle** car ils dépendent uniquement de `QualityCheck`.
- **Stage 4** (`Build`) dépend de `QualityCheck` et s'exécute si la qualité est validée.

---

## 6. Templates en détail

### 6.1 `jdk-setup.yml` — Configuration du JDK

> **Type** : Template de **steps** (réutilisable dans plusieurs jobs)  
> **Rôle** : Télécharger, installer et configurer le JDK Oracle sur l'agent de build.

Ce template est **inclus dans presque tous les jobs** qui nécessitent une compilation Java.

#### Étapes du template

```
1. Télécharger le JDK depuis Azure Blob Storage
2. Installer le JDK avec JavaToolInstaller
3. Configurer JAVA_HOME et le PATH
4. Installer OpenSSL et les certificats SSL
```

#### Étape 1 : Téléchargement du JDK depuis Blob Storage

```yaml
- task: Bash@3
  displayName: Azure CLI - Copie de Oracle JDK $(jdk.version.exacte) du blob vers l'agent
  inputs:
    targetType: 'inline'
    script: |
      mkdir -p $(Build.SourcesDirectory)/$(dossier.jdk)
      az storage blob download \
        --account-name $(blob.name) \
        --account-key $(blob.key) \
        --container-name $(blob.container) \
        --name jdk-$(jdk.version.exacte)_linux-x64_bin.tar.gz \
        --file $(Build.SourcesDirectory)/$(dossier.jdk)/jdk-$(jdk.version.exacte)_linux-x64_bin.tar.gz
```

**Pourquoi ?** Le JDK Oracle n'est pas disponible nativement sur les agents. Il est stocké dans un Blob Azure pour un accès rapide et contrôlé.

**Variables requises** :
- `blob.name` : Nom du compte de stockage Azure
- `blob.key` : Clé d'accès au compte de stockage (⚠️ secret)
- `blob.container` : Nom du conteneur
- `jdk.version.exacte` : Ex: `11.0.20`
- `dossier.jdk` : Dossier de destination sur l'agent

#### Étape 2 : Installation du JDK

```yaml
- task: JavaToolInstaller@0
  displayName: 'Installation du JDK cible'
  inputs:
    versionSpec: '$(jdk.version.courte)'          # Ex: '11'
    jdkArchitectureOption: '$(jdk.architecture)'   # Ex: 'x64'
    jdkSourceOption: 'LocalDirectory'
    jdkFile: '$(Build.SourcesDirectory)/$(dossier.jdk)/jdk-$(jdk.version.exacte)_linux-$(jdk.architecture)_bin.tar.gz'
    jdkDestinationDirectory: '$(agent.toolsDirectory)/jdk$(jdk.version.courte)'
    cleanDestinationDirectory: true
    createExtractDirectory: false
```

**Comment ça marche** : La tâche `JavaToolInstaller@0` extrait l'archive tar.gz et configure l'agent pour utiliser ce JDK.

#### Étape 3 : Configuration JAVA_HOME

```yaml
- task: Bash@3
  displayName: 'Set Java Home et préparation pre-compilation'
  inputs:
    targetType: 'inline'
    script: |
      export JAVA_HOME=$(agent.toolsDirectory)/jdk$(jdk.version.courte)
      rm -rf .mvn          # Supprime les configs développeur locales
      java -version
      echo "##vso[task.setvariable variable=JAVA_HOME]$(JAVA_HOME_$(jdk.version.courte)_$(jdk.architecture))"
      echo "##vso[task.setvariable variable=PATH]$(JAVA_HOME)/bin:$(PATH)"
```

**Points importants** :
- `rm -rf .mvn` : Supprime le dossier `.mvn` (maven wrapper / configurations locales) qui pourrait entrer en conflit avec le pipeline.
- `##vso[task.setvariable ...]` : Commande Azure DevOps pour propager les variables aux étapes suivantes.

#### Étape 4 : Installation OpenSSL et certificats

```yaml
- task: Bash@3
  displayName: 'Installation OpenSSL et les certificats'
  inputs:
    targetType: 'inline'
    script: |
      sudo apt-get install openssl
      sudo apt-get install ca-certificates
      sudo dpkg-reconfigure ca-certificates
      sudo update-ca-certificates
```

**Pourquoi ?** Garantit que l'agent peut communiquer en HTTPS avec les registres Maven, Azure Artifacts, et autres services externes.

---

### 6.2 `quality.yml` — Qualité, Tests unitaires et Couverture

> **Type** : Template de **stage**  
> **Stage** : `QualityCheck`  
> **Condition** : `control.quality == 'true'`  
> **Rôle** : Exécuter les tests unitaires, générer les rapports de qualité (JaCoCo, PMD, Checkstyle, SpotBugs) et vérifier les vulnérabilités OWASP.

#### Architecture du stage

```
QualityCheck
  └── Job: UnitTestsAndAnalysis
        ├── jdk-setup.yml
        ├── Cache Maven
        ├── Authentification Maven
        ├── Maven: clean verify          → Tests unitaires
        ├── Maven: site                  → Rapports qualité
        ├── Maven: dependency-check      → OWASP
        ├── Publish Code Coverage        → JaCoCo
        └── Publish Artifacts            → Rapports
```

#### Détail des tâches Maven

| Commande Maven | But | Timeout |
|----------------|-----|---------|
| `clean verify` | Compile le code, exécute les tests unitaires, et vérifie l'intégrité du projet | 10 min |
| `site` | Génère les rapports HTML (Checkstyle, PMD, JaCoCo, SpotBugs) | 20 min |
| `org.owasp:dependency-check-maven:check` | Scan des dépendances pour CVE connues | 20 min |

#### Options Maven importantes

```
-DnvdApiKey=$(NVD_API_KEY)    # Clé API de la NVD (National Vulnerability Database)
-T 1C                          # Threads = 1 par core CPU (build parallèle)
-DskipSite=true               # Ne pas regénérer le site pendant le verify
-DskipTests=true               # Utilisé pour le site, car les tests sont déjà passés
```

#### Publication des résultats

| Tâche | Ce qui est publié |
|-------|-------------------|
| `PublishCodeCoverageResults@2` | Rapport JaCoCo (couverture de code) visible dans l'onglet **Code Coverage** |
| `CopyFiles@2` + `PublishBuildArtifacts@1` | Tous les rapports du dossier `target/site/` comme artefact téléchargeable `RapportsQualiteCode` |

---

### 6.3 `static-analysis.yml` — Analyse statique SAST

> **Type** : Template de **stage**  
> **Stage** : `StaticAnalysis`  
> **Dépendance** : `QualityCheck`  
> **Condition** : `control.analyse.statique == 'true'`  
> **Rôle** : Analyse statique du code source pour détecter les vulnérabilités et bugs potentiels.

#### Jobs parallèles

Ce stage contient **2 jobs en parallèle** :

##### Job 1 : Semgrep SAST Analysis

[Semgrep](https://semgrep.dev/) est un outil d'analyse statique open-source léger et rapide.

```yaml
steps:
  # Installation de Semgrep via pip
  - script: |
      pip install semgrep
      semgrep scan --config p/java --json --output semgrep-report.json
      semgrep scan --config=p/owasp-top-ten --sarif-output=semgrep/semgrep.sarif
```

| Action | Détail |
|--------|--------|
| `--config p/java` | Utilise les règles prédéfinies pour Java |
| `--config p/owasp-top-ten` | Vérifie les 10 principales vulnérabilités OWASP |
| `--json` | Export en JSON pour traitement |
| `--sarif-output` | Export au format SARIF pour GitHub Advanced Security |

Les résultats sont publiés à 3 endroits :
1. **Artefact** `SemgrepReport` (JSON)
2. **GitHub Advanced Security** via `AdvancedSecurity-Publish@1` (SARIF)
3. **Artefact** `CodeAnalysisLogs` (SARIF)

##### Job 2 : SpotBugs Static Analysis

[SpotBugs](https://spotbugs.github.io/) analyse le bytecode Java compilé pour détecter des bugs.

```yaml
steps:
  - template: jdk-setup.yml
  - task: Maven@4
    inputs:
      goals: 'spotbugs:check'
      mavenOptions: '-Xmx3072m'
```

Le rapport XML (`spotbugsXml.xml`) est publié comme artefact `SpotBugsReport`.

---

### 6.4 `security.yml` — Orchestrateur de sécurité

> **Type** : Template de **stage**  
> **Stage** : `SecurityCheck`  
> **Dépendance** : `QualityCheck`  
> **Condition** : `control.security == 'true'`  
> **Rôle** : Orchestre les différents scans de sécurité en jobs parallèles.

```yaml
stages:
- stage: SecurityCheck
  displayName: 'Analyse de Sécurité (SCA/SAST)'
  dependsOn: QualityCheck
  condition: and(succeeded(), eq(variables['control.security'], 'true'))
  jobs:
    - template: github-advanced-security.yml   # CodeQL + Dep Scanning
    - template: owasp-dependency-check.yml     # OWASP DC
    - template: snyk.yml                       # Snyk SCA/SAST
    - template: owaspzap.yml                   # OWASP ZAP (DAST)
```

Chaque job a sa propre **condition** basée sur une variable booléenne, ce qui permet d'activer/désactiver chaque outil individuellement :

| Job | Variable de contrôle |
|-----|---------------------|
| GitHub Advanced Security | `security.github-advanced-security` |
| OWASP Dependency Check | `security.owasp-dependency-check` |
| Snyk | `security.snyk` |
| OWASP ZAP | `security.owaspzap` |

---

### 6.5 `github-advanced-security.yml` — CodeQL & Dependency Scanning

> **Condition** : `security.github-advanced-security == 'true'`  
> **Type** : SAST + SCA  
> **Rôle** : Utilise CodeQL (moteur d'analyse de GitHub) pour détecter les vulnérabilités dans le code source.

#### Flux d'exécution

```
1. jdk-setup.yml         → Prépare le JDK
2. Cache Maven           → Accélère les builds
3. MavenAuthenticate     → Accès aux feeds privés
4. CodeQL Init           → Initialise CodeQL pour Java
5. mvn clean package     → Compile le code (nécessaire pour CodeQL)
6. Dependency Scanning   → Analyse les dépendances (SCA)
7. CodeQL Analyze        → Analyse le code compilé et publie les alertes
```

#### Points importants

- **CodeQL** nécessite une compilation réelle du projet (il analyse le bytecode et l'AST).
- L'option `AdvancedSecurity-Codeql-Autobuild@1` peut être utilisée en alternative à `mvn clean package`.
- Les résultats sont visibles dans l'onglet **Advanced Security** d'Azure DevOps.

---

### 6.6 `owasp-dependency-check.yml` — Analyse des vulnérabilités SCA

> **Condition** : `security.owasp-dependency-check == 'true'`  
> **Type** : SCA (Software Composition Analysis)  
> **Rôle** : Vérifie si les dépendances Maven contiennent des CVE connues.

#### 3 méthodes de scan disponibles

Le template propose 3 approches (seule la méthode 2 est activée par défaut) :

| Méthode | Commande | Activée |
|---------|----------|---------|
| 1 | `Maven@4` avec `goals: org.owasp:dependency-check-maven:check` | ❌ (`enabled: false`) |
| 2 | `Bash@3` avec `mvn org.owasp:dependency-check-maven:check` | ✅ (`enabled: true`) |
| 3 | `Maven@4` avec `goals: verify` (intégré au lifecycle) | ❌ (`enabled: false`) |

#### Variable clé

- `DfailOnCVSS` : Score CVSS minimum pour faire échouer le build (ex: `7` = échoue si vulnérabilité critique)

#### Rapports publiés

- `RapportOwaspDependencyCheck-API` : Rapport pour le module `api`
- `RapportOwaspDependencyCheck-MVC` : Rapport pour le module `mvc`

---

### 6.7 `snyk.yml` — Scan Snyk SCA & SAST

> **Condition** : `security.snyk == 'true'`  
> **Type** : SCA + SAST  
> **Rôle** : Analyse les dépendances et le code source avec [Snyk](https://snyk.io/).

#### Flux d'exécution

```
1. Authentification Maven (feeds privés)
2. SnykSecurityScan@1 (tâche officielle Snyk)
3. Script Bash complet :
   ├── Téléchargement de Snyk CLI (v1.1290.0)
   ├── Authentification Snyk
   ├── Snyk Open Source (dépendances) → snyk-opensource.json
   ├── Snyk Code (SAST)              → snyk-code.json
   ├── Snyk Monitor (dashboard)
   └── Génération rapports HTML
4. Publication des rapports
```

#### Avantage par rapport à OWASP DC

- **Snyk Code** fait aussi de l'analyse statique du code source (SAST), pas seulement des dépendances.
- Snyk fournit un **dashboard en ligne** pour le suivi continu.
- Les rapports HTML sont plus lisibles.

#### Variable requise

- `SNYK_TOKEN` : Token d'authentification Snyk (défini dans les variables du pipeline).

---

### 6.8 `owaspzap.yml` — Tests DAST

> **Condition** : `security.owaspzap == 'true'`  
> **Type** : DAST (Dynamic Application Security Testing)  
> **Rôle** : Scanner une application **déployée** pour détecter des vulnérabilités en temps réel.

#### ⚠️ Différence fondamentale avec les autres scans

Les scans SAST et SCA analysent le **code source** ou les **dépendances**. Le DAST, lui, teste l'application **en cours d'exécution** en lui envoyant des requêtes HTTP malveillantes.

#### Flux d'exécution

```
1. Création des dossiers de travail
2. Téléchargement de ZAP 2.14.0 depuis un Feed Artifacts interne
3. Extraction de l'archive
4. Exécution du scan sur l'URL cible
5. Publication du rapport HTML
```

#### Configuration requise

```yaml
TARGET_URL="http://10.102.109.152:7024/accesalcool/index.faces"
```

> ⚠️ **Important** : Cette URL doit pointer vers une instance déployée de l'application (environnement DEV/QA). Le scan DAST ne fonctionne pas sur du code source.

---

### 6.9 `build.yml` — Compilation et publication d'artefacts

> **Type** : Template de **stage**  
> **Stage** : `build`  
> **Dépendance** : `QualityCheck`  
> **Condition** : `control.build == 'true'`  
> **Pool** : `vmss-ado-agents-prod` (agents auto-hébergés)  
> **Rôle** : Compiler le projet Java et publier les artefacts (WAR/EAR) téléchargeables.

#### Architecture du stage

```
Build
  ├── Job A : Compilation
  │     ├── jdk-setup.yml
  │     ├── Cache Maven
  │     ├── MavenAuthenticate
  │     ├── Maven: clean install -DskipTests
  │     ├── Filtrage WAR/EAR
  │     ├── Archivage ZIP
  │     └── Publication artefact
  │
  └── Job B : Vérification post-compilation
        └── Affichage du lien de la build
```

#### Détail du Job A

##### Compilation Maven

```yaml
- task: Maven@4
  inputs:
    goals: '-U clean install'
    options: '-DskipTests'          # Tests déjà exécutés dans quality.yml
    mavenOptions: '-Xmx3072m'       # 3 Go de mémoire pour la JVM
```

| Option | Signification |
|--------|---------------|
| `-U` | Force la mise à jour des snapshots |
| `clean` | Supprime les anciens fichiers compilés |
| `install` | Compile + installe les artefacts dans le repo Maven local |
| `-DskipTests` | Les tests sont déjà validés dans le stage Quality |

##### Packaging des artefacts

Les étapes suivantes créent un ZIP téléchargeable :

1. **Filtrage** : Ne conserve que les fichiers `*.war` et `*.ear`
2. **Archivage** : Crée `DevOps_<commitSHA>.zip`
3. **Publication** : Rend le ZIP disponible dans l'onglet **Artifacts** du build

##### Résultat final

L'artefact publié s'appelle `Artifacts` et contient :
```
Artifacts/
  └── DevOps_abc123def.zip
        ├── api.war
        └── mvc.war
```

---

## 7. Partie CD : Continuous Delivery / Deployment

La partie **CI** (Continuous Integration) couvre la compilation, les tests et les analyses de sécurité. La partie **CD** (Continuous Delivery/Deployment) prend le relais pour **déployer automatiquement** les artefacts produits vers les différents environnements (Dev, QA, Prod).

### 7.1 Stratégie de déploiement multi-environnements

Le projet suit une stratégie de promotion progressive :

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   CI     │────▶│  DEV     │────▶│  QA      │────▶│  PROD    │
│ (Build)  │     │ (Auto)   │     │ (Appro.) │     │ (Appro.) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
  Artefact         Déploiement      Gate de          Gate de
  WAR/EAR          automatique     qualité +        sécurité +
  publié           après build     approbation      approbation
                                   manuelle QA      manuelle PROD
```

| Environnement | Déclenchement | Approbation | Objectif |
|---------------|---------------|-------------|----------|
| **DEV** | Automatique après le build | Aucune | Validation rapide par les développeurs |
| **QA** | Après DEV réussi | Manuelle (équipe QA) | Tests d'acceptation, tests fonctionnels |
| **PROD** | Après QA réussi | Manuelle (responsable + sécurité) | Mise en production finale |

### 7.2 Stage Deploy_Dev — Déploiement automatique en DEV

Ce stage utilise le mot-clé `deployment` avec un `environment` Azure DevOps, ce qui offre la traçabilité et l'historique des déploiements.

```yaml
- stage: Deploy_Dev
  displayName: 'Déploiement en DEV'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployToDev
    displayName: 'Déploiement vers Azure (DEV)'
    environment: 'Dev'          # Environnement Azure DevOps
    strategy:
      runOnce:
        deploy:
          steps:
            # 1. Télécharger l'artefact produit par le stage Build
            - download: current
              artifact: artifacts

            # 2. Déployer sur Azure Web App
            - task: AzureWebApp@1
              displayName: 'Déployer sur Azure Web App (DEV)'
              inputs:
                azureSubscription: 'Votre-Service-Connection-Azure'
                appType: 'webApp'
                appName: 'nom-de-votre-webapp-dev'
                package: '$(Pipeline.Workspace)/artifacts/*.war'
```

#### Concepts clés

| Élément | Explication |
|---------|-------------|
| `deployment` | Type de job spécial pour les déploiements. Fournit un historique dans l'onglet **Environments** d'Azure DevOps. |
| `environment: 'Dev'` | Référence à un environnement créé dans Azure DevOps. Permet d'ajouter des checks, approbations et locks. |
| `strategy: runOnce` | Stratégie de déploiement simple : déploie une seule fois. D'autres stratégies sont possibles : `rolling`, `canary`. |
| `download: current` | Télécharge les artefacts publiés par un stage précédent du même pipeline. |
| `AzureWebApp@1` | Tâche officielle Microsoft pour déployer sur Azure App Service (supporte WAR, JAR, ZIP). |

#### Alternatives de déploiement

Selon votre infrastructure, vous pouvez remplacer `AzureWebApp@1` par :

| Cible | Tâche Azure DevOps | Cas d'usage |
|-------|--------------------|-----------|
| **Azure App Service** | `AzureWebApp@1` | Application web Java classic |
| **Azure App Service (conteneur)** | `AzureWebAppContainer@1` | Application dockerisée |
| **VM / Serveur on-premises** | `CopyFilesOverSSH@0` + `SSH@0` | Déploiement vers un serveur Tomcat/WildFly |
| **Azure Kubernetes (AKS)** | `KubernetesManifest@0` | Déploiement sur Kubernetes |
| **Serveur d'application (WildFly/Tomcat)** | Script Bash personnalisé | Copie SSH + restart du service |

#### Exemple : Déploiement sur un serveur Tomcat distant (SSH)

Si votre environnement DEV est un serveur on-premises avec Tomcat :

```yaml
steps:
  - download: current
    artifact: artifacts

  # Copier le WAR vers le serveur
  - task: CopyFilesOverSSH@0
    displayName: 'Copie du WAR vers le serveur DEV'
    inputs:
      sshEndpoint: 'SSH-Serveur-Dev'
      sourceFolder: '$(Pipeline.Workspace)/artifacts'
      contents: '**/*.war'
      targetFolder: '/opt/tomcat/webapps/'
      cleanTargetFolder: false

  # Redémarrer Tomcat
  - task: SSH@0
    displayName: 'Redémarrage Tomcat'
    inputs:
      sshEndpoint: 'SSH-Serveur-Dev'
      runOptions: 'inline'
      inline: |
        sudo systemctl restart tomcat
        sleep 10
        curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health
```

### 7.3 Stage Deploy_Prod — Déploiement avec approbation en PROD

Le déploiement en production est **identique structurellement** mais inclut une **gate d'approbation manuelle** configurée dans l'environnement Azure DevOps.

```yaml
- stage: Deploy_Prod
  displayName: 'Déploiement en PROD'
  dependsOn: Deploy_Dev             # Séquentiel : DEV doit réussir d'abord
  condition: succeeded()
  jobs:
  - deployment: DeployToProd
    displayName: 'Déploiement vers Azure (PROD)'
    environment: 'Prod'          # Environnement avec approbation manuelle
    strategy:
      runOnce:
        deploy:
          steps:
            - download: current
              artifact: artifacts

            - task: AzureWebApp@1
              displayName: 'Déployer sur Azure Web App (PROD)'
              inputs:
                azureSubscription: 'Votre-Service-Connection-Azure'
                appType: 'webApp'
                appName: 'nom-de-votre-webapp-prod'
                package: '$(Pipeline.Workspace)/artifacts/*.war'
```

> **Important** : L'approbation manuelle n'est **pas dans le YAML**. Elle est configurée dans Azure DevOps > Environments > `Prod` > Checks & Approvals.

#### Stratégies de déploiement avancées

##### Blue/Green Deployment (slots Azure)

```yaml
steps:
  # Déployer sur le slot de staging
  - task: AzureWebApp@1
    inputs:
      azureSubscription: 'Votre-Service-Connection'
      appName: 'nom-webapp-prod'
      deployToSlotOrASE: true
      slotName: 'staging'
      package: '$(Pipeline.Workspace)/artifacts/*.war'

  # Vérification de santé du slot staging
  - script: |
      HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://nom-webapp-prod-staging.azurewebsites.net/health)
      if [ $HTTP_STATUS -ne 200 ]; then echo "Health check failed"; exit 1; fi
    displayName: 'Health Check Staging'

  # Swap staging ↔ production
  - task: AzureAppServiceManage@0
    inputs:
      azureSubscription: 'Votre-Service-Connection'
      Action: 'Swap Slots'
      WebAppName: 'nom-webapp-prod'
      SourceSlot: 'staging'
```

##### Canary Deployment

```yaml
strategy:
  canary:
    increments: [10, 50]     # 10% trafic, puis 50%, puis 100%
    deploy:
      steps:
        - task: AzureWebApp@1
          inputs: ...
    on:
      success:
        steps:
          - script: echo "Canary réussi, promotion automatique"
      failure:
        steps:
          - script: echo "Canary échoué, rollback automatique"
```

### 7.4 Pipeline de release classique (`release.yml`)

Le projet contient également un pipeline de release **legacy** (`release.yml`) qui suit une approche plus simple en un seul stage :

```yaml
trigger:
- none                              # Déclenché manuellement ou par un autre pipeline

pool:
  name: vmss-ado-agents-prod

steps:
  # 1. Setup JDK
  # 2. Config JAVA_HOME
  # 3. Auth Maven
  # 4. Maven deploy (compile + publie vers le registre Maven)
  # 5. Copie des WAR
  # 6. Publication de l'artefact
```

**Différence** avec le pipeline principal :

| Aspect | `azure-pipelines.yml` | `release.yml` |
|--------|----------------------|----------------------|
| Déclencheur | Automatique (push) | Manuel (`trigger: none`) |
| Goal Maven | `clean install` | `deploy` (publie sur le registre Maven) |
| Stages | Multi-stages (CI + CD) | Mono-stage |
| Artefact | `Artifacts` (ZIP) | `artifacts` (WAR bruts) |
| Usage | Pipeline CI/CD complet | Release manuelle vers le registre |

### 7.5 Configurer les environnements et approbations

#### Étape 1 : Créer les environnements

1. Azure DevOps > **Pipelines** > **Environments**
2. Cliquez **New environment**
3. Créez :
  - `Dev` (pas d'approbation)
  - `QA` (approbation QA)
  - `Prod` (approbation Tech Lead + Sécurité)

#### Étape 2 : Configurer les approbations

1. Ouvrez l'environnement `Prod`
2. Cliquez sur **...** > **Approvals and checks**
3. Ajoutez :
   - **Approvals** : Sélectionnez les approbateurs (ex: `tech-lead@org.com`, `securite@org.com`)
   - **Business Hours** (optionnel) : Limiter les déploiements aux heures ouvrables
   - **Branch control** : N'autoriser que la branche `main` à déployer en prod

#### Étape 3 : Créer la Service Connection Azure

1. Azure DevOps > **Project Settings** > **Service connections**
2. **New service connection** > **Azure Resource Manager**
3. Choisissez **Service principal (automatic)** ou **manual**
4. Nommez-la `Votre-Service-Connection-Azure`
5. Sélectionnez le subscription et resource group cibles

#### Étape 4 : Configurer la Service Connection SSH (si on-premises)

Pour les déploiements sur des serveurs distants :

1. **Project Settings** > **Service connections** > **SSH**
2. Renseignez : host, port, username, clé privée ou mot de passe
3. Nommez-la `SSH-Serveur-Dev`, `SSH-Serveur-QA`, `SSH-Serveur-Prod`, etc.

---

## 8. Variables du pipeline

### Variables à configurer dans `var-projet-pipeline`

#### Variables de contrôle (activer/désactiver les stages)

| Variable | Type | Valeur | Description |
|----------|------|--------|-------------|
| `control.quality` | `string` | `true` / `false` | Active le stage Qualité |
| `control.analyse.statique` | `string` | `true` / `false` | Active l'analyse statique |
| `control.security` | `string` | `true` / `false` | Active les scans de sécurité |
| `control.build` | `string` | `true` / `false` | Active la compilation |

#### Variables des jobs de sécurité

| Variable | Type | Description |
|----------|------|-------------|
| `security.github-advanced-security` | `string` | Active GitHub Advanced Security |
| `security.owasp-dependency-check` | `string` | Active OWASP Dependency Check |
| `security.snyk` | `string` | Active Snyk |
| `security.owaspzap` | `string` | Active OWASP ZAP |

#### Variables du JDK

| Variable | Exemple | Description |
|----------|---------|-------------|
| `jdk.version.exacte` | `11.0.20` | Version complète du JDK |
| `jdk.version.courte` | `11` | Version majeure |
| `jdk.version.option` | `1.11` | Format pour la tâche Maven@4 |
| `jdk.architecture` | `x64` | Architecture CPU |
| `dossier.jdk` | `jdk-oracle` | Dossier de travail sur l'agent |

#### Variables du Blob Storage

| Variable | Secret | Description |
|----------|--------|-------------|
| `blob.name` | Non | Nom du compte de stockage |
| `blob.key` | **Oui** 🔒 | Clé d'accès au stockage |
| `blob.container` | Non | Nom du conteneur blob |

#### Variables de sécurité

| Variable | Secret | Description |
|----------|--------|-------------|
| `snyk.token` | **Oui** 🔒 | Token d'authentification Snyk |
| `NVD_API_KEY` | **Oui** 🔒 | Clé API NVD (OWASP Dependency Check) |
| `DfailOnCVSS` | Non | Score CVSS minimum pour échouer (ex: `7`) |

---

## 9. Flux d'exécution complet CI/CD

Voici ce qui se passe quand un développeur fait un `git push` sur `develop` :

```
1.  Azure DevOps détecte le push → démarre le pipeline
2.  Chargement des variables depuis var-projet-pipeline
3.  Agent ubuntu-latest provisionné

4.  ═══ STAGE 1 : QualityCheck ═══
    4.1  JDK installé (jdk-setup.yml)
    4.2  Cache Maven restauré
    4.3  Authentification aux feeds Azure Artifacts
    4.4  mvn clean verify → Tests unitaires exécutés
    4.5  mvn site → Rapports générés (JaCoCo, PMD, Checkstyle)
    4.6  OWASP Dependency Check exécuté
    4.7  Couverture JaCoCo publiée
    4.8  Rapports publiés comme artefacts

5.  ═══ STAGE 2 & 3 (en parallèle) ═══

    STAGE 2 : StaticAnalysis
    5.1  Job Semgrep : scan SAST + OWASP Top 10
    5.2  Job SpotBugs : analyse du bytecode

    STAGE 3 : SecurityCheck
    5.3  Job GitHub Advanced Security : CodeQL + Dependency Scanning
    5.4  Job OWASP DC : scan CVE des dépendances
    5.5  Job Snyk : SCA + SAST + monitoring
    5.6  Job OWASP ZAP : scan DAST de l'app déployée

6.  ═══ STAGE 4 : Build ═══
    6.1  JDK installé
    6.2  mvn clean install -DskipTests
    6.3  Fichiers WAR/EAR filtrés et archivés
    6.4  Artefact ZIP publié
    6.5  Lien de la build affiché

    ┌──────────────────────────────────────────────────┐
    │          FIN DE LA PARTIE CI                     │
    │  L'artefact est prêt pour le déploiement (CD)    │
    └──────────────────────────────────────────────────┘

7.  ═══ STAGE 5 : Deploy_Dev (CD) ═══
    7.1  Téléchargement de l'artefact depuis le stage Build
    7.2  Déploiement automatique sur l'environnement Dev
    7.3  Health check de l'application ✓

8.  ═══ STAGE 6 : Deploy_QA (CD) ═══
    8.1  ⏸️  Attente d'approbation manuelle (équipe QA)
    8.2  Approbation reçue → déploiement sur QA
    8.3  Tests d'acceptation exécutés

9.  ═══ STAGE 7 : Deploy_Prod (CD) ═══
    9.1  ⏸️  Attente d'approbation manuelle (Tech Lead + Sécurité)
    9.2  Approbation reçue → déploiement sur Prod
    9.3  Smoke tests + Health check ✓

10. Pipeline CI/CD terminé ✓
```

### Flux DevSecOps complet (vue synthétique)

```
Commit → Build → Tests Unitaires → SAST → SCA → DAST → Quality Gate → Deploy DEV → Approval QA → Deploy QA → Approval PROD → Deploy PROD
```

---

## 10. Comment personnaliser le pipeline

### Activer/Désactiver un stage

Dans le groupe de variables `var-projet-pipeline`, modifiez :

```
control.quality = true         # ou false pour désactiver
control.security = false       # Désactive tous les scans de sécurité
```

### Activer/Désactiver un outil de sécurité spécifique

```
security.snyk = true
security.owaspzap = false      # Désactive ZAP (si pas d'env déployé)
```

### Changer la version du JDK

```
jdk.version.exacte = 17.0.8
jdk.version.courte = 17
jdk.version.option = 1.17
```

> N'oubliez pas de mettre à jour le fichier JDK dans le Blob Storage.

### Ajouter un nouveau stage

1. Créez un fichier dans `azure-pipelines/templates/mon-nouveau-stage.yml`
2. Ajoutez-le dans `ci.yml` :

```yaml
stages:
  - template: templates/quality.yml
  - template: templates/static-analysis.yml
  - template: templates/security.yml
  - template: templates/build.yml
  - template: templates/mon-nouveau-stage.yml    # Nouveau stage
```

### Passer aux agents auto-hébergés (production)

Dans `azure-pipelines.yml`, remplacez :

```yaml
pool:
  vmImage: ubuntu-latest
```

Par :

```yaml
pool:
  name: vmss-ado-agents-prod
```

---

## 11. Dépannage courant

### Le JDK ne s'installe pas

**Symptôme** : `java: command not found`

**Solutions** :
1. Vérifiez que le fichier `.tar.gz` existe dans le Blob Storage
2. Vérifiez les variables `blob.name`, `blob.key`, `blob.container`
3. Consultez les logs de la tâche `Azure CLI - Copie de Oracle JDK`

### Échec de l'authentification Maven

**Symptôme** : `401 Unauthorized` lors du téléchargement des dépendances

**Solutions** :
1. Vérifiez que les feeds existent dans Azure Artifacts
2. L'agent doit avoir les permissions de lecture sur les feeds
3. Vérifiez que `MavenAuthenticate@0` est exécuté avant la commande Maven

### OWASP Dependency Check timeout

**Symptôme** : Le scan dépasse les 20 minutes

**Solutions** :
1. Vérifiez que `NVD_API_KEY` est configurée (sans clé, le téléchargement de la base NVD est très lent)
2. Activez le cache Maven pour les données OWASP DC
3. Augmentez le `timeoutInMinutes`

### Snyk échoue avec erreur SSL

**Symptôme** : `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`

**Solutions** :
1. L'option `--insecure` est déjà utilisée dans le script
2. Vérifiez que `jdk-setup.yml` a bien installé les certificats
3. Si derrière un proxy : configurez `npm config set strict-ssl false`

### Les tests unitaires échouent

**Symptôme** : `BUILD FAILURE` dans le stage Quality

**Solutions** :
1. Consultez les rapports Surefire dans l'artefact `RapportsQualiteCode`
2. Les fichiers `TEST-*.xml` contiennent le détail des échecs
3. Lancez `mvn clean verify` en local pour reproduire l'erreur

### Le scan ZAP ne trouve rien

**Symptôme** : Rapport ZAP vide ou erreur de connexion

**Solutions** :
1. Vérifiez que `TARGET_URL` pointe vers une application **déployée et accessible** depuis l'agent
2. L'agent doit avoir une connectivité réseau vers l'URL cible
3. Vérifiez les règles de pare-feu / NSG Azure

---

## 12. Profil CV — Compétences DevSecOps

Voici comment valoriser cette expérience sur votre CV et en entretien.

### Section CV recommandée

---

#### **Compétences techniques**

```
DevOps / DevSecOps
├── CI/CD : Azure Pipelines (YAML multi-stages), pipelines modulaires par templates
├── Build : Maven (multi-modules), packaging WAR/EAR, gestion d'artefacts
├── Tests : JUnit, Surefire, JaCoCo (couverture de code)
├── SAST : Semgrep, SpotBugs, Checkstyle, PMD, CodeQL (GitHub Advanced Security)
├── SCA  : OWASP Dependency-Check, Snyk Open Source
├── DAST : OWASP ZAP
├── Conteneurisation : Docker, Azure Container Registry (optionnel)
├── Infra : Azure Blob Storage, Azure App Service, VM Scale Sets (VMSS)
├── Secrets : Azure Key Vault, Variable Groups (Azure DevOps Library)
└── Versioning : Git, Azure Repos, stratégie GitFlow
```

---

#### **Expérience professionnelle — Exemple de rédaction**

> **Ingénieur DevSecOps / Développeur Java** — [Votre Organisme]  
> *2024 – 2026*
>
> Mise en place et maintenance d'un pipeline CI/CD complet sous Azure DevOps pour une application Java multi-modules (Maven) dans un contexte gouvernemental.
>
> **Intégration Continue (CI)** :
> - Conception d'une architecture de pipeline **YAML multi-stages modulaire** avec templates réutilisables
> - Automatisation de la compilation Maven, des tests unitaires (JUnit) et de la couverture de code (JaCoCo)
> - Mise en place de caches Maven pour optimiser les temps de build
>
> **Sécurité applicative (DevSecOps — Shift Left)** :
> - Intégration de **5 outils de sécurité** dans le pipeline CI :
>   - **SAST** : Semgrep (analyse statique Java + OWASP Top 10), SpotBugs (analyse bytecode), CodeQL (GitHub Advanced Security)
>   - **SCA** : OWASP Dependency-Check (vulnérabilités CVE des dépendances), Snyk (SCA + SAST + monitoring continu)
>   - **DAST** : OWASP ZAP (scan dynamique de l'application déployée)
> - Mise en place de **quality gates** bloquant le build si le score CVSS dépasse un seuil configurable
> - Publication automatique des rapports au format SARIF vers GitHub Advanced Security
>
> **Qualité de code** :
> - Intégration de Checkstyle, PMD, SpotBugs et JaCoCo dans le cycle Maven
> - Génération automatique de rapports de qualité (`mvn site`) accessibles comme artefacts du pipeline
>
> **Livraison Continue (CD)** :
> - Déploiement automatisé multi-environnements (DEV → QA → PROD) avec stratégie de promotion progressive
> - Configuration des **gates d'approbation** et **environnements Azure DevOps** pour le contrôle des déploiements
> - Gestion des artefacts (WAR/EAR) via Azure Artifacts et Azure Blob Storage
>
> **Environnement technique** : Java 11, Maven, Spring, Azure DevOps, Azure Pipelines YAML, Snyk, OWASP ZAP, Semgrep, CodeQL, SpotBugs, JaCoCo, Azure Blob Storage, VMSS agents

---

### Mots-clés à inclure dans le CV

Ces termes sont recherchés par les recruteurs et les ATS (systèmes de tri automatique de CV) :

| Catégorie | Mots-clés |
|-----------|----------|
| **CI/CD** | Azure Pipelines, YAML Pipelines, Multi-stage pipelines, Pipeline as Code, Templates réutilisables, Continuous Integration, Continuous Delivery |
| **Sécurité (SAST)** | SAST, Analyse statique, Semgrep, SpotBugs, CodeQL, GitHub Advanced Security, Checkstyle, PMD, analyse de code sécuritaire |
| **Sécurité (SCA)** | SCA, Software Composition Analysis, OWASP Dependency-Check, Snyk, CVE, NVD, vulnérabilités des dépendances |
| **Sécurité (DAST)** | DAST, Test dynamique, OWASP ZAP, scan de vulnérabilités, tests de pénétration automatisés |
| **DevSecOps** | DevSecOps, Shift Left Security, Security by Design, OWASP Top 10, SARIF, Quality Gates |
| **Qualité** | JaCoCo, couverture de code, tests unitaires, JUnit, Surefire, rapports qualité, Maven site |
| **Build/Deploy** | Maven, multi-modules, packaging WAR/EAR, Azure Artifacts, déploiement automatisé, Blue/Green, Canary |
| **Infrastructure** | Azure DevOps, VMSS, Azure Blob Storage, Azure App Service, agents auto-hébergés, VM Scale Sets |
| **Processus** | GitFlow, Pull Request, Code Review, approbations manuelles, promotion d'environnements |

---

### Ce que vous pouvez dire en entretien

#### "Décrivez votre pipeline CI/CD"

> "J'ai conçu un pipeline Azure DevOps YAML multi-stages avec une architecture modulaire par templates. Le pipeline s'exécute automatiquement sur chaque push et comprend 4 grandes phases : la qualité du code (tests unitaires JaCoCo, analyses Checkstyle/PMD/SpotBugs), l'analyse statique de sécurité avec Semgrep et CodeQL, le scan des dépendances avec OWASP Dependency-Check et Snyk, puis la compilation et le packaging des artefacts WAR. Chaque phase est contrôlable individuellement via des variables booléennes."

#### "Qu'est-ce que le DevSecOps et comment l'avez-vous implémenté ?"

> "Le DevSecOps c'est l'intégration de la sécurité dès le début du cycle de développement — on parle de *Shift Left*. Concrètement, j'ai intégré 5 outils de sécurité directement dans le pipeline CI :
> - **SAST** (Static Analysis) avec Semgrep, SpotBugs et CodeQL pour trouver les failles dans le code source,
> - **SCA** (Software Composition Analysis) avec OWASP Dependency-Check et Snyk pour détecter les CVE dans les dépendances,
> - **DAST** (Dynamic Analysis) avec OWASP ZAP pour tester l'application en cours d'exécution.
> 
> Chaque build vérifie automatiquement le code contre les vulnérabilités OWASP Top 10 et peut bloquer le déploiement si le score CVSS dépasse un seuil."

#### "Quelle est la différence entre SAST, SCA et DAST ?"

> | Type | Quand | Quoi | Exemple |
> |------|-------|------|---------|
> | **SAST** | Avant compilation | Analyse le **code source** pour trouver des patterns vulnérables | Semgrep détecte une injection SQL dans le code Java |
> | **SCA** | Pendant le build | Vérifie les **dépendances tierces** contre les bases de CVE | OWASP DC détecte que `log4j 2.14.0` a une CVE critique |
> | **DAST** | Après déploiement | Envoie des **requêtes malveillantes** à l'application en cours d'exécution | ZAP teste si l'app est vulnérable au XSS ou CSRF |

#### "Pourquoi utiliser plusieurs outils pour le même type d'analyse ?"

> "Chaque outil a ses forces. Semgrep est rapide et détecte les patterns OWASP Top 10, SpotBugs analyse le bytecode JVM (ce que Semgrep ne fait pas), et CodeQL offre une analyse sémantique profonde. Pour le SCA, OWASP DC est gratuit et utilise la NVD, tandis que Snyk offre un dashboard de suivi continu et fait aussi du SAST. L'approche multi-outils réduit les faux négatifs."

---

### Certifications recommandées pour valoriser ce profil

| Certification | Organisme | Pertinence |
|---------------|-----------|------------|
| **AZ-400** Azure DevOps Engineer Expert | Microsoft | Pipeline CI/CD Azure DevOps |
| **AZ-204** Azure Developer Associate | Microsoft | Développement et déploiement Azure |
| **Certified DevSecOps Professional (CDP)** | Practical DevSecOps | DevSecOps complet |
| **Snyk Certified Security Champion** | Snyk | Sécurité des dépendances |
| **GitHub Advanced Security Certification** | GitHub | CodeQL, Dependency Scanning |
| **OWASP Top 10 Awareness** | OWASP | Fondamentaux sécurité web |

---

## Glossaire

| Terme | Définition |
|-------|------------|
| **CI** | Continuous Integration — Intégration continue |
| **CD** | Continuous Delivery — Livraison continue |
| **SAST** | Static Application Security Testing — Analyse statique du code source avant exécution |
| **DAST** | Dynamic Application Security Testing — Test de l'application en cours d'exécution |
| **SCA** | Software Composition Analysis — Analyse des dépendances tierces pour CVE connues |
| **CVE** | Common Vulnerabilities and Exposures — Identifiant unique de vulnérabilité |
| **CVSS** | Common Vulnerability Scoring System — Score de sévérité (0-10) |
| **NVD** | National Vulnerability Database — Base de données NIST des vulnérabilités |
| **SARIF** | Static Analysis Results Interchange Format — Format standard pour résultats d'analyse |
| **VMSS** | Virtual Machine Scale Set — Pool d'agents auto-hébergés Azure |
| **JaCoCo** | Java Code Coverage — Outil de mesure de couverture de code |
| **PMD** | Programming Mistake Detector — Détecteur de mauvaises pratiques de code |
| **CodeQL** | Moteur d'analyse sémantique de code de GitHub |
| **Shift Left** | Approche consistant à intégrer la sécurité le plus tôt possible dans le cycle de développement |
| **Quality Gate** | Point de contrôle automatique qui bloque le pipeline si des critères ne sont pas remplis |
| **Blue/Green** | Stratégie de déploiement avec deux environnements identiques pour bascule sans interruption |
| **Canary** | Stratégie de déploiement progressif (10% → 50% → 100% du trafic) |
