import { StatusCodes } from 'http-status-codes'
import { supabase } from '../Utils/supabaseClient.js';
import { mapCommentRow, mapPostRow } from '../Utils/dbMappers.js';

export const addPost = async (req, res) => {
    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('username')
            .eq('id', req.user.userId)
            .single();

        if (userError) throw userError;

        const actualDate = new Date().toLocaleDateString()

        const { data, error } = await supabase
            .from('posts')
            .insert({
                title: req.body.title,
                content: req.body.content,
                image: req.body.image || '',
                author: user.username,
                type: req.body.type,
                category: req.body.category,
                postdate: actualDate,
            })
            .select('*')
            .single();

        if (error) throw error;

        const post = mapPostRow(data);
        res.status(StatusCodes.CREATED).json({ post })
        
    } catch (error) {

        res.status(StatusCodes.REQUEST_TIMEOUT).json({ msg: 'Error creating post' })
        
    }
}

export const addComment = async (req, res) => {
    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', req.user.userId)
            .single();
        if (userError) throw userError;

        const { data: post, error: postError } = await supabase
            .from('posts')
            .select('id, comments')
            .eq('id', req.params.id)
            .single();
        if (postError) throw postError;

        const { data: commentRow, error: commentError } = await supabase
            .from('comments')
            .insert({
                postid: post.id,
                userid: user.id,
                content: req.body.content,
            })
            .select('*')
            .single();

        if (commentError) throw commentError;

        const comments = [...(post.comments || []), commentRow.id];
        const { error: postUpdateError } = await supabase
            .from('posts')
            .update({ comments })
            .eq('id', post.id);

        if (postUpdateError) throw postUpdateError;

        const comment = mapCommentRow(commentRow);
        res.status(StatusCodes.CREATED).json({ comment })
        
    } catch (error) {

        res.status(StatusCodes.REQUEST_TIMEOUT).json({ error })
        
    }
}

export const getAllComment = async (req, res) => {
    try {
        const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('postid', req.params.id)
            .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        const userIds = [...new Set((commentsData || []).map((comment) => comment.userid))];
        let usersById = {};

        if (userIds.length) {
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, username')
                .in('id', userIds);

            if (usersError) throw usersError;

            usersById = Object.fromEntries((users || []).map((user) => [user.id, user.username]));
        }

        const comments = (commentsData || []).map((comment) => mapCommentRow(comment, usersById[comment.userid]));
        res.status(StatusCodes.OK).json({ comments })
        
    } catch (error) {

        res.status(StatusCodes.REQUEST_TIMEOUT).json({ msg: 'Error retrieving comments' })
        
    }
    
}

export const getAllPosts = async (req, res) => {
    try {

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const posts = (data || []).map(mapPostRow);
        res.status(StatusCodes.OK).json({ posts })
        
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ msg: 'Error retrieving posts' })
        
    }
}

export const getPost = async (req, res) => {
    try {
        const { data: postRow, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        const post = mapPostRow(postRow);
        const hasDownVoted = (post.downvotedBy || []).includes(req.user.userId);
        const hasVoted =  (post.votedBy || []).includes(req.user.userId);

     
        const postFlag ={
            ...post,
            hasVoted,
            hasDownVoted
        }
        

        res.status(StatusCodes.OK).json({ post: postFlag })
        
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND)
    }
}

export const votePost = async (req, res) => {
    try{
        const { data: post, error } = await supabase
            .from('posts')
            .select('id, votes, downvotes, voted_by, downvoted_by')
            .eq('id', req.params.id)
            .single();
        if (error) throw error;

        let votedBy = [...(post.voted_by || [])];
        let downvotedBy = [...(post.downvoted_by || [])];
        let votes = post.votes || 0;
        let downvotes = post.downvotes || 0;
        const userId = req.user.userId;

        if(downvotedBy.includes(userId)) {
            downvotedBy = downvotedBy.filter((id) => id !== userId);
            downvotes -= 1;
        }


        if(votedBy.includes(userId)){
            votes -= 1;
            votedBy = votedBy.filter((id) => id !== userId);
        }else{
            votes += 1;
            votedBy.push(userId);
        }

        const { error: updateError } = await supabase
            .from('posts')
            .update({
                votes,
                downvotes,
                voted_by: votedBy,
                downvoted_by: downvotedBy,
            })
            .eq('id', post.id);

        if (updateError) throw updateError;

        res.status(StatusCodes.OK).json({ msg: 'ok' })
        

    } catch(error){
        res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Error voting post' })

    }
}

export const downVotePost = async (req, res) => {

    try{
        const { data: post, error } = await supabase
            .from('posts')
            .select('id, votes, downvotes, voted_by, downvoted_by')
            .eq('id', req.params.id)
            .single();
        if (error) throw error;

        let votedBy = [...(post.voted_by || [])];
        let downvotedBy = [...(post.downvoted_by || [])];
        let votes = post.votes || 0;
        let downvotes = post.downvotes || 0;
        const userId = req.user.userId;

        if(votedBy.includes(userId)) {
            votedBy = votedBy.filter((id) => id !== userId);
            votes -= 1;
        }


        if(downvotedBy.includes(userId)){
            downvotes -= 1;
            downvotedBy = downvotedBy.filter((id) => id !== userId);
        }else{
            downvotes += 1;
            downvotedBy.push(userId);
        }

        const { error: updateError } = await supabase
            .from('posts')
            .update({
                votes,
                downvotes,
                voted_by: votedBy,
                downvoted_by: downvotedBy,
            })
            .eq('id', post.id);

        if (updateError) throw updateError;

        res.status(StatusCodes.OK).json({ msg: 'ok' })
        

    } catch(error){
        res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Error downvoting post' })

    }

}