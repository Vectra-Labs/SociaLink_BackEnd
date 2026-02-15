import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.FILE_ENCRYPTION_KEY, "hex");

export const encryptBuffer = (buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    iv, // Prepend IV
    cipher.update(buffer),
    cipher.final(),
  ]);

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"), // Keep returning for compat but not strictly needed for storage
  };
};

export const decryptBuffer = (encryptedBuffer) => {
  // Extract IV (first 16 bytes)
  const iv = encryptedBuffer.subarray(0, 16);
  const data = encryptedBuffer.subarray(16);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  const decrypted = Buffer.concat([
    decipher.update(data),
    decipher.final(),
  ]);

  return decrypted;
};
