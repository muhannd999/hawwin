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

type ToneKey = 'professor' | 'manager' | 'polite' | 'brief' | 'apology';

interface ToneOption {
  key: ToneKey;
  label: string;
}

interface ToneResult {
  subjectLine: string;
  rewrittenText: string;
}

const TONE_OPTIONS: ToneOption[] = [
  { key: 'professor', label: 'إيميل لدكتور جامعة' },
  { key: 'manager', label: 'رسالة لمدير / عمل' },
  { key: 'polite', label: 'رد لبق ومهذب' },
  { key: 'brief', label: 'مختصر ومباشر' },
  { key: 'apology', label: 'اعتذار ذرب' },
];

export default function ToneScreen() {
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneKey>('professor');
  const [result, setResult] = useState<ToneResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRewrite = () => {
    if (!inputText.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setCopied(false);

    // رد تجريبي مؤقت لين نربط Gemini API عبر Supabase
    setTimeout(() => {
      const mockResponses: Record<ToneKey, ToneResult> = {
        professor: {
          subjectLine: 'استفسار بخصوص المقرر الدراسي',
          rewrittenText: `السلام عليكم دكتور، أتمنى أن تكون بخير.\nبخصوص "${inputText.trim()}"، آمل من سعادتكم التكرم بالنظر في الموضوع وإفادتي بالإجراء المناسب.\nشاكر ومقدّر لكم تعاونكم.`,
        },
        manager: {
          subjectLine: '',
          rewrittenText: `السلام عليكم، يعطيك العافية.\nحبيت أشاركك بخصوص "${inputText.trim()}"، وأقترح ننسّق عليها في أقرب وقت يناسبك. شكراً لك.`,
        },
        polite: {
          subjectLine: '',
          rewrittenText: `هلا والله، يعطيك العافية وما قصّرت. بخصوص "${inputText.trim()}"، ياليت نرتبها بالطريقة اللي تناسبك، وشاكر لك تفهّمك.`,
        },
        brief: {
          subjectLine: '',
          rewrittenText: `السلام عليكم، بخصوص "${inputText.trim()}"، ياليت تأكد لي التفاصيل عشان نخلصها اليوم.`,
        },
        apology: {
          subjectLine: '',
          rewrittenText: `السلام عليكم، أعتذر منك جداً على ما حصل بخصوص "${inputText.trim()}"، حقك عليّ وإن شاء الله ما يتكرر. أقدّر تفهّمك.`,
        },
      };

      setResult(mockResponses[selectedTone]);
      setLoading(false);
    }, 500);
  };

  const handleCopy = async () => {
    if (!result) return;
    const textToCopy = result.subjectLine
      ? `العنوان: ${result.subjectLine}\n\n${result.rewrittenText}`
      : result.rewrittenText;
    await Clipboard.setStringAsync(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.subtitle}>اكتب كلامك بعفوية بالعامية، وهَوّن يضبّطه لك بالأسلوب المناسب:</Text>

      <TextInput
        style={styles.input}
        placeholder="مثلاً: راحت علي نومة وما حضرت الكويز تكفى دكتور عيد لي..."
        placeholderTextColor="#9CA3AF"
        value={inputText}
        onChangeText={setInputText}
        multiline
        textAlign="right"
      />

      <Text style={styles.label}>اختر الأسلوب المطلوب:</Text>
      <View style={styles.chipsWrap}>
        {TONE_OPTIONS.map((option) => {
          const active = selectedTone === option.key;
          return (
            <Pressable
              key={option.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSelectedTone(option.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.primaryBtn, (!inputText.trim() || loading) && styles.primaryBtnDisabled]}
        onPress={handleRewrite}
        disabled={!inputText.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryBtnText}>عدّل الأسلوب</Text>
        )}
      </Pressable>

      {result && (
        <View style={styles.resultCard}>
          {result.subjectLine ? (
            <View style={styles.subjectBox}>
              <Text style={styles.subjectLabel}>عنوان الإيميل المقترح:</Text>
              <Text style={styles.subjectText}>{result.subjectLine}</Text>
            </View>
          ) : null}

          <Text style={styles.resultText}>{result.rewrittenText}</Text>

          <Pressable style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons
              name={copied ? 'checkmark-circle' : 'copy-outline'}
              size={18}
              color="#0F766E"
            />
            <Text style={styles.copyBtnText}>{copied ? 'تم النسخ!' : 'نسخ النص'}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20, gap: 14 },
  subtitle: { fontSize: 15, color: '#4B5563', textAlign: 'right' },
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
  label: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'right' },
  chipsWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#FFFFFF' },
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
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 6,
  },
  subjectBox: {
    backgroundColor: '#F0FDFA',
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  subjectLabel: { fontSize: 12, fontWeight: '700', color: '#0F766E', textAlign: 'right' },
  subjectText: { fontSize: 14, color: '#111827', textAlign: 'right' },
  resultText: { fontSize: 15, color: '#111827', textAlign: 'right', lineHeight: 24 },
  copyBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  copyBtnText: { fontSize: 14, fontWeight: '700', color: '#0F766E' },
});