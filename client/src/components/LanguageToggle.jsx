import React from "react";
import { useTranslation } from "react-i18next";

const LanguageToggle = () => {
	const { i18n } = useTranslation();
	const [currentLang, setCurrentLang] = React.useState(i18n.language);

	const toggleLanguage = () => {
		const newLang = currentLang === "en" ? "hi" : "en";
		i18n.changeLanguage(newLang).then(() => {
			setCurrentLang(newLang);
		});
	};

	return (
		<button onClick={toggleLanguage}>
			{currentLang === "en" ? "हिंदी" : "English"}
		</button>
	);
};

export default LanguageToggle;
