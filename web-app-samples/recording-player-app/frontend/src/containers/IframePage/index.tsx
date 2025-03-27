// iframe を表示するページ
import './IframePage.css';

import format from 'date-fns/format';
import qs from 'query-string';
import React, { useLayoutEffect, useRef, useState } from 'react';

import ErrorDialog from '@/components/ErrorDialog';
import { DEFAULT_LAYOUT, LS_CONF_URL, PLAYER, SUBVIEW_CONFIG, THEME_CONFIG, THETA_ZOOM_MAX_RANGE } from '@/constants';
import LSConferenceIframe, { CreateParameters, LSConfError, LSConfErrorEvent, VideoSource } from '@/lib/ls-conf-sdk';

const CREATE_PARAMETERS: CreateParameters = {
  defaultLayout: DEFAULT_LAYOUT as 'gallery' | 'presentation' | 'fullscreen',
  lsConfURL: LS_CONF_URL != null ? LS_CONF_URL : undefined,
  thetaZoomMaxRange: THETA_ZOOM_MAX_RANGE,
  player: PLAYER as {
    isHiddenVideoControlBar?: boolean;
  },
  subView: SUBVIEW_CONFIG,
  theme: THEME_CONFIG,
};

const IframePage: React.FC<Record<string, never>> = () => {
  const { videoSourceUrl, isTheta } = qs.parse(window.location.search);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [lsConfIframe, setLsConfIframe] = useState<LSConferenceIframe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // logイベントから受け取ったLSConfLogの保持用変数
  const logEvent = useRef(new Map<string, { date: number; log: string }[]>());
  const showErrorDialog = errorMessage !== null;

  const downloadLog = async (iframe: LSConferenceIframe, e?: LSConfError | LSConfErrorEvent): Promise<void> => {
    let log = 'LSConfSample Log\n\n';
    if (e instanceof LSConfError) {
      log += `********** Error Message **********\n`;
      log += `${e.message}\n`;
      log += `********** toReportString() *******\n`;
      log += `${e.toReportString()}\n`;
    } else if (e instanceof LSConfErrorEvent) {
      log += `********** Error Message **********\n`;
      log += `${e.message}\n`;
      log += `********** toReportString() *******\n`;
      log += `${e.error.toReportString()}\n`;
    }
    log += `********** ApplicationLog *********\n`;
    log += `LSConfURL: ${LS_CONF_URL != null && LS_CONF_URL != '' ? LS_CONF_URL : 'default'}\n`;
    log += `UserAgent: ${window.navigator.userAgent}\n\n`;
    log += `********** LSConfLog **************\n`;
    if (e instanceof LSConfErrorEvent && Math.floor(e.error.detail.code / 1000) == 5) {
      // InternalError（5000番台）の場合は内部に保持したログを出力する
      log += `An unexpected error occurs. Output logs by LogEvent. \n\n`;
      log += getStoredLSConfLog();
    } else {
      try {
        const lsConfLog = await iframe.getLSConfLog();
        if (lsConfLog === null || lsConfLog === undefined || lsConfLog == '') {
          // LSConfLogが空の場合は内部に保持したログを出力する
          log += `Result of getLSConfLog is blank. Output logs by LogEvent. \n\n`;
          log += getStoredLSConfLog();
        } else {
          log += `${lsConfLog}\n`;
        }
      } catch {
        // LSConfLogの取得に失敗した場合は内部に保持したログを出力する
        log += `Failed to getLSConfLog. Output logs by LogEvent. \n\n`;
        log += getStoredLSConfLog();
      }
    }
    const downLoadLink = document.createElement('a');
    downLoadLink.download = `ls-conf-sample-player_${format(new Date(), 'yyyyMMdd_HHmmss')}.log`;
    downLoadLink.href = URL.createObjectURL(new Blob([log], { type: 'text.plain' }));
    downLoadLink.dataset.downloadurl = ['text/plain', downLoadLink.download, downLoadLink.href].join(':');
    downLoadLink.click();
  };
  const getStoredLSConfLog = (): string => {
    let log = '';
    const categories = ['Environment', 'Setting', 'Recording', 'Device', 'Member', 'Analysis', 'ClientSdk'];
    for (const category of categories) {
      log += `******************** ${category} **********************\n`;
      const categoryLogs = logEvent.current.get(category.charAt(0).toLowerCase() + category.slice(1));
      if (categoryLogs) {
        log += categoryLogs.map((item) => item.log).join('\n') + '\n';
      }
    }
    return log;
  };
  const asyncCreatePlayer = async (): Promise<void> => {
    if (videoSourceUrl == null || typeof videoSourceUrl !== 'string') {
      setErrorMessage('URLが不正です');
      return;
    }
    if (!iframeContainerRef.current) {
      setErrorMessage('iframeContainerが不正です');
      return;
    }
    let iframe: LSConferenceIframe;
    try {
      let videoSource: string | VideoSource[] = videoSourceUrl;
      // Blob から始まる場合はローカルファイルを選択したものとして判断
      if (videoSource.indexOf('blob:') === 0) {
        const response = await window.fetch(videoSourceUrl);
        const blob = await response.blob();
        let isThetaBoolean = false;
        if (isTheta === 'true') {
          isThetaBoolean = true;
        }
        // createPlayer には blob で渡す
        const source = { blob: blob, connectionId: 'local-video', label: '動画1', isTheta: isThetaBoolean };
        videoSource = [source];
      }
      iframe = await LSConferenceIframe.createPlayer(iframeContainerRef.current, videoSource, CREATE_PARAMETERS);
    } catch (e) {
      if (e instanceof LSConfError) {
        setErrorMessage(e.message);
      } else {
        setErrorMessage(`Unexpected error occurred: ${e}`);
      }
      return;
    }
    iframe.addEventListener('error', async (e: LSConfErrorEvent) => {
      setErrorMessage(e.message);
      try {
        await downloadLog(iframe, e);
      } catch {
        console.warn('Failed to download log.');
      }
    });
    // ls-conf-sdkのlogイベントが発生した場合はログを保持する
    iframe.addEventListener('log', (e: CustomEvent) => {
      const { message, category, subcategory, date } = e.detail;
      const logs = logEvent.current.get(category) || [];
      const log = `[${date}]${subcategory ? '[' + subcategory + ']' : ''} ${message}`;
      logs.push({ date: new Date(date).getTime(), log });
      const updateLogs = logs.filter((log) => {
        // 直近10分経過したログを削除する(ログは溜まり続けるためメモリを圧迫させないように適宜削除する)
        return Date.now() - log.date < 1000 * 60 * 10;
      });
      logEvent.current.set(category, updateLogs);
    });
    setLsConfIframe(iframe);
  };
  const onCloseErrorDialog = (): void => {
    setErrorMessage(null);
  };
  useLayoutEffect(() => {
    void asyncCreatePlayer();
    return () => {
      if (lsConfIframe) {
        void lsConfIframe.leave();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div ref={iframeContainerRef} className="iframe-container" />
      <ErrorDialog open={showErrorDialog} message={errorMessage} onClose={onCloseErrorDialog} />
    </>
  );
};

export default IframePage;
