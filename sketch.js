let poly = [];
let topPts = [];
let botPts = [];
let gameState = 0; // 0: 選擇難度, 1: 準備開始, 2: 遊戲進行中, 3: 失敗, 4: 成功
let startTime = 0; // 記錄遊戲開始時間
let finalTime = 0; // 記錄過關所花費的時間
let numPoints = 5; // 記錄當前難度的轉角數量
let lives = 3; // 剩餘機會
let fireworks = []; // 儲存煙火粒子的陣列
let bgImg; // 儲存背景圖片
let currentDiff = 0; // 記錄當前難度
let shakeTime = 0; // 晃動倒數計時
let shakeX = 0; // 晃動 X 偏移
let shakeY = 0; // 晃動 Y 偏移

function preload() {
  // 預先載入背景圖片
  bgImg = loadImage('—Pngtree—full moon over starry sky_16054576.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight); // 設定畫布大小為整個瀏覽器視窗（全螢幕）
  gameState = 0; // 初始進入選擇難度畫面
}

function draw() {
  // 繪製背景（如果圖片有載入成功就顯示圖片並填滿畫布，否則顯示深灰色）
  if (bgImg) {
    image(bgImg, 0, 0, width, height);
  } else {
    background(30);
  }

  // 加上半透明黑色遮罩，讓賽道和文字更清楚
  fill(0, 150); // 黑色，透明度設定為 150 (介於 0 到 255 之間)
  noStroke();
  rect(0, 0, width, height);

  // --- 狀態 0：難度選擇畫面 ---
  if (gameState === 0) {
    fill(255);
    noStroke();
    textSize(36);
    textAlign(CENTER, CENTER);
    text("選擇遊戲難度", width / 2, height / 2 - 150);

    // 簡單按鈕
    fill(100, 255, 100);
    rect(width / 2 - 100, height / 2 - 80, 200, 50, 10);
    fill(0);
    textSize(24);
    text("簡單", width / 2, height / 2 - 55);

    // 普通按鈕
    fill(255, 255, 100);
    rect(width / 2 - 100, height / 2 - 10, 200, 50, 10);
    fill(0);
    text("普通", width / 2, height / 2 + 15);

    // 困難按鈕
    fill(255, 100, 100);
    rect(width / 2 - 100, height / 2 + 60, 200, 50, 10);
    fill(0);
    text("困難", width / 2, height / 2 + 85);

    // 極限按鈕
    fill(150, 50, 255);
    rect(width / 2 - 100, height / 2 + 130, 200, 50, 10);
    fill(255);
    text("極限", width / 2, height / 2 + 155);
    return; // 在選擇難度畫面不畫急急棒的賽道
  }

  // --- 極限模式專屬：隨機畫面晃動干擾 ---
  if (gameState === 2 && currentDiff === 3) {
    if (random() < 0.02 && shakeTime <= 0) { // 每幀 2% 機率觸發晃動
      shakeTime = 25; // 晃動持續約 0.4 秒
    }
  }

  if (shakeTime > 0) {
    shakeX = random(-2, 2); // 產生 -5 到 5 像素的亂數偏移
    shakeY = random(-2, 2);
    shakeTime--;
  } else {
    shakeX = 0;
    shakeY = 0;
  }

  push();
  translate(shakeX, shakeY); // 偏移畫布，產生晃動視覺效果

  // 繪製安全區域 (灰色多邊形)
  fill(150);
  noStroke();
  beginShape();
  for (let pt of poly) {
    vertex(pt[0], pt[1]);
  }
  endShape(CLOSE);

  // 繪製上下邊界線條 (紅色)
  stroke(255, 50, 50);
  strokeWeight(2);
  noFill();
  
  // 串接上方曲線點
  beginShape();
  for (let pt of topPts) vertex(pt.x, pt.y);
  endShape();

  // 串接下方曲線點
  beginShape();
  for (let pt of botPts) vertex(pt.x, pt.y);
  endShape();

  // 起點區域 (左邊綠色)
  fill(0, 255, 0, 150);
  noStroke();
  let startY = (topPts[0].y + botPts[0].y) / 2;
  let startD = botPts[0].y - topPts[0].y; // 取得起點上下邊界距離作為直徑
  circle(topPts[0].x, startY, startD);

  // 終點區域 (右邊藍色)
  fill(0, 150, 255, 150);
  let lastIdx = topPts.length - 1;
  let endY = (topPts[lastIdx].y + botPts[lastIdx].y) / 2;
  let endD = botPts[lastIdx].y - topPts[lastIdx].y; // 取得終點上下邊界距離作為直徑
  circle(topPts[lastIdx].x, endY, endD);

  pop(); // 結束晃動偏移，接下來的 UI（黃色追蹤點、文字等）維持絕對座標不會跟著晃

  // 依據遊戲狀態決定是否隱藏系統游標
  if (gameState === 2) {
    noCursor(); // 遊戲進行中隱藏系統游標
  } else {
    cursor();   // 其他狀態恢復顯示系統游標
  }

  // 遊戲狀態邏輯處理
  if (gameState === 1) {
    fill(255);
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    text("點擊左側綠色起點開始遊戲", width / 2, 40);
    text("請將滑鼠移至最右側藍色終點，不可碰到紅線或離開灰色區域", width / 2, 70);

    // 顯示剩餘機會
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text("剩餘機會: " + lives, 20, 20);
  } else if (gameState === 2) {
    // 判斷是否出界 (需要扣除 shakeX 和 shakeY 來計算真實相對座標)
    let inside = pointInPolygon([mouseX - shakeX, mouseY - shakeY], poly);
    if (!inside) {
      lives--;
      shakeTime = 0; // 撞到牆壁時立即停止晃動
      if (lives > 0) {
        gameState = 1; // 扣除機會，退回準備起點狀態
      } else {
        gameState = 3; // 機會耗盡，遊戲失敗
      }
    } else {
      // 判斷是否抵達終點
      let d = dist(mouseX - shakeX, mouseY - shakeY, topPts[lastIdx].x, endY);
      if (d < endD / 2) {
        gameState = 4; // 成功
        finalTime = millis() - startTime; // 記錄過關時間
      }
    }

    // 標示滑鼠游標目前的追蹤點 (變成一顆立體小球)
    fill(255, 255, 0);
    stroke(255, 150, 0);
    strokeWeight(2);
    circle(mouseX, mouseY, 12);
    noStroke();
    fill(255); // 加上白色反光亮點
    circle(mouseX - 2, mouseY - 2, 4);

    // 顯示計時器與剩餘機會
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text("剩餘機會: " + lives, 20, 20);
    text("時間: " + ((millis() - startTime) / 1000).toFixed(2) + " 秒", 20, 50);
  } else if (gameState === 3) {
    fill(255, 50, 50);
    textSize(36);
    textAlign(CENTER, CENTER);
    text("遊戲失敗！", width / 2, height / 2 - 20);
    textSize(18);
    text("點擊畫面任意處重新開始", width / 2, height / 2 + 20);
  } else if (gameState === 4) {
    // 隨機產生煙火爆炸
    let fwChance = (currentDiff === 3) ? 0.2 : 0.08; // 極限模式煙火產生機率提升到 20%
    if (random() < fwChance) { 
      let fwX = random(width);
      let fwY = random(height / 2); // 限制產生在畫面上半部
      let r = random(150, 255), g = random(150, 255), b = random(150, 255);
      
      let pCount = (currentDiff === 3) ? 100 : 40; // 極限模式粒子數大幅增加至 100
      let isExtreme = (currentDiff === 3);
      for (let i = 0; i < pCount; i++) {
        fireworks.push(new FireworkParticle(fwX, fwY, r, g, b, isExtreme));
      }
    }

    // 更新與繪製煙火粒子
    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].show();
      if (fireworks[i].alpha <= 0) {
        fireworks.splice(i, 1); // 粒子完全透明後將其從陣列移除
      }
    }

    fill(100, 255, 100);
    textSize(36);
    textAlign(CENTER, CENTER);
    text("恭喜通關！", width / 2, height / 2 - 20);
    textSize(18);
    text("耗時 " + (finalTime / 1000).toFixed(2) + " 秒完成", width / 2, height / 2 + 20);
    text("點擊畫面任意處重新開始", width / 2, height / 2 + 50);
  }
}

function mousePressed() {
  if (gameState === 0) {
    // 判斷難度選擇的點擊區域
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100) {
      if (mouseY > height / 2 - 80 && mouseY < height / 2 - 30) {
        initLevel(0); // 簡單
      } else if (mouseY > height / 2 - 10 && mouseY < height / 2 + 40) {
        initLevel(1); // 普通
      } else if (mouseY > height / 2 + 60 && mouseY < height / 2 + 110) {
        initLevel(2); // 困難
      } else if (mouseY > height / 2 + 130 && mouseY < height / 2 + 180) {
        initLevel(3); // 極限
      }
    }
  } else if (gameState === 1) {
    // 若點擊在綠色起點附近則開始遊戲
    let startY = (topPts[0].y + botPts[0].y) / 2;
    let startD = botPts[0].y - topPts[0].y;
    if (dist(mouseX, mouseY, topPts[0].x, startY) < startD / 2) {
      gameState = 2;
      startTime = millis(); // 點擊起點後開始計時
    }
  } else if (gameState === 3 || gameState === 4) {
    fireworks = []; // 清空殘留的煙火陣列
    gameState = 0; // 回到選擇難度畫面
  }
}

function initLevel(diff) {
  topPts = [];
  botPts = [];
  poly = [];
  
  currentDiff = diff;
  shakeTime = 0;
  shakeX = 0;
  shakeY = 0;

  let minGap, maxGap;
  if (diff === 0) {
    // 簡單：轉角少，路徑寬
    numPoints = 5;
    minGap = 40; maxGap = 80;
  } else if (diff === 1) {
    // 普通：轉角中等，路徑適中
    numPoints = 8;
    minGap = 25; maxGap = 50;
  } else if (diff === 2) {
    // 困難：轉角多，路徑很窄
    numPoints = 12;
    minGap = 20; maxGap = 30;
  } else {
    // 極限：轉角極多，路徑非常窄
    numPoints = 15;
    minGap = 20; maxGap = 25; // 放寬最窄的限制，維持極高難度但保證可通行
  }

  // 依照難度設定生命值：極限 1 次，其餘 3 次
  lives = (diff === 3) ? 1 : 3;

  let startX = 50;
  let endX = width - 50;
  let step = (endX - startX) / (numPoints - 1); // 均分產生點

  let sparseTop = [];
  let gaps = []; // 改為紀錄每個轉角點的預設寬度

  for (let i = 0; i < numPoints; i++) {
    let x = startX + i * step;
    let y = random(100, height - 100);
    sparseTop.push(createVector(x, y));

    // 確保起點與終點不會太窄 (固定給 60 的寬度容納圓圈)，其餘才使用隨機難度寬度
    let gap = (i === 0 || i === numPoints - 1) ? 60 : random(minGap, maxGap); 
    gaps.push(gap); 
  }

  // 利用 p5.js 的 curvePoint 進行曲線插值，產生平滑的曲線點
  let st = [sparseTop[0], ...sparseTop, sparseTop[sparseTop.length - 1]];

  let detail = 10; // 取樣密度，數值越大曲線越平滑
  for (let i = 0; i < sparseTop.length - 1; i++) {
    let currentGap = gaps[i];
    let nextGap = gaps[i + 1];

    for (let j = 0; j <= detail; j++) {
      if (i > 0 && j === 0) continue; // 避免與前一段的終點重複
      let t = j / detail;
      
      // 先算出上方曲線點
      let tx = curvePoint(st[i].x, st[i + 1].x, st[i + 2].x, st[i + 3].x, t);
      let ty = curvePoint(st[i].y, st[i + 1].y, st[i + 2].y, st[i + 3].y, t);
      topPts.push(createVector(tx, ty));

      // 下方點直接由上方點加上線性漸變的 gap 產生，保證通道寬度絕對正確！
      let interpolatedGap = lerp(currentGap, nextGap, t);
      botPts.push(createVector(tx, ty + interpolatedGap));
    }
  }

  // 組合多邊形頂點以供碰撞偵測 (上方由左至右，下方由右至左包圍起來)
  for (let i = 0; i < topPts.length; i++) {
    poly.push([topPts[i].x, topPts[i].y]);
  }
  for (let i = botPts.length - 1; i >= 0; i--) {
    poly.push([botPts[i].x, botPts[i].y]);
  }
  
  gameState = 1; // 產生完畢，切換到準備開始狀態
}

// 演算法：射線法 (Ray-casting algorithm) 判斷點是否在多邊形內
function pointInPolygon(point, vs) {
  let x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0], yi = vs[i][1];
    let xj = vs[j][0], yj = vs[j][1];
    
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小並重置遊戲
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gameState = 0; // 視窗縮放直接重置回首頁
}

// --- 煙火粒子類別 ---
class FireworkParticle {
  constructor(x, y, r, g, b, isExtreme) {
    this.x = x;
    this.y = y;
    let angle = random(TWO_PI);
    let speed = isExtreme ? random(2, 12) : random(1, 6); // 極限模式散得更開
    this.vx = cos(angle) * speed; // 水平散射速度
    this.vy = sin(angle) * speed; // 垂直散射速度
    this.alpha = 255; // 初始為不透明
    this.alphaFade = isExtreme ? 2.5 : 4; // 極限模式煙火殘影留存時間更久
    this.r = r;
    this.g = g;
    this.b = b;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // 加上一點重力，讓粒子慢慢往下掉
    this.alpha -= this.alphaFade; // 漸漸變透明
  }
  show() {
    noStroke();
    fill(this.r, this.g, this.b, this.alpha);
    circle(this.x, this.y, 5);
  }
}
