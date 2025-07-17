import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import * as React from 'react';
import { Location } from '~/components/Map';
import { Translation } from 'react-i18next';
import { FlashOnOutlined } from '@material-ui/icons';
import { arrayOf } from 'prop-types';
import Button from '~/components/CustomLayout';
// import * as $ from "jquery";

interface MenuProps {
    classes: any,
    selectedType: string,
    selectedLocation: Location,
    locations: Location[][],
    types: string[][],
    changeLocation: (location: Location) => void,
    changeType: (type: string) => void,
    changeDuration: (duration: string) => void,
    changeYear: (year: string) => void,
    changeMonth: (month: string) => void,
    changeDay: (day: string) => void,
    selectedDuration: string,
    selectedYear: string,
    selectedMonth: string,
    selectedDay: string,
    dateArr: Number[],
    setUpArray: (n: Number) => void,
    startTime: string[],
    endTime: string[],
    isGenerate: boolean,
    nodes: Location[]
}

class Menu extends React.PureComponent<MenuProps, null> {

    isYear = false;
    isMonth = false;
    isWeek = false;

    constructor(props) {
        super(props);
    }

    handleTypeChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
        const { types } = this.props;
        var type = event.target.value
        if (document.getElementById('newrow').innerHTML.length>42) {
            document.getElementById('newrow').innerHTML='Selected:'
            this.setState({startTime: []});
            this.setState({endTime: []});
        }
        for (var i = 0; i < types[1].length; i++) {
            if (type == types[1][i]) {
                this.props.changeLocation(null);
                break;
            }
        }
        this.props.changeType(type);
    };

    handleLocationChange = event => {
        var location = event.target.value;
        if (location == "") {
            this.props.changeLocation(null);
        } else {
            const { locations } = this.props;
            for (var i = 0; i < locations[0].length; i++) {
                if (locations[0][i].id == location) {
                    this.props.changeLocation(locations[0][i]);
                    return;
                }
            }
            for (var i = 0; i < locations[1].length; i++) {
                if (locations[1][i].id == location) {
                    this.props.changeType("");
                    this.props.changeLocation(locations[1][i]);
                    break;
                }
            }
        }
    };
    
    daysInMonth(m, y) {
        return new Date(y, m, 0).getDate();
    }

    handleDurationChange = event => {
        // console.log("dropdown")
        const {selectedDay, selectedMonth, selectedYear} = this.props;
        var d = event.target.value
        console.log("event.target.id: " + event.target.id);
        // when click other duration, empty startTime and endTime
        if (document.getElementById('newrow').innerHTML.length > 42) {
            document.getElementById('newrow').innerHTML='Selected:'
            this.setState({startTime: []});
            this.setState({endTime: []});
        }

        if (d == "") {
            this.isYear = false;
            this.isMonth = false;
            this.isWeek = false;
            this.props.changeDuration("");
        }
        if (d == "Yearly") {
            this.isYear = true;
            this.isMonth = false;
            this.isWeek = false;
            this.props.changeDuration("Yearly");
            this.props.changeYear("");
            this.props.changeMonth("");
            this.props.changeDay("");
        }
        if (d == "Monthly") {
            console.log("month")
            this.isYear = false;
            this.isMonth = true;
            this.isWeek = false;
            this.props.changeDuration("Monthly");
            this.props.changeYear("");
            this.props.changeMonth("");
            this.props.changeDay("");
        }
        if (d == "Weekly") {
            console.log("week")
            this.isYear = false;
            this.isMonth = false;
            this.isWeek = true;
            this.props.changeDuration("Weekly");
            this.props.changeYear("");
            this.props.changeMonth("");
            this.props.changeDay("");
        }
    }

    handleYearChange = event => {
        const {selectedYear, selectedMonth} = this.props;
        var y = event.target.value
        
        this.props.setUpArray(this.daysInMonth(parseInt(selectedMonth), parseInt(y)))
        this.props.changeYear(y);
        console.log(selectedYear)
    }

    handleMonthChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
        const {selectedDay, selectedYear, selectedMonth} = this.props;
        var m = event.target.value;
        var days = this.daysInMonth(parseInt(m), parseInt(selectedYear));

        this.props.changeMonth(m);
        this.props.setUpArray(days);
    }
    
    handleDayChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
        // const {selectedDay, selectedYear, selectedMonth} = this.props;
        var d = event.target.value
        this.props.changeDay(d.toString());
    }

    setUpDate():string[] {
        const {selectedDay, selectedMonth, selectedYear, startTime, endTime} = this.props;
        for (var i = 0; i < selectedYear.length; i++) {
            if (this.isYear == true) {
                var start = selectedYear + "-01-01";
                var end = selectedYear + "-12-31";
                // startTime.push(start);
                // endTime.push(end);
                // this.setState({startTime});
                // this.setState({endTime});
            }
            if (this.isMonth == true) {
                var day = this.daysInMonth(parseInt(selectedMonth), parseInt(selectedYear));
                if (day < 10) {
                    var theDay = "0" + day.toString();
                } else {
                    var theDay = day.toString();
                }
                var start = selectedYear + "-" + selectedMonth + "-01";
                var end = selectedYear + "-" + selectedMonth + "-" + theDay;
            //     startTime.push(start);
            //     endTime.push(end);
            //     this.setState({startTime});
            //     this.setState({endTime});
            // }
            if (this.isWeek == true) {
                if (parseInt(selectedDay) < 10) {
                    var theDay = "0" + selectedDay;
                } else {
                    var theDay = selectedDay;
                }
                var d = this.daysInMonth(parseInt(selectedMonth), parseInt(selectedYear));
                if ((parseInt(selectedDay) + 6) > d) {
                    if (parseInt(selectedMonth) < 9) {
                        var endMD = "0" + (parseInt(selectedMonth) + 1).toString() + "-0" + (6 - (d - parseInt(selectedDay))).toString();
                    } else {
                        var endMD = (parseInt(selectedMonth) + 1).toString() + "-0" + (6 - (d - parseInt(selectedDay))).toString();
                    }
                } else if (parseInt(selectedDay) + 6 < 10) {
                    var endMD = selectedMonth + "-0" + (parseInt(selectedDay) + 6).toString();
                } else {
                    var endMD = selectedMonth + "-" + (parseInt(selectedDay) + 6).toString();
                }
                var start = selectedYear + "-" + selectedMonth + "-" + theDay;
                var end = selectedYear + "-" + endMD;
                // startTime.push(start);
                // endTime.push(end);
                // this.setState({startTime});
                // this.setState({endTime});
            }
        }
        return [start, end]
        }
    }


    click = 1;
    compareByTime = event => {
        const {selectedDay, selectedMonth, selectedYear, startTime, endTime} = this.props;

        const d = document.getElementById('newrow');
        const oldDiv = document.getElementById('0');
        console.log(document.getElementById('0'));
        const clone = oldDiv.cloneNode(true) as HTMLElement;
        const startAndEnd = this.setUpDate();
        const s=startTime.indexOf(startAndEnd[0])
        const e=endTime.indexOf(startAndEnd[1])
        if (s!= -1 && e!=-1 && s==e){
            return;
        }
        // show only the date
        var clonedSelect = clone.querySelectorAll('#formcontrol'+this.click);
        this.click++;
        for (var i = 0; i < clonedSelect.length; i++) {
            var c =clonedSelect[i]as HTMLElement        
            console.log(clonedSelect[i])
            // c.style.display = 'none'; // without space, align with node
            c.style.opacity = '0'; // with space, align with data
        }
        
        // push data
        startTime.push(startAndEnd[0])
        endTime.push(startAndEnd[1])
        d.appendChild(clone)
        
    }
    compareByNode = event => {
        const {selectedDay, selectedLocation, nodes, selectedMonth, selectedYear, startTime, endTime} = this.props;
        const d = document.getElementById('newrow');
        const oldDiv = document.getElementById('0');
        console.log(document.getElementById('0'));
        const clone = oldDiv.cloneNode(true) as HTMLElement;
        
        // show only the date
        var clonedSelect = clone.children//querySelectorAll('#formcontrol'+this.click);
        this.click++;
        // console.log("selectedLocation");
        // console.log(selectedLocation);
        const n=nodes.indexOf(selectedLocation);
        if (n!=-1 || selectedLocation==null) {
            return;
        }
        // push data
        nodes.push(selectedLocation)
        console.log("nodes")
        // console.log(nodes)
        for (var i = 1; i < clonedSelect.length; i++) {
            var c =clonedSelect[i]as HTMLElement        
            console.log(clonedSelect[i])
            // c.style.display = 'none'; // without space, align with node
            c.style.opacity = '0'; // with space, align with data
        }

       
        d.appendChild(clone)
    }

    // onClick handler for generate button
    handleOnClick2 = event => {
        this.setState({isGenerate: true});
    }

    handleOnClick3 = event => {
        this.setState({isGenerate: false});
        this.props.changeLocation(undefined);
        this.props.changeType("");
        this.props.changeDuration("");
        this.props.changeYear("");
        this.props.changeMonth("");
        this.props.changeDay("");
        this.setState({startTime: []});
        this.setState({endTime: []});
        this.setState({nodes: []});
        this.isYear = false;
        this.isMonth = false;
        this.isWeek = false;
        document.getElementById('newrow').innerHTML='--Selected--'

    }

    render(): React.ReactNode {
        const { classes, selectedType, selectedLocation, locations, types, selectedDuration, selectedYear, selectedMonth, selectedDay, dateArr } = this.props;

        return (
            <>
            <form id='0' className={classes.root}>
                <FormControl id={"formcontrol"+this.click} className={classes.formControl}>
                    <Translation>
                        {
                            t => <InputLabel htmlFor="select-location">{t('menu.location')}</InputLabel>
                        }
                    </Translation>
                    <Select
                        value={((selectedLocation == null) ? ("") : (selectedLocation.id))}
                        onChange={this.handleLocationChange}
                        inputProps={{
                            name: 'location',
                            id: 'select-location'
                        }}>
                        <MenuItem value="">
                            <Translation>
                                {
                                    t => <em>{t('menu.any')}</em>
                                }
                            </Translation>
                        </MenuItem>

                        {locations[0].map(loc => (
                            <MenuItem key={loc.id} value={loc.id}>{loc.name.replace("_"," ").replace("_", " ")}</MenuItem>
                        ))}

                        {locations[1].map(loc => (
                            <MenuItem key={loc.id} value={loc.id}>{loc.name.replace("_"," ").replace("_", " ")}</MenuItem>
                        ))}

                    </Select>
                </FormControl>
                <FormControl id={"formcontrol"+this.click} className={classes.formControl}>
                    <Translation>
                        {
                            t => <InputLabel htmlFor="select-sensor-type">{t('menu.sensor-type')}</InputLabel>
                        }
                    </Translation>
                    <Select
                        value={selectedType}
                        onChange={this.handleTypeChange}
                        inputProps={{
                            name: 'sensor-type',
                            id: 'select-sensor-type'
                        }}>
                        <MenuItem value="">
                            <Translation>
                                {
                                    t => <em>{t('menu.any')}</em>
                                }
                            </Translation>
                        </MenuItem>
                        {types[0].map(type => (
                            <MenuItem key={type} value={type}>{type.replace("_", " ").replace("_", " ")}</MenuItem>
                        ))}

                        {types[1].map(type => (
                            <MenuItem style={{ color: 'Silver' }} key={type} value={type}>{type.replace("_", " ").replace("_", " ")}</MenuItem>
                        ))}

                    </Select>
                </FormControl>

                <FormControl id={"formcontrol"+this.click}className={classes.formControl}>
                    <Translation>
                        {
                            t => <InputLabel htmlFor="select-duration">{t('Duration')}</InputLabel>
                        }
                    </Translation>
                    <Select value={selectedDuration}
                        onChange={this.handleDurationChange}
                        inputProps={{
                            name: 'duration',
                            id: 'select-duration'
                        }}>
                        <MenuItem value="">
                            <Translation>
                                {
                                    t => <em>{t('menu.any')}</em>
                                }
                            </Translation>
                        </MenuItem>
                        <MenuItem id='555' value={"Yearly"}>Yearly</MenuItem>
                        <MenuItem id='444' value={"Monthly"}>Monthly</MenuItem>
                        <MenuItem value={"Weekly"}>Weekly</MenuItem>

                    </Select>
                </FormControl>
                
                {this.isYear == true
                ? <>{ 
                <FormControl className={classes.formControl}>
                    <Translation>
                        {
                            t => <InputLabel htmlFor="select-year">{t('Year')}</InputLabel>
                        }
                    </Translation>
                    <Select value={selectedYear} 
                        onChange={this.handleYearChange}
                        inputProps={{
                            name: 'year',
                            id: 'select-year'
                        }}>
                        <MenuItem value="">
                            <Translation >
                                {
                                    t => <em >{t('menu.any')}</em>
                                }
                            </Translation>
                        </MenuItem>
                        <MenuItem value={"2023"}>2023</MenuItem>
                        <MenuItem value={"2022"}>2022</MenuItem>
                        <MenuItem value={"2021"}>2021</MenuItem>
                        <MenuItem value={"2020"}>2020</MenuItem>
                    </Select>
                </FormControl>
                }</>
                :<></>
                }
                
                {this.isMonth == true
                ? <>{ 
                <><FormControl className={classes.formControl}>
                        <Translation>
                            {
                                t => <InputLabel htmlFor="select-time">{t('Year')}</InputLabel>}
                        </Translation>
                        <Select value={selectedYear}
                        onChange={this.handleYearChange}
                        inputProps={{
                            name: 'year',
                            id: 'select-year'
                        }} >
                        <MenuItem value="">
                            <Translation>
                                {
                                    t => <em>{t('menu.any')}</em>
                                }
                            </Translation>
                        </MenuItem>
                        <MenuItem value={"2023"}>2023</MenuItem>
                        <MenuItem value={"2022"}>2022</MenuItem>
                        <MenuItem value={"2021"}>2021</MenuItem>
                        <MenuItem value={"2020"}>2020</MenuItem>
                        </Select>
                    </FormControl><FormControl className={classes.formControl}>
                            <Translation>
                                {
                                    t => <InputLabel htmlFor="select-time">{t('Month')}</InputLabel>}
                            </Translation>
                            <Select value={selectedMonth} 
                            onChange={this.handleMonthChange}
                            inputProps={{
                                name: 'month',
                                id: 'select-month'
                            }} >
                            <MenuItem value="">
                                <Translation>
                                    {
                                        t => <em>{t('menu.any')}</em>
                                    }
                                </Translation>
                            </MenuItem>
                                <MenuItem value={"01"}>January</MenuItem>
                                <MenuItem value={"02"}>February</MenuItem>
                                <MenuItem value={"03"}>March</MenuItem>
                                <MenuItem value={"04"}>April</MenuItem>
                                <MenuItem value={"05"}>May</MenuItem>
                                <MenuItem value={"06"}>June</MenuItem>
                                <MenuItem value={"07"}>July</MenuItem>
                                <MenuItem value={"08"}>August</MenuItem>
                                <MenuItem value={"09"}>September</MenuItem>
                                <MenuItem value={"10"}>October</MenuItem>
                                <MenuItem value={"11"}>November</MenuItem>
                                <MenuItem value={"12"}>December</MenuItem>
                            </Select>
                        </FormControl></>
                
                }</>:<></>}

                {this.isWeek == true
                ? <>{ 
                <><FormControl className={classes.formControl}>
                    <Translation>
                        {
                            t => <InputLabel htmlFor="select-time">{t('Year')}</InputLabel>
                        }
                    </Translation>
                    <Select value={selectedYear} 
                    onChange={this.handleYearChange}
                    inputProps={{
                        name: 'year',
                        id: 'select-year'
                    }} >
                    <MenuItem value="">
                        <Translation>
                            {
                                t => <em>{t('menu.any')}</em>
                            }
                        </Translation>
                    </MenuItem>
                        <MenuItem value={"2023"}>2023</MenuItem>
                        <MenuItem value={"2022"}>2022</MenuItem>
                        <MenuItem value={"2021"}>2021</MenuItem>
                        <MenuItem value={"2020"}>2020</MenuItem>
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <Translation>
                        {
                            t => <InputLabel htmlFor="select-time">{t('Month')}</InputLabel>
                        }
                    </Translation>
                    <Select value={selectedMonth} 
                    onChange={this.handleMonthChange}
                    inputProps={{
                        name: 'month',
                        id: 'select-month'
                    }} >
                    <MenuItem value="">
                        <Translation>
                            {
                                t => <em>{t('menu.any')}</em>
                            }
                        </Translation>
                    </MenuItem>
                            <MenuItem value={"01"}>January</MenuItem>
                            <MenuItem value={"02"}>February</MenuItem>
                            <MenuItem value={"03"}>March</MenuItem>
                            <MenuItem value={"04"}>April</MenuItem>
                            <MenuItem value={"05"}>May</MenuItem>
                            <MenuItem value={"06"}>June</MenuItem>
                            <MenuItem value={"07"}>July</MenuItem>
                            <MenuItem value={"08"}>August</MenuItem>
                            <MenuItem value={"09"}>September</MenuItem>
                            <MenuItem value={"10"}>October</MenuItem>
                            <MenuItem value={"11"}>November</MenuItem>
                            <MenuItem value={"12"}>December</MenuItem>
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <Translation>
                        {
                            t => <InputLabel htmlFor="select-time">{t('Week')}</InputLabel>
                        }
                    </Translation>
                    <Select value={selectedDay} 
                    onChange={this.handleDayChange}
                    inputProps={{
                        name: 'day',
                        id: 'select-day'
                    }} >
            
                    <MenuItem value="">
                        <Translation>
                            {
                                t => <em>{t('menu.any')}</em>
                            }
                        </Translation>
                    </MenuItem>

                    {dateArr.map(arr => {
                        // console.log(dateArr);
                        if (arr == null) return null;
                        return (
                           <MenuItem value={arr.toString()}>{arr.toString()}</MenuItem>
                        )

                    })}
                    </Select>
                </FormControl></>
                }</>:<></>}
            </form>

            <div style={{position:"absolute", float: "right", display: "flex", flexDirection: 'column', top:100, bottom: 100, right:190}}>
            
            <Button 
                size='12px'
                // shadow='0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'
                bgcolor='#F2DEBA'
                color='black'
                border='1px solid black'
                height='25px'
                radius='6px'
                width='120px'
                // padding='5px'
                margin='5px'
                onClick={this.compareByTime} 
            >Compare by time</Button>
            <Button 
                size='12px'
                // shadow='0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'
                bgcolor='#F2DEBA'
                color='black'
                border='1px solid black'
                height='25px'
                radius='6px'
                width='120px'
                // padding='5px'
                margin='5px'
                onClick={this.compareByNode} 
            >Compare by node</Button>
            </div>
            
            <div style={{position:"absolute", float: "right", display: "flex", flexDirection: 'column', top:100, bottom: 100, right:50}}>
            <Button 
                size='12px'
                // shadow='0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'
                bgcolor='#AA5656'
                color='white'
                border='1px solid black'
                height='25px'
                radius='8px'
                width='120px'
                // padding='5px'
                margin='5px'
                onClick={this.handleOnClick2} 
            >Generate</Button>

            <Button 
                size='12px'
                // shadow='0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'
                bgcolor='#C98474'
                color='white'
                border='1px solid black'
                height='25px'
                radius='8px'
                width='120px'
                // padding='5px'
                margin='5px'
                onClick={this.handleOnClick3} 
            >Remove</Button>
            
            </div>
            
            

            <div id='newrow' >
            Selected:
            <form className={classes.root}>
                
                
                
            </form>
            </div>
            </>
    

            
        )
    }
}

export default Menu;
