import React, { useState } from 'react';
import {
  Image,
  ImageStyle,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocale } from '../context/LocaleContext';

type Props = {
  uri: string;
  style?: ImageStyle | ImageStyle[];
  containerStyle?: ViewStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  accessibilityLabel?: string;
};

export default function FullscreenImage({
  uri,
  style,
  containerStyle,
  resizeMode = 'cover',
  accessibilityLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { t } = useLocale();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={containerStyle}
        accessibilityRole="imagebutton"
        accessibilityLabel={accessibilityLabel || t('tapToFullscreen')}>
        <Image source={{ uri }} style={style} resizeMode={resizeMode} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.backdrop}>
          <Pressable
            style={[styles.closeBtn, { top: insets.top + 8 }]}
            onPress={() => setOpen(false)}
            hitSlop={12}
            accessibilityLabel={t('closeFullscreen')}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Pressable
            style={styles.imageArea}
            onPress={() => setOpen(false)}>
            <Image
              source={{ uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={[styles.hint, { bottom: insets.bottom + 16 }]}>
            {t('closeFullscreen')}
          </Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 8,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
});
