import { FluentProvider, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import { useStyles } from "../../App";
import { ButtonToolBox } from "../../my-components-v1/button-toolbox/ButtonToolBox";
import { RibbonGroup } from "../../my-components-v1/button-toolbox/RibbonGroup";
import "./SQLApp.css"
import { ButtonLoadDB } from "../../my-components-v1/button-toolbox/button-sql-tool/ButtonLoadDB";
import { ListDB } from "../../my-components-v1/sql-tool-db-list/ListDB";
import { SetShowArrowTable } from "../../my-components-v1/sql-tool-arrow-table/SetShowArrowTable";

export const SQLApp = () => {
  const styles = useStyles();

  return (
    <FluentProvider theme={webLightTheme} applyStylesToPortals={true}>
      <div className={styles.root}>
        <ButtonToolBox>
          <RibbonGroup label="檔案">
            <ButtonLoadDB/>
          </RibbonGroup>
        </ButtonToolBox>

        <main className={styles.content}>
          <div style={{overflow: "auto"}}>
            <ListDB />
            <SetShowArrowTable />
          </div>
        </main>
      </div>
      <div id="sql-tool-page-portal-root" />
    </FluentProvider>
  )
}