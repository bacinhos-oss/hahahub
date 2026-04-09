export type Page = 'landing' | 'login' | 'discovery' | 'upload' | 'admin' | 'subscription'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'producer'
  isPaid: boolean
  subscriptionExpiry?: string
  favorites: string[]
  uploadedShowIds: string[]
}

export interface Show {
  id: string
  title: string
  author: string
  director?: string
  synopsis?: string
  genre: string
  language: string
  location: string
  duration: number
  maleRoles: number
  femaleRoles: number
  imageUrl?: string
  producerName: string
  producerEmail: string
  rightsHolder: string
  licenseType: string
  licensingModel: string
  royaltyRange?: string
  rightsStatus: string
  likesCount: number
  viewsCount: number
  productionYear: number
  createdAt?: string
}
