// ================================
// Google Apps Script URL
// ================================
const API_URL =
  "https://script.google.com/macros/s/AKfycbxVn_4dimc2nIuRkYIyQq6562--1chPWzX6preYVj0dooyY8BqiXEQnn-5nqAytjp4B/exec";

// ================================
// Map
// ================================
let map = L.map("map").setView([13.7563, 100.5018], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
}).addTo(map);

let marker = L.marker([13.7563,100.5018]).addTo(map);

// ================================
// Chart
// ================================
const ctx = document.getElementById("waterChart").getContext("2d");

const waterChart = new Chart(ctx,{
    type:"line",
    data:{
        labels:[],
        datasets:[{
            label:"Water Level (m)",
            data:[],
            borderWidth:2,
            fill:false,
            tension:0.3
        }]
    },
    options:{
        responsive:true,
        maintainAspectRatio:false
    }
});

// ================================
// Load Data
// ================================
async function loadData(){

    try{

        const response = await fetch(API_URL + "?t=" + Date.now());

        const data = await response.json();

        if(!data.length) return;

        const latest = data[data.length-1];

        // ===== Dashboard =====
        document.getElementById("distance").innerHTML =
            Number(latest.distance).toFixed(3)+" m";

        document.getElementById("time").innerHTML =
            latest.time;

        document.getElementById("latitude").innerHTML =
            latest.latitude;

        document.getElementById("longitude").innerHTML =
            latest.longitude;

        document.getElementById("satellites").innerHTML =
            latest.satellites;

        // ===== Map =====
        if(latest.latitude!=0 && latest.longitude!=0){

            marker.setLatLng([
                latest.latitude,
                latest.longitude
            ]);

            map.setView([
                latest.latitude,
                latest.longitude
            ],16);

        }

        // ===== Chart =====
        waterChart.data.labels =
            data.map(x=>x.time);

        waterChart.data.datasets[0].data =
            data.map(x=>x.distance);

        waterChart.update();

        // ===== Table =====
        const tbody =
            document.getElementById("historyTable");

        tbody.innerHTML="";

        data.slice().reverse().forEach(item=>{

            tbody.innerHTML += `
            <tr>
                <td>${item.time}</td>
                <td>${Number(item.distance).toFixed(3)}</td>
                <td>${item.latitude}</td>
                <td>${item.longitude}</td>
                <td>${item.satellites}</td>
            </tr>`;

        });

    }
    catch(err){

        console.log(err);

    }

}

// โหลดครั้งแรก
loadData();

// โหลดทุก 10 วินาที
setInterval(loadData,10000);
