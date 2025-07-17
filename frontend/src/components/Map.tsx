import {withStyles} from '@material-ui/core/styles';
import * as React from 'react';
import Menu from '~/components/Menu';
import MapDetail from '~/components/MapDetail';
import SensorTable from '~/components/SensorTable';
import styles from '~/style/sensor-select-style';
import { Translation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Snackbar, { SnackbarOrigin } from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import config from "../config/config"

const api_url = config.api;

export interface Location {
    id: string,
    name: string,
    coordinates: [number, number]
}
export interface Data {
    id: string,
    name: string,
    coordinates: [number, number],
    time: string,
    value: number,
    level: number
}

interface MapState {
    selectedType: string,
    selectedLocation: Location,
    path: number[][][],
    locations: Location[][],
    allLocations: Location[],
    types: string[][],
    allTypes: string[],
    open: boolean,
    snackbarmsg: string,
    locsProbeLevelData: Data[][],
    selectedDuration: string,
    selectedYear: string,
    selectedMonth: string,
    selectedDay: string,
    dateArr: Number[],
    startTime: string[],
    endTime: string[],
    isGenerate: boolean,
    nodes: Location[]
}

class Map extends React.PureComponent<any, MapState> {
    
    constructor(props) {
        super(props);
        this.state = {
            selectedType: '',
            selectedLocation: null,
            path: null,
            locations: [[], []],
            allLocations: [],
            types: [[], []],
            allTypes: [],
            open: false,
            snackbarmsg: "",
            locsProbeLevelData: [[],[],[],[]],
            selectedDuration: "",
            selectedYear: "",
            selectedMonth: "",
            selectedDay: "",
            dateArr: [],
            startTime: [],
            endTime: [],
            isGenerate: false,
            nodes:[]
        };
        this.changeLocation = this.changeLocation.bind(this);
        this.changeType = this.changeType.bind(this);
        this.changeDuration = this.changeDuration.bind(this);
        this.changeYear = this.changeYear.bind(this);
        this.changeMonth = this.changeMonth.bind(this);
        this.changeDay = this.changeDay.bind(this);
        this.updateLocsProbe();
        // this.updateLocations();
        this.updateTypes();
        this.getAllLocations();
        this.getAllTypes();
        this.setUpArray = this.setUpArray.bind(this);
    }
    
    changeLocation(location) {
        this.setState({selectedLocation: location});
    }
    
    changeType(type) {
        this.setState({selectedType: type});
    }

    changeDuration(duration) {
        this.setState({selectedDuration: duration});
    }

    changeYear(year) {
        // const {selectedYear} = this.props;
        // selectedYear[position] = year;
        // console.log("selectedyear")
        // console.log(year)
        // console.log((position).toString())
        // const {selectedYear} = this.state;
        // selectedYear[position] = year;
        // console.log(selectedYear[position]+"p")
        // this.setState({selectedYear});
        this.setState({selectedYear: year});
    }

    changeMonth(month) {
        this.setState({selectedMonth: month});
    }

    changeDay(day) {
        this.setState({selectedDay: day});
    }

    setUpArray(n) {
        const {dateArr} = this.state;
        this.setState({dateArr: Array.from({length: n}, (_, i) => i + 1)});
        // console.log(dateArr);
        // console.log("dateArr");

        // return dateArr;
    }

    componentDidUpdate(prevProps, prevState) {
        const {locations, selectedType, selectedLocation} = this.state;
        if (selectedType != prevState.selectedType) {
            // this.updateLocations();
            this.updateLocsProbe();
        } 
        if (selectedLocation != prevState.selectedLocation) {
            this.updateTypes();
            this.updatePath();
        }
    }

    updateLocations() {
        const {selectedType, allLocations} = this.state;
        this.getLocs(selectedType).then(res => {
            if (res == undefined){
                this.handleSnackbar("There seems to be an error")
                return;
            }
            var result = this.parseLocResult(res);
            // getLocs("") => ans[0](blue)-->result = all locations, ans[1](grey out)-->[] = []
            var ans = [result,[]];
            var j = 0;
            for (var i = 0; i < allLocations.length; i++) {
                if (j < result.length && allLocations[i].id == result[j].id) {
                    j++;
                } else {
                    ans[1].push(allLocations[i]);
                }
            }
            this.setState({locations: ans});
        });
    }

    updatePath() {
        const {selectedLocation} = this.state;
        if (selectedLocation == null) {
            this.setState({path: null});
            return;
        }
        var id = selectedLocation.id;
        fetch(api_url+`/sensor/info?id=${id}`)
            .then(res => res.json())
            .catch(err => this.handleSnackbar("There seems to be an error (/sensor/info/id): " + err ))
                .then(res => {
                    if (res == undefined){
                        this.handleSnackbar("There seems to be an error")
                        return;
                    }
                    if (res.locations.length <= 1) {
                        this.setState({path: null});
                        return;
                    }
                    var ans = [];
                    var coordsSplit1 = res.locations[0][1].split(",");
                    var lat1 = parseFloat(coordsSplit1[0]);
                    var lon1 = parseFloat(coordsSplit1[1]);
                    var coordsSplit2 = res.locations[1][1].split(",");
                    var lat2 = parseFloat(coordsSplit2[0]);
                    var lon2 = parseFloat(coordsSplit2[1]);
                    ans.push([[lat1, lon1], [lat2, lon2]]);
                    for (var i = 2; i < res.locations.length; i++) {
                        var currLine = [];
                        var coordsSplit = res.locations[i][1].split(",");
                        var lat = parseFloat(coordsSplit[0]);
                        var lon = parseFloat(coordsSplit[1]);
                        ans.push([ans[i-2][1], [lat, lon]]);
                    }
                    this.setState({path: ans});
                });
    }

    updateTypes() {
        const {selectedLocation, allTypes} = this.state;
        this.getTypes(selectedLocation).then(res => {
            var result = this.parseTypeResult(res);
            var ans = [result,[]];
            var j = 0;
            for (var i = 0; i < allTypes.length; i++) {
                if (j < result.length && allTypes[i] == result[j]) {
                    j++;
                } else {
                    ans[1].push(allTypes[i]);
                }
            }
            this.setState({types: ans});
        });
    }

    getAllLocations() {
        this.getLocs("").then(res => {
            if (res == undefined){
                this.handleSnackbar("There seems to be an error")
                return;
            }
            this.setState({allLocations: this.parseLocResult(res)});
            // Show by url param ?node=1
            const params = new URLSearchParams(location.search);
            const {allLocations} = this.state;
            if (params.get("node")){
                for (const location of allLocations){
                    if (location.id == params.get("node")){
                        this.setState({selectedLocation: location});
                    }
                }
            }
        });
    }

    getAllTypes() {
        this.getTypes(null).then(res => {
            this.setState({allTypes: this.parseTypeResult(res)});
        });
    }

    // ans: [[low],[mid],[high],[grey out]]
    // first 3 array from parseLocProbeResult(Result), 4th array from allLocation
    // use level to decide which [] to push
    // separate the data by their levels into four sub-arrays in array
    updateLocsProbe() {
        const {selectedType, allLocations, locsProbeLevelData} = this.state;
        if (selectedType == "") {
            this.updateLocations();
        } else {
            //sensor/probe
            // console.log("217");
            this.getLocsProbe(selectedType).then(res => {
            if (res == undefined){
                this.handleSnackbar("getLocsProbe with selected type error!")
                
                return;
            }
            var locsProbeResult = this.parseLocProbeResult(res);            
            var high = [];
            var mid = [];
            var low = [];
            var greyOut = [];
            var ans = [];
            var j = 0;
            // loop through all locations
            // console.log("234 allLocations: ")
            // console.log(allLocations)
            for (var i = 0; i < allLocations.length; i++) {
                // if the id is in all location, check the level, else, grey out the marker
                if (j < locsProbeResult.length && allLocations[i].id == locsProbeResult[j].id) {
                    if (locsProbeResult[j].level == 2) {
                        high.push(locsProbeResult[j])
                    }
                    if (locsProbeResult[j].level == 1) {
                        mid.push(locsProbeResult[j])
                    }
                    if (locsProbeResult[j].level == 0) {
                        low.push(locsProbeResult[j])
                    }
                    j++;
                    // TODO: when click some faded out items, web crash
                } else {
                    // console.log(allLocations[i].id)
                    var currData: Data = {
                            id: allLocations[i].id,
                            name: allLocations[i].name,
                            coordinates: allLocations[i].coordinates,
                            time: null,
                            value: null,
                            level: null
                        };
                    greyOut.push(currData);
                    // console.log("currData")
                    // console.log(currData)
                }
            }
            //[low, mid, high,greyout]
            ans.push(low)
            ans.push(mid)
            ans.push(high)
            ans.push(greyOut)
            // console.log("ans")
            // console.log(ans)
            this.setState({locsProbeLevelData: ans});
        });
    }
    }

    // separate the raw data got from API to array
    parseLocProbeResult(result) {
        var currArr = [];
        // console.log("272 result" + result);
        var type = result['type'];
        var data = result['data'];
        // data is the array with all info get from url
        // locsProbeLevelData[i][5] 
        data.forEach(d => {
            var coordsSplit = d[2].split(",");
            var lat = parseFloat(coordsSplit[0]);
            var lon = parseFloat(coordsSplit[1]);
            var currData: Data = {
                id: d[0],
                name: d[1],
                coordinates: [lat, lon],
                time: d[3],
                value: d[4],
                level: d[5]
            };
            currArr.push(currData);  
        });
        // console.log("289 currArr" + currArr);
        return currArr.sort(function (a, b) {
            return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
        });
    }

    /**
     * get locations Probe Levels
     *  a GET method that gets all data levels by sensor probes types
     * @Parameters
     * type (sensortype of sensorMeasurements table: String)
     * @Return 
     * type (sensortype of sensorMeasurements table: String)
     * data (Array):  id (id: String), name (name: String), latest location (value of sensorInfo table: String), latest location update timestamp (time of sensorMeasurements table: String), value (value of sensorMeasurements table: String), level (level: Number)
     */
    getLocsProbe(selectedType) {
        return fetch(api_url+`/sensor/probe?type=${selectedType}`)
        .then(res => res.json())
        .catch(err => this.handleSnackbar("There seems to be an error on 239 " + err ));
    }

    // select only probe, the nodes without the probe value available grey out
    getLocs(selectedType) {
        return fetch(api_url+`/sensor/info?type=${selectedType}`)
            .then(res => res.json())
            .catch(err => this.handleSnackbar("There seems to be an error (/sensor/info/type): " + err ));
    }

    parseLocResult(Result) {
        var currArr = [];
        for (var i = 0; i < Result.locations.length; i++) {
            var coordsSplit = Result.locations[i][2].split(",");
            var lat = parseFloat(coordsSplit[0]);
            var lon = parseFloat(coordsSplit[1]);
            var currLocation = {
                id: Result.locations[i][0],
                name: Result.locations[i][1],
                coordinates: [lat, lon]
            };
            currArr.push(currLocation);
        }
        return currArr.sort(function (a, b) {
            return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
        });
    }

    getTypes(selectedLoc) {
        var id;
        if (selectedLoc == null) {
            id = "";
        } else {
            id = selectedLoc.id;
        }
        return fetch(api_url+`/sensor/type?id=${id}`)
            .then(res => res.json())
            .catch(err => this.handleSnackbar("There seems to be an error (/sensor/type/id): " + err ));
    }

    parseTypeResult(Result) {
        var currArr = [];
        for (var i = 0; i < Result.types.length; i++) {
            currArr.push(Result.types[i]);
        }
        return currArr.sort(function (a, b) {
            return a.toUpperCase().localeCompare(b.toUpperCase());
        });
    }

    handleSnackbar = (msg) => {
        this.setState({ ...this.state, open: true, snackbarmsg:msg });
        // console.log(msg);
    }

    handleClose = () => {
        this.setState({ ...this.state, open: false, snackbarmsg:"" });
    }

    render(): React.ReactNode {
        const {classes} = this.props;
        const {selectedType, selectedLocation, locations, types, path, open, snackbarmsg, locsProbeLevelData, selectedDuration, selectedYear, selectedMonth, selectedDay, dateArr, startTime, endTime, isGenerate, nodes
        } = this.state;
        // const ref = React.useRef(null!);
        // const handleClick = () => console.log("Notebook");

        return (
            <>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={open}
                    onClose={this.handleClose}
                    message={snackbarmsg}
                    key="snackbar"
                />
                <Menu 
                    classes={classes}
                    selectedType={selectedType}
                    selectedLocation={selectedLocation}
                    selectedDuration={selectedDuration}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    selectedDay={selectedDay}
                    locations={locations}
                    types={types}
                    changeLocation={this.changeLocation}
                    changeType={this.changeType}
                    changeYear={this.changeYear}
                    changeMonth={this.changeMonth}
                    changeDay={this.changeDay}
                    changeDuration={this.changeDuration}
                    dateArr={dateArr}
                    setUpArray={this.setUpArray}
                    startTime={startTime}
                    endTime={endTime}
                    isGenerate={isGenerate} 
                    nodes={nodes}             />
                {/* <Button onClick={handleClick}>Show Notebook </Button> */}
                <MapDetail 
                    selectedLocation={selectedLocation}
                    locations={locations}
                    path={path}
                    changeLocation={this.changeLocation}
                    changeType={this.changeType}
                    locsProbeLevelData={locsProbeLevelData}
                />
                {selectedType !== '' && selectedLocation !== null 
                    ? <SensorTable 
                            sensorType={selectedType} 
                            location={selectedLocation}
                            startTime={startTime}
                            endTime={endTime}
                            isGenerate={isGenerate}
                            />
                    :   <Translation>
                        {
                            t => <><br /><Alert severity="info">{ t('map.select-type-location') }</Alert></>
                        }
                        </Translation> }                
            </>
        );
    }
}

export default withStyles(styles as any, {withTheme: true})(Map);
// TODO: when select probe first, and click node without that probe, the website crash