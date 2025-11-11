import PropTypes from 'prop-types';

export function Tabs ({ categories, activeCategory, onSelect }) {
  return (
    <div className="tab-container">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`tab-button ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

Tabs.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeCategory: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};
