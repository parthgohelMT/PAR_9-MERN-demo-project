import { useEffect, useState, type FormEvent } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import type { Product, ProductInput } from '../types'

interface ProductFormDialogProps {
  open: boolean
  product: Product | null
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (input: ProductInput) => Promise<void>
}

const emptyForm: ProductInput = { name: '', description: '', price: 0, quantity: 0 }

export default function ProductFormDialog({
  open,
  product,
  saving,
  error,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    setForm(
      product
        ? {
            name: product.name,
            description: product.description || '',
            price: Number(product.price),
            quantity: product.quantity,
          }
        : emptyForm,
    )
    setValidationError('')
  }, [product, open])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setValidationError('Product name is required.')
      return
    }
    if (!Number.isFinite(form.price) || form.price < 0) {
      setValidationError('Price must be a non-negative number.')
      return
    }
    if (!Number.isInteger(form.quantity) || form.quantity < 0) {
      setValidationError('Quantity must be a non-negative whole number.')
      return
    }

    setValidationError('')
    await onSubmit({ ...form, name: form.name.trim(), description: form.description.trim() })
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{product ? 'Edit product' : 'Add product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {(validationError || error) && (
              <Alert severity="error">{validationError || error}</Alert>
            )}
            <TextField
              autoFocus
              required
              label="Product name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              inputProps={{ maxLength: 150 }}
            />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                required
                fullWidth
                type="number"
                label="Price"
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: event.target.value === '' ? 0 : Number(event.target.value) })
                }
                inputProps={{ min: 0, step: '0.01' }}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Quantity"
                value={form.quantity}
                onChange={(event) =>
                  setForm({
                    ...form,
                    quantity: event.target.value === '' ? 0 : Number(event.target.value),
                  })
                }
                inputProps={{ min: 0, step: 1 }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
