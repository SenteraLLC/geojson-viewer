import * as React from 'react'
import {useState, useMemo} from 'react'

import MapGL, {Source, Layer, WebMercatorViewport, FlyToInterpolator} from 'react-map-gl'
import bbox from '@turf/bbox'

import MonacoEditor from '@uiw/react-monacoeditor'
import beautify from 'json-beautify'

import useMediaQuery from '@material-ui/core/useMediaQuery'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Paper from '@material-ui/core/Paper'

import './App.css'
import {fillStyle, strokeStyle} from './map-style.js'
import defaultGeojson from './default-geojson.js'

const MAPBOX_TOKEN = '' // Set your mapbox token here

export default function App() {
  const [selectedFeature, setSelectedFeature] = useState(undefined)
  const [geojsonData, setGeojsonData] = useState(defaultGeojson)
  const [viewport, setViewport] = useState({
    width: window.innerWidth * .6, // NOTE: this is a guess of the map width
    height: window.innerHeight,
    latitude: 42.9330972,
    longitude: -93.796779,
    zoom: 3,
    bearing: 0,
    pitch: 0
  })

  const getViewport = (viewport, feature) => {
    const [minLng, minLat, maxLng, maxLat] = bbox(feature)
    const vp = new WebMercatorViewport(viewport)
    const {longitude, latitude, zoom} = vp.fitBounds(
      [ [minLng, minLat], [maxLng, maxLat] ],
      { padding: 20 }
    )

    return {
      ...viewport,
      longitude,
      latitude,
      zoom,
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 1000
    }
  }

  const onClick = event => {
    const feature = event.features[0]
    console.log('event', event, 'feature', feature)
    if (feature) {
      setViewport(getViewport(viewport, feature))
      setSelectedFeature(feature)
    } else {
      setSelectedFeature(undefined)
    }
  }

  const onEditorChange = (newValue, e) => {
    try {
      const geojson = JSON.parse(newValue)
      setGeojsonData(geojson)
      setViewport(getViewport(viewport, geojson))
    } catch (e) {
      if (e instanceof SyntaxError) {
        setGeojsonData(undefined)
      } else {
        console.log('Error:', e, e.message)
      }
    }

  }

  const jsonStr = useMemo(() => beautify(geojsonData, null, 2, 100), [geojsonData])

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(
    () =>
    createTheme({
      palette: {
        type: prefersDarkMode ? 'dark' : 'light',
      },
    }),
    [prefersDarkMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <div>
        <div id="map">
          <MapGL
            {...viewport}
            width="100%"
            height="100%"
            mapStyle="mapbox://styles/mapbox/light-v9"
            onClick={onClick}
            onViewportChange={setViewport}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            interactiveLayerIds={['fill-style']}
          >
            { geojsonData && (
              <Source type="geojson" data={geojsonData}>
                <Layer {...fillStyle} />
                <Layer {...strokeStyle} />
              </Source>
            )}
          </MapGL>
        </div>
        <div id="panel">
          <div id="props">
            {
              Object.keys(selectedFeature?.properties || {}).map(key => (<Paper><div class="prop-value">{key} - {selectedFeature.properties[key]}</div></Paper>))
            }
          </div>
          <div id="editor">
            <MonacoEditor
              language="json"
              width="100%"
              value={jsonStr}
              onChange={onEditorChange}
              options={{
                theme: 'vs-dark',
              }}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

