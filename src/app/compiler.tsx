import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { compileBrainDump } from '../services/aiService';
import { useTaskStore } from '../store/useTaskStore';

interface ExtractedTask {
  id: number;
  text: string;
  selected: boolean;
}

export default function CompilerScreen() {
  const [dumpText, setDumpText] = useState('');
  const [extracted, setExtracted] = useState<ExtractedTask[]>([]);
  const [loading, setLoading] = useState(false);

  const addMultipleRootTasks = useTaskStore((state) => state.addMultipleRootTasks);
  const router = useRouter();

  const handleCompile = async () => {
    if (!dumpText.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const items = await compileBrainDump(dumpText);
      setExtracted(items.map((text, idx) => ({ id: idx, text, selected: true })));
    } catch {
      Alert.alert('خطأ', 'تعذّر تفريغ الأفكار، حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setExtracted((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSendToTasks = () => {
    const selectedTexts = extracted.filter((e) => e.selected).map((e) => e.text);
    if (selectedTexts.length === 0) return;

    addMultipleRootTasks(selectedTexts);
    setDumpText('');
    setExtracted([]);
    router.navigate('/');
  };

  const selectedCount = extracted.filter((e) => e.selected).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.subtitle}>
        مخك مزحوم؟ فضفض بكل اللي شاغل بالك بدون ترتيب، وهَوّن يستخرجها لك كمهام مرتبة ويرسلها لقائمتك:
      </Text>

      <TextInput
        style={styles.input}
        placeholder="مثلاً: عندي كويز بكرة وغرفتي حوسة ولازم أرسل إيميل للدكتور وأصلح مكيف السيارة..."
        placeholderTextColor="#9CA3AF"
        value={dumpText}
        onChangeText={setDumpText}
        multiline
        textAlign="right"
      />

      <Pressable
        style={[styles.primaryBtn, (!dumpText.trim() || loading) && styles.btnDisabled]}
        onPress={handleCompile}
        disabled={!dumpText.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryBtnText}>رتّب أفكاري إلى مهام</Text>
        )}
      </Pressable>

      {extracted.length > 0 && (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>المهام المستخرجة ({selectedCount}):</Text>

          {extracted.map((item) => (
            <Pressable key={item.id} style={styles.itemRow} onPress={() => toggleSelect(item.id)}>
              <Ionicons
                name={item.selected ? 'checkbox' : 'square-outline'}
                size={22}
                color={item.selected ? '#0F766E' : '#9CA3AF'}
              />
              <Text style={styles.itemText}>{item.text}</Text>
            </Pressable>
          ))}

          <Pressable
            style={[styles.sendBtn, selectedCount === 0 && styles.btnDisabled]}
            onPress={handleSendToTasks}
            disabled={selectedCount === 0}
          >
            <Ionicons name="arrow-back-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.sendBtnText}>أرسلها إلى مقسّم المهام ({selectedCount})</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 18, gap: 14, paddingBottom: 40 },
  subtitle: { fontSize: 15, color: '#4B5563', textAlign: 'right', lineHeight: 22 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    minHeight: 130,
    fontSize: 15,
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
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 4,
  },
  itemText: { flex: 1, fontSize: 15, color: '#111827', textAlign: 'right', lineHeight: 22 },
  sendBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 6,
  },
  sendBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});