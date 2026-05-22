import React, { useState, useEffect} from 'react'
import './PostListComponent.css'
import { CgProfile } from "react-icons/cg";
import { GiMagicAxe } from "react-icons/gi";
import { GiBrokenAxe } from "react-icons/gi";
import { GiRuneStone } from "react-icons/gi";
import customFetch from '../../../Utils/customFetch';
import { useActionData} from 'react-router-dom';
import { Link } from 'react-router-dom'


const PostListComponent = ({
  selectedCategories,
  selectedTypes,
  searchTerm
}) => {

    const actionData = useActionData();
    const [all_posts, setAll_Posts] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 

        //Todos los posts

          const fetchAllPosts = async () => {
            try {
              setIsLoading(true);
              const { data } = await customFetch.get('/post/allposts');
              setAll_Posts(data.posts);
            } catch (error) {
                console.log(error)
            } finally {
              setIsLoading(false); 
            }
          };
      
        useEffect(() => {
          fetchAllPosts();
        }, []);

        useEffect(() => {
        if (actionData?.reload){
            fetchAllPosts();
        }
        }, [actionData])

        const filteredPosts = all_posts.filter((post) => {
          const matchesCategory =
            selectedCategories.length === 0 || selectedCategories.includes(post.category);
          const matchesType =
            selectedTypes.length === 0 || selectedTypes.includes(post.type)
          const matchesSearch =
            searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase());

          return matchesCategory && matchesType && matchesSearch;
        })

        all_posts.forEach(post => {
  console.log({
    title: post.title,
    type: post.type,
    category: post.category,
    matchesCategory: selectedCategories.includes(post.category),
    matchesType: selectedTypes.includes(post.type)
  });
});

        

  return (
    <div className="post-list-component-background">
        {filteredPosts.map((post) => {
            return<Link key={post._id} style={{textDecoration: 'none', color: 'black'}}  to={`/post/${post._id}`}><div  className="post-list-item" >
            <div className="post-item-header">
                <h1>{post.title}</h1>
                <div className="post-item-author">
                    <CgProfile size={25}/>
                    <h4>{post.author}</h4>
                </div>
            </div>
            <div className="post-item-content">
                <p>{post.content}</p>
            </div>
            <div className="post-item-specs">
                <h4>{post.postDate}</h4>
                <div className="post-item-feedback">
                    <div className="post-item-feedback-container">
                        <GiMagicAxe size={25}/>
                        <h4>{post.votes}</h4>
                        <GiBrokenAxe size={25}/>
                        <h4>{post.downvotes}</h4>
                    </div>
                    <div className="post-item-feedback-container">
                        <GiRuneStone size={25}/>
                        <h4>{post.comments.length}</h4>
                    </div>
                </div>
            </div>
        </div></Link>
        })}
 
    </div>
  )
}

export default PostListComponent
