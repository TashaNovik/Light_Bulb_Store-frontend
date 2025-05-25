import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }


interface CartContextType {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  cartCount: number;
  updateQuantity: (id: string, change: number) => void;
  removeItem: (id: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        // Initialize with default items immediately
        return [];
      });
    
      // Load cart from localStorage on mount (client-side only)
      useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            if (Array.isArray(parsedCart) && parsedCart.length > 0) {
              setCartItems(parsedCart);
            }
          } catch (error) {
            console.error('Error parsing saved cart:', error);
            // Keep default items if parsing fails
          }
        }
      }, []);
    
      // Save cart to localStorage whenever cartItems changes (client-side only)
      useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
      }, [cartItems]);
    
      // Calculate total cart count (sum of all quantities)
      const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

      const updateQuantity = (id: string, change: number) => {
        setCartItems(items => 
          items.map(item => 
            item.id === id 
              ? { ...item, quantity: Math.max(1, item.quantity + change) }
              : item
          )
        );
      };

      const removeItem = (id: string) => {
        setCartItems(items => items.filter(item => item.id !== id));
      };
    
      const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
        setCartItems(items => {
          const existingItem = items.find(item => item.id === newItem.id);
          if (existingItem) {
            return items.map(item => 
              item.id === newItem.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [...items, { ...newItem, quantity: 1 }];
          }
        });
      };
    
      const cartContextValue: CartContextType = {
        cartItems,
        setCartItems,
        cartCount,
        updateQuantity,
        removeItem,
        addItem
      };
    
      return (
        <CartContext.Provider value={cartContextValue}>
          {children}
        </CartContext.Provider>
      );
  };
  
  
  export const useCartContext = () => {
    const context = useContext(CartContext);
    if (!context) {
      throw new Error('CartContext must be used within CartProvider');
    }
    return context;
  };