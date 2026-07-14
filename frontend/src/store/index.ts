import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export { useAuthStore } from './authStore';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () =>
        set((state) => {
          const newDark = !state.isDark;
          document.documentElement.classList.toggle('dark', newDark);
          return { isDark: newDark };
        }),
      setDark: (dark) => {
        document.documentElement.classList.toggle('dark', dark);
        set({ isDark: dark });
      },
    }),
    { name: 'theme-storage' }
  )
);

interface SettingsState {
  language: string;
  currency: string;
  setLanguage: (lang: string) => void;
  setCurrency: (currency: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      currency: 'USD',
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'settings-storage' }
  )
);

interface CompareState {
  products: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      products: [],
      add: (id) =>
        set((state) => ({
          products: state.products.includes(id) ? state.products : state.products.length < 4 ? [...state.products, id] : state.products,
        })),
      remove: (id) => set((state) => ({ products: state.products.filter((p) => p !== id) })),
      clear: () => set({ products: [] }),
    }),
    { name: 'compare-storage' }
  )
);

interface WishlistState {
  items: string[];
  setItems: (items: string[]) => void;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      toggle: (id) =>
        set((state) => ({
          items: state.items.includes(id) ? state.items.filter((i) => i !== id) : [...state.items, id],
        })),
      has: (id) => get().items.includes(id),
    }),
    { name: 'wishlist-storage' }
  )
);

interface CartState {
  itemCount: number;
  setItemCount: (count: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  setItemCount: (itemCount) => set({ itemCount }),
}));
