/* =========================
   記憶
========================= */

const memories = {

    1:{
        title:"記憶①",
        text:"あなたは釣竿を持っていた。\n この記憶を持っている時は、5の謎に釣竿のイラストを描こう。"
    },

    2:{
        title:"記憶②",
        text:"竜宮城には深海の部屋がある。"
    },

    3:{
        title:"記憶③",
        text:"竜宮城で行われる祭りは珊瑚祭りである。"
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

    const img = document.getElementById("viewerImage");

if(img){

    if(number === 1){

        img.src = "turizao.png";
        img.classList.remove("hidden");

    }else if(number === 2){

        img.src = "tizu.png";
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

    const page = location.pathname.split("/").pop();

    if(page === "index.html" || page === "" || page.endsWith("a.html")) return;

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

// ページの分岐履歴を保存する
function saveRoute(step, route) {
    localStorage.setItem("route" + step, route);

    // それ以降のSTEPの履歴を削除
    for (let i = step + 1; i <= 3; i++) {
        localStorage.removeItem("route" + i);
    }
}

// ページの分岐履歴を取得する
function getRoute(step) {
    return localStorage.getItem("route" + step);
}

// 現在開いているページから分岐履歴を記録する
const currentPage = location.pathname.split("/").pop();

const pageRoutes = {
    "step2a.html": [1, "A"],
    "step2b.html": [1, "B"],
    "step3a.html": [2, "A"],
    "step3b.html": [2, "B"],
    "step4a.html": [3, "A"],
    "step4b.html": [3, "B"]
};

if (pageRoutes[currentPage]) {
    const [step, route] = pageRoutes[currentPage];
    saveRoute(step, route);
}

/* エンディング演出 */

let endingStarted = false;

async function startEnding(
    stories,
    nextPage = "",
    answer = "",
    penColor = "red",
    letterStories = [],
    handStories = []
){

    if(endingStarted) return;

    endingStarted = true;

    const screen = document.getElementById("endingScreen");

    const text = document.getElementById("endingText");

    const paper = document.getElementById("answerPaper");

    const writtenAnswer = document.getElementById("writtenAnswer");


    // 初期状態

    text.textContent = stories.join("\n");

    text.classList.remove("visible");

    paper.classList.add("hidden");

    paper.classList.remove("paperVisible");

    writtenAnswer.textContent = "";

    writtenAnswer.classList.remove("writing");


    // ① 暗転する

    screen.classList.add("active");

    document.body.style.overflow = "hidden";

    await wait(800);


    // ② 紙を表示する

    paper.classList.remove("hidden");

    // CSSアニメーションを開始するための処理
    void paper.offsetWidth;

    paper.classList.add("paperVisible");

    await wait(800);


    // ③ 紙に答えを書く

    if(penColor === "red"){

        writtenAnswer.style.color = "#d12b37";

    }else{

        writtenAnswer.style.color = "#2465d8";

    }

    writtenAnswer.textContent = answer;

    writtenAnswer.classList.add("writing");


    // 書き込みと答えを見せる時間

    await wait(2500);


    // ⑤ ストーリー全体を表示する

    text.classList.add("visible");


    // ストーリーが浮かび上がるまで待つ

    await wait(2500);


    // 書き置きを読むボタンを表示

    const nextButton = document.getElementById("endingNextButton");

    nextButton.classList.remove("hidden");

    nextButton.classList.add("buttonVisible");


    // 書き置きを読むボタンを押したとき

    nextButton.onclick = async function(){

    // 連続タップを防止
    nextButton.disabled = true;


    // 紙・ストーリー・ボタンを消す

    screen.classList.add("endingLeaving");

    await wait(800);


    // 前のストーリーを非表示にする

    paper.classList.add("hidden");

    paper.classList.remove("paperVisible");

    text.classList.remove("visible");

    nextButton.classList.add("hidden");

    nextButton.classList.remove("buttonVisible");

    screen.classList.remove("endingLeaving");


    // 書き置きの最初の2行をセット

    text.textContent = letterStories.slice(0, 2).join("\n");


    // アニメーションを再開

    void text.offsetWidth;


    // 最初の2行を表示

    text.classList.add("visible");


    // 3秒待つ

    await wait(3000);


    // 残りのストーリーを作成

    const additionalStory = document.createElement("div");

    additionalStory.className = "additionalStory";

    additionalStory.textContent = letterStories.slice(2).join("\n");


    // 残りのストーリーを追加

    text.appendChild(additionalStory);


    // 追加のストーリーが浮かび上がるまで待つ

    await wait(2500);


    // 「手を差し出す」ボタンを表示

    nextButton.textContent = "手を差し出す";

    nextButton.disabled = false;

    nextButton.classList.remove("hidden");

    nextButton.classList.add("buttonVisible");


    // 「手を差し出す」を押したとき

    nextButton.onclick = async function(){

    // 連続タップを防止

    nextButton.disabled = true;


    // 現在のストーリーとボタンを消す

    screen.classList.add("endingLeaving");

    await wait(800);


    // 表示をリセット

    text.classList.remove("visible");

    nextButton.classList.add("hidden");

    nextButton.classList.remove("buttonVisible");

    screen.classList.remove("endingLeaving");


    // 次のストーリーをセット

    text.textContent = handStories.join("\n");


    // アニメーションを再開

    void text.offsetWidth;

    text.classList.add("visible");


    // ストーリーが浮かび上がるまで待つ

    await wait(2500);


    // 次のページがある場合

    if(nextPage !== ""){

        nextButton.textContent = "次へ";

        nextButton.disabled = false;

        nextButton.classList.remove("hidden");

        nextButton.classList.add("buttonVisible");

        nextButton.onclick = async function(){

    // 連続タップを防止

    nextButton.disabled = true;


    // めまいのエフェクトを開始

    screen.classList.add("dizzy");


    // エフェクトが終了するまで待つ

    await wait(3000);


    // 真っ暗な状態で少し待つ

    await wait(500);


    // 青いペンの場合のみ記憶を消す

    if(penColor === "blue"){

        for(let i = 1; i <= 3; i++){

            localStorage.removeItem("memory" + i);

        }

    }


    // 分岐履歴はリセット

    for(let i = 1; i <= 3; i++){

        localStorage.removeItem("route" + i);

    }


    // 最初のページへ戻る

    location.href = "index.html";

};

    }

};

};

}


function wait(ms){

    return new Promise(resolve => setTimeout(resolve, ms));

}