import React from 'react';
// import Chart from './chart';
import './App.css';
import axios from 'axios';
import ChartManager from './managers/ChartDataManager';
import Chartlist from './chartlist';
import RawChartData from './rawchartdata';
import RemoveButton from './removeButton';
import { QUERY_HEADERS, API_ADDRESS } from './settings';
import NewChartPopup from './NewChartPopup';

const manager = new ChartManager();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            charts: [],
            selectedChart: undefined,
        }

        this.addChartToState = this.saveChart.bind(this);
        this.onChangeSelectedChart = this.onChangeSelectedChart.bind(this);
        this.queryBackendForReturn = this.queryBackendForReturn.bind(this);
        this.resetCharts = this.resetCharts.bind(this);
        this.saveChart = this.saveChart.bind(this);
        this.setSelectedChartToNewest = this.setSelectedChartToNewest.bind(this);
    }

    /* ================ Lifecycle hooks ================ */

    componentDidMount() {
        const chartsArray = JSON.parse(localStorage.getItem('charts'));
        if (chartsArray)
            this.setState({ charts: [...chartsArray] });
        else
            console.log("Found no charts in LS to load");

        const selectedChartFromLS = JSON.parse(localStorage.getItem('selectedChart'));
        if (selectedChartFromLS) {
            this.setState({ selectedChart: selectedChartFromLS });
            console.log("Loaded selected chart from LS: " + selectedChartFromLS.name)
        }
        else
            console.log("Found no selected chart in LS");
    }

    componentWillUnmount() {
    }


    /* ================ onChange methods ================ */

    saveChart(chart) {
        // Saves to both state and localStorage
        this.setState({ charts: [...this.state.charts, chart] },
            () => {
                localStorage.setItem('charts', JSON.stringify(this.state.charts));
                console.log("Saved charts to LS: " + this.state.charts.length);
            }
        );
    }

    onChangeSelectedChart(e) {
        // Saves to both state and localStorage
        this.setState({ selectedChart: this.state.charts[e.target.value] },
            () => {
                localStorage.setItem('selectedChart', JSON.stringify(this.state.selectedChart));
                console.log("Saved current selection to LS: " + this.state.selectedChart.name);
            }
        );
    }

    setSelectedChartToNewest() {
        // Select the new chart. Need to figure out an alternate way eventually.
        this.onChangeSelectedChart({ target: { value: this.state.charts.length - 1 } });
    }



    // This should be in another section; will eventually reorganize
    resetCharts() {
        localStorage.removeItem('charts');
        localStorage.removeItem('selectedChart')
        this.setState({ charts: [] });
        this.setState({ selectedChart: undefined })
    }

    /* ================ Query methods ================ */

    async queryBackendForReturn() {
        const planet = "Moon";
        const harmonic = "4";
        const startDate = new Date("2019-12-20T00:00")
        const inputRadix = this.state.selectedChart;
        if (!inputRadix)
            alert("No base chart selected!");

        const query = manager.createReturnQuery(inputRadix, planet, harmonic, inputRadix.longitude,
            inputRadix.latitude, startDate, inputRadix.tz, 4)

        const response = await axios.post(
            API_ADDRESS + "/returns",
            query,
            { headers: QUERY_HEADERS }
        );

        let charts = response.data;
        try {
            if (charts.length === 0) {
                alert("No charts to create!");
                return;
            }
            console.log(charts);
            for (let c = 0; c < charts.length; c++) {
                const newChart = manager.createBiwheel(charts[c]);
                this.saveChart(newChart);
            }

            this.setSelectedChartToNewest();
        } catch (err) {
            console.log(err)
        }
    }

    render() {
        return (
            <div className="App">
                <div>
                    <RawChartData className="rawchartdata" chart={this.state.selectedChart} />
                </div>

                <Chartlist charts={this.state.charts ? this.state.charts : []} onChange={this.onChangeSelectedChart} />
                <NewChartPopup
                    saveChart={this.saveChart}
                    setSelectedChartToNewest={this.setSelectedChartToNewest}
                />
                <RemoveButton onClick={this.resetCharts} />
                <button onClick={this.queryBackendForReturn}>Returns</button>
            </div>
        );
    }
}

export default App;
