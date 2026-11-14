import { useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  AudioLines,
  Check,
  Eye,
  Hourglass,
  Lock,
  RotateCcw,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";
import type {
  Episode,
  VisualDirection,
  VisualEvent,
  VisualProgress,
  VisualSequence,
} from "../../../shared/types";
import { formatTime } from "../../../shared/time";
import {
  allEventsPresented,
  canAnswerVisual,
  observedIds,
  presentedEvents,
  sequenceForEpisode,
} from "../model/observation";
import { useReducedMotion } from "../lib/useReducedMotion";

const DIRECTION_META: Record<
  VisualDirection,
  { label: string; Icon: typeof ArrowUp }
> = {
  north: { label: "北", Icon: ArrowUp },
  east: { label: "东", Icon: ArrowRight },
  south: { label: "南", Icon: ArrowDown },
  west: { label: "西", Icon: ArrowLeft },
};

const SEQUENCE_ICON = {
  bell: AudioLines,
  horn: Waves,
  static: Zap,
} as const;

function EventCard({
  event,
  index,
  active,
  reducedMotion,
}: {
  event: VisualEvent;
  index: number;
  active: boolean;
  reducedMotion: boolean;
}) {
  const { Icon, label } = DIRECTION_META[event.direction];
  return (
    <article
      className={`visual-event is-seen cadence-${event.cadence} ${
        active ? "is-live" : ""
      }`}
      data-event-id={event.id}
    >
      <div
        className={`event-blip ${reducedMotion ? "no-motion" : ""}`}
        aria-hidden="true"
      >
        <Sparkles size={15} />
        <span className="blip-index">{index + 1}</span>
      </div>
      <div className="event-content">
        <header>
          <span className="event-time">{formatTime(event.offset)}</span>
          <span className={`event-cadence cadence-${event.cadence}`}>
            {event.cadence === "long" ? "持续较长" : "短促一闪"}
          </span>
        </header>
        <h4>{event.label}</h4>
        <p>{event.detail}</p>
        <div className="event-direction" aria-label={`来源方位：${label}`}>
          <Icon size={13} />
          <span>来自{label}侧</span>
        </div>
      </div>
    </article>
  );
}

export function VisualPanel({
  episode,
  position,
  progress,
  collectedClues,
  onAnswer,
  onSeek,
}: {
  episode: Episode;
  position: number;
  progress: VisualProgress;
  collectedClues: string[];
  onAnswer: (optionId: string) => void;
  onSeek: (time: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const sequence = sequenceForEpisode(episode.id);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    liveRef.current
      ?.querySelector('[data-live="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [sequence?.episodeId, position]);

  if (!sequence) {
    return (
      <section className="visual-panel">
        <PanelHeading />
        <div className="visual-empty">
          <Eye size={26} />
          <p>这段录音没有可目视化的背景声</p>
          <small>钟声、雾笛与电流出现时，可在此改用视觉方式比对。</small>
        </div>
      </section>
    );
  }

  const seen = presentedEvents(sequence, progress);
  const seenIds = new Set(observedIds(progress, sequence.episodeId));
  const complete = allEventsPresented(sequence, progress);
  const collected = collectedClues.includes(sequence.clueId);
  const answerable = canAnswerVisual(sequence, progress, collectedClues);
  const activeEvent = [...seen]
    .reverse()
    .find((event) => position + 0.05 >= event.offset);
  const SequenceIcon =
    SEQUENCE_ICON[sequence.clueId as keyof typeof SEQUENCE_ICON] || Eye;
  const pending = sequence.events.length - seen.length;

  return (
    <section className="visual-panel">
      <PanelHeading />
      <div className="visual-intro">
        <SequenceIcon size={15} />
        <div>
          <h3>{sequence.title}</h3>
          <p>{sequence.intro}</p>
        </div>
      </div>

      <div className="visual-stage" aria-hidden="true">
        {sequence.events.map((event) => {
          const observed = seenIds.has(event.id);
          const { Icon } = DIRECTION_META[event.direction];
          return (
            <span
              key={event.id}
              className={`stage-dot ${observed ? "lit" : ""} ${
                reducedMotion ? "no-motion" : ""
              } cadence-${event.cadence}`}
              style={{
                left: `${(event.offset / episode.duration) * 100}%`,
              }}
            >
              {observed ? <Icon size={12} /> : <Lock size={10} />}
            </span>
          );
        })}
        <span
          className="stage-playhead"
          style={{ left: `${(position / episode.duration) * 100}%` }}
        />
      </div>

      <div className="visual-event-list" ref={liveRef}>
        <div aria-live="polite" className="visual-live-region">
          {seen.map((event, index) => (
            <div key={event.id} data-live={activeEvent?.id === event.id}>
              <EventCard
                event={event}
                index={index}
                active={activeEvent?.id === event.id}
                reducedMotion={reducedMotion}
              />
            </div>
          ))}
        </div>
        {!complete && (
          <div className="visual-pending">
            <Hourglass size={14} />
            <p>还有 {pending} 个事件尚未呈现，继续播放让它们随时间出现。</p>
            <button
              onClick={() =>
                onSeek(
                  Math.max(
                    0,
                    (sequence.events[seen.length]?.offset ?? 0) - 0.4,
                  ),
                )
              }
            >
              <RotateCcw size={12} /> 回到下一个事件之前
            </button>
          </div>
        )}
      </div>

      <fieldset
        className={`visual-question ${answerable ? "" : "locked"}`}
        disabled={!answerable}
      >
        <legend>
          {collected ? (
            <>
              <Check size={13} /> 这条线索已归档，可继续沿原方向推进故事
            </>
          ) : complete ? (
            sequence.question.prompt
          ) : (
            <>
              <Lock size={12} /> 全部事件呈现后才能作答，现在还无法比较
            </>
          )}
        </legend>
        {!collected && (
          <div className="visual-options">
            {sequence.question.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="visual-option"
                onClick={() => onAnswer(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </fieldset>
      <footer className="visual-foot">
        视觉比对与直接收听共用正式线索 · 重复取得不会重复计数
      </footer>
    </section>
  );
}

function PanelHeading() {
  return (
    <div className="visual-heading">
      <span>
        <Eye size={15} /> 视觉调查
      </span>
      <small>不靠听觉，也能完成比对</small>
    </div>
  );
}
