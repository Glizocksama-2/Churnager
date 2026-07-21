import React from "react";

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
  label?: string;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone = "",
  message = "",
  label = "Send Alert via WhatsApp",
  className = "",
}) => {
  const formattedPhone = (phone || "").toString().replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent((message || "").toString());
  const href = `https://wa.me/${formattedPhone}?text=${encodedText}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-full text-white bg-emerald-600 hover:bg-emerald-700 transition ${className}`}
    >
      {label}
    </a>
  );
};
