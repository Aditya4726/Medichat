import React from "react";

const LanguageSelect = ({ language, setLanguage, small = false }) => {
	const languages = [
		"Assamese",
		"Awadhi",
		"Bengali",
		"Bhili",
		"Bhojpuri",
		"Bodo",
		"Chhattisgarhi",
		"Dogri",
		"English",
		"Garhwali",
		"Gondi",
		"Gujarati",
		"Haryanvi",
		"Hindi",
		"Khasi",
		"Kokborok",
		"Konkani",
		"Kumaoni",
		"Maithili",
		"Malayalam",
		"Manipuri (Meitei)",
		"Marathi",
		"Marwari",
		"Mizo",
		"Nepali",
		"Odia",
		"Punjabi",
		"Rajasthani",
		"Sanskrit",
		"Santali",
		"Sindhi",
		"Tamil",
		"Telugu",
		"Tulu",
		"Urdu",
	];

	return (
		<select
			value={language || ""}
			onChange={(e) => setLanguage(e.target.value)}
			className={`bg-neutral-800 text-white rounded-full border border-gray-600 outline-none cursor-pointer hover:bg-neutral-700 transition
        ${small ? "px-3 py-1.5 text-xs w-28" : "px-4 py-2 text-sm w-40"} 
        sm:px-4 sm:py-2 sm:text-sm sm:w-40
        md:w-48 md:text-base`}
		>
			<option value="">Select language</option>
			{languages.map((lang) => (
				<option key={lang} value={lang}>
					{lang}
				</option>
			))}
		</select>
	);
};

export default LanguageSelect;
