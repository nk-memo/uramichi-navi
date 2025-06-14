// api/route.js
module.exports = async (request, response) => {
  // CORSヘッダーなどのおまじない
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') return response.status(200).end();
  if (request.method !== 'POST') return response.status(405).json({ message: '許可されていません' });

  try {
    const requestBody = request.body;
    const orsApiKey = process.env.ORS_API_KEY; // Vercelに隠したキーを読み込む

    if (!orsApiKey) {
      return response.status(500).json({ message: 'APIキーがサーバーに設定されていません' });
    }

    // OpenRouteServiceに問い合わせる
    const orsResponse = await fetch('https://api.openrouteservice.org/v2/directions/cycling-regular/geojson', {
      method: 'POST',
      headers: {
        'Authorization': orsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await orsResponse.json();
    if (!orsResponse.ok) return response.status(orsResponse.status).json(data);
    
    // 成功したら、結果をブラウザに返す
    return response.status(200).json(data);

  } catch (error) {
    console.error("サーバーエラー:", error);
    return response.status(500).json({ message: 'サーバーでエラーが発生しました' });
  }
};