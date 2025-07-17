import * as React from 'react';
import {Map, Marker, Popup, TileLayer, Polyline, CircleMarker, Tooltip} from 'react-leaflet';
import {Location, Data} from '~/components/Map';
import { ScaleControl } from 'react-leaflet' 
import * as L from "leaflet";

interface MapDetailProps {
    locations: Location[][],
    selectedLocation: Location,
    path: number[][][],
    locsProbeLevelData: Data[][],
    changeLocation: (location: Location) => void,
    changeType: (type: string) => void
}

class MapDetail extends React.PureComponent<MapDetailProps, null> {
    constructor(props) {
        super(props);
    }

    handleClickAvailable = event => {
        var coords = [event.latlng.lat, event.latlng.lng];
        const {locations} = this.props;
        for (var i = 0; i < locations[0].length; i++) {
            if (locations[0][i].coordinates[0] == coords[0] && locations[0][i].coordinates[1] == coords[1]) {
                this.props.changeLocation(locations[0][i]);
                break;
            }
        }
    };

    handleClickUnavailable = event => {
        var coords = [event.latlng.lat, event.latlng.lng];
        const {locations} = this.props;
        for (var i = 0; i < locations[1].length; i++) {
            if (locations[1][i].coordinates[0] == coords[0] && locations[1][i].coordinates[1] == coords[1]) {
                this.props.changeType("");
                this.props.changeLocation(locations[1][i]);
                break;
            }
        }
    };

    createIcon(url) {
        // console.log("create icon")
        return new L.Icon({
            iconUrl: url,
            iconSize: [30, 35]
        });
    }

    getMarkerIcon(index) {
        // console.log("get marker icon")
        if (index == 0)
            return this.createIcon("../public/images/marker-icon-0.png");
        if (index == 1)
            return this.createIcon("../public/images/marker-icon-1.png");
        if (index == 2)
            return this.createIcon("../public/images/marker-icon-2.png");
        if (index == -1)
            return this.createIcon("../public/images/marker-icon.png");
    }

    renderPath() {
        const {path} = this.props;
        if (path == null) {
            return null;
        }
        return (
            path.map(locs => {
                    return (
                        <>
                            <Polyline weight={5} positions={locs} dashArray={"20"} />
                            <CircleMarker radius={6} fillOpacity={1} center={locs[0]} />
                        </>
                    )
                })
        );
    }
    
    render(): React.ReactNode {
        const {locations, locsProbeLevelData, selectedLocation} = this.props;
        return (
            <Map center={[43.268383, -79.920265]} zoom={8}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                {/* marker change */}
                {locsProbeLevelData[0].length == 0 && locsProbeLevelData[1].length == 0 && locsProbeLevelData[2].length == 0 && locsProbeLevelData[3].length == 0
                    // ? <Alert severity="info">Data will refresh every 5 sec</Alert>
                    // : <Translation></Translation> }
                    // if all are empty, render as before
                    ? <>{locations[0].map(loc => {
                        // console.log(loc.id)
                        if (loc == null) return null;
                        // Ignore GPS disabled devices
                        if (loc.coordinates[0] == 43 && loc.coordinates[1] == -79) return null;
                        return (
                            <Marker key={loc.id} position={loc.coordinates} title={loc.name} onClick={this.handleClickAvailable} icon={this.getMarkerIcon(-1)}>
                                <Popup>
                                    {/* the info after clicking marker */}
                                    #{loc.id} {loc.name}<br/>
                                    {loc.coordinates[0]},{loc.coordinates[1]}<br/>
                                    {/* {loc.value}<br/> */}
                                    {/* {loc.level} */}
                                </Popup>
                                <Tooltip>{loc.name}</Tooltip>
                            </Marker>
                        );
                    })}</>

                    // else(a probe is selected), render with colour code
                    :<>
                {/* low level */}
                {locsProbeLevelData[0].map(loc => {
                    // console.log(loc.id)
                    if (loc == null) return null;
                    // Ignore GPS disabled devices
                    if (loc.coordinates[0] == 43 && loc.coordinates[1] == -79) return null;
                    return (
                        <Marker key={loc.id} position={loc.coordinates} title={loc.name} onClick={this.handleClickAvailable} icon={this.getMarkerIcon(loc.level)}>
                            <Popup>
                                {/* the info after clicking marker */}
                                #{loc.id} {loc.name}<br/>
                                {loc.coordinates[0]},{loc.coordinates[1]}<br/>
                                value = {loc.value}<br/>
                                level: low 
                                {/* {loc.level} */}
                            </Popup>
                            <Tooltip>{loc.name}</Tooltip>
                        </Marker>
                    );
                })}
                {/* mid level */}
                {locsProbeLevelData[1].map(loc => {
                    // console.log(loc.id)
                    if (loc == null) return null;
                    // Ignore GPS disabled devices
                    if (loc.coordinates[0] == 43 && loc.coordinates[1] == -79) return null;
                    return (
                        <Marker key={loc.id} position={loc.coordinates} title={loc.name} onClick={this.handleClickAvailable} icon={this.getMarkerIcon(loc.level)}>
                            <Popup>
                                {/* the info after clicking marker */}
                                #{loc.id} {loc.name}<br/>
                                {loc.coordinates[0]},{loc.coordinates[1]}<br/>
                                value = {loc.value}<br/>
                                level: mid
                                {/* {loc.level} */}
                            </Popup>
                            <Tooltip>{loc.name}</Tooltip>
                        </Marker>
                    );
                })}
                {/* high level */}
                {locsProbeLevelData[2].map(loc => {
                    // console.log(loc.id)
                    if (loc == null) return null;
                    // Ignore GPS disabled devices
                    if (loc.coordinates[0] == 43 && loc.coordinates[1] == -79) return null;
                    return (
                        <Marker key={loc.id} position={loc.coordinates} title={loc.name} onClick={this.handleClickAvailable} icon={this.getMarkerIcon(loc.level)}>
                            <Popup>
                                {/* the info after clicking marker */}
                                #{loc.id} {loc.name}<br/>
                                {loc.coordinates[0]},{loc.coordinates[1]}<br/>
                                value = {loc.value}<br/>
                                level: high
                                {/* {loc.level} */}
                            </Popup>
                            <Tooltip>{loc.name}</Tooltip>
                        </Marker>
                    );
                })}
                {/* No such probe data, grey out */}
                {locsProbeLevelData[3].map(loc => {
                    // console.log(loc.id)
                    if (loc == null) return null;
                    // Ignore GPS disabled devices
                    if (loc.coordinates[0] == 43 && loc.coordinates[1] == -79) return null;
                    return (
                        <Marker key={loc.id} position={loc.coordinates} title={loc.name} onClick={this.handleClickAvailable} icon={this.getMarkerIcon(-1)} opacity={0.3}>
                            <Popup>
                                {/* the info after clicking marker */}
                                #{loc.id} {loc.name}<br/>
                                {loc.coordinates[0]},{loc.coordinates[1]}
                            </Popup>
                            <Tooltip>{loc.name}</Tooltip>
                        </Marker>
                    );
                })}
                </>
            }
                {this.renderPath()}
                <ScaleControl position={"bottomleft"} />
            </Map>
        );
    }
}

export default MapDetail;
