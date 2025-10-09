import React, { createContext, useState, useContext, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Lấy ngôn ngữ từ localStorage hoặc mặc định là 'en'
    return localStorage.getItem("language") || "en";
  });

  useEffect(() => {
    // Lưu ngôn ngữ vào localStorage khi thay đổi
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "vi" : "en"));
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: (translations) => translations[language] || translations["en"],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
