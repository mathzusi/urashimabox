
// 記録閲覧モードかどうか
const reviewMode =
    new URLSearchParams(location.search).get("review") === "true";

// 記録を復元しているかどうか
let restoringRecord = false;

/* =========================
   過去の周回の管理
========================= */

// 閲覧している記録の番号
// 0：前回
// 1：前々回
// 2：3周前

const reviewHistoryIndex = Number(

    new URLSearchParams(location.search)
        .get("history") || "0"

);


// 過去のプレイ記録を取得する

function getPlayHistory(){

    const savedHistory = localStorage.getItem("playHistory");

    if(savedHistory){

        return JSON.parse(savedHistory);

    }


    // 以前の保存形式にも対応する

    const oldRecord = localStorage.getItem("previousRecords");

    if(oldRecord){

        const history = [

            JSON.parse(oldRecord)

        ];

        localStorage.setItem(

            "playHistory",

            JSON.stringify(history)

        );

        return history;

    }


    return [];

}


// 指定された周回の記録を取得する

function getHistoryRecord(index){

    const history = getPlayHistory();

    return history[index] || null;

}


// 現在閲覧している周回の記録を取得する

function getReviewRecord(){

    return getHistoryRecord(reviewHistoryIndex);

}

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

    if(reviewMode) return;

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

function removeMemory(number){

    if(reviewMode) return;

    localStorage.removeItem("memory" + number);

    const panel = document.getElementById("memoryPanel");

    if(panel){
        panel.querySelectorAll(".memoryButton").forEach(button => {

            if(button.textContent === memories[number]?.title){
                button.remove();
            }

        });
    }

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

    // STEP4では、STEP3の分岐によって煙を切り替える
    if(page === "step4.html"){

        if(getRoute(3) !== "B") return;

    }else{

        // それ以外のページは従来の判定を維持
        if(
            page === "index.html" ||
            page === "" ||
            page.endsWith("a.html")
        ){
            return;
        }

    }

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
    setupCrystalDisplay();

});

function saveRoute(step, route){

    if(reviewMode) return;

    // 特別モード終了後の非表示は、次の周回のSTEP1解答で解除する
    if(step === 1){
        sessionStorage.removeItem("bbbHideRecordButton");
    }

    // 以下は現在の処理のまま

    localStorage.setItem("route" + step, route);

    for(let i = step + 1; i <= 3; i++){

        localStorage.removeItem("route" + i);

    }

}

/* =========================
   前回の記録ボタンを作成
========================= */

function createRecordButton(){

    const panel = document.getElementById("memoryPanel");

    if(!panel) return;

    const history = getPlayHistory();


    // このページから見て1周前の記録

    const olderIndex = reviewMode

        ? reviewHistoryIndex + 1

        : 0;


    // それより古い記録が存在しない場合は
    // ボタンを表示しない

    if(!history[olderIndex]) return;

    if(!reviewMode && sessionStorage.getItem("bbbHideRecordButton") === "true") return;


    // ボタンの重複を防止

    if(document.getElementById("previousRecordButton")){

        return;

    }


    // ボタンを作成

    const button = document.createElement("button");

    button.id = "previousRecordButton";

    button.className = "memoryButton";

    button.textContent = "前回の記録";


    // 通常ページでも記録ページでも
    // そのページ内で分割画面を開く

    button.onclick = openRecordSplit;


    panel.appendChild(button);

}

// 現在開いているページから分岐履歴を記録する
const currentPage = location.pathname.split("/").pop();

const pageRoutes = {
    "step2a.html": [1, "A"],
    "step2b.html": [1, "B"],
    "step3a.html": [2, "A"],
    "step3b.html": [2, "B"]
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


    // 前回の記録を開いている場合は閉じる

    if(recordSplitOpened){

        closeRecordSplit();

    }


    // 以下は現在のコードのまま

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


    /* =========================
       周回時の記憶・記録の処理
    ========================= */

    if(penColor === "blue"){


    // 青いペンの場合
    // 記憶①〜③を削除

    for(let i = 1; i <= 3; i++){

        localStorage.removeItem("memory" + i);

    }


    // 過去のすべてのプレイ記録を削除

    localStorage.removeItem("playHistory");


    // 以前の保存形式の記録も削除

    localStorage.removeItem("previousRecords");


    // 今回のプレイ記録も削除

    localStorage.removeItem("currentRecords");


    // 記録閲覧用の情報を削除

    sessionStorage.removeItem("reviewReturnPage");


    }else{


    // 赤いペンの場合
    // 今回の記録を追加保存する

    savePreviousRecords();


    }


    // 分岐履歴はリセット

    for(let i = 1; i <= 3; i++){

        localStorage.removeItem("route" + i);

    }


    // 特別モードはペンの色に関係なく終了する
    finishBBBSpecialMode();

    // 最初のページへ戻る

    location.href = "index.html";};

    }

    };

    };

}


function wait(ms){

    return new Promise(resolve => setTimeout(resolve, ms));

}

/* =========================
   前回のプレイ記録
========================= */


// 各STEPの解答を保存する
function saveStepRecord(step, answer, extra = {}){

    if(reviewMode) return;

    const records = JSON.parse(
        localStorage.getItem("currentRecords") || "{}"
    );

    records[step] = {

        page: location.pathname.split("/").pop() || "index.html",

        answer: answer,

        extra: extra

    };

    localStorage.setItem(
        "currentRecords",
        JSON.stringify(records)
    );

}

/* =========================
   1周分の記録を保存する
========================= */

function savePreviousRecords(){

    // 今回のプレイ記録

    const records = JSON.parse(

        localStorage.getItem("currentRecords") || "{}"

    );


    // 今回の分岐履歴

    const routes = {

        1: getRoute(1),

        2: getRoute(2),

        3: getRoute(3)

    };


    // 過去のプレイ記録を取得

    const history = getPlayHistory();


    // 今回の記録を一番前に追加

    history.unshift({

        records: records,

        routes: routes

    });


    // すべての周回の記録を保存

    localStorage.setItem(

        "playHistory",

        JSON.stringify(history)

    );


    // 以前の保存形式は不要になるので削除

    localStorage.removeItem("previousRecords");


    // 今回のプレイ記録をリセット

    localStorage.removeItem("currentRecords");

}

/* 前回の記録ボタンを作成 */

function getRoute(step){

    // 過去の記録を閲覧している場合

    if(reviewMode){

        const record = getReviewRecord();

        return record?.routes?.[step] || null;

    }


    // 通常プレイの場合

    return localStorage.getItem("route" + step);

}

/* ページ読み込み時 */

window.addEventListener("load", function(){

    createRecordButton();

});

/* =========================
   記録閲覧モード
========================= */

window.addEventListener("load", function(){

    // 通常プレイ中は何もしない

    if(!reviewMode) return;


    const params = new URLSearchParams(location.search);

    const step = Number(params.get("step"));


    // 閲覧している周回の記録を取得

    const previous = getReviewRecord();

    const record = previous?.records?.[step];

    if(!record) return;


    // STEP1の記録は、箱を開けた後の画面で表示する
    if(step === 1 && typeof openBox === "function"){
        const before = document.getElementById("story");
        const box = document.getElementById("boxButton");
        const after = document.getElementById("after");
        const title = document.getElementById("title");
        if(before) before.style.display = "none";
        if(box) box.style.display = "none";
        if(after) after.classList.remove("hidden");
        if(title) title.textContent = "STEP1";
    }

    /* =========================
       前回の答えを復元
    ========================= */

    const answerInput = document.getElementById("answer");

    if(answerInput){

        answerInput.value = record.answer;

        answerInput.readOnly = true;

    }


    /* =========================
       STEP3の部屋の選択を復元
    ========================= */

    if(step === 3 && record.extra?.rooms){

        // 記録の復元中だけ部屋の選択を許可

        restoringRecord = true;

        try{

            if(typeof selectRoom === "function"){

                record.extra.rooms.forEach(room => {

                    selectRoom(room);

                });

            }

        }finally{

            restoringRecord = false;

        }


        // 贈り物を渡す部屋を復元

        const giftRadio = document.querySelector(

            'input[name="giftRoom"][value="' +

            record.extra.giftRoom + '"]'

        );

        if(giftRadio){

            giftRadio.checked = true;

        }

    }


    /* =========================
       解答済みと表示
    ========================= */

    const result = document.getElementById(

        step === 3 ? "mapResult" : "result"

    );

    if(result){

        result.textContent = "前回の解答：正解！";

    }


    /* =========================
       ページ内の操作を無効化
    ========================= */

    document.querySelectorAll(

        "button, input, select, textarea"

    ).forEach(element => {


        // 記憶パネル内のボタンは操作可能

        if(element.closest("#memoryPanel")){

            return;

        }


        // 記憶ポップアップ内のボタンは操作可能

        if(element.closest("#memoryViewer")){

            return;

        }


        // BBB解放後は、過去の解答ボタンだけ操作可能
        if(canOperatePastRecord() && isPastAnswerButton(element,step)){
            element.disabled = isPastButtonUsed(reviewHistoryIndex,step,getPastButtonKind(element));
            return;
        }

        // それ以外の操作は無効化
        element.disabled = true;

    });


    /* =========================
       分割画面内で表示している場合
    ========================= */

    if(params.get("embedded") === "true"){

        document.body.classList.add("embeddedRecord");

        return;

    }


    /* =========================
       単独で記録を閲覧している場合
    ========================= */

    const reviewBar = document.createElement("div");

    reviewBar.id = "reviewBar";


    const label = document.createElement("span");

    label.textContent = "前回の記録を閲覧中";

    reviewBar.appendChild(label);


    // 現在のページへ戻るボタン

    const backButton = document.createElement("button");

    backButton.textContent = "現在のページに戻る";


    backButton.onclick = function(){

        const returnPage =

            sessionStorage.getItem("reviewReturnPage")

            || "index.html";

        location.href = returnPage;

    };


    reviewBar.appendChild(backButton);

    document.body.appendChild(reviewBar);

});

/* =========================
   前回の記録・分割表示
========================= */

let recordSplitOpened = false;


// この分割画面で表示する周回

let currentHistoryIndex = 0;


// この分割画面で表示するSTEP

let currentRecordStep = 1;


/* =========================
   PC・スマートフォンの判定
========================= */

/* =========================
   PC・スマートフォンの判定
========================= */

function isRecordMobile(){

    // URLから分割方向を取得

    const params = new URLSearchParams(

        location.search

    );


    const direction = params.get("direction");


    // 記録ページの場合は
    // 親ページから渡された分割方向を使用

    if(direction === "mobile"){

        return true;

    }


    if(direction === "desktop"){

        return false;

    }


    // 通常ページの場合は
    // 自分自身の画面幅から判定

    return window.matchMedia(

        "(max-width: 760px)"

    ).matches;

}


/* =========================
   分割方向を更新する
========================= */

function updateRecordSplitDirection(){

    const layout = document.getElementById(

        "recordSplitLayout"

    );


    const divider = document.getElementById(

        "recordSplitDivider"

    );


    if(!layout || !divider) return;


    // 分割方向を取得

    const isMobile = isRecordMobile();


    // 境界線の持ち手

    const handle = divider.querySelector("span");


    if(isMobile){


        // スマートフォン：上下分割

        layout.style.gridTemplateColumns =

            "minmax(0, 1fr)";


        layout.style.gridTemplateRows =

            "minmax(0, var(--split-size, 50%)) 8px minmax(0, 1fr)";


        divider.style.cursor = "row-resize";


        if(handle){

            handle.style.width = "50px";

            handle.style.height = "4px";

        }


    }else{


        // PC：左右分割

        layout.style.gridTemplateColumns =

            "minmax(0, var(--split-size, 50%)) 8px minmax(0, 1fr)";


        layout.style.gridTemplateRows =

            "minmax(0, 1fr)";


        divider.style.cursor = "col-resize";


        if(handle){

            handle.style.width = "4px";

            handle.style.height = "50px";

        }

    }

}


// 画面サイズが変わった場合にも対応

window.addEventListener(

    "resize",

    updateRecordSplitDirection

);


/* =========================
   分割画面を開く
========================= */

function openRecordSplit(){

    // すでに開いている場合は閉じる

    if(recordSplitOpened){

        closeRecordSplit();

        return;

    }


    /* =========================
       表示する周回を決定
    ========================= */

    // 通常ページなら前回の記録
    // 記録ページならさらに1周前

    currentHistoryIndex = reviewMode

        ? reviewHistoryIndex + 1

        : 0;


    const previous = getHistoryRecord(

        currentHistoryIndex

    );


    // 記録が存在しない場合

    if(!previous?.records) return;


    // 最初はSTEP1を表示する

    currentRecordStep = 1;


    recordSplitOpened = true;


    /* =========================
       現在の表示状態を保存
    ========================= */

    const scrollPosition = window.scrollY;


    const bodyPadding = getComputedStyle(

        document.body

    ).padding;


    /* =========================
       現在のページをまとめる
    ========================= */

    const currentPane = document.createElement("div");

    currentPane.id = "currentPane";


    // スクロールする領域

    const currentScroll = document.createElement("div");

    currentScroll.id = "currentScroll";

    currentScroll.style.padding = bodyPadding;


    // 現在のページの要素を取得

    const children = Array.from(

        document.body.children

    );


    // 元の要素の順番を保存

    currentPane.originalChildren = children.filter(

        element => element.tagName !== "SCRIPT"

    );


    // 固定表示する要素

    const fixedElements = [

        "ground",

        "ryugujo",

        "fogLeft",

        "fogRight",

        "smoke-container",

        "memoryViewer",

        "recordViewer",

        "endingScreen"

    ];


    // スクロール領域と固定領域に分ける

    children.forEach(element => {

        if(element.tagName === "SCRIPT") return;


        if(fixedElements.includes(element.id)){

            currentPane.appendChild(element);

        }else{

            currentScroll.appendChild(element);

        }

    });


    currentPane.prepend(currentScroll);


    /* =========================
       分割画面全体
    ========================= */

    const splitLayout = document.createElement("div");

    splitLayout.id = "recordSplitLayout";


    // 初期状態は50：50

    splitLayout.style.setProperty(

        "--split-size",

        "50%"

    );


    /* =========================
       境界線
    ========================= */

    const divider = document.createElement("div");

    divider.id = "recordSplitDivider";

    divider.innerHTML = "<span></span>";


    /* =========================
       過去の記録側
    ========================= */

    const recordPane = document.createElement("div");

    recordPane.id = "recordPane";


    // 表示するタイトルを決定

    let historyTitle;


    if(currentHistoryIndex === 0){

        historyTitle = "前回の記録";

    }else if(currentHistoryIndex === 1){

        historyTitle = "前々回の記録";

    }else{

        historyTitle =

            (currentHistoryIndex + 1) + "周前の記録";

    }


    // 記録側の画面を作成

    recordPane.innerHTML = `

        <div id="recordPaneHeader">

            <div id="recordPaneTitle">

                <span id="recordHistoryTitle">

                    ${historyTitle}

                </span>


                <button id="closeRecordSplitButton">

                    閉じる

                </button>

            </div>


            <div id="recordStepButtons"></div>

        </div>


        <iframe

            id="recordFrame"

            title="${historyTitle}">

        </iframe>

    `;


    /* =========================
       分割画面を表示
    ========================= */

    splitLayout.appendChild(currentPane);

    splitLayout.appendChild(divider);

    splitLayout.appendChild(recordPane);


    document.body.appendChild(splitLayout);


    document.body.classList.add(

        "recordSplitActive"

    );


    // PC・スマートフォンに合わせて
    // 分割方向を設定

    updateRecordSplitDirection();


    // 元のスクロール位置を復元

    currentScroll.scrollTop = scrollPosition;


    /* =========================
       STEP切り替えボタン
    ========================= */

    const stepButtons = document.getElementById(

        "recordStepButtons"

    );


    let firstStep = null;


    for(let step = 1; step <= 4; step++){

        const record = previous.records[step];

        if(!record) continue;


        if(firstStep === null){

            firstStep = step;

        }


        const button = document.createElement("button");

        button.textContent = "STEP" + step;

        button.dataset.step = step;


        button.onclick = function(){

            showRecordStep(step);

        };


        stepButtons.appendChild(button);

    }


    /* =========================
       閉じるボタン
    ========================= */

    document.getElementById(

        "closeRecordSplitButton"

    ).onclick = closeRecordSplit;


    /* =========================
       最初のSTEPを表示
    ========================= */

    if(firstStep !== null){

        showRecordStep(firstStep);

    }


    /* =========================
       境界線のドラッグ
    ========================= */

    setupRecordDivider();

}


/* =========================
   指定したSTEPの記録を表示
========================= */

/* =========================
   指定したSTEPの記録を表示
========================= */

function showRecordStep(step){

    // この分割画面が担当する周回を取得

    const previous = getHistoryRecord(

        currentHistoryIndex

    );


    const record = previous?.records?.[step];

    if(!record) return;


    const frame = document.getElementById(

        "recordFrame"

    );

    if(!frame) return;


    // 現在表示しているSTEPを保存

    currentRecordStep = step;


    // PC・スマートフォンの分割方向を取得

    const direction = isRecordMobile()

        ? "mobile"

        : "desktop";


    // 過去の記録のページ名を取得

    let page = record.page;


    // STEP4a・STEP4bの古い記録は
    // 統合後のstep4.htmlで表示する

    if(
        page === "step4a.html" ||
        page === "step4b.html"
    ){
        page = "step4.html";
    }


    // 過去のページをiframe内に表示

    frame.src =

        page

        + "?review=true"

        + "&step=" + step

        + "&embedded=true"

        + "&history=" + currentHistoryIndex

        + "&direction=" + direction;

    // 選択中のSTEPボタンを変更

    document.querySelectorAll(

        "#recordStepButtons button"

    ).forEach(button => {

        button.classList.toggle(

            "selected",

            Number(button.dataset.step) === step

        );

    });

}

/* =========================
   分割画面を閉じる
========================= */

function closeRecordSplit(){

    if(!recordSplitOpened) return;


    const splitLayout = document.getElementById(
        "recordSplitLayout"
    );

    const currentPane = document.getElementById(
        "currentPane"
    );

    const currentScroll = document.getElementById(
        "currentScroll"
    );

    if(!splitLayout || !currentPane || !currentScroll) return;


    // 現在のスクロール位置を保存

    const scrollPosition = currentScroll.scrollTop;


    // 現在のページの要素を元の順番に戻す

    currentPane.originalChildren.forEach(element => {

        document.body.insertBefore(

            element,

            splitLayout

        );

    });


    // 分割画面を削除

    splitLayout.remove();


    // 通常の画面に戻す

    document.body.classList.remove(
        "recordSplitActive"
    );


    recordSplitOpened = false;


    // スクロール位置を復元

    window.scrollTo(0, scrollPosition);

}

/* =========================
   分割位置のドラッグ
========================= */

function setupRecordDivider(){

    const divider = document.getElementById(
        "recordSplitDivider"
    );

    const layout = document.getElementById(
        "recordSplitLayout"
    );

    if(!divider || !layout) return;


    let dragging = false;


    // ドラッグ開始

    divider.addEventListener("pointerdown", event => {

        if(event.button !== 0) return;

        event.preventDefault();

        dragging = true;

        divider.setPointerCapture(event.pointerId);

        layout.classList.add("dragging");

    });


    // ドラッグ中

    divider.addEventListener("pointermove", event => {

        if(!dragging) return;


        const rect = layout.getBoundingClientRect();


        // 一番外側のブラウザの幅で判定する

        const isMobile = isRecordMobile();


        let percent;


        if(isMobile){

            // 上下分割

            percent =

                (event.clientY - rect.top)

                / rect.height

                * 100;

        }else{

            // 左右分割

            percent =

                (event.clientX - rect.left)

                / rect.width

                * 100;

        }


        // 小さくなりすぎないように制限

        percent = Math.max(

            25,

            Math.min(75, percent)

        );


        // 分割位置を変更

        layout.style.setProperty(

            "--split-size",

            percent + "%"

        );

    });


    // ドラッグ終了

    function stopDragging(){

        dragging = false;

        layout.classList.remove("dragging");

    }


    divider.addEventListener(

        "pointerup",

        stopDragging

    );


    divider.addEventListener(

        "pointercancel",

        stopDragging

    );


    divider.addEventListener(

        "lostpointercapture",

        stopDragging

    );

}

/* =====================================================
   BBBルート：過去の解答を現在のゲームへ反映
   通常の履歴閲覧は従来どおり読み取り専用
===================================================== */
function bbbMessageOrigin(){
    return location.protocol === "file:" ? "*" : location.origin;
}
function bbbTrustedMessage(event){
    return location.protocol === "file:" ? event.origin === "null" : event.origin === location.origin;
}
function canOperatePastRecord(){
    return reviewMode && sessionStorage.getItem("bbbRecordUnlocked") === "true"
        && sessionStorage.getItem("bbbHideRecordButton") !== "true";
}
function isBBBSpecialMode(){
    return !reviewMode && sessionStorage.getItem("bbbSpecialMode") === "true";
}
function getPastButtonKind(button){
    if(button.id === "redPen") return "red";
    if(button.id === "bluePen") return "blue";
    return "answer";
}
function isPastAnswerButton(element,step){
    if(element.tagName !== "BUTTON") return false;
    if(step === 1 || step === 2) return element.getAttribute("onclick") === "check()";
    if(step === 3) return element.getAttribute("onclick") === "checkRoomOrder()";
    if(step === 4) return element.id === "redPen" || element.id === "bluePen";
    return false;
}
function pastButtonKey(historyIndex,step,kind){
    return historyIndex + ":" + step + ":" + kind;
}
function getUsedPastButtons(){
    try {return JSON.parse(sessionStorage.getItem("bbbUsedButtons") || "{}");}
    catch(e){return {};}
}
function isPastButtonUsed(historyIndex,step,kind){
    return !!getUsedPastButtons()[pastButtonKey(historyIndex,step,kind)];
}
function markPastButtonUsed(historyIndex,step,kind){
    const used=getUsedPastButtons();
    used[pastButtonKey(historyIndex,step,kind)]=true;
    sessionStorage.setItem("bbbUsedButtons",JSON.stringify(used));
}
function finishBBBSpecialMode(){
    sessionStorage.removeItem("bbbCrystalVisible");
    sessionStorage.removeItem("bbbRestoreRecordChain");
    const wasSpecial=sessionStorage.getItem("bbbRecordUnlocked") === "true"
        || sessionStorage.getItem("bbbSpecialMode") === "true";
    if(wasSpecial) sessionStorage.setItem("bbbHideRecordButton","true");
    ["bbbSpecialMode","bbbRecordUnlocked","bbbUsedButtons","bbbEventShown"]
        .forEach(key=>sessionStorage.removeItem(key));
}
function showBBBSpecialStory(){
    if(!isBBBSpecialMode()) return;
    const page=location.pathname.split("/").pop();
    const stories={
        "index.html":"あの記録に残っていた答えを口にした瞬間、周囲の景色が歪んだ。\n気づくと、再び竜宮城で暗号に向き合っていた。\nこれは過去の続きなのか、それとも今の僕の選択なのか……。",
        "step2a.html":"過去の記録に触れた直後、景色が切り替わった。\n記憶の中で選ばれた答えが、今の僕をこの場所へ連れてきたらしい。",
        "step2b.html":"白い煙が視界を覆った。\n過去の記録の答えが、今の世界にまで影響している。\n薄れていく記憶を確かめながら、次の暗号に向かう。",
        "step3a.html":"過去の記録からつながった道を、今の僕が歩いている。\nこの先の答えも、僕自身が選ばなければならない。",
        "step3b.html":"また煙が立ち込め、思い出が遠のく。\nそれでも、過去の記録から始まったこの道を進むしかない。",
        "step4.html":"過去の記録から続いた旅は、再び最後の暗号へたどり着いた。\n今度こそ、この答えで何が変わるのだろう。"
    };
    const text=stories[page];
    if(!text)return;
    const target=page==="index.html"
        ?document.querySelector("#stepStory p")
        :document.querySelector("#story p, #storyA p:not(.hidden), #storyB p:not(.hidden)");
    if(target){target.textContent=text;target.style.whiteSpace="pre-line";}
    if(page==="step4.html"){
        const active=document.querySelector(getRoute(3)==="B"?"#storyB p":"#storyA p");
        if(active){active.textContent=text;active.style.whiteSpace="pre-line";}
    }
}
window.addEventListener("load",showBBBSpecialStory);

// 過去のiframe内で、保存済みの解答ボタンだけをクリック可能にする
window.addEventListener("load",function(){
    if(!reviewMode)return;
    const step=Number(new URLSearchParams(location.search).get("step"));
    document.querySelectorAll("button").forEach(button=>{
        if(!isPastAnswerButton(button,step))return;
        const kind=getPastButtonKind(button);
        if(isPastButtonUsed(reviewHistoryIndex,step,kind)){
            button.disabled=true;
            button.textContent="使用済み";
            return;
        }
        button.disabled=!canOperatePastRecord();
        button.addEventListener("click",function(event){
            event.preventDefault();
            event.stopImmediatePropagation();
            if(!canOperatePastRecord() || isPastButtonUsed(reviewHistoryIndex,step,kind))return;
            // topの確認が済んだ場合のみ使用済みにする
            // 同一サイト内の記録iframeから現在のゲームへ直接伝える。
            // postMessageだけに依存すると、環境によって受信できず移動しない場合がある。
            try{
                if(typeof window.top.handleBBBPastAnswer === "function"){
                    window.top.handleBBBPastAnswer({historyIndex:reviewHistoryIndex,step,kind});
                }else{
                    window.top.postMessage({type:"URASIMA_PAST_ANSWER",historyIndex:reviewHistoryIndex,step,kind},bbbMessageOrigin());
                }
            }catch(error){
                console.error("過去の解答を現在のゲームへ送れませんでした",error);
            }
        },true);
    });
});

// BBB解放後、すでに表示中の入れ子の記録も操作可能にする
function refreshBBBPastAnswerButtons(){
    if(!reviewMode)return;
    const step=Number(new URLSearchParams(location.search).get("step"));
    document.querySelectorAll("button").forEach(button=>{
        if(!isPastAnswerButton(button,step))return;
        const used=isPastButtonUsed(reviewHistoryIndex,step,getPastButtonKind(button));
        button.disabled=!canOperatePastRecord() || used;
        if(used)button.textContent="使用済み";
    });
}
function refreshBBBRecordTree(win=window){
    try{
        win.refreshBBBPastAnswerButtons?.();
        win.document.querySelectorAll("iframe").forEach(frame=>{
            if(frame.contentWindow)refreshBBBRecordTree(frame.contentWindow);
        });
    }catch(error){console.warn("記録ボタンの更新をスキップ",error);}
}
// 最上位の現在のゲームだけが履歴を検証し、実際のルート処理を行う
function handleBBBPastAnswer(data){
    if(window !== window.top || reviewMode)return;
    if(sessionStorage.getItem("bbbRecordUnlocked")!=="true")return;
    const {historyIndex,step,kind}=data;
    if(!Number.isInteger(historyIndex)||!Number.isInteger(step)||step<1||step>4)return;
    if(!["answer","red","blue"].includes(kind))return;
    if(step!==4 && kind!=="answer")return;
    if(step===4 && kind==="answer")return;
    if(isPastButtonUsed(historyIndex,step,kind))return;
    const history=getHistoryRecord(historyIndex);
    const record=history?.records?.[step];
    const route=history?.routes?.[step];
    if(!record || (step<=3 && !["A","B"].includes(route)))return;
    // 過去のSTEP4は現在のページに関係なく使用できる。
    // ただし、その周回のルートと解答が揃っていることを確認する。
    if(step===4){
        const historicalRoute=[1,2,3].map(i=>history?.routes?.[i]).join("");
        if(!/^[AB]{3}$/.test(historicalRoute) || typeof record.answer!=="string" || !record.answer.trim()){
            alert("この周回のSTEP4の記録が不完全なため、解答を使用できません。");
            return;
        }
    }
    markPastButtonUsed(historyIndex,step,kind);
    // ボタンを押した直後に全履歴画面へ使用済みを反映
    document.querySelectorAll("iframe").forEach(frame=>{
        try{frame.contentWindow?.postMessage({type:"URASIMA_PAST_USED",historyIndex,step,kind},bbbMessageOrigin());}catch(e){}
    });
    sessionStorage.setItem("bbbSpecialMode","true");
    if(step===3 && record.page==="step3a.html") registerCrystalStep3aUse(historyIndex);
    saveRecordChainForNavigation();
    if(step===4){
        // 過去のSTEP4の解答が属する周回のルートを現在のゲームに採用。
        // saveRouteは後続ルートを消すので、必ずSTEP1から順に設定する。
        for(let i=1;i<=3;i++)saveRoute(i,history.routes[i]);

        // STEP1～3の記録も同じ周回に合わせ、現在の周回の記録と混在させない。
        const priorRecords={};
        for(let i=1;i<=3;i++){
            if(history.records?.[i])priorRecords[i]={...history.records[i]};
        }
        localStorage.setItem("currentRecords",JSON.stringify(priorRecords));

        // 過去の記録の解答とペンの色をSTEP4へ引き継ぐ。
        sessionStorage.setItem("bbbPendingStep4Answer",JSON.stringify({
            answer:record.answer,
            penColor:kind,
            route:[1,2,3].map(i=>history.routes[i]).join("")
        }));
        location.href="step4.html";
        return;
    }
    // 過去の記録は変更せず、今のゲームの記録として解答を採用する
    const records=JSON.parse(localStorage.getItem("currentRecords")||"{}");
    records[step]={page:record.page,answer:record.answer,extra:record.extra||{}};
    for(let i=step+1;i<=4;i++)delete records[i];
    localStorage.setItem("currentRecords",JSON.stringify(records));
    saveRoute(step,route);
    const target=step===1?"step2"+route.toLowerCase()+".html"
        :step===2?"step3"+route.toLowerCase()+".html":"step4.html";
    if(route==="B"){
        if(typeof createSmoke==="function")createSmoke();
        setTimeout(()=>{
            removeMemory(step);
            location.href=target;
        },2000);
    }else{
        // Aルートは通常と同様に記憶を獲得し、閉じると次のSTEPへ
        nextPage=target;
        unlockMemory(step);
    }
}
// postMessage経由の旧処理とも互換性を維持
window.addEventListener("message",function(event){
    if(!bbbTrustedMessage(event) || event.data?.type!=="URASIMA_PAST_ANSWER")return;
    handleBBBPastAnswer(event.data);
});
window.addEventListener("message",function(event){
    if(!bbbTrustedMessage(event) || event.data?.type!=="URASIMA_PAST_USED" || !reviewMode)return;
    const {historyIndex,step,kind}=event.data;
    if(historyIndex!==reviewHistoryIndex || step!==Number(new URLSearchParams(location.search).get("step")))return;
    document.querySelectorAll("button").forEach(button=>{
        if(isPastAnswerButton(button,step) && getPastButtonKind(button)===kind){
            button.disabled=true;button.textContent="使用済み";
        }
    });
});

/* =====================================================
   記録タブの保持と「水晶」
===================================================== */
function getRecordChainNode(){
    return {opened:recordSplitOpened,historyIndex:currentHistoryIndex,step:currentRecordStep,review:reviewMode,reviewHistoryIndex};
}
function readRecordChain(win){
    const chain=[];
    let current=win;
    for(let depth=0;depth<30;depth++){
        const state=current.getRecordChainNode?.();
        if(!state?.opened)break;
        const frame=current.document.getElementById("recordFrame");
        if(!frame)break;
        chain.push({historyIndex:state.historyIndex,step:state.step});
        try{current=frame.contentWindow;if(!current)break;}catch(e){break;}
    }
    return chain;
}
function saveRecordChainForNavigation(){
    if(window!==window.top)return;
    const chain=readRecordChain(window);
    if(chain.length){
        sessionStorage.setItem("bbbRestoreRecordChain",JSON.stringify(chain));
    }
}
function restoreRecordChainAt(win,chain,depth){
    if(depth>=chain.length)return;
    const target=chain[depth];
    // 既存の履歴とSTEPが一致する場合だけ再表示
    const state=win.getRecordChainNode?.();
    if(!state)return;
    const expected=state.review ? state.reviewHistoryIndex+1 : 0;
    if(expected!==target.historyIndex || !win.getHistoryRecord(expected))return;
    if(!state.opened)win.openRecordSplit();
    if(!win.getRecordChainNode?.().opened)return;
    win.showRecordStep(target.step);
    const frame=win.document.getElementById("recordFrame");
    if(frame && depth+1<chain.length){
        frame.addEventListener("load",function(){
            try{restoreRecordChainAt(frame.contentWindow,chain,depth+1);}catch(e){console.warn("記録の復元に失敗しました",e);}
        },{once:true});
    }
}
window.addEventListener("load",function(){
    if(window!==window.top || reviewMode)return;
    const raw=sessionStorage.getItem("bbbRestoreRecordChain");
    if(!raw)return;
    sessionStorage.removeItem("bbbRestoreRecordChain");
    if(sessionStorage.getItem("bbbRecordUnlocked")!=="true")return;
    try{restoreRecordChainAt(window,JSON.parse(raw),0);}catch(e){console.warn("記録タブの復元に失敗しました",e);}
});

function registerCrystalStep3aUse(historyIndex){
    const key="bbbCrystalStep3aHistories";
    let ids=[];
    try{ids=JSON.parse(sessionStorage.getItem(key)||"[]");}catch(e){}
    if(!Array.isArray(ids))ids=[];
    if(!ids.includes(historyIndex))ids.push(historyIndex);
    sessionStorage.setItem(key,JSON.stringify(ids));
    if(ids.length>=5 && localStorage.getItem("bbbCrystalAcquired")!=="true"){
        localStorage.setItem("bbbCrystalAcquired","true");
        sessionStorage.setItem("bbbCrystalVisible","true");
        alert("水晶を手にいれた");
        setupCrystalDisplay();
    }
}
function showCrystal(){
    if(reviewMode || localStorage.getItem("bbbCrystalAcquired")!=="true")return;
    sessionStorage.setItem("bbbCrystalVisible","true");
    setupCrystalDisplay();
}
function setupCrystalDisplay(){
    if(reviewMode)return;
    const panel=document.getElementById("memoryPanel");
    if(panel && (location.pathname.split("/").pop()==="index.html" || location.pathname.endsWith("/"))
       && sessionStorage.getItem("bbbRecordUnlocked")!=="true"
       && localStorage.getItem("bbbCrystalAcquired")==="true" && !document.getElementById("bbbCrystalMemoryButton")){
        const button=document.createElement("button");
        button.id="bbbCrystalMemoryButton";
        button.className="memoryButton";
        button.textContent="特別な記憶：水晶を手にいれた";
        button.onclick=showCrystal;
        panel.appendChild(button);
    }
    if(sessionStorage.getItem("bbbCrystalVisible")!=="true")return;
    if(document.getElementById("bbbCrystalImage"))return;
    const img=document.createElement("img");
    img.id="bbbCrystalImage";
    img.src="suisyou.png";
    img.alt="水晶";
    img.style.cssText="position:fixed;bottom:12vh;right:20px;width:130px;max-width:24vw;height:auto;z-index:20;pointer-events:none";
    document.body.appendChild(img);
}

// 水晶ストーリーから戻った際、トップページで1回だけ表示。
window.addEventListener("load", function(){
    if(reviewMode) return;
    const page=location.pathname.split("/").pop();
    if(page!=="index.html" && page!=="")return;
    if(sessionStorage.getItem("crystalStoryReturnMessage")!=="true")return;
    sessionStorage.removeItem("crystalStoryReturnMessage");
    alert("STEP4の答えがライスになるようにしよう！");
});
