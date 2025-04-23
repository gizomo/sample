package com.sample;

import android.os.Bundle;

import androidx.annotation.NonNull;

public class InstallerActivity extends MainActivity {
    @Override
    protected void restoreFromState(Bundle savedInstanceState) {
        packageController.restoreInstallerSession(savedInstanceState.getString("SESSION_ID", null));
        super.restoreFromState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putString("SESSION_ID", packageController.getInstallerSessionId());
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        packageController.dispose();
    }
}
