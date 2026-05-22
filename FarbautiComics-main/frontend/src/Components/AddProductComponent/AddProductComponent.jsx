import React, { useState } from 'react'
import { PRODUCT_CATEGORY, GENRE_CATEGORY } from '../../../../Utils/Constants'
import './AddProductComponent.css'
import customFetch from '../../Utils/customFetch'
import { toast } from 'react-toastify'
import { Form, redirect, useNavigation} from 'react-router-dom'

const OTHER_VALUE = 'otros';

const buildOptions = (items) => [
  ...items.map((item) => ({ label: item, value: item })),
  { label: 'OTROS', value: OTHER_VALUE },
];

const FIELD_OPTIONS = {
  coverArtist: buildOptions(['Artista de portada', 'Ilustrador de portada', 'Portada alternativa']),
  publisher: buildOptions(['Marvel Comics', 'DC Comics', 'Image Comics', 'Dark Horse Comics', 'Viz Media']),
  countryManufacture: buildOptions(['Estados Unidos', 'Japón', 'España', 'México', 'Argentina']),
  language: buildOptions(['Español', 'Inglés', 'Japonés', 'Portugués']),
  format: buildOptions(['Revista', 'Tapa blanda', 'Omnibus', 'Tapa dura']),
  type: buildOptions(['Graphic Novel', 'Manga', 'Comic', 'Novela Gráfica']),
  style: buildOptions(['Color', 'Black and White', 'Mixto']),
  genre: buildOptions(Object.values(GENRE_CATEGORY)),
};

const FIELD_PLACEHOLDERS = {
  coverArtist: 'Escribe la portada manualmente',
  publisher: 'Escribe la editorial manualmente',
  countryManufacture: 'Escribe la región manualmente',
  language: 'Escribe el idioma manualmente',
  format: 'Escribe el formato manualmente',
  type: 'Escribe el tipo manualmente',
  style: 'Escribe el estilo manualmente',
  genre: 'Escribe el género manualmente',
};

const OTHER_FIELDS = Object.keys(FIELD_OPTIONS);

const normalizeOtherField = (formData, fieldName) => {
  const choiceKey = `${fieldName}Choice`;
  const otherKey = `${fieldName}Other`;
  const selectedValue = formData.get(choiceKey);
  const manualValue = String(formData.get(otherKey) || '').trim();

  if (selectedValue === OTHER_VALUE) {
    if (!manualValue) {
      throw new Error(`Debes escribir un valor manual para ${fieldName}`);
    }

    formData.set(fieldName, manualValue);
  } else {
    formData.set(fieldName, selectedValue);
  }

  formData.delete(choiceKey);
  formData.delete(otherKey);
};




export const action = async ({ request }) => {
  const formData = await request.formData();

  try {
    OTHER_FIELDS.forEach((fieldName) => normalizeOtherField(formData, fieldName));
  } catch (error) {
    toast.error(error.message);
    return error;
  }

  try {
    await customFetch.post('/products/addproduct', formData);
    toast.success('Producto añadido');
    return redirect('/admin/all-products');
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};



const AddProductComponent = () => {
  const [selectValues, setSelectValues] = useState(() =>
    Object.fromEntries(OTHER_FIELDS.map((fieldName) => [fieldName, FIELD_OPTIONS[fieldName][0].value]))
  );
  const [manualValues, setManualValues] = useState(() =>
    Object.fromEntries(OTHER_FIELDS.map((fieldName) => [fieldName, '']))
  );

  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const handleSelectChange = (fieldName) => (event) => {
    const value = event.target.value;
    setSelectValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));

    if (value !== OTHER_VALUE) {
      setManualValues((currentValues) => ({
        ...currentValues,
        [fieldName]: '',
      }));
    }
  };

  const handleManualChange = (fieldName) => (event) => {
    const value = event.target.value;
    setManualValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));
  };

  

  const renderOtherCombo = (fieldName, label) => {
    const hasManualInput = selectValues[fieldName] === OTHER_VALUE;

    return (
      <div className="addproduct-itemfield">
        <p>{label}</p>
        <select
          name={`${fieldName}Choice`}
          className="add-product-selector"
          value={selectValues[fieldName]}
          onChange={handleSelectChange(fieldName)}
        >
          {FIELD_OPTIONS[fieldName].map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {hasManualInput && (
          <input
            type="text"
            name={`${fieldName}Other`}
            className="add-product-other-input"
            placeholder={FIELD_PLACEHOLDERS[fieldName]}
            value={manualValues[fieldName]}
            onChange={handleManualChange(fieldName)}
          />
        )}
      </div>
    );
  };

  

  return (
      <Form method= 'post' className="add-product" encType='multipart/form-data'>
        <h1>Añadir Producto</h1>
        <div className="addproduct-container">
          <div className="addproduct-itemfield">
            <p>Titulo</p>
            <input type="text" name='title' placeholder='Type Here' />
          </div>
          <div className="addproduct-itemfield">
            <p>Precio</p>
            <input type="text" name='price' placeholder='Type Here' />
          </div>
          <div className="addproduct-itemfield">
            <p>Cantidad (Stock)</p>
            <input type="number" name='stock' placeholder='0' min='0' defaultValue='0' />
          </div>
          <div className="addproduct-itemfield">
            <p>Categoria</p>
            <select   name="category" className='add-product-selector' >
                {Object.values(PRODUCT_CATEGORY).map((itemValue) => {
                  return(
                    <option key={itemValue} value= {itemValue}>
                      {itemValue}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>
        <div className="addproduct-container">
          <div className="addproduct-itemfield">
            <p>Artista/Escritor</p>
            <input type="text" name='artistWriter' placeholder='Type Here' />
          </div>
          {renderOtherCombo('coverArtist', 'Portada')}
          {renderOtherCombo('publisher', 'Editorial')}
        </div>
        <div className="addproduct-container">
          {renderOtherCombo('countryManufacture', 'Region de Manufactura')}
          {renderOtherCombo('language', 'Idioma')}
          {renderOtherCombo('format', 'Formato')}
        </div>
        <div className="addproduct-container">
          {renderOtherCombo('type', 'Tipo')}
          {renderOtherCombo('style', 'Estilo')}
          {renderOtherCombo('genre', 'Genero')}
        </div>
        <div className="addproduct-container">
          <div className="addproduct-description">
            <p>Descripcion</p>
            <textarea type="text" name='description' />
          </div>
        </div>
        <label htmlFor="image">
            <div className="area">
              <p>Imagen</p>
              <input  type="file" name='image' id='image' accept= 'image/*'/>
            </div>
          </label>
          <button type='submit' disabled={isSubmitting}  className="addproduct-btn">{isSubmitting ? 'Adding Product...' : 'AÑADIR'}</button>
      </Form>
  )
}

export default AddProductComponent