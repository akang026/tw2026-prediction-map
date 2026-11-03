# 2026 台灣縣市長選舉預測

互動式預測地圖：點選臺灣 22 個縣市，選擇你預測的勝選政黨與把握程度，即時更新地圖顏色與席次統計，並可下載 PNG 或複製分享網址。
預設全部為「未定」，網站不含任何預先填入的預測。

純靜態網站（HTML / CSS / Vanilla JS / SVG），無後端、無框架。`html2canvas` 1.4.1 已放在 `js/vendor/`，不依賴 CDN。

## 本機執行

直接雙擊 `index.html` 即可（程式與地圖已打包進 `dist/app.js`）。

## 修改程式碼

原始碼在 `src/`，修改後需重新打包（需 Node.js），並把更新後的 `dist/app.js` 一起提交：

```bash
./build.sh
```

## 部署到 GitHub Pages

1. 將整個資料夾內容推送到 GitHub 儲存庫（根目錄需有 `index.html`）。
2. 儲存庫 **Settings → Pages**。
3. **Build and deployment → Source** 選 **Deploy from a branch**，Branch 選 `main`、資料夾選 `/ (root)`，按 Save。
4. 約一分鐘後網站會出現在 `https://<帳號>.github.io/<儲存庫>/`。

所有路徑皆為相對路徑，放在子路徑下也能運作。

## 檔案結構

| 路徑 | 說明 |
|---|---|
| `index.html` | 頁面結構 |
| `css/style.css` | 樣式（桌機／手機、選單、匯出卡片） |
| `src/data.js` | 22 個縣市資料（id、中文名、SVG path ID、政黨、把握程度）、政黨色票、網址編碼 |
| `src/map.js` | 載入 SVG、點擊／觸控／鍵盤、懸停外框、依資料上色 |
| `src/statistics.js` | 由縣市資料即時計算席次與比例長條圖（不另存統計數字） |
| `src/sharing.js` | PNG 匯出、分享網址、LocalStorage |
| `src/app.js` | 選單與整體流程 |
| `dist/app.js` | 打包後的程式（含內嵌地圖），`index.html` 實際載入的檔案 |
| `assets/taiwan-map.svg` | 22 縣市邊界（每區一個獨立 `<path id="path-…">`） |
| `tools/` | 產生地圖的腳本（見下） |

## 運作細節

- **政黨色**：國民黨 `#2868B2`／淺 `#91B8E5`、民進黨 `#269B60`／淺 `#91D2AE`、民眾黨 `#FFFFFF`／淺 `#EEEEEE`、無黨籍 `#929292`、未定 `#D5D5D5`。淺色計入該政黨席次。
- **分享網址**：`#v1-` 加 22 位數字（依固定縣市順序，0 未定、1 無黨籍、2/3 國民黨有把握/傾向、4/5 民進黨、6/7 民眾黨）。格式錯誤的網址會被忽略並顯示提示，改用上次的預測。
- **LocalStorage**：每次修改即儲存；網址帶有有效預測時以網址為準。
- **PNG 匯出**：以 html2canvas 擷取一張專用卡片（標題、地圖、統計、時間、網站來源，不含按鈕），白底、2–3 倍解析度。地圖顏色以 SVG 屬性寫入，確保匯出正確。

## 地圖資料

邊界來自 npm 套件 [`taiwan-atlas`](https://www.npmjs.com/package/taiwan-atlas)（整理自內政部國土測繪中心縣市界 TopoJSON），以墨卡托投影轉成 SVG。連江縣、金門縣、澎湖縣依真實位置呈現，並加大點擊範圍；東沙、南沙因離本島過遠而不納入畫面。

重新產生地圖：

```bash
cd tools && npm i topojson-client d3-geo && npm pack taiwan-atlas && tar xzf taiwan-atlas-*.tgz
node gen.cjs && node build.cjs   # build.cjs 會輸出 ../assets/taiwan-map.svg
```
