import * as React from 'react';
import { Line } from 'react-chartjs-3';
import { number } from 'prop-types';
import { ChartOptions } from 'chart.js'

interface ChartProps {
    displayTitle: boolean,
    displayLegend: boolean,
    legendPosition: string,
    // [[[1,2],[2,2],[..]....],[],[]]
    chartData: Array<Array<[number, number]>>,
    Parameter: string,
}

interface ChartState {
    chartDataState: Array<Array<[number, number]>>
}

class Chart extends React.Component<ChartProps, ChartState>{
    constructor(props) {
        super(props);
        this.state = {
            chartDataState: props.chartData
        }
    }


    componentDidUpdate(prevProps) {
        if ((this.props != prevProps)) {
            this.setState({
                chartDataState: this.props.chartData
                // chartDataState: [[[1671387516000000000, 6], [1674604624000000000, 8.5]], [[1672453116000000000, 28], [1674608376000000000, 51]]]
            })
        }
    }

    static defaultProps = {
        displayTitle: true,
        displayLegend: true,
        legendPosition: 'right',
        Parameter: 'Measured Parameter',
    }

    render() {
        //console.log(this.state.chartDataState)
        //x-axis value
        let EpochtimeData = this.state.chartDataState.map(e => 
            (e.map(
                (time: number[]) => 
                (new Date(time[0] / 1000000)).toLocaleString())))
        // console.log(EpochtimeData)

        var HumantimeData = []
        for (var i = 0; i < EpochtimeData.length; i++) {
            // var num = EpochtimeData[i].length
            const singleArr = new Array(EpochtimeData[i].length)
                .fill('')
                .map((_, j) => EpochtimeData[i].slice(j * 1, (j + 1) * 1));
            HumantimeData.push(singleArr)
        }
        
        // var HumantimeData =[[["2022-08-06, 5:18:36 PM"], ["2022-12-18, 1:18:36 PM"], ["2023-01-24, 6:57:04 PM"]], [["2022-10-12, 7:11:11 AM"], ["2022-12-30, 9:18:36 PM"], ["2023-01-24, 4:33:36 PM"], ["2023-01-24, 7:59:36 PM"]]]
        console.log("humantimedata")
        console.log(HumantimeData)

        //y-axis value
        let sensorValue: Number[][] = this.state.chartDataState.map(e => (e.map((value: number[]) => value[1])))
        // var sensorValue = [["4", "6", "8.5"], ["49.099998474121094", "28", "0", "51"]]
        // console.log(test)
        console.log("sensorValue")
        console.log(sensorValue)

        if (this.props.Parameter === 'Temperature') {
            var yAxisLabel: string = '°C';
        }
        else if (this.props.Parameter === 'Dissolved_Oxygen') {
            var yAxisLabel: string = 'mg/L';
        }
        else if (this.props.Parameter === 'Turbidity') {
            var yAxisLabel: string = 'Units';
        }
        else if (this.props.Parameter === 'Conductivity') {
            var yAxisLabel: string = 'µS/cm';
        }
        else {
            var yAxisLabel: string = 'Units';
        }

        // console.log(dataS[i].data)
        // console.log(HumantimeData[i])

        // const data = {
        //     labels: HumantimeData,
        //     // labels: [["2022-08-06, 5:18:36 PM"], ["2022-12-18, 1:18:36 PM"], ["2023-01-24, 6:57:04 PM"]],
        //     datasets: dataS
        // }

        let options: ChartOptions = {
            scales: {
                yAxes: [{
                    gridLines: {
                        drawBorder: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: yAxisLabel
                    }
                }],
				xAxes: [{
					gridLines: {
						display: false
                    }
				}]
            },
            title: {
                display: true,
                position: 'top',
                text: this.props.Parameter + ' vs Time'
            },
            legend: {
                display: false,
                position: 'bottom',
                labels: {
                    fontFamily: 'Comic Sans MS',
                    fontColor: 'rgb(133, 0, 69)',
                    boxWidth: 20,
                    boxFill: 'rgb(133, 0, 69)'
                }
            }
        };

        const colors: string[] = ['rgb(150, 93, 123)', "blue", "green", "purple", "orange"];
        var dataS: any[] = [];
        for (var i = 0; i < 5; i ++) {
            dataS.push({
                // label 
                label: this.props.Parameter,
                data: sensorValue[i],
                backgroundColor: 'rgba(255, 255, 255, 0)',
                borderColor: colors[i],
                borderWidth: 1.5,
                pointRadius: 1,
                pointHoverRadius: 5
            })
            // const data = {
            //     labels: HumantimeData[i],
            //     // labels: [["2022-08-06, 5:18:36 PM"], ["2022-12-18, 1:18:36 PM"], ["2023-01-24, 6:57:04 PM"]],
            //     datasets: dataS
            // }
            // return (
            //     <div className="chart" style={{ backgroundColor: 'rgb(255,255,255)' }}>
            //         <Line data={data} options={options} />
            //     </div>           
            // ) 
        }

        const data = {
            labels: HumantimeData[i],
            // labels: [["2022-08-06, 5:18:36 PM"], ["2022-12-18, 1:18:36 PM"], ["2023-01-24, 6:57:04 PM"]],
            datasets: dataS
        }

        return (
            <div className="chart" style={{ backgroundColor: 'rgb(255,255,255)' }}>
                <Line data={data} options={options} />
            </div>           
        )
    }
}
export default Chart;