import React, { createContext, useEffect, useState} from "react"
import customFetch from "../Utils/customFetch";
import { toast } from 'react-toastify'
import { redirect} from 'react-router-dom'
import allProductSeed from '../assets/all_product'


export const ShopContext = createContext(null)

const ShopContextProvider = (props) => {

    const [all_products, setAll_Product] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 

    // Todos los productos
    const fetchAllProducts = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);  //  solo muestra spinner en la carga inicial
            const { data } = await customFetch.get('/products/allproducts');
            if (data?.products?.length > 0) {
                setAll_Product(data.products);
                return;
            }

            setAll_Product(allProductSeed.map((item) => ({
                id: String(item.id),
                title: item.name,
                category: item.category,
                image: item.image,
                price: item.price,
                publisher: item.publisher || '',
                stock: item.stock ?? 0,
                hearts: item.hearts ?? 0,
                description: item.description || '',
                format: item.format || '',
                type: item.type || '',
                artistWriter: item.artistWriter || '',
                coverArtist: item.coverArtist || '',
                language: item.language || '',
                style: item.style || '',
                genre: item.genre || '',
            })));
        } catch (error) {
            console.log(error)
            setAll_Product(allProductSeed.map((item) => ({
                id: String(item.id),
                title: item.name,
                category: item.category,
                image: item.image,
                price: item.price,
                publisher: item.publisher || '',
                stock: item.stock ?? 0,
                hearts: item.hearts ?? 0,
                description: item.description || '',
                format: item.format || '',
                type: item.type || '',
                artistWriter: item.artistWriter || '',
                coverArtist: item.coverArtist || '',
                language: item.language || '',
                style: item.style || '',
                genre: item.genre || '',
            })));
        } finally {
            if (!silent) setIsLoading(false);
        }
    };
      
    useEffect(() => {
        fetchAllProducts();
    }, []);

    // Productos populares
    const [trendingProducts, setTrendingProducts] = useState([]);

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            try {
                const {data} = await customFetch.get('/products/trending');
                setTrendingProducts(data.products);
            } catch (error){
                console.log(error)
            } 
        };
        fetchTrendingProducts();
    }, [])

    // Eliminar producto 
    const deleteProduct = async (productId) => {
        try {
            await customFetch.delete(`/products/${productId}`);
            toast.success('Product Deleted');
            await fetchAllProducts(true); // refresca sin spinner
        } catch (error) {
            toast.error(error?.response?.data?.msg);
            return error;
        }
    };

    // Agregar a Favoritos
    const addToFavorites = async (productId) => {
        try {
            await customFetch.post(`/users/addtofavorites/${productId}`)
            toast.success('Product agregado a Favoritos')
        } catch (error) {
            toast.error(error?.response?.data?.msg);
            return error
        }
    }

    const removeFavorites = async (productId) => {
        try {
            await customFetch.post(`/users/removefromfavorites/${productId}`)
            toast.success('Product removido de Favoritos')
        } catch (error) {
            toast.error(error?.response?.data?.msg);
            return error
        }
    }

    const removeRead = async (productId) => {
        try {
            await customFetch.post(`/users/removefromread/${productId}`)
            toast.success('Product removido de la Biblioteca')
        } catch (error) {
            toast.error(error?.response?.data?.msg);
            return error
        }
    }

    const removeWishlist = async (productId) => {
        try {
            await customFetch.post(`/users/removefromwishlist/${productId}`)
            toast.success('Product removido de la Lista de Deseos')
        } catch (error) {
            toast.error(error?.response?.data?.msg);
            return error
        }
    }

    // Agregar a Biblioteca
    const addToLibrary = async (productId) => {
        try {
            await customFetch.post(`/users/markasread/${productId}`)
            toast.success('Producto agregado a la Biblioteca')
        } catch (error) {
            toast.error(error?.response?.data?.msg);
            return error
        }
    }

    // Agregar a Lista de deseos
    const addToWishlist = async (productId) => {
        try {
            await customFetch.post(`/users/addtowishlist/${productId}`)
            toast.success('Producto agregado a la Lista de Deseos')
        } catch (error) {
            toast.error(error?.response?.data?.msg);
            return error
        }
    }

    // ── CARRITO ───────────────────────────────────────────────────────
    // productId = product.id (el string id del modelo, no el _id de Mongo)
    const addToCart = async (productId) => {
        try {
            await customFetch.post('/users/addtocart', { productId })
            toast.success('Producto agregado al carrito')
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Error al agregar al carrito')
            return error
        }
    }

    const votePost = async (postId) => {
        try {
            await customFetch.post(`/post/postvote/${postId}`)
        } catch(error) {
            toast.error(error?.response?.data?.msg);
            return error
        }
    }

    const downvotePost = async (postId) => {
        try {
            await customFetch.post(`/post/downvote/${postId}`)
        } catch (error) {
            toast.error(error?.response?.data?.msg);
            return error
        }
    }

    const viewProduct = async (productId) => {
        try {
            await customFetch.post(`/users/addview/${productId}`)
        } catch(error) {
            return error
        }
    }

    const contextValue = {
        all_products,
        trendingProducts,
        deleteProduct,
        isLoading,
        addToFavorites,
        addToLibrary,
        addToWishlist,
        addToCart,           // ← NUEVO
        viewProduct,
        fetchAllProducts,
        removeFavorites,
        removeRead,
        removeWishlist,
        votePost,
        downvotePost
    };

    return(
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;
