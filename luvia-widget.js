// Luvia Place Widget - v1.0
(function() {
    const LUVIA_URL = 'https://luviaplace.com';
    
    // Style du widget
    const style = document.createElement('style');
    style.textContent = `
        .luvia-widget {
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            background: linear-gradient(135deg, #0046e4 0%, #001a4d 100%);
            border-radius: 16px;
            padding: 2rem;
            color: white;
            text-align: center;
            max-width: 680px;
            margin: 0 auto;
            overflow: hidden;
        }
        .luvia-widget-logo {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            opacity: 0.8;
            margin-bottom: 1rem;
        }
        .luvia-widget-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .luvia-widget-subtitle {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 1.5rem;
        }
        .luvia-widget-services {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        .luvia-service-card {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 1rem 0.5rem;
            text-decoration: none;
            color: white;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }
        .luvia-service-card:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }
        .luvia-service-icon {
            font-size: 1.5rem;
        }
        .luvia-service-name {
            font-size: 0.7rem;
            font-weight: 600;
        }
        .luvia-widget-cta {
            display: inline-block;
            background: white;
            color: #0046e4;
            padding: 0.8rem 2rem;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.9rem;
            transition: all 0.3s;
        }
        .luvia-widget-cta:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        }
        @media (max-width: 480px) {
            .luvia-widget-services {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
    document.head.appendChild(style);

    // Contenu du widget
    const services = [
        { icon: '✈️', name: 'Vols & Voyages', url: LUVIA_URL + '/flights' },
        { icon: '🏨', name: 'Hôtels', url: LUVIA_URL + '/hotels' },
        { icon: '🛡️', name: 'Assurances', url: 'https://insurance.luviaplace.com' },
        { icon: '🎫', name: 'Activités', url: LUVIA_URL + '/activities' }
    ];

    // Rendu
    const widget = document.createElement('div');
    widget.className = 'luvia-widget';
    widget.innerHTML = `
        <div class="luvia-widget-logo">Luvia Place</div>
        <h3 class="luvia-widget-title">Votre voyage commence ici</h3>
        <p class="luvia-widget-subtitle">Vols, hôtels, assurances et activités — tout au même endroit.</p>
        <div class="luvia-widget-services">
            ${services.map(s => `
                <a href="${s.url}" target="_blank" rel="noopener" class="luvia-service-card">
                    <span class="luvia-service-icon">${s.icon}</span>
                    <span class="luvia-service-name">${s.name}</span>
                </a>
            `).join('')}
        </div>
        <a href="${LUVIA_URL}" target="_blank" rel="noopener" class="luvia-widget-cta">Découvrir Luvia Place →</a>
    `;

    // Chercher toutes les divs avec l'attribut data-luvia-widget
    document.querySelectorAll('[data-luvia-widget]').forEach(el => {
        el.appendChild(widget.cloneNode(true));
    });
})();
