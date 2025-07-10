import { makeStyles, tokens, Toolbar } from "@fluentui/react-components"

const useStyles = makeStyles({
  buttonToolBoxContainer: {
    backgroundColor: tokens.colorNeutralBackground4,
    padding: "12px 8px 16px 8px",
  },

  buttonToolBox: {
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow8,
    border: "2px solid #ddd",
    borderRadius: "8px",
    display: "flex",
    minHeight: "150px",
    gap: "8px",
    alignItems: "stretch",
    userSelect: "none",
  }
})

interface ButtonToolBoxProps {
  children?: React.ReactNode,
}

export const ButtonToolBox: React.FC<ButtonToolBoxProps> = ({
  children
}) => {
  const styles = useStyles();

  return(
    <div className={styles.buttonToolBoxContainer}>
      <Toolbar className={styles.buttonToolBox}>
        {children}
      </Toolbar>
    </div>
  )
}