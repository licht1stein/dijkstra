import { h, Fragment } from 'preact';

export function Controls({
  cities,
  startCity,
  endCity,
  shortestPath,
  wasmInfo,
  implementationChoice,
  onStartCityChange,
  onEndCityChange,
  onCalculatePath,
  onImplementationChange
}) {
  return (
    <div className="controls">
      {/* Path Selection */}
      <div className="controls__section">
        <h3 className="controls__title">Route Planning</h3>
        <div className="controls__form">
          <div className="controls__field">
            <label className="controls__label">Start City</label>
            <select
              value={startCity || ''}
              onChange={(e) => onStartCityChange(e.target.value ? parseInt(e.target.value) : null)}
              className="controls__select"
            >
              <option value="">Select start city</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          
          <div className="controls__field">
            <label className="controls__label">End City</label>
            <select
              value={endCity || ''}
              onChange={(e) => onEndCityChange(e.target.value ? parseInt(e.target.value) : null)}
              className="controls__select"
            >
              <option value="">Select end city</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={onCalculatePath}
            disabled={!startCity || !endCity}
            className={`btn btn--full ${!startCity || !endCity ? 'btn--disabled' : 'btn--success'}`}
          >
            <svg className="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Calculate Shortest Path
          </button>
        </div>
      </div>
      
      {/* Results */}
      <div className="results">
        <h3 className="results__title">Results</h3>
        <div className="results__content">
          {shortestPath ? (
            shortestPath.distance === Infinity ? (
              <p className="results__error">No path exists between selected cities</p>
            ) : (
              <Fragment>
                <p className="results__distance">
                  Total Distance: <span className="results__distance-value">{shortestPath.distance}</span>
                </p>
                <p className="results__distance">Path:</p>
                <div className="results__path">
                  {shortestPath.path.map((cityId, index) => {
                    const city = cities.find(c => c.id === cityId);
                    return (
                      <Fragment key={cityId}>
                        <span className="results__city">
                          {city?.name}
                        </span>
                        {index < shortestPath.path.length - 1 && (
                          <span className="results__arrow">→</span>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </Fragment>
            )
          ) : (
            <p className="results__placeholder">Calculate a path to see results here</p>
          )}
        </div>
      </div>
      
      {/* Implementation Choice */}
      <div className="implementation">
        <h3 className="implementation__title">Algorithm Implementation</h3>
        <div className="implementation__selector">
          <select
            value={implementationChoice}
            onChange={(e) => onImplementationChange(e.target.value)}
            className="controls__select"
          >
            <option value="auto">Auto (WASM if available)</option>
            <option value="wasm">WebAssembly</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
        <div className="implementation__status">
          <span className="implementation__label">Active:</span>
          <span className={`implementation__value ${wasmInfo.isWasmReady && implementationChoice !== 'javascript' ? 'implementation__value--wasm' : ''}`}>
            {implementationChoice === 'auto' ? wasmInfo.implementation : 
             implementationChoice === 'wasm' ? (wasmInfo.isWasmReady ? 'WebAssembly' : 'WebAssembly (fallback to JS)') :
             'JavaScript'}
            {wasmInfo.isWasmReady && implementationChoice !== 'javascript' && ' ⚡'}
          </span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="legend">
        <h3 className="legend__title">Legend</h3>
        <div className="legend__items">
          <div className="legend__item">
            <div className="legend__color legend__color--start"></div>
            <span>Start City</span>
          </div>
          <div className="legend__item">
            <div className="legend__color legend__color--end"></div>
            <span>End City</span>
          </div>
          <div className="legend__item">
            <div className="legend__color legend__color--path"></div>
            <span>Path City</span>
          </div>
          <div className="legend__item">
            <div className="legend__color legend__color--regular"></div>
            <span>Regular City</span>
          </div>
        </div>
      </div>
    </div>
  );
}