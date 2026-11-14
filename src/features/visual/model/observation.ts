import type {
  Episode,
  VisualProgress,
  VisualSequence,
} from "../../../shared/types";
import { VISUAL_SEQUENCES } from "./sequences";

export function sequenceForEpisode(
  episodeId: string,
): VisualSequence | undefined {
  return VISUAL_SEQUENCES.find((item) => item.episodeId === episodeId);
}

export function observedIds(
  progress: VisualProgress,
  episodeId: string,
): string[] {
  return progress[episodeId] ?? [];
}

export function isEventObserved(
  progress: VisualProgress,
  episodeId: string,
  eventId: string,
): boolean {
  return observedIds(progress, episodeId).includes(eventId);
}

/**
 * 只有播放真正越过事件时刻才会被记录。
 * 跳转（含直接拖动进度条）一次跨过多个事件时，不会把未呈现的事件点亮。
 */
export function advanceObservation(
  progress: VisualProgress,
  episodeId: string,
  previous: number,
  next: number,
  seeked: boolean,
  sequences: VisualSequence[] = VISUAL_SEQUENCES,
): VisualProgress {
  const sequence = sequences.find((item) => item.episodeId === episodeId);
  if (!sequence || next < previous) return progress;
  const seen = new Set(observedIds(progress, episodeId));
  const before = seen.size;
  for (const event of sequence.events) {
    if (seen.has(event.id)) continue;
    if (event.offset > previous && event.offset <= next && !seeked)
      seen.add(event.id);
  }
  if (seen.size === before) return progress;
  return { ...progress, [episodeId]: [...seen] };
}

export function presentedEvents(
  sequence: VisualSequence,
  progress: VisualProgress,
) {
  const seen = new Set(observedIds(progress, sequence.episodeId));
  return sequence.events.filter((event) => seen.has(event.id));
}

export function allEventsPresented(
  sequence: VisualSequence,
  progress: VisualProgress,
): boolean {
  const seen = observedIds(progress, sequence.episodeId);
  return sequence.events.every((event) => seen.includes(event.id));
}

export function canAnswerVisual(
  sequence: VisualSequence,
  progress: VisualProgress,
  collectedClues: string[],
): boolean {
  return (
    !collectedClues.includes(sequence.clueId) &&
    allEventsPresented(sequence, progress)
  );
}

export function isVisualAnswerCorrect(
  sequence: VisualSequence,
  optionId: string,
): boolean {
  return sequence.question.answer === optionId;
}

export function sequenceForCue(
  episode: Episode,
  clueId: string,
): VisualSequence | undefined {
  return VISUAL_SEQUENCES.find(
    (item) => item.episodeId === episode.id && item.clueId === clueId,
  );
}
