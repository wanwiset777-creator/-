// ======================================
// RMUTL FLOOD MONITOR
// ======================================

// ===== Apps Script =====
const API_URL =
"https://script.google.com/macros/s/AKfycbxVn_4dimc2nIuRkYIyQq6562--1chPWzX6preYVj0dooyY8BqiXEQnn-5nqAytjp4B/exec";

const MAX_HISTORY = 20;

let riverChart;
let map;
let marker;

// ======================================
// START
// ======================================

window.addEventListener("load", () => {

    createChart();

    createMap();

    loadData();

    updateClock();

    setInterval(updateClock,1000);

    setInterval(loadData,10000);

});

// ======================================
// CLOCK
// ======================================

function updateClock(){

    const now = new Date();

    const txt = now.toLocaleString("th-TH");

    const el = document.getElementById("clock");

    if(el){

        el.innerHTML = txt;

    }

}

// ======================================
// CHART
// ======================================

function createChart(){

    const ctx =
    document.getElementById("riverChart");

    if(!ctx) return;

    riverChart = new Chart(ctx,{

        type:"line",

        data:{

            labels:[],

            datasets:[{

                label:"ระดับน้ำ",

                data:[],

                borderColor:"#1d4ed8",

                backgroundColor:"rgba(59,130,246,.15)",

                fill:true,

                tension:.4,

                borderWidth:3,

                pointRadius:3

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    display:false
                }

            },

            scales:{

                y:{
                    beginAtZero:true
                }

            }

        }

    });

}

// ======================================
// MAP
// ======================================

function createMap(){

    const div = document.getElementById("map");

    if(!div) return;

    map = L.map("map").setView(
        [18.79038,98.98468],
        16
    );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:"© OpenStreetMap"

        }

    ).addTo(map);

    marker = L.marker(

        [18.79038,98.98468]

    ).addTo(map);

}
// ======================================
// LOAD DATA FROM GOOGLE SHEETS
// ======================================

async function loadData(){

    try{

        const response = await fetch(
            API_URL + "?t=" + Date.now()
        );

        if(!response.ok){

            throw new Error("HTTP Error");

        }

        const history = await response.json();

        if(!Array.isArray(history)) return;

        if(history.length===0) return;

        const latest = history[history.length-1];

        updateStation01(latest);

        updateChart(history);

        updateTable(history);

        updateMap(latest);

    }

    catch(err){

        console.error(err);

    }

}

// ======================================
// STATION 01
// ======================================

function updateStation01(data){

    const distance =
        parseFloat(data.distance) || 0;

    const time =
        new Date(data.time).toLocaleString("th-TH");

    const lat =
        parseFloat(data.latitude) || 0;

    const lng =
        parseFloat(data.longitude) || 0;

    const sat =
        parseInt(data.satellites) || 0;

    // ระดับน้ำ

    const river =
        document.getElementById("riverValue");

    if(river){

        river.innerHTML =
            distance.toFixed(2);

    }

    // เวลา

    const update =
        document.getElementById("updateTime");

    if(update){

        update.innerHTML = time;

    }

    const lastTime =
        document.getElementById("lastTime");

    if(lastTime){

        lastTime.innerHTML = time;

    }

    // พิกัด

    const lastLat =
        document.getElementById("lastLat");

    if(lastLat){

        lastLat.innerHTML =
            lat.toFixed(6);

    }

    const lastLng =
        document.getElementById("lastLng");

    if(lastLng){

        lastLng.innerHTML =
            lng.toFixed(6);

    }

    const lastSat =
        document.getElementById("lastSat");

    if(lastSat){

        lastSat.innerHTML = sat;

    }

    // ระดับน้ำล่าสุด

    const lastDistance =
        document.getElementById("lastDistance");

    if(lastDistance){

        lastDistance.innerHTML =
            distance.toFixed(2);

    }

    // ==================================
    // STATUS
    // ==================================

    const status =
        document.getElementById("riverStatus");

    if(status){

        if(distance < 2){

            status.innerHTML = "ปกติ";

            status.className =
            "status normal";

        }

        else if(distance < 4){

            status.innerHTML =
            "เฝ้าระวัง";

            status.className =
            "status warning";

        }

        else{

            status.innerHTML =
            "อันตราย";

            status.className =
            "status danger";

        }

    }

}
// ======================================
// UPDATE CHART
// ======================================

function updateChart(history){

    if(!riverChart) return;

    const data = history.slice(-MAX_HISTORY);

    const labels = data.map(item => {

        return new Date(item.time)
            .toLocaleTimeString("th-TH",{
                hour:"2-digit",
                minute:"2-digit"
            });

    });

    const values = data.map(item =>

        parseFloat(item.distance) || 0

    );

    riverChart.data.labels = labels;

    riverChart.data.datasets[0].data = values;

    riverChart.update();

}

// ======================================
// UPDATE MAP
// ======================================

function updateMap(data){

    if(!map || !marker) return;

    const lat = parseFloat(data.latitude);

    const lng = parseFloat(data.longitude);

    // ถ้ายังไม่มี GPS ไม่ต้องย้าย Marker
    if(isNaN(lat) || isNaN(lng)) return;

    if(lat===0 && lng===0) return;

    marker.setLatLng([lat,lng]);

    marker.bindPopup(

        `
        <b>Station 01</b><br>
        ระดับน้ำ : ${Number(data.distance).toFixed(2)} m
        `

    );

    map.setView([lat,lng],16);

}

// ======================================
// HISTORY TABLE
// ======================================

function updateTable(history){

    const tbody =
        document.querySelector("#historyTable tbody");

    if(!tbody) return;

    tbody.innerHTML = "";

    history
        .slice()
        .reverse()
        .forEach(item=>{

            const tr =
                document.createElement("tr");

            tr.innerHTML =

            `
            <td>${new Date(item.time).toLocaleString("th-TH")}</td>

            <td>${Number(item.distance).toFixed(2)}</td>

            <td>${Number(item.latitude).toFixed(6)}</td>

            <td>${Number(item.longitude).toFixed(6)}</td>

            <td>${item.satellites}</td>
            `;

            tbody.appendChild(tr);

        });

}
// ======================================
// LOADING
// ======================================

function showLoading(show){

    const loading = document.getElementById("loading");

    if(!loading) return;

    loading.style.display = show ? "flex" : "none";

}

// ======================================
// NOTIFICATION
// ======================================

function showNotify(message){

    const notify = document.getElementById("notify");

    if(!notify) return;

    notify.innerHTML = message;

    notify.style.display = "block";

    setTimeout(()=>{

        notify.style.display = "none";

    },3000);

}

// ======================================
// CHECK INTERNET
// ======================================

window.addEventListener("online",()=>{

    showNotify("เชื่อมต่ออินเทอร์เน็ตแล้ว");

});

window.addEventListener("offline",()=>{

    showNotify("ไม่มีการเชื่อมต่ออินเทอร์เน็ต");

});

// ======================================
// AUTO REFRESH MESSAGE
// ======================================

let previousTime = "";

setInterval(async ()=>{

    try{

        const response = await fetch(API_URL+"?t="+Date.now());

        const history = await response.json();

        if(!Array.isArray(history)) return;

        if(history.length===0) return;

        const latest = history[history.length-1];

        if(previousTime===""){

            previousTime = latest.time;

            return;

        }

        if(previousTime !== latest.time){

            previousTime = latest.time;

            showNotify("อัปเดตข้อมูลล่าสุดแล้ว");

        }

    }

    catch(err){

        console.log(err);

    }

},10000);

// ======================================
// START MESSAGE
// ======================================

console.clear();

console.log("===================================");

console.log("RMUTL Flood Monitoring Dashboard");

console.log("Station 01 : Connected");

console.log("Google Sheets : Connected");

console.log("Chart.js : Ready");

console.log("Leaflet : Ready");

console.log("===================================");
