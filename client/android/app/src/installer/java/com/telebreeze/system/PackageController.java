package com.sample.system;

import android.app.Activity;
import android.content.pm.PackageInfo;
import android.content.res.Resources;
import android.net.Uri;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.StringRes;
import androidx.core.content.FileProvider;

import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.MoreExecutors;
import com.sample.R;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import de.andycandy.android.bridge.CallType;
import de.andycandy.android.bridge.DefaultJSInterface;
import de.andycandy.android.bridge.JSFunctionWithArg;
import de.andycandy.android.bridge.NativeCall;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import okio.Buffer;
import okio.BufferedSource;
import okio.ForwardingSource;
import okio.Okio;
import okio.Source;
import ru.solrudev.ackpine.DisposableSubscriptionContainer;
import ru.solrudev.ackpine.installer.InstallFailure;
import ru.solrudev.ackpine.installer.PackageInstaller;
import ru.solrudev.ackpine.installer.parameters.InstallParameters;
import ru.solrudev.ackpine.session.Progress;
import ru.solrudev.ackpine.session.ProgressSession;
import ru.solrudev.ackpine.session.Session;
import ru.solrudev.ackpine.session.parameters.Confirmation;

public class PackageController extends DefaultJSInterface {
    private final Activity activity;
    private JSFunctionWithArg<Integer> onDownloadChange;
    private JSFunctionWithArg<Integer> onProgressChange;
    private PackageManager packageManager;

    public PackageController(Activity activity) {
        super("package");

        this.activity = activity;
    }

    public String getInstallerSessionId() {
        return null != packageManager ? packageManager.getSessionId() : null;
    }

    public void restoreInstallerSession(String id) {
        if (null != id && null != packageManager) {
            packageManager.restoreSession(id);
        }
    }

    public void dispose() {
        if (null != packageManager) {
            packageManager.clear();
            packageManager = null;
        }
    }

    private final class PackageManager {
        private final PackageInstaller packageInstaller = PackageInstaller.getInstance(activity);
        private final File apkFile = new File(getPackageFilePath());
        private final String url;
        private final String version;

        private Call downloadCall;
        private DisposableSubscriptionContainer subscriptions;
        private ProgressSession<InstallFailure> session;

        public PackageManager(String url, String version) {
            this.url = url;
            this.version = version;

            removePackageFile();
        }

        private void showToast(@StringRes int resId) {
            Toast.makeText(activity, resId, Toast.LENGTH_SHORT).show();
        }

        private String getPackageFilePath() {
            return activity.getCacheDir().toString() + "/package.apk";
        }

        private Uri getPackageUri() {
            return FileProvider.getUriForFile(activity,  activity.getPackageName() + ".provider", apkFile);
        }

        private void removePackageFile() {
            if (apkFile.exists()) {
                apkFile.delete();
            }
        }

        private void cancelDownload() {
            if (null != downloadCall && downloadCall.isExecuted()) {
                downloadCall.cancel();
            }
        }

        public String getSessionId() {
            if (null != session) {
                return session.getId().toString();
            }

            return null;
        }

        public void update() {
            download(this::install);
        }

        public void clear() {
            cancelDownload();
            removeInstaller();
            removePackageFile();
        }

        public void restoreSession(@NonNull String id) {
            Futures.addCallback(packageInstaller.getSessionAsync(UUID.fromString(id)), new FutureCallback<ProgressSession<InstallFailure>>() {
                @Override
                public void onSuccess(@Nullable ProgressSession<InstallFailure> session) {
                    if (null != session) {
                        session.addStateListener(subscriptions, new SessionStateListener(session));
                        session.addProgressListener(subscriptions, (@NonNull UUID id, @NonNull Progress progress) -> updateSessionProgress(id, progress));
                    }
                }

                @Override
                public void onFailure(@NonNull Throwable t) {
                }
            }, MoreExecutors.directExecutor());
        }

        private final class SessionStateListener extends Session.TerminalStateListener<InstallFailure> {
            public SessionStateListener(@NonNull Session<? extends InstallFailure> session) {
                super(session);
            }

            @Override
            public void onCancelled(@NonNull UUID sessionId) {
                if (session.getId() == sessionId) {
                    if (null != onProgressChange) {
                        onProgressChange.call(-1);
                    }

                    showToast(R.string.update_canceled);
                    Log.w("Update canceled", sessionId.toString());

                    dispose();
                }
            }

            @Override
            public void onFailure(@NonNull UUID sessionId, @NonNull InstallFailure failure) {
                if (session.getId() == sessionId) {
                    if (null != onProgressChange) {
                        onProgressChange.call(-1);
                    }

                    showToast(R.string.update_failed);
                    Log.e("Update failed", failure.toString());

                    dispose();
                }
            }

            @Override
            public void onSuccess(@NonNull UUID sessionId) {
                if (session.getId() == sessionId) {
                    if (null != onProgressChange) {
                        onProgressChange.call(100);
                    }

                    showToast(R.string.update_competed);
                    Log.i("Update completed", sessionId.toString());

                    dispose();
                }
            }
        }

        private void removeInstaller() {
            if (null != subscriptions) {
                subscriptions.dispose();
                subscriptions = null;
                session.cancel();
                session = null;
            }
        }

        private void install() {
            Uri uri = getPackageUri();
            Log.i("Installing:", uri.toString());
            removeInstaller();
            subscriptions = new DisposableSubscriptionContainer();
            session = packageInstaller.createSession(
                new InstallParameters.Builder(uri)
                    .setRequireUserAction(true)
                    .setConfirmation(Confirmation.IMMEDIATE)
                    .build()
            );

            session.addStateListener(subscriptions, new SessionStateListener(session));
            session.addProgressListener(subscriptions, this::updateSessionProgress);
        }

        private void updateSessionProgress(@NonNull UUID id, @NonNull Progress progress) {
            if (null != onProgressChange && session.getId() == id) {
                if (progress.getProgress() < 5) {
                    System.out.println(activity.getPackageManager().getPackageInstaller().getMySessions());
                }
                onProgressChange.call(progress.getProgress());
            }
        }

        private final class ProgressResponseBody extends ResponseBody {
            private final ResponseBody responseBody;
            private BufferedSource bufferedSource;

            public ProgressResponseBody(ResponseBody responseBody) {
                this.responseBody = responseBody;
            }

            @Override
            public MediaType contentType() {
                return responseBody.contentType();
            }

            @Override
            public long contentLength() {
                return responseBody.contentLength();
            }

            @NonNull
            @Override
            public BufferedSource source() {
                if (null == bufferedSource) {
                    bufferedSource = Okio.buffer(source(responseBody.source()));
                }

                return bufferedSource;
            }

            private Source source(Source source) {
                return new ForwardingSource(source) {
                    long totalBytesRead = 0L;

                    @Override
                    public long read(@NonNull Buffer sink, long byteCount) throws IOException {
                        long bytesRead = super.read(sink, byteCount);
                        totalBytesRead += bytesRead != -1 ? bytesRead : 0;

                        if (null != onDownloadChange) {
                            onDownloadChange.call((int) (totalBytesRead * 100 / contentLength()));
                        }

                        return bytesRead;
                    }
                };
            }
        }

        private void download(Runnable runnable) {
            OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .addNetworkInterceptor(new Interceptor() {
                    @NonNull
                    @Override
                    public Response intercept(@NonNull Chain chain) throws IOException {
                        Response originalResponse = chain.proceed(chain.request());
                        return originalResponse.newBuilder()
                            .body(new ProgressResponseBody(originalResponse.body()))
                            .build();
                    }
                })
                .build();

            downloadCall = client.newCall(new Request.Builder().url(this.url).build());
            downloadCall.enqueue(new Callback() {
                @Override
                public void onFailure(@NonNull Call call, @NonNull IOException exception) {
                    onDownloadFailed(exception);
                }

                @Override
                public void onResponse(@NonNull Call call, @NonNull Response response) {
                    onDownloadSucceed(response, runnable);
                }
            });
        }

        private void onDownloadFailed(IOException exception) {
            if (null != onDownloadChange) {
                onDownloadChange.call(-1);
            }

            activity.runOnUiThread(new Runnable() {
                public void run() {
                    showToast(R.string.download_failed);
                    Log.e("Download failed", "uri: " + url + ", error: " + exception);
                }
            });

            downloadCall = null;
        }

        private void onDownloadSucceed(@NonNull Response response, @NonNull Runnable runnable) {
            if (response.isSuccessful()) {
                try {
                    FileOutputStream outputStream = new FileOutputStream(apkFile);
                    outputStream.write(response.body().bytes());
                    outputStream.close();

                    if (null != onDownloadChange) {
                        onDownloadChange.call(100);
                    }

                    activity.runOnUiThread(new Runnable() {
                        public void run() {
                            showToast(R.string.download_completed);
                            Log.i("Download completed", "uri: " + url + ", version: " + version);
                        }
                    });

                    runnable.run();
                } catch (IOException exception) {
                    onDownloadFailed(exception);
                }
            } else {
                onDownloadFailed(new IOException("Failed to download file: " + response));
            }

            downloadCall = null;
        }
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

    @NativeCall(CallType.FULL_SYNC)
    public void updatePackage(@NonNull String packageUrl, @NonNull String version) {
        if (null == packageManager) {
            packageManager = new PackageManager(packageUrl, version);
            packageManager.update();
        }
    }

    @NativeCall(CallType.FULL_SYNC)
    public void cancelUpdate() {
        if (null != onDownloadChange) {
            onDownloadChange.close();
            onDownloadChange = null;
        }

        if (null != onProgressChange) {
            onProgressChange.close();
            onProgressChange = null;
        }

        dispose();
    }

    @NativeCall(CallType.FULL_SYNC)
    public void onDownloadProgress(JSFunctionWithArg<Integer> callback) {
        onDownloadChange = callback;
    }

    @NativeCall(CallType.FULL_SYNC)
    public void onInstallProgress(JSFunctionWithArg<Integer> callback) {
        onProgressChange = callback;
    }
}
