const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ukbekfcjfcjcqrpxfpmq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SITE_URL = process.env.SITE_URL || 'https://press.luviaplace.com';

if (!SUPABASE_KEY) {
    console.error('❌ SUPABASE_KEY manquante');
    process.exit(1);
}

function fetchPosts() {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/rest/v1/posts?select=id,title,excerpt,image_url,category&order=created_at.desc`;
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

function generatePage(article) {
    const title = (article.title || 'Travel Press').replace(/"/g, '&quot;');
    const desc = (article.excerpt || article.title || '').substring(0, 160).replace(/"/g, '&quot;');
    const img = article.image_url || `${SITE_URL}/og-default.jpg`;
    const redirectUrl = `${SITE_URL}/post.html?id=${article.id}`;
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Travel Press</title>
    <meta property="og:type" content="article">
    <meta property="og:url" content="${SITE_URL}/articles/${article.id}.html">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${img}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Travel Press">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${img}">
    <meta http-equiv="refresh" content="0; url=${redirectUrl}">
    <link rel="canonical" href="${redirectUrl}">
    <style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#fafafa}.spinner{width:40px;height:40px;border:3px solid #e5e5e5;border-top-color:#0046e4;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 1rem}@keyframes spin{to{transform:rotate(360deg)}}</style>
</head>
<body>
    <div style="text-align:center"><div class="spinner"></div><p style="color:#666">Chargement...</p></div>
    <script>window.location.href="${redirectUrl}"</script>
</body>
</html>`;
}

async function main() {
    console.log('📡 Récupération des articles...');
    const articles = await fetchPosts();
    console.log(`✅ ${articles.length} articles trouvés`);
    
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, 'articles');
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    let generated = 0;
    articles.forEach(article => {
        const html = generatePage(article);
        const filePath = path.join(dir, `${article.id}.html`);
        
        // Ne régénère que si le contenu a changé
        let needsUpdate = true;
        if (fs.existsSync(filePath)) {
            const existing = fs.readFileSync(filePath, 'utf8');
            if (existing.includes(`og:title" content="${(article.title || 'Travel Press').replace(/"/g, '&quot;')}"`)) {
                needsUpdate = false;
            }
        }
        
        if (needsUpdate) {
            fs.writeFileSync(filePath, html);
            console.log(`  ✅ articles/${article.id}.html - ${(article.title || '').substring(0, 50)}`);
            generated++;
        }
    });
    
    console.log(`🎉 ${generated} pages générées/mises à jour`);
}

main().catch(console.error);
