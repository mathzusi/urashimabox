/* =========================
   記憶
========================= */

const memories = {

    1:{
        title:"記憶①",
        text:"あなたは釣竿を持っていた。"
    },

    2:{
        title:"記憶②",
        text:"竜宮城には深海の間がある。"
    },

    3:{
        title:"記憶③",
        text:"失われた記憶が戻り始めている。"
    }

};


function createMemoryButton(number){

    const button =
        document.createElement("button");

    button.className =
        "memoryButton";

    button.textContent =
        memories[number].title;

    button.onclick = () => {
        showMemory(number);
    };

    document
        .getElementById("memoryPanel")
        .appendChild(button);
}


function showMemory(number,isNew=false){

    document
        .getElementById("viewerTitle")
        .textContent =
        isNew
        ? memories[number].title+"を手に入れた。"
        : memories[number].title;

    document
        .getElementById("viewerText")
        .textContent =
        memories[number].text;

    const img =
        document.getElementById("viewerImage");

    if(img){

        if(number===1){

            img.src="turizao.png";
            img.classList.remove("hidden");

        }else{

            img.classList.add("hidden");

        }

    }
    

    document
        .getElementById("memoryViewer")
        .classList.remove("hidden");
}

let nextPage = "";


function unlockMemory(number){

    if(
        localStorage.getItem("memory"+number)==="true"
    ){

        showMemory(number);
        return;
    }

    localStorage.setItem(
        "memory"+number,
        "true"
    );

    createMemoryButton(number);

    showMemory(number,true);
}


function closeMemoryViewer(){

    document
        .getElementById("memoryViewer")
        .classList.add("hidden");

    if(typeof nextPage !== "undefined" && nextPage!==""){

        location.href=nextPage;

    }

}


/* =========================
   霧
========================= */

function startFog(){

    const left =
        document.getElementById("fogLeft");

    const right =
        document.getElementById("fogRight");

    if(!left || !right){
        return;
    }

    left.style.display="block";
    right.style.display="block";

    setInterval(()=>{

        createFog("fogLeft");
        createFog("fogRight");

    },1000);
}


function createFog(id){

    const area =
        document.getElementById(id);

    if(!area){
        return;
    }

    const fog =
        document.createElement("div");

    fog.className="fog";

    fog.style.left =
        Math.random()*100+"px";

    area.appendChild(fog);

    setTimeout(()=>{

        fog.remove();

    },10000);
}


/* =========================
   煙
========================= */

function createSmoke(){

    const container =
        document.getElementById("smoke-container");

    if(!container){
        return;
    }

    for(let i=0;i<40;i++){

        const smoke =
            document.createElement("div");

        smoke.className="smoke";

        smoke.style.left =
            (window.innerWidth/2-60)
            +(Math.random()*120-60)
            +"px";

        smoke.style.top =
            (window.innerHeight/2-60)
            +(Math.random()*120-60)
            +"px";

        smoke.style.setProperty(
            "--dx",
            (Math.random()*600-300)+"px"
        );

        smoke.style.setProperty(
            "--dy",
            (Math.random()*400-200)+"px"
        );

        container.appendChild(smoke);

        setTimeout(()=>{

            smoke.remove();

        },4000);
    }
}


/* =========================
   ページ読み込み時
========================= */

window.addEventListener("load",function(){

    const memoryPanel =
        document.getElementById("memoryPanel");

    if(memoryPanel){

        for(let i=1;i<=3;i++){

            if(
                localStorage.getItem("memory"+i)==="true"
            ){

                createMemoryButton(i);

            }

        }

    }

    startFog();

});