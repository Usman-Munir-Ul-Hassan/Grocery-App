import bcrypt from "bcryptjs";

// Hash a plain-text password securely before saving to database
export async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
}

// Compare a plain-text password with the hashed password from the database
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
