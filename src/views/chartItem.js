import React from "react";

export default function ChartItem(props) {
    return (
        <div className={props.selected ? "selectedChartItem" : "unselectedChartItem"}
            onClick={() => props.onChangeSelectedChart(props.chart)}>
            {props.chart.name}

            <button
                id={props.chart.name}
                className="ChartDeleteButton"
                onClick={() => props.deleteChart(props.chart)}
            >
                del
            </button>
            {
                props.chart.type !== "Uniwheel" &&
                <button
                    id={props.chart.name}
                    className="ChartSplitButton"
                    onClick={() => props.splitCharts(props.chart)}
                >
                    split
            </button>
            }

        </div>
    );
}

/* 
* Nova, a free sidereal astrological tool.
* Copyright (C) 2019  Mike Verducci
* This project is under the GNU General Public License V3.
* The full license may be found in src/LICENSE.txt
*/