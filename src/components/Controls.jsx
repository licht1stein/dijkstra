import { h, Fragment } from 'preact';

export function Controls({
  cities,
  startCity,
  endCity,
  shortestPath,
  wasmInfo,
  onStartCityChange,
  onEndCityChange,
  onCalculatePath
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
            className="btn btn--success btn--full"
          >
            <svg className="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Calculate Shortest Path
          </button>
        </div>
      </div>
      
      {/* Results */}
      {shortestPath && (
        <div className="results">
          <h3 className="results__title">Results</h3>
          {shortestPath.distance === Infinity ? (
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
          )}
        </div>
      )}
      
      {/* Performance Info */}
      <div className="performance">
        <h3 className="performance__title">Performance</h3>
        <div className="performance__info">
          <span className="performance__label">Implementation:</span>
          <span className={`performance__value ${wasmInfo.isWasmReady ? 'performance__value--wasm' : ''}`}>
            {wasmInfo.implementation}
            {wasmInfo.isWasmReady && ' ⚡'}
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