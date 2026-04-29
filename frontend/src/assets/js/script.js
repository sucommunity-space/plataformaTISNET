const state = {
  session: null,
  publicContent: null,
  clientDashboard: null,
  adminOverview: null,
  activeClientTab: 'overview',
  activeAdminTab: 'dashboard',
  scheduleContext: null,
  latestLeadId: null,
  calendlyLoader: null,
  lastCalendlyEventKey: null,
  dragPayload: null,
  portfolioAutoScroll: null,
  selectedAdminClient: null,
  mobileNavActive: 'home',
  mobileNavSheetOpen: false,
  lastScrollY: 0,
  mobileHeaderVisible: true,
};

const dom = {};

const APP_ROUTES = {
  '/': { view: 'public-view', mobile: 'home' },
  '/inicio/': { view: 'public-view', mobile: 'home' },
  '/servicios/': { view: 'services-view', mobile: 'services' },
  '/portafolio/': { view: 'portfolio-view', mobile: 'portfolio' },
  '/contacto/': { view: 'contact-view', mobile: 'more' },
  '/nosotros/': { view: 'about-view', mobile: 'more' },
  '/calculadora-presupuesto-web/': { view: 'pricing-view', mobile: 'more' },
  '/dashboard/': { view: 'dashboard', mobile: 'panel' },
  '/dashboard/mi-proyecto/': { view: 'client-panel-view', clientTab: 'overview', mobile: 'panel' },
  '/dashboard/agenda-reunion/': { view: 'client-panel-view', clientTab: 'schedule', mobile: 'schedule' },
  '/dashboard/diagnostico/': { view: 'client-panel-view', clientTab: 'wizard', mobile: 'more' },
  '/dashboard/historial/': { view: 'client-panel-view', clientTab: 'history', mobile: 'more' },
  '/dashboard/configuracion/': { view: 'settings', mobile: 'more' },
  '/dashboard/crm/': { view: 'admin-panel-view', adminTab: 'crm', mobile: 'crm' },
  '/dashboard/proyectos/': { view: 'admin-panel-view', adminTab: 'projects', mobile: 'more' },
  '/dashboard/clientes/': { view: 'admin-panel-view', adminTab: 'clients', mobile: 'clients' },
  '/dashboard/calendario/': { view: 'admin-panel-view', adminTab: 'calendar', mobile: 'more' },
  '/dashboard/reportes/': { view: 'admin-panel-view', adminTab: 'reports', mobile: 'more' },
  '/diagnostico/': { view: 'wizard-view', mobile: 'more' },
  '/mi-proyecto/': { view: 'client-panel-view', clientTab: 'overview', mobile: 'panel' },
  '/agenda-reunion/': { view: 'client-panel-view', clientTab: 'schedule', mobile: 'schedule' },
  '/historial/': { view: 'client-panel-view', clientTab: 'history', mobile: 'more' },
  '/configuracion/': { view: 'settings', mobile: 'more' },
  '/crm/': { view: 'admin-panel-view', adminTab: 'crm', mobile: 'crm' },
  '/proyectos/': { view: 'admin-panel-view', adminTab: 'projects', mobile: 'more' },
  '/clientes/': { view: 'admin-panel-view', adminTab: 'clients', mobile: 'clients' },
  '/calendario/': { view: 'admin-panel-view', adminTab: 'calendar', mobile: 'more' },
  '/reportes/': { view: 'admin-panel-view', adminTab: 'reports', mobile: 'more' },
};

const AUTH_ROUTES = {
  '/login/': 'login',
  '/registro/': 'register',
};

const VIEW_ROUTES = {
  'public-view': '/',
  'services-view': '/servicios/',
  'portfolio-view': '/portafolio/',
  'contact-view': '/contacto/',
  'about-view': '/nosotros/',
  'pricing-view': '/calculadora-presupuesto-web/',
  'client-home': '/dashboard/',
  'client-panel-view': '/dashboard/',
  'admin-panel-view': '/dashboard/',
  'wizard-view': '/diagnostico/',
};

const CLIENT_TAB_ROUTES = {
  overview: '/dashboard/mi-proyecto/',
  schedule: '/dashboard/agenda-reunion/',
  wizard: '/dashboard/diagnostico/',
  history: '/dashboard/historial/',
  settings: '/dashboard/configuracion/',
};

const ADMIN_TAB_ROUTES = {
  dashboard: '/dashboard/',
  crm: '/dashboard/crm/',
  projects: '/dashboard/proyectos/',
  clients: '/dashboard/clientes/',
  calendar: '/dashboard/calendario/',
  reports: '/dashboard/reportes/',
  settings: '/dashboard/configuracion/',
};

const PRICING_CALCULATOR = {
  projectTypes: {
    landing: {
      label: 'Landing page',
      service: 'web',
      base: 850,
      deliveryDays: 10,
      summary: 'Pagina enfocada en campanas, captacion de leads y una sola accion principal.',
      modules: [
        {
          key: 'hero',
          title: 'Hero comercial',
          summary: 'Bloque inicial con propuesta de valor, CTA y mensaje directo.',
          bullets: ['Titular principal y subtitulo comercial', 'CTA visible desde el primer scroll', 'Jerarquia pensada para conversion'],
        },
        {
          key: 'lead-form',
          title: 'Formulario de contacto',
          summary: 'Captacion simple conectada a correo o WhatsApp.',
          bullets: ['Campos optimizados para conversion', 'Validacion basica', 'Envio a correo y accion secundaria'],
        },
        {
          key: 'proof',
          title: 'Prueba social',
          summary: 'Seccion de confianza para reforzar credibilidad.',
          bullets: ['Testimonios o logos', 'Bloque de beneficios', 'Apoyo visual alineado a la oferta'],
        },
        {
          key: 'responsive',
          title: 'Version responsive',
          summary: 'Adaptacion completa para celular, tablet y desktop.',
          bullets: ['Ajuste de tipografia y botones', 'Jerarquia movil optimizada', 'Carga visual limpia'],
        },
      ],
    },
    corporate: {
      label: 'Pagina corporativa',
      service: 'web',
      base: 1800,
      deliveryDays: 20,
      summary: 'Sitio institucional para mostrar servicios, equipo, confianza y captar reuniones.',
      modules: [
        {
          key: 'service-architecture',
          title: 'Arquitectura de servicios',
          summary: 'Secciones organizadas para comunicar oferta y procesos.',
          bullets: ['Home institucional', 'Bloques de servicios', 'Seccion nosotros y contacto'],
        },
        {
          key: 'trust',
          title: 'Bloques de confianza',
          summary: 'Casos, logos, certificaciones y argumentos comerciales.',
          bullets: ['Casos destacados', 'Indicadores o logros', 'Mensajes de autoridad'],
        },
        {
          key: 'contact-flow',
          title: 'Captacion comercial',
          summary: 'Formulario y CTA para convertir visitas en conversaciones.',
          bullets: ['Formulario conectado', 'Boton a WhatsApp', 'Llamadas a la accion visibles'],
        },
        {
          key: 'content-pages',
          title: 'Paginas base',
          summary: 'Maquetacion inicial para presentar empresa y propuesta.',
          bullets: ['Paginas internas listas para contenido', 'Navegacion limpia', 'Pie de pagina profesional'],
        },
      ],
    },
    ecommerce: {
      label: 'E-commerce',
      service: 'ecommerce',
      base: 3200,
      deliveryDays: 30,
      summary: 'Tienda online completa pensada para vender, administrar catalogo y escalar conversion.',
      modules: [
        {
          key: 'cart',
          title: 'Carrito de compras',
          summary: 'Flujo de compra con calculo de totales y acciones claras.',
          bullets: ['Agregar y quitar productos', 'Resumen de compra', 'Persistencia del carrito'],
        },
        {
          key: 'payments',
          title: 'Pasarela de pagos',
          summary: 'Integracion segura con medios de pago y validaciones basicas.',
          bullets: ['Mercado Pago o Stripe', 'Confirmacion de pago', 'Proteccion de checkout'],
        },
        {
          key: 'inventory',
          title: 'Gestion de inventario',
          summary: 'Control de stock y disponibilidad de productos.',
          bullets: ['Stock por producto', 'Alertas de inventario', 'Control de variantes'],
        },
        {
          key: 'admin',
          title: 'Panel de administracion',
          summary: 'Backoffice para pedidos, clientes y catalogo.',
          bullets: ['Gestion de productos', 'Revision de pedidos', 'Base de datos de clientes'],
        },
      ],
    },
    portfolio: {
      label: 'Portafolio personal',
      service: 'web',
      base: 1400,
      deliveryDays: 14,
      summary: 'Sitio personal para mostrar experiencia, trabajos y abrir conversaciones de negocio.',
      modules: [
        {
          key: 'profile',
          title: 'Presentacion personal',
          summary: 'Bloque inicial para marca personal y especialidad.',
          bullets: ['Mensaje de posicionamiento', 'CTA rapido', 'Imagen o retrato destacado'],
        },
        {
          key: 'projects',
          title: 'Galeria de proyectos',
          summary: 'Casos o trabajos seleccionados con narrativa visual.',
          bullets: ['Grid de proyectos', 'Descripcion resumida', 'Enlaces a casos o demos'],
        },
        {
          key: 'services',
          title: 'Servicios o habilidades',
          summary: 'Seccion orientada a explicar lo que ofreces y como trabajas.',
          bullets: ['Lista de servicios', 'Metodo de trabajo', 'Bloque de diferenciadores'],
        },
        {
          key: 'contact',
          title: 'Contacto directo',
          summary: 'Canales simples para contacto y conversion.',
          bullets: ['Formulario breve', 'Boton a WhatsApp', 'Redes o enlaces profesionales'],
        },
      ],
    },
    webapp: {
      label: 'Aplicacion web',
      service: 'crm',
      base: 5800,
      deliveryDays: 42,
      summary: 'Producto digital con login, paneles internos, flujos y logica de negocio personalizada.',
      modules: [
        {
          key: 'auth',
          title: 'Login y roles',
          summary: 'Acceso seguro con perfiles y permisos base.',
          bullets: ['Inicio de sesion', 'Roles de usuario', 'Control de acceso por vistas'],
        },
        {
          key: 'dashboard',
          title: 'Dashboard principal',
          summary: 'Vista central para metricas, estados y acciones frecuentes.',
          bullets: ['Tarjetas de estado', 'Tablas de trabajo', 'Resumen operativo'],
        },
        {
          key: 'workflows',
          title: 'Flujos internos',
          summary: 'Interacciones entre usuarios, formularios y tareas.',
          bullets: ['Formularios conectados', 'Estados del proceso', 'Acciones administrativas'],
        },
        {
          key: 'reports',
          title: 'Historial y reportes',
          summary: 'Consultas para revisar actividad, avance y trazabilidad.',
          bullets: ['Historial de movimientos', 'Filtros principales', 'Exportacion basica'],
        },
      ],
    },
    saas: {
      label: 'Plataforma SaaS',
      service: 'crm',
      base: 7600,
      deliveryDays: 55,
      summary: 'Base de producto SaaS para clientes, dashboards, roles, onboarding y crecimiento continuo.',
      modules: [
        {
          key: 'tenant',
          title: 'Onboarding de clientes',
          summary: 'Ingreso guiado para nuevos usuarios y primeras configuraciones.',
          bullets: ['Pantallas iniciales', 'Recorrido de activacion', 'Primeros datos configurables'],
        },
        {
          key: 'roles',
          title: 'Roles y permisos',
          summary: 'Control de acceso por perfiles y operaciones.',
          bullets: ['Usuarios administradores', 'Permisos por modulo', 'Seguridad base'],
        },
        {
          key: 'billing',
          title: 'Base para cobros',
          summary: 'Estructura lista para integrar planes y suscripciones.',
          bullets: ['Pantalla de planes', 'Preparacion para suscripciones', 'Estados de cuenta'],
        },
        {
          key: 'metrics',
          title: 'Panel de metricas',
          summary: 'Seguimiento de uso, clientes y salud del producto.',
          bullets: ['KPIs centrales', 'Actividad reciente', 'Indicadores de crecimiento'],
        },
      ],
    },
  },
  features: {
    seo: {
      label: 'SEO avanzado',
      price: 450,
      summary: 'Optimizacion tecnica y de contenido para tener mejor visibilidad desde el arranque.',
      bullets: ['Meta tags y estructura SEO', 'Sitemap y Search Console', 'Mejoras base de rendimiento'],
      defaultSelected: true,
    },
    cms: {
      label: 'CMS personalizado',
      price: 700,
      summary: 'Panel para editar textos, imagenes y secciones sin depender del equipo tecnico.',
      bullets: ['Gestion de contenidos', 'Secciones editables', 'Capacitacion basica de uso'],
      defaultSelected: false,
    },
    analytics: {
      label: 'Analytics avanzado',
      price: 350,
      summary: 'Medicion clara del rendimiento comercial del proyecto.',
      bullets: ['Google Analytics 4', 'Eventos de conversion', 'Dashboard inicial de metricas'],
      defaultSelected: true,
    },
    hosting: {
      label: 'Hosting premium (1 ano)',
      price: 280,
      summary: 'Infraestructura administrada para lanzar con mejor estabilidad y soporte.',
      bullets: ['Servidor optimizado', 'SSL y configuracion inicial', 'Monitoreo base de disponibilidad'],
      defaultSelected: false,
    },
    multilingual: {
      label: 'Sitio multidioma',
      price: 950,
      summary: 'Version preparada para manejar varios idiomas y una experiencia mas internacional.',
      bullets: ['Estructura multi idioma', 'Rutas y contenidos por idioma', 'Base para localizacion'],
      defaultSelected: false,
    },
    maintenance: {
      label: 'Mantenimiento (6 meses)',
      price: 650,
      summary: 'Soporte posterior al lanzamiento para correcciones y mejoras menores.',
      bullets: ['Actualizaciones basicas', 'Respaldos y monitoreo', 'Bolsa de ajustes menores'],
      defaultSelected: false,
    },
    automation: {
      label: 'Automatizacion de leads',
      price: 780,
      summary: 'Seguimiento comercial automatizado para responder y clasificar contactos.',
      bullets: ['Formularios conectados', 'Alertas internas', 'Automatizaciones de contacto'],
      defaultSelected: false,
    },
    crm: {
      label: 'CRM comercial',
      price: 920,
      summary: 'Pipeline para oportunidades, reuniones y control basico del proceso comercial.',
      bullets: ['Etapas del embudo', 'Registro de leads', 'Seguimiento operativo'],
      defaultSelected: false,
    },
  },
  deliveryModes: {
    urgent: {
      label: 'Urgente',
      multiplier: 1.3,
      daysFactor: 0.72,
      priceLabel: '+30%',
      summary: 'Priorizamos el proyecto para acortar tiempos con foco intensivo.',
    },
    normal: {
      label: 'Normal',
      multiplier: 1,
      daysFactor: 1,
      priceLabel: 'Base',
      summary: 'Ritmo de trabajo estandar recomendado para la mayoria de proyectos.',
    },
    flexible: {
      label: 'Flexible',
      multiplier: 0.9,
      daysFactor: 1.18,
      priceLabel: '-10%',
      summary: 'Ajustamos la agenda para reducir costo si no tienes urgencia.',
    },
  },
};

// Para editar o agregar integrantes, modifica este arreglo.
const TEAM_EXPERTS = [
  {
    name: 'Fernando',
    role: 'Estrategia y dirección comercial',
    bio: 'Define el enfoque del proyecto, ordena las prioridades y asegura que cada decisión esté alineada con los objetivos del negocio.',
    focus: ['Estrategia comercial', 'Planificación', 'Visión de crecimiento'],
    monogram: 'LE',
    image: '/src/assets/img/team/perso1.png',
    surfaceStart: 'rgba(0,212,255,.24)',
    surfaceEnd: 'rgba(10,102,194,.16)',
    glow: 'rgba(0,212,255,.4)',
  },
  {
    name: 'Omar',
    role: 'Diseño de experiencia e interfaz',
    bio: 'Crea interfaces modernas, intuitivas y enfocadas en que el usuario navegue fácil, entienda la propuesta y tome acción.',
    focus: ['Diseño visual', 'Experiencia de usuario', 'Diseño responsive'],
    monogram: 'UX',
    image: '/src/assets/img/team/perso2.png',
    surfaceStart: 'rgba(77,163,255,.2)',
    surfaceEnd: 'rgba(25,40,82,.16)',
    glow: 'rgba(77,163,255,.34)',
  },
  {
    name: 'José',
    role: 'Automatización y gestión de clientes',
    bio: 'Diseña flujos para captar contactos, registrar solicitudes, organizar seguimientos y mejorar la comunicación con tus clientes.',
    focus: ['Formularios inteligentes', 'Seguimiento comercial', 'Automatización'],
    monogram: 'AT',
    image: '/src/assets/img/team/perso3.png',
    surfaceStart: 'rgba(19,191,163,.24)',
    surfaceEnd: 'rgba(7,70,74,.16)',
    glow: 'rgba(19,191,163,.32)',
  },
  {
    name: 'Alexander',
    role: 'Desarrollo web e integraciones',
    bio: 'Se encarga de construir la parte técnica, conectar herramientas y asegurar que tu plataforma funcione de forma rápida, estable y segura.',
    focus: ['Frontend y backend', 'Integraciones API', 'Rendimiento web'],
    monogram: 'DQ',
    image: '/src/assets/img/team/perso4.png',
    surfaceStart: 'rgba(245,158,11,.22)',
    surfaceEnd: 'rgba(66,37,10,.18)',
    glow: 'rgba(245,158,11,.26)',
  },
];

document.addEventListener('DOMContentLoaded', init);

async function init() {
  cacheDom();
  bindStaticEvents();
  renderPricingCalculatorShell();
  renderTeamExperts();
  updateNavigation();
  handleWindowResize();
  handleWindowScroll();

  await Promise.all([loadPublicContent(), syncSession()]);
  applySessionDefaults();
  applyRoute(window.location.pathname, { replaceRoute: true });
  updatePricingCalculator();
}

function cacheDom() {
  dom.navbar = document.getElementById('navbar');
  dom.navVisitor = document.getElementById('nav-visitor');
  dom.navClient = document.getElementById('nav-client');
  dom.navAdmin = document.getElementById('nav-admin');
  dom.navSales = document.getElementById('nav-sales');
  dom.navActionsVisitor = document.getElementById('nav-actions-visitor');
  dom.navActionsAuth = document.getElementById('nav-actions-auth');
  dom.mobileNavShell = document.getElementById('mobile-nav-shell');
  dom.mobileNavDock = document.getElementById('mobile-nav-dock');
  dom.mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
  dom.mobileNavSheetGrid = document.getElementById('mobile-nav-sheet-grid');
  dom.mobileNavSheetKicker = document.getElementById('mobile-nav-sheet-kicker');
  dom.mobileNavSheetTitle = document.getElementById('mobile-nav-sheet-title');
  dom.mobileNavSheetCopy = document.getElementById('mobile-nav-sheet-copy');
  dom.userAvatar = document.getElementById('user-avatar-text');
  dom.userNameDisplay = document.getElementById('user-name-display');
  dom.clientGreetingName = document.getElementById('client-greeting-name');
  dom.adminPanelRoleCaption = document.getElementById('admin-panel-role-caption');

  dom.portfolioTrack = document.getElementById('portfolio-track');
  dom.portfolioProgress = document.getElementById('portfolio-progress');
  dom.portfolioMemoryGrid = document.getElementById('portfolio-memory-grid');
  dom.homeProjectGrid = document.getElementById('home-project-grid');
  dom.homeProjectWall = document.getElementById('home-project-wall');
  dom.clientLogos = document.getElementById('client-logos');
  dom.teamExpertsGrid = document.getElementById('team-experts-grid');
  dom.footerTagline = document.getElementById('footer-tagline');
  dom.footerEmailLink = document.getElementById('footer-email-link');
  dom.heroPrimaryCta = document.getElementById('hero-primary-cta');
  dom.ctaPrimaryCta = document.getElementById('cta-primary-cta');
  dom.footerMeetingLink = document.getElementById('footer-meeting-link');
  dom.newsletterWebsiteLabel = document.querySelector('label[for="newsletter-website"]');
  dom.newsletterWebsiteInput = document.getElementById('newsletter-website');
  dom.newsletterPhone = document.getElementById('newsletter-phone');
  dom.registerPhone = document.getElementById('register-phone');
  dom.registerWebsiteLabel = document.querySelector('label[for="register-website"]');
  dom.registerWebsiteInput = document.getElementById('register-website');

  dom.newsletterForm = document.getElementById('newsletter-form');
  dom.newsletterFeedback = document.getElementById('newsletter-feedback');
  dom.newsletterService = document.getElementById('newsletter-service');
  dom.newsletterName = document.getElementById('newsletter-name');
  dom.newsletterEmail = document.getElementById('newsletter-email');
  dom.newsletterMessage = document.getElementById('newsletter-message');
  dom.footerSubscribeForm = document.getElementById('footer-subscribe-form');
  dom.footerSubscribeName = document.getElementById('footer-subscribe-name');
  dom.footerSubscribeEmail = document.getElementById('footer-subscribe-email');
  dom.footerSubscribeFeedback = document.getElementById('footer-subscribe-feedback');

  dom.loginForm = document.getElementById('form-login');
  dom.registerForm = document.getElementById('form-register');

  dom.authModal = document.getElementById('modal-bg');
  dom.caseModal = document.getElementById('case-modal-bg');
  dom.scheduleModal = document.getElementById('schedule-modal-bg');

  dom.caseModalCategory = document.getElementById('case-modal-category');
  dom.caseModalTitle = document.getElementById('case-modal-title');
  dom.caseModalDescription = document.getElementById('case-modal-description');
  dom.caseModalHighlights = document.getElementById('case-modal-highlights');
  dom.caseModalMetrics = document.getElementById('case-modal-metrics');
  dom.caseModalMockups = document.getElementById('case-modal-mockups');

  dom.scheduleModalLabel = document.getElementById('schedule-modal-label');
  dom.scheduleModalTitle = document.getElementById('schedule-modal-title');
  dom.scheduleModalDescription = document.getElementById('schedule-modal-description');
  dom.scheduleFeedback = document.getElementById('schedule-feedback');
  dom.scheduleSwitch = document.getElementById('schedule-switch');
  dom.calendlyEmbed = document.getElementById('calendly-embed');

  dom.diagnosticForm = document.getElementById('diagnostic-form');
  dom.diagnosticStageInput = document.getElementById('diagnostic-business-stage');
  dom.diagnosticFeedback = document.getElementById('diagnostic-feedback');

  dom.pricingCalculatorForm = document.getElementById('pricing-calculator-form');
  dom.calcClientName = document.getElementById('calc-client-name');
  dom.calcClientEmail = document.getElementById('calc-client-email');
  dom.calcClientCompany = document.getElementById('calc-client-company');
  dom.calcClientDescription = document.getElementById('calc-client-description');
  dom.calcProjectType = document.getElementById('calc-project-type');
  dom.calcProjectPill = document.getElementById('calc-project-pill');
  dom.calcProjectTitle = document.getElementById('calc-project-title');
  dom.calcProjectSummary = document.getElementById('calc-project-summary');
  dom.calcBasePrice = document.getElementById('calc-base-price');
  dom.calcBaseTime = document.getElementById('calc-base-time');
  dom.calcModuleGrid = document.getElementById('calc-module-grid');
  dom.calcFeatureGrid = document.getElementById('calc-feature-grid');
  dom.calcDeliveryGrid = document.getElementById('calc-delivery-grid');
  dom.calcBreakdown = document.getElementById('calc-breakdown');
  dom.calcSummaryProject = document.getElementById('calc-summary-project');
  dom.calcSummaryDelivery = document.getElementById('calc-summary-delivery');
  dom.calcSummaryExtras = document.getElementById('calc-summary-extras');
  dom.calcSummaryDate = document.getElementById('calc-summary-date');
  dom.calcTotalOutput = document.getElementById('calc-total-output');
  dom.calcTotalCaption = document.getElementById('calc-total-caption');
  dom.calcSummaryNote = document.getElementById('calc-summary-note');
  dom.quoteDetailModalBg = document.getElementById('quote-detail-modal-bg');
  dom.quoteDetailKicker = document.getElementById('quote-detail-kicker');
  dom.quoteDetailTitle = document.getElementById('quote-detail-title');
  dom.quoteDetailDescription = document.getElementById('quote-detail-description');
  dom.quoteDetailBadge = document.getElementById('quote-detail-badge');
  dom.quoteDetailList = document.getElementById('quote-detail-list');

  dom.clientTabs = {
    overview: document.getElementById('ctab-overview'),
    schedule: document.getElementById('ctab-schedule'),
    history: document.getElementById('ctab-history'),
    settings: document.getElementById('ctab-settings'),
    wizard: document.getElementById('ctab-wizard'),
  };

  dom.adminTabs = {
    dashboard: document.getElementById('atab-dashboard'),
    crm: document.getElementById('atab-crm'),
    projects: document.getElementById('atab-projects'),
    clients: document.getElementById('atab-clients'),
    calendar: document.getElementById('atab-calendar'),
    reports: document.getElementById('atab-reports'),
    settings: document.getElementById('atab-settings'),
  };

  dom.adminClientModalBg = document.getElementById('admin-client-modal-bg');
  dom.adminClientModalTitle = document.getElementById('admin-client-modal-title');
  dom.adminClientModalSubtitle = document.getElementById('admin-client-modal-subtitle');
  dom.adminClientModalContent = document.getElementById('admin-client-modal-content');

  dom.toastStack = document.getElementById('toast-stack');
}

function bindStaticEvents() {
  dom.newsletterForm?.addEventListener('submit', handleNewsletterSubmit);
  dom.footerSubscribeForm?.addEventListener('submit', handleFooterSubscribeSubmit);
  dom.loginForm?.addEventListener('submit', handleLoginSubmit);
  dom.registerForm?.addEventListener('submit', handleRegisterSubmit);
  dom.diagnosticForm?.addEventListener('submit', handleDiagnosticSubmit);
  dom.pricingCalculatorForm?.addEventListener('input', updatePricingCalculator);
  dom.pricingCalculatorForm?.addEventListener('change', updatePricingCalculator);
  dom.portfolioTrack?.addEventListener('scroll', syncPortfolioProgress, { passive: true });
  dom.portfolioTrack?.addEventListener('mouseenter', stopPortfolioAutoplay);
  dom.portfolioTrack?.addEventListener('mouseleave', startPortfolioAutoplay);
  dom.newsletterPhone?.addEventListener('input', handlePhoneInput);
  dom.registerPhone?.addEventListener('input', handlePhoneInput);

  document.addEventListener('submit', handleDynamicSubmit);
  document.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('message', handleCalendlyWindowMessage);
  window.addEventListener('popstate', handleRoutePopstate);
  window.addEventListener('resize', syncCalendlyEmbedLayout);
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('scroll', handleWindowScroll, { passive: true });
}

function normalizeAppRoute(pathname = window.location.pathname) {
  const cleanPath = (pathname || '/').split('?')[0].split('#')[0];
  if (!cleanPath || cleanPath === '/') {
    return '/';
  }
  return `/${cleanPath.replace(/^\/+|\/+$/g, '')}/`;
}

function getActiveViewId() {
  return document.querySelector('.view.active')?.id || 'public-view';
}

function getRouteForView(viewId) {
  if (viewId === 'client-panel-view') {
    return CLIENT_TAB_ROUTES[state.activeClientTab] || CLIENT_TAB_ROUTES.overview;
  }
  if (viewId === 'admin-panel-view') {
    return ADMIN_TAB_ROUTES[state.activeAdminTab] || ADMIN_TAB_ROUTES.dashboard;
  }
  return VIEW_ROUTES[viewId] || '/';
}

function getRouteForAuthTab(tab) {
  return tab === 'register' ? '/registro/' : '/login/';
}

function writeBrowserRoute(pathname, options = {}) {
  if (!window.history?.pushState) {
    return;
  }

  const nextPath = normalizeAppRoute(pathname);
  if ((window.location.pathname || '/') === nextPath) {
    return;
  }

  const method = options.replace ? 'replaceState' : 'pushState';
  window.history[method]({ path: nextPath }, '', nextPath);
}

function navigateToRoute(event, pathname) {
  event?.preventDefault();
  applyRoute(pathname);
}

function handleRoutePopstate() {
  applyRoute(window.location.pathname, { fromPopState: true });
}

function applyRoute(pathname = window.location.pathname, options = {}) {
  const route = normalizeAppRoute(pathname);
  const authTab = AUTH_ROUTES[route];
  if (authTab) {
    showView('public-view', { pushRoute: false });
    openModal(authTab, { pushRoute: false });
    if (!options.fromPopState) {
      writeBrowserRoute(route, { replace: options.replaceRoute });
    }
    return;
  }

  const routeConfig = APP_ROUTES[route] || APP_ROUTES['/'];
  const canonicalRoute = APP_ROUTES[route] ? route : '/';
  if (routeConfig.mobile) {
    state.mobileNavActive = routeConfig.mobile;
  }
  if (routeConfig.clientTab) {
    state.activeClientTab = routeConfig.clientTab;
  }
  if (routeConfig.adminTab) {
    state.activeAdminTab = routeConfig.adminTab;
  }

  dom.authModal?.classList.add('hidden');
  let targetView = routeConfig.view;
  if (routeConfig.view === 'dashboard') {
    if (isOperatorRole(state.session?.role)) {
      state.activeAdminTab = 'dashboard';
      targetView = 'admin-panel-view';
    } else {
      state.activeClientTab = 'overview';
      targetView = 'client-panel-view';
    }
  }
  if (routeConfig.view === 'settings') {
    if (isOperatorRole(state.session?.role)) {
      state.activeAdminTab = 'settings';
      targetView = 'admin-panel-view';
    } else {
      state.activeClientTab = 'settings';
      targetView = 'client-panel-view';
    }
  }
  showView(targetView, { pushRoute: false });

  if (!options.fromPopState) {
    writeBrowserRoute(canonicalRoute, { replace: options.replaceRoute });
  }
}

async function api(path, options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };

  if (options.body !== undefined) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(path, config);
  } catch (error) {
    throw new Error(buildBackendConnectionMessage());
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(buildBackendConnectionMessage());
  }

  const payload = await response.json().catch(() => ({ success: false, message: 'Respuesta no válida.' }));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Ocurrió un error en la API.');
  }

  return payload;
}

function buildBackendConnectionMessage() {
  if (window.location.protocol === 'file:') {
    return 'Estás abriendo el HTML directamente. Inicia Flask y entra por http://127.0.0.1:5000.';
  }

  return 'No pudimos conectar con el backend de Python. Publica o ejecuta la app Flask junto con las rutas /api/.';
}

async function loadPublicContent() {
  try {
    const payload = await api('/api/public/content');
    state.publicContent = payload;
    renderPublicContent();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function syncSession() {
  try {
    const payload = await api('/api/auth/session');
    state.session = payload.authenticated ? payload.user : null;
    updateNavigation();
    applySessionDefaults();

    if (state.session) {
      if (state.session.role === 'client') {
        await loadClientDashboard();
      }
      if (isOperatorRole(state.session.role)) {
        await loadAdminOverview();
      }
    }
  } catch (error) {
    toast(error.message, 'error');
  }
}

function isOperatorRole(role) {
  return role === 'admin' || role === 'sales';
}

function isAdminRole(role) {
  return role === 'admin';
}

function allowedAdminTabs(role = state.session?.role) {
  if (role === 'sales') {
    return ['dashboard', 'crm', 'clients', 'calendar', 'reports'];
  }
  if (role === 'admin') {
    return ['dashboard', 'crm', 'projects', 'clients', 'calendar', 'reports', 'settings'];
  }
  return [];
}

function canAccessAdminTab(tab, role = state.session?.role) {
  return allowedAdminTabs(role).includes(tab);
}

function applyAdminRolePresentation() {
  const role = state.session?.role;
  const isAdmin = isAdminRole(role);

  if (dom.adminPanelRoleCaption) {
    dom.adminPanelRoleCaption.textContent = role === 'sales' ? 'Panel Ventas' : 'Panel Administrador';
  }

  document.querySelectorAll('[data-role-scope="admin"]').forEach((node) => {
    node.classList.toggle('hidden', !isAdmin);
  });

  if (isOperatorRole(role) && !canAccessAdminTab(state.activeAdminTab, role)) {
    state.activeAdminTab = 'dashboard';
  }
}

function updateNavigation() {
  const user = state.session;

  if (!user) {
    dom.navVisitor?.classList.remove('hidden');
    dom.navClient?.classList.add('hidden');
    dom.navAdmin?.classList.add('hidden');
    dom.navSales?.classList.add('hidden');
    dom.navActionsVisitor?.classList.remove('hidden');
    dom.navActionsAuth?.classList.add('hidden');
    applyAdminRolePresentation();
    syncMobileNavigation();
    return;
  }

  dom.navVisitor?.classList.add('hidden');
  dom.navActionsVisitor?.classList.add('hidden');
  dom.navActionsAuth?.classList.remove('hidden');
  dom.userNameDisplay.textContent = user.full_name;
  dom.userAvatar.textContent = initials(user.full_name);
  dom.clientGreetingName.textContent = firstName(user.full_name);

  if (user.role === 'client') {
    dom.navClient?.classList.remove('hidden');
    dom.navAdmin?.classList.add('hidden');
    dom.navSales?.classList.add('hidden');
  } else if (user.role === 'sales') {
    dom.navClient?.classList.add('hidden');
    dom.navAdmin?.classList.add('hidden');
    dom.navSales?.classList.remove('hidden');
  } else {
    dom.navClient?.classList.add('hidden');
    dom.navAdmin?.classList.remove('hidden');
    dom.navSales?.classList.add('hidden');
  }

  applyAdminRolePresentation();
  syncMobileNavigation();
  applySessionDefaults();
}

function applySessionDefaults() {
  const user = state.session;
  if (!user || user.role !== 'client') {
    return;
  }

  const fillIfEmpty = (element, value) => {
    if (!element || element.value || !value) {
      return;
    }
    element.value = value;
  };

  fillIfEmpty(dom.newsletterName, user.full_name);
  fillIfEmpty(dom.newsletterEmail, user.email);
  fillIfEmpty(document.getElementById('newsletter-company'), user.company);
  fillIfEmpty(document.getElementById('newsletter-website'), user.website);
  fillIfEmpty(dom.newsletterPhone, user.phone);
  fillIfEmpty(dom.footerSubscribeName, user.full_name);
  fillIfEmpty(dom.footerSubscribeEmail, user.email);
  fillIfEmpty(dom.calcClientName, user.full_name);
  fillIfEmpty(dom.calcClientEmail, user.email);
  fillIfEmpty(dom.calcClientCompany, user.company);
}

function handleGlobalKeydown(event) {
  if (event.key === 'Escape' && state.mobileNavSheetOpen) {
    closeMobileNavSheet();
  }
}

function handleWindowResize() {
  if (window.innerWidth > 1024 && state.mobileNavSheetOpen) {
    closeMobileNavSheet();
  }

  if (window.innerWidth > 1024) {
    state.mobileHeaderVisible = true;
    dom.navbar?.classList.remove('mobile-navbar-hidden', 'mobile-navbar-scrolled');
  }

  handleWindowScroll();
}

function isMobileViewport() {
  return window.innerWidth <= 1024;
}

function setMobileHeaderVisibility(visible) {
  state.mobileHeaderVisible = visible;
  if (!isMobileViewport()) {
    dom.navbar?.classList.remove('mobile-navbar-hidden');
    return;
  }

  dom.navbar?.classList.toggle('mobile-navbar-hidden', !visible);
}

function handleWindowScroll() {
  const currentY = Math.max(window.scrollY || 0, 0);
  state.lastScrollY = Number.isFinite(state.lastScrollY) ? state.lastScrollY : currentY;

  if (!isMobileViewport()) {
    state.mobileHeaderVisible = true;
    dom.navbar?.classList.remove('mobile-navbar-hidden', 'mobile-navbar-scrolled');
    state.lastScrollY = currentY;
    return;
  }

  dom.navbar?.classList.toggle('mobile-navbar-scrolled', currentY > 12);

  if (state.mobileNavSheetOpen || currentY < 18) {
    setMobileHeaderVisibility(true);
    state.lastScrollY = currentY;
    return;
  }

  const delta = currentY - state.lastScrollY;

  if (delta > 8 && currentY > 120) {
    setMobileHeaderVisibility(false);
  } else if (delta < -8) {
    setMobileHeaderVisibility(true);
  }

  state.lastScrollY = currentY;
}

function getActiveViewId() {
  return document.querySelector('.view.active')?.id || 'public-view';
}

function getMobileNavigationConfig() {
  if (!state.session) {
    return {
      kicker: 'Navegacion movil',
      title: 'Explora TISNET',
      copy: 'Accesos rapidos para revisar servicios, casos y acciones clave desde celular.',
      primary: [
        { key: 'home', label: 'Inicio', icon: 'home', action: 'home' },
        { key: 'services', label: 'Servicios', icon: 'spark', action: 'services' },
        { key: 'portfolio', label: 'Casos', icon: 'layers', action: 'portfolio' },
        { key: 'more', label: 'Mas', icon: 'more', action: 'more', accent: true },
      ],
      sheet: [
        { label: 'Contacto', description: 'Ir al formulario comercial y al newsletter.', action: 'contact' },
        { label: 'Nosotros', description: 'Conocer al equipo que disena y ejecuta cada experiencia.', action: 'about' },
        { label: 'Presupuesto web', description: 'Abrir la calculadora de presupuesto del proyecto.', action: 'pricing' },
        { label: 'Iniciar sesion', description: 'Entrar al panel de cliente, ventas o administrador.', action: 'login' },
        { label: 'Registrarse', description: 'Crear tu cuenta y activar diagnostico, agenda y panel.', action: 'register' },
        { label: 'WhatsApp', description: 'Continuar la conversacion de forma directa.', action: 'whatsapp' },
      ],
    };
  }

  if (state.session.role === 'client') {
    return {
      kicker: 'Panel cliente',
      title: 'Navega con tu cuenta',
      copy: 'Explora la web completa y vuelve a tu dashboard cuando quieras sin cerrar sesion.',
      primary: [
        { key: 'home', label: 'Inicio', icon: 'home', action: 'home' },
        { key: 'panel', label: 'Dashboard', icon: 'panel', action: 'client-panel' },
        { key: 'portfolio', label: 'Casos', icon: 'layers', action: 'portfolio' },
        { key: 'more', label: 'Mas', icon: 'more', action: 'more', accent: true },
      ],
      sheet: [
        { label: 'Servicios', description: 'Ver capacidades, soluciones y rutas recomendadas.', action: 'services' },
        { label: 'Contacto', description: 'Enviar una solicitud asociada a tu cuenta.', action: 'contact' },
        { label: 'Nosotros', description: 'Conocer al equipo que ejecuta la experiencia digital.', action: 'about' },
        { label: 'Presupuesto web', description: 'Calcular y guardar una cotizacion con tu usuario.', action: 'pricing' },
        { label: 'Agenda', description: 'Reservar o revisar reuniones desde tu dashboard.', action: 'client-schedule' },
        { label: 'Diagnostico', description: 'Completar o actualizar el formulario inteligente.', action: 'client-wizard' },
        { label: 'Historial', description: 'Revisar actividad y seguimiento del proyecto.', action: 'client-history' },
        { label: 'Configuracion', description: 'Editar tus datos y preferencias del panel.', action: 'client-settings' },
        { label: 'Cerrar sesion', description: 'Salir del panel actual.', action: 'logout' },
      ],
    };
  }

  if (state.session.role === 'sales') {
    return {
      kicker: 'Panel ventas',
      title: 'Opera desde movil',
      copy: 'CRM, clientes y accesos secundarios en una navegacion compacta y mas clara.',
      primary: [
        { key: 'dashboard', label: 'Panel', icon: 'panel', action: 'admin-dashboard' },
        { key: 'crm', label: 'CRM', icon: 'analytics', action: 'admin-crm' },
        { key: 'clients', label: 'Clientes', icon: 'users', action: 'admin-clients' },
        { key: 'more', label: 'Mas', icon: 'more', action: 'more', accent: true },
      ],
      sheet: [
        { label: 'Calendario', description: 'Ver reuniones y agenda comercial.', action: 'admin-calendar' },
        { label: 'Reportes', description: 'Revisar metricas y actividad del equipo.', action: 'admin-reports' },
        { label: 'Cerrar sesion', description: 'Salir del panel de ventas.', action: 'logout' },
      ],
    };
  }

  return {
    kicker: 'Panel administrador',
    title: 'Gestiona TISNET',
    copy: 'Una navegacion movil mas ordenada para CRM, clientes y operaciones internas.',
    primary: [
      { key: 'dashboard', label: 'Panel', icon: 'panel', action: 'admin-dashboard' },
      { key: 'crm', label: 'CRM', icon: 'analytics', action: 'admin-crm' },
      { key: 'clients', label: 'Clientes', icon: 'users', action: 'admin-clients' },
      { key: 'more', label: 'Mas', icon: 'more', action: 'more', accent: true },
    ],
    sheet: [
      { label: 'Proyectos', description: 'Abrir el tablero de proyectos y tareas.', action: 'admin-projects' },
      { label: 'Calendario', description: 'Consultar reuniones y agenda operativa.', action: 'admin-calendar' },
      { label: 'Reportes', description: 'Ver metricas y rendimiento general.', action: 'admin-reports' },
      { label: 'Configuracion', description: 'Editar contenido, accesos y parametros.', action: 'admin-settings' },
      { label: 'Cerrar sesion', description: 'Salir del panel administrativo.', action: 'logout' },
    ],
  };
}

function getMobileIcon(icon) {
  const icons = {
    home: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 10.5 12 4l8.5 6.5"></path>
        <path d="M6.5 9.5V20h11V9.5"></path>
      </svg>
    `,
    spark: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5v5"></path>
        <path d="M12 15.5v5"></path>
        <path d="M4.5 12h5"></path>
        <path d="M14.5 12h5"></path>
        <path d="m6.7 6.7 3.2 3.2"></path>
        <path d="m14.1 14.1 3.2 3.2"></path>
        <path d="m17.3 6.7-3.2 3.2"></path>
        <path d="m9.9 14.1-3.2 3.2"></path>
      </svg>
    `,
    layers: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4 20 8.5 12 13 4 8.5 12 4Z"></path>
        <path d="M4 12.5 12 17l8-4.5"></path>
        <path d="M4 16.5 12 21l8-4.5"></path>
      </svg>
    `,
    panel: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="4" width="7" height="7" rx="1.5"></rect>
        <rect x="13.5" y="4" width="7" height="4" rx="1.5"></rect>
        <rect x="13.5" y="11" width="7" height="9" rx="1.5"></rect>
        <rect x="3.5" y="14" width="7" height="6" rx="1.5"></rect>
      </svg>
    `,
    calendar: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="15" rx="2"></rect>
        <path d="M7.5 3.5v4"></path>
        <path d="M16.5 3.5v4"></path>
        <path d="M3.5 10h17"></path>
      </svg>
    `,
    analytics: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 18.5h14"></path>
        <path d="M7.5 15V10"></path>
        <path d="M12 15V6.5"></path>
        <path d="M16.5 15v-3.5"></path>
        <path d="m6.5 8.5 4-3 4 2 3-2"></path>
      </svg>
    `,
    users: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.2 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
        <path d="M15.8 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
        <path d="M3.8 19a4.6 4.6 0 0 1 8.8 0"></path>
        <path d="M13.2 19a3.8 3.8 0 0 1 7 0"></path>
      </svg>
    `,
    more: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h.01"></path>
        <path d="M12 12h.01"></path>
        <path d="M19 12h.01"></path>
      </svg>
    `,
  };

  return icons[icon] || icons.more;
}

function renderMobileNavigation() {
  if (!dom.mobileNavDock || !dom.mobileNavSheetGrid) {
    return;
  }

  const config = getMobileNavigationConfig();
  const activeKey = state.mobileNavSheetOpen ? 'more' : state.mobileNavActive;

  dom.mobileNavDock.innerHTML = config.primary
    .map(
      (item) => `
        <button
          class="mobile-nav-item ${item.key === activeKey ? 'is-active' : ''} ${item.accent ? 'is-accent' : ''}"
          type="button"
          onclick="handleMobileNavAction('${escapeAttribute(item.action)}')"
        >
          <span class="mobile-nav-icon">${getMobileIcon(item.icon)}</span>
          <span class="mobile-nav-label">${escapeHtml(item.label)}</span>
        </button>
      `
    )
    .join('');

  dom.mobileNavSheetKicker.textContent = config.kicker;
  dom.mobileNavSheetTitle.textContent = config.title;
  dom.mobileNavSheetCopy.textContent = config.copy;
  dom.mobileNavSheetGrid.innerHTML = config.sheet
    .map(
      (item) => `
        <button class="mobile-nav-sheet-action" type="button" onclick="handleMobileNavAction('${escapeAttribute(item.action)}')">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.description)}</span>
          </div>
          <em>→</em>
        </button>
      `
    )
    .join('');

  dom.mobileNavBackdrop?.classList.toggle('hidden', !state.mobileNavSheetOpen);
  document.body.classList.toggle('mobile-nav-sheet-open', state.mobileNavSheetOpen);
}

function normalizeMobilePrimaryKey(key) {
  const config = getMobileNavigationConfig();
  return config.primary.some((item) => item.key === key) ? key : config.primary[0]?.key || 'home';
}

function syncMobileNavigation() {
  let nextKey = state.mobileNavActive;
  const activeViewId = getActiveViewId();

  if (!state.session) {
    if (activeViewId === 'pricing-view') {
      nextKey = 'more';
    } else if (activeViewId === 'services-view') {
      nextKey = 'services';
    } else if (activeViewId === 'portfolio-view') {
      nextKey = 'portfolio';
    } else if (activeViewId === 'contact-view' || activeViewId === 'about-view') {
      nextKey = 'more';
    } else if (!['home', 'services', 'portfolio', 'more'].includes(nextKey)) {
      nextKey = 'home';
    }
  } else if (state.session.role === 'client') {
    if (activeViewId === 'public-view' || activeViewId === 'client-home') {
      nextKey = 'home';
    } else if (activeViewId === 'client-panel-view') {
      nextKey = 'panel';
    } else if (activeViewId === 'portfolio-view') {
      nextKey = 'portfolio';
    } else {
      nextKey = 'more';
    }
  } else if (activeViewId === 'admin-panel-view') {
    if (state.activeAdminTab === 'crm') {
      nextKey = 'crm';
    } else if (state.activeAdminTab === 'clients') {
      nextKey = 'clients';
    } else if (state.activeAdminTab === 'dashboard') {
      nextKey = 'dashboard';
    } else {
      nextKey = 'more';
    }
  } else {
    nextKey = 'dashboard';
  }

  state.mobileNavActive = normalizeMobilePrimaryKey(nextKey);
  renderMobileNavigation();
}

function closeMobileNavSheet(event) {
  if (event && event.target !== dom.mobileNavBackdrop) {
    return;
  }

  state.mobileNavSheetOpen = false;
  setMobileHeaderVisibility(true);
  renderMobileNavigation();
}

function toggleMobileNavSheet() {
  state.mobileNavSheetOpen = !state.mobileNavSheetOpen;
  if (state.mobileNavSheetOpen) {
    setMobileHeaderVisibility(true);
  }
  renderMobileNavigation();
}

function handleMobileNavAction(action) {
  if (action === 'more') {
    toggleMobileNavSheet();
    return;
  }

  state.mobileNavSheetOpen = false;

  switch (action) {
    case 'home':
      state.mobileNavActive = 'home';
      showView('public-view');
      break;
    case 'services':
      state.mobileNavActive = 'services';
      showView('services-view');
      break;
    case 'portfolio':
      state.mobileNavActive = 'portfolio';
      showView('portfolio-view');
      break;
    case 'contact':
      state.mobileNavActive = 'more';
      showView('contact-view');
      break;
    case 'about':
      state.mobileNavActive = 'more';
      showView('about-view');
      break;
    case 'pricing':
      state.mobileNavActive = 'more';
      openPricingCalculator();
      break;
    case 'login':
      openModal('login');
      break;
    case 'register':
      openModal('register');
      break;
    case 'whatsapp':
      openWA('Hola TISNET, quiero avanzar desde la navegacion movil con mi proyecto.');
      break;
    case 'client-home':
      state.mobileNavActive = 'home';
      showView('client-home');
      break;
    case 'client-panel':
      applyRoute(CLIENT_TAB_ROUTES.overview);
      break;
    case 'client-schedule':
      applyRoute(CLIENT_TAB_ROUTES.schedule);
      break;
    case 'client-wizard':
      applyRoute('/diagnostico/');
      break;
    case 'client-history':
      applyRoute(CLIENT_TAB_ROUTES.history);
      break;
    case 'client-settings':
      applyRoute(CLIENT_TAB_ROUTES.settings);
      break;
    case 'admin-dashboard':
      applyRoute(ADMIN_TAB_ROUTES.dashboard);
      break;
    case 'admin-crm':
      applyRoute(ADMIN_TAB_ROUTES.crm);
      break;
    case 'admin-clients':
      applyRoute(ADMIN_TAB_ROUTES.clients);
      break;
    case 'admin-projects':
      applyRoute(ADMIN_TAB_ROUTES.projects);
      break;
    case 'admin-calendar':
      applyRoute(ADMIN_TAB_ROUTES.calendar);
      break;
    case 'admin-reports':
      applyRoute(ADMIN_TAB_ROUTES.reports);
      break;
    case 'admin-settings':
      applyRoute(ADMIN_TAB_ROUTES.settings);
      break;
    case 'logout':
      logout();
      break;
    default:
      break;
  }

  renderMobileNavigation();
}

function getHomeShowcaseTheme(index) {
  const themes = [
    {
      start: 'rgba(14, 26, 58, 0.96)',
      end: 'rgba(10, 102, 194, 0.88)',
      glow: 'rgba(0, 212, 255, 0.28)',
      tint: 'rgba(122, 214, 255, 0.16)',
    },
    {
      start: 'rgba(20, 18, 46, 0.96)',
      end: 'rgba(78, 91, 255, 0.82)',
      glow: 'rgba(128, 145, 255, 0.24)',
      tint: 'rgba(128, 145, 255, 0.16)',
    },
    {
      start: 'rgba(14, 32, 34, 0.96)',
      end: 'rgba(12, 131, 142, 0.84)',
      glow: 'rgba(38, 211, 190, 0.22)',
      tint: 'rgba(38, 211, 190, 0.14)',
    },
    {
      start: 'rgba(34, 18, 44, 0.96)',
      end: 'rgba(134, 49, 191, 0.82)',
      glow: 'rgba(210, 111, 255, 0.2)',
      tint: 'rgba(210, 111, 255, 0.14)',
    },
  ];

  return themes[index % themes.length];
}

function buildHomeShowcaseCard(item, index) {
  const theme = getHomeShowcaseTheme(index);
  const highlights = [item.highlight_1, item.highlight_2, item.highlight_3].filter(Boolean).slice(0, 2);
  const slugLabel = (item.slug || item.title || `proyecto-${index + 1}`).replaceAll('-', '/');

  return `
    <article
      class="home-showcase-card"
      style="--showcase-start:${escapeAttribute(theme.start)}; --showcase-end:${escapeAttribute(theme.end)}; --showcase-glow:${escapeAttribute(theme.glow)}; --showcase-tint:${escapeAttribute(theme.tint)};"
    >
      <div class="home-showcase-browser">
        <div class="home-showcase-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="home-showcase-url">tisnet.space/${escapeHtml(slugLabel)}</span>
      </div>

      <div class="home-showcase-screen">
        <div class="home-showcase-card-top">
          <span class="home-showcase-kicker">${escapeHtml(item.category || 'Proyecto digital')}</span>
          <span class="home-showcase-icon">${escapeHtml(item.icon || '•')}</span>
        </div>

        <h3 class="home-showcase-card-title">${escapeHtml(item.title || 'Proyecto TISNET')}</h3>
        <p class="home-showcase-card-copy">${escapeHtml(item.short_description || 'Solucion digital creada para crecer con mejor estructura, conversion y operacion.')}</p>

        <div class="home-showcase-wireframe" aria-hidden="true">
          <span class="is-primary"></span>
          <span class="is-wide"></span>
          <span></span>
          <span class="is-soft"></span>
        </div>

        <div class="home-showcase-chip-row">
          ${highlights
      .map(
        (highlight) => `
                <span class="home-showcase-chip">${escapeHtml(highlight)}</span>
              `
      )
      .join('')}
        </div>
      </div>
    </article>
  `;
}

function renderHomeProjectWall(portfolio) {
  if (!dom.homeProjectWall) {
    return;
  }

  if (!portfolio?.length) {
    dom.homeProjectWall.innerHTML = '';
    return;
  }

  const columnCount = 4;
  const minimumCards = 14;
  const source = Array.from({ length: Math.max(minimumCards, portfolio.length * 2) }, (_, index) => portfolio[index % portfolio.length]);
  const columns = Array.from({ length: columnCount }, () => []);

  source.forEach((item, index) => {
    columns[index % columnCount].push(buildHomeShowcaseCard(item, index));
  });

  dom.homeProjectWall.innerHTML = columns
    .map(
      (cards, index) => `
        <div
          class="home-showcase-column ${index % 2 === 0 ? 'is-moving-up' : 'is-moving-down'}"
          style="--showcase-duration:${12 + index * 1.2}s; --showcase-delay:-${index * 1.2}s; --showcase-drift:${56 + index * 12}px;"
        >
          ${cards.join('')}
        </div>
      `
    )
    .join('');
}

function buildPortfolioMemoryItems(portfolio) {
  if (!portfolio?.length) {
    return [];
  }

  return Array.from({ length: 12 }, (_, index) => {
    const item = portfolio[index % portfolio.length];
    return { ...item, memoryIndex: index };
  });
}

function renderPortfolioMemoryGrid(portfolio) {
  if (!dom.portfolioMemoryGrid) {
    return;
  }

  const memoryItems = buildPortfolioMemoryItems(portfolio);

  dom.portfolioMemoryGrid.innerHTML = memoryItems
    .map((item) => {
      const highlights = [item.highlight_1, item.highlight_2, item.highlight_3]
        .filter(Boolean)
        .slice(0, 2);
      const indexLabel = String(item.memoryIndex + 1).padStart(2, '0');

      return `
        <button
          class="portfolio-memory-card"
          type="button"
          aria-label="Ver proyecto ${escapeAttribute(item.title || 'TISNET')}"
          onclick="openCaseModal('${escapeAttribute(item.slug)}')"
        >
          <span class="portfolio-memory-inner">
            <span class="portfolio-memory-face portfolio-memory-front">
              <span class="portfolio-memory-top">
                <span>${indexLabel}</span>
                <span>${escapeHtml(item.category || 'Proyecto digital')}</span>
              </span>
              <span class="portfolio-memory-screen" aria-hidden="true">
                <span class="portfolio-memory-window">
                  <span class="portfolio-memory-bar is-wide"></span>
                  <span class="portfolio-memory-bar"></span>
                  <span class="portfolio-memory-bar is-soft"></span>
                </span>
                <span class="portfolio-memory-icon">${escapeHtml(item.icon || '*')}</span>
              </span>
            </span>
            <span class="portfolio-memory-face portfolio-memory-back">
              <span class="portfolio-memory-back-kicker">${escapeHtml(item.category || 'Caso TISNET')}</span>
              <strong>${escapeHtml(item.title || 'Proyecto TISNET')}</strong>
              <span class="portfolio-memory-copy">${escapeHtml(item.short_description || 'Solucion digital creada para crecer con mejor presencia y operacion.')}</span>
              <span class="portfolio-memory-tags">
                ${highlights.map((highlight) => `<em>${escapeHtml(highlight)}</em>`).join('')}
              </span>
              <span class="portfolio-memory-see">Ver</span>
            </span>
          </span>
        </button>
      `;
    })
    .join('');
}

function renderPublicContent() {
  if (!state.publicContent) {
    return;
  }

  const { settings, portfolio, clients } = state.publicContent;
  const configuredHeroCta = (settings.hero_cta_label || '').trim();
  const publicMeetingCta =
    configuredHeroCta && !configuredHeroCta.toLowerCase().includes('diagn')
      ? configuredHeroCta
      : 'Solicita tu reunion';

  if (dom.footerTagline) {
    dom.footerTagline.textContent = settings.footer_tagline || dom.footerTagline.textContent;
  }

  if (dom.footerEmailLink) {
    dom.footerEmailLink.href = `mailto:${settings.contact_email}`;
    dom.footerEmailLink.textContent = settings.contact_email;
  }

  if (dom.heroPrimaryCta) {
    dom.heroPrimaryCta.textContent = publicMeetingCta;
  }

  if (dom.ctaPrimaryCta) {
    dom.ctaPrimaryCta.textContent = publicMeetingCta;
  }

  if (dom.footerMeetingLink) {
    dom.footerMeetingLink.textContent = 'Solicitar reunion';
  }

  if (dom.newsletterWebsiteLabel) {
    dom.newsletterWebsiteLabel.textContent = 'Red social (opcional)';
  }

  if (dom.newsletterWebsiteInput) {
    dom.newsletterWebsiteInput.type = 'text';
    dom.newsletterWebsiteInput.placeholder = '@tu_marca o https://tiktok.com/@tu_marca';
  }

  if (dom.registerWebsiteLabel) {
    dom.registerWebsiteLabel.textContent = 'Red social (opcional)';
  }

  if (dom.registerWebsiteInput) {
    dom.registerWebsiteInput.type = 'text';
    dom.registerWebsiteInput.placeholder = '@tuempresa o https://instagram.com/tuempresa';
  }

  renderPortfolioMemoryGrid(portfolio);
  if (dom.portfolioMemoryGrid) {
    stopPortfolioAutoplay();
  }

  if (dom.portfolioTrack && !dom.portfolioMemoryGrid) {
    dom.portfolioTrack.innerHTML = portfolio
      .map(
        (item, index) => `
          <article class="portfolio-slide" data-portfolio-index="${index}">
            <div class="portfolio-slide-top">
              <span class="portfolio-slide-kicker">${escapeHtml(item.category)}</span>
              <span class="portfolio-slide-index">${String(index + 1).padStart(2, '0')}</span>
            </div>
            <div class="portfolio-slide-visual">${escapeHtml(item.icon || '•')}</div>
            <h3 class="portfolio-slide-title">${escapeHtml(item.title)}</h3>
            <p class="portfolio-slide-copy">${escapeHtml(item.short_description || 'Proyecto digital desarrollado por TISNET.')}</p>
            <div class="portfolio-slide-highlights">${buildPortfolioHighlights(item)}</div>
            <div class="portfolio-slide-actions">
              <button class="btn btn-accent" type="button" onclick="openCaseModal('${escapeAttribute(item.slug)}')">Ver</button>
            </div>
          </article>
        `
      )
      .join('');
  }

  if (dom.homeProjectGrid) {
    dom.homeProjectGrid.innerHTML = portfolio
      .slice(0, 3)
      .map(
        (item) => `
          <button class="portfolio-card portfolio-card-button" type="button" onclick="openCaseModal('${escapeAttribute(item.slug)}')">
            <div class="portfolio-bg">${escapeHtml(item.icon || '•')}</div>
            <div class="portfolio-overlay">
              <span class="portfolio-label">${escapeHtml(item.category)}</span>
              <span class="portfolio-name">${escapeHtml(item.title)}</span>
              <span class="portfolio-summary">${escapeHtml(item.short_description || 'Proyecto digital desarrollado por TISNET.')}</span>
            </div>
          </button>
        `
      )
      .join('');
  }

  if (dom.homeProjectWall) {
    renderHomeProjectWall(portfolio);
  }

  if (dom.portfolioProgress && !dom.portfolioMemoryGrid) {
    dom.portfolioProgress.innerHTML = portfolio
      .map(
        (_, index) => `
          <button
            class="portfolio-dot ${index === 0 ? 'active' : ''}"
            type="button"
            aria-label="Ir al proyecto ${index + 1}"
            onclick="scrollPortfolioTo(${index})"
          ></button>
        `
      )
      .join('');

    window.requestAnimationFrame(syncPortfolioProgress);
    if (getActiveViewId() === 'portfolio-view') {
      startPortfolioAutoplay();
    } else {
      stopPortfolioAutoplay();
    }
  }

  if (dom.portfolioGrid) {
    dom.portfolioGrid.innerHTML = portfolio
      .map(
        (item) => `
          <button class="portfolio-card portfolio-card-button" type="button" onclick="openCaseModal('${escapeAttribute(item.slug)}')">
            <div class="portfolio-bg">${escapeHtml(item.icon || '•')}</div>
            <div class="portfolio-overlay">
              <span class="portfolio-label">${escapeHtml(item.category)}</span>
              <span class="portfolio-name">${escapeHtml(item.title)}</span>
              <span class="portfolio-summary">${escapeHtml(item.short_description)}</span>
            </div>
          </button>
        `
      )
      .join('');
  }

  if (dom.clientLogos) {
    const chips = [...clients, ...clients]
      .map(
        (client) => `
          <button class="logo-chip logo-chip-button" type="button" onclick="openClientCase('${escapeAttribute(client.portfolio_slug || '')}')">
            ${escapeHtml(client.name)}
          </button>
        `
      )
      .join('');
    dom.clientLogos.innerHTML = chips;
  }
}

function renderTeamExperts() {
  if (!dom.teamExpertsGrid) {
    return;
  }

  dom.teamExpertsGrid.innerHTML = TEAM_EXPERTS.map(
    (expert) => `
      <article
        class="expert-card"
        style="--expert-surface-start:${escapeAttribute(expert.surfaceStart)}; --expert-surface-end:${escapeAttribute(expert.surfaceEnd)}; --expert-glow:${escapeAttribute(expert.glow)};"
      >
        <div class="expert-visual">
          <span class="expert-badge">${escapeHtml(expert.role)}</span>
          <div class="expert-portrait-shell ${expert.image ? 'has-photo' : ''}" aria-hidden="true">
            <div class="expert-portrait ${expert.image ? 'has-photo' : ''}">
              ${expert.image
        ? `
                    <img
                      class="expert-photo"
                      src="${escapeAttribute(expert.image)}"
                      alt="Foto de ${escapeAttribute(expert.name)}"
                      loading="eager"
                    >
                    <div class="expert-photo-overlay"></div>
                  `
        : `<span>${escapeHtml(expert.monogram || initials(expert.name))}</span>`
      }
            </div>
          </div>
        </div>
        <div class="expert-body">
          <h3 class="expert-name">${escapeHtml(expert.name)}</h3>
          <p class="expert-role">${escapeHtml(expert.role)}</p>
          <p class="expert-copy">${escapeHtml(expert.bio)}</p>
          <div class="expert-focus-list">
            ${expert.focus
        .map(
          (item) => `
                  <span class="expert-focus-chip">${escapeHtml(item)}</span>
                `
        )
        .join('')}
          </div>
        </div>
      </article>
    `
  ).join('');
}

function buildPortfolioHighlights(item) {
  return [item.highlight_1, item.highlight_2, item.highlight_3]
    .filter(Boolean)
    .map((highlight) => `<span class="portfolio-highlight">${escapeHtml(highlight)}</span>`)
    .join('');
}

function buildCaseMetrics(item) {
  const metrics = [
    { label: 'Categoria', value: item.category || 'Proyecto digital' },
    { label: 'Foco', value: item.highlight_1 || 'Conversion' },
    { label: 'Sistema', value: item.highlight_2 || 'Experiencia web' },
    { label: 'Entrega', value: item.highlight_3 || 'Escalable' },
  ];

  return metrics
    .map(
      (metric) => `
        <article class="case-metric-card">
          <span class="case-metric-label">${escapeHtml(metric.label)}</span>
          <strong class="case-metric-value">${escapeHtml(metric.value)}</strong>
        </article>
      `
    )
    .join('');
}

function casePalette(category = '') {
  const key = String(category || '').toLowerCase();
  if (key.includes('branding')) {
    return { tone: 'warm', icon: '✦' };
  }
  if (key.includes('automat')) {
    return { tone: 'violet', icon: '⚡' };
  }
  if (key.includes('crm') || key.includes('saas')) {
    return { tone: 'emerald', icon: '▣' };
  }
  return { tone: 'cyan', icon: '◉' };
}

function buildCaseMockups(item) {
  const bullets = [item.highlight_1, item.highlight_2, item.highlight_3].filter(Boolean);
  const palette = casePalette(item.category);
  const shortCopy = item.short_description || 'Proyecto digital creado por TISNET.';
  const mockups = [
    {
      skin: 'browser',
      motion: 'is-up',
      eyebrow: 'Vista principal',
      title: item.title,
      copy: shortCopy,
    },
    {
      skin: 'phone',
      motion: 'is-down',
      eyebrow: 'Bloque comercial',
      title: bullets[0] || 'Experiencia cuidada',
      copy: bullets[1] || 'Jerarquia visual pensada para captar y convertir.',
    },
    {
      skin: 'panel',
      motion: 'is-side',
      eyebrow: 'Sistema interno',
      title: bullets[2] || item.category || 'Operacion conectada',
      copy: 'Mockup conceptual con visuales, soporte operativo y narrativa comercial alineada.',
    },
  ];

  return mockups
    .map(
      (mockup, index) => `
        <article class="case-mockup-card ${mockup.motion} tone-${escapeAttribute(palette.tone)} skin-${escapeAttribute(mockup.skin)}" style="--mockup-delay:${index * 0.18}s">
          <div class="case-mockup-top">
            <span class="case-mockup-dot"></span>
            <span class="case-mockup-dot"></span>
            <span class="case-mockup-dot"></span>
          </div>
          <div class="case-mockup-body">
            <span class="case-mockup-kicker">${escapeHtml(mockup.eyebrow)}</span>
            <strong class="case-mockup-title">${escapeHtml(mockup.title)}</strong>
            <p class="case-mockup-copy">${escapeHtml(mockup.copy)}</p>
            <div class="case-mockup-tags">
              ${bullets
          .slice(0, 3)
          .map(
            (bullet, bulletIndex) => `
                    <span class="case-mockup-tag ${bulletIndex === 0 ? 'is-solid' : ''}">
                      ${escapeHtml(bullet)}
                    </span>
                  `
          )
          .join('')}
            </div>
          </div>
          <div class="case-mockup-glow">${escapeHtml(palette.icon)}</div>
        </article>
      `
    )
    .join('');
}

function getPortfolioSlides() {
  return Array.from(dom.portfolioTrack?.querySelectorAll('.portfolio-slide') || []);
}

function scrollPortfolio(direction = 1) {
  if (!dom.portfolioTrack) {
    return;
  }

  const slides = getPortfolioSlides();
  if (!slides.length) {
    return;
  }

  const step = slides[0].getBoundingClientRect().width + 24;
  dom.portfolioTrack.scrollBy({
    left: direction * step,
    behavior: 'smooth',
  });
}

function scrollPortfolioTo(index) {
  const target = getPortfolioSlides()[index];
  if (!target || !dom.portfolioTrack) {
    return;
  }

  dom.portfolioTrack.scrollTo({
    left: target.offsetLeft,
    behavior: 'smooth',
  });
}

function syncPortfolioProgress() {
  if (!dom.portfolioTrack || !dom.portfolioProgress) {
    return;
  }

  const slides = getPortfolioSlides();
  const dots = Array.from(dom.portfolioProgress.querySelectorAll('.portfolio-dot'));

  if (!slides.length || !dots.length) {
    return;
  }

  const trackLeft = dom.portfolioTrack.scrollLeft;
  let activeIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    const distance = Math.abs(slide.offsetLeft - trackLeft);
    if (distance < bestDistance) {
      bestDistance = distance;
      activeIndex = index;
    }
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
  });
}

function stopPortfolioAutoplay() {
  if (state.portfolioAutoScroll) {
    window.clearInterval(state.portfolioAutoScroll);
    state.portfolioAutoScroll = null;
  }
}

function startPortfolioAutoplay() {
  stopPortfolioAutoplay();

  if (!dom.portfolioTrack || getPortfolioSlides().length <= 1) {
    return;
  }

  state.portfolioAutoScroll = window.setInterval(() => {
    const slides = getPortfolioSlides();
    if (!slides.length) {
      return;
    }

    const nearEnd =
      dom.portfolioTrack.scrollLeft + dom.portfolioTrack.clientWidth >= dom.portfolioTrack.scrollWidth - 40;

    if (nearEnd) {
      dom.portfolioTrack.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    scrollPortfolio(1);
  }, 4200);
}

async function loadClientDashboard() {
  try {
    const payload = await api('/api/client/dashboard');
    state.clientDashboard = payload;
    renderClientDashboard();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function loadAdminOverview() {
  try {
    const payload = await api('/api/admin/overview');
    state.adminOverview = payload;
    renderAdminOverview();
  } catch (error) {
    toast(error.message, 'error');
  }
}

function renderClientDashboard() {
  if (!state.clientDashboard) {
    return;
  }

  const data = state.clientDashboard;
  const project = data.project;
  const metrics = data.metrics;
  data.history = data.timeline || data.history || [];
  const editableProfilePhone = extractLocalPhone(data.profile.phone);

  dom.clientTabs.overview.innerHTML = `
    <div class="panel-header">
      <div class="split-header">
        <div>
          <h2 class="panel-title">${escapeHtml(project.title)}</h2>
          <span class="badge ${badgeClassForProject(project.status)}">${project.status === 'completed' ? 'Completado' : 'En progreso'}</span>
        </div>
        <span class="panel-sub">Inicio: ${formatDate(project.start_date)}</span>
      </div>
    </div>

    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-label">Avance general</div>
        <div class="metric-value" style="color:var(--accent)">${project.progress_percent}%</div>
        <div class="metric-sub">${metrics.completedMilestones} de ${metrics.totalMilestones} hitos completados</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Días restantes</div>
        <div class="metric-value" style="color:var(--warning)">${metrics.daysRemaining ?? '-'}</div>
        <div class="metric-sub">Entrega estimada: ${formatDate(project.due_date)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Próxima reunión</div>
        <div class="metric-value metric-value-small" style="color:var(--success)">
          ${metrics.nextMeeting ? formatDateTime(metrics.nextMeeting.scheduled_for) : 'Sin reunión agendada'}
        </div>
        <div class="metric-sub">${metrics.unreadMessages} mensajes sin leer</div>
      </div>
    </div>

    ${renderClientProcessFlow(data.processFlow)}
    <div class="progress-section legacy-milestones hidden">
      <div class="progress-head">
        <h3 style="font-size:1rem;font-weight:700">Hitos del Proyecto</h3>
        <button class="btn btn-ghost" type="button" onclick="setClientTab('schedule')">Agendar revisión</button>
      </div>
      ${data.milestones.map(renderMilestone).join('')}
    </div>

    <div class="messages-section">
      <div class="section-row">
        <h3 style="font-size:1rem;font-weight:700">Mensajes del Equipo</h3>
        <span style="font-size:.75rem;color:var(--accent)">${metrics.unreadMessages} sin leer</span>
      </div>
      ${data.messages.length ? data.messages.map(renderMessage).join('') : renderEmptyState('Todavía no hay mensajes para este proyecto.')}
    </div>
  `;

  dom.clientTabs.schedule.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Agendar Reunión</h2>
      <p class="panel-sub">Usa el embed de Calendly para reservar revisión de avances o cierre del proyecto.</p>
    </div>
    <div class="split-grid">
      <div class="wizard-card">
        <div class="wizard-title">Tipos de reunión</div>
        <div class="wizard-sub">Cada botón abre el calendario correspondiente desde la configuración del sistema.</div>
        <div class="action-column">
          <button class="btn btn-primary" type="button" onclick="openScheduleModal('client-kickoff')">Kickoff inicial</button>
          <button class="btn btn-outline" type="button" onclick="openScheduleModal('client-proposal')">Revision de propuesta</button>
          <button class="btn btn-primary" type="button" onclick="openScheduleModal('client-review')">Revisión de avances</button>
          <button class="btn btn-outline" type="button" onclick="openScheduleModal('client-close')">Reunión de cierre</button>
        </div>
      </div>
      <div class="table-card">
        <div class="section-row">
          <h3 class="table-title">Próximas reuniones</h3>
          <button class="btn btn-ghost" type="button" onclick="openScheduleModal('client-review')">Nueva reserva</button>
        </div>
        ${renderMeetingsList(data.meetings)}
      </div>
    </div>
  `;

  dom.clientTabs.history.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Historial</h2>
      <p class="panel-sub">Registro cronológico del proyecto y acciones relevantes.</p>
    </div>
    <div class="table-card">
      ${data.history.length ? data.history.map(renderHistoryRow).join('') : renderEmptyState('Todavía no hay actividad registrada.')}
    </div>
  `;

  dom.clientTabs.settings.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Configuración</h2>
      <p class="panel-sub">Actualiza tu cuenta y mantenemos el panel alineado con tus datos reales.</p>
    </div>
    <form class="wizard-card settings-form" id="client-settings-form">
      <div class="newsletter-grid">
        <div class="form-group">
          <label class="form-label" for="client-settings-name">Nombre completo</label>
          <input class="form-input" id="client-settings-name" name="full_name" type="text" value="${escapeAttribute(data.profile.full_name)}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="client-settings-email">Email</label>
          <input class="form-input" id="client-settings-email" name="email" type="email" value="${escapeAttribute(data.profile.email)}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="client-settings-company">Empresa</label>
          <input class="form-input" id="client-settings-company" name="company" type="text" value="${escapeAttribute(data.profile.company || '')}">
        </div>
        <div class="form-group">
          <label class="form-label" for="client-settings-website">Red social (opcional)</label>
          <input class="form-input" id="client-settings-website" name="website" type="text" placeholder="@tu_marca o https://tiktok.com/@tu_marca" value="${escapeAttribute(data.profile.website || '')}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="client-settings-phone">Telefono (obligatorio)</label>
        <input class="form-input" id="client-settings-phone" name="phone" type="text" inputmode="numeric" maxlength="9" pattern="[0-9]{9}" placeholder="987654321" value="${escapeAttribute(editableProfilePhone)}" required>
      </div>
      <div class="action-row">
        <button class="btn btn-primary" type="submit">Guardar cambios</button>
      </div>
      <p class="inline-note" id="client-settings-feedback">Tu panel se actualiza con esta informacion. El telefono debe tener 9 digitos.</p>
    </form>
  `;

  const clientSettingsWebsiteLabel = dom.clientTabs.settings.querySelector('label[for="client-settings-website"]');
  if (clientSettingsWebsiteLabel) {
    clientSettingsWebsiteLabel.textContent = 'Red social (opcional)';
  }

  const clientSettingsPhoneLabel = dom.clientTabs.settings.querySelector('label[for="client-settings-phone"]');
  if (clientSettingsPhoneLabel) {
    clientSettingsPhoneLabel.textContent = 'Telefono (obligatorio)';
  }

  const clientSettingsFeedback = dom.clientTabs.settings.querySelector('#client-settings-feedback');
  if (clientSettingsFeedback) {
    clientSettingsFeedback.textContent = 'Tu panel se actualiza con esta informacion. El telefono debe tener 9 digitos.';
  }

  dom.clientTabs.wizard.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Diagnostico</h2>
      <p class="panel-sub">Completa o actualiza el formulario para alimentar el backend del proyecto.</p>
    </div>
    <div class="split-grid">
      <div class="wizard-card">
        <div class="wizard-title">Estado actual</div>
        <div class="wizard-sub">
          ${data.diagnostic ? 'Ya tenemos un diagnóstico guardado y puedes editarlo cuando quieras.' : 'Aún no has completado el diagnóstico del proyecto.'}
        </div>
        <button class="btn btn-accent" type="button" onclick="showView('wizard-view')">${data.diagnostic ? 'Editar diagnóstico' : 'Completar diagnóstico'}</button>
      </div>
      <div class="table-card">
        <div class="section-row">
          <h3 class="table-title">Resumen</h3>
        </div>
        ${data.diagnostic
      ? `
              <div class="summary-block">
                <strong>Etapa:</strong> ${escapeHtml(capitalize(data.diagnostic.business_stage))}
              </div>
              <div class="summary-block">
                <strong>Negocio:</strong> ${escapeHtml(data.diagnostic.business_summary)}
              </div>
              <div class="summary-block">
                <strong>Necesidad principal:</strong> ${escapeHtml(data.diagnostic.primary_need || 'Sin detalle')}
              </div>
              <div class="summary-block">
                <strong>Objetivo:</strong> ${escapeHtml(data.diagnostic.goal || 'Sin detalle')}
              </div>
            `
      : renderEmptyState('Cuando guardes el diagnóstico se mostrará aquí.')
    }
      </div>
    </div>
  `;

  dom.clientTabs.wizard.insertAdjacentHTML('beforeend', renderClientEvaluationPanel(data));

  const clientWizardTitle = dom.clientTabs.wizard.querySelector('.panel-title');
  if (clientWizardTitle) {
    clientWizardTitle.textContent = 'Diagnostico';
  }
  syncDiagnosticFormFromDashboard();
}

function renderAdminOverview() {
  if (!state.adminOverview) {
    return;
  }

  const data = state.adminOverview;
  const metrics = data.metrics;
  const clients = data.clients || [];
  const teamMembers = data.teamMembers || [];
  const taskMetrics = data.taskMetrics || { summary: {}, team: [], topMember: null };
  const feedbackRequests = data.feedbackRequests || [];
  const projectDocuments = data.projectDocuments || [];
  const isAdminPanel = isAdminRole(state.session?.role);

  dom.adminTabs.dashboard.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Dashboard</h2>
      <p class="panel-sub">Resumen general de operación comercial, proyectos y agenda.</p>
    </div>

    <div class="admin-metrics">
      <div class="admin-metric m-blue">
        <div class="am-label">Leads nuevos <span class="am-icon">🎯</span></div>
        <div class="am-value">${metrics.newLeads}</div>
        <div class="am-delta">Pipeline listo para seguimiento</div>
      </div>
      <div class="admin-metric m-cyan">
        <div class="am-label">Clientes activos <span class="am-icon">👥</span></div>
        <div class="am-value">${metrics.activeClients}</div>
        <div class="am-delta">Con proyectos en ejecución</div>
      </div>
      <div class="admin-metric m-green">
        <div class="am-label">Proyectos en curso <span class="am-icon">🗂</span></div>
        <div class="am-value">${metrics.activeProjects}</div>
        <div class="am-delta">Vista operativa centralizada</div>
      </div>
      <div class="admin-metric m-yellow">
        <div class="am-label">Ingresos mes <span class="am-icon">💰</span></div>
        <div class="am-value" style="font-size:1.5rem">${formatCurrency(metrics.monthRevenue)}</div>
        <div class="am-delta">Promedio ticket ${formatCurrency(metrics.avgTicket)}</div>
      </div>
    </div>

    <div class="split-grid admin-insight-grid">
      ${renderAutomationOverviewCard(data.leads, data.meetings)}
      ${renderBusinessOpsCard(data)}
    </div>

    ${renderFeedbackRequestsPanel(feedbackRequests)}

    <div class="chart-area">
      <div class="section-row">
        <h3 style="font-size:.95rem;font-weight:700">Tendencia de leads e ingresos</h3>
        <div class="chart-legend">
          <div class="legend-item"><div class="legend-dot" style="background:var(--accent)"></div>Leads</div>
          <div class="legend-item"><div class="legend-dot" style="background:var(--primary)"></div>Ingresos</div>
        </div>
      </div>
      ${buildTrendChartSvg(data.trends)}
    </div>

    <div class="table-card">
      <div class="section-row">
        <h3 class="table-title">Leads recientes</h3>
        <button class="btn btn-ghost" type="button" onclick="setAdminTab('crm')">Ver CRM</button>
      </div>
      ${renderRecentLeadsTable(data.recentLeads)}
    </div>
  `;

  dom.adminTabs.crm.innerHTML = `
    <div class="panel-header">
      <div class="split-header">
        <div>
          <h2 class="panel-title">CRM - Pipeline de Ventas</h2>
          <p class="panel-sub">Puedes crear leads, mover tarjetas y convertir oportunidades reales en proyectos usando la cotización y el contexto capturado.</p>
        </div>
      </div>
    </div>

    ${renderLeadAutomationPanel(data.leads)}

    <form class="wizard-card mini-form" id="admin-lead-form">
      <div class="newsletter-grid">
        <div class="form-group">
          <label class="form-label" for="admin-lead-name">Nombre</label>
          <input class="form-input" id="admin-lead-name" name="full_name" type="text" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-lead-email">Email</label>
          <input class="form-input" id="admin-lead-email" name="email" type="email" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-lead-company">Empresa</label>
          <input class="form-input" id="admin-lead-company" name="company" type="text">
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-lead-service">Servicio</label>
          <select class="form-input form-select" id="admin-lead-service" name="service_type">
            ${data.serviceOptions.map((option) => `<option value="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="admin-lead-message">Mensaje</label>
        <textarea class="textarea-input" id="admin-lead-message" name="message" placeholder="Contexto rápido del lead"></textarea>
      </div>
      <div class="action-row">
        <button class="btn btn-primary" type="submit">+ Nuevo lead</button>
      </div>
      <p class="inline-note" id="admin-lead-feedback">Se guardará en MySQL y aparecerá inmediatamente en el tablero.</p>
    </form>

    ${renderLeadBoard(data.leads)}
  `;

  dom.adminTabs.projects.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Gestión de Proyectos</h2>
      <p class="panel-sub">Crea nuevos proyectos y mueve tarjetas según la etapa interna.</p>
    </div>

    <form class="wizard-card mini-form" id="admin-project-form">
      <div class="newsletter-grid">
        <div class="form-group">
          <label class="form-label" for="admin-project-client">Cliente</label>
          <select class="form-input form-select" id="admin-project-client" name="client_user_id">
            ${clients.map((client) => `<option value="${client.id}">${escapeHtml(client.company || client.full_name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-project-title">Proyecto</label>
          <input class="form-input" id="admin-project-title" name="title" type="text" placeholder="Nombre del proyecto" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-project-service">Servicio</label>
          <select class="form-input form-select" id="admin-project-service" name="service_type">
            ${data.serviceOptions.map((option) => `<option value="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-project-budget">Presupuesto</label>
          <input class="form-input" id="admin-project-budget" name="budget" type="number" min="0" step="0.01" placeholder="0">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="admin-project-summary">Resumen</label>
        <textarea class="textarea-input" id="admin-project-summary" name="summary" placeholder="Breve descripción del alcance"></textarea>
      </div>
      <div class="action-row">
        <button class="btn btn-primary" type="submit">+ Nuevo proyecto</button>
      </div>
      <p class="inline-note" id="admin-project-feedback">Se crea con hitos base y queda visible para el cliente asociado.</p>
    </form>

    ${renderProjectBoard(data.projects)}

    ${renderProjectDocumentAdminPanel(data.projects, projectDocuments)}

    <div class="section-row" style="margin-top:28px">
      <div>
        <h3 class="table-title">Asignacion de tareas</h3>
        <p class="panel-sub">HU11: asigna responsable, define estado y manten cada tarea visible dentro del tablero.</p>
      </div>
    </div>

    ${renderTaskOpsSummary(taskMetrics)}

    <form class="wizard-card mini-form" id="admin-task-form">
      <div class="newsletter-grid">
        <div class="form-group">
          <label class="form-label" for="admin-task-project">Proyecto</label>
          <select class="form-input form-select" id="admin-task-project" name="project_id">
            ${data.projects.map((project) => `<option value="${project.id}">${escapeHtml(project.title)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-task-assignee">Responsable</label>
          <select class="form-input form-select" id="admin-task-assignee" name="assignee_id">
            <option value="">Sin responsable</option>
            ${teamMembers.map((member) => `<option value="${member.id}">${escapeHtml(member.full_name)} · ${escapeHtml(member.role_title)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-task-title">Tarea</label>
          <input class="form-input" id="admin-task-title" name="title" type="text" placeholder="Ejemplo: Validar checkout mobile" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-task-status">Estado</label>
          <select class="form-input form-select" id="admin-task-status" name="status">
            <option value="pending">Pendiente</option>
            <option value="in_progress">En proceso</option>
            <option value="done">Terminada</option>
          </select>
        </div>
      </div>
      <div class="newsletter-grid">
        <div class="form-group">
          <label class="form-label" for="admin-task-priority">Prioridad</label>
          <select class="form-input form-select" id="admin-task-priority" name="priority">
            <option value="high">Alta</option>
            <option value="medium" selected>Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-task-due-date">Fecha objetivo</label>
          <input class="form-input" id="admin-task-due-date" name="due_date" type="date">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="admin-task-description">Descripcion</label>
        <textarea class="textarea-input" id="admin-task-description" name="description" placeholder="Que debe hacerse, entregable y contexto rapido"></textarea>
      </div>
      <div class="action-row">
        <button class="btn btn-primary" type="submit">+ Crear tarea</button>
      </div>
      <p class="inline-note" id="admin-task-feedback">Cada tarea queda asignada, visible en el tablero y lista para seguimiento.</p>
    </form>

    ${renderTaskBoard(data.tasks)}
  `;

  if (!isAdminPanel) {
    dom.adminTabs.projects.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Gestión de Proyectos</h2>
        <p class="panel-sub">Este módulo queda reservado para administración. Desde ventas puedes convertir leads a proyecto directamente en el CRM.</p>
      </div>
      <div class="table-card">
        <div class="section-row">
          <h3 class="table-title">Vista de proyectos</h3>
          <span class="panel-sub">Solo lectura para el perfil comercial.</span>
        </div>
        ${renderProjectBoard(data.projects)}
      </div>
    `;
  }

  dom.adminTabs.clients.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Clientes</h2>
      <p class="panel-sub">Base de clientes conectada a proyectos, presupuesto total y última actividad.</p>
    </div>
    <div class="table-card">
      ${renderClientsOverview(data.clients)}
      ${renderClientsTable(data.clients)}
    </div>
  `;

  dom.adminTabs.calendar.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Calendario</h2>
      <p class="panel-sub">Reuniones capturadas desde Calendly y asociadas a leads o proyectos.</p>
    </div>
    <div class="table-card">
      ${renderMeetingsTable(data.meetings)}
    </div>
  `;

  dom.adminTabs.reports.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Reportes</h2>
      <p class="panel-sub">Métricas derivadas de la operación real cargada en la base.</p>
    </div>
    <div class="admin-metrics">
      <div class="admin-metric m-blue">
        <div class="am-label">Conversión leads</div>
        <div class="am-value">${metrics.conversionRate}%</div>
        <div class="am-delta">Leads ganados sobre el total</div>
      </div>
      <div class="admin-metric m-green">
        <div class="am-label">Ticket promedio</div>
        <div class="am-value" style="font-size:1.5rem">${formatCurrency(metrics.avgTicket)}</div>
        <div class="am-delta">Promedio de presupuesto</div>
      </div>
      <div class="admin-metric m-cyan">
        <div class="am-label">Referencia NPS</div>
        <div class="am-value">${metrics.npsReference}</div>
        <div class="am-delta">Calculado desde proyectos cerrados</div>
      </div>
      <div class="admin-metric m-yellow">
        <div class="am-label">Clientes activos</div>
        <div class="am-value">${metrics.activeClients}</div>
        <div class="am-delta">Con trabajo en progreso</div>
      </div>
    </div>
    <div class="chart-area">
      <div class="section-row">
        <h3 style="font-size:.95rem;font-weight:700">Resumen del semestre</h3>
      </div>
      ${buildTrendChartSvg(data.trends)}
    </div>

    <div class="section-row">
      <div>
        <h3 class="table-title">Metricas de rendimiento</h3>
        <p class="panel-sub">HU13: seguimiento simple de tareas completadas y actividad por usuario.</p>
      </div>
    </div>

    ${renderTaskOpsSummary(taskMetrics)}

    <div class="table-card">
      <div class="section-row">
        <h3 class="table-title">Actividad por usuario</h3>
        <span class="panel-sub">Asignaciones, avance y ultima actividad registrada.</span>
      </div>
      ${renderTeamPerformanceList(taskMetrics)}
    </div>
  `;

  dom.adminTabs.settings.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Configuración</h2>
      <p class="panel-sub">Estos datos controlan contacto, URLs de Calendly y contenido público básico.</p>
    </div>
    <div class="split-grid admin-insight-grid">
      <div class="insight-panel">
        <div class="insight-head">
          <div>
            <h3>Identidad y contacto</h3>
            <p>Resumen rapido de la presencia publica que hoy ve el cliente.</p>
          </div>
          <span class="insight-badge neutral">Preview</span>
        </div>
        <div class="insight-list">
          <div class="insight-list-row">
            <strong>Marca</strong>
            <span>${escapeHtml(data.settings.agency_name)}</span>
          </div>
          <div class="insight-list-row">
            <strong>Email publico</strong>
            <span>${escapeHtml(data.settings.contact_email)}</span>
          </div>
          <div class="insight-list-row">
            <strong>WhatsApp</strong>
            <span>${escapeHtml(data.settings.whatsapp_phone || 'No configurado')}</span>
          </div>
        </div>
      </div>
      <div class="insight-panel insight-panel-primary">
        <div class="insight-head">
          <div>
            <h3>Agenda y conversion</h3>
            <p>Controla los puntos que conectan el sitio con ventas.</p>
          </div>
          <span class="insight-badge">Live</span>
        </div>
        <div class="insight-list">
          <div class="insight-list-row">
            <strong>Calendly publico</strong>
            <span>${data.settings.public_calendly_url ? 'Configurado' : 'Pendiente'}</span>
          </div>
          <div class="insight-list-row">
            <strong>Calendly revision</strong>
            <span>${data.settings.client_review_calendly_url ? 'Configurado' : 'Pendiente'}</span>
          </div>
          <div class="insight-list-row">
            <strong>Calendly cierre</strong>
            <span>${data.settings.client_close_calendly_url ? 'Configurado' : 'Pendiente'}</span>
          </div>
        </div>
      </div>
    </div>
    <form class="wizard-card settings-form" id="admin-settings-form">
      <div class="settings-block-title">Marca y canales principales</div>
      <div class="newsletter-grid">
        <div class="form-group">
          <label class="form-label" for="settings-agency-name">Nombre de la agencia</label>
          <input class="form-input" id="settings-agency-name" name="agency_name" type="text" value="${escapeAttribute(data.settings.agency_name)}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="settings-contact-email">Email de contacto</label>
          <input class="form-input" id="settings-contact-email" name="contact_email" type="email" value="${escapeAttribute(data.settings.contact_email)}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="settings-notification-email">Email de notificación</label>
          <input class="form-input" id="settings-notification-email" name="notification_email" type="email" value="${escapeAttribute(data.settings.notification_email)}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="settings-whatsapp">WhatsApp</label>
          <input class="form-input" id="settings-whatsapp" name="whatsapp_phone" type="text" value="${escapeAttribute(data.settings.whatsapp_phone || '')}">
        </div>
      </div>
      <div class="settings-block-title">Calendly y conversion</div>
      <div class="newsletter-grid">
        <div class="form-group">
          <label class="form-label" for="settings-public-calendly">Calendly público</label>
          <input class="form-input" id="settings-public-calendly" name="public_calendly_url" type="url" value="${escapeAttribute(data.settings.public_calendly_url || '')}">
        </div>
        <div class="form-group">
          <label class="form-label" for="settings-review-calendly">Calendly revisión</label>
          <input class="form-input" id="settings-review-calendly" name="client_review_calendly_url" type="url" value="${escapeAttribute(data.settings.client_review_calendly_url || '')}">
        </div>
        <div class="form-group">
          <label class="form-label" for="settings-close-calendly">Calendly cierre</label>
          <input class="form-input" id="settings-close-calendly" name="client_close_calendly_url" type="url" value="${escapeAttribute(data.settings.client_close_calendly_url || '')}">
        </div>
        <div class="form-group">
          <label class="form-label" for="settings-hero-label">Texto CTA hero</label>
          <input class="form-input" id="settings-hero-label" name="hero_cta_label" type="text" value="${escapeAttribute(data.settings.hero_cta_label || '')}">
        </div>
      </div>
      <div class="settings-block-title">Mensajeria del sitio</div>
      <div class="form-group">
        <label class="form-label" for="settings-footer-tagline">Texto de footer</label>
        <textarea class="textarea-input" id="settings-footer-tagline" name="footer_tagline">${escapeHtml(data.settings.footer_tagline || '')}</textarea>
      </div>
      <div class="action-row">
        <button class="btn btn-primary" type="submit">Guardar configuración</button>
      </div>
      <p class="inline-note" id="admin-settings-feedback">Este formulario actualiza la configuración consumida por el frontend y el backend.</p>
    </form>
  `;

  if (!isAdminPanel) {
    dom.adminTabs.settings.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Configuración</h2>
        <p class="panel-sub">Este módulo es exclusivo del perfil administrador.</p>
      </div>
      <div class="table-card">
        ${renderEmptyState('Tu perfil de ventas puede operar el CRM, clientes, calendario y reportes, pero no cambiar la configuración del sistema.')}
      </div>
    `;
  }

  applyAdminRolePresentation();
  setupKanbanDragAndDrop();
}

function renderMilestone(milestone) {
  const done = milestone.status === 'done';
  const statusColor = done ? 'var(--success)' : 'var(--text-muted)';
  return `
    <div class="milestone">
      <div class="milestone-top">
        <span class="milestone-name">${done ? '✓' : milestone.status === 'in_progress' ? '⚙' : '○'} ${escapeHtml(milestone.title)}</span>
        <span class="milestone-pct" style="color:${statusColor}">${milestone.progress_percent}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${done ? 'done' : ''}" style="width:${milestone.progress_percent}%"></div>
      </div>
    </div>
  `;
}

function renderClientProcessFlow(processFlow) {
  const flow = processFlow || { overallProgress: 0, stages: [] };
  const stages = flow.stages || [];
  if (!stages.length) {
    return '';
  }

  return `
    <div class="process-flow-card">
      <div class="progress-head process-flow-head">
        <div>
          <span class="section-label">Ruta funcional TISNET</span>
          <h3>Progreso del proyecto por etapas</h3>
          <p>Los porcentajes cambian cuando el cliente, ventas o administracion realizan acciones reales.</p>
        </div>
        <div class="process-overall">
          <strong>${flow.overallProgress || 0}%</strong>
          <span>avance total</span>
        </div>
      </div>
      <div class="process-stage-grid">
        ${stages.map(renderProcessStage).join('')}
      </div>
    </div>
  `;
}

function renderProcessStage(stage) {
  const actions = stage.actions || [];
  const docs = stage.documents || [];
  const feedbacks = stage.feedbacks || [];
  return `
    <article class="process-stage process-stage-${escapeAttribute(stage.status || 'pending')}">
      <div class="process-stage-top">
        <div>
          <span class="process-stage-kicker">${escapeHtml(stage.title)}</span>
          <strong>${stage.percent || 0}%</strong>
        </div>
        <span class="badge ${stage.status === 'done' ? 'badge-done' : stage.status === 'in_progress' ? 'badge-active' : 'badge-pending'}">
          ${stage.status === 'done' ? 'Completado' : stage.status === 'in_progress' ? 'En proceso' : 'Pendiente'}
        </span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${stage.status === 'done' ? 'done' : ''}" style="width:${stage.percent || 0}%"></div>
      </div>
      <p>${escapeHtml(stage.message || stage.copy || '')}</p>
      ${docs.length ? `<div class="process-doc-list">${docs.map(renderProcessDocumentChip).join('')}</div>` : ''}
      ${feedbacks.length ? `<div class="process-feedback-note">${feedbacks.length} retroalimentacion pendiente en esta etapa.</div>` : ''}
      ${actions.length ? `<div class="process-actions">${actions.map(renderProcessActionButton).join('')}</div>` : ''}
    </article>
  `;
}

function renderProcessDocumentChip(document) {
  const label = document.resource_url ? 'Abrir' : 'Publicado';
  return `
    <button class="process-doc-chip" type="button" onclick="${document.resource_url ? `window.open('${escapeAttribute(document.resource_url)}', '_blank')` : `toast('Documento registrado sin enlace publico.', 'info')`}">
      <span>${escapeHtml(document.title || 'Documento')}</span>
      <small>${escapeHtml(label)}</small>
    </button>
  `;
}

function renderProcessActionButton(action) {
  const styleClass = action.style === 'accent' ? 'btn-accent' : action.style === 'primary' ? 'btn-primary' : 'btn-ghost';
  return `
    <button class="btn ${styleClass}" type="button" onclick="handleClientProcessAction('${escapeAttribute(action.type)}', '${escapeAttribute(action.context || '')}', '${escapeAttribute(action.url || '')}')">
      ${escapeHtml(action.label)}
    </button>
  `;
}

function renderClientEvaluationPanel(data) {
  const diagnosticStage = (data.processFlow?.stages || []).find((stage) => stage.key === 'diagnostic');
  const evaluation = diagnosticStage?.documents?.[0];
  return `
    <div class="table-card client-evaluation-card">
      <div class="section-row">
        <div>
          <h3 class="table-title">Evaluacion del proyecto</h3>
          <p class="panel-sub">Aqui aparecera la lectura del equipo TISNET despues de revisar tu diagnostico.</p>
        </div>
        <span class="badge ${evaluation ? 'badge-active' : 'badge-pending'}">${evaluation ? 'Publicado' : 'Pendiente'}</span>
      </div>
      ${evaluation
      ? `
            <div class="summary-block"><strong>${escapeHtml(evaluation.title)}</strong></div>
            <div class="summary-block">${escapeHtml(evaluation.note || 'Evaluacion publicada para revision.')}</div>
            <div class="action-row">
              ${evaluation.resource_url ? `<button class="btn btn-primary" type="button" onclick="window.open('${escapeAttribute(evaluation.resource_url)}', '_blank')">Ver evaluacion</button>` : ''}
              <button class="btn btn-accent" type="button" onclick="handleClientProcessAction('validate_diagnostic')">Validar</button>
              <button class="btn btn-ghost" type="button" onclick="handleClientProcessAction('feedback_diagnostic')">Retroalimentar</button>
            </div>
          `
      : renderEmptyState('Todavia no hay evaluacion publicada por el equipo.')
    }
    </div>
  `;
}

function renderMessage(message) {
  return `
    <div class="message-item">
      <div class="msg-avatar">${escapeHtml(initials(message.author_name))}</div>
      <div class="msg-body">
        <p><strong>${escapeHtml(message.author_name)}</strong> · ${escapeHtml(message.body)}</p>
        <span>${timeAgo(message.created_at)}</span>
      </div>
      ${message.is_unread_for_client ? '<div class="msg-unread"></div>' : ''}
    </div>
  `;
}

function renderHistoryRow(item) {
  return `
    <div class="history-row">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.detail || '')}</p>
        ${item.url ? `<button class="btn btn-ghost btn-mini" type="button" onclick="window.open('${escapeAttribute(item.url)}', '_blank')">Abrir recurso</button>` : ''}
      </div>
      <span>${formatDate(item.created_at)}</span>
    </div>
  `;
}

function renderMeetingsList(meetings) {
  if (!meetings || !meetings.length) {
    return renderEmptyState('Todavía no hay reuniones registradas.');
  }

  return `
    <div class="list-stack">
      ${meetings
      .map(
        (meeting) => `
            <div class="list-item">
              <div>
                <strong>${escapeHtml(meeting.meeting_type)}</strong>
                <p>${formatDateTime(meeting.scheduled_for)}</p>
              </div>
              <span class="badge badge-active">${escapeHtml(meeting.status)}</span>
            </div>
          `
      )
      .join('')}
    </div>
  `;
}

function renderRecentLeadsTable(leads) {
  if (!leads.length) {
    return renderEmptyState('Aún no hay leads registrados.');
  }

  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Servicio</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${leads
      .map(
        (lead) => `
                <tr>
                  <td>${escapeHtml(lead.full_name)}</td>
                  <td>${escapeHtml(serviceLabel(lead.service_type))}</td>
                  <td><span class="badge ${badgeClassForLead(lead.status)}">${escapeHtml(statusLabel(lead.status))}</span></td>
                  <td>${formatDate(lead.created_at)}</td>
                </tr>
              `
      )
      .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function leadAgeDays(lead) {
  if (!lead?.created_at) {
    return 0;
  }

  const diffMs = Date.now() - new Date(lead.created_at).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function leadPriorityMeta(lead) {
  const age = leadAgeDays(lead);
  let score = 0;

  if (lead.status === 'new') {
    score += 3;
  }
  if (lead.status === 'negotiating') {
    score += 2;
  }
  if (['crm', 'ecommerce'].includes(lead.service_type)) {
    score += 2;
  }
  if (age <= 2) {
    score += 2;
  }
  if ((lead.message || '').trim().length > 60) {
    score += 1;
  }

  if (score >= 6) {
    return { label: 'Alta prioridad', tone: 'high' };
  }
  if (score >= 4) {
    return { label: 'Seguimiento activo', tone: 'medium' };
  }
  return { label: 'Seguimiento normal', tone: 'low' };
}

function leadNextAction(lead) {
  const age = leadAgeDays(lead);

  if (lead.status === 'new') {
    return age >= 1 ? 'Responder hoy y proponer llamada' : 'Contacto inicial en curso';
  }
  if (lead.status === 'contacted') {
    return age >= 3 ? 'Reactivar conversacion y bloquear agenda' : 'Enviar propuesta breve';
  }
  if (lead.status === 'negotiating') {
    return 'Cerrar propuesta, resolver objeciones y pactar inicio';
  }
  return 'Mantener relacion y ofrecer siguiente fase';
}

function buildLeadMailto(lead) {
  const subject = encodeURIComponent(`Seguimiento TISNET - ${lead.full_name}`);
  const body = encodeURIComponent(
    `Hola ${lead.full_name},\n\nGracias por escribirnos. Queremos ayudarte con ${serviceLabel(lead.service_type).toLowerCase()}.\n\nQuedamos atentos para coordinar el siguiente paso.\n\nEquipo TISNET`
  );
  return `mailto:${encodeURIComponent(lead.email)}?subject=${subject}&body=${body}`;
}

function summarizeLeadAutomation(leads) {
  const list = leads || [];
  return {
    hot: list.filter((lead) => lead.status === 'new' && leadAgeDays(lead) <= 2).length,
    followups: list.filter((lead) => ['new', 'contacted', 'negotiating'].includes(lead.status) && leadAgeDays(lead) >= 2).length,
    closing: list.filter((lead) => lead.status === 'negotiating').length,
    won: list.filter((lead) => lead.status === 'won').length,
  };
}

function mostRequestedService(leads) {
  const counts = {};
  (leads || []).forEach((lead) => {
    counts[lead.service_type] = (counts[lead.service_type] || 0) + 1;
  });

  const [service] = Object.entries(counts).sort((left, right) => right[1] - left[1])[0] || [];
  return service ? serviceLabel(service) : 'Sin datos';
}

function renderAutomationOverviewCard(leads, meetings) {
  const summary = summarizeLeadAutomation(leads);
  const nextMeeting = (meetings || []).find((meeting) => meeting.scheduled_for);

  return `
    <div class="insight-panel insight-panel-primary">
      <div class="insight-head">
        <div>
          <h3>Motor comercial</h3>
          <p>Vista rapida de los leads que necesitan accion inmediata.</p>
        </div>
        <span class="insight-badge">CRM activo</span>
      </div>
      <div class="automation-chip-grid">
        <div class="automation-chip">
          <strong>${summary.hot}</strong>
          <span>leads calientes</span>
        </div>
        <div class="automation-chip">
          <strong>${summary.followups}</strong>
          <span>seguimientos pendientes</span>
        </div>
        <div class="automation-chip">
          <strong>${summary.closing}</strong>
          <span>cierres en negociacion</span>
        </div>
        <div class="automation-chip">
          <strong>${summary.won}</strong>
          <span>oportunidades ganadas</span>
        </div>
      </div>
      <div class="insight-inline-note">
        ${nextMeeting ? `Proxima reunion: ${escapeHtml(nextMeeting.meeting_type)} ${formatDateTime(nextMeeting.scheduled_for)}` : 'Todavia no hay reuniones capturadas para mostrar aqui.'}
      </div>
    </div>
  `;
}

function renderBusinessOpsCard(data) {
  return `
    <div class="insight-panel">
      <div class="insight-head">
        <div>
          <h3>Operacion y crecimiento</h3>
          <p>Indicadores utiles para decidir que impulsar esta semana.</p>
        </div>
        <span class="insight-badge neutral">Focus</span>
      </div>
      <div class="insight-list">
        <div class="insight-list-row">
          <strong>Servicio mas pedido</strong>
          <span>${escapeHtml(mostRequestedService(data.leads))}</span>
        </div>
        <div class="insight-list-row">
          <strong>Clientes con proyectos</strong>
          <span>${data.clients.length}</span>
        </div>
        <div class="insight-list-row">
          <strong>Proyectos activos</strong>
          <span>${data.projects.length}</span>
        </div>
        <div class="insight-list-row">
          <strong>Agenda sincronizada</strong>
          <span>${data.meetings.length} reuniones</span>
        </div>
      </div>
    </div>
  `;
}

function renderFeedbackRequestsPanel(requests) {
  const list = requests || [];
  const pending = list.filter((item) => item.status !== 'resolved');
  return `
    <div class="table-card feedback-ops-panel">
      <div class="section-row">
        <div>
          <h3 class="table-title">Retroalimentacion y reuniones pendientes</h3>
          <p class="panel-sub">Ventas y administracion ven aqui los bloqueos que el cliente envia desde diagnostico, propuesta o avances.</p>
        </div>
        <span class="badge ${pending.length ? 'badge-active' : 'badge-done'}">${pending.length} pendiente${pending.length === 1 ? '' : 's'}</span>
      </div>
      ${list.length
      ? `<div class="feedback-request-list">${list.slice(0, 6).map(renderFeedbackRequestRow).join('')}</div>`
      : renderEmptyState('No hay solicitudes de retroalimentacion por ahora.')
    }
    </div>
  `;
}

function renderFeedbackRequestRow(request) {
  return `
    <article class="feedback-request-row">
      <div>
        <strong>${escapeHtml(request.client_company || request.client_name || 'Cliente')}</strong>
        <p>${escapeHtml(processStageLabel(request.stage_key))} - ${escapeHtml(request.message || '')}</p>
        <span>${escapeHtml(request.project_title || 'Proyecto')} - ${formatDateTime(request.created_at)}</span>
      </div>
      <div class="feedback-request-actions">
        <span class="badge ${request.status === 'resolved' ? 'badge-done' : request.status === 'in_review' ? 'badge-active' : 'badge-pending'}">${escapeHtml(feedbackStatusLabel(request.status))}</span>
        ${request.status !== 'in_review' ? `<button class="btn btn-ghost" type="button" onclick="updateFeedbackRequestStatus(${request.id}, 'in_review')">Revisar</button>` : ''}
        ${request.status !== 'resolved' ? `<button class="btn btn-primary" type="button" onclick="updateFeedbackRequestStatus(${request.id}, 'resolved')">Resolver</button>` : ''}
      </div>
    </article>
  `;
}

function renderProjectDocumentAdminPanel(projects, documents) {
  return `
    <div class="section-row" style="margin-top:28px">
      <div>
        <h3 class="table-title">Documentos, propuestas y avances</h3>
        <p class="panel-sub">Publica evaluaciones, propuestas tecnicas comerciales, avances o entregables visibles en el historial del cliente.</p>
      </div>
    </div>
    <form class="wizard-card mini-form" id="admin-document-form">
      <div class="newsletter-grid">
        <div class="form-group">
          <label class="form-label" for="admin-document-project">Proyecto</label>
          <select class="form-input form-select" id="admin-document-project" name="project_id">
            ${(projects || []).map((project) => `<option value="${project.id}">${escapeHtml(project.title)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-document-stage">Etapa</label>
          <select class="form-input form-select" id="admin-document-stage" name="stage_key">
            <option value="diagnostic">Diagnostico</option>
            <option value="proposal">Propuesta tecnica comercial</option>
            <option value="execution">Ejecucion del proyecto</option>
            <option value="delivery">Entrega final</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-document-type">Tipo</label>
          <select class="form-input form-select" id="admin-document-type" name="document_type">
            <option value="evaluation">Evaluacion</option>
            <option value="proposal">Propuesta</option>
            <option value="advance">Avance</option>
            <option value="delivery">Entregable final</option>
            <option value="note">Nota</option>
            <option value="link">Link</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-document-title">Titulo</label>
          <input class="form-input" id="admin-document-title" name="title" type="text" placeholder="Ej. Evaluacion inicial del proyecto" required>
        </div>
      </div>
      <div class="newsletter-grid">
        <div class="form-group">
          <label class="form-label" for="admin-document-url">Enlace publico</label>
          <input class="form-input" id="admin-document-url" name="resource_url" type="url" placeholder="https://...">
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-document-file">Nombre de archivo</label>
          <input class="form-input" id="admin-document-file" name="file_name" type="text" placeholder="propuesta.pdf">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="admin-document-note">Nota visible</label>
        <textarea class="textarea-input" id="admin-document-note" name="note" placeholder="Describe que debe revisar o validar el cliente"></textarea>
      </div>
      <label class="checkbox-row">
        <input type="checkbox" name="is_visible_to_client" checked>
        <span>Visible para el cliente en su historial</span>
      </label>
      <div class="action-row">
        <button class="btn btn-primary" type="submit">Publicar documento</button>
      </div>
      <p class="inline-note" id="admin-document-feedback">Acepta enlaces a PDF, Word, PPT, Canva, Drive o notas internas visibles.</p>
    </form>
    <div class="table-card compact-table-card">
      ${(documents || []).length ? (documents || []).slice(0, 8).map(renderAdminDocumentRow).join('') : renderEmptyState('Todavia no hay documentos publicados.')}
    </div>
  `;
}

function renderAdminDocumentRow(document) {
  return `
    <div class="history-row">
      <div>
        <strong>${escapeHtml(document.title)}</strong>
        <p>${escapeHtml(processStageLabel(document.stage_key))} - ${escapeHtml(document.project_title || 'Proyecto')}</p>
      </div>
      <span>${formatDate(document.created_at)}</span>
    </div>
  `;
}

function renderLeadAutomationPanel(leads) {
  const summary = summarizeLeadAutomation(leads);

  return `
    <div class="split-grid admin-insight-grid">
      <div class="insight-panel insight-panel-primary">
        <div class="insight-head">
          <div>
            <h3>Seguimiento recomendado</h3>
            <p>Priorizamos lo que deberia atenderse primero en tu pipeline.</p>
          </div>
          <span class="insight-badge">Prioridades</span>
        </div>
        <div class="automation-chip-grid">
          <div class="automation-chip">
            <strong>${summary.hot}</strong>
            <span>responder hoy</span>
          </div>
          <div class="automation-chip">
            <strong>${summary.followups}</strong>
            <span>reactivar este dia</span>
          </div>
          <div class="automation-chip">
            <strong>${summary.closing}</strong>
            <span>cierres por empujar</span>
          </div>
          <div class="automation-chip">
            <strong>${summary.won}</strong>
            <span>clientes listos</span>
          </div>
        </div>
      </div>
      <div class="insight-panel">
        <div class="insight-head">
          <div>
            <h3>Flujo automatizado sugerido</h3>
            <p>Base practica para tus leads desde el sitio hasta la llamada.</p>
          </div>
          <span class="insight-badge neutral">Workflow</span>
        </div>
        <div class="automation-steps">
          <div class="automation-step">1. Formulario o calculadora registra el lead en MySQL.</div>
          <div class="automation-step">2. Se habilita el pase directo a Calendly y WhatsApp.</div>
          <div class="automation-step">3. El admin prioriza por urgencia, servicio y antiguedad.</div>
          <div class="automation-step">4. El cierre se mueve al dashboard y al historial del cliente.</div>
        </div>
      </div>
    </div>
  `;
}

function renderClientsOverview(clients) {
  if (!clients.length) {
    return renderEmptyState('Aun no hay clientes con proyectos activos.');
  }

  return `
    <div class="client-cards-grid">
      ${clients
      .slice(0, 6)
      .map(
        (client) => `
            <article class="client-overview-card">
              <div class="client-overview-top">
                <div>
                  <h3>${escapeHtml(client.company || client.full_name)}</h3>
                  <p>${escapeHtml(client.email)}</p>
                </div>
                <span class="client-overview-badge">${client.project_count} proyecto${client.project_count === 1 ? '' : 's'}</span>
              </div>
              <div class="client-overview-metrics">
                <div>
                  <strong>${formatCurrency(client.total_budget)}</strong>
                  <span>inversion acumulada</span>
                </div>
                <div>
                  <strong>${client.last_update ? formatDate(client.last_update) : 'Sin actividad'}</strong>
                  <span>ultima actividad</span>
                </div>
              </div>
              <div class="client-overview-actions">
                <button class="btn btn-primary" type="button" onclick="openAdminClientDetail(${client.id})">Ver detalle</button>
                <button class="btn btn-ghost" type="button" onclick="window.open('mailto:${escapeAttribute(client.email)}', '_blank')">Email</button>
                ${client.website ? `<button class="btn btn-ghost" type="button" onclick="window.open('${escapeAttribute(client.website)}', '_blank')">Red social</button>` : ''}
              </div>
            </article>
          `
      )
      .join('')}
    </div>
  `;
}

function renderLeadBoard(leads) {
  const columns = [
    { key: 'new', title: '🟡 Nuevo' },
    { key: 'contacted', title: '🔵 Contactado' },
    { key: 'negotiating', title: '🟠 Negociación' },
    { key: 'won', title: '🟢 Ganado' },
  ];

  return `
    <div class="kanban-board">
      ${columns
      .map((column) => {
        const items = leads.filter((lead) => lead.status === column.key);
        return `
            <div class="kanban-col drop-zone" data-board="lead" data-status="${column.key}">
              <div class="kanban-col-header">
                <span class="kanban-col-title">${column.title}</span>
                <span class="kanban-count">${items.length}</span>
              </div>
              ${items.length
            ? items.map((lead) => renderLeadCard(lead)).join('')
            : '<div class="empty-zone">Suelta un lead aquí</div>'
          }
            </div>
          `;
      })
      .join('')}
    </div>
  `;
}

function renderLeadCard(lead) {
  const priority = leadPriorityMeta(lead);
  const nextAction = leadNextAction(lead);
  const mailto = buildLeadMailto(lead);
  const canConvert = isOperatorRole(state.session?.role) && !lead.project_id && lead.status !== 'new';
  const hasQuote = Number(lead.quote_total || 0) > 0;

  return `
    <div class="kanban-card" draggable="true" data-drag-type="lead" data-id="${lead.id}" data-current-status="${lead.status}">
      <div class="kc-top">
        <div class="kc-name">${escapeHtml(lead.full_name)}</div>
        <span class="lead-priority lead-priority-${priority.tone}">${escapeHtml(priority.label)}</span>
      </div>
      <div class="kc-service">${escapeHtml(serviceLabel(lead.service_type))} · ${escapeHtml(lead.company || 'Sin empresa')}</div>
      <div class="kc-email">${escapeHtml(lead.email)}</div>
      <div class="kc-message">${escapeHtml((lead.message || 'Sin contexto registrado.').slice(0, 120))}</div>
      ${hasQuote
      ? `<div class="kc-next"><strong>Cotización lista:</strong> ${escapeHtml(lead.quote_label || 'Cotización web')} · ${formatCurrency(lead.quote_total)}</div>`
      : ''
    }
      <div class="kc-next"><strong>Siguiente paso:</strong> ${escapeHtml(nextAction)}</div>
      ${lead.project_id
      ? `<div class="kc-next"><strong>Proyecto vinculado:</strong> ${escapeHtml(lead.project_title || 'Proyecto creado')}</div>`
      : ''
    }
      <div class="kc-actions">
        ${canConvert ? `<button class="btn btn-primary" type="button" onclick="convertLeadToProject(${lead.id})">Convertir</button>` : ''}
        <button class="btn btn-ghost" type="button" onclick="window.open('${escapeAttribute(mailto)}', '_blank')">Email</button>
            ${lead.website ? `<button class="btn btn-ghost" type="button" onclick="window.open('${escapeAttribute(lead.website)}', '_blank')">Red social</button>` : ''}
      </div>
      <div class="kc-footer">
        <span class="kc-date">${formatDate(lead.created_at)} Â· ${timeAgo(lead.created_at)}</span>
        <div class="kc-avatar">${escapeHtml(initials(lead.full_name))}</div>
      </div>
    </div>
  `;
}

function renderProjectBoard(projects) {
  const columns = [
    { key: 'backlog', title: '📋 Backlog' },
    { key: 'in_progress', title: '🚧 En curso' },
    { key: 'review', title: '🔍 En revisión' },
    { key: 'delivered', title: '✅ Entregado' },
  ];

  return `
    <div class="kanban-board">
      ${columns
      .map((column) => {
        const items = projects.filter((project) => project.admin_status === column.key);
        return `
            <div class="kanban-col drop-zone" data-board="project" data-status="${column.key}">
              <div class="kanban-col-header">
                <span class="kanban-col-title">${column.title}</span>
                <span class="kanban-count">${items.length}</span>
              </div>
              ${items.length
            ? items.map((project) => renderProjectCard(project)).join('')
            : '<div class="empty-zone">Suelta un proyecto aquí</div>'
          }
            </div>
          `;
      })
      .join('')}
    </div>
  `;
}

function renderProjectCard(project) {
  return `
    <div class="kanban-card" draggable="true" data-drag-type="project" data-id="${project.id}" data-current-status="${project.admin_status}">
      <div class="kc-name">${escapeHtml(project.title)}</div>
      <div class="kc-service">${escapeHtml(project.client_company || project.client_name || 'Cliente sin empresa')} · ${project.progress_percent}%</div>
      <div class="kc-footer">
        <span class="kc-date">${formatDate(project.due_date)}</span>
        <div class="kc-avatar">${escapeHtml(initials(project.client_name || project.title))}</div>
      </div>
    </div>
  `;
}

function renderTaskOpsSummary(taskMetrics) {
  const summary = taskMetrics?.summary || {};
  const topMember = taskMetrics?.topMember;

  return `
    <div class="split-grid admin-insight-grid task-ops-grid">
      <div class="insight-panel">
        <div class="insight-head">
          <div>
            <h3>Resumen operativo</h3>
            <p>Tareas en proceso, cerradas y avance general del equipo.</p>
          </div>
          <span class="insight-badge">HU11 / HU13</span>
        </div>
        <div class="admin-task-metric-grid">
          <div class="admin-task-metric-card">
            <span>Tareas completadas</span>
            <strong>${summary.completedTasks || 0}</strong>
          </div>
          <div class="admin-task-metric-card">
            <span>En proceso</span>
            <strong>${summary.activeTasks || 0}</strong>
          </div>
          <div class="admin-task-metric-card">
            <span>Pendientes</span>
            <strong>${summary.pendingTasks || 0}</strong>
          </div>
          <div class="admin-task-metric-card">
            <span>Equipo activo</span>
            <strong>${summary.activeUsers || 0}</strong>
          </div>
        </div>
      </div>
      <div class="insight-panel insight-panel-primary">
        <div class="insight-head">
          <div>
            <h3>Responsable con mayor actividad</h3>
            <p>Lectura rapida basada en tareas asignadas y avance real.</p>
          </div>
          <span class="insight-badge neutral">${summary.completionRate || 0}% avance total</span>
        </div>
        ${topMember
      ? `
              <div class="task-top-member">
                <div class="task-top-member-avatar" style="background:${escapeAttribute(topMember.accent_color || 'var(--primary)')}">
                  ${escapeHtml(initials(topMember.full_name))}
                </div>
                <div>
                  <strong>${escapeHtml(topMember.full_name)}</strong>
                  <p>${escapeHtml(topMember.role_title || 'Equipo TISNET')}</p>
                </div>
              </div>
              <div class="admin-task-metric-grid compact">
                <div class="admin-task-metric-card">
                  <span>Asignadas</span>
                  <strong>${topMember.total_tasks || 0}</strong>
                </div>
                <div class="admin-task-metric-card">
                  <span>Completadas</span>
                  <strong>${topMember.completed_tasks || 0}</strong>
                </div>
              </div>
              <p class="inline-note">Ultima actividad: ${topMember.last_activity ? timeAgo(topMember.last_activity) : 'sin movimiento reciente'}.</p>
            `
      : '<div class="empty-state">Todavia no hay suficiente actividad para comparar responsables.</div>'
    }
      </div>
    </div>
  `;
}

function renderTaskBoard(tasks) {
  const list = tasks || [];
  const columns = [
    { key: 'pending', title: 'Pendiente' },
    { key: 'in_progress', title: 'En proceso' },
    { key: 'done', title: 'Terminada' },
  ];

  return `
    <div class="kanban-board kanban-board-triple">
      ${columns
      .map((column) => {
        const items = list.filter((task) => task.status === column.key);
        return `
            <div class="kanban-col drop-zone" data-board="task" data-status="${column.key}">
              <div class="kanban-col-header">
                <span class="kanban-col-title">${escapeHtml(column.title)}</span>
                <span class="kanban-count">${items.length}</span>
              </div>
              ${items.length
            ? items.map((task) => renderTaskCard(task)).join('')
            : '<div class="empty-zone">Suelta una tarea aqui</div>'
          }
            </div>
          `;
      })
      .join('')}
    </div>
  `;
}

function renderTaskCard(task) {
  const teamMembers = state.adminOverview?.teamMembers || [];
  const dueLabel = task.due_date ? formatDate(task.due_date) : 'Sin fecha';
  const dueTime = task.due_date ? new Date(task.due_date).getTime() : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = dueTime && dueTime < today.getTime() && task.status !== 'done';

  return `
    <div class="kanban-card task-kanban-card" draggable="true" data-drag-type="task" data-id="${task.id}" data-current-status="${task.status}">
      <div class="kc-top">
        <div class="kc-name">${escapeHtml(task.title)}</div>
        <span class="lead-priority lead-priority-${escapeAttribute(task.priority || 'medium')}">${escapeHtml(taskPriorityLabel(task.priority))}</span>
      </div>
      <div class="kc-service">${escapeHtml(task.project_title || 'Proyecto sin nombre')} · ${escapeHtml(serviceLabel(task.project_service_type || 'consulting'))}</div>
      <div class="kc-message">${escapeHtml((task.description || 'Sin descripcion adicional.').slice(0, 140))}</div>
      <div class="task-card-meta">
        <span class="badge ${badgeClassForTask(task.status)}">${escapeHtml(taskStatusLabel(task.status))}</span>
        <span class="task-due ${isOverdue ? 'danger' : ''}">${escapeHtml(dueLabel)}</span>
      </div>
      <div class="task-field">
        <label class="task-inline-label" for="task-assignee-${task.id}">Responsable</label>
        <select class="form-input form-select task-inline-select" id="task-assignee-${task.id}" onchange="updateAdminTaskAssignee(${task.id}, this.value)">
          <option value="">Sin responsable</option>
          ${teamMembers
      .map(
        (member) => `
                <option value="${member.id}" ${Number(member.id) === Number(task.assignee_id) ? 'selected' : ''}>
                  ${escapeHtml(member.full_name)} · ${escapeHtml(member.role_title)}
                </option>
              `
      )
      .join('')}
        </select>
      </div>
      <div class="task-field">
        <label class="task-inline-label" for="task-status-${task.id}">Estado</label>
        <select class="form-input form-select task-inline-select" id="task-status-${task.id}" onchange="updateAdminTaskStatus(${task.id}, this.value)">
          ${['pending', 'in_progress', 'done']
      .map(
        (status) => `
                <option value="${status}" ${status === task.status ? 'selected' : ''}>${escapeHtml(taskStatusLabel(status))}</option>
              `
      )
      .join('')}
        </select>
      </div>
      <div class="kc-footer">
        <span class="kc-date">${task.updated_at ? timeAgo(task.updated_at) : 'Sin actividad'}</span>
        <div class="kc-avatar" style="${task.assignee_color ? `background:${escapeAttribute(task.assignee_color)};` : ''}">
          ${escapeHtml(initials(task.assignee_name || task.project_title || 'Tarea'))}
        </div>
      </div>
    </div>
  `;
}

function renderTeamPerformanceList(taskMetrics) {
  const members = taskMetrics?.team || [];
  if (!members.length) {
    return renderEmptyState('Todavia no hay responsables o tareas asignadas para medir rendimiento.');
  }

  return `
    <div class="team-performance-list">
      ${members
      .map(
        (member) => `
            <article class="team-performance-card">
              <div class="team-performance-head">
                <div class="team-performance-identity">
                  <div class="team-performance-avatar" style="background:${escapeAttribute(member.accent_color || 'var(--primary)')}">
                    ${escapeHtml(initials(member.full_name))}
                  </div>
                  <div>
                    <strong>${escapeHtml(member.full_name)}</strong>
                    <p>${escapeHtml(member.role_title || 'Equipo TISNET')}</p>
                  </div>
                </div>
                <span class="badge ${badgeClassForTaskPerformance(member)}">${member.completion_rate || 0}% completado</span>
              </div>
              <div class="admin-task-metric-grid compact">
                <div class="admin-task-metric-card">
                  <span>Asignadas</span>
                  <strong>${member.total_tasks || 0}</strong>
                </div>
                <div class="admin-task-metric-card">
                  <span>Hechas</span>
                  <strong>${member.completed_tasks || 0}</strong>
                </div>
                <div class="admin-task-metric-card">
                  <span>Proceso</span>
                  <strong>${member.active_tasks || 0}</strong>
                </div>
                <div class="admin-task-metric-card">
                  <span>Pendientes</span>
                  <strong>${member.pending_tasks || 0}</strong>
                </div>
              </div>
              <div class="performance-bar">
                <span style="width:${Math.max(member.completion_rate || 0, member.total_tasks ? 8 : 0)}%; background:${escapeAttribute(member.accent_color || 'var(--accent)')}"></span>
              </div>
              <p class="inline-note">Ultima actividad: ${member.last_activity ? timeAgo(member.last_activity) : 'sin movimientos todavia'}.</p>
            </article>
          `
      )
      .join('')}
    </div>
  `;
}

function renderClientsTable(clients) {
  if (!clients.length) {
    return renderEmptyState('Aún no hay clientes registrados.');
  }

  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Email</th>
            <th>Proyectos</th>
            <th>Presupuesto</th>
            <th>Última actividad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${clients
      .map(
        (client) => `
                <tr>
                  <td>${escapeHtml(client.company || client.full_name)}</td>
                  <td>${escapeHtml(client.email)}</td>
                  <td>${client.project_count}</td>
                  <td>${formatCurrency(client.total_budget)}</td>
                  <td>${client.last_update ? formatDate(client.last_update) : 'Sin actividad'}</td>
                  <td>
                    <div class="data-table-actions">
                      <button class="btn btn-ghost" type="button" onclick="openAdminClientDetail(${client.id})">Ver detalle</button>
                    </div>
                  </td>
                </tr>
              `
      )
      .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminClientInfoRows(rows) {
  return `
    <div class="admin-client-info-list">
      ${rows
      .map(
        (row) => `
            <div class="admin-client-info-row">
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(row.value || '-')}</strong>
            </div>
          `
      )
      .join('')}
    </div>
  `;
}

function renderAdminClientTimeline(items) {
  if (!items?.length) {
    return renderEmptyState('Todavía no hay interacción registrada para este cliente.');
  }

  return `
    <div class="admin-client-timeline">
      ${items
      .map(
        (item) => `
            <div class="admin-client-timeline-item">
              <div class="admin-client-timeline-dot"></div>
              <div>
                <strong>${escapeHtml(item.title || 'Actividad')}</strong>
                <p>${escapeHtml(item.detail || 'Sin detalle adicional.')}</p>
                <span>${item.created_at ? formatDateTime(item.created_at) : 'Sin fecha'}</span>
              </div>
            </div>
          `
      )
      .join('')}
    </div>
  `;
}

function renderAdminClientQuotePanel(detail) {
  const quote = detail.latestQuote;
  if (!quote) {
    return renderEmptyState('Este cliente todavía no ha guardado una cotización desde la calculadora.');
  }

  const payloadClient = quote.client || {};
  const extras = (quote.features || []).map((feature) => feature.label).filter(Boolean);
  const breakdown = quote.breakdown || [];

  return `
    <div class="admin-client-quote-card">
      <div class="admin-client-quote-top">
        <div>
          <strong>${escapeHtml(quote.project_label || 'Cotización web')}</strong>
          <p>${escapeHtml(quote.quote_number || 'Sin código')} · ${quote.created_at ? formatDateTime(quote.created_at) : 'Sin fecha'}</p>
        </div>
        <div class="admin-client-total">${formatCurrency(quote.total_amount)}</div>
      </div>
      <div class="admin-client-highlight-grid">
        <div class="admin-client-highlight">
          <span>Entrega</span>
          <strong>${escapeHtml(quote.delivery_label || quote.delivery?.label || 'Normal')}</strong>
        </div>
        <div class="admin-client-highlight">
          <span>Origen</span>
          <strong>${escapeHtml(capitalize(quote.source || 'calculator'))}</strong>
        </div>
      </div>
      <div class="admin-client-copy">
        ${escapeHtml(payloadClient.project_description || quote.project?.summary || 'Sin descripción adicional.')}
      </div>
      <div class="admin-client-pill-row">
        ${extras.length ? extras.map((item) => `<span class="service-tag">${escapeHtml(item)}</span>`).join('') : '<span class="service-tag">Sin extras</span>'}
      </div>
      ${breakdown.length
      ? `
            <div class="admin-client-breakdown">
              ${breakdown
        .map(
          (row) => `
                    <div class="admin-client-breakdown-row">
                      <span>${escapeHtml(row.label || 'Concepto')}</span>
                      <strong>${formatCurrency(row.value)}</strong>
                    </div>
                  `
        )
        .join('')}
            </div>
          `
      : ''
    }
    </div>
  `;
}

function renderAdminClientProjectPanel(detail) {
  const project = detail.activeProject;
  if (!project) {
    return renderEmptyState('Este cliente todavía no tiene un proyecto activo.');
  }

  const moreProjects = (detail.projects || []).slice(1, 4);

  return `
    <div class="admin-client-project-head">
      <div>
        <strong>${escapeHtml(project.title)}</strong>
        <p>${escapeHtml(project.summary || 'Sin resumen registrado.')}</p>
      </div>
      <span class="badge ${badgeClassForProject(project.status)}">${project.status === 'completed' ? 'Completado' : 'En progreso'}</span>
    </div>
    <div class="admin-client-highlight-grid">
      <div class="admin-client-highlight">
        <span>Servicio</span>
        <strong>${escapeHtml(project.service_label || serviceLabel(project.service_type))}</strong>
      </div>
      <div class="admin-client-highlight">
        <span>Avance</span>
        <strong>${project.progress_percent}%</strong>
      </div>
      <div class="admin-client-highlight">
        <span>Entrega</span>
        <strong>${project.due_date ? formatDate(project.due_date) : 'Por definir'}</strong>
      </div>
      <div class="admin-client-highlight">
        <span>Presupuesto</span>
        <strong>${formatCurrency(project.budget)}</strong>
      </div>
    </div>
    <div class="progress-bar admin-client-progress-bar">
      <div class="progress-fill" style="width:${project.progress_percent}%"></div>
    </div>
    <div class="admin-client-milestones">
      ${(detail.activeMilestones || []).length ? detail.activeMilestones.map(renderMilestone).join('') : renderEmptyState('Todavía no hay hitos registrados.')}
    </div>
    ${moreProjects.length
      ? `
          <div class="admin-client-secondary-projects">
            <h4>Otros proyectos</h4>
            <div class="list-stack">
              ${moreProjects
        .map(
          (item) => `
                    <div class="list-item">
                      <div>
                        <strong>${escapeHtml(item.title)}</strong>
                        <p>${escapeHtml(item.service_label || serviceLabel(item.service_type))}</p>
                      </div>
                      <span class="badge ${badgeClassForProject(item.status)}">${item.progress_percent}%</span>
                    </div>
                  `
        )
        .join('')}
            </div>
          </div>
        `
      : ''
    }
  `;
}

function renderAdminClientDetailModal(detail) {
  if (!detail || !dom.adminClientModalContent) {
    return;
  }

  const client = detail.client || {};
  const lead = detail.latestLead;
  const diagnostic = detail.diagnostic;
  const metrics = detail.metrics || {};
  const leadState = lead ? statusLabel(lead.status) : detail.latestQuote ? 'Cotización generada' : 'Sin lead';

  dom.adminClientModalTitle.textContent = client.company || client.full_name || 'Cliente';
  dom.adminClientModalSubtitle.textContent = lead
    ? `Estado actual del lead: ${leadState}. Última actividad ${metrics.lastInteraction ? formatDate(metrics.lastInteraction) : 'sin fecha'}.`
    : 'Vista administrativa con datos generales, formulario, cotización y progreso.';

  dom.adminClientModalContent.innerHTML = `
    <div class="admin-client-shell">
      <section class="admin-client-hero">
        <div>
          <div class="admin-client-kicker">Vista detallada del cliente</div>
          <h3>${escapeHtml(client.full_name || client.company || 'Cliente TISNET')}</h3>
          <p>${escapeHtml(client.email || 'Sin correo')}</p>
        </div>
        <div class="admin-client-hero-actions">
          <span class="badge ${lead ? badgeClassForLead(lead.status) : 'badge-active'}">${escapeHtml(leadState)}</span>
          <button class="btn btn-ghost" type="button" onclick="window.open('mailto:${escapeAttribute(client.email || '')}', '_blank')">Email</button>
          ${client.website ? `<button class="btn btn-ghost" type="button" onclick="window.open('${escapeAttribute(client.website)}', '_blank')">Red social</button>` : ''}
        </div>
      </section>

      <div class="admin-client-stat-grid">
        <div class="admin-client-stat-card">
          <span>Inversión acumulada</span>
          <strong>${formatCurrency(client.total_budget)}</strong>
        </div>
        <div class="admin-client-stat-card">
          <span>Proyectos</span>
          <strong>${metrics.projectCount || 0}</strong>
        </div>
        <div class="admin-client-stat-card">
          <span>Cotizaciones guardadas</span>
          <strong>${metrics.quoteCount || 0}</strong>
        </div>
        <div class="admin-client-stat-card">
          <span>Última interacción</span>
          <strong>${metrics.lastInteraction ? formatDate(metrics.lastInteraction) : 'Sin actividad'}</strong>
        </div>
      </div>

      <div class="split-grid admin-client-grid">
        <div class="table-card admin-client-panel-card">
          <div class="section-row">
            <h3 class="table-title">Datos generales del cliente</h3>
          </div>
          ${renderAdminClientInfoRows([
    { label: 'Nombre', value: client.full_name || 'Sin nombre' },
    { label: 'Empresa', value: client.company || 'Sin empresa' },
    { label: 'Email', value: client.email || 'Sin correo' },
    { label: 'Red social', value: client.website || 'No registrada' },
    { label: 'Teléfono', value: client.phone || 'No registrado' },
    { label: 'Creado', value: client.created_at ? formatDate(client.created_at) : 'Sin fecha' },
  ])}
        </div>

        <div class="table-card admin-client-panel-card">
          <div class="section-row">
            <h3 class="table-title">Estado actual del lead</h3>
          </div>
          ${lead
      ? `
                <div class="admin-client-state-card">
                  <span class="badge ${badgeClassForLead(lead.status)}">${escapeHtml(statusLabel(lead.status))}</span>
                  <p>${escapeHtml(serviceLabel(lead.service_type))} · ${escapeHtml(capitalize(lead.source || 'website'))}</p>
                  <div class="admin-client-copy">${escapeHtml(leadNextAction(lead))}</div>
                </div>
                ${renderAdminClientInfoRows([
        { label: 'Servicio solicitado', value: serviceLabel(lead.service_type) },
        { label: 'Empresa del lead', value: lead.company || client.company || 'Sin empresa' },
        { label: 'Red social declarada', value: lead.website || client.website || 'No registrada' },
        { label: 'Enviado', value: lead.created_at ? formatDateTime(lead.created_at) : 'Sin fecha' },
      ])}
              `
      : renderEmptyState('Todavía no hay un lead asociado a este cliente.')
    }
        </div>
      </div>

      <div class="split-grid admin-client-grid">
        <div class="table-card admin-client-panel-card">
          <div class="section-row">
            <h3 class="table-title">Respuestas del formulario</h3>
          </div>
          ${lead
      ? `
                <div class="admin-client-copy">${escapeHtml(lead.message || 'Sin mensaje registrado en el formulario.')}</div>
                <div class="admin-client-form-block">
                  ${diagnostic ? renderAdminClientInfoRows([
        { label: 'Etapa del negocio', value: capitalize(diagnostic.business_stage || 'Sin definir') },
        { label: 'Necesidad principal', value: diagnostic.primary_need || 'Sin detalle' },
        { label: 'Objetivo', value: diagnostic.goal || 'Sin detalle' },
        { label: 'Resumen', value: diagnostic.business_summary || 'Sin resumen' },
      ]) : '<div class="empty-state">Todavía no hay diagnóstico completado por el cliente.</div>'}
                </div>
              `
      : renderEmptyState('Este cliente aún no ha dejado respuestas en el formulario comercial.')
    }
        </div>

        <div class="table-card admin-client-panel-card">
          <div class="section-row">
            <h3 class="table-title">Cotización y calculadora</h3>
          </div>
          ${renderAdminClientQuotePanel(detail)}
        </div>
      </div>

      <div class="split-grid admin-client-grid">
        <div class="table-card admin-client-panel-card">
          <div class="section-row">
            <h3 class="table-title">Progreso del proyecto</h3>
          </div>
          ${renderAdminClientProjectPanel(detail)}
        </div>

        <div class="table-card admin-client-panel-card">
          <div class="section-row">
            <h3 class="table-title">Historial básico de interacción</h3>
          </div>
          ${renderAdminClientTimeline(detail.interactionHistory || [])}
        </div>
      </div>
    </div>
  `;
}

async function openAdminClientDetail(clientId) {
  try {
    const response = await api(`/api/admin/clients/${clientId}`);
    state.selectedAdminClient = response.client;
    renderAdminClientDetailModal(response.client);
    dom.adminClientModalBg?.classList.remove('hidden');
  } catch (error) {
    toast(error.message, 'error');
  }
}

function closeAdminClientDetail(event) {
  if (!event || event.target === dom.adminClientModalBg) {
    dom.adminClientModalBg?.classList.add('hidden');
  }
}

function renderMeetingsTable(meetings) {
  if (!meetings.length) {
    return renderEmptyState('Todavía no se han capturado reuniones desde Calendly.');
  }

  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Proyecto</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${meetings
      .map(
        (meeting) => `
                <tr>
                  <td>${escapeHtml(meeting.client_name || meeting.invitee_name || 'Sin nombre')}</td>
                  <td>${escapeHtml(meeting.project_title || 'Sin proyecto')}</td>
                  <td>${escapeHtml(meeting.meeting_type)}</td>
                  <td>${meeting.scheduled_for ? formatDateTime(meeting.scheduled_for) : 'Por confirmar'}</td>
                  <td><span class="badge badge-active">${escapeHtml(meeting.status)}</span></td>
                </tr>
              `
      )
      .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function buildTrendChartSvg(trends) {
  const width = 700;
  const height = 180;
  const paddingLeft = 60;
  const paddingBottom = 30;
  const usableWidth = width - paddingLeft - 30;
  const usableHeight = height - 40 - paddingBottom;

  const maxLead = Math.max(10, ...trends.map((item) => item.leads));
  const maxRevenue = Math.max(1000, ...trends.map((item) => item.revenue));
  const xStep = usableWidth / Math.max(1, trends.length - 1);

  const leadPoints = trends
    .map((item, index) => {
      const x = paddingLeft + index * xStep;
      const y = 20 + usableHeight - (item.leads / maxLead) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const revenuePoints = trends
    .map((item, index) => {
      const x = paddingLeft + index * xStep;
      const y = 20 + usableHeight - (item.revenue / maxRevenue) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const xLabels = trends
    .map((item, index) => `<text x="${paddingLeft + index * xStep}" y="${height - 8}" fill="rgba(255,255,255,.35)" font-size="10" text-anchor="middle">${item.label}</text>`)
    .join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">
      <defs>
        <linearGradient id="trendLead" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00D4FF" stop-opacity=".3"></stop>
          <stop offset="100%" stop-color="#00D4FF" stop-opacity="0"></stop>
        </linearGradient>
        <linearGradient id="trendRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0A66C2" stop-opacity=".3"></stop>
          <stop offset="100%" stop-color="#0A66C2" stop-opacity="0"></stop>
        </linearGradient>
      </defs>
      <line x1="${paddingLeft}" y1="20" x2="${paddingLeft}" y2="${20 + usableHeight}" stroke="rgba(255,255,255,.08)" />
      <line x1="${paddingLeft}" y1="${20 + usableHeight}" x2="${width - 20}" y2="${20 + usableHeight}" stroke="rgba(255,255,255,.08)" />
      <polyline points="${leadPoints}" fill="none" stroke="#00D4FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      <polyline points="${revenuePoints}" fill="none" stroke="#0A66C2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${xLabels}
    </svg>
  `;
}

function renderEmptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function setupKanbanDragAndDrop() {
  document.querySelectorAll('.kanban-card[draggable="true"]').forEach((card) => {
    card.addEventListener('dragstart', handleCardDragStart);
    card.addEventListener('dragend', handleCardDragEnd);
  });

  document.querySelectorAll('.drop-zone').forEach((zone) => {
    zone.addEventListener('dragover', handleZoneDragOver);
    zone.addEventListener('dragleave', handleZoneDragLeave);
    zone.addEventListener('drop', handleZoneDrop);
  });
}

function handleCardDragStart(event) {
  const card = event.currentTarget;
  state.dragPayload = {
    type: card.dataset.dragType,
    id: card.dataset.id,
    currentStatus: card.dataset.currentStatus,
  };
  card.classList.add('dragging');
}

function handleCardDragEnd(event) {
  event.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.drop-zone').forEach((zone) => zone.classList.remove('drag-over'));
}

function handleZoneDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}

function handleZoneDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

async function handleZoneDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');

  if (!state.dragPayload) {
    return;
  }

  const zone = event.currentTarget;
  const targetType = zone.dataset.board;
  const targetStatus = zone.dataset.status;

  if (state.dragPayload.type !== targetType || state.dragPayload.currentStatus === targetStatus) {
    state.dragPayload = null;
    return;
  }

  try {
    if (targetType === 'lead') {
      await api(`/api/admin/leads/${state.dragPayload.id}`, {
        method: 'PATCH',
        body: { status: targetStatus },
      });
      toast(
        targetStatus === 'won'
          ? 'Lead actualizado. Ya puedes convertirlo en proyecto desde esta misma tarjeta.'
          : 'Lead actualizado.',
        'success'
      );
    }

    if (targetType === 'project') {
      if (!isAdminRole(state.session?.role)) {
        throw new Error('Solo el perfil administrador puede mover proyectos entre etapas.');
      }
      await api(`/api/admin/projects/${state.dragPayload.id}`, {
        method: 'PATCH',
        body: { admin_status: targetStatus },
      });
      toast('Proyecto actualizado.', 'success');
    }

    if (targetType === 'task') {
      if (!isAdminRole(state.session?.role)) {
        throw new Error('Solo el perfil administrador puede mover tareas del tablero.');
      }
      await api(`/api/admin/tasks/${state.dragPayload.id}`, {
        method: 'PATCH',
        body: { status: targetStatus },
      });
      toast('Tarea actualizada.', 'success');
    }

    await loadAdminOverview();
    setAdminTab(state.activeAdminTab);
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    state.dragPayload = null;
  }
}

async function updateAdminTaskAssignee(taskId, assigneeId) {
  try {
    await api(`/api/admin/tasks/${taskId}`, {
      method: 'PATCH',
      body: { assignee_id: assigneeId || null },
    });
    toast('Responsable actualizado.', 'success');
    await loadAdminOverview();
    setAdminTab('projects');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function updateAdminTaskStatus(taskId, status) {
  try {
    await api(`/api/admin/tasks/${taskId}`, {
      method: 'PATCH',
      body: { status },
    });
    toast('Estado de tarea actualizado.', 'success');
    await loadAdminOverview();
    setAdminTab('projects');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function updateFeedbackRequestStatus(feedbackId, status) {
  try {
    await api(`/api/admin/feedback-requests/${feedbackId}`, {
      method: 'PATCH',
      body: { status },
    });
    toast('Retroalimentacion actualizada.', 'success');
    await loadAdminOverview();
    setAdminTab('dashboard');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function convertLeadToProject(leadId) {
  const lead = state.adminOverview?.leads?.find((item) => String(item.id) === String(leadId));
  if (!lead) {
    toast('No encontramos el lead que intentas convertir.', 'warning');
    return;
  }

  const approved = window.confirm(
    `Se creará un proyecto para ${lead.company || lead.full_name} usando el lead, la cotización más reciente y el historial comercial disponible. ¿Deseas continuar?`
  );
  if (!approved) {
    return;
  }

  try {
    const response = await api(`/api/admin/leads/${leadId}/convert`, {
      method: 'POST',
    });
    const extraMessage = response.clientCreated ? ' También se creó el acceso base del cliente.' : '';
    toast(`${response.message || 'Lead convertido a proyecto.'}${extraMessage}`, 'success');
    await loadAdminOverview();
    setAdminTab(isAdminRole(state.session?.role) ? 'projects' : 'crm');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleNewsletterSubmit(event) {
  event.preventDefault();

  let phone = '';
  try {
    phone = normalizeLocalPhone(dom.newsletterPhone?.value || '');
    if (dom.newsletterPhone) {
      dom.newsletterPhone.value = phone;
    }
  } catch (error) {
    setFeedback(dom.newsletterFeedback, error.message, 'error');
    toast(error.message, 'error');
    return;
  }

  const payload = {
    full_name: dom.newsletterName.value.trim(),
    email: dom.newsletterEmail.value.trim(),
    company: document.getElementById('newsletter-company').value.trim(),
    website: document.getElementById('newsletter-website').value.trim(),
    phone,
    service_type: dom.newsletterService.value,
    message: document.getElementById('newsletter-message').value.trim(),
  };

  setFeedback(dom.newsletterFeedback, 'Enviando solicitud...', 'pending');

  try {
    const response = await api('/api/public/contact', {
      method: 'POST',
      body: payload,
    });
    state.latestLeadId = response.lead.id;
    if (response.user) {
      state.session = response.user;
      updateNavigation();
    }
    dom.newsletterForm.reset();
    dom.newsletterService.value = 'diagnostic';
    applySessionDefaults();
    setFeedback(dom.newsletterFeedback, 'Solicitud registrada. Puedes continuar con Calendly.', 'success');
    toast('Solicitud guardada correctamente.', 'success');
    openScheduleModal('public');
  } catch (error) {
    setFeedback(dom.newsletterFeedback, error.message, 'error');
    toast(error.message, 'error');
  }
}

async function handleFooterSubscribeSubmit(event) {
  event.preventDefault();

  const payload = {
    full_name: dom.footerSubscribeName.value.trim(),
    email: dom.footerSubscribeEmail.value.trim(),
    company: 'Newsletter TISNET',
    website: '',
    service_type: 'consulting',
    message: 'Quiero recibir novedades, casos de exito y oportunidades comerciales de TISNET.',
    source: 'footer_newsletter',
  };

  setFeedback(dom.footerSubscribeFeedback, 'Registrando suscripcion...', 'pending');

  try {
    const response = await api('/api/public/contact', {
      method: 'POST',
      body: payload,
    });
    if (response.user) {
      state.session = response.user;
      updateNavigation();
    }
    dom.footerSubscribeForm.reset();
    applySessionDefaults();
    setFeedback(dom.footerSubscribeFeedback, 'Suscripcion registrada correctamente.', 'success');
    toast('Newsletter registrado correctamente.', 'success');
  } catch (error) {
    setFeedback(dom.footerSubscribeFeedback, error.message, 'error');
    toast(error.message, 'error');
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const payload = {
    email: document.getElementById('login-email').value.trim(),
    password: document.getElementById('login-password').value.trim(),
  };

  try {
    const response = await api('/api/auth/login', {
      method: 'POST',
      body: payload,
    });
    await onAuthenticated(response.user);
    closeModalBg();
    toast('Sesión iniciada.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();

  let phone = '';
  try {
    phone = normalizeLocalPhone(dom.registerPhone?.value || '');
    if (dom.registerPhone) {
      dom.registerPhone.value = phone;
    }
  } catch (error) {
    toast(error.message, 'error');
    return;
  }

  const payload = {
    full_name: document.getElementById('register-name').value.trim(),
    email: document.getElementById('register-email').value.trim(),
    phone,
    company: document.getElementById('register-company').value.trim(),
    website: document.getElementById('register-website').value.trim(),
    password: document.getElementById('register-password').value.trim(),
  };

  try {
    const response = await api('/api/auth/register', {
      method: 'POST',
      body: payload,
    });
    await onAuthenticated(response.user);
    closeModalBg();
    toast('Cuenta creada correctamente.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function onAuthenticated(user) {
  state.session = user;
  updateNavigation();
  applySessionDefaults();

  if (user.role === 'client') {
    await loadClientDashboard();
    showView('client-panel-view');
  }

  if (isOperatorRole(user.role)) {
    await loadAdminOverview();
    showView('admin-panel-view');
  }
}

async function handleDiagnosticSubmit(event) {
  event.preventDefault();

  const payload = {
    business_summary: document.getElementById('diagnostic-business-summary').value.trim(),
    business_stage: dom.diagnosticStageInput.value,
    primary_need: document.getElementById('diagnostic-primary-need').value.trim(),
    goal: document.getElementById('diagnostic-goal').value.trim(),
  };

  setFeedback(dom.diagnosticFeedback, 'Guardando diagnostico...', 'pending');

  try {
    await api('/api/client/diagnostic', {
      method: 'POST',
      body: payload,
    });
    setFeedback(dom.diagnosticFeedback, 'Diagnostico guardado. En 24 horas habra una respuesta de desarrollo.', 'success');
    toast('Diagnostico actualizado. Te responderemos en 24 horas.', 'success');
    await loadClientDashboard();
  } catch (error) {
    setFeedback(dom.diagnosticFeedback, error.message, 'error');
    toast(error.message, 'error');
  }
}

async function handleClientProcessAction(action, context = '', url = '') {
  if (action === 'schedule') {
    openScheduleModal(context || 'client-review');
    return;
  }
  if (action === 'open_document') {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast('El documento esta publicado sin enlace externo.', 'info');
    }
    return;
  }
  if (action === 'go_diagnostic') {
    showView('wizard-view');
    return;
  }
  if (action === 'go_history') {
    setClientTab('history');
    return;
  }

  const payload = { action };
  if (action === 'confirm_kickoff') {
    payload.confirmed = window.confirm('¿Ya realizaste tu reunion de kickoff?');
    if (!payload.confirmed) {
      toast('Kickoff se mantiene pendiente hasta confirmar la reunion.', 'info');
      return;
    }
  }
  if (['feedback_diagnostic', 'feedback_proposal', 'feedback_advance'].includes(action)) {
    const message = window.prompt('Escribe la retroalimentacion para el equipo TISNET:');
    if (!message || !message.trim()) {
      toast('La retroalimentacion no se envio porque estaba vacia.', 'warning');
      return;
    }
    payload.message = message.trim();
  }
  if (action === 'validate_proposal') {
    const percent = window.prompt('Porcentaje de anticipo acordado: 10, 20 o 30', '20');
    payload.advance_payment_percent = Number(percent || 20);
  }
  if (action === 'validate_advance') {
    const approved = window.confirm('¿Deseas validar este avance? Esto aumentara el porcentaje de ejecucion.');
    if (!approved) {
      return;
    }
  }
  if (action === 'request_final_meeting') {
    const approved = window.confirm('Registraremos la solicitud de reunion de entrega final. ¿Continuar?');
    if (!approved) {
      return;
    }
  }

  try {
    const response = await api('/api/client/process/action', {
      method: 'POST',
      body: payload,
    });
    state.clientDashboard = response;
    renderClientDashboard();
    toast(response.message || 'Proceso actualizado.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleDynamicSubmit(event) {
  const form = event.target;

  if (form.id === 'client-settings-form') {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    const feedbackNode = document.getElementById('client-settings-feedback');

    try {
      payload.phone = normalizeLocalPhone(payload.phone);
      if (form.querySelector('#client-settings-phone')) {
        form.querySelector('#client-settings-phone').value = payload.phone;
      }
      const response = await api('/api/client/profile', {
        method: 'PUT',
        body: payload,
      });
      state.session = response.profile;
      updateNavigation();
      await loadClientDashboard();
      setFeedback(feedbackNode, 'Perfil actualizado.', 'success');
      toast('Perfil actualizado.', 'success');
    } catch (error) {
      setFeedback(feedbackNode, error.message, 'error');
      toast(error.message, 'error');
    }
  }

  if (form.id === 'admin-lead-form') {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      await api('/api/admin/leads', {
        method: 'POST',
        body: payload,
      });
      form.reset();
      setFeedback(document.getElementById('admin-lead-feedback'), 'Lead creado correctamente.', 'success');
      toast('Lead creado.', 'success');
      await loadAdminOverview();
      setAdminTab('crm');
    } catch (error) {
      setFeedback(document.getElementById('admin-lead-feedback'), error.message, 'error');
      toast(error.message, 'error');
    }
  }

  if (form.id === 'admin-project-form') {
    event.preventDefault();
    if (!isAdminRole(state.session?.role)) {
      toast('Solo el perfil administrador puede crear proyectos manualmente.', 'warning');
      return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      await api('/api/admin/projects', {
        method: 'POST',
        body: payload,
      });
      form.reset();
      setFeedback(document.getElementById('admin-project-feedback'), 'Proyecto creado correctamente.', 'success');
      toast('Proyecto creado.', 'success');
      await loadAdminOverview();
      setAdminTab('projects');
    } catch (error) {
      setFeedback(document.getElementById('admin-project-feedback'), error.message, 'error');
      toast(error.message, 'error');
    }
  }

  if (form.id === 'admin-document-form') {
    event.preventDefault();
    if (!isOperatorRole(state.session?.role)) {
      toast('Solo administracion o ventas pueden publicar documentos.', 'warning');
      return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.is_visible_to_client = form.querySelector('[name="is_visible_to_client"]')?.checked ?? true;

    try {
      await api('/api/admin/project-documents', {
        method: 'POST',
        body: payload,
      });
      form.reset();
      const visibleToggle = form.querySelector('[name="is_visible_to_client"]');
      if (visibleToggle) {
        visibleToggle.checked = true;
      }
      setFeedback(document.getElementById('admin-document-feedback'), 'Documento publicado y visible en el historial del cliente.', 'success');
      toast('Documento publicado.', 'success');
      await loadAdminOverview();
      setAdminTab('projects');
    } catch (error) {
      setFeedback(document.getElementById('admin-document-feedback'), error.message, 'error');
      toast(error.message, 'error');
    }
  }

  if (form.id === 'admin-task-form') {
    event.preventDefault();
    if (!isAdminRole(state.session?.role)) {
      toast('Solo el perfil administrador puede crear tareas.', 'warning');
      return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      await api('/api/admin/tasks', {
        method: 'POST',
        body: payload,
      });
      form.reset();
      const defaultStatus = document.getElementById('admin-task-status');
      const defaultPriority = document.getElementById('admin-task-priority');
      if (defaultStatus) {
        defaultStatus.value = 'pending';
      }
      if (defaultPriority) {
        defaultPriority.value = 'medium';
      }
      setFeedback(document.getElementById('admin-task-feedback'), 'Tarea creada y visible en el tablero.', 'success');
      toast('Tarea creada.', 'success');
      await loadAdminOverview();
      setAdminTab('projects');
    } catch (error) {
      setFeedback(document.getElementById('admin-task-feedback'), error.message, 'error');
      toast(error.message, 'error');
    }
  }

  if (form.id === 'admin-settings-form') {
    event.preventDefault();
    if (!isAdminRole(state.session?.role)) {
      toast('Solo el perfil administrador puede actualizar la configuración.', 'warning');
      return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await api('/api/admin/settings', {
        method: 'PUT',
        body: payload,
      });
      if (state.publicContent) {
        state.publicContent.settings = response.settings;
        renderPublicContent();
      }
      if (state.adminOverview) {
        state.adminOverview.settings = response.settings;
      }
      setFeedback(document.getElementById('admin-settings-feedback'), 'Configuración actualizada.', 'success');
      toast('Configuración actualizada.', 'success');
    } catch (error) {
      setFeedback(document.getElementById('admin-settings-feedback'), error.message, 'error');
      toast(error.message, 'error');
    }
  }
}

async function logout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    toast(error.message, 'error');
  }

  state.session = null;
  state.clientDashboard = null;
  state.adminOverview = null;
  state.mobileNavActive = 'home';
  state.mobileNavSheetOpen = false;
  updateNavigation();
  closeModalBg();
  closeScheduleModal();
  showView('public-view');
}

function showView(viewId, options = {}) {
  const protectedViews = {
    'client-home': 'client',
    'client-panel-view': 'client',
    'wizard-view': 'client',
    'admin-panel-view': ['admin', 'sales'],
  };

  const requiredRole = protectedViews[viewId];
  const hasAccess = Array.isArray(requiredRole)
    ? requiredRole.includes(state.session?.role)
    : !requiredRole || state.session?.role === requiredRole;
  if (requiredRole && (!state.session || !hasAccess)) {
    openModal('login', { pushRoute: options.pushRoute !== false, replaceRoute: true });
    toast('Inicia sesión para acceder a esta sección.', 'warning');
    return false;
  }

  document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
  const nextView = document.getElementById(viewId);
  if (nextView) {
    nextView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (viewId === 'client-panel-view' && state.session?.role === 'client') {
    setClientTab(state.activeClientTab, null, { pushRoute: options.pushRoute !== false });
  }

  if (viewId === 'admin-panel-view' && isOperatorRole(state.session?.role)) {
    setAdminTab(state.activeAdminTab, null, { pushRoute: options.pushRoute !== false });
  }

  if (viewId === 'pricing-view') {
    applySessionDefaults();
    updatePricingCalculator();
  }

  if (viewId === 'wizard-view') {
    syncDiagnosticFormFromDashboard();
  }

  if (viewId === 'portfolio-view') {
    window.requestAnimationFrame(() => {
      syncPortfolioProgress();
      if (!dom.portfolioMemoryGrid) {
        startPortfolioAutoplay();
      }
    });
  } else {
    stopPortfolioAutoplay();
  }

  syncMobileNavigation();
  if (options.pushRoute !== false) {
    writeBrowserRoute(getRouteForView(viewId), { replace: options.replaceRoute });
  }
  return true;
}

function setClientTab(tab, button, options = {}) {
  state.activeClientTab = tab;
  Object.entries(dom.clientTabs).forEach(([key, element]) => {
    element.classList.toggle('hidden', key !== tab);
  });
  document.querySelectorAll('.client-sidebar .sidebar-link').forEach((item) => item.classList.remove('active'));
  if (button) {
    button.classList.add('active');
  } else {
    const matching = Array.from(document.querySelectorAll('.client-sidebar .sidebar-link')).find((item) => item.textContent.toLowerCase().includes(tab === 'overview' ? 'mi proyecto' : tab === 'schedule' ? 'agendar' : tab === 'wizard' ? 'diagnóstico' : tab === 'history' ? 'historial' : 'configuración'));
    matching?.classList.add('active');
  }

  syncMobileNavigation();
  if (options.pushRoute !== false && getActiveViewId() === 'client-panel-view') {
    writeBrowserRoute(CLIENT_TAB_ROUTES[tab] || CLIENT_TAB_ROUTES.overview);
  }
}

function setAdminTab(tab, button, options = {}) {
  if (!canAccessAdminTab(tab)) {
    if (tab !== 'dashboard') {
      toast('Ese módulo está reservado para otro perfil.', 'warning');
    }
    tab = 'dashboard';
  }
  state.activeAdminTab = tab;
  Object.entries(dom.adminTabs).forEach(([key, element]) => {
    element.classList.toggle('hidden', key !== tab);
  });
  document.querySelectorAll('.admin-sidebar [data-admin-tab]').forEach((item) => item.classList.remove('active'));
  if (button) {
    button.classList.add('active');
  } else {
    const matching = document.querySelector(`.admin-sidebar [data-admin-tab="${tab}"]`);
    matching?.classList.add('active');
  }

  syncMobileNavigation();
  if (options.pushRoute !== false && getActiveViewId() === 'admin-panel-view') {
    writeBrowserRoute(ADMIN_TAB_ROUTES[tab] || ADMIN_TAB_ROUTES.dashboard);
  }
}

function openModal(tab = 'login', options = {}) {
  closeMobileNavSheet();
  dom.authModal.classList.remove('hidden');
  switchTab(tab, { pushRoute: false });
  if (options.pushRoute !== false) {
    writeBrowserRoute(getRouteForAuthTab(tab), { replace: options.replaceRoute });
  }
}

function switchTab(tab, options = {}) {
  const isLogin = tab === 'login';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  dom.loginForm.classList.toggle('hidden', !isLogin);
  dom.registerForm.classList.toggle('hidden', isLogin);
  document.getElementById('modal-sub').textContent = isLogin
    ? 'Accede a tu panel y sigue navegando por todo TISNET con tu cuenta activa.'
    : 'Crea tu cuenta para activar diagnóstico, panel y agenda.';
  if (options.pushRoute !== false && !dom.authModal.classList.contains('hidden')) {
    writeBrowserRoute(getRouteForAuthTab(tab), { replace: options.replaceRoute });
  }
}

function closeModalBg(event) {
  if (!event || event.target === dom.authModal) {
    dom.authModal.classList.add('hidden');
    if (AUTH_ROUTES[normalizeAppRoute(window.location.pathname)]) {
      writeBrowserRoute(getRouteForView(getActiveViewId()), { replace: true });
    }
  }
}

function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) {
    return;
  }
  const shouldShow = input.type === 'password';
  input.type = shouldShow ? 'text' : 'password';
  button?.classList.toggle('is-visible', shouldShow);
  button?.setAttribute('aria-label', shouldShow ? 'Ocultar contrasena' : 'Mostrar contrasena');
}

function openCaseModal(slug) {
  const item = state.publicContent?.portfolio?.find((entry) => entry.slug === slug);
  if (!item) {
    toast('No encontramos el caso solicitado.', 'warning');
    return;
  }

  dom.caseModalCategory.textContent = item.category;
  dom.caseModalTitle.textContent = item.title;
  dom.caseModalDescription.textContent = item.long_description;
  dom.caseModalHighlights.innerHTML = [item.highlight_1, item.highlight_2, item.highlight_3]
    .filter(Boolean)
    .map((highlight) => `<span class="service-tag case-tag">${escapeHtml(highlight)}</span>`)
    .join('');
  if (dom.caseModalMetrics) {
    dom.caseModalMetrics.innerHTML = buildCaseMetrics(item);
  }
  if (dom.caseModalMockups) {
    dom.caseModalMockups.innerHTML = buildCaseMockups(item);
  }
  dom.caseModal.classList.remove('hidden');
}

function openClientCase(slug) {
  if (!slug) {
    scrollToNewsletter();
    return;
  }
  openCaseModal(slug);
}

function closeCaseModal(event) {
  if (!event || event.target === dom.caseModal) {
    dom.caseModal.classList.add('hidden');
  }
}

async function openScheduleModal(context = 'public') {
  dom.scheduleModal.classList.remove('hidden');
  dom.scheduleSwitch.classList.toggle('hidden', !context.startsWith('client'));

  const scheduleInfo = resolveScheduleContext(context);
  state.scheduleContext = scheduleInfo;

  dom.scheduleModalLabel.textContent = scheduleInfo.label;
  dom.scheduleModalTitle.textContent = scheduleInfo.title;
  dom.scheduleModalDescription.textContent = scheduleInfo.description;
  dom.calendlyEmbed.innerHTML = '';
  syncCalendlyEmbedLayout();

  if (
    !scheduleInfo.url
    || scheduleInfo.url.includes('your-calendly-link')
    || scheduleInfo.url.includes('/tu-cuenta')
  ) {
    dom.calendlyEmbed.innerHTML = `
      <div class="empty-state">
        Aún no se configuró la URL real de Calendly. Puedes actualizarla desde el panel admin en Configuración.
      </div>
    `;
    dom.scheduleFeedback.textContent = 'Configura las URLs de Calendly en el panel administrador para ver el calendario real.';
    dom.scheduleFeedback.dataset.state = 'warning';
    return;
  }

  try {
    renderCalendlyFrame(scheduleInfo.url);
    syncCalendlyEmbedLayout();
    window.requestAnimationFrame(syncCalendlyEmbedLayout);
    window.setTimeout(syncCalendlyEmbedLayout, 250);
    window.setTimeout(syncCalendlyEmbedLayout, 900);
    dom.scheduleFeedback.textContent = 'Cuando se agende una cita, intentaremos registrarla también en la base de datos.';
    dom.scheduleFeedback.dataset.state = 'success';
  } catch (error) {
    dom.calendlyEmbed.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    dom.scheduleFeedback.textContent = 'No pudimos cargar el embed de Calendly.';
    dom.scheduleFeedback.dataset.state = 'error';
  }
}

function closeScheduleModal(event) {
  if (!event || event.target === dom.scheduleModal) {
    dom.scheduleModal.classList.add('hidden');
    dom.calendlyEmbed.innerHTML = '';
    dom.calendlyEmbed.style.height = '';
  }
}

function getCalendlyEmbedHeight() {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 900;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1440;

  if (viewportWidth <= 480) {
    return Math.max(Math.min(Math.round(viewportHeight * 0.62), 560), 460);
  }

  if (viewportWidth <= 768) {
    return Math.max(Math.min(Math.round(viewportHeight * 0.7), 640), 540);
  }

  return Math.max(Math.min(Math.round(viewportHeight * 0.76), 760), 620);
}

function syncCalendlyEmbedLayout() {
  if (!dom.calendlyEmbed || dom.scheduleModal?.classList.contains('hidden')) {
    return;
  }

  const targetHeight = getCalendlyEmbedHeight();
  dom.calendlyEmbed.style.height = `${targetHeight}px`;

  dom.calendlyEmbed.querySelectorAll('.calendly-inline-widget, iframe').forEach((node) => {
    node.style.width = '100%';
    node.style.minWidth = '0';
    node.style.height = '100%';
  });
}

function buildCalendlyEmbedUrl(rawUrl) {
  const url = new URL(rawUrl);
  url.searchParams.set('embed_domain', window.location.host);
  url.searchParams.set('embed_type', 'Inline');
  url.searchParams.set('hide_gdpr_banner', '1');
  url.searchParams.set('primary_color', '0ab3ff');
  return url.toString();
}

function renderCalendlyFrame(rawUrl) {
  const embedUrl = buildCalendlyEmbedUrl(rawUrl);
  dom.calendlyEmbed.innerHTML = `
    <iframe
      src="${escapeAttribute(embedUrl)}"
      title="Calendly"
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
      allow="camera; microphone; autoplay; clipboard-write; fullscreen"
    ></iframe>
  `;
}

function resolveScheduleContext(context) {
  const settings = state.publicContent?.settings || {};
  const map = {
    public: {
      key: 'public',
      label: 'Calendly Público',
      title: 'Agenda tu reunion',
      description: 'Reserva una reunion inicial sin salir del sitio.',
      meetingType: 'Reunion inicial',
      url: settings.public_calendly_url,
    },
    'client-kickoff': {
      key: 'client-kickoff',
      label: 'Kickoff',
      title: 'Agenda tu reunion de kickoff',
      description: 'Esta reunion activa el arranque formal del proyecto y desbloquea el diagnostico.',
      meetingType: 'Kickoff inicial',
      url: settings.client_review_calendly_url || settings.public_calendly_url,
    },
    'client-proposal': {
      key: 'client-proposal',
      label: 'Revision de propuesta',
      title: 'Agenda revision de propuesta tecnica comercial',
      description: 'Resuelve dudas antes de validar la propuesta y pasar a ejecucion.',
      meetingType: 'Revision de propuesta',
      url: settings.client_review_calendly_url || settings.public_calendly_url,
    },
    'client-review': {
      key: 'client-review',
      label: 'Revisión de avances',
      title: 'Agenda una revisión de avances',
      description: 'Pensado para seguimiento con clientes que ya están en ejecución.',
      meetingType: 'Revisión de avances',
      url: settings.client_review_calendly_url,
    },
    'client-close': {
      key: 'client-close',
      label: 'Reunión de cierre',
      title: 'Agenda una reunión de cierre',
      description: 'Ideal para validación final, entrega o post-lanzamiento.',
      meetingType: 'Reunión de cierre',
      url: settings.client_close_calendly_url,
    },
  };
  return map[context] || map.public;
}

function loadCalendlyScript() {
  if (window.Calendly) {
    return Promise.resolve();
  }

  if (state.calendlyLoader) {
    return state.calendlyLoader;
  }

  state.calendlyLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('No se pudo cargar el script de Calendly.'));
    document.body.appendChild(script);
  });

  return state.calendlyLoader;
}

async function handleCalendlyWindowMessage(event) {
  if (event.origin !== 'https://calendly.com') {
    return;
  }

  const eventName = event.data?.event;
  if (!eventName || !eventName.startsWith('calendly.')) {
    return;
  }

  if (eventName !== 'calendly.event_scheduled' || !state.scheduleContext) {
    return;
  }

  const payload = event.data?.payload || {};
  const eventKey = JSON.stringify(payload);

  if (state.lastCalendlyEventKey === eventKey) {
    return;
  }

  state.lastCalendlyEventKey = eventKey;

  try {
    await api('/api/meetings/capture', {
      method: 'POST',
      body: {
        context: state.scheduleContext.key,
        meeting_type: state.scheduleContext.meetingType,
        calendly_url: state.scheduleContext.url,
        lead_id: state.latestLeadId,
        payload,
      },
    });
    toast('Reunión registrada también en el backend.', 'success');
    if (state.session?.role === 'client') {
      await loadClientDashboard();
      setClientTab('schedule');
    }
    if (isOperatorRole(state.session?.role)) {
      await loadAdminOverview();
      setAdminTab('calendar');
    }
  } catch (error) {
    toast(error.message, 'error');
  }
}

function handleUserPillClick() {
  if (!state.session) {
    openModal('login');
    return;
  }
  showView(isOperatorRole(state.session.role) ? 'admin-panel-view' : 'client-panel-view');
}

function openPricingCalculator() {
  state.mobileNavActive = 'more';
  showView('pricing-view');
  renderPricingCalculatorShell();
  updatePricingCalculator();
}

function showPublicSection(sectionId) {
  const publicLandingBySection = {
    servicios: 'services-view',
    portafolio: 'portfolio-view',
    'newsletter-section': 'contact-view',
  };
  const mobileKeyBySection = {
    servicios: 'services',
    portafolio: 'portfolio',
    'newsletter-section': 'more',
  };

  state.mobileNavActive = mobileKeyBySection[sectionId] || 'home';
  const targetView = publicLandingBySection[sectionId];
  if (targetView) {
    showView(targetView);
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 40);
    });
    return;
  }

  showView('public-view');
  window.requestAnimationFrame(() => {
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  });
}

function renderPricingCalculatorShell() {
  if (dom.calcFeatureGrid && !dom.calcFeatureGrid.dataset.rendered) {
    dom.calcFeatureGrid.innerHTML = Object.entries(PRICING_CALCULATOR.features)
      .map(
        ([key, feature]) => `
          <article class="budget-option-card" data-feature-card="${escapeAttribute(key)}">
            <label class="budget-option-toggle">
              <input type="checkbox" value="${escapeAttribute(key)}" data-calc-feature ${feature.defaultSelected ? 'checked' : ''}>
              <span class="budget-option-body">
                <span class="budget-option-top">
                  <strong>${escapeHtml(feature.label)}</strong>
                  <em>+${escapeHtml(formatCurrency(feature.price))}</em>
                </span>
                <span class="budget-option-copy">${escapeHtml(feature.summary)}</span>
              </span>
            </label>
            <button class="budget-option-link" type="button" onclick="openQuoteFeatureDetail('${escapeAttribute(key)}')">Ver detalles</button>
          </article>
        `
      )
      .join('');
    dom.calcFeatureGrid.dataset.rendered = 'true';
  }

  if (dom.calcDeliveryGrid && !dom.calcDeliveryGrid.dataset.rendered) {
    dom.calcDeliveryGrid.innerHTML = Object.entries(PRICING_CALCULATOR.deliveryModes)
      .map(
        ([key, delivery]) => `
          <article class="budget-delivery-card" data-delivery-card="${escapeAttribute(key)}">
            <label class="budget-delivery-toggle">
              <input type="radio" name="delivery_mode" value="${escapeAttribute(key)}" ${key === 'normal' ? 'checked' : ''}>
              <span class="budget-delivery-body">
                <span class="budget-delivery-top">
                  <strong>${escapeHtml(delivery.label)}</strong>
                  <em>${escapeHtml(delivery.priceLabel)}</em>
                </span>
                <span class="budget-delivery-copy">${escapeHtml(delivery.summary)}</span>
              </span>
            </label>
          </article>
        `
      )
      .join('');
    dom.calcDeliveryGrid.dataset.rendered = 'true';
  }

  syncBudgetSelectionStyles();
}

function syncBudgetSelectionStyles() {
  document.querySelectorAll('[data-feature-card]').forEach((card) => {
    const input = card.querySelector('[data-calc-feature]');
    card.classList.toggle('is-selected', Boolean(input?.checked));
  });

  document.querySelectorAll('[data-delivery-card]').forEach((card) => {
    const input = card.querySelector('input[name="delivery_mode"]');
    card.classList.toggle('is-selected', Boolean(input?.checked));
  });
}

function getSelectedCalculatorFeatureKeys() {
  return Array.from(document.querySelectorAll('[data-calc-feature]:checked')).map((input) => input.value);
}

function getSelectedDeliveryModeKey() {
  return document.querySelector('input[name="delivery_mode"]:checked')?.value || 'normal';
}

function roundEstimate(value) {
  return Math.round(Number(value || 0) / 10) * 10;
}

function addBusinessDays(startDate, businessDays) {
  const result = new Date(startDate);
  let remaining = Number(businessDays || 0);

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return result;
}

function formatLongDate(value) {
  if (!value) {
    return '-';
  }

  const dateValue = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(dateValue);
}

function formatSignedCurrency(value) {
  const amount = Number(value || 0);
  if (!amount) {
    return formatCurrency(0);
  }
  return `${amount > 0 ? '+' : '-'}${formatCurrency(Math.abs(amount))}`;
}

function getPricingCalculatorEstimate() {
  if (!dom.calcProjectType) {
    return null;
  }

  const projectKey = dom.calcProjectType.value || 'ecommerce';
  const project = PRICING_CALCULATOR.projectTypes[projectKey] || PRICING_CALCULATOR.projectTypes.ecommerce;
  const deliveryKey = getSelectedDeliveryModeKey();
  const delivery = PRICING_CALCULATOR.deliveryModes[deliveryKey] || PRICING_CALCULATOR.deliveryModes.normal;
  const featureKeys = getSelectedCalculatorFeatureKeys();
  const features = featureKeys.map((key) => ({
    key,
    ...(PRICING_CALCULATOR.features[key] || { label: key, price: 0 }),
  }));

  const featuresCost = features.reduce((sum, feature) => sum + feature.price, 0);
  const subtotal = project.base + featuresCost;
  const total = roundEstimate(subtotal * delivery.multiplier);
  const deliveryAdjustment = total - subtotal;
  const deliveryDays = Math.max(5, Math.round(project.deliveryDays * delivery.daysFactor));
  const estimatedDate = addBusinessDays(new Date(), deliveryDays);
  const breakdownRows = [
    { label: `${project.label} (precio base)`, value: project.base, kind: 'base' },
    ...features.map((feature) => ({
      label: feature.label,
      value: feature.price,
      kind: 'feature',
    })),
  ];

  if (deliveryAdjustment) {
    breakdownRows.push({
      label: `Ajuste por entrega ${delivery.label.toLowerCase()}`,
      value: deliveryAdjustment,
      kind: 'delivery',
    });
  }

  return {
    projectKey,
    project,
    deliveryKey,
    delivery,
    features,
    featuresCost,
    subtotal,
    total,
    deliveryAdjustment,
    deliveryDays,
    estimatedDate,
    breakdownRows,
  };
}

function renderProjectSpotlight(estimate) {
  if (!estimate || !estimate.project) {
    return;
  }

  if (dom.calcProjectPill) {
    dom.calcProjectPill.textContent = estimate.project.label;
  }

  if (dom.calcProjectTitle) {
    dom.calcProjectTitle.textContent = estimate.project.label;
  }

  if (dom.calcProjectSummary) {
    dom.calcProjectSummary.textContent = estimate.project.summary;
  }

  if (dom.calcBasePrice) {
    dom.calcBasePrice.textContent = formatCurrency(estimate.project.base);
  }

  if (dom.calcBaseTime) {
    dom.calcBaseTime.textContent = `${estimate.project.deliveryDays} dias habiles`;
  }

  if (dom.calcModuleGrid) {
    dom.calcModuleGrid.innerHTML = estimate.project.modules
      .map(
        (module, index) => `
          <article class="budget-module-card tone-${escapeAttribute(casePalette(estimate.project.label).tone)}">
            <div class="budget-module-eyebrow">
              <span class="budget-module-icon">${escapeHtml(getBudgetModuleIcon(module.key))}</span>
              <span class="budget-module-index">Modulo ${index + 1}</span>
            </div>
            <div class="budget-module-top">
              <strong>${escapeHtml(module.title)}</strong>
              <span>Incluido</span>
            </div>
            <p>${escapeHtml(module.summary)}</p>
            <ul class="budget-module-list">
              ${module.bullets
            .slice(0, 3)
            .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
            .join('')}
            </ul>
            <button class="budget-option-link" type="button" onclick="openQuoteModuleDetail('${escapeAttribute(estimate.projectKey)}', '${escapeAttribute(module.key)}')">Ver detalles</button>
          </article>
        `
      )
      .join('');
  }
}

function getBudgetModuleIcon(key) {
  const icons = {
    hero: '✦',
    'lead-form': '✎',
    proof: '★',
    responsive: '◌',
    'service-architecture': '▦',
    trust: '✓',
    'contact-flow': '➜',
    'content-pages': '▤',
    cart: '🛒',
    payments: '💳',
    inventory: '◫',
    admin: '⚙',
    profile: '◉',
    projects: '▣',
    services: '✦',
    contact: '☎',
    auth: '🔐',
    dashboard: '📊',
    workflows: '⇄',
    reports: '▥',
    tenant: '⬢',
    roles: '☰',
    billing: '◎',
    metrics: '◌',
  };
  return icons[key] || '◦';
}

function updatePricingCalculator() {
  renderPricingCalculatorShell();
  const estimate = getPricingCalculatorEstimate();
  if (!estimate) {
    return;
  }

  renderProjectSpotlight(estimate);
  syncBudgetSelectionStyles();

  if (dom.calcBreakdown) {
    dom.calcBreakdown.innerHTML = estimate.breakdownRows
      .map(
        (row) => `
          <div class="calc-breakdown-row ${row.kind === 'base' ? 'is-base' : ''}">
            <span>${escapeHtml(row.label)}</span>
            <strong>${row.kind === 'delivery' ? escapeHtml(formatSignedCurrency(row.value)) : escapeHtml(formatCurrency(row.value))}</strong>
          </div>
        `
      )
      .join('');
  }

  if (dom.calcSummaryProject) {
    dom.calcSummaryProject.textContent = estimate.project.label;
  }

  if (dom.calcSummaryDelivery) {
    dom.calcSummaryDelivery.textContent = `${estimate.delivery.label} · ${estimate.deliveryDays} dias`;
  }

  if (dom.calcSummaryExtras) {
    dom.calcSummaryExtras.textContent = estimate.features.length
      ? `${estimate.features.length} seleccionados`
      : 'Sin extras';
  }

  if (dom.calcSummaryDate) {
    dom.calcSummaryDate.textContent = formatLongDate(estimate.estimatedDate);
  }

  if (dom.calcTotalOutput) {
    dom.calcTotalOutput.textContent = formatCurrency(estimate.total);
  }

  if (dom.calcTotalCaption) {
    dom.calcTotalCaption.textContent = estimate.features.length
      ? `Incluye ${estimate.features.length} extras y entrega ${estimate.delivery.label.toLowerCase()}.`
      : `Incluye el alcance base y entrega ${estimate.delivery.label.toLowerCase()}.`;
  }

  if (dom.calcSummaryNote) {
    dom.calcSummaryNote.textContent = `Tu PDF incluira ${estimate.project.modules.length} modulos base, ${estimate.features.length} extras y fecha estimada de entrega al ${formatLongDate(estimate.estimatedDate)}.`;
  }
}

function buildBudgetQuotePayload(strict = true) {
  const estimate = getPricingCalculatorEstimate();
  if (!estimate) {
    return null;
  }

  const fullName = dom.calcClientName?.value.trim() || '';
  const email = dom.calcClientEmail?.value.trim().toLowerCase() || '';
  const company = dom.calcClientCompany?.value.trim() || '';
  const projectDescription = dom.calcClientDescription?.value.trim() || '';

  if (strict) {
    if (!fullName) {
      throw new Error('Ingresa tu nombre para generar la cotizacion.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Ingresa un correo valido para descargar el PDF.');
    }
  }

  return {
    client: {
      full_name: fullName || 'Cliente TISNET',
      email,
      company: company || 'Sin empresa',
      project_description: projectDescription || 'Sin descripcion adicional.',
    },
    project: {
      key: estimate.projectKey,
      label: estimate.project.label,
      service: estimate.project.service,
      summary: estimate.project.summary,
      base: estimate.project.base,
      delivery_days: estimate.project.deliveryDays,
      modules: estimate.project.modules.map((module) => ({
        title: module.title,
        summary: module.summary,
        bullets: module.bullets,
      })),
    },
    features: estimate.features.map((feature) => ({
      label: feature.label,
      price: feature.price,
      summary: feature.summary,
      bullets: feature.bullets,
    })),
    delivery: {
      key: estimate.deliveryKey,
      label: estimate.delivery.label,
      summary: estimate.delivery.summary,
      price_label: estimate.delivery.priceLabel,
      days: estimate.deliveryDays,
      estimated_date: estimate.estimatedDate.toISOString(),
      estimated_date_label: formatLongDate(estimate.estimatedDate),
    },
    breakdown: estimate.breakdownRows,
    total: estimate.total,
    issued_at: new Date().toISOString(),
    issued_at_label: formatLongDate(new Date()),
  };
}

function buildBudgetQuoteFilename(name) {
  const base = (name || 'cliente')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'cliente';
  return `cotizacion-tisnet-${base}-${Date.now()}.pdf`;
}

async function downloadBudgetQuote() {
  let payload;
  try {
    payload = buildBudgetQuotePayload(true);
  } catch (error) {
    toast(error.message, 'warning');
    return;
  }

  try {
    const response = await fetch('/api/public/quote-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = 'No pudimos generar tu cotizacion PDF.';
      try {
        const payloadError = await response.json();
        message = payloadError.message || message;
      } catch (error) {
        // Ignore parsing errors and keep fallback message.
      }
      throw new Error(message);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildBudgetQuoteFilename(payload.client.full_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast('Tu cotizacion PDF se descargo correctamente.', 'success');
    if (state.session?.role === 'client') {
      await loadClientDashboard();
    }
  } catch (error) {
    toast(error.message || 'No se pudo descargar el PDF.', 'error');
  }
}

async function persistBudgetQuote(source = 'calculator') {
  const payload = buildBudgetQuotePayload(false);
  if (!payload || !payload.client?.full_name || !payload.client?.email || !payload.client.email.includes('@')) {
    return null;
  }

  const response = await api('/api/public/quotes', {
    method: 'POST',
    body: {
      ...payload,
      source,
    },
  });
  if (response.user) {
    state.session = response.user;
    updateNavigation();
  }
  return response.quote;
}

async function sendBudgetQuoteToWhatsApp() {
  const payload = buildBudgetQuotePayload(false);
  if (!payload) {
    return;
  }

  try {
    await persistBudgetQuote('whatsapp');
    if (state.session?.role === 'client') {
      await loadClientDashboard();
    }
  } catch (error) {
    toast(error.message, 'error');
  }

  const phoneRaw = state.publicContent?.settings?.whatsapp_phone || '+51999999999';
  const phone = phoneRaw.replace(/[^\d]/g, '') || '51999999999';
  const extras = payload.features.length
    ? payload.features.map((feature) => feature.label).join(', ')
    : 'Sin extras';
  const message = [
    'Hola TISNET, quiero avanzar con este presupuesto web.',
    `Proyecto: ${payload.project.label}.`,
    `Cliente: ${payload.client.full_name}.`,
    `Correo: ${payload.client.email || 'Sin correo definido'}.`,
    `Extras: ${extras}.`,
    `Entrega: ${payload.delivery.label}.`,
    `Total estimado: ${formatCurrency(payload.total)}.`,
  ].join(' ');

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

function loadCalculatorEstimateIntoLeadForm() {
  const payload = buildBudgetQuotePayload(false);
  if (!payload || !dom.newsletterService || !dom.newsletterMessage) {
    return;
  }

  dom.newsletterService.value = payload.project.service;
  dom.newsletterName.value = dom.newsletterName.value || payload.client.full_name;
  dom.newsletterEmail.value = dom.newsletterEmail.value || payload.client.email;
  dom.newsletterMessage.value = [
    `Quiero cotizar ${payload.project.label.toLowerCase()}.`,
    payload.project.summary,
    payload.features.length
      ? `Extras seleccionados: ${payload.features.map((feature) => feature.label).join(', ')}.`
      : 'Sin extras adicionales.',
    `Entrega: ${payload.delivery.label}.`,
    `Total estimado: ${formatCurrency(payload.total)}.`,
  ].join(' ');

  showPublicSection('newsletter-section');
  setTimeout(() => {
    dom.newsletterName?.focus();
  }, 250);
  toast('Llevamos el resumen al formulario de contacto.', 'success');
}

function openQuoteDetailModal(detail) {
  if (!detail || !dom.quoteDetailModalBg) {
    return;
  }

  if (dom.quoteDetailKicker) {
    dom.quoteDetailKicker.textContent = detail.kicker || 'Detalle';
  }

  if (dom.quoteDetailTitle) {
    dom.quoteDetailTitle.textContent = detail.title || 'Detalle del servicio';
  }

  if (dom.quoteDetailDescription) {
    dom.quoteDetailDescription.textContent = detail.summary || '';
  }

  if (dom.quoteDetailBadge) {
    dom.quoteDetailBadge.textContent = detail.badge || 'Incluido';
  }

  if (dom.quoteDetailList) {
    dom.quoteDetailList.innerHTML = (detail.bullets || [])
      .map((item) => `<div class="quote-detail-item">${escapeHtml(item)}</div>`)
      .join('');
  }

  dom.quoteDetailModalBg.classList.remove('hidden');
}

function closeQuoteDetailModal(event) {
  if (!event || event.target === dom.quoteDetailModalBg) {
    dom.quoteDetailModalBg?.classList.add('hidden');
  }
}

function openQuoteModuleDetail(projectKey, moduleKey) {
  const project = PRICING_CALCULATOR.projectTypes[projectKey];
  const module = project?.modules?.find((item) => item.key === moduleKey);
  if (!project || !module) {
    return;
  }

  openQuoteDetailModal({
    kicker: project.label,
    title: module.title,
    summary: module.summary,
    badge: 'Incluido en el precio base',
    bullets: module.bullets,
  });
}

function openQuoteFeatureDetail(featureKey) {
  const feature = PRICING_CALCULATOR.features[featureKey];
  if (!feature) {
    return;
  }

  openQuoteDetailModal({
    kicker: 'Caracteristica adicional',
    title: feature.label,
    summary: feature.summary,
    badge: `Incremento ${formatCurrency(feature.price)}`,
    bullets: feature.bullets,
  });
}

function prefillService(serviceType) {
  dom.newsletterService.value = serviceType;
  scrollToNewsletter();
}

function scrollToNewsletter() {
  showPublicSection('newsletter-section');
}

function extractLocalPhone(value) {
  return String(value || '').replace(/\D/g, '').slice(-9);
}

function normalizeLocalPhone(value) {
  const digits = extractLocalPhone(value);
  if (!digits) {
    throw new Error('Ingresa un telefono de 9 digitos.');
  }
  if (digits.length !== 9) {
    throw new Error('El telefono debe tener 9 digitos.');
  }
  return digits;
}

function handlePhoneInput(event) {
  if (!event?.target) {
    return;
  }
  event.target.value = extractLocalPhone(event.target.value);
}

function selectDiagnosticStage(button) {
  const group = document.getElementById('diagnostic-stage-group');
  group.querySelectorAll('.radio-opt').forEach((item) => {
    item.classList.remove('selected');
    item.setAttribute('aria-pressed', 'false');
  });
  button.classList.add('selected');
  button.setAttribute('aria-pressed', 'true');
  dom.diagnosticStageInput.value = button.dataset.stage || 'inicio';
}

function syncDiagnosticFormFromDashboard() {
  if (!dom.diagnosticForm || !state.clientDashboard?.diagnostic) {
    return;
  }

  const diagnostic = state.clientDashboard.diagnostic;
  const summaryInput = document.getElementById('diagnostic-business-summary');
  const needInput = document.getElementById('diagnostic-primary-need');
  const goalInput = document.getElementById('diagnostic-goal');
  const stage = diagnostic.business_stage || 'inicio';

  if (summaryInput) {
    summaryInput.value = diagnostic.business_summary || '';
  }
  if (needInput) {
    needInput.value = diagnostic.primary_need || '';
  }
  if (goalInput) {
    goalInput.value = diagnostic.goal || '';
  }
  if (dom.diagnosticStageInput) {
    dom.diagnosticStageInput.value = stage;
  }

  const group = document.getElementById('diagnostic-stage-group');
  group?.querySelectorAll('.radio-opt').forEach((item) => {
    const isSelected = item.dataset.stage === stage;
    item.classList.toggle('selected', isSelected);
    item.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });
}

function openWA(message) {
  const phoneRaw = state.publicContent?.settings?.whatsapp_phone || '+51999999999';
  const phone = phoneRaw.replace(/[^\d]/g, '') || '51999999999';
  const text = encodeURIComponent('Hola TISNET, quiero más información sobre sus servicios.');
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

function openWA(message) {
  const phoneRaw = state.publicContent?.settings?.whatsapp_phone || '+51999999999';
  const phone = phoneRaw.replace(/[^\d]/g, '') || '51999999999';
  const finalText = encodeURIComponent(message || 'Hola TISNET, quiero mas informacion sobre sus servicios.');
  window.open(`https://wa.me/${phone}?text=${finalText}`, '_blank');
}

function setFeedback(element, message, stateName) {
  if (!element) {
    return;
  }
  element.textContent = message;
  element.dataset.state = stateName;
}

function toast(message, type = 'info') {
  if (!dom.toastStack) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  dom.toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add('toast-out');
    window.setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function statusLabel(status) {
  const labels = {
    new: 'Nuevo',
    contacted: 'Contactado',
    negotiating: 'Negociación',
    won: 'Ganado',
  };
  return labels[status] || capitalize(status);
}

function taskStatusLabel(status) {
  if (!status) {
    return 'Pendiente';
  }
  const labels = {
    pending: 'Pendiente',
    in_progress: 'En proceso',
    done: 'Terminada',
  };
  return labels[status] || capitalize(status.replaceAll('_', ' '));
}

function processStageLabel(stageKey) {
  const labels = {
    kickoff: 'Kickoff',
    diagnostic: 'Diagnostico',
    proposal: 'Propuesta tecnica comercial',
    execution: 'Ejecucion del proyecto',
    delivery: 'Entrega final',
  };
  return labels[stageKey] || capitalize(String(stageKey || '').replaceAll('_', ' '));
}

function feedbackStatusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    in_review: 'En revision',
    resolved: 'Resuelta',
  };
  return labels[status] || capitalize(String(status || '').replaceAll('_', ' '));
}

function badgeClassForLead(status) {
  const classes = {
    new: 'badge-new',
    contacted: 'badge-pending',
    negotiating: 'badge-active',
    won: 'badge-done',
  };
  return classes[status] || 'badge-active';
}

function badgeClassForProject(status) {
  const classes = {
    in_progress: 'badge-active',
    completed: 'badge-done',
    pending: 'badge-pending',
  };
  return classes[status] || 'badge-active';
}

function badgeClassForTask(status) {
  const classes = {
    pending: 'badge-pending',
    in_progress: 'badge-active',
    done: 'badge-done',
  };
  return classes[status] || 'badge-active';
}

function badgeClassForTaskPerformance(member) {
  if ((member?.completion_rate || 0) >= 70) {
    return 'badge-done';
  }
  if ((member?.active_tasks || 0) > 0) {
    return 'badge-active';
  }
  return 'badge-pending';
}

function taskPriorityLabel(priority) {
  const labels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };
  return labels[priority] || 'Media';
}

function serviceLabel(value) {
  const labels = {
    web: 'Página web',
    ecommerce: 'E-commerce',
    crm: 'CRM / ERP',
    branding: 'Branding',
    automation: 'Automatización',
    diagnostic: 'Diagnóstico',
    consulting: 'Consultoría',
  };
  return labels[value] || capitalize(value.replaceAll('_', ' '));
}

function formatDate(value) {
  if (!value) {
    return 'Sin fecha';
  }
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(dateValue);
}

function formatDateTime(value) {
  if (!value) {
    return 'Sin fecha';
  }
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateValue);
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(number);
}

function timeAgo(value) {
  if (!value) {
    return 'Hace un momento';
  }
  const target = new Date(value).getTime();
  const diffMs = Date.now() - target;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) {
    return 'Hace menos de una hora';
  }
  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `Hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;
}

function initials(value) {
  return (value || 'Usuario')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join('');
}

function firstName(value) {
  return (value || 'Cliente').split(' ')[0];
}

function capitalize(value) {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

window.showView = showView;
window.navigateToRoute = navigateToRoute;
window.applyRoute = applyRoute;
window.setClientTab = setClientTab;
window.setAdminTab = setAdminTab;
window.openModal = openModal;
window.switchTab = switchTab;
window.closeModalBg = closeModalBg;
window.togglePasswordVisibility = togglePasswordVisibility;
window.logout = logout;
window.openPricingCalculator = openPricingCalculator;
window.showPublicSection = showPublicSection;
window.scrollPortfolio = scrollPortfolio;
window.scrollPortfolioTo = scrollPortfolioTo;
window.loadCalculatorEstimateIntoLeadForm = loadCalculatorEstimateIntoLeadForm;
window.downloadBudgetQuote = downloadBudgetQuote;
window.sendBudgetQuoteToWhatsApp = sendBudgetQuoteToWhatsApp;
window.openAdminClientDetail = openAdminClientDetail;
window.closeAdminClientDetail = closeAdminClientDetail;
window.convertLeadToProject = convertLeadToProject;
window.updateAdminTaskAssignee = updateAdminTaskAssignee;
window.updateAdminTaskStatus = updateAdminTaskStatus;
window.updateFeedbackRequestStatus = updateFeedbackRequestStatus;
window.handleClientProcessAction = handleClientProcessAction;
window.openQuoteModuleDetail = openQuoteModuleDetail;
window.openQuoteFeatureDetail = openQuoteFeatureDetail;
window.closeQuoteDetailModal = closeQuoteDetailModal;
window.handleUserPillClick = handleUserPillClick;
window.prefillService = prefillService;
window.scrollToNewsletter = scrollToNewsletter;
window.selectDiagnosticStage = selectDiagnosticStage;
window.openWA = openWA;
window.openCaseModal = openCaseModal;
window.openClientCase = openClientCase;
window.closeCaseModal = closeCaseModal;
window.openScheduleModal = openScheduleModal;
window.closeScheduleModal = closeScheduleModal;
window.handleMobileNavAction = handleMobileNavAction;
window.closeMobileNavSheet = closeMobileNavSheet;
