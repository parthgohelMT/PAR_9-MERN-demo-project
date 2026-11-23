export interface Product {
  id: number
  name: string
  description: string
  price: number
  quantity: number
  created_at: string
}

export interface ProductInput {
  name: string
  description: string
  price: number
  quantity: number
}
