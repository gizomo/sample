package com.sample.system;

import android.os.Build;
import android.os.SystemClock;
import android.view.InputDevice;
import android.view.KeyEvent;

public class RemoteKeyEvent extends KeyEvent {
    public int action;
    public int code;
    public int scanCode;

    public RemoteKeyEvent(KeyEvent event) {
        super(createEvent(event));

        action = getAction();
        code = getKeyCode();
        scanCode = getScanCode();
    }

    private static KeyEvent createEvent(KeyEvent event) {
        int code = event.getKeyCode();

        if (code == KeyEvent.KEYCODE_DPAD_CENTER) {
            code = KeyEvent.KEYCODE_ENTER;
        }

        return new KeyEvent(
            event.getDownTime(),
            event.getEventTime(),
            event.getAction(),
            code,
            event.getRepeatCount(),
            event.getMetaState(),
            event.getDeviceId(),
            event.getScanCode(),
            event.getFlags(),
            event.getSource()
        );
    }

    public boolean isMediaKey() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return KeyEvent.isMediaSessionKey(getKeyCode());
        }

        switch (getKeyCode()) {
            case KeyEvent.KEYCODE_MEDIA_PLAY:
            case KeyEvent.KEYCODE_MEDIA_PAUSE:
            case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE:
            case KeyEvent.KEYCODE_MEDIA_STOP:
            case KeyEvent.KEYCODE_MEDIA_PREVIOUS:
            case KeyEvent.KEYCODE_MEDIA_NEXT:
            case KeyEvent.KEYCODE_MEDIA_REWIND:
            case KeyEvent.KEYCODE_MEDIA_FAST_FORWARD:
            case KeyEvent.KEYCODE_MEDIA_AUDIO_TRACK:
            case KeyEvent.KEYCODE_MEDIA_CLOSE:
            case KeyEvent.KEYCODE_MEDIA_EJECT:
            case KeyEvent.KEYCODE_MEDIA_RECORD:
            case KeyEvent.KEYCODE_MEDIA_SKIP_BACKWARD:
            case KeyEvent.KEYCODE_MEDIA_SKIP_FORWARD:
            case KeyEvent.KEYCODE_MEDIA_STEP_BACKWARD:
            case KeyEvent.KEYCODE_MEDIA_STEP_FORWARD:
                return true;
            default:
                return false;
        }
    }

    public boolean isVolumeKey() {
        switch (getKeyCode()) {
            case KeyEvent.KEYCODE_VOLUME_DOWN:
            case KeyEvent.KEYCODE_VOLUME_UP:
            case KeyEvent.KEYCODE_VOLUME_MUTE:
                return true;
            default:
                return false;
        }
    }

    public static KeyEvent createFakeEscEvent() {
        return new KeyEvent(
            SystemClock.uptimeMillis(),
            SystemClock.uptimeMillis(),
            KeyEvent.ACTION_DOWN,
            KEYCODE_ESCAPE,
            0,
            0,
            -1,
            KEYCODE_ESCAPE,
            FLAG_FROM_SYSTEM,
            InputDevice.SOURCE_KEYBOARD
        );
    }

    public static KeyEvent createFakeHomeEvent() {
        return new KeyEvent(
            SystemClock.uptimeMillis(),
            SystemClock.uptimeMillis(),
            KeyEvent.ACTION_DOWN,
            KEYCODE_MOVE_HOME,
            0,
            0,
            -1,
            KEYCODE_HOME,
            FLAG_FROM_SYSTEM,
            InputDevice.SOURCE_KEYBOARD
        );
    }
}
