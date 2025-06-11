import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load numeric files (00-09)
        const numericFiles = Array.from({ length: 10 }, (_, i) => 
          import(`./json/${String(i).padStart(2, '0')}.json`)
        );

        // Load letter files (0a-0h)
        const letterFiles = Array.from({ length: 8 }, (_, i) => 
          import(`./json/0${String.fromCharCode(97 + i)}.json`)
        );

        // Load dash files (dash0-dashz)
        const dashFiles = [
          ...Array.from({ length: 10 }, (_, i) => 
            import(`./json/dash${i}.json`)
          ),
          ...Array.from({ length: 26 }, (_, i) => 
            import(`./json/dash${String.fromCharCode(97 + i)}.json`)
          )
        ];

        // Load z files (z0-zz)
        const zFiles = [
          ...Array.from({ length: 10 }, (_, i) => 
            import(`./json/z${i}.json`)
          ),
          ...Array.from({ length: 26 }, (_, i) => 
            import(`./json/z${String.fromCharCode(97 + i)}.json`)
          )
        ];

        // Load y files (y*-yz)
        const yFiles = [
          import('./json/yasterisk.json'),
          ...Array.from({ length: 26 }, (_, i) => 
            import(`./json/y${String.fromCharCode(97 + i)}.json`)
          )
        ];

        // Load special files
        const specialFiles = [
          import('./json/asteriskasterisk.json')
        ];

        // Combine all file promises
        const allFilePromises = [
          ...numericFiles,
          ...letterFiles,
          ...dashFiles,
          ...zFiles,
          ...yFiles,
          ...specialFiles
        ];

        // Load all files and handle any errors for individual files
        const results = await Promise.allSettled(allFilePromises);
        
        // Filter successful results and combine the data
        const combinedData = results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value.default)
          .flat();

        setAllData(combinedData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading JSON files:', error);
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const searchValue = value.toLowerCase();
    const results = allData.filter(item => 
      item.smdCode.toLowerCase().includes(searchValue) ||
      item.deviceName.toLowerCase().includes(searchValue) ||
      item.manufacturer.toLowerCase().includes(searchValue) ||
      item.package.toLowerCase().includes(searchValue) ||
      item.data.toLowerCase().includes(searchValue)
    );

    setSearchResults(results);

    // Update filter options based on search results
    const updateFilterOptions = () => {
      const smdCodes = [...new Set(results.map(item => item.smdCode))];
      const deviceNames = [...new Set(results.map(item => item.deviceName))];
      const manufacturers = [...new Set(results.map(item => item.manufacturer))];
      const packages = [...new Set(results.map(item => item.package))];
      const typeData = [...new Set(results.map(item => item.data))];
      const datasheets = [...new Set(results.map(item => item.datasheet))];

      // Update SMD Code filter
      const smdCodeList = document.querySelector('.filter-column:nth-child(1) .filter-options ul');
      if (smdCodeList) {
        smdCodeList.innerHTML = smdCodes.map(code => `<li>${code}</li>`).join('');
      }

      // Update Device Name filter
      const deviceNameList = document.querySelector('.filter-column:nth-child(2) .filter-options ul');
      if (deviceNameList) {
        deviceNameList.innerHTML = deviceNames.map(name => `<li>${name}</li>`).join('');
      }

      // Update Manufacturer filter
      const manufacturerList = document.querySelector('.filter-column:nth-child(3) .filter-options ul');
      if (manufacturerList) {
        manufacturerList.innerHTML = manufacturers.map(manufacturer => `<li>${manufacturer}</li>`).join('');
      }

      // Update Package filter
      const packageList = document.querySelector('.filter-column:nth-child(5) .filter-options ul');
      if (packageList) {
        packageList.innerHTML = packages.map(pkg => `<li>${pkg}</li>`).join('');
      }

      // Update Type Data filter
      const typeDataList = document.querySelector('.filter-column:nth-child(6) .filter-options ul');
      if (typeDataList) {
        typeDataList.innerHTML = typeData.map(type => `<li>${type}</li>`).join('');
      }

      // Update Datasheet filter
      const datasheetList = document.querySelector('.filter-column:nth-child(8) .filter-options ul');
      if (datasheetList) {
        datasheetList.innerHTML = datasheets.map(datasheet => `<li>${datasheet}</li>`).join('');
      }
    };

    updateFilterOptions();
  };

  return (
    <div className="App">
      <header className="header-container">
        <div className="top-bar">
          <div className="logo-section">
            {/* Placeholder for Mouser Logo */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Mouser_Electronics_logo.svg" alt="Mouser Electronics Logo" />
          </div>
          <div className="search-section">
            <input 
              type="text" 
              placeholder="Search by SMD Code, Device Name, Manufacturer..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="checkbox-section">
            <label><input type="checkbox" /> In Stock</label>
            <label><input type="checkbox" /> RoHS</label>
          </div>
          <div className="account-cart-section">
            <span>Account & Orders <i className="fas fa-caret-down"></i></span>
            <span><i className="fas fa-shopping-cart cart-icon"></i> 0</span>
          </div>
        </div>
        <nav className="nav-bar">
          <ul>
            <li><a href="#">Products</a></li>
            <li><a href="#">Manufacturers</a></li>
            <li><a href="#">Services & Tools</a></li>
            <li><a href="#">Technical Resources</a></li>
            <li><a href="#">Help</a></li>
          </ul>
        </nav>
      </header>
      <main>
        {/* Product Tabs */}
        <div className="product-tabs">
          <button className="active"><i className="fas fa-microchip"></i> Products (16,514)</button>
          <button><i className="fas fa-file-alt"></i> Datasheets</button>
          <button><i className="fas fa-image"></i> Images</button>
          <button className="new-products"><span className="new-icon">NEW</span> Newest Products</button>
        </div>
        {/* Results and Filters Section */}
        <div className="results-filters-section">
          <div className="results-info">
            Results: <span>16,514</span> |
          </div>
          <div className="smart-filtering">
            <input type="checkbox" id="smartFiltering" checked readOnly />
            <label htmlFor="smartFiltering">Smart Filtering</label> ?
          </div>
        </div>
        {/* Applied Filters Section */}
        <div className="applied-filters-section">
          Applied Filters:
          <span className="filter-tag">Semiconductors <i className="fas fa-times close-icon"></i></span>
          <span className="filter-tag">Discrete Semiconductors <i className="fas fa-times close-icon"></i></span>
          <span className="filter-tag">Transistors <i className="fas fa-times close-icon"></i></span>
          <span className="filter-tag">MOSFETs <i className="fas fa-times close-icon"></i></span>
        </div>
        {/* Filter Table Section */}
        <div className="filter-table-section">
          <div className="filter-column">
            <div className="column-header">SMD Code <i className="fas fa-angle-up scroll-indicator"></i></div>
            <div className="filter-options">
              <ul>
                <li>00**</li>
                <li>005</li>
                <li>006R</li>
              </ul>
            </div>
          </div>

          <div className="filter-column">
            <div className="column-header">Device Name <i className="fas fa-angle-up scroll-indicator"></i></div>
            <div className="filter-options">
              <ul>
                <li>AFN3400</li>
                <li>ST7400</li>
                <li>FAN7005MU</li>
                <li>PACDN006MR</li>
              </ul>
            </div>
          </div>

          <div className="filter-column">
            <div className="column-header">Manufacturer <i className="fas fa-angle-up scroll-indicator"></i></div>
            <div className="filter-options">
              <ul>
                <li>Alpha-MOS</li>
                <li>Stanson</li>
                <li>Fairchild</li>
                <li>ON</li>
              </ul>
            </div>
          </div>

          <div className="filter-column">
            <div className="column-header">Mounting Style <i className="fas fa-angle-up scroll-indicator"></i></div>
            <div className="filter-options">
              <ul>
                <li>SMD/SMT</li>
              </ul>
            </div>
          </div>

          <div className="filter-column">
            <div className="column-header">Package / Case <i className="fas fa-angle-up scroll-indicator"></i></div>
            <div className="filter-options">
              <ul>
                <li>SOT-23</li>
                <li>SOT-323</li>
                <li>MSOP-8</li>
              </ul>
            </div>
          </div>

          <div className="filter-column">
            <div className="column-header">Type Data <i className="fas fa-angle-up scroll-indicator"></i></div>
            <div className="filter-options">
              <ul>
                <li>N-Channel MOSFET</li>
                <li>Audio power amplifier</li>
                <li>ESD Protection</li>
              </ul>
            </div>
          </div>

          <div className="filter-column">
            <div className="column-header">Number of Channels <i className="fas fa-angle-up scroll-indicator"></i></div>
            <div className="filter-options">
              <ul>
                <li>1 Channel</li>
              </ul>
            </div>
          </div>

          <div className="filter-column">
            <div className="column-header">Link of Datasheet <i className="fas fa-angle-up scroll-indicator"></i></div>
            <div className="filter-options">
              <ul>
                <li>www.s-manuals.com/pdf/datasheet/a/f/afn3400_alpha-mos.pdf</li>
                <li>www.s-manuals.com/pdf/datasheet/s/t/st7400_r1_stanson.pdf</li>
                <li>www.s-manuals.com/pdf/datasheet/f/a/fan7005_fairchild.pdf</li>
                <li>www.s-manuals.com/pdf/datasheet/p/a/pacdn006_on.pdf</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Bottom Buttons */}
        <div className="bottom-buttons">
          <button className="reset-all">Reset All</button>
          <button className="apply-filters">Apply Filters</button>
        </div>
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : (
          <div className="search-results">
            {searchResults.length > 0 ? (
              <div className="results-grid">
                {searchResults.map((item, index) => (
                  <div key={index} className="result-card">
                    <h3>{item.deviceName}</h3>
                    <div className="result-details">
                      <p><strong>SMD Code:</strong> {item.smdCode}</p>
                      <p><strong>Package:</strong> {item.package}</p>
                      <p><strong>Manufacturer:</strong> {item.manufacturer}</p>
                      <p><strong>Description:</strong> {item.data}</p>
                      {item.datasheet && (
                        <a href={item.datasheet} target="_blank" rel="noopener noreferrer" className="datasheet-link">
                          View Datasheet
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="no-results">No results found for "{searchTerm}"</div>
            ) : (
              <div className="search-prompt">Enter a search term to find components</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 