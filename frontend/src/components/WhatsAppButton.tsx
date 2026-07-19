import React from "react";

interface WhatsAppButtonProps {
  phone?: string;
  message: string;
  label?: string;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone = "",
  message,
  label = "Send Alert via WhatsApp",
  className = "",
}) => {
  const formattedPhone = phone.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(message);
  const href = `https://wa.me/${formattedPhone}?text=${encodedText}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-full shadow-premium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition ${className}`}
    >
      {label}
    </a>
  );
};
