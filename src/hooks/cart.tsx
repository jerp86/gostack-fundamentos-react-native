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

  // function sortable(lista: Product[]): Product[] {
  //   return lista.sort((a, b) => {
  //     if (a.title > b.title) {
  //       return 1;
  //     }
  //     if (a.title < b.title) {
  //       return -1;
  //     }
  //     return 0;
  //   });
  // }

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const response = await AsyncStorage.getItem(STORAGE_KEY);

      // if (response) {
      // setProducts(sortable([...JSON.parse(response)]));
      setProducts([...JSON.parse(response)]);
      // }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(prod => prod.id === product.id);
      const quantity = productExists ? productExists.quantity + 1 : 1;

      const newProductValue = { ...product, quantity };

      if (productExists) {
        // const newProducts = sortable(
        //   products.map(prod =>
        //     prod.id === product.id ? newProductValue : prod,
        //   ),
        // );
        const newProducts = products.map(prod =>
          prod.id === product.id ? newProductValue : prod,
        );
        setProducts(newProducts);
      } else {
        // const newProducts = sortable([...products, newProductValue]);
        const newProducts = [...products, newProductValue];
        setProducts(newProducts);
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      // const productIndex = products.findIndex(product => product.id === id);

      // if (productIndex >= 0) {
      //   const filterProducts = products.filter(product => product.id !== id);

      //   const newProduct = products[productIndex];
      //   newProduct.quantity += 1;

      //   const newArray = sortable([...filterProducts, newProduct]);

      //   setProducts(newArray);

      //   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newArray));
      // }
      const newProducts = products.map(prod =>
        prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod,
      );
      setProducts(newProducts);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => product.id === id);

      // if (productIndex >= 0) {

      // const newProduct = products[productIndex];

      if (products[productIndex].quantity <= 1) {
        const filterProducts = products.filter(product => product.id !== id);
        setProducts(filterProducts);

        // await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filterProducts));
      } else {
        // newProduct.quantity -= 1;

        // const newValues = sortable([...filterProducts, newProduct]);

        // setProducts(newValues);

        // await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newValues));
        const newProducts = products.map(prod =>
          prod.id === id ? { ...prod, quantity: prod.quantity - 1 } : prod,
        );
        setProducts(newProducts);
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    },
    [products],
  );

  // const addToCart = useCallback(
  //   async product => {
  //     // TODO ADD A NEW ITEM TO THE CART
  //     const productIndex = products.findIndex(p => p.id === product.id);

  //     if (productIndex < 0) {
  //       const newProduct = { ...product, quantity: 1 };
  //       setProducts(oldSate => sortable([...oldSate, newProduct]));

  //       await AsyncStorage.setItem(
  //         STORAGE_KEY,
  //         JSON.stringify(sortable([...products, newProduct])),
  //       );

  //       return;
  //     }

  //     increment(product.id);
  //   },
  //   [increment, products],
  // );

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
