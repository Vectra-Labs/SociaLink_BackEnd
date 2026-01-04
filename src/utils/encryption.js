import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.FILE_ENCRYPTION_KEY, "hex");

export const encryptBuffer = (buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final(),
  ]);

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  };
};
