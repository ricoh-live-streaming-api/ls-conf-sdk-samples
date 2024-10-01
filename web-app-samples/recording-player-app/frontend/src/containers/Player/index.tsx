import './Player.css';

import React, { useState } from 'react';

import PlayerEntranceFormFieldGroup from '@/components/PlayerEntranceFormFieldGroup';

const Player: React.FC<Record<string, never>> = () => {
  const [videoSourceUrl, setVideoSourceUrl] = useState<string>('');
  const [isTheta, setIsTheta] = useState<boolean>(true);
  const onSubmitSuccess = (): void => {
    const encodedVideoSourceUrl = encodeURIComponent(videoSourceUrl);
    let isThetaParam = '';
    // BlobURL の場合は isTheta をパラメータとして追加する
    if (videoSourceUrl.indexOf('blob:') === 0) {
      isThetaParam = `&isTheta=${isTheta}`;
    }
    window.open(`/player/iframe/?videoSourceUrl=${encodedVideoSourceUrl}${isThetaParam}`);
  };
  return (
    <div className="start-layout">
      <PlayerEntranceFormFieldGroup videoSourceUrl={videoSourceUrl} isTheta={isTheta} onChangeVideoSourceUrl={setVideoSourceUrl} onChangeIsTheta={setIsTheta} onSubmitSuccess={onSubmitSuccess} />
    </div>
  );
};

export default Player;
