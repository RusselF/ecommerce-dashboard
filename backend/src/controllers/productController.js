import pool from '../config/db.js'

export const getProducts = async (req, res) => {
  try {
    const { search, category_id, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    // Count query untuk pagination
    let countQuery = `
      SELECT COUNT(*) FROM products p WHERE 1=1
    `
    const countParams = []
    if (search) {
      countParams.push(`%${search}%`)
      countQuery += ` AND (p.name ILIKE $${countParams.length} OR p.description ILIKE $${countParams.length})`
    }
    if (category_id) {
      countParams.push(category_id)
      countQuery += ` AND p.category_id = $${countParams.length}`
    }
    const countResult = await pool.query(countQuery, countParams)

    // Main query
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    const params = []
    if (search) {
      params.push(`%${search}%`)
      query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`
    }
    if (category_id) {
      params.push(category_id)
      query += ` AND p.category_id = $${params.length}`
    }
    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const { rows } = await pool.query(query, params)

    res.json({
      products: rows,
      page: Number(page),
      limit: Number(limit),
      total: Number(countResult.rows[0].count)
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProductById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (!rows.length) return res.status(404).json({ message: 'Produk tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body
    const { rows } = await pool.query(
      'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, description, price, stock, image_url, category_id]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body
    const { rows } = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock=$4, image_url=$5, category_id=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, description, price, stock, image_url, category_id, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Produk tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id])
    if (!rows.length) return res.status(404).json({ message: 'Produk tidak ditemukan' })
    res.json({ message: 'Produk dihapus' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}