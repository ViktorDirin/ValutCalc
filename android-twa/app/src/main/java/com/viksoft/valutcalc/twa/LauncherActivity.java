package com.viksoft.valutcalc.twa;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import androidx.annotation.Nullable;
import androidx.browser.customtabs.CustomTabsIntent;

/**
 * Launcher Activity for TWA (Trusted Web Activity)
 * This activity handles the TWA launch and fallback to custom tabs
 */
public class LauncherActivity extends Activity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Try to launch TWA, fallback to custom tabs
        if (isTwaSupported()) {
            try {
                Intent twaIntent = new Intent();
                twaIntent.setAction(Intent.ACTION_VIEW);
                twaIntent.setData(Uri.parse("https://viktordirin.github.io/ValutCalc/"));
                twaIntent.addCategory(Intent.CATEGORY_BROWSABLE);

                // Set TWA specific flags
                twaIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                startActivity(twaIntent);
                finish();
                return;
            } catch (Exception e) {
                // Fallback to custom tabs
            }
        }

        // Fallback: Use Custom Tabs
        launchCustomTabs();
        finish();
    }

    private boolean isTwaSupported() {
        try {
            getPackageManager().getPackageInfo("com.google.android.gms", 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    private void launchCustomTabs() {
        String url = "https://viktordirin.github.io/ValutCalc/";

        CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
        builder.setToolbarColor(getColor(android.R.color.black));
        builder.setShowTitle(true);

        CustomTabsIntent customTabsIntent = builder.build();
        customTabsIntent.launchUrl(this, Uri.parse(url));
    }
}