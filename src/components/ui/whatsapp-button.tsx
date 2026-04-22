"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = "255757222444"; // Replace with actual number
  const message = "Hello SheDoo! I'm interested in your handbags.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float group"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={32} fill="white" />
      <span className="absolute right-full mr-4 bg-black text-white text-xs py-2 px-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Need help? Chat with us!
      </span>
    </a>
  );
};

export default WhatsAppButton;
