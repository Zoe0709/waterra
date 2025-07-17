package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"strings"
	"math"

	"github.com/gorilla/mux"
	_ "github.com/influxdata/influxdb1-client" // this is important because of the bug in go mod
	client "github.com/influxdata/influxdb1-client/v2"
)

type ResultData struct {
	Id          interface{} `json:"id"`
	Type 		interface{} `json:"type"`
	Data        [][2]string `json:"data"`
}

type ResultInfo struct {
	Locations [][]string `json:"locations"`
}

type ResultPath struct {
	Name    interface{} `json:"name"`
	Locations [][2]string `json:"locations"`
}

type ResultType struct {
	Types []string `json:"types"`
}

type ResultLevel struct {
	Type interface{} `json:"type"`
	Data [][]string `json:"data"`
}

type ResultTime struct {
	Id interface{} `json:"id"`
	Name interface{} `json:"name"`
	Type interface{} `json:"type"`
	Data [][]string `json:"data"`

}


// Display sensor info
func GetInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	//params := mux.Vars(r)
	v := r.URL.Query()

	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: "http://localhost:8086",
	})
	if err != nil {
	}
	defer c.Close()
	
	// API-1
	if (v.Get("id") == "" && v.Get("type") == "") {
		s := client.NewQuery("SHOW TAG values from sensorInfo with key=\"id\"", "MacWater", "ns")
		if response, err := c.Query(s); err == nil && response.Error() == nil {
			locationsArr := [][]string{}
			for i := 0; i < len(response.Results[0].Series[0].Values); i++ {
				sensorId := response.Results[0].Series[0].Values[i][1].(string)
				query := "SELECT LAST(value), \"name\" FROM sensorInfo WHERE id='" + sensorId + "'"
				q := client.NewQuery(query, "MacWater", "ns")

				if response, err := c.Query(q); err == nil && response.Error() == nil {
					sensorName := response.Results[0].Series[0].Values[0][2]
					sensorCoords := response.Results[0].Series[0].Values[0][1]
					sensorTime :=response.Results[0].Series[0].Values[0][0]
					currArr := []string{}
					currArr = append(currArr, sensorId)
					currArr = append(currArr, sensorName.(string))
					currArr = append(currArr, sensorCoords.(string))
					currArr = append(currArr, sensorTime.(json.Number).String())
					locationsArr = append(locationsArr, currArr)
				}
			}
			json.NewEncoder(w).Encode(&ResultInfo{
				Locations: locationsArr})
		}
	// API 5
	} else if (v.Get("id") == "") { 
		s := client.NewQuery("SHOW SERIES FROM sensorMeasurements", "MacWater", "ns")
		if response, err := c.Query(s); err == nil && response.Error() == nil {
			locationsArr := [][]string{}
			for i := 0; i < len(response.Results[0].Series[0].Values); i++ {
				info := strings.Split(response.Results[0].Series[0].Values[i][0].(string), ",")
				sensorType := strings.Split(info[2], "=")[1]
				if (sensorType != v.Get("type")) {
					continue
				}
				sensorId := strings.Split(info[1], "=")[1]
				query := "SELECT LAST(value), \"name\" FROM sensorInfo WHERE id='" + sensorId + "'"
				q := client.NewQuery(query, "MacWater", "ns")

				if response, err := c.Query(q); err == nil && response.Error() == nil {
					sensorName := response.Results[0].Series[0].Values[0][2]
					sensorCoords := response.Results[0].Series[0].Values[0][1]
					sensorTime := response.Results[0].Series[0].Values[0][0]
					currArr := []string{}
					currArr = append(currArr, sensorId)
					currArr = append(currArr, sensorName.(string))
					currArr = append(currArr, sensorCoords.(string))
					currArr = append(currArr, sensorTime.(json.Number).String())
					locationsArr = append(locationsArr, currArr)
				}
			}
			json.NewEncoder(w).Encode(&ResultInfo{
				Locations: locationsArr})
		}
	// API-2
	} else { 
		query := "SELECT * FROM sensorInfo WHERE id='" + v.Get("id") + "'"
		q := client.NewQuery(query, "MacWater", "ns")
		if response, err := c.Query(q); err == nil && response.Error() == nil {
			numLocations := len(response.Results[0].Series[0].Values)
			sensorName := response.Results[0].Series[0].Values[numLocations-1][2]
			sensorLocations := make([][2]string, numLocations)
			for i := 0; i < numLocations; i++ {
				sensorLocations[i][0] = response.Results[0].Series[0].Values[i][0].(json.Number).String()
				sensorLocations[i][1] = response.Results[0].Series[0].Values[i][3].(string)
			}
			json.NewEncoder(w).Encode(&ResultPath{
				Name: sensorName,
				Locations: sensorLocations})
		}
	}
}

// Create new sensor information
func CreateInfo(w http.ResponseWriter, r *http.Request) {
	//params := mux.Vars(r)

	v := r.URL.Query()
	name := v.Get("name")
	coords := v.Get("coords")
	id := v.Get("id")
	currTimeStr := v.Get("time")
	
	currTime, err := strconv.ParseUint(currTimeStr, 10, 32)
	if err != nil {
		fmt.Println("Error: ", err.Error())
	}
	
	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: "http://localhost:8086",
	})
	if err != nil {
		fmt.Println("Error creating InfluxDB Client: ", err.Error())
	}
	defer c.Close()

	bp, _ := client.NewBatchPoints(client.BatchPointsConfig{
		Database:  "MacWater",
		Precision: "ms",
	})
	
	// Create a point and add to batch
	tags := map[string]string{"id": id,"name": name}
	fields := map[string]interface{}{
		"value": coords,
	}
	pt, err := client.NewPoint("sensorInfo", tags, fields, time.Unix(int64(currTime), 0))
	if err != nil {
		fmt.Println("Error: ", err.Error())
	}
	bp.AddPoint(pt)

	// Write the batch
	err = c.Write(bp)
	if err != nil {
		fmt.Println("Error: ", err.Error())
	}

}

// Display sensor type
func GetType(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	//params := mux.Vars(r)
	v := r.URL.Query()

	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: "http://localhost:8086",
	})
	if err != nil {
	}
	defer c.Close()
	
	if (v.Get("id") == "") {
		s := client.NewQuery("SHOW TAG VALUES FROM sensorMeasurements WITH key=\"sensortype\"", "MacWater", "ns")
		if response, err := c.Query(s); err == nil && response.Error() == nil {
			typeArr := []string{}
			for i := 0; i < len(response.Results[0].Series[0].Values); i++ {
				typeArr = append(typeArr, response.Results[0].Series[0].Values[i][1].(string))
			}
			json.NewEncoder(w).Encode(&ResultType{
				Types: typeArr})
		}
	} else {
		query := "SHOW SERIES FROM sensorMeasurements"
		q := client.NewQuery(query, "MacWater", "ns")
		if response, err := c.Query(q); err == nil && response.Error() == nil {
			typeArr := []string{}
			for i := 0; i < len(response.Results[0].Series[0].Values); i++ {
				info := strings.Split(response.Results[0].Series[0].Values[i][0].(string), ",")
				sensorId := strings.Split(info[1], "=")[1]
				if (sensorId != v.Get("id")) {
					continue
				}
				typeArr = append(typeArr, strings.Split(info[2], "=")[1])
			}
			json.NewEncoder(w).Encode(&ResultType{
				Types: typeArr})
		}
	}
}

// Display data by time or data range
func GetData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	//params := mux.Vars(r)
	v := r.URL.Query()

	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: "http://localhost:8086",
	})
	if err != nil {
	}
	defer c.Close()
	// API 4
	if v.Get("start") == "" {
		q := client.NewQuery("SELECT * FROM sensorMeasurements WHERE id = '"+v.Get("id")+"' and sensortype = '"+v.Get("type")+"'", "MacWater", "ns")
		if response, err := c.Query(q); err == nil && response.Error() == nil {
			w.Header().Set("Content-Type", "application/json")
			sensorID := response.Results[0].Series[0].Values[0][1]
			sensorType := response.Results[0].Series[0].Values[0][2]
			dataLength := len(response.Results[0].Series[0].Values)
			sensorData := make([][2]string, dataLength)
			for i := 0; i < dataLength; i++ {
				sensorData[i][0] = response.Results[0].Series[0].Values[i][0].(json.Number).String()
				sensorData[i][1] = response.Results[0].Series[0].Values[i][3].(json.Number).String()
			}
			json.NewEncoder(w).Encode(&ResultData{Id: sensorID,
				Type: sensorType,
				Data:        sensorData})
		}
	}
	if v.Get("start") != "" {
		q := client.NewQuery("SELECT * FROM sensorMeasurements WHERE id = '"+v.Get("id")+"' and sensortype = '"+v.Get("type")+"' and time > "+v.Get("start")+" and time < "+v.Get("end"), "MacWater", "ns")
		if response, err := c.Query(q); err == nil && response.Error() == nil {
			w.Header().Set("Content-Type", "application/json")
			sensorID := response.Results[0].Series[0].Values[0][1]
			sensorType := response.Results[0].Series[0].Values[0][2]
			dataLength := len(response.Results[0].Series[0].Values)
			sensorData := make([][2]string, dataLength)
			for i := 0; i < dataLength; i++ {
				sensorData[i][0] = response.Results[0].Series[0].Values[i][0].(json.Number).String()
				sensorData[i][1] = response.Results[0].Series[0].Values[i][3].(json.Number).String()
			}
			json.NewEncoder(w).Encode(&ResultData{Id: sensorID,
				Type: sensorType,
				Data:        sensorData})
		}
	}
}

// Add new data to database
func CreateData(w http.ResponseWriter, r *http.Request) {
	v := r.URL.Query()
	
	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: "http://localhost:8086",
	})
	if err != nil {
		fmt.Println("Error creating InfluxDB Client: ", err.Error())
	}
	defer c.Close()
	
	bp, _ := client.NewBatchPoints(client.BatchPointsConfig{
		Database:  "MacWater",
		Precision: "ms",
	})
	
	b := v.Get("data")
	if (b != "") {
		numNodes, err := strconv.ParseUint(string(b[0:2]), 16, 0)
		if err != nil {
			fmt.Println("Error: ", err.Error())
		}

		currIndex := 2;
		for node := uint64(0); node < numNodes; node++ {
			id, err := strconv.ParseInt(string(b[currIndex+2:currIndex+4]) + string(b[currIndex:currIndex+2]), 16, 0)
			if err != nil {
				fmt.Println("Error: ", err.Error())
			}
			currIndex += 4

			numLocations, err := strconv.ParseUint(string(b[currIndex:currIndex+2]), 16, 0)
			if err != nil {
				fmt.Println("Error: ", err.Error())
			}
			currIndex += 2

			var name string
			if (numLocations > 0) {
				nameLen, err := strconv.ParseUint(string(b[currIndex:currIndex+2]), 16, 0)
				if err != nil {
					fmt.Println("Error: ", err.Error())
				}
				currIndex += 2

				for i := uint64(0); i < nameLen; i++  {
					currInt, err := strconv.ParseInt(string(b[currIndex:currIndex+2]), 16, 0)
					if err != nil {
						fmt.Println("Error: ", err.Error())
					}
					currIndex += 2

					name += string(currInt)
				}
			}

			var locations []uint64
			currLocIndex := uint64(0)

			for i := uint64(0); i < numLocations; i++  {
				currLocation, err := strconv.ParseUint(string(b[currIndex:currIndex+2]), 16, 0)
				if err != nil {
					fmt.Println("Error: ", err.Error())
				}
				currIndex += 2

				locations = append(locations, currLocation);
			}

			numTypes, err := strconv.ParseUint(string(b[currIndex:currIndex+2]), 16, 0)
			if err != nil {
				fmt.Println("Error: ", err.Error())
			}
			currIndex += 2

			var types []string
			for i := uint64(0); i < numTypes; i++ {
				currLen, err := strconv.ParseUint(string(b[currIndex:currIndex+2]), 16, 0)
				if err != nil {
					fmt.Println("Error: ", err.Error())
				}
				currIndex += 2

				currType := ""
				for j := uint64(0); j < currLen; j++ {
					currInt, err := strconv.ParseInt(string(b[currIndex:currIndex+2]), 16, 0)
					if err != nil {
						fmt.Println("Error: ", err.Error())
					}
					currIndex += 2

					currType += string(currInt)
				}

				types = append(types, currType)
			}

			numData, err := strconv.ParseUint(string(b[currIndex:currIndex+2]), 16, 0)
			if err != nil {
				fmt.Println("Error: ", err.Error())
			}
			currIndex += 2

			for i := uint64(0); i < numData; i++ {
				currTimeStr := string(b[currIndex+6:currIndex+8]) + string(b[currIndex+4:currIndex+6]) + string(b[currIndex+2:currIndex+4]) + string(b[currIndex:currIndex+2])
				currTime, err := strconv.ParseUint(currTimeStr, 16, 32)
				if err != nil {
					fmt.Println("Error: ", err.Error())
				}
				currIndex += 8

				if ((currLocIndex < numLocations) && (i + 1 == locations[currLocIndex])) {
					currLocIndex++

					currLatStr := string(b[currIndex+6:currIndex+8]) + string(b[currIndex+4:currIndex+6]) + string(b[currIndex+2:currIndex+4]) + string(b[currIndex:currIndex+2])
					currLatInt, err := strconv.ParseUint(currLatStr, 16, 32)
					if err != nil {
						fmt.Println("Error: ", err.Error())
					}
					currIndex += 8

					currLat := math.Float32frombits(uint32(currLatInt))


					currLonStr := string(b[currIndex+6:currIndex+8]) + string(b[currIndex+4:currIndex+6]) + string(b[currIndex+2:currIndex+4]) + string(b[currIndex:currIndex+2])
					currLonInt, err := strconv.ParseUint(currLonStr, 16, 32)
					if err != nil {
						fmt.Println("Error: ", err.Error())
					}
					currIndex += 8

					currLon := math.Float32frombits(uint32(currLonInt))


					currLoc := fmt.Sprintf("%f", currLat) + "," + fmt.Sprintf("%f", currLon)

					tags := map[string]string{"id": strconv.Itoa(int(id)), "name": name}
					fields := map[string]interface{}{
						"value": currLoc,
					}
					pt, err := client.NewPoint("sensorInfo", tags, fields, time.Unix(int64(currTime), 0))
					if err != nil {
						fmt.Println("Error: ", err.Error())
					}
					bp.AddPoint(pt)
				}

				for j := uint64(0); j < numTypes; j++ {
					currDataStr := string(b[currIndex+6:currIndex+8]) + string(b[currIndex+4:currIndex+6]) + string(b[currIndex+2:currIndex+4]) + string(b[currIndex:currIndex+2])
					currDataInt, err := strconv.ParseUint(currDataStr, 16, 32)
					if err != nil {
						fmt.Println("Error: ", err.Error())
					}
					currIndex += 8

					currData := math.Float32frombits(uint32(currDataInt))

					// Create a point and add to batch
					tags := map[string]string{"id": strconv.Itoa(int(id)), "sensortype": types[j]}
					fields := map[string]interface{}{
						"value": currData,
					}
					pt, err := client.NewPoint("sensorMeasurements", tags, fields, time.Unix(int64(currTime), 0))
					if err != nil {
						fmt.Println("Error: ", err.Error())
					}
					bp.AddPoint(pt)
				}
			}
		}
	} else {
		id := v.Get("id")
		sensorType := v.Get("type")
		
		value, err := strconv.ParseFloat(v.Get("value"), 32)
		if err != nil {
			fmt.Println("Error: ", err.Error())
		}
		
		Time, err := strconv.ParseUint(v.Get("time"), 10, 32)
		if err != nil {
			fmt.Println("Error: ", err.Error())
		}
		
		tags := map[string]string{"id": id, "sensortype": sensorType}
		fields := map[string]interface{}{
			"value": value,
		}
		
		pt, err := client.NewPoint("sensorMeasurements", tags, fields, time.Unix(int64(Time), 0))
		if err != nil {
			fmt.Println("Error: ", err.Error())
		}
		
		bp.AddPoint(pt)
	}
	
	err = c.Write(bp)
	if err != nil {
		fmt.Println("Error: ", err.Error())
	}
}

func arrayContains(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}
	return false
}

// new func for API-7&8
func GetProbeData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	//params := mux.Vars(r)
	v := r.URL.Query()

	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: "http://localhost:8086",
	})
	if err != nil {
	}
	defer c.Close()
	// API 7
	// GetProbeLevels
	if (v.Get("id") == "") {
		sensorType := v.Get("type")
		// qy:="SELECT *, MAX(time) FROM sensorMeasurements GROUP BY id ORDER BY id "
		// s := client.NewQuery("SELECT * FROM sensorMeasurements WHERE sensortype = " + sensorType + " ORDER BY time DESC")
		// s := client.NewQuery(qy, "MacWater", "ns")
		s := client.NewQuery("SELECT * FROM sensorMeasurements WHERE sensortype='" + sensorType + "' ", "MacWater", "ns")
		if response, err := c.Query(s); err == nil && response.Error() == nil {
			dataArr := [][]string{}
			// find all distinct id
			//for all distinct id, SELECT sensorTime, LAST(value) as sensorValue, sensortype,  FROM "sensorMeasurements" where sensortype=sensortype and id=sensorid
			idArr := []string{}
			for i := 0; i < len(response.Results[0].Series[0].Values); i++ { 
				sensorId := response.Results[0].Series[0].Values[i][1].(string)
				if (arrayContains(idArr, sensorId)) {
					continue
				} else {
					idArr = append(idArr, sensorId)
				}
			}
			for i := 0; i < len(idArr); i++ {
				currentId := idArr[i]
				sq := client.NewQuery("SELECT LAST(value) FROM sensorMeasurements WHERE sensortype = '" + sensorType + "' and id = '" + currentId + "'", "MacWater", "ns")
				if response, err := c.Query(sq); err == nil && response.Error() == nil { 
					sensorTime := response.Results[0].Series[0].Values[0][0]
					sensorValue := response.Results[0].Series[0].Values[0][1]
					q := client.NewQuery("SELECT LAST(value), \"name\" FROM sensorInfo WHERE id='" + currentId + "'", "MacWater", "ns")
					if response, err := c.Query(q); err == nil && response.Error() == nil {
						sensorName := response.Results[0].Series[0].Values[0][2]
						sensorCoords := response.Results[0].Series[0].Values[0][1]
						currArr := []string{}
						currArr = append(currArr, currentId)
						currArr = append(currArr, sensorName.(string))
						currArr = append(currArr, sensorCoords.(string))
						currArr = append(currArr, sensorTime.(json.Number).String())
						currArr = append(currArr, sensorValue.(json.Number).String())
						// level comparing
						currArr = append(currArr, strconv.Itoa(levelCompare(sensorType, sensorValue.(json.Number).String())))
						dataArr = append(dataArr, currArr)
					}

				}
			}
			json.NewEncoder(w).Encode(&ResultLevel{
				Type: sensorType,
				Data: dataArr})
		} 
	// API 8
	// GetTimeProbeData
	} else {
		sensorID := v.Get("id")
		sensorType := v.Get("type")
		start := v.Get("startTime")
		end := v.Get("endTime")
		q := client.NewQuery("SELECT LAST(value), \"name\" FROM sensorInfo WHERE id='" + sensorID + "'", "MacWater", "ns")
		if response, err := c.Query(q); err == nil && response.Error() == nil {
			sensorName := response.Results[0].Series[0].Values[0][2]
			s := client.NewQuery("SELECT * FROM sensorMeasurements WHERE id = '"+ sensorID +"' and sensortype = '"+ sensorType +"' and time > "+ start +" and time < "+ end, "MacWater", "ns")
			if res, err := c.Query(s); err == nil && res.Error() == nil {
				dataArr := [][]string{}
				for i := 0; i < len(res.Results[0].Series[0].Values); i++ {
					sensorValue := res.Results[0].Series[0].Values[i][3]
					sensorTime := res.Results[0].Series[0].Values[i][0]					
					currArr := []string{}
					currArr = append(currArr, sensorTime.(json.Number).String())
					currArr = append(currArr, sensorValue.(json.Number).String())
					dataArr = append(dataArr, currArr)
				}
				json.NewEncoder(w).Encode(&ResultTime{
					Id: sensorID,
					Name: sensorName,
					Type: sensorType,
					Data: dataArr})
			}	
		}
	}
}

var airTempL float64 =0.0
var airTempH float64 =15.0
var condutivityL float64 =200.0
var condutivityH float64 =1000.0
var DissolvedOxygenL float64 =4.0
var DissolvedOxygenH float64 =9.0
var humidityL float64 =20.0
var humidityH float64 =40.0
var ph float64 =7.0
var temperatureL float64 =0.0
var temperatureH float64 =15.0
var turbidityL float64 =50.0
var turbidityH float64 =100.0
var waterTempL float64 =0.0
var waterTempH float64 =15.0

// 0=low, 1=medium, 2=high
// p is sensortype, v is the input string
func levelCompare(p string, v string) int {
	value, err := strconv.ParseFloat(v, 32)
	if err == nil {
		if (p == "Air Temperature") {
			if (value < airTempL) {
				return 0
			}
			if (airTempL <= value && value <= airTempH) {
				return 1
			}
			if (value > airTempH) {
				return 2
			}
		} 
		if (p == "Condutivity") {
			if (value < condutivityL) {
				return 0
			}
			if (condutivityL <= value && value <= condutivityH) {
				return 1
			}
			if (value > condutivityH) {
				return 2
			}
		} 
		if (p == "Dissolved Oxygen") {
			if (value < DissolvedOxygenL) {
				return 0
			}
			if (DissolvedOxygenL <= value && value <= DissolvedOxygenH) {
				return 1
			}
			if (value > DissolvedOxygenH) {
				return 2
			}
		} 
		if (p == "Humidity") {
			if (value < humidityL) {
				return 0
			}
			if (humidityL <= value && value <= humidityH) {
				return 1
			}
			if (value > humidityH) {
				return 2
			}
			
		} 
		if (p ==  "PH") {
			if (value < ph ) {
				return 0
			}
			if (value == ph) {
				return 1
			}
			if (value > ph) {
				return 2
			}
			
		} 
		if (p == "Temperature") {
			if (value < temperatureL) {
				return 0
			}
			if (temperatureL <= value && value <= temperatureH) {
				return 1
			}
			if (value > temperatureH) {
				return 2
			}
			
		} 
		if (p == "Turbidity") {
			if (value < turbidityL) {
				return 0
			}
			if (turbidityL <= value && value <= turbidityH) {
				return 1
			}
			if (value > turbidityH) {
				return 2
			}
		} 
		if (p == "Water Temperature") {
			if (value < waterTempL) {
				return 0
			}
			if (waterTempL <= value && value <= waterTempH) {
				return 1
			}
			if (value > waterTempH) {
				return 2
			}
			
		} else {
			// incorrect sensor type
			return -1
		}
	}
	// err != nil, when there is err
	return -2
}

func ModifyById (w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	//params := mux.Vars(r)
	v := r.URL.Query()

	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: "http://localhost:8086",
	})
	if err != nil {
	}
	defer c.Close()
	// table := v.Get("table")
	id := v.Get("id")
	// time := v.Get("time")
	sensortype_before := v.Get("typeBefore")
	sensortype_after := v.Get("typeAfter")
	// name := v.Get("name")
	// value := v.Get("value")
	if (id != "" && sensortype_before != "" && sensortype_after != "")  {
		// if (table == "sensorMeasurements") { 
			currDoc := client.NewQuery("SELECT * FROM sensorMeasurements WHERE id = '" + id + "' and sensortype = '" + sensortype_before + "'", "MacWater", "ns")
			if res, err := c.Query(currDoc); err == nil && res.Error() == nil {
				time := res.Results[0].Series[0].Values[0][0].(json.Number).string()
				value := res.Results[0].Series[0].Values[0][3].(json.Number).string()
				// if (time == "") {
				// 	time = res.Results[0].Series[0].Values[0][0].(json.Number).String()
				// }
				// if (sensortype == "") {
				// 	sensortype = res.Results[0].Series[0].Values[0][2].(string)
				// }
				// if (value == "") {
				// 	value = res.Results[0].Series[0].Values[0][3].(json.Number).String()
				// }
				delDoc := client.NewQuery("DELETE FROM sensorMeasurements WHERE id = '" + id + "' and sensortype = '" + sensortype_before + "'", "MacWater", "ns")
				if res, err := c.Query(delDoc); err == nil && res.Error() == nil {
				} else {
					fmt.Println("Table sensorMeasurements delDoc failed. Error: ", err.Error())
				}
				insertDoc := client.NewQuery("INSERT INTO sensorMeasurements (time, id, sensortype, value) VALUE (" + time + ", '" + id + "', '" + sensortype_after + "', " + value + ")", "MacWater", "ns")
				if res, err := c.Query(insertDoc); err == nil && res.Error() == nil {
				} else {
					fmt.Println("Table sensorMeasurements insertDoc failed. Error: ", err.Error())
				}
			} else {
				fmt.Println("Table sensorMeasurements get currDoc failed. Error: ", err.Error())
			}
		// }
		// if (table == "sensorInfo") {
		// 	currDoc := client.NewQuery("SELECT * FROM sensorInfo WHERE id = '" + id + "'", "MacWater", "ns")
		// 	if res, err := c.Query(currDoc); err == nil && res.Error() == nil{
		// 		if res, err := c.Query(currDoc); err == nil && res.Error() == nil { 
		// 			if (time == "") {
		// 				time = res.Results[0].Series[0].Values[0][0].(json.Number).String()
		// 			}
		// 			if (name == "") {
		// 				name = res.Results[0].Series[0].Values[0][2].(string)
		// 			}
		// 			if (value == "") {
		// 				value = res.Results[0].Series[0].Values[0][3].(string)
		// 			}
		// 			delDoc := client.NewQuery("DELETE FROM sensorInfo WHERE id = '" + id + "'", "MacWater", "ns")
		// 			if res, err := c.Query(delDoc); err == nil && res.Error() == nil {
		// 			} else {
		// 				fmt.Println("Table sensorInfo delDoc failed. Error: ", err.Error())
		// 			}
		// 			insertDoc := client.NewQuery("INSERT INTO  sensorInfo (time, id, name, value) VALUE (" + time + ", '" + id + "', '" + name + "', " + value + "')", "MacWater", "ns")
		// 			if res, err := c.Query(insertDoc); err == nil && res.Error() == nil {
		// 			} else {
		// 				fmt.Println("Table sensorInfo insertDoc failed. Error: ", err.Error())
		// 			}
		// 		}
		// 	} else {
		// 		fmt.Println("Table sensorInfo get currDoc failed. Error: ", err.Error())
		// 	}
		// }
	}
}

// Main function to boot up everything
func main() {
	router := mux.NewRouter()
	router.HandleFunc("/sensor/info", GetInfo).Methods("GET")
	router.HandleFunc("/sensor/info", CreateInfo).Methods("Post")
	router.HandleFunc("/sensor/type", GetType).Methods("GET")
	router.HandleFunc("/sensor/data", GetData).Methods("GET")
	router.HandleFunc("/sensor/data", CreateData).Methods("POST")
	router.HandleFunc("/sensor/probe", GetProbeData).Methods("GET")
	router.HandleFunc("/sensor/modify_by_id", ModifyById).Methods("PUT")
	fmt.Printf("Starting server for testing HTTP GET POST...\n")
	router.PathPrefix("").Handler(http.FileServer(http.Dir("react-sensor/dist")))
	log.Fatal(http.ListenAndServe(":80", router))
}
