import { createContext, useContext, useState } from "react";
import { translations } from "./i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  const t = (path) => {
    return path.split(".").reduce(
      (obj, key) => (obj && obj[key] ? obj[key] : path),
      translations[language]
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
