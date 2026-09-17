export function validEmail(value:string) {
 return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
export function pageNumber(value?:string) {
 const number = Number(value);
 return Number.isSafeInteger(number) && number > 0 ? Math.min(number,100000) : 1;
}
export function emailConfigured() {
 return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}
