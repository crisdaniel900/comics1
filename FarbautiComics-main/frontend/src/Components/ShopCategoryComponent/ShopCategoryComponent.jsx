import React, {useContext, useMemo, useState} from 'react'
import './ShopCategoryComponent.css'
import { ShopContext } from '../../Context/ShopContext'
import Item from '../Item/Item'
import { IoIosArrowForward } from "react-icons/io";
import { Form } from 'react-router-dom';

const ShopCategoryComponent = (props) => {

    const{all_products} = useContext(ShopContext)
    const [maxProducts, setMaxProducts] = useState(15);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormats, setSelectedFormats] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const handleFormatChange = (format) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  const handlePriceChange = (field, value) => {
  setPriceRange((prev) => ({ ...prev, [field]: value }));
  };
  
    const renderBanner = () => {
      if (typeof props.banner === 'string') {
  
        return <img className='shop-category-banner-img' src={props.banner} alt="" />;
      } else {
  
        return <div className='shop-category-banner-img'>{props.banner}</div>;
      }
    };

    const filteredProducts = useMemo(() => {
      const currentCategory = String(props.category || '').trim().toLowerCase();

      return all_products
      .filter((item) => String(item.category || '').trim().toLowerCase() === currentCategory)
      .filter((item) => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((item) => selectedFormats.length > 0 ? selectedFormats.includes(item.format) : true)
      .filter((item) => {
        const price = item.price || 0;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;

      })
    }, [all_products, props.category, searchTerm, selectedFormats, priceRange])

    const handleLoadMore = () => {
      setMaxProducts(prevCount => prevCount + 10)
    }



  return (
    <div className="shop-category">
      <div className="shop-category-banner">
        {renderBanner()}
        <hr />
      </div>
      <div className="shop-category-content">
        <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}>
          <div className="shop-category-filters">
              <div className="filter-top">
                  <h3>Filtros</h3>
                  <div className="filter-search">
                    <p>Buscar</p>
                    <input type="text"
                      placeholder='Buscar por titulo'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}/>
                  </div>
              </div>

              <div className="filter-bottom">
                  <hr />
                  <h4>Formato</h4>
                  <div className="filter-checkbox">
                {['Revista', 'Tapa blanda', 'Omnibus', 'Tapa dura'].map((format) => (
                  <div key={format} className="filter-checkbox-option">
                    <input
                      type="checkbox"
                      id={format}
                      checked={selectedFormats.includes(format)}
                      onChange={() => handleFormatChange(format)}
                    />
                    <label htmlFor={format}>{format}</label>
                  </div>
                ))}
                  </div>
                  <hr />
                  <p>Rango de Precio</p>
                  <div className="filter-price-range">
                    <input
                      type="number"
                      placeholder="Desde"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                    />
                    <p>A</p>
                    <input
                      type="number"
                      placeholder="Hasta"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                    />
                  </div>
              </div>
          </div>
        </Form>

        <div className="shop-category-comics">
          {filteredProducts.length > 0 ? (
            filteredProducts.slice(0, maxProducts).map((item, i) => (
              <Item
                key={i}
                id= {item.id}
                name={item.title}
                image={item.image}
                price={item.price}
                publisher= {item.publisher} />
            ))
          ) : (
            <p className="shop-category-empty">No hay cómics para esta categoría con los filtros actuales.</p>
          )}
        </div>
      </div>
      <div className="shop-category-load-more">
        <button onClick={handleLoadMore}><IoIosArrowForward size={20}/></button>
      </div>
    </div>
  )
}

export default ShopCategoryComponent