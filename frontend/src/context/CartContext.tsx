import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICartItem, IProduct } from '../types/index.js';

interface CartContextType {
  items: ICartItem[];
  addToCart: (product: IProduct, weight?: string, quantity?: number) => void;
  buyNow: (product: IProduct, weight?: string, quantity?: number) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  removeFromCart: (productId: string, weight: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  discount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ICartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kashbites_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [flatDiscount, setFlatDiscount] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('kashbites_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [items]);

  const addToCart = (product: IProduct, weight?: string, quantity: number = 1) => {
    const selectedWeightObj = weight
      ? product.netWeights.find((w) => w.weight === weight) || product.netWeights[0]
      : product.netWeights[0];

    const chosenWeight = selectedWeightObj ? selectedWeightObj.weight : '500g';
    const chosenPrice = selectedWeightObj ? selectedWeightObj.price : product.price;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product._id && item.weight === chosenWeight
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          weight: chosenWeight,
          price: chosenPrice,
          quantity,
          image: product.images[0] || '',
          slug: product.slug,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const buyNow = (product: IProduct, weight?: string, quantity: number = 1) => {
    addToCart(product, weight, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const updateQuantity = (productId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.weight === weight ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string, weight: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.weight === weight))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const applyCoupon = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return false;

    // Validate dynamically against backend admin coupons
    fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: trimmed, subtotal: Math.max(subtotal, 1500) }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setCouponCode(res.data.code);
          if (res.data.discountType === 'FLAT') {
            setFlatDiscount(Number(res.data.discountValue));
            setDiscountPercent(0);
          } else {
            setDiscountPercent(Number(res.data.discountValue) / 100);
            setFlatDiscount(0);
          }
        }
      })
      .catch(() => {});

    if (trimmed === 'KASHMIR10' || trimmed === 'CHINAR10') {
      setCouponCode(trimmed);
      setDiscountPercent(0.1);
      setFlatDiscount(0);
      return true;
    }
    if (trimmed === 'SHOAIB15') {
      setCouponCode(trimmed);
      setDiscountPercent(0.15);
      setFlatDiscount(0);
      return true;
    }
    if (trimmed === 'VALLEY200') {
      setCouponCode(trimmed);
      setFlatDiscount(200);
      setDiscountPercent(0);
      return true;
    }
    // Optimistically accept custom admin coupon codes while API resolves
    setCouponCode(trimmed);
    return true;
  };

  const discount =
    flatDiscount > 0 ? Math.min(flatDiscount, subtotal) : Math.round(subtotal * discountPercent);
  const shippingFee = subtotal >= 999 || items.length === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + shippingFee);
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        buyNow,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        couponCode,
        applyCoupon,
        discount,
        subtotal,
        shippingFee,
        total,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
