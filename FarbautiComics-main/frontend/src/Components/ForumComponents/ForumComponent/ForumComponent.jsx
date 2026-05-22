import React from 'react'
import { useState } from 'react'
import PostComponent from '../PostComponent/PostComponent'
import PostFilterComponent from '../PostFilterComponent/PostFilterComponent'
import PostListComponent from '../PostListComponent/PostListComponent'
import './ForumComponent.css'

const ForumComponent = () => {

  const[selectedCategories, setSelectedCategories] = useState([])
  const[selectedTypes, setSelectedTypes] = useState([])
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className='forum-component'>
      <div className="forum-component-top">
        <PostComponent/>
      </div>
      <div className="forum-component-bottom">
          <PostFilterComponent
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}/>
          <PostListComponent
            selectedCategories={selectedCategories}
            selectedTypes={selectedTypes}
            searchTerm={searchTerm}/>
      </div>    
    </div>
  )
}

export default ForumComponent