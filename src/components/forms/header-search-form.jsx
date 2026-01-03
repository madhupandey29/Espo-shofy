'use client';
// internal
import { Search } from "@/svg";
import NiceSelect from "@/ui/nice-select";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";

const HeaderSearchForm = () => {
  const { setSearchText, setCategory, handleSubmit, handleClear, searchText } = useSearchFormSubmit();

  // selectHandle
  const selectCategoryHandle = (e) => {
    setCategory(e.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="tp-header-search-wrapper d-flex align-items-center">
        <div className="tp-header-search-box" style={{ position: 'relative', width: '100%' }}>
          <input
            onChange={(e) => {
              // Ensure full value is set without truncation
              const value = e.target.value;
              setSearchText(value);
            }}
            value={searchText || ''}
            type="text"
            placeholder="Search for Products..."
            maxLength={200}
            style={{ paddingRight: searchText ? '40px' : '40px' }}
          />
          {searchText && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: '45px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '18px',
                lineHeight: '1',
                zIndex: 10
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
       {/*  <div className="tp-header-search-category">
          <NiceSelect
            options={[
              { value: "Select Category", text: "Select Category" },
              { value: "electronics", text: "electronics" },
              { value: "fashion", text: "fashion" },
              { value: "beauty", text: "beauty" },
              { value: "jewelry", text: "jewelry" },
            ]}
            defaultCurrent={0}
            onChange={selectCategoryHandle}
            name="Select Category"
          />
        </div> */}
        <div className="tp-header-search-btn">
          <button type="submit">
            <Search />
          </button>
        </div>
      </div>
    </form>
  );
};

export default HeaderSearchForm;
