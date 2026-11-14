import { useCallback, useState } from "react";
import type { VisualProgress } from "../../../shared/types";
import { advanceObservation } from "../model/observation";

export function useVisualInvestigation() {
  const [progress, setProgress] = useState<VisualProgress>({});

  const onTick = useCallback(
    (episodeId: string, previous: number, next: number, seeked: boolean) => {
      setProgress((current) =>
        advanceObservation(current, episodeId, previous, next, seeked),
      );
    },
    [],
  );

  const replace = useCallback((next: VisualProgress) => {
    setProgress(next);
  }, []);

  const reset = useCallback(() => setProgress({}), []);

  return { progress, onTick, replace, reset };
}
