//==============================
// Google Apps Script API
//==============================
const API_URL = "https://script.google.com/macros/s/AKfycbxVn_4dimc2nIuRkYIyQq6562--1chPWzX6preYVj0dooyY8BqiXEQnn-5nqAytjp4B/exec";

const configs = {
    river: { ctx: 'chart-river', color: '#0891b2', max: 6.0 },
    land1: { ctx: 'chart-land1', color: '#10b981', max: 3.0 },
    land2: { ctx: 'chart-land2', color: '#f59e0b', max: 3.0 }
};

let charts = {};

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("history-date").valueAsDate = new Date();

    Object.keys(configs).forEach(key=>{
        charts[key]=initChart(configs[key]);
    });

    updateClock();
    setInterval(updateClock,1000);

    loadData();

    // รีเฟรชข้อมูลทุก 10 วินาที
    setInterval(loadData,10000);

});

function initChart(config){

    return new Chart(document.getElementById(config.ctx),{

        type:"line",

        data:{
            labels:[],
            datasets:[{
                data:[],
                borderColor:config.color,
                backgroundColor:config.color+"20",
                fill:true,
                tension:.4
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                legend:{display:false}
            }
        }

    });

}

async function loadData(){

    try{

        const response=await fetch(API_URL+"?t="+Date.now());

        const data=await response.json();

        if(data.length==0) return;

        // ข้อมูลล่าสุด
        const latest=data[data.length-1];

        // ======= River =======
        updateStationUI(
            "river",
            Number(latest.distance),
            latest.time
        );

        // ตอนนี้ยังไม่มีเซ็นเซอร์จุด 2 และ 3
        updateStationUI("land1",0,latest.time);
        updateStationUI("land2",0,latest.time);

    }

    catch(e){

        console.log(e);

    }

}

function updateStationUI(id,val,time){

    document.getElementById(id+"-level").innerHTML=
        Number(val).toFixed(2);

    const chart=charts[id];

    chart.data.labels.push(time);

    chart.data.datasets[0].data.push(val);

    if(chart.data.labels.length>12){

        chart.data.labels.shift();

        chart.data.datasets[0].data.shift();

    }

    chart.update();

    const status=document.getElementById(id+"-status");

    if(id=="river"){

        if(val<2){

            status.innerHTML="ปกติ";
            status.className="text-center py-1 rounded-lg text-sm font-bold mb-4 bg-green-100 text-green-700";

        }else if(val<4){

            status.innerHTML="เฝ้าระวัง";
            status.className="text-center py-1 rounded-lg text-sm font-bold mb-4 bg-yellow-100 text-yellow-700";

        }else{

            status.innerHTML="อันตราย";
            status.className="text-center py-1 rounded-lg text-sm font-bold mb-4 bg-red-500 text-white animate-pulse";

        }

    }

}

function handleDateChange(date){

    console.log(date);

}

function openMap(lat,lng){

    window.open(
        `https://www.google.com/maps?q=${lat},${lng}`,
        "_blank"
    );

}

function updateClock(){

    document.getElementById("current-time").innerHTML=
        new Date().toLocaleString("th-TH");

}
