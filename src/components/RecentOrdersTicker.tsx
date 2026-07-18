import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useProducts } from "../data/products";
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const MALE_NAMES = [
  "Rahul", "Rohit", "Mohit", "Amit", "Sumit", "Ayush", "Aarav", "Arjun", "Aditya", "Karan", 
  "Kartik", "Vivek", "Vikas", "Rohan", "Harsh", "Umesh", "Hitesh", "Ritesh", "Raunak", "Ramesh", 
  "Suresh", "Akash", "Nikhil", "Manav", "Tushar", "Yash", "Vansh", "Lavin", "Aryan", "Dhruv", 
  "Ankit", "Pranav", "Shubham", "Abhishek", "Gaurav", "Deepak", "Mayank", "Aman", "Shivam", 
  "Lakshay", "Dev", "Krish", "Nishant", "Sarthak", "Kunal", "Prince", "Ashish", "Piyush", 
  "Varun", "Sameer", "Ram", "Shyam"
];

const FEMALE_NAMES = [
  "Priya", "Sakshi", "Barkha", "Aarushi", "Ananya", "Sneha", "Neha", "Riya", "Pooja", 
  "Simran", "Muskan", "Khushi", "Aditi", "Nisha", "Kavya", "Isha", "Tanya", "Divya", 
  "Meera", "Komal", "Shreya", "Nikita"
];

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Ahmedabad", "Surat", "Chennai", 
  "Jaipur", "Kochi", "Lucknow", "Indore", "Nagpur", "Bhopal", "Nashik", "Chandigarh", 
  "Noida", "Gurugram", "Kolkata", "Goa", "pachora", "Jalgaon"
];

const PURCHASE_TIMES = [
  "Just now", "1 minute ago", "2 minutes ago", "4 minutes ago", "7 minutes ago", 
  "11 minutes ago", "18 minutes ago", "27 minutes ago", "39 minutes ago", "52 minutes ago"
];

const ACTION_PHRASES = [
  "just bought this.",
  "placed an order.",
  "purchased this item.",
  "ordered this product."
];

export function RecentOrdersTicker() {
  const { products } = useProducts();
  const location = useLocation();
  const { isCartOpen } = useShop();
  
  const [visible, setVisible] = useState(false);
  const [order, setOrder] = useState<{ 
    name: string;
    city: string; 
    productName: string; 
    productImage: string;
    actionPhrase: string;
    timeAgo: string;
  } | null>(null);

  const isHomePage = location.pathname === '/';
  const isProductPage = location.pathname.startsWith('/product');
  const shouldShow = (isHomePage || isProductPage) && !isCartOpen;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const triggerNotification = () => {
      if (products.length === 0) return;
      
      const isMale = Math.random() < 0.7;
      const name = isMale 
        ? MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)]
        : FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
        
      const randomCity = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const timeAgo = PURCHASE_TIMES[Math.floor(Math.random() * PURCHASE_TIMES.length)];
      const actionPhrase = ACTION_PHRASES[Math.floor(Math.random() * ACTION_PHRASES.length)];

      let productImage = "";
      if (randomProduct.galleryImages && randomProduct.galleryImages.length > 0) {
        productImage = randomProduct.galleryImages[0];
      } else if (randomProduct.image) {
        productImage = randomProduct.image;
      }

      setOrder({
        name,
        city: randomCity,
        productName: randomProduct.name.replace(/\s*\(.*\)\s*/g, ""),
        productImage,
        actionPhrase,
        timeAgo
      });
      
      setVisible(true);

      // Hide after 4.5 seconds
      timeoutId = setTimeout(() => {
        setVisible(false);
      }, 4500);
    };

    // First trigger after a small delay
    const initialTimeout = setTimeout(triggerNotification, 6000);

    // Set up a loop to display a new popup every 30 seconds
    const intervalFunction = () => {
      triggerNotification();
      // Schedule next notification every 30s
      intervalId = setTimeout(intervalFunction, 30000);
    };

    let intervalId = setTimeout(intervalFunction, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(timeoutId);
      clearTimeout(intervalId);
    };
  }, [products]);

  return (
    <AnimatePresence>
      {shouldShow && visible && order && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-[130px] md:bottom-6 left-4 z-[250] max-w-[320px] bg-white/80 backdrop-blur-xl border border-white/50 text-[#1B1B1B] p-2 pr-8 rounded-2xl shadow-xl flex items-center gap-3 select-none"
        >
          {order.productImage && (
            <div className="w-[60px] h-[60px] flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={order.productImage} 
                alt={order.productName} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col py-0.5">
            <p className="text-sm leading-tight text-gray-800 pr-2">
              🔥 <span className="font-bold">{order.name}</span> from <span className="font-bold">{order.city}</span> {order.actionPhrase}
            </p>
            <p className="text-xs font-medium text-gray-900 mt-1 truncate max-w-[190px]">
              {order.productName}
            </p>
            <span className="text-[10px] text-gray-500 mt-1 font-bold">
              {order.timeAgo}
            </span>
          </div>
          <button 
            onClick={() => setVisible(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 transition-colors bg-white/50 rounded-full p-0.5"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
