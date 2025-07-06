import { makeStyles, tokens, Toolbar } from "@fluentui/react-components"

const useStyles = makeStyles({
  buttonToolBoxContainer: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: "12px 8px 8px 8px",
  },

  buttonToolBox: {
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    border: "2px solid #ddd",
    borderRadius: "8px",
    display: "flex",
    gap: "8px",
    height: "100px",
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