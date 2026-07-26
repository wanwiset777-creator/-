//=====================================
// RMUTL Flood Monitoring Dashboard
//=====================================

// ===== ใส่ URL Apps Script ของคุณ =====
const API_URL = "https://script.google.com/macros/s/AKfycbxVn_4dimc2nIuRkYIyQq6562--1chPWzX6preYVj0dooyY8BqiXEQnn-5nqAytjp4B/exec";

const MAX_POINTS = 20;

let riverChart;
let land1Chart;
let land2Chart;

let map;
let marker;

//=====================================
// เริ่มระบบ
//=====================================

window.onload = function () {

    initChart();

    initMap();

    updateClock();

    loadData();

    setInterval(updateClock,1000);

    setInterval(loadData,10000);

};

//=====================================
// นาฬิกา
//=====================================

function updateClock(){

    document.getElementById("clock").innerHTML =
        new Date().toLocaleString("th-TH");

}

//=====================================
// สร้างกราฟ
//=====================================

function createChart(canvas,color){

    return new Chart(document.getElementById(canvas),{

        type:"line",

        data:{
            labels:[],
            datasets:[{

                data:[],
                borderColor:color,
                backgroundColor:color+"33",
                fill:true,
                tension:.4,
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
            }

        }

    });

}

function initChart(){

    riverChart=createChart("riverChart","#2563eb");

    land1Chart=createChart("land1Chart","#16a34a");

    land2Chart=createChart("land2Chart","#f59e0b");

}

//=====================================
// แผนที่
//=====================================

function initMap(){

    map=L.map("map").setView([18.7904,98.9847],15);

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:"OpenStreetMap"

        }

    ).addTo(map);

    marker=L.marker([18.7904,98.9847]).addTo(map);

}

//=====================================
// โหลดข้อมูลจาก Google Sheets
//=====================================

async function loadData(){

    try{

        showLoading(true);

        const response=await fetch(API_URL+"?t="+Date.now());

        const history=await response.json();

        if(history.length===0){

            showLoading(false);

            return;

        }

        const latest=history[history.length-1];

        updateDashboard(latest,history);

        showLoading(false);

    }

    catch(err){

        console.log(err);

        showLoading(false);

    }
//=====================================
// อัปเดต Dashboard
//=====================================

function updateDashboard(latest, history){

    //============================
    // Station 01
    //============================

    const distance = Number(latest.distance);

    document.getElementById("riverValue").innerHTML =
        distance.toFixed(2);

    document.getElementById("lastDistance").innerHTML =
        distance.toFixed(2);

    document.getElementById("lastTime").innerHTML =
        latest.time;

    document.getElementById("updateTime").innerHTML =
        latest.time;

    document.getElementById("lastLat").innerHTML =
        latest.latitude;

    document.getElementById("lastLng").innerHTML =
        latest.longitude;

    document.getElementById("lastSat").innerHTML =
        latest.satellites;

    updateStatus(distance);

    //============================
    // Station 02
    //============================

    document.getElementById("land1Value").innerHTML =
        "0.00";

    //============================
    // Station 03
    //============================

    document.getElementById("land2Value").innerHTML =
        "0.00";

    //============================
    // Google Map
    //============================

    marker.setLatLng([
        Number(latest.latitude),
        Number(latest.longitude)
    ]);

    map.setView([
        Number(latest.latitude),
        Number(latest.longitude)
    ],16);

    //============================
    // Chart
    //============================

    updateCharts(history);

    //============================
    // History Table
    //============================

    updateHistory(history);

}

//=====================================
// สถานะระดับน้ำ
//=====================================

function updateStatus(level){

    const status =
        document.getElementById("riverStatus");

    status.className="status";

    if(level<2){

        status.innerHTML="ปกติ";

        status.classList.add("normal");

    }

    else if(level<4){

        status.innerHTML="เฝ้าระวัง";

        status.classList.add("warning");

    }

    else{

        status.innerHTML="อันตราย";

        status.classList.add("danger");

    }

}

//=====================================
// กราฟ
//=====================================

function updateCharts(history){

    const last20 =
        history.slice(-MAX_POINTS);

    const labels =
        last20.map(item=>item.time);

    const values =
        last20.map(item=>Number(item.distance));

    // Station01
    riverChart.data.labels=labels;
    riverChart.data.datasets[0].data=values;
    riverChart.update();

    // Station02 ยังไม่ติดตั้ง
    land1Chart.data.labels=[];
    land1Chart.data.datasets[0].data=[];
    land1Chart.update();

    // Station03 ยังไม่ติดตั้ง
    land2Chart.data.labels=[];
    land2Chart.data.datasets[0].data=[];
    land2Chart.update();

}
    //=====================================
// ตารางข้อมูลย้อนหลัง
//=====================================

function updateHistory(history){

    const tbody = document.querySelector("#historyTable tbody");

    tbody.innerHTML = "";

    history
        .slice()
        .reverse()
        .forEach(item=>{

            tbody.innerHTML += `
                <tr>
                    <td>${item.time}</td>
                    <td>${Number(item.distance).toFixed(2)}</td>
                    <td>${item.latitude}</td>
                    <td>${item.longitude}</td>
                    <td>${item.satellites}</td>
                </tr>
            `;

        });

}

//=====================================
// Loading
//=====================================

function showLoading(show){

    const loading = document.getElementById("loading");

    loading.style.display = show ? "flex" : "none";

}

//=====================================
// Notification
//=====================================

function showNotification(message){

    const notify = document.getElementById("notify");

    notify.innerHTML = message;

    notify.style.display = "block";

    setTimeout(()=>{

        notify.style.display = "none";

    },3000);

}

//=====================================
// แจ้งเตือนเมื่อข้อมูลใหม่เข้ามา
//=====================================

let lastUpdate = "";

function checkNewData(time){

    if(lastUpdate===""){

        lastUpdate=time;
        return;

    }

    if(lastUpdate!==time){

        lastUpdate=time;

        showNotification("อัปเดตข้อมูลล่าสุดแล้ว");

    }

}

//=====================================
// เรียกหลังโหลดข้อมูล
//=====================================

const oldDashboard = updateDashboard;

updateDashboard = function(latest,history){

    oldDashboard(latest,history);

    checkNewData(latest.time);

};

//=====================================
// ตรวจสอบอินเทอร์เน็ต
//=====================================

window.addEventListener("online",()=>{

    showNotification("เชื่อมต่ออินเทอร์เน็ตแล้ว");

});

window.addEventListener("offline",()=>{

    showNotification("ไม่มีการเชื่อมต่ออินเทอร์เน็ต");

});

//=====================================
// Console
//=====================================

console.log("====================================");
console.log("RMUTL Flood Monitoring Dashboard");
console.log("Google Sheets Connected");
console.log("====================================");
