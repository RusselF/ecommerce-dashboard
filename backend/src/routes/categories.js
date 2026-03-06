import { Router } from 'express'
import pool from '../config/db.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY name')
  res.json(rows)
})
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description } = req.body
  const { rows } = await pool.query(
    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description]
  )
  res.status(201).json(rows[0])
})
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, description } = req.body
  const { rows } = await pool.query(
    'UPDATE categories SET name=$1, description=$2 WHERE id=$3 RETURNING *',
    [name, description, req.params.id]
  )
  res.json(rows[0])
})
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id])
  res.json({ message: 'Deleted' })
})
export default router