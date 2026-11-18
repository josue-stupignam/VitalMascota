export const CRYPTO_SECRET = import.meta.env.VITE_CRYPTO_SECRET || '';

if (!CRYPTO_SECRET) {
  console.warn(
    'VITE_CRYPTO_SECRET no está definido. El expediente médico no podrá cifrarse ni descifrarse.'
  );
}
