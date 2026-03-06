import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js'

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email sudah dipakai' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, hashed]
    )
    const user = rows[0]
    const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role })
    await saveRefreshToken(user.id, refreshToken)
    res.status(201).json({ user, accessToken, refreshToken })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }
    const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role })
    await saveRefreshToken(user.id, refreshToken)
    const { password: _, ...safeUser } = user
    res.json({ user: safeUser, accessToken, refreshToken })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' })
    const payload = verifyRefreshToken(refreshToken)
    const { rows } = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    )
    if (!rows.length) return res.status(401).json({ message: 'Refresh token tidak valid' })
    const tokens = generateTokens({ id: payload.id, role: payload.role })
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
    await saveRefreshToken(payload.id, tokens.refreshToken)
    res.json(tokens)
  } catch {
    res.status(401).json({ message: 'Refresh token tidak valid' })
  }
}

async function saveRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  )
}