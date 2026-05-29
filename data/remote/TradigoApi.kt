interface TradigoApi {
    @POST("exec") // Your Apps Script Web App URL
    suspend fun callAction(@Body request: Map<String, Any>): TradigoResponse
}

data class TradigoResponse(
    val success: Boolean,
    val uid: String?,
    val message: String?,
    val news: List<List<String>>?,
    val balance: Double?
)
