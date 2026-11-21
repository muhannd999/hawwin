import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface JudgeResult {
  overallTone: string;
  isAngryScore: number;
  explanation: string;
  suggestedReply: string;
}

export default function JudgeScreen() {
  const [messageInput, setMessageInput] = useState('');
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = () => {
    if (!messageInput.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setCopied(false);

    // رد تجريبي مؤقت لين نربط Gemini API عبر Supabase
    setTimeout(() => {
      setResult({
        overallTone: 'مختصر وعادي جداً',
        isAngryScore: 20,
        explanation:
          'الأسلوب يبان ناشف شوي لكن غالباً المرسل مشغول أو يكتب بسرعة بدون أي زعل أو سوء نية.',
        suggestedReply: 'أبشر، يعطيك العافية وبنتواصل قريب.',
      });
      setLoading(false);
    }, 500);
  };

  const handleCopyReply = async () => {
    if (!result) return;
    await Clipboard.setStringAsync(result.suggestedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score < 35) return '#0F766E';
    if (score < 70) return '#D97706';
    return '#DC2626';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.subtitle}>
        وصلتك رسالة ناشفة وتفكر "هل هو زعلان؟" — الصقها هنا وهَوّن يحللها لك بهدوء:
      </Text>

      <TextInput
        style={styles.input}
        placeholder='مثلاً: "طيب." أو "خلاص يصير خير بعدين نشوف"...'
        placeholderTextColor="#9CA3AF"
        value={messageInput}
        onChangeText={setMessageInput}
        multiline
        textAlign="right"
      />

      <Pressable
        style={[styles.primaryBtn, (!messageInput.trim() || loading) && styles.primaryBtnDisabled]}
        onPress={handleAnalyze}
        disabled={!messageInput.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryBtnText}>حلّل النبرة</Text>
        )}
      </Pressable>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.headerRow}>
            <Text style={styles.cardLabel}>النبرة العامة:</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{result.overallTone}</Text>
            </View>
          </View>

          <View style={styles.meterSection}>
            <View style={styles.headerRow}>
              <Text style={styles.cardLabel}>احتمالية الزعل / التوتر:</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(result.isAngryScore) }]}>
                {result.isAngryScore}%
              </Text>
            </View>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${result.isAngryScore}%`,
                    backgroundColor: getScoreColor(result.isAngryScore),
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.cardLabel}>التحليل:</Text>
            <Text style={styles.bodyText}>{result.explanation}</Text>
          </View>

          <View style={styles.replyBox}>
            <Text style={styles.replyLabel}>رد مقترح جاهز:</Text>
            <Text style={styles.bodyText}>{result.suggestedReply}</Text>
            <Pressable style={styles.copyBtn} onPress={handleCopyReply}>
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={18}
                color="#0F766E"
              />
              <Text style={styles.copyBtnText}>{copied ? 'تم النسخ!' : 'نسخ الرد'}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20, gap: 14 },
  subtitle: { fontSize: 15, color: '#4B5563', textAlign: 'right', lineHeight: 22 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
  },
  primaryBtn: {
    backgroundColor: '#0F766E',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 6,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: { fontSize: 14, fontWeight: '700', color: '#374151', textAlign: 'right' },
  badge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: { fontSize: 13, fontWeight: '700', color: '#0F766E' },
  meterSection: { gap: 8 },
  scoreValue: { fontSize: 15, fontWeight: '700' },
  barBg: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row-reverse',
  },
  barFill: { height: '100%', borderRadius: 6 },
  sectionBox: { gap: 4 },
  bodyText: { fontSize: 15, color: '#111827', textAlign: 'right', lineHeight: 22 },
  replyBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  replyLabel: { fontSize: 13, fontWeight: '700', color: '#0F766E', textAlign: 'right' },
  copyBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  copyBtnText: { fontSize: 14, fontWeight: '700', color: '#0F766E' },
});