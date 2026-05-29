@Composable
fun TradeScreen(symbol: String, viewModel: TradeViewModel = hiltViewModel()) {
    Column(modifier = Modifier.fillMaxSize().background(DarkBackground)) {
        Text("Trading $symbol", color = Gold, style = MaterialTheme.typography.headlineMedium)
        
        // MPAndroidChart Integration via AndroidView
        AndroidView(factory = { ctx ->
            CandleStickChart(ctx).apply {
                // Configure styling for Gold/Black theme
            }
        }, modifier = Modifier.height(300.dp).fillMaxWidth())

        Row {
            Button(onClick = { viewModel.executeTrade(symbol, "BUY") }, colors = ButtonDefaults.buttonColors(containerColor = Color.Green)) {
                Text("BUY")
            }
            Button(onClick = { viewModel.executeTrade(symbol, "SELL") }, colors = ButtonDefaults.buttonColors(containerColor = Color.Red)) {
                Text("SELL")
            }
        }
    }
}
