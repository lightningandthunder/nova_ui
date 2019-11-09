import React from 'react';
import './styles/App.css';

import Chartlist from './views/chartlist';
// import RawChartData from './views/rawchartdata';
import RemoveButton from './views/removeButton';
import NewChartPopup from './views/modals/NewChartPopup';
import ReturnChartPopup from './views/modals/ReturnChartPopup';
import logIfDevelopment from './utils/logIfDevelopment';
import Chart from './views/Chart';


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            charts: [],
            selectedChart: undefined,
            view: "ecliptical"
        }

        this.addChartToState = this.saveChart.bind(this);
        this.onChangeSelectedChart = this.onChangeSelectedChart.bind(this);
        this.resetCharts = this.resetCharts.bind(this);
        this.saveChart = this.saveChart.bind(this);
        this.setSelectedChartToNewest = this.setSelectedChartToNewest.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
    }

    /* ================ Lifecycle hooks ================ */

    componentDidMount() {
        window.novaDebugMode = false;
        const chartsArray = JSON.parse(localStorage.getItem('charts'));
        if (chartsArray)
            this.setState({ charts: [...chartsArray] });
        else
            logIfDevelopment("Found no charts in LS to load");

        const selectedChartFromLS = JSON.parse(localStorage.getItem('selectedChart'));
        if (selectedChartFromLS) {
            this.setState({ selectedChart: selectedChartFromLS });
            logIfDevelopment("Loaded selected chart from LS: " + selectedChartFromLS.name);
        }
        else
            logIfDevelopment("Found no selected chart in LS");
    }

    /* ================ onChange methods ================ */

    saveChart(chart) {
        // Saves to both state and localStorage
        this.setState({ charts: [...this.state.charts, chart] },
            () => {
                localStorage.setItem('charts', JSON.stringify(this.state.charts));
                logIfDevelopment("Saved charts to LS: " + this.state.charts.length);
            }
        );
    }

    onChangeSelectedChart(chart) {
        // Saves to both state and localStorage

        this.setState({ selectedChart: chart },
            () => {
                localStorage.setItem('selectedChart', JSON.stringify(this.state.selectedChart));
                logIfDevelopment("Saved current selection to LS: " + this.state.selectedChart.name);
            }
        );
    }

    setSelectedChartToNewest() {
        this.onChangeSelectedChart(this.state.charts[this.state.charts.length - 1]);
    }

    handleViewChange(e) {
        this.setState({ view: e.target.value });
    }



    // This should be in another section; will eventually reorganize
    resetCharts() {
        localStorage.removeItem('charts');
        localStorage.removeItem('selectedChart')
        this.setState({ charts: [] });
        this.setState({ selectedChart: undefined })
    }


    render() {
        return (
            <div className="App">
                {
                    this.state.selectedChart &&
                    this.state.selectedChart.type === "Uniwheel" &&
                    <Chart
                        width={window.innerWidth}
                        height={window.innerHeight}
                        chart={this.state.selectedChart}
                        view={this.state.view}
                        scaleFactor={1.4}
                    />
                }
                {
                    this.state.selectedChart &&
                    this.state.selectedChart.type === "Biwheel" &&
                    <Chart
                        width={window.innerWidth}
                        height={window.innerHeight}
                        chart={this.state.selectedChart}
                        view={this.state.view}
                        scaleFactor={1.4}
                    />
                }
                <div className="radioButtons">
                    <input type="radio"
                        id="ecliptical"
                        value="ecliptical"
                        checked={this.state.view === "ecliptical"}
                        onChange={this.handleViewChange}
                    />
                    <label>Ecliptical</label>
                    <input type="radio"
                        id="mundane"
                        value="mundane"
                        checked={this.state.view === "mundane"}
                        onChange={this.handleViewChange}
                    />
                    <label>Mundane</label>
                    <input type="radio"
                        id="right_ascension"
                        value="right_ascension"
                        checked={this.state.view === "right_ascension"}
                        onChange={this.handleViewChange}
                    />
                    <label>RightAscension</label>
                </div>
                {/* <RawChartData className="rawchartdata" chart={this.state.selectedChart} /> */}

                <Chartlist className="chartList"
                    charts={this.state.charts ? this.state.charts : []}
                    selectedChart={this.state.selectedChart}
                    onChangeSelectedChart={this.onChangeSelectedChart}
                />
                <NewChartPopup
                    saveChart={this.saveChart}
                    setSelectedChartToNewest={this.setSelectedChartToNewest}
                />
                {
                    this.state.selectedChart
                        ?
                        <ReturnChartPopup
                            saveChart={this.saveChart}
                            setSelectedChartToNewest={this.setSelectedChartToNewest}
                            selectedChart={this.state.selectedChart}
                        />
                        : <div></div>
                }
                <RemoveButton onClick={this.resetCharts} />
            </div >
        );
    }
}

export default App;
