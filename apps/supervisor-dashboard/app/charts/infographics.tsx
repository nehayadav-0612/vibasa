'use client';

import "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, defaults, scales,} from 'chart.js';
import chartdatalables from 'chartjs-plugin-datalabels';
import { Bar, Line } from "react-chartjs-2";
import { format } from "node:path";
import { wardno, residents } from "./chartdata";
import { title } from "node:process";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, chartdatalables); 

defaults.maintainAspectRatio = false; // Allow charts to fill their container
defaults.responsive = true; // Make charts responsive

// Function to generate random colors for chart elements
function dynamicColors(num) {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgba(" + r + "," + g + "," + b + ", " + num + ")"; // The 0.5 is for transparency
}


export const LineGraph = () => {
    const option = {
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 20 } }, // Start y-axis at zero and set step size
        },
        plugins: { 
            //Legend: { display: false }, // Hide legend if not needed
            //title: { display: true, text: 'Monthly Collections' },
            [chartdatalables.id]: { display: true, color: '#0f0f0f', font: { weight: 'normal' },align: 'top', anchor: 'end', formatter: (value: any) => `${value}` },
        },
    };

    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Collections',
                data: [65, 59, 80, 81, 56, 55],
                borderColor: dynamicColors(1), // Use the dynamic color function for line color
                backgroundColor: dynamicColors(0.5), // Use the dynamic color function for point background
            },
        ],
    };
    
    return <Line options={option} data={data} />; 
}

export const BarGraph = () => {
    const option = {
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 100},// Start y-axis at zero and set step size
                    title: { display: true, text: 'Number of Residents', color: '#0f0f0f', font: { size: 14 } } }, // Add y-axis title
            x: {title: { display: true, text: 'Ward Number', color: '#0f0f0f', font: { size: 14 } } }, // Add x-axis title
        },
        plugins: { 
            //Legend: { display: false }, // Hide legend if not needed
            //title: { display: true, text: 'Monthly Collections' },
            [chartdatalables.id]: { display: true, color: '#0f0f0f', font: { weight: 'normal' },align: 'top', anchor: 'end', formatter: (value: any) => `${value}` },
        },
    };

    const data = {
        labels: wardno, // Use the imported labels from chartdata.tsx
        datasets: [
            {
                label: 'Residents',
                data: residents, // Use the imported dataset from chartdata.tsx
                borderColor: '#1E7F5C',
                backgroundColor: dynamicColors(0.5), // Use the dynamic color function for background
                hoverBackgroundColor: dynamicColors(1), // Change color on hover
                barwidth: '10%',
                
            },
        ],
    };
    
    return <Bar options={option} data={data} />; 
}