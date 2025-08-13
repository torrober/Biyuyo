package com.safespender.planner;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		WebView webView = (WebView) getBridge().getWebView();
		if (webView != null) {
			webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
		}
	}
}
