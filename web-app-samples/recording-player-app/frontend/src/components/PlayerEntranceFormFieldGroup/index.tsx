import './PlayerEntranceFormFieldGroup.css';
import '@material/theme/dist/mdc.theme.css';
import '@material/typography/dist/mdc.typography.css';
import '@material/card/dist/mdc.card.css';
import '@material/textfield/dist/mdc.textfield.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/line-ripple/dist/mdc.line-ripple.css';
import '@material/floating-label/dist/mdc.floating-label.css';
import '@material/button/dist/mdc.button.css';
import '@rmwc/button/styles';
import '@rmwc/checkbox/styles';
import '@rmwc/tabs/styles';

import { Button } from '@rmwc/button';
import { Checkbox } from '@rmwc/checkbox';
import { Tab, TabBar } from '@rmwc/tabs';
import { TextField } from '@rmwc/textfield';
import { Theme, ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import React, { useRef, useState } from 'react';

// MWCのバグが、以下2つあるため一時的に指定している
// TextFieldの色はprimary値しか受け付けない / ラベルの色はthemeやclassを使っても、強制的に#6200eeの値になる
// TODO(hkt): RMWC側でバグが対応され次第削除する
const TEXTFIELD_THEME_OPTIONS = {
  primary: '#6200ee',
};
const CHECKBOX_THEME_OPTIONS = {
  secondary: '#303030',
};

const validateVideoSourceUrl = (videoSourceUrl: string, key: string): Array<{ key: string; message: string }> => {
  const errors = [];
  if (videoSourceUrl === '') {
    if (key === 'jsonFileURL') {
      errors.push({ key: key, message: 'URLを入力してください' });
    } else if (key === 'videoFilePath') {
      errors.push({ key: key, message: '動画ファイルを選択してください' });
    }
  }
  return errors;
};

interface PlayerEntranceURLInputItemProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
  name: string;
  value: string;
  validateErrors: Array<{ key: string; message: string }>;
}

// 動画ファイルのソース情報の JSON ファイルの URL 入力用のコンポーネント
const PlayerEntranceURLInputItem: React.FC<PlayerEntranceURLInputItemProps> = (props) => {
  const error = props.validateErrors.find((v) => v.key === props.name);
  const helpText = error && {
    persistent: true,
    validationMsg: true,
    children: error.message,
  };
  const isInvalid = error !== undefined;
  const title = '動画ファイルのソース情報のJSONファイルのURLを入力してください';
  return (
    <>
      <Typography use="body1" tag="p">
        {title}
      </Typography>
      <ThemeProvider options={TEXTFIELD_THEME_OPTIONS}>
        <TextField
          onChange={props.onChange}
          style={{ width: '100%' }}
          outlined
          invalid={isInvalid}
          label={props.label}
          placeholder={props.placeholder}
          name={props.name}
          value={props.value}
          helpText={helpText}
        />
      </ThemeProvider>
    </>
  );
};

interface PlayerEntranceFileInputItemProps {
  onSelectFile: () => void;
  onDropFile: (event: React.DragEvent) => void;
  onChangeIsTheta: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
  name: string;
  value: string;
  isTheta: boolean;
  validateErrors: Array<{ key: string; message: string }>;
}

// 動画ファイルのパス入力／ファイル選択用のコンポーネント
const PlayerEntranceFileInputItem: React.FC<PlayerEntranceFileInputItemProps> = (props) => {
  const error = props.validateErrors.find((v) => v.key === props.name);
  const helpText = error && error.message;
  const title = '再生する動画ファイルを選択してください';
  return (
    <>
      <Typography use="body1" tag="p">
        {title}
      </Typography>
      <label className="file-label">
        <Button type="button" className="file-button" onClick={props.onSelectFile} outlined>
          ファイルを選択
        </Button>
        <Typography use="body2">
          <div className="file-name">{props.value}</div>
        </Typography>
      </label>
      {helpText != null && (
        <Theme use="error" className="help-text">
          {helpText}
        </Theme>
      )}
      <ThemeProvider options={CHECKBOX_THEME_OPTIONS} className="check-theta-area">
        <Checkbox checked={props.isTheta} onChange={props.onChangeIsTheta} label="360° 映像を使用する" />
      </ThemeProvider>
    </>
  );
};

interface PlayerEntranceFormFieldGroupProps {
  onChangeVideoSourceUrl: (videoSourceUrl: string) => void;
  onChangeIsTheta: (isTheta: boolean) => void;
  onSubmitSuccess: () => void;
  videoSourceUrl: string;
  isTheta: boolean;
}

const PlayerEntranceFormFieldGroup: React.FC<PlayerEntranceFormFieldGroupProps> = (props) => {
  const [validateErrors, setValidateResult] = useState<Array<{ key: string; message: string }>>([]);
  // アクティブになっているタブの index
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  // 動画ファイルのソース情報の JSON ファイルの URL
  const jsonFileURL = useRef<string>('https://document.livestreaming.mw.smart-integration.ricoh.com/movie/top-sources.json');
  // 動画ファイルのパス
  const videoFilePath = useRef<string>('選択されていません');
  // 動画ファイルの BlobURL
  const videoBlobUrl = useRef<string>('');
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    // アクティブになっているタブに応じて validation エラー表示用の key の値を指定してチェック
    let key = '';
    if (activeTabIndex === 0) {
      key = 'jsonFileURL';
    } else if (activeTabIndex === 1) {
      key = 'videoFilePath';
    }
    const errors = validateVideoSourceUrl(props.videoSourceUrl, key);
    setValidateResult(errors);
    if (errors.length > 0) {
      return;
    }
    // validation エラーが無い場合、createPlayerを行う
    props.onSubmitSuccess();
  };
  const handleChangeJsonFileURL = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    jsonFileURL.current = e.target.value;
    props.onChangeVideoSourceUrl(e.target.value);
  };
  // ドロップしたファイルから BlobURL を取得する
  const handleDropVideoFile = (event: React.DragEvent): void => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0];
    const URL = window.URL;
    if (selectedFile != null) {
      const blobUrl = URL.createObjectURL(selectedFile as Blob);
      videoFilePath.current = selectedFile.name;
      videoBlobUrl.current = blobUrl;
      props.onChangeVideoSourceUrl(blobUrl);
      // RMWC の TextFiled のラベルを移動させるためフォーカスする
      document.getElementsByName('videoFilePath')[0].focus();
    } else {
      videoFilePath.current = '';
      videoBlobUrl.current = '';
      props.onChangeVideoSourceUrl('');
    }
  };
  const handleChangeIsTheta = (e: React.ChangeEvent<HTMLInputElement>): void => {
    props.onChangeIsTheta(e.target.checked);
  };
  // ファイル選択ダイアログを開き、選択されたファイルを返却する
  const openFileDialog = (): Promise<FileList> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;
      input.accept = 'video/*';
      input.onchange = () => {
        const { files } = input;
        if (files) {
          resolve(files);
        } else {
          reject(new Error('Not receive the FileList'));
        }
        input.remove();
      };
      input.oncancel = () => {
        reject(new Error('Not Select File'));
      };
      input.click();
    });
  };
  // ファイル選択ダイアログで選択したファイルから BlobURL を取得する
  const handleSelectFile = (): void => {
    openFileDialog()
      .then((res) => {
        const selectedFile = res.item(0);
        const URL = window.URL;
        let blobUrl = '';
        if (selectedFile != null) {
          blobUrl = URL.createObjectURL(selectedFile as Blob);
          videoFilePath.current = selectedFile.name;
          videoBlobUrl.current = blobUrl;
          props.onChangeVideoSourceUrl(blobUrl);
          // RMWC の TextFiled のラベルを移動させるためフォーカスする
          document.getElementsByName('videoFilePath')[0].focus();
        } else {
          videoFilePath.current = '';
          videoBlobUrl.current = '';
          props.onChangeVideoSourceUrl('');
        }
      })
      .catch((err: Error) => {
        console.log(err.message);
      });
  };
  // タブ切り替え時の処理
  const changeActiveTab = (index: number): void => {
    setActiveTabIndex(index);
    // エラー情報はリセットする
    setValidateResult([]);
    // URL タブの場合
    if (index == 0) {
      // VideoSource の URL に入力された URL を設定
      props.onChangeVideoSourceUrl(jsonFileURL.current);
    }
    // FILE タブの場合
    if (index == 1) {
      // VideoSource の URL に選択した ファイルの BlobURL を設定
      props.onChangeVideoSourceUrl(videoBlobUrl.current);
    }
  };
  return (
    <div className="mdc-card">
      <div className="join-content">
        <Typography use="headline6" tag="h1" theme="onSurface">
          RICOH Live Streaming Conference Player Sample
        </Typography>
        <div className="form-group">
          <TabBar onActivate={(evt) => changeActiveTab(evt.detail.index)}>
            <Tab>URL</Tab>
            <Tab>FILE</Tab>
          </TabBar>
          {activeTabIndex == 0 && (
            <PlayerEntranceURLInputItem
              onChange={handleChangeJsonFileURL}
              label="JSONファイルのURL"
              placeholder="https://example.com/video/meeting.json"
              name="jsonFileURL"
              value={jsonFileURL.current}
              validateErrors={validateErrors}
            />
          )}
          {activeTabIndex == 1 && (
            <PlayerEntranceFileInputItem
              onSelectFile={handleSelectFile}
              onDropFile={handleDropVideoFile}
              onChangeIsTheta={handleChangeIsTheta}
              label="動画ファイル"
              placeholder="sample.webm"
              name="videoFilePath"
              value={videoFilePath.current}
              isTheta={props.isTheta}
              validateErrors={validateErrors}
            />
          )}
        </div>
        <button id="joinButton" onClick={handleSubmit} className="mdc-button mdc-button--raised mdco-fullwidth">
          <div className="mdc-button__ripple"></div>
          <span className="mdc-button__label">再生</span>
        </button>
      </div>
    </div>
  );
};
export default PlayerEntranceFormFieldGroup;
