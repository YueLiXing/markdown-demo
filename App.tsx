import React, { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StreamdownText } from 'react-native-streamdown';
import history from './history.json';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  scan: boolean;
};
// 与历史消息转换保持一致：每条记录拆成提问和回答，pos=0 的卡片放在正文之前。
const messages: Message[] = history.data.flatMap(item => [
  {
    id: `history-user-${item.id}`,
    role: 'user' as const,
    text: item.query,
    scan: false,
  },
  {
    id: item.id,
    role: 'assistant' as const,
    text: item.answer,
    scan: Boolean('extraData' in item && item.extraData?.length),
  },
]);

function Chat() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = width / 375;
  const w = (n: number) => n * scale;
  const list = useRef<FlatList<Message>>(null);
  const following = useRef(true);
  const frame = useRef<number | null>(null);
  const scrollToLatest = useCallback(() => {
    if (!following.current) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (following.current) list.current?.scrollToEnd({ animated: false });
    });
  }, []);
  useEffect(() => {
    scrollToLatest();
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [scrollToLatest]);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const e = event.nativeEvent;
    following.current =
      e.contentSize.height - e.layoutMeasurement.height - e.contentOffset.y <=
      w(48);
  };
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, minHeight: insets.top + w(48) },
        ]}
      >
        <Text style={styles.title}>商城购物助手</Text>
      </View>
      <FlatList
        ref={list}
        style={styles.list}
        contentContainerStyle={{
          paddingHorizontal: w(14),
          paddingBottom: w(18),
        }}
        data={messages}
        extraData={messages[messages.length - 1]?.id}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        onScroll={onScroll}
        onScrollBeginDrag={() => {
          following.current = false;
          if (frame.current !== null) cancelAnimationFrame(frame.current);
        }}
        onScrollEndDrag={onScroll}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
        onContentSizeChange={scrollToLatest}
        onLayout={scrollToLatest}
        renderItem={({ item }) => (
          <View
            style={[
              { marginTop: w(6), marginBottom: w(10) },
              item.role === 'user' ? styles.userRow : styles.assistantRow,
            ]}
          >
            <View
              style={[
                { borderRadius: w(14), padding: w(13) },
                item.role === 'user'
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}
            >
              <View style={{ gap: w(12) }}>
                {item.scan && (
                  <View style={styles.card}>
                    <Image
                      source={require('./ai_luxin.png')}
                      style={styles.cardImage}
                      resizeMode="stretch"
                    />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>全型号净水滤芯</Text>
                      <Text style={styles.cardSubtitle}>扫码精准出</Text>
                    </View>
                    <Text style={styles.button}>立即前往</Text>
                  </View>
                )}
                {item.role === 'assistant' ? (
                  <StreamdownText
                    markdown={item.text}
                    markdownStyle={{
                      paragraph: {
                        fontSize: 14,
                        lineHeight: 25,
                        color: '#243247',
                      },
                    }}
                    selectionMenuConfig={{ copyAsMarkdown: { enabled: false } }}
                  />
                ) : (
                  <Text
                    selectable
                    style={[
                      styles.messageText,
                      { fontSize: w(15), lineHeight: w(23) },
                    ]}
                  >
                    {item.text}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      />
      <View
        style={[
          styles.composer,
          {
            paddingHorizontal: w(14),
            paddingBottom: Math.max(insets.bottom, w(12)),
          },
        ]}
      >
        <TextInput
          placeholder="选家电、问服务，都可以找我…"
          multiline
          style={styles.input}
        />
        <Text style={styles.disclaimer}>内容由AI生成</Text>
      </View>
    </KeyboardAvoidingView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Chat />
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#E7F1FE' },
  header: { paddingHorizontal: 16, justifyContent: 'center' },
  title: { color: '#243247', fontSize: 18, fontWeight: '600' },
  list: { flex: 1 },
  userRow: { alignSelf: 'flex-end', alignItems: 'flex-end', maxWidth: '88%' },
  assistantRow: { alignSelf: 'stretch', alignItems: 'stretch' },
  userBubble: { backgroundColor: '#DBEAFF' },
  assistantBubble: { backgroundColor: '#FFFFFF' },
  messageText: { color: '#243247' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 82,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F4F8FD',
  },
  cardImage: { width: 54, height: 54 },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardTitle: {
    color: '#111111',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  cardSubtitle: {
    color: '#999999',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  button: {
    overflow: 'hidden',
    backgroundColor: '#027EFF',
    color: '#FFFFFF',
    fontSize: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  composer: { paddingTop: 10 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    minHeight: 54,
    paddingHorizontal: 17,
    fontSize: 14,
    color: '#243247',
  },
  disclaimer: {
    textAlign: 'center',
    color: '#C4CBD4',
    fontSize: 10,
    marginTop: 8,
  },
});
