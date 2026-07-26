// =====================================
// RMUTL Flood Monitoring Dashboard
// =====================================

// URL Google Apps Script
const API_URL =
"https://script.google.com/macros/s/AKfycbxVn_4dimc2nIuRkYIyQq6562--1chPWzX6preYVj0dooyY8BqiXEQnn-5nqAytjp4B/exec";

const MAX_DATA = 20;

let map;
let marker;

let riverChart;
let land1Chart;
let land2Chart;

// =====================================
// START
// =====================================

window.onload = function () {

    initClock();

    initCharts();

    initMap();

    loadData();

    setInterval(initClock,1000);

    setInterval(loadData,10000);

};

// =====================================
// CLOCK
// =====================================

function initClock(){

    const now = new Date();

    document.getElementById("clock").innerHTML =
        now.toLocaleString("th-TH");

}

// =====================================
// CREATE CHART
// =====================================

function createChart(id,color){

    return new Chart(

        document.getElementById(id),

        {

            type:"line",

            data:{

                labels:[],

                datasets:[{

                    label:"ระดับน้ำ",

                    data:[],

                    borderColor:color,

                    backgroundColor:color+"33",

                    fill:true,

                    tension:0.35,

                    borderWidth:2

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

        }

    );

}

function initCharts(){

    riverChart =
        createChart("riverChart","#2563eb");

    land1Chart =
        createChart("land1Chart","#16a34a");

    land2Chart =
        createChart("land2Chart","#f59e0b");

}

// =====================================
// MAP
// =====================================

function initMap(){

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

// =====================================
// LOAD DATA
// =====================================

async function loadData(){

    try{

        showLoading(true);

        const response = await fetch(

            API_URL + "?t=" + Date.now()

        );

        const history = await response.json();

        if(history.length===0){

            showLoading(false);

            return;

        }

        const latest = history[history.length-1];

        updateDashboard(

            latest,

            history

        );

        showLoading(false);

    }

    catch(err){

        console.log(err);

        showLoading(false);

    }

// =====================================
// UPDATE DASHBOARD
// =====================================

function updateDashboard(latest, history){

    const distance = Number(latest.distance);

    // ===== Station 01 =====

    document.getElementById("riverValue").textContent =
        distance.toFixed(2);

    document.getElementById("lastDistance").textContent =
        distance.toFixed(2);

    document.getElementById("lastTime").textContent =
        latest.time;

    document.getElementById("updateTime").textContent =
        latest.time;

    document.getElementById("lastLat").textContent =
        Number(latest.latitude).toFixed(6);

    document.getElementById("lastLng").textContent =
        Number(latest.longitude).toFixed(6);

    document.getElementById("lastSat").textContent =
        latest.satellites;

    // ===== Status =====

    const status =
        document.getElementById("riverStatus");

    status.className = "status";

    if(distance < 2){

        status.innerHTML = "🟢 ปกติ";
        status.classList.add("normal");

    }
    else if(distance < 4){

        status.innerHTML = "🟡 เฝ้าระวัง";
        status.classList.add("warning");

    }
    else{

        status.innerHTML = "🔴 อันตราย";
        status.classList.add("danger");

    }

    // ===== Station 02 =====

    document.getElementById("land1Value").textContent =
        "0.00";

    // ===== Station 03 =====

    document.getElementById("land2Value").textContent =
        "0.00";

    // ===== MAP =====

    updateMap(
        Number(latest.latitude),
        Number(latest.longitude)
    );

    // ===== CHART =====

    updateChart(history);

    // ===== TABLE =====

    updateTable(history);

}

// =====================================
// UPDATE MAP
// =====================================

function updateMap(lat, lng){

    marker.setLatLng([lat,lng]);

    map.setView([lat,lng],16);

}

// =====================================
// UPDATE CHART
// =====================================

function updateChart(history){

    const data =
        history.slice(-MAX_DATA);

    const labels =
        data.map(item=>item.time);

    const values =
        data.map(item=>Number(item.distance));

    // Station 01

    riverChart.data.labels = labels;

    riverChart.data.datasets[0].data =
        values;

    riverChart.update();

    // Station 02

    land1Chart.data.labels=[];

    land1Chart.data.datasets[0].data=[];

    land1Chart.update();

    // Station 03

    land2Chart.data.labels=[];

    land2Chart.data.datasets[0].data=[];

    land2Chart.update();

}
    // =====================================
// UPDATE HISTORY TABLE
// =====================================

function updateTable(history){

    const tbody =
        document.querySelector("#historyTable tbody");

    tbody.innerHTML = "";

    history
        .slice()
        .reverse()
        .forEach(item=>{

            const tr = document.createElement("tr");

            tr.innerHTML = `

                <td>${item.time}</td>

                <td>${Number(item.distance).toFixed(2)}</td>

                <td>${Number(item.latitude).toFixed(6)}</td>

                <td>${Number(item.longitude).toFixed(6)}</td>

                <td>${item.satellites}</td>

            `;

            tbody.appendChild(tr);

        });

}

// =====================================
// LOADING
// =====================================

function showLoading(show){

    const loading =
        document.getElementById("loading");

    loading.style.display =
        show ? "flex" : "none";

}

// =====================================
// NOTIFICATION
// =====================================

function showNotify(message){

    const notify =
        document.getElementById("notify");

    notify.innerHTML = message;

    notify.style.display = "block";

    setTimeout(()=>{

        notify.style.display = "none";

    },3000);

}

// =====================================
// CHECK UPDATE
// =====================================

let lastTime = "";

function checkNewData(time){

    if(lastTime===""){

        lastTime=time;

        return;

    }

    if(lastTime!==time){

        lastTime=time;

        showNotify("อัปเดตข้อมูลล่าสุดแล้ว");

    }

}

// =====================================
// WRAP UPDATE DASHBOARD
// =====================================

const oldUpdateDashboard = updateDashboard;

updateDashboard = function(latest,history){

    oldUpdateDashboard(latest,history);

    checkNewData(latest.time);

};

// =====================================
// INTERNET STATUS
// =====================================

window.addEventListener("online",()=>{

    showNotify("เชื่อมต่ออินเทอร์เน็ตแล้ว");

});

window.addEventListener("offline",()=>{

    showNotify("ไม่มีการเชื่อมต่ออินเทอร์เน็ต");

});

// =====================================
// CONSOLE
// =====================================

console.log("====================================");
console.log("RMUTL Flood Monitoring Dashboard");
console.log("Station 01 Connected");
console.log("Google Sheets Connected");
console.log("====================================");
