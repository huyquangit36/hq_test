"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Khởi tạo giỏ hàng từ localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Lỗi đọc giỏ hàng:", error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Lưu giỏ hàng vào localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.id === item.id && cartItem.size === item.size
      );

      if (existingItem) {
        // Nếu sản phẩm đã có trong giỏ, tăng số lượng
        return prevCart.map((cartItem) =>
          cartItem.id === item.id && cartItem.size === item.size
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        // Nếu chưa có, thêm sản phẩm mới
        return [...prevCart, item];
      }
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (id: string, size: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === id && item.size === size))
    );
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id && item.size === size
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCart([]);
  };

  // Tính tổng giá trị giỏ hàng
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Tính tổng số sản phẩm trong giỏ hàng
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isHydrated,
  };
}
