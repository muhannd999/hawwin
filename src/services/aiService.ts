import { JudgeResult, SpicinessLevel, ToneResult, ToneStyleKey } from '../types/hawwin';

// سنحوّل هذا إلى true في الخطوة القادمة بعد رفع Supabase Edge Function
const USE_LIVE_AI = false;
const SUPABASE_FUNCTION_URL = '';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callEdgeFunction<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(SUPABASE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    throw new Error('تعذر الاتصال بالخادم، حاول مرة أخرى');
  }

  return response.json() as Promise<T>;
}

export async function breakdownTask(
  taskText: string,
  spiciness: SpicinessLevel
): Promise<{ text: string; minutes?: number }[]> {
  if (USE_LIVE_AI && SUPABASE_FUNCTION_URL) {
    const data = await callEdgeFunction<{ steps: { text: string; minutes?: number }[] }>(
      'breakdown',
      { taskText, spiciness }
    );
    return data.steps;
  }

  await delay(550);

  const allSteps = [
    { text: 'حط جوالك صامت وابعد المشتتات عن المكتب', minutes: 2 },
    { text: `جهّز الأدوات والملفات المطلوبة لـ "${taskText}"`, minutes: 5 },
    { text: 'حدّد أصغر جزء ممكن تبدأ فيه الآن بدون تفكير زايد', minutes: 5 },
    { text: 'شغّل مؤقت 10 دقائق وابدأ بالجزء الأول فقط', minutes: 10 },
    { text: 'خذ استراحة سريعة دقيقة ثم كمّل الجزء التالي', minutes: 10 },
    { text: 'راجع اللي خلصته بسرعة واحفظ شغلك', minutes: 4 },
  ];

  // عدد الخطوات يزيد مع مستوى التفصيل (1 إلى 5)
  const countMap: Record<SpicinessLevel, number> = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
  return allSteps.slice(0, countMap[spiciness]);
}

export async function estimateTaskTime(taskText: string): Promise<number> {
  if (USE_LIVE_AI && SUPABASE_FUNCTION_URL) {
    const data = await callEdgeFunction<{ minutes: number }>('estimate', { taskText });
    return data.minutes;
  }

  await delay(400);
  const words = taskText.trim().split(/\s+/).length;
  return Math.min(60, Math.max(5, words * 5));
}

export async function compileBrainDump(dumpText: string): Promise<string[]> {
  if (USE_LIVE_AI && SUPABASE_FUNCTION_URL) {
    const data = await callEdgeFunction<{ tasks: string[] }>('compile', { dumpText });
    return data.tasks;
  }

  await delay(600);

  // تقسيم ذكي مؤقت للنص العربي بناءً على الفواصل والأسطر وحرف العطف
  const extracted = dumpText
    .split(/[\n،,.]+|\s+و(?=\S{3,})/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 3);

  return extracted.length > 0 ? extracted : [dumpText.trim()];
}

export async function rewriteTone(
  text: string,
  style: ToneStyleKey,
  spiciness: SpicinessLevel
): Promise<ToneResult> {
  if (USE_LIVE_AI && SUPABASE_FUNCTION_URL) {
    return callEdgeFunction<ToneResult>('tone', { text, style, spiciness });
  }

  await delay(500);
  return {
    subjectLine: style === 'professor' ? 'استفسار بخصوص المقرر' : '',
    rewrittenText: `[نسخة تجريبية - حدة ${spiciness}/5]\nالسلام عليكم، بخصوص "${text.trim()}"، آمل إفادتي بالوقت المناسب للتنسيق. شاكر ومقدّر لكم.`,
  };
}

export async function judgeMessage(text: string): Promise<JudgeResult> {
  if (USE_LIVE_AI && SUPABASE_FUNCTION_URL) {
    return callEdgeFunction<JudgeResult>('judge', { text });
  }

  await delay(500);
  return {
    overallTone: 'مختصر وعادي',
    isAngryScore: 20,
    subtext: 'المرسل يرد بسرعة بدون نية سلبية',
    explanation: 'الرسالة قصيرة لكنها طبيعية جداً في الواتساب ولا تدل على زعل.',
    suggestedReply: 'أبشر، يعطيك العافية.',
  };
}