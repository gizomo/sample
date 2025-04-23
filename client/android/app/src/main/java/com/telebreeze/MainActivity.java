package com.sample;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.res.Configuration;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.util.Log;
import android.view.KeyEvent;
import android.view.WindowManager;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.StringRes;
import androidx.core.splashscreen.SplashScreen;

import com.sample.helpers.Utils;
import com.sample.system.DeviceController;
import com.sample.system.PackageController;
import com.sample.system.RemoteKeyEvent;

public class MainActivity extends Activity {
    protected static final String TAG = "SampleActivity";

    protected WebViewController webViewController;
    protected PackageController packageController;
    protected PlayerController playerController;
    protected DeviceController deviceController;

    protected CountDownTimer timer;
    protected Boolean booted = false;
    protected Boolean loaded = false;
    protected AlertDialog alert = null;

    protected void onLoaded() {
        dismissAlert();
        booted = true;
        loaded = true;
    }

    protected void launchReconnectTimer() {
        timer = new CountDownTimer(30000, 10000) {
            @Override
            public void onTick(long millisUntilFinished) {
                Utils.ping(
                    getString(R.string.portalUrl),
                    () -> {
                        if (null != timer) {
                            timer.cancel();
                            timer = null;
                            runOnUiThread(MainActivity.this::start);
                        }
                    },
                    () -> runOnUiThread(MainActivity.this::showAlert)
                );
            }

            @Override
            public void onFinish() {
                launchReconnectTimer();
            }
        };
        timer.start();
    }

    protected void dismissAlert() {
        if (null != alert) {
            alert.dismiss();
            alert = null;
        }
    }

    protected AlertDialog createAlert(@StringRes int message) {
        return new AlertDialog.Builder(this)
            .setMessage(message)
            .setCancelable(false)
            .setOnKeyListener(new DialogInterface.OnKeyListener() {
                @Override
                public boolean onKey(DialogInterface dialog, int keyCode, KeyEvent event) {
                    if (KeyEvent.KEYCODE_BACK == event.getKeyCode()) {
                        nativeBackPress();
                    }

                    return false;
                }
            })
            .show();
    }

    protected void showAlert() {
        booted = true;

        if (null == alert) {
            alert = createAlert(R.string.connection_error_message);
        }
    }

    protected void showSslErrorAlert() {
        booted = true;

        if (null == alert) {
            Log.v(TAG, "SSL ERROR");
            alert = createAlert(R.string.ssl_error_message);
        }
    }

    protected void start() {
        webViewController.start(this::onLoaded, this::launchReconnectTimer, this::showSslErrorAlert);
    }

    protected void restoreFromState(Bundle savedInstanceState) {
        webViewController.restoreState(savedInstanceState);
    }

    @Override
    public void onConfigurationChanged(@NonNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        deviceController.restoreOrientation(newConfig.orientation);
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        if (null == savedInstanceState) {
            Log.i(TAG, "CREATE");
            SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
            splashScreen.setKeepOnScreenCondition(() -> !booted);

            setContentView(R.layout.activity_main);

            packageController = new PackageController(this);
            deviceController = new DeviceController(this);
            webViewController = new WebViewController(this);
            playerController = new PlayerController(this, webViewController);
            webViewController.addJSInterface(packageController);
            webViewController.addJSInterface(deviceController);
            webViewController.addJSInterface(playerController);
        } else {
            Log.i(TAG, "RESTORE");
            restoreFromState(savedInstanceState);
        }
    }

    @Override
    protected void onStart() {
        Log.i(TAG, "START, " + packageController.getInfo().getApkVersion());
        super.onStart();
        playerController.initializePlayer();
    }

    @Override
    protected void onResume() {
        Log.i(TAG, "RESUME");
        super.onResume();

        if (!loaded) {
            start();
        }
    }

    @Override
    protected void onRestart() {
        Log.i(TAG, "RESTART");
        super.onRestart();
        deviceController.restoreFullscreen();
    }

    @Override
    protected void onStop() {
        Log.i(TAG, "STOP");
        super.onStop();
        playerController.releasePlayer();
        dismissAlert();

        if (null != timer) {
            timer.cancel();
            timer = null;
        }
    }

    @Override
    protected void onDestroy() {
        Log.i(TAG, "DESTROY");
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (!loaded) {
            super.onBackPressed();
        } else {
            webViewController.dispatchEscKeyEvent();
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        RemoteKeyEvent remoteKeyEvent = new RemoteKeyEvent(event);

        if (remoteKeyEvent.isVolumeKey()) {
            return super.dispatchKeyEvent(remoteKeyEvent);
        } else if (remoteKeyEvent.isMediaKey()) {
            webViewController.onMediaButtonEvent(event);
            return true;
        } else {
            super.dispatchKeyEvent(remoteKeyEvent);
            deviceController.onKeyPressed(remoteKeyEvent);
            return false;
        }
    }

    public void nativeBackPress() {
        super.onBackPressed();
    }
}
