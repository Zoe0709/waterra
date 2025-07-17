import * as React from 'react';
import { Location } from '~/components/Map';
import Chart from '~/components/Chart';
// import Menu from '~/components/Menu';
import { any } from 'prop-types';
import { Translation } from 'react-i18next';
import LinearProgress from '@material-ui/core/LinearProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import config from "../config/config"

const api_url = config.api;

export interface SensorTableProps {
    location: Location,
    sensorType: string,
    startTime: string[],
    endTime: string[],
    isGenerate: boolean
}

export interface sensorData {
    id: string,
    type: string,
    data: Array<[number, number]>
}

interface SensorTableState {
    error: null | any,
    isLoaded: boolean,
    // [number, number][][] -> [[[1,2],[2,2],[..]....],[],[],[],[]]
    chartData: Array<Array<[number, number]>>,
    // type: string,
    result: sensorData
}

class SensorTable extends React.PureComponent<SensorTableProps, SensorTableState> {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            chartData: [],
            // type: "",
            result: {id: "", type: "", data: []}
        }
        this.updataDataWithTimePeriod();
    }

    // updateData() {
    //     const { location, sensorType} = this.props;
    //     var chartD = [];
    //     fetch(api_url+`/sensor/data?id=${location.id}&type=${sensorType}`)
    //         .then(res => res.json())
    //         .then(
    //             result => (
    //                 this.setState({ result, isLoaded: true, /**/error: null })),
    //                 // this.setState({chartData: this.myPush(result)})),
    //             error => this.setState({ error, isLoaded: true })
    //         );
    //     // console.log("updateData()");
    //     // console.log(this.state.result);
    //     chartD.push(this.state.result);
    //     this.setState({chartData: chartD});
    //     // console.log(this.state.chartData);

    // }

    updateData2() {
        const { location, sensorType } = this.props;
        console.log("update 2!")
        // console.log(location)
        // console.log(sensorType)
        fetch(api_url+`/sensor/data?id=${location.id}&type=${sensorType}`)
            .then(res => res.json())
            .then(
                result => (
                    this.setState({ result, isLoaded: true, /**/error: null })),
                error => this.setState({ error, isLoaded: true })
            );
            console.log(this.state.result);
        // .catch(error => this.setState({ error, isLoaded: true }));
    }

    /**
     * fetch data from api with selected time period
     */
    updataDataWithTimePeriod() { 
        const{location, sensorType, startTime, endTime} = this.props; 
        const {chartData} = this.state;
        if (startTime.length == 0) {
            this.updateData2();
        } else {
            console.log("updateDataWIthTimePeriod()");
            // var chartD = [];
            for (var i = 0; i < startTime.length; i++) {
                chartData.push([]);
                fetch(api_url + `/sensor/probe?id=${location.id}&type=${sensorType}&startTime=${startTime[i]}&endTime=${endTime[i]}`)
                    .then(res => res.json())
                    .then(
                        result => (
                            this.setState({ result, isLoaded: true, /**/error: null })),
                        error => this.setState({ error, isLoaded: true })
                    );
            
            // chartD.push(this.state.result);
            this.setState({chartData});
            console.log(this.state.chartData);
            }
        }
    }

    componentDidUpdate(prevProps) {
        // this.props.isGenerate == true && 
        if (this.props != prevProps)  {
            this.setState({chartData: []});
            this.setState({result: {id: "", type: "", data: []}});
            // this.updateData2();
            this.updataDataWithTimePeriod();
            // this.setState({this.props.isGenerate: false});
        }
    }
    /*
    getChartData() {
        this.setState({
            chartData: 
        })
    }

    componentWillMount() {
        this.getChartData();
    }*/

    render() {
        console.log("render!");
        const { isLoaded, error, result, chartData } = this.state;
        // console.log("result: " + result)
        // console.log("chartData: " + chartData)
        if (!isLoaded) return <LinearProgress color="secondary" />;
        if (error) return <Alert severity="error">Error {error}</Alert>;
        console.log(result);
        // const index = chartData.indexOf([], 0);
        // if (index > -1) {
        //     chartData.splice(index, 1);
        // }
        // chartData.push(result.data);
        // this.setState({chartData});
        // console.log(chartData);
        
        if (chartData.length > 1) {
            for (var i = 0; i < chartData.length; i++) {
                chartData[i] = result.data;
            }
        } else {
            chartData.push(result.data);
        }
        this.setState({chartData});
        console.log(chartData);


        if (this.state.result.type === 'Temperature') {
            var yAxisLabel: string = '°C';
        }
        else if (this.state.result.type === 'Air_Temperature') {
            var yAxisLabel: string = '°C';
        }
        else if (this.state.result.type === 'Water_Temperature') {
            var yAxisLabel: string = '°C';
        }
        else if (this.state.result.type === 'Dissolved_Oxygen') {
            var yAxisLabel: string = 'mg/L';
        }
        else if (this.state.result.type === 'Turbidity') {
            var yAxisLabel: string = 'Units - NA';
        }
        else if (this.state.result.type === 'Conductivity') {
            var yAxisLabel: string = 'µS/cm';
        }
        else {
            var yAxisLabel: string = 'Units - NA';
        }

        if (chartData && chartData.length > 0) {
            return (
                <div>
                    <br />
                    <div>
                        <Translation>
                            {
                                t => <h5>{t('sensor-table.title', { type: this.state.result.type })}</h5>
                            }
                        </Translation>
                        <Translation>
                            {
                                t => <h6>{t('sensor-table.location', { name: this.props.location.name })}</h6>
                            }
                        </Translation>
                        <Chart chartData={this.state.chartData} Parameter={this.state.result.type} />
                    </div>

                    <br />

                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>Full Data</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer component={Paper}>
                            <Table size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <Translation>
                                            {
                                                t => <TableCell>{t('sensor-table.time')}</TableCell>
                                            }
                                        </Translation>
                                        <Translation>
                                            {
                                                t => <TableCell>{t('sensor-table.value', { label: yAxisLabel })}</TableCell>
                                            }
                                        </Translation>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {chartData.map(e => e.map((item, index) => (
                                        <TableRow>
                                            <TableCell>{index}</TableCell>
                                            <TableCell>{(new Date(item[0] / 1000000)).toLocaleString()}</TableCell>
                                            <TableCell>{Number(item[1]).toFixed(2)}</TableCell>
                                        </TableRow>
                                    )))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        </AccordionDetails>
                      </Accordion>

                      <br /><br /><br /><br />
                    
                </div>

            );
        } else if (!result.data || error) {
            return <Translation>
                {
                    t => <div>{t('sensor-table.no-data', { name: this.props.location.name })}</div>
                }
            </Translation>;
        }
    }
}

export default SensorTable;
