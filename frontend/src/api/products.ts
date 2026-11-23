import axios from 'axios'
import type { Product, ProductInput } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

export const productsApi = {
  async list(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products')
    return response.data
  },
  async get(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`)
    return response.data
  },
  async create(product: ProductInput): Promise<Product> {
    const response = await api.post<Product>('/products', product)
    return response.data
  },
  async update(id: number, product: ProductInput): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, product)
    return response.data
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/products/${id}`)
  },
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || 'The request failed.'
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}
