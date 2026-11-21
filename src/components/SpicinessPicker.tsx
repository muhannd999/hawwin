import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SpicinessLevel } from '../types/hawwin';

interface SpicinessPickerProps {
  value: SpicinessLevel;
  onChange: (level: SpicinessLevel) => void;
  label?: string;
}

const LEVELS: SpicinessLevel[] = [1, 2, 3, 4, 5];

const LEVEL_HINTS: Record<SpicinessLevel, string> = {
  1: 'خفيف جداً',
  2: 'بسيط',
  3: 'متوازن',
  4: 'مفصّل',
  5: 'تفصيل مجهري',
};

export function SpicinessPicker({
  value,
  onChange,
  label = 'مستوى التفصيل',
}: SpicinessPickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{LEVEL_HINTS[value]} ({value}/5)</Text>
      </View>
      <View style={styles.iconsRow}>
        {LEVELS.map((level) => {
          const active = level <= value;
          return (
            <Pressable
              key={level}
              onPress={() => onChange(level)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Ionicons
                name={active ? 'flame' : 'flame-outline'}
                size={18}
                color={active ? '#FFFFFF' : '#9CA3AF'}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  topRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },
  hint: { fontSize: 12, fontWeight: '600', color: '#0F766E' },
  iconsRow: { flexDirection: 'row-reverse', gap: 8 },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  pillActive: { backgroundColor: '#0F766E' },
});