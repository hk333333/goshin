const canvas = document.getElementById("triangleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

let currentCenters = {};
let currentTarget = "重心"; // 現在のターゲット
let score = 0;
let startTime;
let targets = ["重心", "外心", "内心", "垂心"]; // 五心の順番
let currentTargetIndex = 0;

// ランダムな三角形を生成
function generateRandomTriangle() {
    let points;
    let isValid = false;

    while (!isValid) {
        // ランダムに3つの頂点を生成
        points = [
            { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
            { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
            { x: Math.random() * canvas.width, y: Math.random() * canvas.height }
        ];

        // 各辺の長さを計算
        const a = Math.hypot(points[1].x - points[2].x, points[1].y - points[2].y);
        const b = Math.hypot(points[0].x - points[2].x, points[0].y - points[2].y);
        const c = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

        // 三角形の形状をチェック
        isValid = isTriangleValid(a, b, c);
    }

    return points;
}

// 三角形の形状をチェック
function isTriangleValid(a, b, c) {
    // 三角形の成立条件を満たすか確認
    if (a + b <= c || a + c <= b || b + c <= a) {
        return false;
    }

    // 各辺の長さが極端に異ならないようにする
    const maxLength = Math.max(a, b, c);
    const minLength = Math.min(a, b, c);
    if (maxLength / minLength > 3) { // 長さの比率が3を超えないようにする
        return false;
    }

    // 三角形の角度が極端に小さくならないようにする
    const angleA = Math.acos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c));
    const angleB = Math.acos((a ** 2 + c ** 2 - b ** 2) / (2 * a * c));
    const angleC = Math.PI - angleA - angleB;

    const minAngle = Math.min(angleA, angleB, angleC);
    if (minAngle < Math.PI / 18) { // 最小角度が10度未満の場合は無効
        return false;
    }

    return true;
}

// 五心を計算
function calculateCenters(points) {
    const [A, B, C] = points;

    // 重心
    const centroid = {
        x: (A.x + B.x + C.x) / 3,
        y: (A.y + B.y + C.y) / 3
    };

    // 外心
    const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
    const circumcenter = {
        x: ((A.x ** 2 + A.y ** 2) * (B.y - C.y) + (B.x ** 2 + B.y ** 2) * (C.y - A.y) + (C.x ** 2 + C.y ** 2) * (A.y - B.y)) / D,
        y: ((A.x ** 2 + A.y ** 2) * (C.x - B.x) + (B.x ** 2 + B.y ** 2) * (A.x - C.x) + (C.x ** 2 + C.y ** 2) * (B.x - A.x)) / D
    };

    // 内心
    const a = Math.hypot(B.x - C.x, B.y - C.y);
    const b = Math.hypot(C.x - A.x, C.y - A.y);
    const c = Math.hypot(A.x - B.x, A.y - B.y);
    const incenter = {
        x: (a * A.x + b * B.x + c * C.x) / (a + b + c),
        y: (a * A.y + b * B.y + c * C.y) / (a + b + c)
    };

    // 垂心
    const orthocenter = {
        x: A.x + B.x + C.x - 2 * circumcenter.x,
        y: A.y + B.y + C.y - 2 * circumcenter.y
    };

    return { centroid, circumcenter, incenter, orthocenter };
}

// 三角形を描画
function drawTriangle(points) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 三角形を描画
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// ランキングを取得
function getRanking() {
    const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    return ranking;
}

// ランキングを保存
function saveRanking(name, score) {
    const ranking = getRanking();
    ranking.push({ name, score });
    ranking.sort((a, b) => b.score - a.score); // スコアの降順にソート
    if (ranking.length > 5) ranking.pop(); // 上位5名のみ保存
    localStorage.setItem("ranking", JSON.stringify(ranking));
}

// ランキングを表示
function displayRanking() {
    const ranking = getRanking();
    const rankingContainer = document.getElementById("rankingContainer");
    const rankingList = document.getElementById("rankingList");

    // ランキングをクリア
    rankingList.innerHTML = "";

    // ランキングをリストに追加
    ranking.forEach((entry, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
        rankingList.appendChild(listItem);
    });

    // ランキングセクションを表示
    rankingContainer.style.display = "block";
}

// 五心を描画
function drawCenters(centers) {
    // 重心 (G)
    drawPoint(centers.centroid, "red", "G");

    // 外心 (O)
    drawPoint(centers.circumcenter, "blue", "O");

    // 内心 (I)
    drawPoint(centers.incenter, "green", "I");

    // 垂心 (H)
    drawPoint(centers.orthocenter, "purple", "H");
}

// 点を描画
function drawPoint(point, color, label) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.font = "12px Arial";
    ctx.fillText(label, point.x + 10, point.y);
}

// ゲーム終了時に五心を表示
function showCorrectCenters() {
    drawCenters(currentCenters); // 現在の五心を描画
}

// 新しいゲームを開始
function startGame() {
    const points = generateRandomTriangle();
    currentCenters = calculateCenters(points);
    drawTriangle(points);

    // 最初のターゲットを設定
    currentTargetIndex = 0;
    currentTarget = targets[currentTargetIndex];
    document.getElementById("instruction").textContent = `「${currentTarget}」`;
    startTime = Date.now();
    score = 0; // スコアをリセット
    document.getElementById("score").textContent = `スコア: ${score}`;
}

// ユーザーのクリックを処理
canvas.addEventListener("click", (event) => {
    if (currentTargetIndex >= targets.length) return; // ゲーム終了後はクリックを無視

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 現在のターゲットの五心を取得
    const targetPoint = currentCenters[currentTarget === "重心" ? "centroid" :
        currentTarget === "外心" ? "circumcenter" :
        currentTarget === "内心" ? "incenter" : "orthocenter"];

    // クリック位置とターゲットの距離を計算
    const distance = Math.hypot(clickX - targetPoint.x, clickY - targetPoint.y);

    // スコアを計算（正確性とスピードに基づく）
    const timeTaken = (Date.now() - startTime) / 1000; // 秒
    const points = Math.max(100 - Math.floor(distance) - Math.floor(timeTaken * 10), 0);
    score += points;
    document.getElementById("score").textContent = `スコア: ${score}`;

    // 次のターゲットに進む
    currentTargetIndex++;
    if (currentTargetIndex < targets.length) {
        currentTarget = targets[currentTargetIndex];
        document.getElementById("instruction").textContent = `「${currentTarget}」`;
        startTime = Date.now();
    } else {
        // 全てのターゲットをクリックしたらゲーム終了
        const playerName = prompt("ゲーム終了！名前を入力してください:");
        if (playerName) saveRanking(playerName, score);
        document.getElementById("instruction").textContent = `最終スコア: ${score}`;
        showCorrectCenters(); // 正解の五心を表示
        displayRanking();
    }
});

// ボタンのクリックイベント
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("showRankingButton").addEventListener("click", displayRanking);

// 初期化
startGame();