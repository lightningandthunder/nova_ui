import React from "react";
import Popup from "reactjs-popup";
import axios from "axios";

import ChartManager from "../../managers/ChartDataManager";
import geosearch from "../../utils/geosearch";
import { QUERY_HEADERS, API_ADDRESS } from "../../settings";
import LocationInput from "./LocationInput";
import Datepicker from "./datepicker";
import NameInput from "./NameInput";
import logIfDevelopment from "../../utils/logIfDevelopment";
import APMToggle from "./APMToggle";

const manager = new ChartManager();

export default class NewChartPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            nameInput: undefined,
            currentSelectedDatetime: undefined,
            apm: "AM",
            locationInput: undefined
        }
        this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
        this.handleAPMChange = this.handleAPMChange.bind(this);
        this.validateDateTime = this.validateDateTime.bind(this);
        this.convertApmToMilitaryTime = this.convertApmToMilitaryTime.bind(this);
        this.handleLocationChange = this.handleLocationChange.bind(this);
        this.queryBackendForRadix = this.queryBackendForRadix.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    };

    openPopup() {
        this.setState({ isOpen: true })
    }
    closePopup() {
        this.setState({ isOpen: false })
    }
    handleNameChange(event) {
        this.setState({ nameInput: event.target.value });
    }
    handleLocationChange(event) {
        this.setState({ locationInput: event.target.value });
    }
    handleDateTimeChange(event) {
        this.setState({ currentSelectedDatetime: event.target.value });
    }

    handleAPMChange(e) {
        if (this.state.apm === "AM")
            this.setState({ apm: "PM" })
        else
            this.setState({ apm: "AM" })
    }

    handleError(err) {
        //TODO: Eventually make this more robust
        alert(err.toString());
    }

    handleKeyDown(event) {
        // Recognize pressing return key
        if (event.keyCode === 13 && this.state.isOpen === true) {
            if (this.state.nameInput === "debug") {
                window.novaDebugMode = true;
                logIfDevelopment("Wizard mode activated");
                this.closePopup();
            } else {
                this.queryBackendForRadix();
            }
        }
    }

    validateDateTime() {
        // YYYY-mm-ddThh:mm in military time
        const dtRegex = /^[1-3]\d{3}-[01]\d-[0-3]\dT[0-5]\d:[0-5]\d/;
        return dtRegex.exec(this.state.currentSelectedDatetime) ? true : false;
    }

    convertApmToMilitaryTime(originalDate) {
        if (!this.validateDateTime()) {
            this.handleError("Invalid datetime!");
            return;
        }
        let d = new Date(originalDate);

        const apm = this.state.apm;
        const hour = d.getHours();
        if (hour === 12 && apm === "AM")
            d.setHours(0)
        else if (0 < hour < 12 && apm === "PM")
            d.setHours(hour + 12);
        return d.toISOString();
    }

    async queryBackendForRadix() {
        // Query back end for a single chart.

        const dt = this.convertApmToMilitaryTime(this.state.currentSelectedDatetime);

        const locationQuery = this.state.locationInput;
        if (!locationQuery || locationQuery.length === 0 || locationQuery.trim().length === 0) {
            this.handleError("Invalid location!");
            return;
        }

        const locationResults = await geosearch(locationQuery);
        if (!locationResults) {
            this.handleError("No location found! Please try a different location.");
            return;
        }

        const radixQuery = manager.createRadixQueryFromRaw(dt,
            locationResults.longitude,
            locationResults.latitude,
            locationResults.tz);

        logIfDevelopment("Radix query: ", radixQuery);
        const response = await axios.post(
            API_ADDRESS + "/radix",
            radixQuery,
            { headers: QUERY_HEADERS }
        );

        const err = response.data.err;
        if (err) {
            this.handleError(err);
            return;
        }

        try {
            const newChart = manager.createUniwheel(response.data, this.state.nameInput);
            logIfDevelopment("New chart: ", newChart);
            this.props.saveChart(newChart);
            this.props.setSelectedChartToNewest();
            this.closePopup();
            this.setState({apm: "AM"})
        } catch (err) {
            this.handleError(err);
        }
    }


    render() {
        return (
            <div onKeyDown={this.handleKeyDown}>
                <button onClick={this.openPopup}>New Chart</button>
                <Popup
                    className="popup"
                    position="right center"
                    modal
                    open={this.state.isOpen}
                    closeOnDocumentClick
                    onClose={this.closePopup}
                >
                    <div className="actions">
                        < NameInput onChange={this.handleNameChange} />
                        <div>
                            <Datepicker onChange={this.handleDateTimeChange} hourAndMinute={true} />
                            <APMToggle handleAPMChange={this.handleAPMChange} apm={this.state.apm} />
                        </div>
                        <LocationInput updateLocation={this.handleLocationChange} />
                        <div>
                            <button onClick={this.queryBackendForRadix}>Calculate</button>
                        </div>
                    </div>
                </Popup>
            </div>
        );
    }

}