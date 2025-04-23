package com.sample.system;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;

import com.sample.helpers.Utils;

import java.io.File;

public class ApplicationInfo {
    public String firstActivityName;
    public String packageName;
    public String versionName;
    public Integer versionCode;
    public Long firstInstallTime;
    public Long lastUpdateTime;
    public String appName;
    public String icon;
    public String apkDir;
    public Long size;
    public String flavor;
    public String branch;
    public String commit;

    public ApplicationInfo(final PackageInfo packageInfo, final PackageManager pm) {
        String firstActivityName = "";

        if (packageInfo.activities != null && packageInfo.activities.length > 0) {
            firstActivityName = packageInfo.activities[0].name;
        }

        this.firstActivityName = firstActivityName;
        this.packageName = packageInfo.packageName;
        this.versionName = packageInfo.versionName;
        this.versionCode = packageInfo.versionCode;
        this.firstInstallTime = packageInfo.firstInstallTime;
        this.lastUpdateTime = packageInfo.lastUpdateTime;
        this.appName = ((String) packageInfo.applicationInfo.loadLabel(pm)).trim();
        this.icon = Utils.convert(pm.getApplicationIcon(packageInfo.applicationInfo));
        this.apkDir = packageInfo.applicationInfo.publicSourceDir;
        this.size = new File(this.apkDir).length();
    }

    public ApplicationInfo(final PackageInfo packageInfo, final String flavor, final String branch, final String commit, final PackageManager pm) {
        this(packageInfo, pm);
        this.branch = branch;
        this.commit = commit;
        this.flavor = flavor;
    }

    public String getApkVersion() {
        return "apk-" + versionName + "-" + versionCode + "-" + commit + "-" + branch + "-" + flavor;
    }
}
