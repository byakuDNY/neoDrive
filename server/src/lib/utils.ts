import crypto from "crypto";

export const hashPassword = (password: string, salt: string) => {
  try {
    const hash = crypto.scryptSync(password.normalize(), salt, 64);
    return hash.toString("hex");
  } catch (error) {
    throw error;
  }
};

export const generateSalt = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const comparePassword = (
  password: string,
  hashedPassword: string,
  salt: string
) => {
  const inputHashedPassword = hashPassword(password, salt);

  return crypto.timingSafeEqual(
    Buffer.from(inputHashedPassword, "hex"),
    Buffer.from(hashedPassword, "hex")
  );
};
