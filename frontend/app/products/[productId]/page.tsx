'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productsAPI, tokenManager, type Product } from '@/lib/api'

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const productId = Number(params.productId)

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        if (productId) {
            fetchProduct()
            checkAdminStatus()
        }
    }, [productId])

    const fetchProduct = async () => {
        setLoading(true)
        setError('')
        try {
            const data = await productsAPI.getProductById(productId)
            setProduct(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch product')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteProduct = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            return
        }
        try {
            await productsAPI.deleteProduct(productId)
            router.push('/products')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product')
        }   
    }

    const handleEditProduct = async () => {
        if (!product) return    
        const name = prompt('Nom du produit:', product.name)
        const description = prompt('Description du produit:', product.description || '')
        const price = parseFloat(prompt('Prix du produit:', product.price.toString()) || '')
        if (name && !isNaN(price)) {
            await productsAPI.editProduct(productId, { name, description, price })
            fetchProduct()
        }
    }
    const checkAdminStatus = async () => {
        const token = tokenManager.getToken()   
        if (!token) {
            setIsAdmin(false)
            return
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setIsAdmin(data.role === 'admin')
            } else {
                setIsAdmin(false)
            }
        } catch (error) {
            setIsAdmin(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-lg">Chargement du produit...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-lg text-red-600">{error}</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-lg">Produit non trouvé</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
            <div className="mx-auto max-w-4xl">
                <button 
                    onClick={() => router.push("/products")}
                    className="mb-6 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                    ← Retour
                </button>

                <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-white">
                        {product.name}
                    </h1>
                    
                    {product.description && (
                        <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400">
                            {product.description}
                        </p>
                    )}

                    <div className="mb-6">
                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                            {product.price.toFixed(2)} €
                        </span>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 rounded-md bg-zinc-900 px-6 py-3 text-lg font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                            Ajouter au panier
                        </button>
                    </div>

                    {isAdmin && (
                        <div className="mt-6 flex gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                            <button
                                onClick={handleEditProduct}
                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Modifier
                            </button>
                            <button
                                onClick={handleDeleteProduct}
                                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}