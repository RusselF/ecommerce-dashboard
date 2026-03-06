import jwt from 'jsonwebtoken'

export const generateTokens = (payload) => ({
  accessToken: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }),
})

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET)
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET)