package io.github.viktordirin.twa;

import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.google.androidbrowserhelper.trusted.TwaLauncher;

public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Установка портретной ориентации для Android 8+
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.O) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER_PORTRAIT);
        }

        // Делаем статус-бар прозрачным
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        }
    }

    @Override
    protected boolean shouldLaunchImmediately() {
        // Проверяем, содержит ли URL команду на очистку кэша
        Uri uri = getIntent().getData();
        if (uri != null && uri.toString().contains("#clear-cache")) {
            openAppDetails();
            return false; // Не запускаем TWA, так как уходим в настройки
        }
        return super.shouldLaunchImmediately();
    }

    private void openAppDetails() {
        Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.parse("package:" + getPackageName()));
        startActivity(intent);
        finish(); // Закрываем активити, чтобы после настроек приложение перезапустилось чисто
    }

    @Override
    public void onBackPressed() {
        finish();
    }
}