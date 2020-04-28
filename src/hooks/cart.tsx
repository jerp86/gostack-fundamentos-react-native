import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}
const STORAGE_KEY = '@GoMarketplace:products';

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const response = await AsyncStorage.getItem(STORAGE_KEY);

      if (response) {
        const storageProducts = [...JSON.parse(response)].sort((a, b) => {
          if (a.title > b.title) {
            return 1;
          }
          return a.title < b.title ? -1 : 0;
        });

        setProducts(storageProducts);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(prod => prod.id === product.id);
      const quantity = productExists ? productExists.quantity + 1 : 1;
      const newProductValue = { ...product, quantity };

      if (productExists) {
        setProducts(
          products
            .map(p => (p.id === product.id ? newProductValue : p))
            .sort((a, b) => {
              if (a.title > b.title) {
                return 1;
              }
              return a.title < b.title ? -1 : 0;
            }),
        );
      } else {
        setProducts(
          [...products, newProductValue].sort((a, b) => {
            if (a.title > b.title) {
              return 1;
            }
            return a.title < b.title ? -1 : 0;
          }),
        );
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(
        products
          .map(product =>
            product.id === id
              ? { ...product, quantity: product.quantity + 1 }
              : product,
          )
          .sort((a, b) => {
            if (a.title > b.title) {
              return 1;
            }
            return a.title < b.title ? -1 : 0;
          }),
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(
        products
          .map(product =>
            product.id === id
              ? { ...product, quantity: product.quantity - 1 }
              : product,
          )
          .filter(product => product.quantity > 0)
          .sort((a, b) => {
            if (a.title > b.title) {
              return 1;
            }
            return a.title < b.title ? -1 : 0;
          }),
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
