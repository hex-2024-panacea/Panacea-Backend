# Panacea - 萬靈藥

## 專案介紹
現代人大多有肥胖、心理及職涯上的困擾，而不知道從何處可以得到幫助。不管是去醫院的減重診所或是精神科，距離或是他人的眼光都會成為障礙。因此，線上的預約服務可以減少需要跨越的閥值。而這三個領域的專家往往難以彼此溝通和協同，使得尋求整合建議的人們難以得到最佳化的支持。

Panacea 結合了營養師、心理師、職涯教練的媒合功能，提供完善的身心靈健康建議，為追求更好自我和生活品質的人們搭建一個良好的溝通管道。

## 使用技術
- Node.js >= 16.13.0
- express v4.16.1
- express-rate-limit v7.2.0
- mongoose v8.3.3
- googleapis v137.1.0
- swagger-ui-express v5.0.0
- jsonwebtoken v9.0.2
- uuid v9.0.1
- zod v3.23.8
- typescript v5.4.5
- nodemon v3.1.0
- typespec

### 第三方服務
- Firebase Store
- Google Email 發送服務
- 藍新金流串接服務

## 怎麼啟動專案

### 環境需求
請確保你的系統已安裝以下軟體：
- Node.js (版本 >= 16.13.0)
- npm (Node.js 安裝包中已包含)

### 步驟

1. 克隆這個倉庫到你的本地端
    ```bash
    git clone [https://github.com/yourusername/panacea.git](https://github.com/hex-2024-panacea/Panacea-Backend.git)
    cd Panacea-Backend
    ```

2. 安裝所有相依套件
    ```bash
    npm install
    ```

3. 設置環境變數
    - 建立一個 `.env` 檔案，並填入所需的環境變數，如 MongoDB 路徑、Firebase 配置、Google Cloud 配置、藍新金流 配置、jsonwebtoken 配置等。

4. 啟動開發伺服器
    ```bash
    npm run dev // 執行測試環境
    npm run tsc // 產生 swagger 文件
    ```

5. 開啟瀏覽器並進入 `http://localhost:3000` 以檢視應用程式。

## 貢獻
歡迎任何形式的貢獻。如果有任何問題或建議，請開啟一個 issue 或提交 pull request。
