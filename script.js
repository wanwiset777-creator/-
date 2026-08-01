// ======================================
// RMUTL FLOOD MONITOR DASHBOARD V2
// ======================================

const API_URL =
"https://script.google.com/macros/s/AKfycbxVn_4dimc2nIuRkYIyQq6562--1chPWzX6preYVj0dooyY8BqiXEQnn-5nqAytjp4B/exec";

let riverChart;
let map;
let marker;

let allHistory = [];
let currentHistory = [];

// ======================================
// START
// ======================================

window.addEventListener("load",()=>{

    createChart();

    createMap();

    loadData();

    updateClock();

    setInterval(updateClock,1000);

    setInterval(loadData,60000);

});

// ======================================
// CLOCK
// ======================================

function updateClock(){

    document.getElementById("clock").innerHTML=
    new Date().toLocaleString("th-TH");

}

// ======================================
// CREATE CHART
// ======================================

function createChart(){

    const canvas=document.getElementById("riverChart");

    const ctx=canvas.getContext("2d");

    const gradient=
    ctx.createLinearGradient(0,0,0,350);

    gradient.addColorStop(0,"rgba(37,99,235,.45)");
    gradient.addColorStop(.6,"rgba(59,130,246,.20)");
    gradient.addColorStop(1,"rgba(255,255,255,0)");

    riverChart=new Chart(ctx,{

        type:"line",

        data:{

            labels:[],

            datasets:[{

                label:"ระดับน้ำ",

                data:[],

                borderColor:"#2563eb",

                backgroundColor:gradient,

                fill:true,

                borderWidth:4,

                tension:.45,

                pointRadius:4,

                pointHoverRadius:7,

                pointBackgroundColor:"#ffffff",

                pointBorderColor:"#2563eb",

                pointBorderWidth:2

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            interaction:{
                mode:"index",
                intersect:false
            },

            animation:{
                duration:1200
            },

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

                    beginAtZero:true,

                    ticks:{

                        callback:(v)=>v+" m"

                    }

                }

            }

        }

    });

}

// ======================================
// LOAD DATA
// ======================================

async function loadData(){

    showLoading(true);

    try{

        const res=await fetch(API_URL+"?t="+Date.now());

        allHistory=await res.json();

        if(!Array.isArray(allHistory)) return;

        currentHistory=[...allHistory];

        const latest=currentHistory[currentHistory.length-1];

        updateDashboard(latest);

        updateChart(currentHistory);

        updateHistoryTable(currentHistory);

        updateSummary(currentHistory);

        updateMap(latest);

        showNotify("อัปเดตข้อมูลล่าสุดแล้ว");

    }

    catch(err){

        console.error(err);

    }

    finally{

        showLoading(false);

    }

}

// ======================================
// SEARCH BY DATE
// ======================================

function searchHistory(){

    const value=
    document.getElementById("historyDate").value;

    if(value===""){

        loadData();

        return;

    }

    currentHistory=

    allHistory.filter(item=>{

        return item.time.startsWith(value);

    });

    if(currentHistory.length===0){

        alert("ไม่พบข้อมูล");

        return;

    }

    updateChart(currentHistory);

    updateHistoryTable(currentHistory);

    updateSummary(currentHistory);

}

// ======================================
// TODAY
// ======================================

function loadToday(){

    document.getElementById("historyDate").value="";

    loadData();

}
// ======================================
// UPDATE DASHBOARD
// ======================================

function updateDashboard(data){

    const distance = Number(data.distance) || 0;
    const lat = Number(data.latitude) || 0;
    const lng = Number(data.longitude) || 0;
    const sat = Number(data.satellites) || 0;

    const time = new Date(data.time)
    .toLocaleString("th-TH");

    document.getElementById("riverValue").innerHTML =
    distance.toFixed(2);

    document.getElementById("lastDistance").innerHTML =
    distance.toFixed(2);

    document.getElementById("lastTime").innerHTML =
    time;

    document.getElementById("updateTime").innerHTML =
    time;

    document.getElementById("lastLat").innerHTML =
    lat.toFixed(6);

    document.getElementById("lastLng").innerHTML =
    lng.toFixed(6);

    document.getElementById("lastSat").innerHTML =
    sat;

    const status =
    document.getElementById("riverStatus");

    if(distance < 2){

        status.className="status normal";

        status.innerHTML="🟢 ปกติ";

    }

    else if(distance < 4){

        status.className="status warning";

        status.innerHTML="🟡 เฝ้าระวัง";

    }

    else{

        status.className="status danger";

        status.innerHTML="🔴 อันตราย";

    }

}

// ======================================
// UPDATE CHART
// ======================================

function updateChart(history){

    if(!riverChart) return;

    const labels =
    history.map(item=>{

        return new Date(item.time)
        .toLocaleTimeString("th-TH",{

            hour:"2-digit",

            minute:"2-digit"

        });

    });

    const values =
    history.map(item=>

        Number(item.distance)||0

    );

    riverChart.data.labels = labels;

    riverChart.data.datasets[0].data = values;

    riverChart.update();

}

// ======================================
// SUMMARY
// ======================================

function updateSummary(history){

    if(history.length===0) return;

    const values =
    history.map(i=>Number(i.distance)||0);

    const max =
    Math.max(...values);

    const min =
    Math.min(...values);

    const avg =
    values.reduce(

        (a,b)=>a+b,0

    )/values.length;

    document.getElementById("maxValue")
    .innerHTML=max.toFixed(2);

    document.getElementById("minValue")
    .innerHTML=min.toFixed(2);

    document.getElementById("avgValue")
    .innerHTML=avg.toFixed(2);

    document.getElementById("historyMax")
    .innerHTML=max.toFixed(2);

    document.getElementById("historyMin")
    .innerHTML=min.toFixed(2);

    document.getElementById("historyAvg")
    .innerHTML=avg.toFixed(2);

    document.getElementById("historyCount")
    .innerHTML=history.length;

}

// ======================================
// MAP
// ======================================

function updateMap(data){

    if(!map) return;

    const lat =
    Number(data.latitude);

    const lng =
    Number(data.longitude);

    if(lat===0 || lng===0) return;

    marker.setLatLng([lat,lng]);

    marker.bindPopup(

        `
        <b>Station 01</b><br>

        ระดับน้ำ :
        ${Number(data.distance).toFixed(2)} m

        <br>

        Satellite :
        ${data.satellites}
        `

    );

    map.setView(

        [lat,lng],

        16,

        {

            animate:true,

            duration:1

        }

    );

}
