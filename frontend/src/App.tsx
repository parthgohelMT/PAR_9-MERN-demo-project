import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { getErrorMessage, productsApi } from './api/products'
import ProductFormDialog from './components/ProductFormDialog'
import type { Product, ProductInput } from './types'

interface Notice {
  message: string
  severity: 'success' | 'error'
}

function formatDate(date: string): string {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString()
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setProducts(await productsApi.list())
    } catch (error) {
      setLoadError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const openForm = (product: Product | null = null) => {
    setSelectedProduct(product)
    setFormError('')
    setFormOpen(true)
  }

  const saveProduct = async (input: ProductInput) => {
    setSaving(true)
    setFormError('')
    try {
      if (selectedProduct) {
        await productsApi.update(selectedProduct.id, input)
        setNotice({ message: 'Product updated successfully.', severity: 'success' })
      } else {
        await productsApi.create(input)
        setNotice({ message: 'Product added successfully.', severity: 'success' })
      }
      setFormOpen(false)
      await loadProducts()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteProduct) return
    setDeleting(true)
    try {
      await productsApi.remove(deleteProduct.id)
      setDeleteProduct(null)
      setNotice({ message: 'Product deleted successfully.', severity: 'success' })
      await loadProducts()
    } catch (error) {
      setNotice({ message: getErrorMessage(error), severity: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 8 }, px: 2 }}>
      <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4">Products</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Manage your product catalog
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm()}>
            Add product
          </Button>
        </Stack>

        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          {loading ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 10 }}>
              <CircularProgress />
              <Typography color="text.secondary">Loading products…</Typography>
            </Stack>
          ) : loadError ? (
            <Stack alignItems="center" spacing={2} sx={{ p: 5 }}>
              <Alert severity="error" sx={{ width: '100%' }}>{loadError}</Alert>
              <Button variant="outlined" onClick={() => void loadProducts()}>Try again</Button>
            </Stack>
          ) : products.length === 0 ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 10, px: 3 }}>
              <Inventory2OutlinedIcon color="action" sx={{ fontSize: 42 }} />
              <Typography variant="h6">No products yet</Typography>
              <Typography color="text.secondary">Add a product to get started.</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm()}>
                Add product
              </Button>
            </Stack>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow hover key={product.id}>
                      <TableCell>
                        <Typography fontWeight={600}>{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {product.id}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography noWrap color="text.secondary">
                          {product.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{Number(product.price).toFixed(2)}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell>{formatDate(product.created_at)}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton aria-label={`View ${product.name}`} onClick={() => setViewProduct(product)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton aria-label={`Edit ${product.name}`} onClick={() => openForm(product)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          aria-label={`Delete ${product.name}`}
                          onClick={() => setDeleteProduct(product)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <ProductFormDialog
        open={formOpen}
        product={selectedProduct}
        saving={saving}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={saveProduct}
      />

      <Dialog open={Boolean(viewProduct)} onClose={() => setViewProduct(null)} fullWidth maxWidth="sm">
        <DialogTitle>Product details</DialogTitle>
        <DialogContent dividers>
          {viewProduct && (
            <Stack spacing={2}>
              <Detail label="Name" value={viewProduct.name} />
              <Detail label="Description" value={viewProduct.description || '—'} />
              <Detail label="Price" value={Number(viewProduct.price).toFixed(2)} />
              <Detail label="Quantity" value={String(viewProduct.quantity)} />
              <Detail label="Created" value={formatDate(viewProduct.created_at)} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewProduct(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteProduct)} onClose={() => deleting ? undefined : setDeleteProduct(null)}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete “{deleteProduct?.name}”? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteProduct(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void confirmDelete()} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={5000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notice ? (
          <Alert onClose={() => setNotice(null)} severity={notice.severity} variant="filled">
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography>{value}</Typography>
    </Box>
  )
}
