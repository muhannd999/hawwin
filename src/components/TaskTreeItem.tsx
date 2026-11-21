import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { breakdownTask, estimateTaskTime } from '../services/aiService';
import { useTaskStore } from '../store/useTaskStore';
import { TaskNode } from '../types/hawwin';

interface TaskTreeItemProps {
  node: TaskNode;
  depth?: number;
}

export function TaskTreeItem({ node, depth = 0 }: TaskTreeItemProps) {
  const {
    defaultSpiciness,
    toggleTask,
    toggleExpand,
    deleteTask,
    setNodeLoading,
    attachSubtasks,
    setNodeEstimate,
  } = useTaskStore();

  const handleMagicBreakdown = async () => {
    if (node.isBreakingDown) return;
    setNodeLoading(node.id, 'isBreakingDown', true);
    try {
      const subtasks = await breakdownTask(node.text, defaultSpiciness);
      attachSubtasks(node.id, subtasks);
    } catch {
      setNodeLoading(node.id, 'isBreakingDown', false);
      Alert.alert('خطأ', 'تعذّر تقسيم المهمة، حاول مرة أخرى.');
    }
  };

  const handleEstimateTime = async () => {
    if (node.isEstimating) return;
    setNodeLoading(node.id, 'isEstimating', true);
    try {
      const minutes = await estimateTaskTime(node.text);
      setNodeEstimate(node.id, minutes);
    } catch {
      setNodeLoading(node.id, 'isEstimating', false);
      Alert.alert('خطأ', 'تعذّر تقدير الوقت، حاول مرة أخرى.');
    }
  };

  const hasChildren = node.children.length > 0;
  const completedChildren = node.children.filter((c) => c.completed).length;

  return (
    <View style={[styles.wrapper, depth > 0 && styles.nestedWrapper]}>
      <View style={[styles.card, depth > 0 && styles.nestedCard]}>
        <View style={styles.mainRow}>
          <Pressable onPress={() => toggleTask(node.id)} hitSlop={8}>
            <Ionicons
              name={node.completed ? 'checkbox' : 'square-outline'}
              size={24}
              color={node.completed ? '#0F766E' : '#9CA3AF'}
            />
          </Pressable>

          <Pressable
            style={styles.textContainer}
            onPress={() => (hasChildren ? toggleExpand(node.id) : toggleTask(node.id))}
          >
            <Text style={[styles.taskText, node.completed && styles.taskTextDone]}>
              {node.text}
            </Text>

            <View style={styles.metaRow}>
              {node.estimatedMinutes !== undefined && (
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={12} color="#0F766E" />
                  <Text style={styles.timeBadgeText}>{node.estimatedMinutes} د</Text>
                </View>
              )}

              {hasChildren && (
                <View style={styles.subCountBadge}>
                  <Ionicons
                    name={node.isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={13}
                    color="#4B5563"
                  />
                  <Text style={styles.subCountText}>
                    {completedChildren}/{node.children.length} خطوات
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>

        <View style={styles.actionsBar}>
          <Pressable
            style={[styles.actionChip, styles.magicChip]}
            onPress={handleMagicBreakdown}
            disabled={node.isBreakingDown}
          >
            {node.isBreakingDown ? (
              <ActivityIndicator size="small" color="#0F766E" />
            ) : (
              <>
                <Ionicons name="sparkles" size={14} color="#0F766E" />
                <Text style={styles.magicChipText}>قسّمها</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.actionChip}
            onPress={handleEstimateTime}
            disabled={node.isEstimating}
          >
            {node.isEstimating ? (
              <ActivityIndicator size="small" color="#4B5563" />
            ) : (
              <>
                <Ionicons name="timer-outline" size={14} color="#4B5563" />
                <Text style={styles.actionChipText}>الوقت</Text>
              </>
            )}
          </Pressable>

          <Pressable style={styles.deleteBtn} onPress={() => deleteTask(node.id)} hitSlop={6}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {hasChildren && node.isExpanded && (
        <View style={styles.childrenList}>
          {node.children.map((child) => (
            <TaskTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  nestedWrapper: {
    marginRight: 14,
    paddingRight: 10,
    borderRightWidth: 2,
    borderRightColor: '#CCFBF1',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  nestedCard: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E5E7EB',
    padding: 11,
  },
  mainRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
  },
  textContainer: { flex: 1, gap: 6 },
  taskText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    lineHeight: 22,
  },
  taskTextDone: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  metaRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeBadgeText: { fontSize: 12, fontWeight: '600', color: '#0F766E' },
  subCountBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subCountText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  actionsBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  actionChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#F3F4F6',
  },
  magicChip: { backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#CCFBF1' },
  magicChipText: { fontSize: 12, fontWeight: '700', color: '#0F766E' },
  actionChipText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  deleteBtn: { marginRight: 'auto', padding: 6 },
  childrenList: { gap: 8 },
});