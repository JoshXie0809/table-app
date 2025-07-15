import { useNowTime } from "../../time-manager/useNowTime";
import { useLexicalStyles } from "../LexicalEditor";

export function TimestampComponent({ initialTimestamp }: { initialTimestamp?: string }) {
  
  const instant = useNowTime();
  const now = instant.toZonedDateTimeISO("Asia/Taipei")
  const styles = useLexicalStyles();

  return (
    <span className={styles.timstamp}>
      {now.toLocaleString()}
    </span>
  );
}
