import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * 哈希用户密码(用于用户登录密码)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 验证用户密码
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

