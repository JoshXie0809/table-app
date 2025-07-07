import { useSheetView } from "../../SheetView-Context";
import { TransSystemName } from "../RenderManager";

export const SystemQuickEdit = () => {
  const { allRefOK, getRef } = useSheetView();

  if(!allRefOK) return null;

  const name: TransSystemName = "column-header";
  const refs = getRef(name);

  console.log(refs);
  
  return null;
}