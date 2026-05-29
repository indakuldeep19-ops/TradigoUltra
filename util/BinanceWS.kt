class BinanceWS {
    private val client = OkHttpClient()
    private val _prices = MutableStateFlow<Map<String, String>>(emptyMap())
    val prices = _prices.asStateFlow()

    fun start() {
        val request = Request.Builder().url("wss://stream.binance.com:9443/ws/!ticker@arr").build()
        client.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                val array = JSONArray(text)
                val map = mutableMapOf<String, String>()
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    val s = obj.getString("s")
                    if (s.endsWith("USDT")) map[s] = obj.getString("c")
                }
                _prices.value = map
            }
        })
    }
}
