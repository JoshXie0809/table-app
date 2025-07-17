import { timeFunction } from "../../time-manager/timeFuntion";
import { useNowTime } from "../../time-manager/useNowTime";
import { useLexicalStyles } from "../LexicalEditor";

export function TimestampComponent({ initialTimestamp }: { initialTimestamp?: string }) {
  const styles = useLexicalStyles();
  const instant = useNowTime();

  // const jsDate = new Date(instant.epochMilliseconds); // ✅ JS Date 物件
  // const formatter = new Intl.DateTimeFormat("en-US", {
  //   weekday: "long",
  //   year: "numeric",
  //   month: "long",
  //   day: "2-digit",
  //   hour: "numeric",
  //   minute: "2-digit",
  //   second: "2-digit",
  //   timeZone: "Asia/Taipei"
  // });

  return (
    <span className={styles.timstamp}>
      {timeFunction({ instant, duration: "PT1H" })}
    </span>
  );
}
