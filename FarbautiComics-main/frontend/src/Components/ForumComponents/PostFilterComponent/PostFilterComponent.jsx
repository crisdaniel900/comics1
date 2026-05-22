import React, { useState } from 'react'
import './PostFilterComponent.css'
import { Form } from 'react-router-dom'

const PostFilterComponent = ({
  selectedCategories,
  setSelectedCategories,
  selectedTypes,
  setSelectedTypes,
  searchTerm,
  setSearchTerm
}) => {


    const handleCategoryChange = (category) => {
    setSelectedCategories((prev) => 
        prev.includes(category)
        ? prev.filter((f) => f !== category)
        : [...prev, category]
    )  
    }

    const handleTypeChange = (type) => {
    setSelectedTypes((prev) => 
        prev.includes(type)
        ? prev.filter((f) => f !== type)
        : [...prev, type]
    )  
    }

    let categories = ['Discusion', 'Recomendacion', 'Noticia', 'Reseña', 'Duda', 'Fanart'];
    let types = ['Pelicula', 'Series', 'Comic', 'Manga', 'Coleccionismo', 'Anime'];


  return (
    <div className='post-filter-background'>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}>
        <div className="post-filter-searchbar">
            <h3>Buscar</h3>
            <input type="text" placeholder='Buscar...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <hr />
        <div className="post-filter-types">
            <div className="post-filter-checkbox">
                <h3>Categoria</h3>
               {types.map((type) => (
                  <div key={type} className="filter-checkbox-option">
                    <input
                      type="checkbox"
                      id={type}
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeChange(type)}
                    />
                    <label htmlFor={type}>{type}</label>
                  </div>
                ))}
            </div>
        </div>
        <hr />
            <div className="post-filter-categories">
                <h3>Tipo</h3>
                {categories.map((category) => (
                <div className="filter-checkbox-option">
                    <input 
                    type="checkbox"
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)} />
                    <label htmlFor={category}>{category}</label>
                </div>
            ))}
        </div>
        </Form>
    </div>
  )
}

export default PostFilterComponent