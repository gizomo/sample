package com.sample.helpers;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class Utils {
    public static String convert(Drawable drawable) {
        try {
            return convert(drawableToBitmap(drawable));
        } catch (Exception e) {
            Log.e("Convert drawable error", e.toString());
        }

        return "";
    }

    public static String convert(Bitmap bitmap) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream);

        return Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT);
    }

    public static Bitmap drawableToBitmap(Drawable drawable) {
        Bitmap bitmap = null;

        if (drawable instanceof BitmapDrawable) {
            BitmapDrawable bitmapDrawable = (BitmapDrawable) drawable;

            if (null != bitmapDrawable.getBitmap()) {
                return bitmapDrawable.getBitmap();
            }
        }

        if (0 == drawable.getIntrinsicWidth() || 0 == drawable.getIntrinsicHeight()) {
            bitmap = Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888);
        } else {
            bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
        }

        Canvas canvas = new Canvas(bitmap);
        drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
        drawable.draw(canvas);

        return bitmap;
    }

    public static boolean isStream(Uri uri) {
        String scheme = uri.getScheme();
        return "udp".equals(scheme) || "rtp".equals(scheme);
    }

    public static void ping(String url, @Nullable Runnable resolve, @Nullable Runnable reject) {
        OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(1, TimeUnit.SECONDS)
            .readTimeout(1, TimeUnit.SECONDS)
            .addNetworkInterceptor(new Interceptor() {
                @NonNull
                @Override
                public Response intercept(@NonNull Chain chain) throws IOException {
                    Response originalResponse = chain.proceed(chain.request());
                    return originalResponse.newBuilder()
                        .body(originalResponse.body())
                        .build();
                }
            })
            .build();

        final Call pingCall = client.newCall(new Request.Builder().url(url).build());
        pingCall.enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException exception) {
                if (null != reject) {
                    Log.i("OK_HTTP", "Ping of " + url + " is failed.");
                    reject.run();
                }
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                if (null != resolve && response.isSuccessful()) {
                    Log.i("OK_HTTP", "Ping of " + url + " is ok.");
                    resolve.run();
                }
            }
        });
    }
}
