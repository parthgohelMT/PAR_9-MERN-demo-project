const pool = require('../config/db')

const fields = ['name', 'description', 'price', 'quantity']

function validateProduct(body) {
  const errors = []
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const description = body.description == null ? '' : body.description
  const price = Number(body.price)
  const quantity = Number(body.quantity)

  if (!name) errors.push('Name is required.')
  if (name.length > 150) errors.push('Name must be 150 characters or fewer.')
  if (typeof description !== 'string') errors.push('Description must be a string.')
  if (!Number.isFinite(price) || price < 0) errors.push('Price must be a non-negative number.')
  if (!Number.isInteger(quantity) || quantity < 0) {
    errors.push('Quantity must be a non-negative whole number.')
  }

  return {
    errors,
    values: { name, description, price, quantity },
  }
}

function parseId(value) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

async function listProducts(_req, res, next) {
  try {
    const [products] = await pool.execute(
      'SELECT id, name, description, price, quantity, created_at FROM products ORDER BY created_at DESC, id DESC',
    )
    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
}

async function getProduct(req, res, next) {
  const id = parseId(req.params.id)
  if (!id) return res.status(400).json({ message: 'Product ID must be a positive integer.' })

  try {
    const [products] = await pool.execute(
      'SELECT id, name, description, price, quantity, created_at FROM products WHERE id = ?',
      [id],
    )
    if (products.length === 0) return res.status(404).json({ message: 'Product not found.' })
    return res.status(200).json(products[0])
  } catch (error) {
    return next(error)
  }
}

async function createProduct(req, res, next) {
  const { errors, values } = validateProduct(req.body)
  if (errors.length > 0) return res.status(400).json({ message: errors[0], errors })

  try {
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)',
      [values.name, values.description, values.price, values.quantity],
    )
    const [products] = await pool.execute(
      'SELECT id, name, description, price, quantity, created_at FROM products WHERE id = ?',
      [result.insertId],
    )
    return res.status(201).json(products[0])
  } catch (error) {
    return next(error)
  }
}

async function updateProduct(req, res, next) {
  const id = parseId(req.params.id)
  if (!id) return res.status(400).json({ message: 'Product ID must be a positive integer.' })

  const { errors, values } = validateProduct(req.body)
  if (errors.length > 0) return res.status(400).json({ message: errors[0], errors })

  try {
    await pool.execute(
      `UPDATE products SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`,
      [values.name, values.description, values.price, values.quantity, id],
    )

    const [products] = await pool.execute(
      'SELECT id, name, description, price, quantity, created_at FROM products WHERE id = ?',
      [id],
    )
    if (products.length === 0) return res.status(404).json({ message: 'Product not found.' })
    return res.status(200).json(products[0])
  } catch (error) {
    return next(error)
  }
}

async function deleteProduct(req, res, next) {
  const id = parseId(req.params.id)
  if (!id) return res.status(400).json({ message: 'Product ID must be a positive integer.' })

  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found.' })
    return res.status(204).end()
  } catch (error) {
    return next(error)
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct }
