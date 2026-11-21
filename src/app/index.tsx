import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SpicinessPicker } from '../components/SpicinessPicker';
import { TaskTreeItem } from '../components/TaskTreeItem';
import { useTaskStore } from '../store/useTaskStore';

export default function MagicTodoScreen() {
  const [newTaskText, setNewTaskText] = useState('');
  const { tasks, defaultSpiciness, setDefaultSpiciness, addRootTask, clearCompleted } =
    useTaskStore();

  const handleAdd = () => {
    if (!newTaskText.trim()) return;
    addRootTask(newTaskText);
    setNewTaskText('');
    Keyboard.dismiss();
  };

  const hasCompleted = tasks.some((t) => t.completed);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <SpicinessPicker
        value={defaultSpiciness}
        onChange={setDefaultSpiciness}
        label="مستوى تفصيل العصا السحرية ✨"
      />

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="أضف مهمة ثقيلة... (مثلاً: أذاكر الفصل الرابع)"
          placeholderTextColor="#9CA3AF"
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          textAlign="right"
        />
        <Pressable
          style={[styles.addBtn, !newTaskText.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!newTaskText.trim()}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </Pressable>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="sparkles-outline" size={40} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>قائمتك فاضية الحين</Text>
          <Text style={styles.emptySubtitle}>
            أضف أي مهمة فوق، واضغط زر &quot;قسّمها&quot; عشان نفككها لخطوات صغيرة — وتقدر تقسّم كل خطوة فرعية أكثر!
          </Text>
        </View>
      ) : (
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>مهامك ({tasks.length})</Text>
            {hasCompleted && (
              <Pressable onPress={clearCompleted}>
                <Text style={styles.clearBtnText}>مسح المنجزة</Text>
              </Pressable>
            )}
          </View>

          {tasks.map((task) => (
            <TaskTreeItem key={task.id} node={task} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 18, gap: 14, paddingBottom: 40 },
  addRow: { flexDirection: 'row-reverse', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addBtn: {
    width: 50,
    borderRadius: 14,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.45 },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  listSection: { gap: 10, marginTop: 4 },
  listHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#374151' },
  clearBtnText: { fontSize: 13, fontWeight: '600', color: '#EF4444' },
});