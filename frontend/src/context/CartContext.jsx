import React, { createContext, useContext, useState, useEffect } from 'react';
import { useValidateCouponMutation } from '../services/orders.api.js';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
    const [validateCouponMutation] = useValidateCouponMutation();
    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem('kashbites_cart');
            return saved ? JSON.parse(saved) : [];
        }
        catch {
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
        }
        catch (e) {
            console.warn('LocalStorage error:', e);
        }
    }, [items]);

    const addToCart = (product, weight, quantity = 1) => {
        const selectedWeightObj = weight
            ? product.netWeights.find((w) => w.weight === weight) || product.netWeights[0]
            : product.netWeights[0];
        const chosenWeight = selectedWeightObj ? selectedWeightObj.weight : '500g';
        const chosenPrice = selectedWeightObj ? selectedWeightObj.price : product.price;
        setItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.productId === product._id && item.weight === chosenWeight);
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
                    price: chosenPrice,
                    weight: chosenWeight,
                    quantity,
                    image: product.primaryImage || (product.images && product.images[0]),
                    slug: product.slug,
                },
            ];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (productId, weight, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId, weight);
            return;
        }
        setItems((prev) => prev.map((item) => {
            if (item.productId === productId && item.weight === weight) {
                return { ...item, quantity };
            }
            return item;
        }));
    };

    const removeFromCart = (productId, weight) => {
        setItems((prev) => prev.filter((item) => !(item.productId === productId && item.weight === weight)));
    };

    const clearCart = () => {
        setItems([]);
    };

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const applyCoupon = (code) => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed)
            return false;
        validateCouponMutation({ code: trimmed, subtotal: Math.max(subtotal, 1500) })
            .unwrap()
            .then((res) => {
                if (res.success && res.data) {
                    setCouponCode(res.data.code);
                    if (res.data.discountType === 'FLAT') {
                        setFlatDiscount(Number(res.data.discountValue));
                        setDiscountPercent(0);
                    }
                    else {
                        setDiscountPercent(Number(res.data.discountValue) / 100);
                        setFlatDiscount(0);
                    }
                }
            })
            .catch(() => { });
        return true;
    };

    const removeCoupon = () => {
        setCouponCode('');
        setDiscountPercent(0);
        setFlatDiscount(0);
    };

    const discount = flatDiscount > 0
        ? Math.min(flatDiscount, subtotal)
        : Math.round(subtotal * discountPercent);

    const shippingFee = subtotal === 0 || subtotal >= 999 ? 0 : 99;
    const total = Math.max(0, subtotal - discount + shippingFee);
    const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const buyNow = (product, weight, quantity = 1) => {
        addToCart(product, weight, quantity);
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
    };

    return (<CartContext.Provider value={{
            items,
            isCartOpen,
            setIsCartOpen,
            isCheckoutOpen,
            setIsCheckoutOpen,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            subtotal,
            discount,
            shippingFee,
            total,
            couponCode,
            applyCoupon,
            removeCoupon,
            totalItemsCount,
            buyNow,
        }}>
      {children}
    </CartContext.Provider>);
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
