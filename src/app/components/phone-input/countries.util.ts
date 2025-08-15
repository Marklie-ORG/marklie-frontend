import { CountryCode, getCountries, getCountryCallingCode } from 'libphonenumber-js';

export interface CountryOption {
	code: CountryCode;
	name: string;
	callingCode: string; // without +
	flag: string;
}

export function countryCodeToFlagEmoji(countryCode: string): string {
	// Convert ISO country code to regional indicator symbols
	return countryCode
		.toUpperCase()
		.replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function buildCountryOptions(locale: string = 'en'): CountryOption[] {
	const blacklist: CountryCode[] = ['RU', 'IR', 'BY'] as CountryCode[];
	const all = (getCountries ? getCountries() : []) as CountryCode[];
	const countries = all.filter(code => !blacklist.includes(code));
	const displayNames = typeof (Intl as any).DisplayNames !== 'undefined'
		? new (Intl as any).DisplayNames([locale], { type: 'region' })
		: null;

	const options: CountryOption[] = countries.map(code => {
		let name = code;
		try {
			name = displayNames ? displayNames.of(code) ?? code : code;
		} catch {
			name = code;
		}
		const callingCode = getCountryCallingCode(code);
		return {
			code,
			name,
			callingCode,
			flag: countryCodeToFlagEmoji(code)
		};
	});

	// Priority order first, then others alphabetically by name
	const priorityOrder: CountryCode[] = ['US', 'NL', 'DE', 'BE', 'FR', 'GB', 'UA'];
	const rank = new Map<CountryCode, number>(priorityOrder.map((c, i) => [c, i]));

	return options.sort((a, b) => {
		const ra = rank.has(a.code) ? (rank.get(a.code) as number) : Number.POSITIVE_INFINITY;
		const rb = rank.has(b.code) ? (rank.get(b.code) as number) : Number.POSITIVE_INFINITY;
		if (ra !== rb) return ra - rb;
		return a.name.localeCompare(b.name);
	});
} 