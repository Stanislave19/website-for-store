const PHONE_DIGITS_PATTERN = /^\d{9}$/;

/** Очікує 9 цифр без "+380" (саме те, що клієнт вводить у поле після префіксу). */
export function isValidPhoneDigits(digits: string): boolean {
  return PHONE_DIGITS_PATTERN.test(digits);
}

export function toFullPhone(digits: string): string {
  return `+380${digits}`;
}
