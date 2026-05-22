import { StatusCodes } from 'http-status-codes'
import { randomUUID } from 'crypto';
import { supabase } from '../Utils/supabaseClient.js';
import { mapProductRow } from '../Utils/dbMappers.js';

export const getAllProducts = async (req, res) =>{
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    const products = (data || []).map(mapProductRow);
    res.status(StatusCodes.OK).json({products})
}

export const addProduct = async (req, res) =>{
    try{
        const { data: lastProduct, error: lastProductError } = await supabase
            .from('products')
            .select('product_model_id')
            .order('product_model_id', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastProductError) throw lastProductError;

        const newId = lastProduct?.product_model_id ? lastProduct.product_model_id + 1 : 1;

        const { data, error } = await supabase
            .from('products')
            .insert({
                external_id: randomUUID(),
                product_model_id: newId,
                title: req.body.title,
                price: req.body.price,
                image: req.body.image,
                image_public_id: req.body.imagePublicId,
                category: req.body.category,
                artist_writer: req.body.artistWriter,
                cover_artist: req.body.coverArtist,
                publisher: req.body.publisher,
                country_manufacture: req.body.countryManufacture,
                language: req.body.language,
                style: req.body.style,
                genre: req.body.genre,
                format: req.body.format,
                type: req.body.type,
                description: req.body.description,
                stock: req.body.stock,
                available: req.body.available ?? true,
            })
            .select('*')
            .single();

        if (error) throw error;

        const product = mapProductRow(data);
        res.status(StatusCodes.CREATED).json({ product });

    } catch (error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message })
    }
    
    
}


export const getProduct = async (req, res) =>{
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) throw error;

    const product = mapProductRow(data);
    res.status(StatusCodes.OK).json({ product })
}

export const getTrendingProducts = async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('hearts', { ascending: false })
        .limit(6);

    if (error) throw error;

    const trendingProducts = (data || []).map(mapProductRow);
    res.status(StatusCodes.OK).json({products: trendingProducts})
}

export const getRelatedProducts = async (req, res) => {
    const category = req.query.category
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category);

    if (error) throw error;

    const products = (data || []).map(mapProductRow);
    const maxIndex = products.length -1;
    const startIndex = maxIndex >= 6 ? Math.floor(Math.random() * (maxIndex - 6 + 1)) : 0;
    const finishIndex = startIndex + 6;
    let related = products.slice(startIndex, finishIndex);
    res.status(StatusCodes.OK).json({products: related});
}

export const getNewProducts = async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;

    let products = (data || []).map(mapProductRow);
    let newProducts = products.slice(1).slice(-6)
    res.status(StatusCodes.OK).json({products: newProducts});
}

export const updateProduct = async (req, res) => {
    let payload = {
        title: req.body.title,
        price: req.body.price,
        image: req.body.image,
        image_public_id: req.body.imagePublicId,
        category: req.body.category,
        artist_writer: req.body.artistWriter,
        cover_artist: req.body.coverArtist,
        publisher: req.body.publisher,
        country_manufacture: req.body.countryManufacture,
        language: req.body.language,
        style: req.body.style,
        genre: req.body.genre,
        format: req.body.format,
        type: req.body.type,
        description: req.body.description,
        stock: req.body.stock,
        available: req.body.available,
    };

    if (!req.body.image) {
        const { data: existing, error: existingError } = await supabase
            .from('products')
            .select('image')
            .eq('id', req.params.id)
            .maybeSingle();

        if (existingError) throw existingError;
        if (existing) payload.image = existing.image;
    }

    payload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

    const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', req.params.id)
        .select('*')
        .single();

    if (error) throw error;

    const updatedProduct = mapProductRow(data);

    res.status(StatusCodes.OK).json({ msg: 'product modified: ', product: updatedProduct })
}

export const deleteProduct = async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id)
        .select('*')
        .single();

    if (error) throw error;

    const removedProduct = mapProductRow(data);

    res.status(StatusCodes.OK).json({ msg: 'product deleted', product: removedProduct})
}

