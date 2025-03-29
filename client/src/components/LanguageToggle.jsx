import { Languages } from "lucide-react";
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
		<button
		className="px-2 py-1 flex gap-1 justify-between items-center bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-100 rounded-md text-sm"
		onClick={toggleLanguage}>
			<Languages className="h-4 w-4" />
			{currentLang === "en" ? "हिंदी" : "English"}
		</button>
	);
};

export default LanguageToggle;
