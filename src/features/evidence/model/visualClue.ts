import type {
  Episode,
  EvidenceState,
  VisualSequence,
} from "../../../shared/types";
import { addNote } from "./notes";

/**
 * 非听觉路径取得的线索与直接收听共用同一份正式线索：
 * 同一个 clueId、同一条去重规则，重复取得不会增加数量。
 */
export function collectVisualClue(
  state: EvidenceState,
  episode: Episode,
  sequence: VisualSequence,
): EvidenceState | null {
  if (state.clues.includes(sequence.clueId)) return null;
  const last = sequence.events[sequence.events.length - 1];
  const first = sequence.events[0];
  const bookmark = {
    sceneId: episode.sceneId,
    start: first.offset,
    end: last.offset,
  };
  const next = addNote(
    state,
    bookmark,
    `视觉比对确认：${sequence.title}（${sequence.question.options.find(
      (option) => option.id === sequence.question.answer,
    )?.label}）。`,
    "视觉线索",
  );
  return {
    ...next,
    clues: [...state.clues, sequence.clueId],
    notes: next.notes.map((note) =>
      note.id === next.selectedId
        ? { ...note, clueId: sequence.clueId }
        : note,
    ),
  };
}
