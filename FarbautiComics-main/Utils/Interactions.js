import { supabase } from './supabaseClient.js';


export const registerInteraction = async (userModel, productModel, feedbackType) =>{
    try{

        const weights = {
            favorite: 1.5,
            wishlist: 1.0,
            view: 0.5,
            read: 2.0,
            purchase: 2.0
        };

        const { data: upserted, error: upsertError } = await supabase
            .from('interactions')
            .upsert(
                {
                    userid: userModel,
                    productid: productModel,
                    read: 0,
                    favorite: 0,
                    wishlist: 0,
                    purchase: 0,
                    view: 0,
                },
                {
                    onConflict: 'userid,productid',
                    ignoreDuplicates: true,
                }
            )
            .select('*')
            .maybeSingle();

        if (upsertError) throw upsertError;

        let interaction = upserted;

        if (!interaction) {
            const { data: existing, error: existingError } = await supabase
                .from('interactions')
                .select('*')
                .eq('userid', userModel)
                .eq('productid', productModel)
                .single();

            if (existingError) throw existingError;
            interaction = existing;
        }

        if (!interaction) {
            throw new Error('Interaction row was not created or found');
        }

        // Marcar el tipo de interacción actual
        interaction[feedbackType] = 1;

        // Recalcular score sumando todos los campos activos
        let total_score = 0;
        for (const [key, weight] of Object.entries(weights)) {
            if (interaction[key] === 1) {
                total_score += weight;
            }
        }

        const score = Number(((total_score / 7.0) * 5.0).toFixed(2));

        const { error: updateError } = await supabase
            .from('interactions')
            .update({
                read: interaction.read,
                favorite: interaction.favorite,
                wishlist: interaction.wishlist,
                purchase: interaction.purchase,
                view: interaction.view,
                score,
            })
            .eq('userid', userModel)
            .eq('productid', productModel);

        if (updateError) throw updateError;

    }catch (err){

        console.error("Error al registrar la interaccion", err);
        
    }
}