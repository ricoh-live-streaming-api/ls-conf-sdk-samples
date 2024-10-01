// 共通の型定義置き場
// 現在 redux state には何も状態を持っていない
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RootState {}

interface SubViewMenuItem {
  type: string;
  label: string;
  targetSubView?: {
    type?: 'VIDEO_AUDIO' | 'SCREEN_SHARE' | 'VIDEO_FILE';
    isTheta?: boolean;
  };
}

interface LSConfSampleConfig {
  DEFAULT_LAYOUT: string;
  LS_CONF_URL?: string;
  THETA_ZOOM_MAX_RANGE: number;
  PLAYER: {
    isHiddenVideoControlBar: boolean;
  };
  SUBVIEW_CONFIG: {
    isHiddenDrawingButton: boolean;
    drawingInterval: number;
    drawingColor: string;
    drawingOption: {
      size: number;
    };
    normal: {
      enableZoom: boolean;
      isHiddenFramerate: boolean;
    };
    menu: {
      isHidden: boolean;
      isHiddenSharePoVButton: boolean;
      customItems: SubViewMenuItem[];
    };
  };
  THEME_CONFIG: {
    primary: string;
    background: string;
    surface: string;
    onPrimary: string;
    primaryTextColor: string;
    secondaryTextColor: string;
    disabledTextColor: string;
    components: {
      participantsVideoContainer: {
        background: string;
        subViewSwitchBackgroundColor: string;
        subViewSwitchIconColor: string;
      };
      toolbar: {
        background: string;
        iconColor: string;
      };
      video: {
        background: string;
        textColor: string;
        textBackgroundColor: string;
        iconColor: string;
        menuBackgroundColor: string;
        menuTextColor: string;
        highlightBorderColor: string;
        highlightShadowColor: string;
      };
    };
  };
}

// config.XXX  で各値を呼び出せるよう global 空間を拡張
declare global {
  const config: LSConfSampleConfig;
}
