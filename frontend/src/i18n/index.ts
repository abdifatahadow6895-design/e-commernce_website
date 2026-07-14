import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        shop: 'Shop',
        categories: 'Categories',
        about: 'About',
        contact: 'Contact',
        cart: 'Cart',
        wishlist: 'Wishlist',
        profile: 'Profile',
        admin: 'Admin',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
      },
      home: {
        hero: 'Discover Premium Products',
        subtitle: 'Shop the latest trends with confidence. Fast shipping, secure payments, and exceptional service.',
        shopNow: 'Shop Now',
        featured: 'Featured Products',
        flashSales: 'Flash Sales',
        categories: 'Shop by Category',
        recommendations: 'Recommended for You',
      },
      shop: {
        title: 'Shop',
        filters: 'Filters',
        sort: 'Sort by',
        noProducts: 'No products found',
        showing: 'Showing {{count}} products',
      },
      cart: {
        title: 'Shopping Cart',
        empty: 'Your cart is empty',
        subtotal: 'Subtotal',
        checkout: 'Proceed to Checkout',
        continue: 'Continue Shopping',
        remove: 'Remove',
      },
      checkout: {
        title: 'Checkout',
        shipping: 'Shipping Address',
        payment: 'Payment Method',
        placeOrder: 'Place Order',
        orderSummary: 'Order Summary',
      },
      auth: {
        login: 'Sign In',
        register: 'Create Account',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
      },
      common: {
        search: 'Search products...',
        loading: 'Loading...',
        error: 'Something went wrong',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        viewAll: 'View All',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        outOfStock: 'Out of Stock',
        inStock: 'In Stock',
        reviews: 'Reviews',
        related: 'Related Products',
      },
    },
  },
  es: {
    translation: {
      nav: { home: 'Inicio', shop: 'Tienda', categories: 'Categorías', about: 'Acerca de', contact: 'Contacto', cart: 'Carrito', wishlist: 'Favoritos', profile: 'Perfil', admin: 'Admin', login: 'Iniciar sesión', register: 'Registrarse', logout: 'Cerrar sesión' },
      home: { hero: 'Descubre Productos Premium', subtitle: 'Compra las últimas tendencias con confianza.', shopNow: 'Comprar Ahora', featured: 'Productos Destacados', flashSales: 'Ofertas Flash', categories: 'Comprar por Categoría', recommendations: 'Recomendado para Ti' },
      common: { search: 'Buscar productos...', loading: 'Cargando...', addToCart: 'Añadir al Carrito', buyNow: 'Comprar Ahora', outOfStock: 'Agotado', inStock: 'En Stock', reviews: 'Reseñas', viewAll: 'Ver Todo' },
    },
  },
  fr: {
    translation: {
      nav: { home: 'Accueil', shop: 'Boutique', categories: 'Catégories', about: 'À propos', contact: 'Contact', cart: 'Panier', wishlist: 'Favoris', profile: 'Profil', admin: 'Admin', login: 'Connexion', register: "S'inscrire", logout: 'Déconnexion' },
      home: { hero: 'Découvrez des Produits Premium', subtitle: 'Achetez les dernières tendances en toute confiance.', shopNow: 'Acheter', featured: 'Produits Vedettes', flashSales: 'Ventes Flash', categories: 'Acheter par Catégorie', recommendations: 'Recommandé pour Vous' },
      common: { search: 'Rechercher...', loading: 'Chargement...', addToCart: 'Ajouter au Panier', buyNow: 'Acheter', outOfStock: 'Rupture de stock', inStock: 'En Stock', reviews: 'Avis', viewAll: 'Voir Tout' },
    },
  },
  sw: {
    translation: {
      nav: { home: 'Nyumbani', shop: 'Duka', categories: 'Jamii', about: 'Kuhusu', contact: 'Wasiliana', cart: 'Kikapu', wishlist: 'Orodha', profile: 'Wasifu', admin: 'Admin', login: 'Ingia', register: 'Jisajili', logout: 'Toka' },
      home: { hero: 'Gundua Bidhaa Bora', subtitle: 'Nunua mwenendo wa hivi karibuni kwa ujasiri.', shopNow: 'Nunua Sasa', featured: 'Bidhaa Maarufu', flashSales: 'Mauzo ya Haraka', categories: 'Nunua kwa Jamii', recommendations: 'Imependekezwa Kwako' },
      common: { search: 'Tafuta bidhaa...', loading: 'Inapakia...', addToCart: 'Ongeza Kikapuni', buyNow: 'Nunua Sasa', outOfStock: 'Imeisha', inStock: 'Inapatikana', reviews: 'Maoni', viewAll: 'Ona Zote' },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
