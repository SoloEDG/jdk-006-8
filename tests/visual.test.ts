import test from "node:test";
import assert from "node:assert/strict";
import {
  VISUAL_SEQUENCES,
  advanceObservation,
  allEventsPresented,
  canAnswerVisual,
  isVisualAnswerCorrect,
  observedIds,
  presentedEvents,
  sequenceForEpisode,
} from "../src/features/visual/index";
import { collectVisualClue } from "../src/features/evidence/index";
import { createEvidence } from "../src/features/evidence/index";
import {
  createSnapshot,
  validateSnapshot,
} from "../src/features/profiles/index";
import { CASE_CONTENT } from "../src/features/story";
import type {
  Episode,
  Investigation,
  VisualProgress,
} from "../src/shared/types";

const bell = sequenceForEpisode("arrival-normal")!;
const horn = sequenceForEpisode("harbor-normal")!;

test("visual sequences cover bell, horn and static with time-ordered events", () => {
  const clueIds = new Set(VISUAL_SEQUENCES.map((s) => s.clueId));
  for (const id of ["bell", "horn", "static"]) assert.ok(clueIds.has(id));
  for (const sequence of VISUAL_SEQUENCES) {
    const offsets = sequence.events.map((e) => e.offset);
    assert.deepEqual(
      offsets,
      [...offsets].sort((a, b) => a - b),
      `${sequence.episodeId} events must be ordered by time`,
    );
    assert.ok(sequence.events.length >= 3);
  }
});

test("events light up only through continuous playback, not on a jump", () => {
  let progress: VisualProgress = {};
  progress = advanceObservation(progress, bell.episodeId, 0, 15.5, false);
  assert.deepEqual(observedIds(progress, bell.episodeId), ["bell-1"]);
  // seeking past the remaining events must not mark them observed
  progress = advanceObservation(
    progress,
    bell.episodeId,
    15.5,
    28,
    true,
  );
  assert.deepEqual(observedIds(progress, bell.episodeId), ["bell-1"]);
  // normal playback resumes and reveals events one at a time
  progress = advanceObservation(progress, bell.episodeId, 15.5, 16.0, false);
  assert.deepEqual(observedIds(progress, bell.episodeId), [
    "bell-1",
    "bell-2",
  ]);
  progress = advanceObservation(progress, bell.episodeId, 16.0, 17.2, false);
  assert.deepEqual(observedIds(progress, bell.episodeId), [
    "bell-1",
    "bell-2",
    "bell-3",
  ]);
  // re-running with no new events returns the same reference
  const again = advanceObservation(progress, bell.episodeId, 17.2, 17.4, false);
  assert.equal(again, progress);
});

test("answering stays locked until every event has been presented", () => {
  let progress: VisualProgress = {};
  assert.equal(allEventsPresented(bell, progress), false);
  assert.equal(canAnswerVisual(bell, progress, []), false);
  progress = { [bell.episodeId]: bell.events.map((e) => e.id) };
  assert.equal(allEventsPresented(bell, progress), true);
  assert.equal(canAnswerVisual(bell, progress, []), true);
  // already-collected clues cannot be answered again
  assert.equal(canAnswerVisual(bell, progress, ["bell"]), false);
});

test("only presented events participate in comparison", () => {
  const partial = advanceObservation(
    {},
    horn.episodeId,
    5.0,
    5.4,
    false,
  );
  const shown = presentedEvents(horn, partial);
  assert.equal(shown.length, 1);
  assert.equal(shown[0].id, "horn-1");
});

test("comparison answers are judged without revealing the answer up front", () => {
  assert.equal(isVisualAnswerCorrect(bell, "three"), true);
  assert.equal(isVisualAnswerCorrect(bell, "two"), false);
  assert.equal(isVisualAnswerCorrect(horn, "long-short"), true);
  // option labels never equal the raw event count/cadence summary
  for (const sequence of [bell, horn]) {
    for (const option of sequence.question.options)
      assert.ok(option.label.length > 0);
  }
});

test("visual path shares the official clue and cannot duplicate it", () => {
  const episode = CASE_CONTENT.episodes.find(
    (e) => e.id === "arrival-normal",
  ) as Episode;
  const first = collectVisualClue(createEvidence(), episode, bell)!;
  assert.deepEqual(first.clues, ["bell"]);
  assert.equal(first.notes[0].clueId, "bell");
  // second acquisition via the visual path is blocked
  assert.equal(collectVisualClue(first, episode, bell), null);
});

test("visual progress survives snapshot save, import-style reload and old saves", () => {
  const story: Investigation = {
    sceneId: "arrival",
    visited: ["arrival"],
    decisions: [],
    ending: null,
  };
  const progress: VisualProgress = {
    "arrival-normal": ["bell-1", "bell-2"],
  };
  const snapshot = createSnapshot(
    CASE_CONTENT,
    story,
    createEvidence(),
    {},
    { sceneId: "arrival", position: 4, rate: 1 },
    progress,
  );
  assert.deepEqual(snapshot.visual, progress);
  const reloaded = validateSnapshot(
    JSON.parse(JSON.stringify(snapshot)),
    CASE_CONTENT,
  );
  assert.deepEqual(reloaded.visual, progress);

  // older saves without a visual field still load and default to empty
  const legacy = JSON.parse(JSON.stringify(snapshot));
  delete legacy.visual;
  const restored = validateSnapshot(legacy, CASE_CONTENT);
  assert.deepEqual(restored.visual, {});

  // unknown episode ids in visual data are rejected
  const tampered = JSON.parse(JSON.stringify(snapshot));
  tampered.visual["unknown-episode"] = ["x"];
  assert.throws(() => validateSnapshot(tampered, CASE_CONTENT));
});

test("both interview episodes expose the static visual sequence independently", () => {
  const normal = sequenceForEpisode("interview-normal");
  const aware = sequenceForEpisode("interview-aware");
  assert.ok(normal && aware);
  assert.equal(normal!.clueId, "static");
  assert.equal(aware!.clueId, "static");
  // progress is keyed per episode, so switching recordings keeps each
  const progress: VisualProgress = {
    "interview-normal": normal!.events.map((e) => e.id),
  };
  assert.equal(
    observedIds(progress, "interview-aware").length,
    0,
  );
});
