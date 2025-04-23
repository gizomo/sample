package com.sample.system;

import android.annotation.SuppressLint;
import android.app.UiModeManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Handler;
import android.provider.Settings;
import android.util.Log;
import android.view.Window;

import androidx.annotation.Nullable;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.sample.MainActivity;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import de.andycandy.android.bridge.CallType;
import de.andycandy.android.bridge.DefaultJSInterface;
import de.andycandy.android.bridge.JSFunctionWithArg;
import de.andycandy.android.bridge.NativeCall;
import de.andycandy.android.bridge.Promise;

public class DeviceController extends DefaultJSInterface {
    private static final String[] STB_CPU_LIST = {
        "Amlogic",
        "Allwinner",
        "Broadcom",
        "Quantenna",
        "Annapurna Labs",
        "Rockchip",
        "Nvidia",
        "STMicro",
        "Sigma Designs",
    };

    private static final String[] TV_FEATURES = {
        "android.hardware.hdmi.cec",
    };

    private final DeviceInfo info;
    private final MainActivity activity;
    private int orientation;
    private boolean fullscreen = false;
    private JSFunctionWithArg<RemoteKeyEvent> onKeyEventCallback;

    private boolean checkFeatures(final String[] features, boolean state) {
        for (final String feature : features) {
            if (this.activity.getPackageManager().hasSystemFeature(feature) != state) {
                return false;
            }
        }

        return true;
    }

    private boolean checkHardwareName(String value) {
        for (final String cpuName : STB_CPU_LIST) {
            if (cpuName.equals(value)) {
                return true;
            }
        }

        return false;
    }

    private String getCpuName() {
        try {
            BufferedReader br = new BufferedReader(new FileReader("/proc/cpuinfo"));
            String line = br.readLine();

            while (null != line) {
                if (!line.isEmpty()) {
                    String[] array = line.split(":\\s+", 2);

                    if (array.length >= 2 && array[0].trim().equals("Hardware")) {
                        return array[1].trim();
                    }
                }

                line = br.readLine();
            }

            br.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    public DeviceController(MainActivity activity) {
        super("device");

        this.activity = activity;
        info = new DeviceInfo(activity);
    }

    public void onKeyPressed(RemoteKeyEvent event) {
        if (null != onKeyEventCallback) {
            onKeyEventCallback.call(event);
        }
    }

    public PackageInfo getAppInfo() throws PackageManager.NameNotFoundException {
        return this.activity.getPackageManager().getPackageInfo(this.activity.getPackageName(), 0);
    }

    public void openSystemSettings() {
        Intent settingsIntent = new Intent(Settings.ACTION_SETTINGS);
        settingsIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        this.activity.startActivity(settingsIntent);
    }

    @SuppressLint("WrongConstant")
    public void restoreFullscreen() {
        Window window = activity.getWindow();
        WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(window, window.getDecorView());

        activity.runOnUiThread(() -> {
            try {
                WindowCompat.setDecorFitsSystemWindows(window, !fullscreen);

                if (fullscreen) {
                    controller.hide(WindowInsetsCompat.Type.systemBars());
                    controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                } else {
                    controller.show(WindowInsetsCompat.Type.systemBars());
//                     controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_DEFAULT); // gradle cannot find this constant during compile
                    controller.setSystemBarsBehavior(1);
                }
            } catch (Exception e) {
                //Do nothing
            }
        });
    }

    public void restoreOrientation(int newOrientation) {
        int saved = orientation == ActivityInfo.SCREEN_ORIENTATION_PORTRAIT ? Configuration.ORIENTATION_PORTRAIT : Configuration.ORIENTATION_LANDSCAPE;

        if (newOrientation != saved) {
            activity.setRequestedOrientation(orientation);
        }
    }

    @NativeCall(CallType.FULL_SYNC)
    public void onKeyEvent(JSFunctionWithArg<RemoteKeyEvent> callback) {
        onKeyEventCallback = callback;
    }

    @NativeCall(CallType.FULL_SYNC)
    public void nativeBack() {
        new Handler(activity.getMainLooper()).post(activity::nativeBackPress);
    }

    @NativeCall(CallType.FULL_SYNC)
    public void setOrientation(String orientation) {
        this.orientation = orientation.equals("portrait") ? ActivityInfo.SCREEN_ORIENTATION_PORTRAIT : ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE;
        activity.setRequestedOrientation(this.orientation);
    }

    @NativeCall(CallType.FULL_SYNC)
    public void nativeLog(String message) {
        Log.i("LOG_FROM_JS", message);
    }

    @NativeCall(CallType.FULL_SYNC)
    public boolean isTv() {
        if (((UiModeManager) this.activity.getSystemService(Context.UI_MODE_SERVICE)).getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION) {
            return true;
        }

        if (this.checkHardwareName(Build.HARDWARE) || this.checkHardwareName(getCpuName())) {
            return true;
        }

        return this.checkFeatures(TV_FEATURES, true);
    }

    @NativeCall(CallType.FULL_SYNC)
    public String getId() {
        return info.id;
    }

    @NativeCall(CallType.FULL_SYNC)
    public String getOSVersion() {
        return info.systemVersion;
    }

    @NativeCall(CallType.FULL_SYNC)
    public DeviceInfo getInfo() {
        return info;
    }

    @NativeCall(CallType.FULL_PROMISE)
    public Promise<List<ApplicationInfo>> getApps() {
        return doInBackground((promise) -> {
            class OneShotTask implements Runnable {
                private final Context context;

                OneShotTask(final Context context) {
                    this.context = context;
                }

                public void run() {
                    try {
                        final PackageManager pm = this.context.getPackageManager();
                        final List<PackageInfo> packages = pm.getInstalledPackages(0);
                        final List<ApplicationInfo> apps = new ArrayList<>();

                        for (int i = 0; i < packages.size(); i++) {
                            apps.add(new ApplicationInfo(packages.get(i), pm));
                        }

                        promise.resolve(apps);
                    } catch (final Exception ex) {
                        promise.reject(ex);
                    }
                }
            }

            Thread t = new Thread(new OneShotTask(this.activity));
            t.start();

            return null;
        });
    }

    @NativeCall(CallType.FULL_PROMISE)
    public Promise<String> openApplication(String packageName, @Nullable String activityName) {
        return doInBackground((promise) -> {
            PackageManager pm = this.activity.getPackageManager();

            try {
                Intent leanbackIntent = pm.getLeanbackLaunchIntentForPackage(packageName);
                Intent defaultIntent = pm.getLaunchIntentForPackage(packageName);

                if (leanbackIntent != null) {
                    this.activity.startActivity(leanbackIntent);
                } else if (defaultIntent != null) {
                    this.activity.startActivity(defaultIntent);
                } else if (activityName != null && !activityName.isEmpty()) {
                    Intent launchIntent = new Intent(Intent.ACTION_MAIN);
                    launchIntent.setPackage(packageName);
                    launchIntent.setComponent(new ComponentName(packageName, activityName));
                    launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                    this.activity.startActivity(launchIntent);
                } else {
                    throw new Exception("Cannot open application: no intent was generated");
                }

                promise.resolve(packageName);
            } catch (Exception e) {
                promise.reject(e);
            }

            return null;
        });
    }

    @NativeCall(CallType.FULL_PROMISE)
    public Promise<String> openSettings() {
        return doInBackground((promise) -> {
            try {
                this.openSystemSettings();
                promise.resolve(Settings.ACTION_SETTINGS);
            } catch (Exception e) {
                promise.reject(e);
            }

            return null;
        });
    }

    @NativeCall(CallType.FULL_PROMISE)
    public Promise<String> openUrl(String url) {
        return doInBackground((promise) -> {
            try {
                Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                PackageManager pm = this.activity.getPackageManager();
                List<ResolveInfo> infos = pm.queryIntentActivities(intent, 0);

                if (infos.isEmpty()) {
                    promise.reject(new Exception("There is no any app to open this url"));
                } else {
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    this.activity.startActivity(intent);
                    promise.resolve(url);
                }
            } catch (Exception e) {
                promise.reject(e);
            }

            return null;
        });
    }

    @SuppressLint("WrongConstant")
    @NativeCall(CallType.FULL_PROMISE)
    public Promise<Boolean> setFullscreen(Boolean value) {
        return doInBackground((promise) -> {
            Window window = activity.getWindow();
            WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(window, window.getDecorView());

            activity.runOnUiThread(() -> {
                try {
                    WindowCompat.setDecorFitsSystemWindows(window, !value);

                    if (value) {
                        controller.hide(WindowInsetsCompat.Type.systemBars());
                        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                    } else {
                        controller.show(WindowInsetsCompat.Type.systemBars());
//                        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_DEFAULT); // gradle cannot find this constant during compile
                        controller.setSystemBarsBehavior(1);
                    }

                    fullscreen = value;

                    promise.resolve(value);
                } catch (Exception e) {
                    promise.reject(e);
                }
            });

            return null;
        });
    }
}
