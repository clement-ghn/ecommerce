'use client'

import { useState, useEffect } from 'react'
import { productsAPI, tokenManager, type Product } from '@/lib/api'


export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        fetchProducts()
        checkAdminStatus()
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        setError('')
        try {
            const data = await productsAPI.getProducts()
            setProducts(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return
        }

        try {
            await productsAPI.deleteProduct(id)
            setProducts((prev) => prev.filter((product) => product.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product')
        }
    }

    const handleEditProduct = async (id: number) => {
        const product = products.find((p) => p.id === id)
        if (!product) return

        const name = prompt('Nom du produit:', product.name)
        const description = prompt('Description du produit:', product.description || '')
        const price = parseFloat(prompt('Prix du produit:', product.price.toString()) || '')

        if (name && !isNaN(price)) {
            await productsAPI.editProduct(id, { name, description, price })
            fetchProducts()
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
                const user = await response.json()
                setIsAdmin(user.role === 'ADMIN')
            } else {
                setIsAdmin(false)
            }
        } catch (error) {
            console.error('Error checking admin status:', error)
            setIsAdmin(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-lg">Chargement des produits...</p>
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

    return (
        <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-white">
                    Nos Produits
                </h1>

                {products.length === 0 ? (
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Aucun produit disponible pour le moment.
                    </p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map(product => (
                            <div 
                                key={product.id}
                                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
                                    {product.name}
                                </h2>
                                {product.description && (
                                    <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                                        {product.description}
                                    </p>
                                )}
                                
                                {/* Prix */}
                                <div className="mb-4">
                                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                        {product.price.toFixed(2)} €
                                    </span>
                                </div>

                                {/* Boutons d'action */}
                                <div className="flex flex-col gap-2">
                                    <button className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                                        Ajouter au panier
                                    </button>
                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditProduct(product.id)} className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                                                Supprimer 
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}