import React, { useState } from 'react'
import './EditProductComponent.css'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { PRODUCT_CATEGORY, GENRE_CATEGORY } from '../../../../Utils/Constants'
import { getImageUrl } from '../../Utils/imageUrl'

const OTHER_VALUE = 'otros'

const buildOptions = (items) => [
  ...items.map((item) => ({ label: item, value: item })),
  { label: 'OTROS', value: OTHER_VALUE },
]

const FIELD_OPTIONS = {
  coverArtist: buildOptions(['Artista de portada', 'Ilustrador de portada', 'Portada alternativa']),
  publisher: buildOptions(['Marvel Comics', 'DC Comics', 'Image Comics', 'Dark Horse Comics', 'Viz Media']),
  countryManufacture: buildOptions(['Estados Unidos', 'Japón', 'España', 'México', 'Argentina']),
  language: buildOptions(['Español', 'Inglés', 'Japonés', 'Portugués']),
  format: buildOptions(['Revista', 'Tapa blanda', 'Omnibus', 'Tapa dura']),
  type: buildOptions(['Graphic Novel', 'Manga', 'Comic', 'Novela Gráfica']),
  style: buildOptions(['Color', 'Black and White', 'Mixto']),
  genre: buildOptions(Object.values(GENRE_CATEGORY)),
}

const FIELD_PLACEHOLDERS = {
  coverArtist: 'Escribe la portada manualmente',
  publisher: 'Escribe la editorial manualmente',
  countryManufacture: 'Escribe la región manualmente',
  language: 'Escribe el idioma manualmente',
  format: 'Escribe el formato manualmente',
  type: 'Escribe el tipo manualmente',
  style: 'Escribe el estilo manualmente',
  genre: 'Escribe el género manualmente',
}

const OTHER_FIELDS = Object.keys(FIELD_OPTIONS)

const getInitialSelection = (value, fieldName) => {
  if (!value) return FIELD_OPTIONS[fieldName][0].value
  return FIELD_OPTIONS[fieldName].some((option) => option.value === value) ? value : OTHER_VALUE
}

const EditProductComponent = ({ product, onProductUpdated }) => {
  const navigate = useNavigate()

  const imageUrl = getImageUrl(product.image)

  const initialSelections = Object.fromEntries(
    OTHER_FIELDS.map((fieldName) => [fieldName, getInitialSelection(product[fieldName], fieldName)])
  )

  const initialManualValues = Object.fromEntries(
    OTHER_FIELDS.map((fieldName) => [fieldName, initialSelections[fieldName] === OTHER_VALUE ? (product[fieldName] || '') : ''])
  )

  const [formData, setFormData] = useState({
    title:              product.title              || '',
    price:              product.price              ?? '',
    stock:              product.stock              ?? 0,
    category:           product.category           || '',
    artistWriter:       product.artistWriter        || '',
    coverArtist:        product.coverArtist         || '',
    publisher:          product.publisher           || '',
    countryManufacture: product.countryManufacture  || '',
    language:           product.language            || '',
    format:             product.format              || '',
    style:              product.style               || '',
    genre:              product.genre               || '',
    type:               product.type               || '',
    description:        product.description         || '',
  })

  const [fieldSelections, setFieldSelections] = useState(initialSelections)
  const [fieldManualValues, setFieldManualValues] = useState(initialManualValues)

  const [previewImage, setPreviewImage] = useState(null)
  const [imageFile, setImageFile]       = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleComboChange = (fieldName) => (event) => {
    const value = event.target.value

    setFieldSelections((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }))

    setFormData((currentValues) => ({
      ...currentValues,
      [fieldName]: value === OTHER_VALUE ? '' : value,
    }))

    if (value !== OTHER_VALUE) {
      setFieldManualValues((currentValues) => ({
        ...currentValues,
        [fieldName]: '',
      }))
    }
  }

  const handleManualChange = (fieldName) => (event) => {
    const value = event.target.value

    setFieldManualValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }))

    setFormData((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }))
  }

  const renderComboField = (fieldName, label) => {
    const isOtherSelected = fieldSelections[fieldName] === OTHER_VALUE

    return (
      <div className="edit-product-itemfield">
        <p>{label}</p>
        <select
          name={`${fieldName}Choice`}
          className="add-product-selector"
          value={fieldSelections[fieldName]}
          onChange={handleComboChange(fieldName)}
        >
          {FIELD_OPTIONS[fieldName].map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {isOtherSelected && (
          <input
            type="text"
            name={fieldName}
            className="edit-product-other-input"
            placeholder={FIELD_PLACEHOLDERS[fieldName]}
            value={fieldManualValues[fieldName]}
            onChange={handleManualChange(fieldName)}
          />
        )}
      </div>
    )
  }

  const handleFormatToggle = (value) => (event) => {
    const checked = event.target.checked
    setFormatSelections((current) => {
      if (checked) return [...current, value]
      return current.filter((v) => v !== value)
    })
  }

  

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([key, val]) => payload.append(key, val))
      OTHER_FIELDS.forEach((fieldName) => {
        payload.set(fieldName, formData[fieldName])
      })
      if (imageFile) {
        payload.append('image', imageFile)
      } else {
        payload.append('image', product.image || '')
      }

      await customFetch.patch(`/products/${product._id}`, payload)
      toast.success('Producto actualizado')
      if (onProductUpdated) onProductUpdated()
      navigate('/admin/all-products')
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Error al actualizar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="edit-product">
      <div className="edit-product-image">
        <img
          src={previewImage || imageUrl}
          alt={product.title}
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <label htmlFor="file-input">
          <div className="edit-area">
            <input
              type="file"
              name="image"
              id="file-input"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </label>
      </div>

      <div className="edit-product-elements">
        <h1>Editar Producto</h1>
        <form onSubmit={handleSubmit}>

          <div className="edit-product-container">
            <div className="edit-product-itemfield">
              <p>Titulo</p>
              <input type="text" name="title" value={formData.title} onChange={handleChange} />
            </div>
            <div className="edit-product-itemfield">
              <p>Precio</p>
              <input type="number" name="price" value={formData.price} onChange={handleChange} />
            </div>
            <div className="edit-product-itemfield">
              <p>Cantidad (Stock)</p>
              <input type="number" name="stock" value={formData.stock} min="0" onChange={handleChange} />
            </div>
            <div className="edit-product-itemfield">
              <p>Categoria</p>
              <select name="category" className="add-product-selector" value={formData.category} onChange={handleChange}>
                {Object.values(PRODUCT_CATEGORY).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="edit-product-container">
            <div className="edit-product-itemfield">
              <p>Artista/Escritor</p>
              <input type="text" name="artistWriter" value={formData.artistWriter} onChange={handleChange} />
            </div>
            {renderComboField('coverArtist', 'Portada')}
          </div>

          <div className="edit-product-container">
            {renderComboField('publisher', 'Editorial')}
            {renderComboField('countryManufacture', 'Region de Manufactura')}
          </div>

          <div className="edit-product-container">
            {renderComboField('language', 'Idioma')}
            {renderComboField('format', 'Formato')}
          </div>

          <div className="edit-product-container">
            {renderComboField('style', 'Estilo')}
            {renderComboField('genre', 'Genero')}
            {renderComboField('type', 'Tipo')}
          </div>

          <div className="edit-product-container">
            <div className="edit-product-description">
              <p>Descripcion</p>
              <input type="text" name="description" value={formData.description} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="edit-product-btn" disabled={isSubmitting}>
            {isSubmitting ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditProductComponent
