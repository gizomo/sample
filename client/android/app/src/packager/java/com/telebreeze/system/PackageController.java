package com.sample.system;

import android.app.Activity;
import android.content.pm.PackageInfo;
import android.content.res.Resources;

import com.sample.R;

import de.andycandy.android.bridge.CallType;
import de.andycandy.android.bridge.DefaultJSInterface;
import de.andycandy.android.bridge.JSFunctionWithArg;
import de.andycandy.android.bridge.NativeCall;

public class PackageController extends DefaultJSInterface {
    private final Activity activity;
    private JSFunctionWithArg<Integer> onDownloadChange;
    private JSFunctionWithArg<Integer> onProgressChange;

    public PackageController(Activity activity) {
        super("package");

        this.activity = activity;
    }

    @NativeCall(CallType.FULL_SYNC)
    public ApplicationInfo getInfo() {
        try {
            final Resources res = activity.getResources();
            final android.content.pm.PackageManager pm = activity.getPackageManager();
            final PackageInfo packageInfo = pm.getPackageInfo(activity.getPackageName(), 0);

            return new ApplicationInfo(packageInfo, res.getString(R.string.flavor), res.getString(R.string.branch), res.getString(R.string.commit), pm);
        } catch (Exception ignore) {
            return null;
        }
    }
}
