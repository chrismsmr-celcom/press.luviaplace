const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ukbekfcjfcjcqrpxfpmq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYmVrZmNqZmNqY3FycHhmcG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDk2NzcsImV4cCI6MjA4OTkyNTY3N30.KK3nxQOLTi3IZjYoRtrNC6mS_ixSsrZMI3J4WfxJVYU';
const SITE_URL = process.env.SITE_URL || 'https://press.luviaplace.com';

function fetchPosts() {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/rest/v1/posts?select=id,title,excerpt,image_url,category,created_at&order=created_at.desc`;
        const options = {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        };
        
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function escape(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Créer un hash du contenu de l'article pour détecter les changements
function getArticleHash(article) {
    const content = `${article.title}|${article.excerpt}|${article.image_url}|${article.category}`;
    return crypto.createHash('md5').update(content).digest('hex');
}

function generatePage(article) {
    const title = article.title || 'Travel Press';
    const desc = (article.excerpt || article.title || '').substring(0, 160);
    const img = article.image_url || `${SITE_URL}/og-default.jpg`;
    const redirectUrl = `${SITE_URL}/post.html?id=${article.id}`;
    const category = article.category || 'News';
    const hash = getArticleHash(article);
    
    return {
        html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escape(title)} - Travel Press</title>
    
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer","GTM-WD4WP29Q");</script>
    <!-- End Google Tag Manager -->
    
    <meta property="og:type" content="article">
    <meta property="og:url" content="${SITE_URL}/articles/${article.id}.html">
    <meta property="og:title" content="${escape(title)}">
    <meta property="og:description" content="${escape(desc)}">
    <meta property="og:image" content="${img}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Travel Press">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escape(title)}">
    <meta name="twitter:description" content="${escape(desc)}">
    <meta name="twitter:image" content="${img}">
    <meta http-equiv="refresh" content="0; url=${redirectUrl}">
    <link rel="canonical" href="${redirectUrl}">
    <!-- hash: ${hash} -->
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fafafa;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:1.5rem}
        .card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.06);max-width:480px;width:100%;overflow:hidden;text-align:center}
        .card-img{width:100%;height:200px;object-fit:cover}
        .card-body{padding:2rem 1.5rem}
        .logo{font-size:.75rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0046e4;margin-bottom:1rem}
        .title{font-size:1.1rem;font-weight:700;color:#111;line-height:1.4;margin-bottom:.5rem}
        .cat{display:inline-block;background:#f0f4ff;color:#0046e4;font-size:.7rem;font-weight:700;padding:.25rem .6rem;border-radius:4px;text-transform:uppercase;margin-bottom:1.5rem}
        .spinner{width:32px;height:32px;border:3px solid #e5e5e5;border-top-color:#0046e4;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 1rem}
        @keyframes spin{to{transform:rotate(360deg)}}
        .text{font-size:.85rem;color:#999}
        @media(max-width:480px){.card-img{height:160px}.card-body{padding:1.5rem 1rem}}
    </style>
</head>
<body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WD4WP29Q" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <div class="card">
        <img class="card-img" src="${img}" alt="${escape(title)}" onerror="this.style.display='none'">
        <div class="card-body">
            <div class="logo">Travel Press</div>
            <h2 class="title">${escape(title)}</h2>
            <span class="cat">${escape(category)}</span>
            <div class="spinner"></div>
            <p class="text">Ouverture de l'article...</p>
        </div>
    </div>
    <script>window.location.href="${redirectUrl}"</script>
</body>
</html>`,
        hash: hash
    };
}

// Lire le hash stocké dans le fichier existant
function getExistingHash(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/<!-- hash: ([a-f0-9]+) -->/);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log('📡 Récupération des articles depuis Supabase...');
    const articles = await fetchPosts();
    console.log(`✅ ${articles.length} articles trouvés dans Supabase`);
    
    const dir = path.join(__dirname, 'articles');
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('📁 Dossier articles/ créé');
    }
    
    // Compter les fichiers existants
    const existingFiles = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.html')) : [];
    console.log(`📄 ${existingFiles.length} fichiers existants dans articles/`);
    
    let generated = 0;
    let skipped = 0;
    const generatedIds = [];
    
    articles.forEach(article => {
        const filePath = path.join(dir, `${article.id}.html`);
        const { html, hash } = generatePage(article);
        const existingHash = getExistingHash(filePath);
        
        // Ne générer que si le fichier n'existe pas OU si le contenu a changé
        if (!existingHash || existingHash !== hash) {
            fs.writeFileSync(filePath, html);
            const reason = !existingHash ? 'NOUVEAU' : 'MODIFIÉ';
            console.log(`  ✅ articles/${article.id}.html - ${reason} - ${(article.title || '').substring(0, 40)}`);
            generated++;
        } else {
            console.log(`  ⏭️  articles/${article.id}.html - inchangé`);
            skipped++;
        }
        generatedIds.push(article.id);
    });
    
    // Supprimer les fichiers d'articles qui n'existent plus dans Supabase
    existingFiles.forEach(file => {
        const id = parseInt(file.replace('.html', ''));
        if (!generatedIds.includes(id)) {
            const filePath = path.join(dir, file);
            fs.unlinkSync(filePath);
            console.log(`  🗑️  Supprimé: articles/${file} (article supprimé de Supabase)`);
        }
    });
    
    console.log('');
    console.log(`🎉 ${generated} pages générées/mises à jour`);
    console.log(`⏭️  ${skipped} pages inchangées (non regénérées)`);
    console.log(`📄 Total: ${generatedIds.length} pages actives`);
}

main().catch(err => {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
});
