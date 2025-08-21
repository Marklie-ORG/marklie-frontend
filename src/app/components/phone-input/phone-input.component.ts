import { Component, EventEmitter, forwardRef, Input, Output, effect, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import parsePhoneNumberFromString, { AsYouType, CountryCode, getCountryCallingCode, MetadataJson, getExampleNumber } from 'libphonenumber-js';
import { buildCountryOptions, CountryOption } from './countries.util';
import examples from 'libphonenumber-js/examples.mobile.json';
import { ElementRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';

@Component({
	selector: 'app-phone-input',
	templateUrl: './phone-input.component.html',
	styleUrls: ['./phone-input.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => PhoneInputComponent),
			multi: true
		}
	]
})
export class PhoneInputComponent implements ControlValueAccessor, OnChanges {
	@Input() placeholder: string = 'Enter phone number';
	@Input() required: boolean = false;
	@Input() defaultCountry?: CountryCode;
	@Input() inputId?: string;

	@Output() extensionChange = new EventEmitter<string | undefined>();
	@Output() countryChange = new EventEmitter<CountryCode | undefined>();

	// control value (canonical E.164, internally we keep with '+', but emit without '+')
	private e164Value: string = '';
	// UI value (as typed/formatted)
	value: string = '';
	extensionValue?: string;
	isTouched: boolean = false;
	isDisabled: boolean = false;

	countries: CountryOption[] = buildCountryOptions(navigator?.language || 'en');
	countrySearch: string = '';
	isCountryOpen: boolean = false;
	selectedCountry?: CountryOption;

	onChange: (value: string) => void = () => {};
	onTouched: () => void = () => {};

	constructor(private hostRef: ElementRef<HTMLElement>) {
		// Try navigator.language region; do not force
		const guessed = (navigator?.language || '').split('-')[1];
		if (guessed) {
			this.setCountry(guessed.toUpperCase() as CountryCode, false);
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['defaultCountry'] && this.defaultCountry) {
			this.setCountry(this.defaultCountry, false);
		}
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		if (!this.isCountryOpen) return;
		const target = event.target as Node | null;
		if (target && !this.hostRef.nativeElement.contains(target)) {
			this.isCountryOpen = false;
		}
	}

	@HostListener('document:keydown.escape')
	onEscape() {
		if (this.isCountryOpen) this.isCountryOpen = false;
	}

	writeValue(value: string): void {
		// accept E.164 (with or without '+') or international-formatted/national numbers
		this.e164Value = '';
		this.value = '';
		if (!value) return;

		const raw = (value || '').trim();
		try {
			let parsed;
			const digitsOnly = raw.replace(/\D+/g, '');

			// Prefer treating pure digits as E.164 without '+'
			if (raw === digitsOnly && digitsOnly.length >= 6) {
				parsed = parsePhoneNumberFromString('+' + digitsOnly);
			}

			// Fallback: try with selected country context (national or international formatting)
			if (!parsed) {
				parsed = parsePhoneNumberFromString(raw, this.selectedCountry?.code);
			}

			// If still not parsed and does not start with '+', try detecting country by scanning
			if (!parsed && !raw.startsWith('+')) {
				const digitsNational = digitsOnly;
				for (const c of this.countries) {
					try {
						const p = parsePhoneNumberFromString(digitsNational, c.code as CountryCode);
						if (p && p.isValid()) { parsed = p; break; }
					} catch {}
				}
			}

			if (parsed) {
				if (parsed.country) this.setCountry(parsed.country as CountryCode, false);
				this.value = parsed.formatNational();
				this.e164Value = parsed.number; // store canonical with '+' internally
				this.extensionValue = parsed.ext;
				this.extensionChange.emit(this.extensionValue);
				return;
			}
		} catch {}
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
	}

	get isInvalid(): boolean {
		if (this.required && !this.value.trim()) return this.isTouched;
		if (!this.value.trim()) return false;
		return this.validationMessage !== '';
	}

	get validationMessage(): string {
		const raw = this.value.trim();
		if (!raw) return '';
		try {
			const parsed = parsePhoneNumberFromString(raw, this.selectedCountry?.code);
			if (!parsed) return this.buildTooGenericMessage();
			if (!parsed.isValid()) {
				const country = parsed.country || this.selectedCountry?.code;
				return this.buildCountrySpecificHint(country as CountryCode, raw);
			}
			return '';
		} catch {
			return 'Please enter a valid phone number.';
		}
	}

	private buildTooGenericMessage(): string {
		return 'Please enter a valid phone number.';
	}

	private buildCountrySpecificHint(country?: CountryCode, raw?: string): string {
		if (!country) return this.buildTooGenericMessage();
		try {
			const example = getExampleNumber(country, examples as any);
			if (example) {
				const national = example.formatNational();
				return `This looks incorrect for ${country}. Example: ${national}`;
			}
		} catch {}
		return this.buildTooGenericMessage();
	}

	private emitWithoutPlus(value: string) {
		// Ensure parent always receives a number without '+'
		this.onChange(value.replace(/^\+/, '').replace(/\+/g, ''));
	}

	setCountry(code: CountryCode, revalidate: boolean = true) {
		this.selectedCountry = this.countries.find(c => c.code === code) || this.selectedCountry;
		this.countryChange.emit(this.selectedCountry?.code);
		if (revalidate) {
			// re-run formatting gently, without blocking
			if (this.value) {
				try {
					const asYouType = new AsYouType(this.selectedCountry?.code);
					asYouType.input(this.value);
					this.value = asYouType.getNumber()?.formatNational() || asYouType.getChars();
				} catch {}
			}
		}
	}

	filteredCountries(): CountryOption[] {
		const q = this.countrySearch.trim().toLowerCase();
		if (!q) return this.countries;
		return this.countries.filter(c =>
			c.name.toLowerCase().includes(q) ||
			c.code.toLowerCase().includes(q) ||
			c.callingCode.includes(q)
		);
	}

	get maxLength(): number | null {
		try {
			if (!this.selectedCountry?.code) return null;
			const ex = getExampleNumber(this.selectedCountry.code, examples as any);
			if (!ex) return null;
			// approximate length based on example national formatting
			return ex.formatNational().length + 3; // plus a little for variations
		} catch { return null; }
	}

	handleInput(v: string) {
		// As-you-type formatting
		try {
			const typer = new AsYouType(this.selectedCountry?.code);
			this.value = typer.input(v);
		} catch {
			this.value = v;
		}
		this.propagateValue();
	}

	handlePaste(ev: ClipboardEvent) {
		const text = ev.clipboardData?.getData('text') || '';
		let normalized = text.trim();
		// Convert 00 prefix to +
		normalized = normalized.replace(/^00/, '+');
		// Remove common separators, keep + and digits and possible ext markers
		const match = normalized.match(/(\+)?[0-9() .\-\/#[xext]+/i);
		if (match) {
			ev.preventDefault();
			this.handleInput(match[0]);
		}
	}

	handleBlur() {
		this.isTouched = true;
		this.onTouched();
		// format canonical on blur if valid
		try {
			const parsed = parsePhoneNumberFromString(this.value, this.selectedCountry?.code);
			if (parsed && parsed.isValid()) {
				this.value = parsed.formatNational();
				this.e164Value = parsed.number; // E.164 with '+'
				this.extensionValue = parsed.ext;
				this.extensionChange.emit(this.extensionValue);
				this.emitWithoutPlus(this.e164Value);
			}
		} catch {}
	}

	private propagateValue() {
		// While typing, try to compute E.164; if not valid yet, pass raw (without '+') for parent display
		try {
			let parsed = parsePhoneNumberFromString(this.value, this.selectedCountry?.code);
			if (parsed) {
				// Do not change country while typing
				if (parsed.isValid()) {
					this.e164Value = parsed.number;
					this.extensionValue = parsed.ext;
					this.extensionChange.emit(this.extensionValue);
					this.emitWithoutPlus(this.e164Value);
					return;
				}
			}

			// If not valid and user input doesn't start with '+', try interpreting digits as E.164 without '+'
			const raw = (this.value || '').trim();
			if (!raw.startsWith('+')) {
				const digits = raw.replace(/\D+/g, '');
				if (digits.length >= 6) {
					try {
						const pIntl = parsePhoneNumberFromString('+' + digits);
						if (pIntl && pIntl.isValid()) {
							// Do not change country while typing
							this.e164Value = pIntl.number;
							this.extensionValue = pIntl.ext;
							this.extensionChange.emit(this.extensionValue);
							this.emitWithoutPlus(this.e164Value);
							return;
						}
					} catch {}
				}
			}

			// If still not valid, try detecting country by scanning as national numbers
			if (!raw.startsWith('+')) {
				const digits = raw.replace(/\D+/g, '');
				for (const c of this.countries) {
					try {
						const p = parsePhoneNumberFromString(digits, c.code as CountryCode);
						if (p && p.isValid()) {
							// Do not change country while typing
							this.e164Value = p.number;
							this.extensionValue = p.ext;
							this.extensionChange.emit(this.extensionValue);
							this.emitWithoutPlus(this.e164Value);
							return;
						}
					} catch {}
				}
			}
		} catch {}
		// Not valid yet => pass through current raw, so parent list stays in sync, but without '+'
		this.emitWithoutPlus(this.value);
	}
} 