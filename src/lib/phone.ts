// Turns what people naturally type into the international format Supabase needs.
// "07700 900123" -> "+447700900123", "+44 7700 900123" -> "+447700900123".
// UK numbers starting with 0 are assumed; anything else must start with "+".
export const normalizePhone = (input: string): string | null => {
  let phone = input.replace(/[\s\-()]/g, "");

  if (phone.startsWith("00")) phone = "+" + phone.slice(2);
  else if (phone.startsWith("0")) phone = "+44" + phone.slice(1);
  else if (phone.startsWith("44")) phone = "+" + phone;

  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
};
