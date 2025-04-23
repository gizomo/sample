package com.sample;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.CountDownTimer;
import android.os.SystemClock;

import com.sample.helpers.Utils;

public class LauncherActivity extends InstallerActivity {
    private final BroadcastReceiver homeKeyListener = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();

            if (null != action && action.equals(Intent.ACTION_CLOSE_SYSTEM_DIALOGS)) {
                String reason = intent.getStringExtra("reason");

                if (reason != null && reason.equals("homekey")) {
                    webViewController.dispatchHomeKeyEvent();
                }
            }
        }
    };

    @Override
    protected void launchReconnectTimer() {
        timer = new CountDownTimer(30000, 2000) {
            @Override
            public void onTick(long millisUntilFinished) {
                Utils.ping(
                    getString(R.string.portalUrl),
                    () -> {
                        if (null != timer) {
                            timer.cancel();
                            timer = null;
                            runOnUiThread(LauncherActivity.this::start);
                        }
                    },
                    () -> {
                        if (SystemClock.elapsedRealtime() > 60000) {
                            runOnUiThread(LauncherActivity.this::showAlert);
                        }
                    }
                );
            }

            @Override
            public void onFinish() {
                launchReconnectTimer();
            }
        };
        timer.start();
    }

    @Override
    protected void showAlert() {
        booted = true;

        if (null == alert) {
            alert = new AlertDialog.Builder(this)
                .setTitle(R.string.connection_error_title)
                .setMessage(R.string.connection_error_message)
                .setPositiveButton(R.string.open_settings, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int id) {
                        deviceController.openSystemSettings();
                    }
                })
                .setOnCancelListener(new DialogInterface.OnCancelListener() {
                    @Override
                    public void onCancel(DialogInterface dialog) {
                        deviceController.openSystemSettings();
                    }
                })
                .show();
        }
    }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    @Override
    protected void onStart() {
        super.onStart();
        registerReceiver(homeKeyListener, new IntentFilter(Intent.ACTION_CLOSE_SYSTEM_DIALOGS));
    }

    @Override
    protected void onStop() {
        super.onStop();
        unregisterReceiver(homeKeyListener);
    }

    @Override
    public void onBackPressed() {
        if (!loaded) {
            deviceController.openSystemSettings();
        } else {
            super.onBackPressed();
        }
    }
}
