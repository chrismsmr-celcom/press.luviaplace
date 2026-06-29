import requests
import os
import json

# Configuration
SUPABASE_URL = "https://ukbekfcjfcjcqrpxfpmq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYmVrZmNqZmNqY3FycHhmcG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDk2NzcsImV4cCI6MjA4OTkyNTY3N30.KK3nxQOLTi3IZjYoRtrNC6mS_ixSsrZMI3J4WfxJVYU"
SITE_URL = "https://press.luviaplace.com"
ARTICLES_DIR = "articles"

# Créer le dossier articles s'il n'existe pas
if not os.path.exists(ARTICLES_DIR):
    os.makedirs(ARTICLES_DIR)

# Récupérer tous les articles
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/posts?select=*",
    headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
)

articles = response.json()
print(f"📚 {len(articles)} articles trouvés")

# Template HTML pour chaque article
def generate_article_page(article):
    article_id = article['id']
    title = article.get('title', 'Luvia Press')
    title_en = article.get('title_en', title)
    excerpt = article.get('excerpt', title)
    excerpt_en = article.get('excerpt_en', excerpt)
    image = article.get('image_url', f'{SITE_URL}/og-default.jpg')
    category = article.get('category', 'News')
    
    # Nettoyer pour HTML
    description = excerpt.replace("'", "\\'").replace('"', '\\"')[:160]
    description_en = excerpt_en.replace("'", "\\'").replace('"', '\\"')[:160]
    
    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Luvia Press</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{SITE_URL}/articles/{article_id}.html">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Luvia Press">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:locale:alternate" content="en_US">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@luviapress">
    <meta name="twitter:url" content="{SITE_URL}/articles/{article_id}.html">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image}">
    
    <!-- Redirection vers l'article avec JavaScript -->
    <meta http-equiv="refresh" content="0; url={SITE_URL}/post.html?id={article_id}">
    
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: #fafafa;
            color: #333;
        }
        .loader { text-align: center; }
        .loader p { font-size: 1.2rem; margin-bottom: 1rem; }
        .loader img { height: 40px; }
        .spinner {
            width: 40px; height: 40px;
            border: 3px solid #e5e5e5;
            border-top-color: #0046e4;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <p>Chargement de l'article...</p>
    </div>
    
    <script>
        // Redirection immediate avec JavaScript
        window.location.href = '{SITE_URL}/post.html?id={article_id}';
    </script>
</body>
</html>"""
    
    return html

# Générer chaque page
for article in articles:
    article_id = article['id']
    filename = f"{ARTICLES_DIR}/{article_id}.html"
    
    page_html = generate_article_page(article)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(page_html)
    
    print(f"✅ {filename} - {article.get('title', 'Sans titre')[:50]}...")

print(f"\n🎉 Terminé ! {len(articles)} pages générées dans le dossier '{ARTICLES_DIR}/'")
print(f"📤 Uploade le dossier sur GitHub et c'est bon !")
