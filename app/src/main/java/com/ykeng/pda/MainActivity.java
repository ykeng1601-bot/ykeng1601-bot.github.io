package com.ykeng.pda;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import org.json.JSONObject;

public class MainActivity extends Activity {

    private WebView webView;
    private static final String SERVER_URL = "http://192.168.0.45:3000";
    private static final int REQ_CAMERA = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);       // localStorage 사용
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // 바코드 스캐너 입력 처리 (HW 스캐너 → 키입력으로 들어옴)
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // 내부 URL만 허용
                if (url.startsWith(SERVER_URL)) {
                    view.loadUrl(url);
                    return true;
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient());

        // 웹페이지 📷 버튼 → AndroidScan.scan() → 휴대폰 카메라 스캔 (ZXing)
        webView.addJavascriptInterface(new ScanBridge(), "AndroidScan");

        webView.loadUrl(SERVER_URL);
    }

    // ── 웹 ↔ 앱 연결 ──
    private class ScanBridge {
        @JavascriptInterface
        public void scan() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    startScanWithPermission();
                }
            });
        }
    }

    private void startScanWithPermission() {
        if (Build.VERSION.SDK_INT >= 23
                && checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_CAMERA);
            return;
        }
        startScan();
    }

    private void startScan() {
        IntentIntegrator ii = new IntentIntegrator(this);
        ii.setDesiredBarcodeFormats(IntentIntegrator.ALL_CODE_TYPES);
        ii.setPrompt("바코드를 화면 안에 맞춰주세요");
        ii.setBeepEnabled(true);
        ii.setOrientationLocked(true);
        ii.setCaptureActivity(PortraitCaptureActivity.class);
        ii.initiateScan();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_CAMERA) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startScan();
            } else {
                Toast.makeText(this, "카메라 권한이 필요합니다.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if (result != null) {
            String code = result.getContents();
            if (code != null) {
                // 스캔 결과를 웹페이지로 전달 → window.onNativeScan(코드)
                String js = "window.onNativeScan && window.onNativeScan(" + JSONObject.quote(code) + ")";
                webView.evaluateJavascript(js, null);
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    // 뒤로가기 버튼 → 웹뷰 히스토리
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }
}
