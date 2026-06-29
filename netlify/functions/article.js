const fetch = require('node-fetch');

exports.handler = async function(event) {
    const id = event.queryStringParameters.id || '1';
    
    const response = await fetch(
        `https://ukbekfcjfcjcqrpxfpmq.supabase.co/rest/v1/posts?id=eq.${id}&select=*`,
        {
            headers: {
                'apikey': process.env.SUPABASE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
            }
        }
    );
    
    const articles = await response.json();
    const article = articles[0];
    
    if (!article) {
        return { statusCode: 404, body: 'Not found' };
    }
    
    const title = article.title || 'Luvia Press';
    const description = article.excerpt || title;
    const image = article.image_url || 'https://press.luviaplace.com/og-default.jpg';
    
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta http-equiv="refresh" content="0; url=/post.html?id=${id}">
</head>
<body>Redirection...</body>
</html>`;
    
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: html
    };
};
