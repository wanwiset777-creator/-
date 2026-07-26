//======================================================
// RMUTL Flood Monitor
// Google Sheets API
//======================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbxVn_4dimc2nIuRkYIyQq6562--1chPWzX6preYVj0dooyY8BqiXEQnn-5nqAytjp4B/exec";

const MAX_POINTS = 20;

let riverChart;
let land1Chart;
let land2Chart;

//==============================================
// เริ่มต้นระบบ
//==============================================

document.addEventListener("DOMContentLoaded",()=>{

    initCharts();

    updateClock();

    loadData();

    setInterval(updateClock,1000);

    // โหลดข้อมูลทุก 10 วินาที
    setInterval(loadData,10000);

});

//==============================================
// นาฬิกา
//==============================================

function updateClock(){

    document.getElementById("clock").innerHTML=
    new Date().toLocaleString("th-TH");

}

//==============================================
// สร้างกราฟ
//==============================================

function createChart(canvas,color){

    return new Chart(
        document.getElementById(canvas),
        {
            type:"line",

            data:{
                labels:[],
                datasets:[{

                    data:[],

                    borderColor:color,

                    backgroundColor:color+"30",

                    fill:true,

                    borderWidth:2,

                    tension:.4

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

                    x:{
                        grid:{
                            display:false
                        }
                    },

                    y:{
                        beginAtZero:true
                    }

                }

            }

        }
    );

}

//==============================================
// เริ่มกราฟ
//==============================================

function initCharts(){

    riverChart=createChart(
        "riverChart",
        "#2563eb"
    );

    land1Chart=createChart(
        "land1Chart",
        "#16a34a"
    );

    land2Chart=createChart(
        "land2Chart",
        "#f59e0b"
    );

}

//==============================================
// โหลดข้อมูลจาก Google Sheets
//==============================================

async function loadData(){

    try{

        showLoading(true);

        const response=
        await fetch(
            API_URL+"?t="+Date.now()
        );

        const data=
        await response.json();

        if(data.length==0){

            showLoading(false);

            return;

        }

        const latest=
        data[data.length-1];

        updateDashboard(
            latest,
            data
        );

        showLoading(false);

    }

    catch(err){

        console.log(err);

        showLoading(false);

    }

}//==============================================
// อัปเดต Dashboard
//==============================================

function updateDashboard(latest, history){

    // ---------- Station 01 ----------
    document.getElementById("riverValue").innerHTML =
        Number(latest.distance).toFixed(2);

    document.getElementById("lastDistance").innerHTML =
        Number(latest.distance).toFixed(2)+" m";

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

    // ---------- Status ----------
    updateRiverStatus(Number(latest.distance));

    // ---------- Google Map ----------
    const mapURL =
    "https://maps.google.com/maps?q="+
    latest.latitude+
    ","+
    latest.longitude+
    "&z=16&output=embed";

    document
        .getElementById("mapFrame")
        .src = mapURL;

    document
        .getElementById("riverMap")
        .href =
        "https://maps.google.com/?q="+
        latest.latitude+
        ","+
        latest.longitude;

    // ---------- Station 2 ----------
    document.getElementById("land1Value").innerHTML="0.00";
    document.getElementById("land1Status").innerHTML="ปกติ";

    // ---------- Station 3 ----------
    document.getElementById("land2Value").innerHTML="0.00";
    document.getElementById("land2Status").innerHTML="ปกติ";

    // ---------- Charts ----------
    updateCharts(history);

    // ---------- History ----------
    updateTable(history);

}

//==============================================
// สถานะระดับน้ำ
//==============================================

function updateRiverStatus(level){

    const status =
        document.getElementById("riverStatus");

    if(level < 2){

        status.innerHTML="ปกติ";

        status.className="status normal";

    }

    else if(level < 4){

        status.innerHTML="เฝ้าระวัง";

        status.className="status warning";

    }

    else{

        status.innerHTML="อันตราย";

        status.className="status danger";

    }

}

//==============================================
// กราฟ
//==============================================

function updateCharts(history){

    const lastData =
        history.slice(-MAX_POINTS);

    const labels =
        lastData.map(item=>item.time);

    const values =
        lastData.map(item=>Number(item.distance));

    riverChart.data.labels = labels;
    riverChart.data.datasets[0].data = values;
    riverChart.update();

    // Station 2
    land1Chart.data.labels = labels;
    land1Chart.data.datasets[0].data =
        values.map(()=>0);
    land1Chart.update();

    // Station 3
    land2Chart.data.labels = labels;
    land2Chart.data.datasets[0].data =
        values.map(()=>0);
    land2Chart.update();

}//==============================================
// ตารางข้อมูลย้อนหลัง
//==============================================

function updateTable(history){

    const tbody =
        document.querySelector("#historyTable tbody");

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

//==============================================
// Loading
//==============================================

function showLoading(show){

    const loading =
        document.getElementById("loading");

    loading.style.display =
        show ? "flex" : "none";

}

//==============================================
// Notification
//==============================================

function showNotification(text){

    const notify =
        document.getElementById("notify");

    const txt =
        document.getElementById("notifyText");

    txt.innerHTML = text;

    notify.style.display = "block";

    setTimeout(()=>{

        notify.style.display="none";

    },3000);

}

//==============================================
// เลือกวันที่ย้อนหลัง
//==============================================

document
.getElementById("historyDate")
.addEventListener("change",function(){

    loadData();

});

//==============================================
// เปิด Google Maps
//==============================================

function openGoogleMap(lat,lng){

    window.open(
        "https://maps.google.com/?q="+lat+","+lng,
        "_blank"
    );

}

//==============================================
// ตรวจสอบการเชื่อมต่อ
//==============================================

window.addEventListener("online",()=>{

    showNotification("เชื่อมต่ออินเทอร์เน็ตแล้ว");

});

window.addEventListener("offline",()=>{

    showNotification("ไม่มีการเชื่อมต่ออินเทอร์เน็ต");

});

//==============================================
// แจ้งเตือนระดับน้ำ
//==============================================

function checkAlarm(level){

    if(level>=4){

        showNotification("🚨 ระดับน้ำอยู่ในเกณฑ์อันตราย");

    }

    else if(level>=2){

        showNotification("⚠️ ระดับน้ำอยู่ในเกณฑ์เฝ้าระวัง");

    }

}

//==============================================
// เรียก Alarm ทุกครั้งหลังโหลดข้อมูล
//==============================================

const oldUpdateDashboard = updateDashboard;

updateDashboard = function(latest,history){

    oldUpdateDashboard(latest,history);

    checkAlarm(Number(latest.distance));

};

console.log("RMUTL Flood Monitor Ready");
