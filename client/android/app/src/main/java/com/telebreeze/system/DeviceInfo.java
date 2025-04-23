package com.sample.system;

import android.content.Context;
import android.os.Build;
import android.provider.Settings;

public class DeviceInfo {
    public String id;
    public String brand = Build.BRAND;
    public String name = Build.BOARD;
    public String manufacturer = Build.MANUFACTURER;
    public String model = Build.MODEL;
    public String build = Build.ID;
    public String systemVersion = Build.VERSION.RELEASE;
    public Integer sdkVersion = Build.VERSION.SDK_INT;

    public DeviceInfo(Context context) {
        id = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
    }
}
