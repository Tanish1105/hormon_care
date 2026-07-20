import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageStyle,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StatusBar,
  StyleProp,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import type {
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme';

type Props = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  accessibilityLabel?: string;
  fallback?: React.ReactNode;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function ZoomableImage({
  uri,
  onCloseRequest,
}: {
  uri: string;
  onCloseRequest: () => void;
}) {
  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const scale = Animated.multiply(baseScale, pinchScale);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef({ x: 0, y: 0 }).current;

  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const doubleTapRef = useRef(null);

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true },
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      let next = lastScale.current * event.nativeEvent.scale;
      next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      lastScale.current = next;
      baseScale.setValue(next);
      pinchScale.setValue(1);
      if (next <= MIN_SCALE) {
        lastOffset.x = 0;
        lastOffset.y = 0;
        translateX.setOffset(0);
        translateY.setOffset(0);
        translateX.setValue(0);
        translateY.setValue(0);
      }
    }
  };

  const onPanEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true },
  );

  const onPanStateChange = (event: PanGestureHandlerGestureEvent | any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastOffset.x += event.nativeEvent.translationX;
      lastOffset.y += event.nativeEvent.translationY;
      translateX.setOffset(lastOffset.x);
      translateY.setOffset(lastOffset.y);
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  const onDoubleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state !== State.ACTIVE) return;
    const zoomed = lastScale.current > 1.05;
    const next = zoomed ? 1 : 2.5;
    lastScale.current = next;
    Animated.spring(baseScale, {
      toValue: next,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
    if (zoomed) {
      lastOffset.x = 0;
      lastOffset.y = 0;
      translateX.setOffset(0);
      translateY.setOffset(0);
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  const reset = useCallback(() => {
    lastScale.current = 1;
    lastOffset.x = 0;
    lastOffset.y = 0;
    baseScale.setValue(1);
    pinchScale.setValue(1);
    translateX.setOffset(0);
    translateY.setOffset(0);
    translateX.setValue(0);
    translateY.setValue(0);
  }, [baseScale, pinchScale, translateX, translateY, lastOffset]);

  useEffect(() => {
    reset();
  }, [uri, reset]);

  return (
    <View style={styles.imageArea}>
      <TapGestureHandler
        ref={doubleTapRef}
        numberOfTaps={2}
        onHandlerStateChange={onDoubleTap}>
        <Animated.View style={styles.imageArea}>
          <PanGestureHandler
            ref={panRef}
            onGestureEvent={onPanEvent}
            onHandlerStateChange={onPanStateChange}
            simultaneousHandlers={pinchRef}
            minPointers={1}
            maxPointers={2}
            avgTouches>
            <Animated.View style={styles.imageArea}>
              <PinchGestureHandler
                ref={pinchRef}
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}
                simultaneousHandlers={panRef}>
                <Animated.View
                  style={[
                    styles.imageArea,
                    {
                      transform: [
                        { translateX },
                        { translateY },
                        { scale },
                      ],
                    },
                  ]}>
                  <Pressable
                    style={styles.imageArea}
                    onPress={() => {
                      if (lastScale.current <= 1.05) onCloseRequest();
                    }}>
                    <Animated.Image
                      source={{ uri }}
                      style={styles.fullImage}
                      resizeMode="contain"
                    />
                  </Pressable>
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
}

export default function FullscreenImage({
  uri,
  style,
  containerStyle,
  resizeMode = 'cover',
  accessibilityLabel,
  fallback,
}: Props) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const { height } = Dimensions.get('window');

  if (failed) {
    return fallback ? <>{fallback}</> : <View style={[styles.failed, style as ViewStyle]} />;
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.thumbWrap, containerStyle, style as ViewStyle]}
        accessibilityRole="imagebutton"
        accessibilityLabel={accessibilityLabel || t('tapToFullscreen')}>
        <Image
          source={{ uri }}
          style={styles.thumbImage}
          resizeMode={resizeMode}
          onError={() => setFailed(true)}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <GestureHandlerRootView style={styles.backdrop}>
          <Pressable
            style={[styles.closeBtn, { top: insets.top + 8 }]}
            onPress={() => setOpen(false)}
            hitSlop={12}
            accessibilityLabel={t('closeFullscreen')}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <View style={{ flex: 1, maxHeight: height }}>
            <ZoomableImage
              uri={uri}
              onCloseRequest={() => setOpen(false)}
            />
          </View>

          <Text style={[styles.hint, { bottom: insets.bottom + 16 }]}>
            {t('pinchToZoom')}
          </Text>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  thumbWrap: {
    overflow: 'hidden',
    backgroundColor: colors.borderLight,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  failed: {
    backgroundColor: colors.borderLight,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  imageArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.78,
  },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    zIndex: 2,
  },
});
