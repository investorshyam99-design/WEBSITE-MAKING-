const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const preconnects = `
    <link rel="preconnect" href="https://cdn.shopify.com">
    <link rel="preconnect" href="https://images.unsplash.com">
    <link rel="preconnect" href="https://i.imgur.com">
`;

if (!html.includes('<link rel="preconnect"')) {
    html = html.replace(/<head>/, '<head>' + preconnects);
    fs.writeFileSync('index.html', html);
}
