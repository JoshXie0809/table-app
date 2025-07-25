import { SaveFilled } from '@fluentui/react-icons';
import { RibbonSmallButton } from './RibbonGroup';
import { Subject } from 'rxjs';
export const fileSaveRequest$ = new Subject<void>();
export const ButtonSaveSheet: React.FC = () => 
{
  const onClick = () => {
    fileSaveRequest$.next()
  }
  return(
    <RibbonSmallButton
      icon={<SaveFilled style={{fontSize: "32px", color: "rgba(91, 145, 177, 1)"}} />} 
      onClick={onClick}
      label="存檔"
      tipContent="save .sheetpkg file"
    />
  );
}